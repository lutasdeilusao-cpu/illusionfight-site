/* ══════════════════════════════════════════════════════════════
   Helpers GENÉRICOS de cena — operam em qualquer `cena`, não só na Pista.
   Extraído de data/cenas/pista.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §4):
   antes esse arquivo era importado por GanguesRoute.jsx e GanguesCena.jsx
   só porque a Pista era o único território com cena navegável — no dia em
   que outro território (Feira, Baixada...) ganhar a própria cena, ele
   dependeria erradamente de pista.js pra essas 4 funções. Agora moram aqui,
   território-agnósticas, e o registro `CENAS_POR_ID` cresce conforme mais
   territórios ganham cena própria.
   ══════════════════════════════════════════════════════════════ */
import { CENA_PISTA } from './pista/index.js'
import { CENA_FEIRA } from './feira/index.js'
import { CENA_BAIXADA } from './baixada/index.js'
import { CENA_VILA } from './vila/index.js'
import { CENA_MORRO } from './morro/index.js'
import { CENA_ALTO } from './alto/index.js'
import { tetoDoTerritorio } from '../ganguesChefes.js'

export const CENAS_POR_ID = {
  [CENA_PISTA.id]: CENA_PISTA,
  [CENA_FEIRA.id]: CENA_FEIRA,
  [CENA_BAIXADA.id]: CENA_BAIXADA,
  [CENA_VILA.id]: CENA_VILA,
  [CENA_MORRO.id]: CENA_MORRO,
  [CENA_ALTO.id]: CENA_ALTO,
}

/** Uma cena existe para este território? (senão, cai na trilha antiga) */
export function temCena(territorioId) {
  return Boolean(CENAS_POR_ID[territorioId])
}

/** O portão do chefe está aberto, dado o mapa de POIs resolvidos? */
export function portaoAberto(cena, resolvidos = {}) {
  const p = cena.portao || {}
  const precisa = (p.precisa || []).every(id => resolvidos[id])
  const ou = !p.ou?.length || p.ou.some(id => resolvidos[id])
  return precisa && ou
}

/** Todos os POIs não-opcionais + o chefe caíram? = bairro dominado */
export function cenaCompleta(cena, resolvidos = {}, bossFeito = false) {
  const obrig = cena.pois.filter(poi => !poi.opcional).every(poi => resolvidos[poi.id])
  return obrig && bossFeito
}

/** Contagem para o breadcrumb "A Pista · 3/7" — o caminho obrigatório é
 *  exatamente `portao.precisa` + o chefe. POIs opcionais (rinha, corre,
 *  informante, descanso, achado) e o farm não entram. */
export function contarCena(cena, resolvidos = {}, bossFeito = false) {
  const obrig = cena.portao?.precisa || []
  const total = obrig.length + 1
  const feitos = obrig.filter(id => resolvidos[id]).length + (bossFeito ? 1 : 0)
  return { feitos, total }
}

/** O jogador está na ÁREA DO CHEFE? — o outro lado do muro, enquanto o chefe
 *  não caiu (pedido do Isaias, 28/09/2026: "na área do boss isso não é
 *  permitido" — a briga automática e o farm ausente param lá). Na rua é
 *  acima da faixa do muro; num interior, só conta se TODA porta dele fica do
 *  lado de lá (o túnel, que liga os dois lados, não conta). Chefe derrotado,
 *  o bairro é teu — a área deixa de ser do chefe. */
export function naAreaDoChefe(cena, prog = {}, pos = {}) {
  if (!cena || prog.boss) return false
  if (pos.local) {
    const portas = (cena.predios || []).filter(pr => pr.porta?.para === pos.local.id)
    return portas.length > 0 && portas.every(pr => pr.pos_portao)
  }
  return Boolean(cena.muro) && Number.isFinite(pos.y) && pos.y < cena.muro.y1
}

// Linha do muro que divide a cena da Pista (mesma faixa y1330-1350 que
// hitsSolid bloqueia, engine/ganguesCenaMotor.js). Serve só pra decidir de
// que lado do muro o jogador estava quando a tropa caiu.
const MURO_Y = 1340

/** Pra qual birosca a tropa é arrastada depois de uma derrota (não existe
 *  game over — pedido do Isaias, 27/09/2026). Olha todo interior que tem um
 *  POI de descanso lá dentro, fica só com os que o jogador consegue alcançar
 *  (prédio pós-muro só depois do túnel/muro abrir) e escolhe o mais perto de
 *  onde ele estava — preferindo o mesmo lado do muro. Devolve a posição de
 *  cena pronta pra salvar: DENTRO do cômodo, logo abaixo do pino de descanso. */
export function destinoSocorroDerrota(cena, prog = {}) {
  if (!cena?.interiores) return null
  const laDeCima = portaoAberto(cena, prog.resolvidos || {}) || Boolean(prog.boss)
  const predioPorId = id => (cena.predios || []).find(pr => pr.id === id)
  // Onde o jogador estava na RUA (dentro de um interior = a porta dele).
  const pos = prog.posicao || cena.mundo?.spawn || { x: 0, y: 0 }
  const predioLocal = pos.local ? predioPorId(cena.interiores[pos.local.id]?.porta?.predio) : null
  const rua = predioLocal ? { x: predioLocal.porta?.zx ?? predioLocal.x, y: predioLocal.porta?.zy ?? predioLocal.y } : pos
  const candidatos = []
  for (const [interId, inter] of Object.entries(cena.interiores)) {
    const pr = predioPorId(inter.porta?.predio)
    if (!pr || (pr.pos_portao && !laDeCima)) continue
    inter.comodos?.forEach((com, comodo) => {
      const pino = com.pois?.find(pd => cena.pois.find(p => p.id === pd.ref)?.tipo === 'descanso')
      // Descanso que só existe depois de um ponto (`precisa` — a Dona Neide,
      // no 5º andar da Vila) não acorda quem ainda não chegou lá.
      if (!pino || (pino.precisa && !prog.resolvidos?.[pino.precisa])) return
      const porta = { x: pr.porta?.zx ?? pr.x, y: pr.porta?.zy ?? pr.y }
      // "Lado" só existe em cena cortada no meio (muro da Pista/Feira, linha do trem da Baixada).
      const outroLado = Boolean(cena.muro || cena.trem) && (porta.y < MURO_Y) !== (rua.y < MURO_Y)
      // Quem cai na RUA acorda numa birosca da rua, nunca num andar de cima
      // de um prédio (cômodo > 0 de um interior de vários cômodos).
      const andarDeCima = !predioLocal && comodo > 0 ? 50000 : 0
      const dist = Math.hypot(porta.x - rua.x, porta.y - rua.y) + (outroLado ? 100000 : 0) + andarDeCima
      const alvo = { x: pino.pos.x, y: Math.min(pino.pos.y + 44, com.world.h - 40) }
      candidatos.push({ dist, poiId: pino.ref, posicao: { ...alvo, local: { id: interId, comodo } } })
    })
  }
  candidatos.sort((a, b) => a.dist - b.dist)
  return candidatos[0] || null
}

/** Quanto a Rinha cobra pra remendar a tropa depois de uma derrota e seguir
 *  na roda (Isaias, 30/09/2026): a recuperação completa do bairro, o mesmo
 *  preço do socorroDerrota (3× o descanso mais perto — 30 na Pista, 45 na
 *  Feira, 60 na Baixada). */
export function custoRecuperacaoRinha(cena, prog) {
  const destino = destinoSocorroDerrota(cena, prog)
  return 3 * (cena.pois.find(p => p.id === destino?.poiId)?.custoGrana || 10)
}

/** Rinha (Isaias, 30/09/2026: "tá vindo personagem muito difícil... tem que
 *  ter uns mais fáceis, que dão menos experiência, e personagens no nível do
 *  player, no máximo 1 ou 2 níveis a mais"): o adversário sai em volta da
 *  ficha do lutador MAIS FORTE da tropa — a mesma régua do XP
 *  (apPorInimigo): até 2 abaixo rende XP cheio, mais fraco que isso rende
 *  menos, acima rende o triplo. O 0 aparece 2× (o mais comum é vir no teu
 *  nível). Piso 2; o teto do chefão quem aplica é o gerador do bando
 *  (`tetoTerritorio`, com a ficha REAL do líder dele).
 *  Substitui o sorteio entre todas as lutas do bairro (28/09), que chegava
 *  no nível do chefão. */
export const GANGUES_RINHA_FAIXA = [-5, -4, -3, -2, -1, 0, 0, 1, 2]
const pontosFicha = m => ['A', 'H', 'D', 'PV', 'PM'].reduce((s, k) => s + (Number(m?.attributes?.[k]) || 0), 0)
export function niveisDaRinha(playerTeam) {
  const maisForte = Math.max(0, ...(playerTeam || []).map(pontosFicha))
  if (!maisForte) return []
  return GANGUES_RINHA_FAIXA.map(d => Math.max(2, maisForte + d))
}

/** O revezamento de uma luta como ele vai pro gerador de bando, com as regras
 *  do território: teto no chefão (`tetoTerritorio`) e, na Rinha, o nível
 *  sorteado em volta da tropa (`niveisSorteio`, ver niveisDaRinha). */
export function revezamentoNoTerritorio(revezamento, territorioId, playerTeam) {
  if (!revezamento) return revezamento
  return {
    ...revezamento,
    tetoTerritorio: tetoDoTerritorio(territorioId) ? territorioId : undefined,
    niveisSorteio: revezamento.nivelDaTropa ? niveisDaRinha(playerTeam) : undefined,
  }
}

/** Barra de Alerta (Vila, `cena.alerta`): quanto o bonde tá avisado agora
 *  (0 a `max`). Mora no save, em storyProgress.__alerta[cenaId]. */
export function alertaDaCena(cena, storyProgress = {}) {
  if (!cena?.alerta) return 0
  return Math.max(0, Math.min(cena.alerta.max, Number(storyProgress.__alerta?.[cena.id]?.n) || 0))
}

/** Os pontos de ficha de uma treta da cena com o alerta somado: +1 por ponto
 *  de alerta em cada corpo, sem nunca passar do chefão do território. */
export function pontosComAlerta(pontos, cena, storyProgress = {}) {
  const extra = alertaDaCena(cena, storyProgress)
  if (!extra || !(pontos > 0)) return pontos
  return Math.min(pontos + extra, tetoDoTerritorio(cena.territorioId) || pontos + extra)
}
