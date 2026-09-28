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
   • só farma ponto que a briga automática aceitaria: treta repetível, nunca
     vermelho (obrigatório ainda não feito), nunca chefe, nunca na área do
     chefe (naAreaDoChefe, cenaHelpers.js);
   • perdeu uma luta = para ali, a tropa é arrastada pra birosca (o mesmo
     socorro da derrota de verdade) e TODO automático desliga — o jogador
     tem que voltar a jogar pra ligar de novo.
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

/** O ponto que o farm ausente repete: o adversário da última luta, se ele
 *  vale; senão o ponto válido mais perto de onde o jogador estava. */
export function alvoDoFarm(cena, prog, rep = 0) {
  if (!cena || !prog) return null
  const pos = prog.posicao || {}
  if (naAreaDoChefe(cena, prog, pos)) return null
  const vale = p => p.tipo === 'treta' && p.repetivel && !p.ehChefe && !vermelho(p, prog)
    && estadoPoi(p, prog) === 'disponivel' && !(p.repGate && rep < p.repGate)
    && (p.revezamento || p.pontosFixo) && !naAreaDoChefe(cena, prog, posNoMapa(cena, p.id) || {})
  const validos = cena.pois.filter(vale)
  const ultimo = validos.find(p => p.id === pos.adversario)
  if (ultimo) return ultimo
  const pr = pos.local ? (cena.predios || []).find(x => x.porta?.para === pos.local.id) : null
  const daqui = pr ? { x: pr.porta?.zx ?? pr.x, y: pr.porta?.zy ?? pr.y } : pos
  const dist = p => { const q = posNoMapa(cena, p.id); return q ? Math.hypot(q.x - daqui.x, q.y - daqui.y) : Infinity }
  return validos.sort((a, b) => dist(a) - dist(b))[0] || null
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

function lutar(party, bando) {
  let estado = iniciarBrigaMultidao({ playerTeam: party, enemyTeam: bando })
  for (let i = 0; i < GANGUES_FARM_MAX_RODADAS && !estado.terminado; i++) estado = avancarRodadaMultidao(estado)
  return { outcome: estado.outcome || 'defeat', combatants: estado.combatants }
}

/** Roda o farm do tempo fora. `store` = useGanguesStore.getState (lido de
 *  novo a cada luta — as ações mudam o estado). Devolve o resumo pra tela. */
export function simularFarmAusente({ store, cena, territorioId, segundos, enemiesData, onDerrota }) {
  const s0 = store()
  const prog0 = s0.cenaProgresso[cena.id] || { resolvidos: {}, revelados: {} }
  const poi = alvoDoFarm(cena, prog0, s0.rep)
  const resumo = { poiId: poi?.id || null, lutas: 0, vitorias: 0, grana: 0, rep: 0, sucata: 0, niveis: {}, teto: false, derrota: false, socorro: null }
  if (!poi) return resumo
  const selecionados = s0.activeParty.filter(m => s0.roster.some(r => r.id === m.id))
  const ids = (selecionados.length ? selecionados : s0.roster).slice(0, GANGUES_STORY_BATTLE_PARTY_MAX).map(m => m.id)
  const nivel0 = Object.fromEntries(s0.roster.filter(m => ids.includes(m.id)).map(m => [m.id, nivelDe(m)]))
  const modo = s0.storyProgress?.__dificuldade || 'medio'
  const lutas = Math.min(GANGUES_FARM_MAX_LUTAS, Math.floor(segundos / GANGUES_FARM_SEGUNDOS_POR_LUTA))

  for (let n = 0; n < lutas; n++) {
    const s = store()
    const party = s.roster.filter(m => ids.includes(m.id))
    if (party.some(m => nivelDe(m) - nivel0[m.id] >= GANGUES_FARM_TETO_NIVEIS)) { resumo.teto = true; break }
    if (!party.length || party.every(m => Number(m.attributes?.pv_atual ?? 1) <= 0)) break
    const bando = bandoDoPoi(poi, { party, enemiesData, modo, territorioId })
    if (!bando?.length) break
    const { outcome, combatants } = lutar(party, bando)
    const victory = outcome === 'victory'
    resumo.lutas++
    s.registrarResultadoStory(outcome)
    const report = { combatants, contribuicoes: {} }
    const match = { playerTeam: party }
    const inimigos = combatants.filter(c => c.side === 'enemy')
    const pontosMaisForte = Math.max(1, ...party.map(m => ['A', 'H', 'D', 'PV', 'PM'].reduce((t, k) => t + (Number(m.attributes?.[k]) || 0), 0)))
    const apBruto = calcularApTotal({ victory, enemyCount: inimigos.length, cenaChefe: false, torre: false, inimigosAttrs: inimigos.map(c => c.attributes), pontosMaisForte, tamanhoTime: party.length, territorioId })
    const ap = victory ? Math.max(party.length, apBruto) : apBruto
    const { pesosPorId, nivelPorId } = calcularPesosEParticipantes({ victory, report, match })
    s.aplicarDanoPersistente(combatants)
    s.gainApForParticipants(ap, pesosPorId, nivelPorId)
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
    s.registrarNoAlbum(inimigos.map(c => c.id))
    const { grana, rep, itens } = calcularRecompensaCena({ emCena: true, storyAlvo: { territorioId, cenaRecompensa: poi.recompensa || null }, enemyCount: inimigos.length })
    s.marcarPoiResolvido(cena.id, poi.id, poi.revela || [])
    if (grana) { s.ganharGrana(grana); resumo.grana += grana }
    if (rep) { s.ganharRep(rep); resumo.rep += rep }
    itens.forEach(({ id, qtd }) => s.darItem(id, qtd))
    if (Math.random() < GANGUES_FARM_SUCATA_CHANCE) { s.darItem(GANGUES_SUCATA_ID, 1); resumo.sucata++ }
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
