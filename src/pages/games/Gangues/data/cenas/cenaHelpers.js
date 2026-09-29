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
import { pontosPreviewPoi } from '../ganguesEncontros.js'
import { tetoDoTerritorio } from '../ganguesChefes.js'

export const CENAS_POR_ID = {
  [CENA_PISTA.id]: CENA_PISTA,
  [CENA_FEIRA.id]: CENA_FEIRA,
  [CENA_BAIXADA.id]: CENA_BAIXADA,
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
      if (!pino) return
      const porta = { x: pr.porta?.zx ?? pr.x, y: pr.porta?.zy ?? pr.y }
      const outroLado = (porta.y < MURO_Y) !== (rua.y < MURO_Y)
      const dist = Math.hypot(porta.x - rua.x, porta.y - rua.y) + (outroLado ? 100000 : 0)
      const alvo = { x: pino.pos.x, y: Math.min(pino.pos.y + 44, com.world.h - 40) }
      candidatos.push({ dist, poiId: pino.ref, posicao: { ...alvo, local: { id: interId, comodo } } })
    })
  }
  candidatos.sort((a, b) => a.dist - b.dist)
  return candidatos[0] || null
}

/** Níveis (pontos de ficha) das lutas do bairro, do mais fraco ao chefão — a
 *  Rinha infinita sorteia entre eles, então a força dela segue a média do
 *  território (Isaias, 28/09/2026). Conta toda treta da rua e dos cômodos,
 *  a briga de papo (`viraTreta`) e o líder do chefe; nunca passa dele. */
export function niveisDoTerritorio(territorioId) {
  const cena = CENAS_POR_ID[territorioId]
  const teto = tetoDoTerritorio(territorioId)
  if (!cena || !teto) return []
  const internos = Object.values(cena.interiores || {}).flatMap(inter => (inter.comodos || []).flatMap(com => (com.pois || []).map(pd => pd.poi).filter(Boolean)))
  const niveis = [...cena.pois, ...internos].flatMap(p => {
    if (p.rinhaInfinita) return []
    if (p.tipo === 'treta') return [pontosPreviewPoi(p, territorioId)]
    return (p.escolhas || []).filter(e => e.viraTreta).map(e => e.viraTreta.pontosFixo || e.viraTreta.revezamento?.budgetPorCorpo)
  })
  return [...niveis, teto].filter(n => n > 0 && n <= teto)
}

/** O revezamento de uma luta como ele vai pro gerador de bando, com as regras
 *  do território: teto no chefão (`tetoTerritorio`) e, na Rinha, o nível
 *  sorteado entre os do bairro (`niveisSorteio`). */
export function revezamentoNoTerritorio(revezamento, territorioId) {
  if (!revezamento) return revezamento
  return {
    ...revezamento,
    tetoTerritorio: tetoDoTerritorio(territorioId) ? territorioId : undefined,
    niveisSorteio: revezamento.niveisTerritorio ? niveisDoTerritorio(territorioId) : undefined,
  }
}
