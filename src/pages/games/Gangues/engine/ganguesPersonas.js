/* ══════════════════════════════════════════════════════════════
   PERSONAS da IA inimiga (28/09/2026, pedido do Isaias).

   Todo inimigo sorteia uma PERSONA no começo da luta (peso pelo caminho
   dele, `preferred_mode`). A persona decide em quem bater e quando usar
   talento. Os inimigos ganham talentos de verdade: uma "ficha de talentos"
   montada na hora (subcaminho + nível pelos pontos da ficha), então usam
   os MESMOS talentos e passivas do jogador (ganguesSpecialEffects.js).

   O Mandingueiro tem 3 papéis: ATAQUE (Ígneo/Tempestade), CURA (Aquático,
   cura o aliado mais machucado) e STATUS (Terreno/Ilusório — só ele põe
   status). Regra do Isaias: bando de 3+ leva pelo menos 1 mandingueiro.
   Lógica pura — os dois motores (normal e Multidão) usam estas funções.
   ══════════════════════════════════════════════════════════════ */
import { getGanguesSpecialPaths } from '../data/ganguesSpecials.js'
import { getEquippedActiveGanguesSpecials, getGanguesSpecialEffect } from './ganguesSpecialEffects.js'

export const GANGUES_PERSONAS = ['brigao', 'covarde', 'cacador', 'protetor', 'doido', 'mand_ataque', 'mand_cura', 'mand_status']
const MANDINGUEIROS = ['mand_ataque', 'mand_cura', 'mand_status']
export const ehMandingueiro = persona => MANDINGUEIROS.includes(persona)

const PESOS = {
  fists: { brigao: 4, cacador: 3, covarde: 2, doido: 1 },
  armed: { protetor: 4, brigao: 2, covarde: 2, doido: 1 },
  power: { mand_ataque: 1, mand_cura: 1, mand_status: 1 },
}

// Subcaminho do Mandingueiro por papel.
const SUBCAMINHO_MAND = { mand_ataque: ['igneo', 'tempestade'], mand_cura: ['aquatico'], mand_status: ['terreno', 'ilusorio'] }

function sortearPeso(pesos, rand) {
  const lista = Object.entries(pesos)
  let r = rand() * lista.reduce((s, [, p]) => s + p, 0)
  for (const [id, p] of lista) { r -= p; if (r <= 0) return id }
  return lista[0][0]
}

const pontos = c => ['A', 'H', 'D', 'PV', 'PM'].reduce((s, k) => s + (Number(c.attributes?.[k]) || 0), 0)

// Nível do talento pela ficha (1 ficha nível N ≈ N pontos): até 19 = rank 1,
// até 49 = rank 2, daí pra cima rank 3. Ficha muito fraca (< 3) não tem talento; passiva a partir de 8.
function rankPelaFicha(p) { return p < 20 ? 1 : p < 50 ? 2 : 3 }

function escolherAtivo(specials, persona) {
  const ativos = specials.filter(s => s.kind === 'active')
  const tipo = id => getGanguesSpecialEffect(id)
  if (persona === 'mand_cura') return ativos.find(s => tipo(s.id).type === 'heal') || ativos[0]
  if (persona === 'mand_status') return ativos.find(s => tipo(s.id).status) || ativos[0]
  if (persona === 'mand_ataque' || persona === 'cacador') return ativos.find(s => ['damage_flat', 'ignore_def_pct', 'bonus_if_target_fresh'].includes(tipo(s.id).type)) || ativos[0]
  if (persona === 'protetor') return ativos.find(s => ['damage_reduction_next_hit', 'shield_next_hit'].includes(tipo(s.id).type)) || ativos[0]
  return ativos[0]
}

/** Monta persona + ficha de talentos de UM inimigo já preparado. */
function vestirPersona(inimigo, persona, rand) {
  const combatPath = ehMandingueiro(persona) ? 'mistico' : inimigo.combat_path
  const caminhos = getGanguesSpecialPaths(combatPath)
  const permitidos = ehMandingueiro(persona) ? caminhos.filter(c => SUBCAMINHO_MAND[persona].includes(c.id)) : caminhos
  const sub = permitidos[Math.floor(rand() * permitidos.length)] || caminhos[0]
  const p = pontos(inimigo)
  const rank = rankPelaFicha(p)
  const selected = []
  if (p >= 3 && sub) {
    const ativo = escolherAtivo(sub.specials, persona)
    if (ativo) selected.push(ativo.id)
    const passivo = sub.specials.find(s => s.kind === 'passive')
    if (p >= 8 && passivo) selected.push(passivo.id)
  }
  const progression = {
    special_path: sub?.id || null, special_path_unlocked: Boolean(sub),
    special_levels: Object.fromEntries(selected.map(id => [id, rank])), selected_specials: selected,
  }
  return { ...inimigo, combat_path: combatPath, persona, attributes: { ...inimigo.attributes, progression } }
}

/** Sorteia a persona de cada inimigo e monta os talentos. Bando de 3+ sem
 *  nenhum mandingueiro: o de mais Malandragem vira um. */
export function atribuirPersonas(combatants, rand = Math.random) {
  const inimigos = combatants.filter(c => c.side === 'enemy')
  const personas = new Map(inimigos.map(c => [c.key, sortearPeso(PESOS[c.preferred_mode] || PESOS.fists, rand)]))
  if (inimigos.length >= 3 && ![...personas.values()].some(ehMandingueiro)) {
    const escolhido = [...inimigos].sort((a, b) => (Number(b.attributes?.PM) || 0) - (Number(a.attributes?.PM) || 0))[0]
    personas.set(escolhido.key, MANDINGUEIROS[Math.floor(rand() * MANDINGUEIROS.length)])
  }
  return combatants.map(c => (c.side === 'enemy' ? vestirPersona(c, personas.get(c.key), rand) : c))
}

function podePagar(ator, special) {
  const cost = special?.effect?.cost
  if (!cost) return true
  const v = cost.values[special.level - 1]
  return cost.kind === 'pm' ? (ator.pm || 0) >= v : (ator.pv || 0) > 1
}

/** Decide a ação do inimigo da vez. Devolve { tipo: 'ataque', alvo, specialId }
 *  ou { tipo: 'cura', alvo, special }. `ultimoAgressorKey` = último jogador
 *  que bateu num inimigo (o Protetor vai atrás dele). */
export function decidirAcaoInimigo(ator, combatants, { lastTargetKey = null, ultimoAgressorKey = null } = {}, rand = Math.random) {
  const jogadores = combatants.filter(c => c.side === 'player' && c.pv > 0)
  if (!jogadores.length) return null
  const aliados = combatants.filter(c => c.side === 'enemy' && c.pv > 0)
  const talentos = getEquippedActiveGanguesSpecials(ator).filter(s => podePagar(ator, s))
  const talento = talentos[0] || null
  const aleatorio = lista => {
    const outros = lista.filter(c => c.key !== lastTargetKey)
    const pool = outros.length ? outros : lista
    return pool[Math.floor(rand() * pool.length)]
  }
  const maisFraco = lista => [...lista].sort((a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0]
  const ataque = (alvo, usar) => ({ tipo: 'ataque', alvo, specialId: usar && talento && talento.effect.type !== 'heal' ? talento.id : null })

  switch (ator.persona) {
    case 'mand_cura': {
      const cura = talentos.find(s => s.effect.type === 'heal')
      const ferido = maisFraco(aliados)
      if (cura && ferido && ferido.pv / ferido.pvMax <= 0.6) return { tipo: 'cura', alvo: ferido, special: cura }
      return ataque(maisFraco(jogadores), false)
    }
    case 'mand_status': {
      const statusId = talento?.effect?.status
      const semEsse = jogadores.filter(c => !(c.statuses || []).some(s => s.id === statusId))
      return ataque(semEsse.length ? aleatorio(semEsse) : aleatorio(jogadores), Boolean(statusId))
    }
    case 'mand_ataque': return ataque(maisFraco(jogadores), true)
    case 'cacador': return ataque([...jogadores].sort((a, b) => (Number(b.attributes?.A) || 0) - (Number(a.attributes?.A) || 0))[0], true)
    case 'covarde': {
      const alvo = maisFraco(jogadores)
      return ataque(alvo, alvo.pv / alvo.pvMax <= 0.4 || rand() < 0.15)
    }
    case 'protetor': {
      const agressor = jogadores.find(c => c.key === ultimoAgressorKey)
      return ataque(agressor || maisFraco(jogadores), ator.pv / ator.pvMax <= 0.6 || rand() < 0.35)
    }
    case 'doido': return ataque(jogadores[Math.floor(rand() * jogadores.length)], rand() < 0.5)
    default: return ataque(aleatorio(jogadores), rand() < 0.2) // brigão
  }
}
