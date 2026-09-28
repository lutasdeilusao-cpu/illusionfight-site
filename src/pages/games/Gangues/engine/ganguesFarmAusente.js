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
   • app foi pro fundo NO MEIO de uma luta da cena com o automático
     ligado: a tela da luta também é desmontada (o som e os relógios param)
     e a MESMA luta é terminada por cálculo, do ponto exato onde parou
     (`lutaAoVivo`); depois segue o farm, se a briga automática estiver
     ligada. Na volta o jogador está no ponto da briga — ou na birosca;
   • perdeu uma luta = para ali, sem XP nenhum dessa luta, a tropa acorda na
     birosca DAQUELE bairro (o mesmo socorro da derrota de verdade — na
     Feira é a pensão) e TODO automático desliga.
   ══════════════════════════════════════════════════════════════ */
import { iniciarBrigaMultidao, iniciarBrigaMultidaoDeCombatentes, avancarRodadaMultidao } from './ganguesBrigaMultidao.js'
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

/** A luta que estava NA TELA quando o app foi pro fundo (GanguesCombat
 *  registra aqui a cada render um leitor do estado vivo — combatentes com o
 *  PV/PM de agora, rodada, automático ligado). O embrulho da luta lê isso na
 *  hora de desmontar a tela, pra terminar a MESMA luta por cálculo. */
export const lutaAoVivo = { ler: null }

// Aplica o resultado de UMA luta (calculada) no store, com as mesmas regras
// da tela de vitória de verdade (useGanguesVictoryResolution): AP, álbum,
// grana/rep/itens do ponto, peça/item de 1ª vitória, aposta da Rinha, sucata,
// ponto resolvido, encontro aleatório finalizado; na derrota, o socorro da
// birosca daquele bairro. `alvo` tem o formato do storyTarget.
// Devolve true se o farm pode continuar.
function aplicarLuta({ store, cena, alvo, party, outcome, combatants, resumo, autoConfig, onDerrota }) {
  const s = store()
  const victory = outcome === 'victory'
  const territorioId = alvo.territorioId
  resumo.lutas++
  s.registrarResultadoStory(outcome)
  s.aplicarDanoPersistente(combatants)
  const inimigos = combatants.filter(c => c.side === 'enemy')
  const aleatorio = alvo.cenaPoiId === '__aleatorio'
  if (!victory) {
    const destino = destinoSocorroDerrota(cena, store().cenaProgresso[cena.id])
    if (destino) {
      const custoBase = cena.pois.find(p => p.id === destino.poiId)?.custoGrana || 10
      resumo.socorro = store().socorroDerrota(custoBase)
      store().salvarPosicaoCena(cena.id, destino.posicao)
    }
    if (aleatorio) store().finalizarEncontroAleatorio()
    resumo.derrota = true
    onDerrota?.()
    return false
  }
  resumo.vitorias++
  const pontosMaisForte = Math.max(1, ...party.map(m => ['A', 'H', 'D', 'PV', 'PM'].reduce((t, k) => t + (Number(m.attributes?.[k]) || 0), 0)))
  const apBruto = calcularApTotal({ victory, enemyCount: inimigos.length, cenaChefe: false, torre: false, inimigosAttrs: inimigos.map(c => c.attributes), pontosMaisForte, tamanhoTime: party.length, territorioId })
  const { pesosPorId, nivelPorId } = calcularPesosEParticipantes({ victory, report: { combatants, contribuicoes: {} }, match: { playerTeam: party } })
  s.gainApForParticipants(Math.max(party.length, apBruto), pesosPorId, nivelPorId)
  s.registrarNoAlbum(inimigos.map(c => c.id))
  const { grana, rep, itens, equipPrimeiraVez, itemPrimeiraVez, pagaFavor } = calcularRecompensaCena({ emCena: true, storyAlvo: alvo, enemyCount: inimigos.length })
  const primeiraVitoria = !store().cenaProgresso[cena.id]?.resolvidos?.[alvo.cenaPoiId]
  if (alvo.cenaSemTravar) s.revelarPoi(cena.id, alvo.cenaRevela || [])
  else if (!aleatorio) s.marcarPoiResolvido(cena.id, alvo.cenaPoiId, alvo.cenaRevela || [])
  if (grana) { s.ganharGrana(grana); resumo.grana += grana }
  if (rep) { s.ganharRep(rep); resumo.rep += rep }
  itens.forEach(({ id, qtd }) => s.darItem(id, qtd))
  if (equipPrimeiraVez && primeiraVitoria) s.comprarEquip(equipPrimeiraVez, 0)
  if (itemPrimeiraVez && primeiraVitoria) s.darItem(itemPrimeiraVez, 1)
  if (pagaFavor) s.pagarFavorRegina()
  if (alvo.aposta > 0) { s.ganharGrana(alvo.aposta * 2); resumo.grana += alvo.aposta * 2 }
  if (Math.random() < GANGUES_FARM_SUCATA_CHANCE) { s.darItem(GANGUES_SUCATA_ID, 1); resumo.sucata++ }
  if (aleatorio) store().finalizarEncontroAleatorio()
  if (autoConfig.pocao) resumo.pocoes += tomarPocoes(store, combatants)
  return true
}

/** O que aconteceu com o app em segundo plano. `store` = useGanguesStore.getState
 *  (lido de novo a cada luta — as ações mudam o estado).
 *  • `lutaEmAndamento` ({ combatants, round }): a luta que estava na tela —
 *    termina por cálculo a partir do estado exato de onde parou (mesmo motor
 *    da Briga em Multidão, com o talento do ajuste do automático).
 *  • `farmar`: depois dela (ou sem ela), segue grindando o adversário da última
 *    luta pelo resto do tempo — só com a briga automática ligada.
 *  Devolve o resumo pra tela "Enquanto você tava fora". */
export function simularFarmAusente({ store, cena, territorioId, segundos, enemiesData, onDerrota, lutaEmAndamento = null, farmar = true }) {
  const s0 = store()
  const autoConfig = lerAutoConfig()
  const selecionados = s0.activeParty.filter(m => s0.roster.some(r => r.id === m.id))
  const ids = lutaEmAndamento
    ? (s0.match.playerTeam || []).map(m => m.id)
    : (selecionados.length ? selecionados : s0.roster).slice(0, GANGUES_STORY_BATTLE_PARTY_MAX).map(m => m.id)
  const nivel0 = Object.fromEntries(s0.roster.filter(m => ids.includes(m.id)).map(m => [m.id, nivelDe(m)]))
  const modo = s0.storyProgress?.__dificuldade || 'medio'
  const resumo = { poiId: null, lutas: 0, vitorias: 0, grana: 0, rep: 0, sucata: 0, pocoes: 0, niveis: {}, teto: false, derrota: false, socorro: null }
  let segue = true
  let tempo = segundos

  if (lutaEmAndamento) {
    const alvo = s0.storyTarget || {}
    const party = s0.roster.filter(m => ids.includes(m.id))
    const especiais = Object.fromEntries(party.map(m => [m.id, getEquippedActiveGanguesSpecials(m)]))
    let estado = iniciarBrigaMultidaoDeCombatentes(lutaEmAndamento.combatants, lutaEmAndamento.round || 1)
    for (let i = 0; i < GANGUES_FARM_MAX_RODADAS && !estado.terminado; i++) estado = avancarRodadaMultidao(estado, autoConfig.talentos, especiais)
    const outcome = estado.outcome || 'defeat'
    s0.endMatch(outcome)
    resumo.poiId = alvo.cenaPoiId !== '__aleatorio' ? alvo.cenaPoiId : null
    segue = aplicarLuta({ store, cena, alvo, party, outcome, combatants: estado.combatants, resumo, autoConfig, onDerrota })
    tempo -= GANGUES_FARM_SEGUNDOS_POR_LUTA
  }

  const poi = segue && farmar && tempo >= GANGUES_FARM_MIN_S ? alvoDoFarm(cena, store().cenaProgresso[cena.id] || { resolvidos: {}, revelados: {} }, store().rep) : null
  if (poi) resumo.poiId = poi.id
  const lutas = poi ? Math.min(GANGUES_FARM_MAX_LUTAS, Math.floor(tempo / GANGUES_FARM_SEGUNDOS_POR_LUTA)) : 0
  const alvo = poi && { territorioId, cenaId: cena.id, cenaPoiId: poi.id, cenaRevela: poi.revela || [], cenaRecompensa: poi.recompensa || null }

  for (let n = 0; n < lutas; n++) {
    const party = store().roster.filter(m => ids.includes(m.id))
    if (party.some(m => nivelDe(m) - nivel0[m.id] >= GANGUES_FARM_TETO_NIVEIS)) { resumo.teto = true; break }
    if (!party.length || party.every(m => Number(m.attributes?.pv_atual ?? 1) <= 0)) break
    const bando = bandoDoPoi(poi, { party, enemiesData, modo, territorioId })
    if (!bando?.length) break
    const { outcome, combatants } = lutar(party, bando, autoConfig.talentos)
    if (!aplicarLuta({ store, cena, alvo, party, outcome, combatants, resumo, autoConfig, onDerrota })) break
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
