// Bando FIXO das lutas de território: a mesma luta tem sempre os mesmos inimigos,
// na mesma quantidade e com a mesma ficha. A carta de "encarar ou não" (TretaVS)
// mostra exatamente esse bando. Só a Rinha, o Clube da Luta e o encontro
// aleatório de rua continuam sorteando.
//
// Quem entra:
//   - `bando` escrito no ponto: [{ id, pts }] — vale do jeito que está.
//   - senão, montado a partir do ponto, sempre igual (o "sorteio" usa o id do ponto
//     como semente): o líder (`enemy`/`liderFixo`/1º do pool) com a ficha do ponto
//     e os capangas do pool do ponto (ou da rua do bairro), 2 a 3 pontos abaixo.
// Quantos: dupla quando o ponto vinha em dupla (`chanceDupla` ≥ 0,5), o meio da faixa
// quando o ponto pedia multidão (`qtdMin`/`qtdMax`), e nunca menos que o mínimo do
// bairro (GANGUES_MIN_INIMIGOS).
import { GANGUES_MIN_INIMIGOS, escalarInimigo, numerarRepetidos, pontosPreviewPoi } from './ganguesEncontros.js'
import { CENAS_POR_ID } from './cenas/cenaHelpers.js'

function semente(texto) {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619)
  return h >>> 0
}
function embaralhado(lista, texto) {
  let a = semente(texto)
  const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  const l = [...lista]
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [l[i], l[j]] = [l[j], l[i]] }
  return l
}

/** O bando fixo de um ponto de treta: [{ id, pts }]. `ptsLider` já com o ajuste do
 *  bairro (Barra de Alerta); `chave` diferencia a treta que nasce de uma escolha. */
export function bandoFixoDoPoi(poi, territorioId, { viraTreta = null, ptsLider = null, chave = '' } = {}) {
  const fonte = viraTreta || poi
  if (Array.isArray(fonte.bando) && fonte.bando.length) return fonte.bando
  const revez = fonte.revezamento
  const lider = fonte.enemy || (!viraTreta && poi.liderFixo) || revez?.pool?.[0]
  if (!lider) return null
  const total = !viraTreta && poi.liderFixo && poi.qtdMin && poi.pontosFixo ? poi.pontosFixo : null
  const qtdMin = viraTreta ? revez?.qtdMin : (poi.qtdMin ?? revez?.qtdMin)
  const qtdMax = viraTreta ? revez?.qtdMax : (poi.qtdMax ?? revez?.qtdMax)
  let n = qtdMin ? Math.round((qtdMin + (qtdMax || qtdMin)) / 2) : (revez?.chanceDupla >= 0.5 ? 2 : 1)
  n = Math.max(n, GANGUES_MIN_INIMIGOS[territorioId] || 1)
  // ficha do líder: o ponto diz; num bando de orçamento TOTAL, o líder leva a maior fatia
  const base = ptsLider ?? (viraTreta ? revez?.budgetPorCorpo : pontosPreviewPoi(poi, territorioId)) ?? 8
  const pLider = total ? Math.max(4, Math.round(total * 0.4)) : base
  const pool = (revez?.pool?.length > 1 ? revez.pool : null) || (!viraTreta && poi.moldesPool) || CENAS_POR_ID[territorioId]?.poolCapangas || [lider]
  const capangas = embaralhado(pool.filter(id => id !== lider), `${poi.id}${chave}`)
  const bando = [{ id: lider, pts: pLider }]
  for (let i = 1; i < n; i++) {
    const id = capangas.length ? capangas[(i - 1) % capangas.length] : lider
    const pts = total ? Math.max(3, Math.round((total - pLider) / (n - 1))) : Math.max(3, pLider - (i % 2 ? 2 : 3))
    bando.push({ id, pts })
  }
  return bando
}

/** Monta as fichas de combate do bando fixo. */
export function montarBandoFixo(bando, enemiesData) {
  const corpos = bando.map(({ id, pts }) => {
    const molde = enemiesData.find(e => e.id === id)
    return molde ? (pts > 0 ? escalarInimigo(molde, pts) : molde) : null
  }).filter(Boolean)
  numerarRepetidos(corpos)
  return corpos
}
