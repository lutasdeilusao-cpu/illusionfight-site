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

export const CENAS_POR_ID = {
  [CENA_PISTA.id]: CENA_PISTA,
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
