/* ══════════════════════════════════════════════════════════════
   FARM AUSENTE — o idle do Gangues (pedido do Isaias, 28/09/2026).
   Em vez de deixar o jogo rodando escondido (o navegador desacelera e
   congela aba de fundo; no Android pode até matar), a cena é DESMONTADA
   quando o app vai pra segundo plano com a briga automática ligada, e na
   volta o que teria acontecido é CALCULADO "no seco": as lutas que cabem no
   tempo fora, com as mesmas contas de uma luta de verdade (mesmo gerador de
   bando, mesmo motor da Briga em Multidão — engine/ganguesBrigaMultidao.js —
   e as mesmas ações do store da tela de vitória). Ideia do Horizon Chase:
   fora da tela, o jogo é só dado.

   Regras do Isaias:
   • só conta com a aba ABERTA (app em segundo plano). Fechou a aba, perdeu
     — o ponto de partida mora só na memória da página, de propósito, pra o
     jogo não virar "esquece e volta rico";
   • no máximo +5 níveis por ausência (GANGUES_FARM_TETO_NIVEIS): bateu, para;
   • farma SÓ o adversário que o jogador estava grindando — o da última
     luta (`posicao.adversario`), com o mesmo gerador de bando e o mesmo
     nível daquele ponto. Nunca "a região": o bairro tem gente de todo
     nível, a conta tem que ser a daquele cara (Isaias, 28/09/2026). Sem
     adversário, ou se ele não vale pra briga automática (vermelho, chefe,
     área do chefe — naAreaDoChefe, cenaHelpers.js), não farma nada;
   • segue o AJUSTE do automático (v3.73.0): o talento escolhido pra cada
     um entra na luta calculada (quando tem PM), e com a poção automática
     ligada, quem terminou a luta com PV ≤ 50% toma poção de PV antes da
     próxima;
   • perdeu uma luta = para ali, sem XP nenhum dessa luta, a tropa acorda na
     birosca DAQUELE bairro (o mesmo socorro da derrota de verdade — na
     Feira é a pensão) e TODO automático desliga.
   ══════════════════════════════════════════════════════════════ */
import { iniciarBrigaMultidao, avancarRodadaMultidao } from './ganguesBrigaMultidao.js'
import { calcularApTotal, calcularPesosEParticipantes, calcularRecompensaCena } from './ganguesVictoryResolver.js'
import { estadoPoi, posNoMapa } from './ganguesCenaMotor.js'
import { destinoSocorroDerrota, naAreaDoChefe } from '../data/cenas/cenaHelpers.js'
import { gerarBandoRevezamento, gerarBandoInimigo, escalarInimigo } from '../data/ganguesEncontros.js'
import { ajustarPontosFixo } from '../data/ganguesDificuldade.js'
import { getGanguesLevelFromXp } from '../data/ganguesCharacters.js'
import { GANGUES_STORY_BATTLE_PARTY_MAX } from '../data/ganguesLoadout.js'
import { GANGUES_SUCATA_ID } from '../data/ganguesEquip.js'
import { GANGUES_ITENS_LISTA } from '../data/ganguesItens.js'
import { getEquippedActiveGanguesSpecials } from './ganguesSpecialEffects.js'
import { lerAutoConfig, melhorPocao, POCAO_LIMIAR_PV } from '../hooks/useGanguesModoAuto.js'

/** Menos que isso fora não conta (troca rápida de app não vira farm). */
export const GANGUES_FARM_MIN_S = 30
/** Quanto dura um ciclo de farm de verdade com a briga automática: encostar,
 *  lutar no automático e as telas de fim (medido ao vivo: ~25–35s). */
const GANGUES_FARM_SEGUNDOS_POR_LUTA = 40
/** Teto de níveis por ausência — "no máximo 5 levels" (Isaias). */
export const GANGUES_FARM_TETO_NIVEIS = 5
/** Rede de segurança de processamento (7h de farm) — o teto de nível
 *  costuma parar bem antes. */
const GANGUES_FARM_MAX_LUTAS = 600
const GANGUES_FARM_MAX_RODADAS = 80
// Mesma chance de sucata da vitória de rua de verdade (useGanguesVictoryResolution).
const GANGUES_FARM_SUCATA_CHANCE = 0.2

const nivelDe = m => getGanguesLevelFromXp(m?.xp_total ?? 0)
const vermelho = (p, prog) => !p.opcional && !prog.resolvidos?.[p.id]

/** O ponto que o farm ausente repete: o adversário da última luta — e só
 *  ele. Null se não tem, ou se ele não vale pra briga automática. */
export function alvoDoFarm(cena, prog, rep = 0) {
  if (!cena || !prog) return null
  const pos = prog.posicao || {}
  if (naAreaDoChefe(cena, prog, pos)) return null
  const p = cena.pois.find(x => x.id === pos.adversario)
  const vale = p && p.tipo === 'treta' && p.repetivel && !p.ehChefe && !vermelho(p, prog)
    && estadoPoi(p, prog) === 'disponivel' && !(p.repGate && rep < p.repGate)
    && (p.revezamento || p.pontosFixo) && !naAreaDoChefe(cena, prog, posNoMapa(cena, p.id) || {})
  return vale ? p : null
}

// Mesmo bando que o GanguesRoute monta pra esse ponto (sem as suavizações de
// 1ª luta/frustração, que não se aplicam a farm).
function bandoDoPoi(poi, { party, enemiesData, modo, territorioId }) {
  if (poi.revezamento) return gerarBandoRevezamento({ ...poi.revezamento, enemiesData, modo, playerTeam: party })
  if (poi.fixo) {
    const molde = enemiesData.find(e => e.id === poi.enemy)
    return molde ? [escalarInimigo(molde, ajustarPontosFixo(poi.pontosFixo, modo))] : null
  }
  return gerarBandoInimigo({ territorioId, pontosFixo: ajustarPontosFixo(poi.pontosFixo, modo), playerTeam: party, enemiesData, liderFixo: poi.liderFixo, moldesPool: poi.moldesPool, qtdMin: poi.qtdMin, qtdMax: poi.qtdMax })
}

function lutar(party, bando, talentos) {
  const especiais = Object.fromEntries(party.map(m => [m.id, getEquippedActiveGanguesSpecials(m)]))
  let estado = iniciarBrigaMultidao({ playerTeam: party, enemyTeam: bando })
  for (let i = 0; i < GANGUES_FARM_MAX_RODADAS && !estado.terminado; i++) estado = avancarRodadaMultidao(estado, talentos, especiais)
  return { outcome: estado.outcome || 'defeat', combatants: estado.combatants }
}

// Poção automática entre uma luta e outra: quem saiu de pé com PV ≤ 50%
// toma poção de PV (a que melhor tapa o buraco) até passar dos 50% ou a bolsa
// acabar. Devolve quantas foram usadas.
function tomarPocoes(store, combatants) {
  let usadas = 0
  for (const c of combatants.filter(x => x.side === 'player' && x.pv > 0)) {
    let pv = c.pv
    while (pv / c.pvMax <= POCAO_LIMIAR_PV) {
      const inventario = store().inventario
      const itens = GANGUES_ITENS_LISTA.map(i => ({ ...i, quantidade: inventario[i.id] || 0 }))
      const pocao = melhorPocao(itens, 'cura_pv', c.pvMax - pv)
      if (!pocao) return usadas
      const { curou } = store().curarMembro(c.id, 'cura_pv', pocao.valor)
      if (!curou || !store().usarItem(pocao.id)) return usadas
      pv += curou
      usadas++
    }
  }
  return usadas
}

/** Roda o farm do tempo fora. `store` = useGanguesStore.getState (lido de
 *  novo a cada luta — as ações mudam o estado). Devolve o resumo pra tela. */
export function simularFarmAusente({ store, cena, territorioId, segundos, enemiesData, onDerrota }) {
  const s0 = store()
  const prog0 = s0.cenaProgresso[cena.id] || { resolvidos: {}, revelados: {} }
  const poi = alvoDoFarm(cena, prog0, s0.rep)
  const resumo = { poiId: poi?.id || null, lutas: 0, vitorias: 0, grana: 0, rep: 0, sucata: 0, pocoes: 0, niveis: {}, teto: false, derrota: false, socorro: null }
  if (!poi) return resumo
  const selecionados = s0.activeParty.filter(m => s0.roster.some(r => r.id === m.id))
  const ids = (selecionados.length ? selecionados : s0.roster).slice(0, GANGUES_STORY_BATTLE_PARTY_MAX).map(m => m.id)
  const nivel0 = Object.fromEntries(s0.roster.filter(m => ids.includes(m.id)).map(m => [m.id, nivelDe(m)]))
  const modo = s0.storyProgress?.__dificuldade || 'medio'
  const lutas = Math.min(GANGUES_FARM_MAX_LUTAS, Math.floor(segundos / GANGUES_FARM_SEGUNDOS_POR_LUTA))
  const autoConfig = lerAutoConfig()

  for (let n = 0; n < lutas; n++) {
    const s = store()
    const party = s.roster.filter(m => ids.includes(m.id))
    if (party.some(m => nivelDe(m) - nivel0[m.id] >= GANGUES_FARM_TETO_NIVEIS)) { resumo.teto = true; break }
    if (!party.length || party.every(m => Number(m.attributes?.pv_atual ?? 1) <= 0)) break
    const bando = bandoDoPoi(poi, { party, enemiesData, modo, territorioId })
    if (!bando?.length) break
    const { outcome, combatants } = lutar(party, bando, autoConfig.talentos)
    const victory = outcome === 'victory'
    resumo.lutas++
    s.registrarResultadoStory(outcome)
    const report = { combatants, contribuicoes: {} }
    const match = { playerTeam: party }
    const inimigos = combatants.filter(c => c.side === 'enemy')
    const pontosMaisForte = Math.max(1, ...party.map(m => ['A', 'H', 'D', 'PV', 'PM'].reduce((t, k) => t + (Number(m.attributes?.[k]) || 0), 0)))
    const apBruto = calcularApTotal({ victory, enemyCount: inimigos.length, cenaChefe: false, torre: false, inimigosAttrs: inimigos.map(c => c.attributes), pontosMaisForte, tamanhoTime: party.length, territorioId })
    s.aplicarDanoPersistente(combatants)
    if (!victory) {
      const prog = store().cenaProgresso[cena.id]
      const destino = destinoSocorroDerrota(cena, prog)
      if (destino) {
        const custoBase = cena.pois.find(p => p.id === destino.poiId)?.custoGrana || 10
        resumo.socorro = store().socorroDerrota(custoBase)
        store().salvarPosicaoCena(cena.id, destino.posicao)
      }
      resumo.derrota = true
      onDerrota?.()
      break
    }
    resumo.vitorias++
    const { pesosPorId, nivelPorId } = calcularPesosEParticipantes({ victory, report, match })
    s.gainApForParticipants(Math.max(party.length, apBruto), pesosPorId, nivelPorId)
    s.registrarNoAlbum(inimigos.map(c => c.id))
    const { grana, rep, itens } = calcularRecompensaCena({ emCena: true, storyAlvo: { territorioId, cenaRecompensa: poi.recompensa || null }, enemyCount: inimigos.length })
    s.marcarPoiResolvido(cena.id, poi.id, poi.revela || [])
    if (grana) { s.ganharGrana(grana); resumo.grana += grana }
    if (rep) { s.ganharRep(rep); resumo.rep += rep }
    itens.forEach(({ id, qtd }) => s.darItem(id, qtd))
    if (Math.random() < GANGUES_FARM_SUCATA_CHANCE) { s.darItem(GANGUES_SUCATA_ID, 1); resumo.sucata++ }
    if (autoConfig.pocao) resumo.pocoes += tomarPocoes(store, combatants)
  }

  const fim = store()
  for (const m of fim.roster.filter(r => ids.includes(r.id))) {
    const ganho = nivelDe(m) - nivel0[m.id]
    if (ganho > 0) resumo.niveis[m.id] = { nome: m.sheet_name, de: nivel0[m.id], para: nivelDe(m) }
  }
  if (!resumo.teto) resumo.teto = Object.values(resumo.niveis).some(v => v.para - v.de >= GANGUES_FARM_TETO_NIVEIS)
  if (resumo.lutas) fim.saveParticipantProgress(ids)
  return resumo
}
