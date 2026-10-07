import { resolveGanguesAction, resolveGanguesCura } from './ganguesCombatResolver.js'
import { decidirAcaoInimigo } from './ganguesPersonas.js'
import { statusImpedeAcao, alvoComTontura } from './ganguesStatus.js'
import { iniciarLinhaDoTempo, proximaVez, consumirVez, marcarAgiu, ordemDeVelocidade } from './ganguesLinhaDoTempo.js'
import { prepararTimes, podePagarCusto, aplicarAtaque, aplicarCura, aplicarItem, deltaDoItem, motivoItemNaoServe, curaRealDoItem, POCAO_LIMIAR_PV } from './ganguesRegrasCombate.js'
import { getGanguesItem } from '../data/ganguesItens.js'

/* ══════════════════════════════════════════════════════════════
   BRIGA EM MULTIDÃO — a luta anda RODADA a rodada.

   Cada "avançar rodada" resolve uma rodada completa (todo mundo vivo age
   pelo menos uma vez, na ordem da linha do tempo do Pique; o mais rápido
   pode agir 2-3 vezes) e para. A tática do jogador vale pra rodada inteira:
   - FOCO: o inimigo marcado apanha de todo o time até cair; sem foco, o
     time bate no inimigo mais perto de cair;
   - TALENTO por personagem (o chip);
   - ITEM por personagem: usa quando faz sentido (poção com o aliado na
     metade da vida, remédio em quem tem o status...) e enquanto tiver no
     estoque; quando não faz sentido, ataca normal.
   Cada evento da rodada leva o estado de PV/PM/status logo depois dele
   (`depois`), pra tela mostrar a rodada golpe a golpe.
   As contas são as mesmas da luta normal (ganguesRegrasCombate.js).
   ══════════════════════════════════════════════════════════════ */

const d3 = () => Math.floor(Math.random() * 3) + 1

/** Lutadores somados a partir dos quais a luta da Pista pode virar Multidão. */
export const GANGUES_MULTIDAO_PISO = 5

/** Quando a luta pode ser Briga em Multidão e quando ela já começa ligada:
 *  na Pista, com GANGUES_MULTIDAO_PISO lutadores somados, o jogador escolhe;
 *  da Feira em diante toda luta é em bando e começa em Multidão (o switch
 *  continua desligando). */
export function regraMultidao(match, territorioId) {
  const total = (match?.playerTeam?.length || 0) + (match?.enemyTeam?.length || 0)
  const bairroDeBando = Boolean(territorioId) && territorioId !== 'pista'
  return { disponivel: bairroDeBando || total >= GANGUES_MULTIDAO_PISO, padrao: bairroDeBando }
}

function montar(combatants, round, eventosIniciais) {
  const t0 = iniciarLinhaDoTempo(combatants)
  const initiative = ordemDeVelocidade(combatants, t0)
  return {
    combatants, tempo: t0, initiative, round, lastEnemyTargetKey: null,
    terminado: false, outcome: null,
    eventosIniciais: eventosIniciais || [],
    seq: 0,
    // Marca desta briga nos ids dos eventos: ligar a Multidão de novo na mesma
    // luta não repete id no registro.
    marca: Math.random().toString(36).slice(2, 7),
  }
}

/** Estado inicial da briga (times preparados + linha do tempo). */
export function iniciarBrigaMultidao({ playerTeam, enemyTeam }) {
  const combatants = prepararTimes(playerTeam, enemyTeam)
  return montar(combatants, 1, [{ type: 'battle_start', id: 'bm-start' }])
}

/** Como iniciarBrigaMultidao, a partir de combatentes JÁ preparados (ligar o
 *  switch no meio da luta). Recebe a linha do tempo viva do motor normal pra
 *  continuar de onde ele parou: quem já agiu nessa rodada continua marcado. */
export function iniciarBrigaMultidaoDeCombatentes(combatants, roundAtual = 1, tempo = null) {
  const clone = combatants.map(c => ({ ...c }))
  const estado = montar(clone, roundAtual, null)
  if (tempo) { estado.tempo = tempo; estado.initiative = ordemDeVelocidade(clone, tempo) }
  return estado
}

/** PV/PM/status de cada um, pra tela repassar a rodada golpe a golpe. */
const fotografar = lista => lista.map(c => ({ key: c.key, pv: c.pv, pm: c.pm, statuses: c.statuses }))

/** Em quem o item vai agora (null = não faz sentido usar nesta vez). */
function alvoDoItem(item, actor, lista) {
  const aliados = lista.filter(c => c.side === 'player' && c.pv > 0)
  const porFracao = campo => [...aliados].sort((a, b) => a[campo] / (a[`${campo}Max`] || 1) - b[campo] / (b[`${campo}Max`] || 1))[0]
  if (item.tipo === 'cura_pv') { const a = porFracao('pv'); return a && a.pv / a.pvMax <= POCAO_LIMIAR_PV ? a : null }
  if (item.tipo === 'cura_pm') { const a = porFracao('pm'); return a && a.pmMax > 0 && a.pm / a.pmMax <= POCAO_LIMIAR_PV ? a : null }
  if (item.tipo === 'cura_status') return aliados.find(a => !motivoItemNaoServe(item, a)) || null
  // Efeito de item fica no status sem `id`: não repete enquanto ainda vale.
  const temEfeito = c => (c.statuses || []).some(s => s.id == null && (item.status || []).some(b => b.attr === s.attr && b.valor === s.valor))
  if (item.tipo === 'debuff_inimigos') return lista.some(c => c.side === 'enemy' && c.pv > 0 && !temEfeito(c)) ? actor : null
  if (item.tipo === 'buff') return temEfeito(actor) ? null : actor
  return null
}

/** Inimigo que o jogador vai bater: o foco, se vivo; senão o mais perto de cair. */
function alvoDoJogador(lista, focoKey) {
  const vivos = lista.filter(c => c.side === 'enemy' && c.pv > 0)
  return vivos.find(c => c.key === focoKey) || [...vivos].sort((a, b) => a.pv - b.pv)[0] || null
}

/** Resolve UMA rodada a partir do estado atual. A tática (`tatica`) é lida a
 *  cada chamada — o jogador pode trocar entre uma rodada e outra:
 *  { foco, poderes: {memberId: specialId}, especiais: {memberId: [special]},
 *    itens: {memberId: itemId}, estoque: {itemId: qtd} }.
 *  Retorna o novo estado + os eventos só dessa rodada. */
export function avancarRodadaMultidao(estado, tatica = {}) {
  const { foco = null, poderes = {}, especiais = {}, itens = {} } = tatica
  const estoque = { ...(tatica.estoque || {}) }
  let lista = estado.combatants.map(c => ({ ...c }))
  let { tempo, round, lastEnemyTargetKey, seq } = estado
  const marca = estado.marca || 'bm'
  const rodadaAlvo = round
  const eventosRodada = []
  const get = key => lista.find(c => c.key === key)
  const registrar = evento => { seq += 1; eventosRodada.push({ ...evento, id: `${marca}-${seq}`, round: rodadaAlvo, depois: fotografar(lista) }) }

  const checarFim = () => {
    const playersAlive = lista.some(c => c.side === 'player' && c.pv > 0)
    const enemiesAlive = lista.some(c => c.side === 'enemy' && c.pv > 0)
    if (playersAlive && enemiesAlive) return null
    return enemiesAlive ? 'defeat' : 'victory'
  }

  const atacar = (actor, alvo, activeSpecialId, forcedSpecial = null) => {
    const original = alvo
    const target = alvoComTontura(actor, alvo, lista, Math.random)
    const result = resolveGanguesAction({
      attacker: actor, defender: target, action: { type: 'attack', mode: 'attack' },
      rolls: { fa: d3(), fd: d3() },
      activeSpecialId, forcedSpecial,
    })
    lista = aplicarAtaque(lista, actor.key, target.key, result)
    registrar({ type: 'attack', side: actor.side, actorKey: actor.key, targetKey: target.key, result, confuso: target.key !== original.key })
    return Boolean(result.activeSpecialId)
  }

  let outcome = checarFim()
  let guarda = 0
  while (!outcome && guarda++ < 200) {
    const vez = proximaVez(lista, tempo)
    tempo = vez.tempo
    const actor = get(vez.key)
    if (!actor) break
    let usouTalento = false

    const motivoPerde = actor.pv > 0 ? statusImpedeAcao(actor) : null
    if (motivoPerde) {
      registrar({ type: 'perdeu_vez', side: actor.side, actorKey: actor.key, motivo: motivoPerde })
    } else if (actor.side === 'player') {
      const item = itens[actor.id] && (estoque[itens[actor.id]] || 0) > 0 ? getGanguesItem(itens[actor.id]) : null
      const alvoItem = item && item.tipo !== 'poder_unico' ? alvoDoItem(item, actor, lista) : null
      const alvoGolpe = alvoDoJogador(lista, foco)
      if (alvoItem) {
        // Item que faz sentido agora: gasta 1 do estoque e a vez.
        const delta = deltaDoItem(item)
        const curado = curaRealDoItem(alvoItem, delta)
        lista = aplicarItem(lista, actor.key, alvoItem.key, delta)
        estoque[item.id] -= 1
        registrar({ type: 'item', side: 'player', actorKey: actor.key, targetKey: alvoItem.key, itemId: item.id, delta, curado })
      } else if (item?.tipo === 'poder_unico' && alvoGolpe) {
        // Chip: golpe com o poder emprestado, no alvo da rodada.
        estoque[item.id] -= 1
        usouTalento = atacar(actor, alvoGolpe, item.poderId, { id: item.poderId, level: item.poderNivel || 1 })
        eventosRodada[eventosRodada.length - 1].itemId = item.id
      } else {
        const escolhaId = poderes[actor.id] || null
        const especial = escolhaId ? (especiais[actor.id] || []).find(s => s.id === escolhaId) : null
        const pode = especial && podePagarCusto(actor, especial)
        if (pode && especial.effect?.type === 'heal') {
          const aliados = lista.filter(c => c.side === 'player' && c.pv > 0)
          const alvo = [...aliados].sort((a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0]
          const res = resolveGanguesCura({ ator: actor, alvo, special: especial })
          if (res) {
            lista = aplicarCura(lista, actor.key, alvo.key, res)
            usouTalento = true
            registrar({ type: 'cura', side: 'player', actorKey: actor.key, targetKey: alvo.key, specialId: res.specialId, curado: res.cura })
          }
        } else if (alvoGolpe) {
          usouTalento = atacar(actor, alvoGolpe, pode ? escolhaId : null)
        }
      }
    } else {
      // Persona decide alvo e talento (ganguesPersonas.js), igual a luta normal.
      const acao = decidirAcaoInimigo(actor, lista, { lastTargetKey: lastEnemyTargetKey }, Math.random)
      lastEnemyTargetKey = acao?.alvo?.key || null
      if (acao?.tipo === 'cura') {
        const res = resolveGanguesCura({ ator: actor, alvo: acao.alvo, special: acao.special })
        if (res) {
          lista = aplicarCura(lista, actor.key, acao.alvo.key, res)
          usouTalento = true
          registrar({ type: 'cura', side: 'enemy', actorKey: actor.key, targetKey: acao.alvo.key, specialId: res.specialId, curado: res.cura })
        }
      } else if (acao?.alvo) {
        usouTalento = atacar(actor, acao.alvo, acao.specialId || null)
      }
    }

    tempo = consumirVez(tempo, actor.key, usouTalento)
    outcome = checarFim()
    if (outcome) break
    const marcado = marcarAgiu(lista, actor.key)
    lista = marcado.combatants
    if (marcado.fechouRodada) { round += 1; break }
  }

  if (!outcome) outcome = checarFim()
  return {
    combatants: lista, tempo, initiative: ordemDeVelocidade(lista, tempo), round, lastEnemyTargetKey, seq, marca,
    terminado: Boolean(outcome), outcome: outcome || null,
    eventosRodada,
  }
}
