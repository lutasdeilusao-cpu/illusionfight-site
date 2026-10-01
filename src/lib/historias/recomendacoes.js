/* Motor de RECOMENDAÇÃO do portal (Isaias, 30/09/2026: "quando ela terminou
   o último capítulo de uma história, recomendar outra... pensar em quais
   recursos a gente tem pra ir linkando as pessoas dentro do portal").

   Os recursos que ligam uma coisa na outra:
   • PERSONAGENS — quem aparece em cada história (Kim, Jack, Nina, Alan...).
   • TEMAS e PESO — já vêm do catálogo (contos.json / obras.json).
   • LIGAÇÕES CURADAS — o que a gente quer que a pessoa leia depois (o conto
     do Alan leva pras Correntes; a banda leva pro conto do Jack).
   • ALÉM DAS HISTÓRIAS — jogo, WEB SHARD e Rádio Nina que conversam com a
     história (o conto do Alan → LDI Gangues, que é Marélia 10 anos antes).
   Pontuação: ligação curada 10 (−1,5 por posição) · personagem em comum 2 · tema em comum 1,5 ·
   mesmo universo 1 · mesmo peso 0,5. História já terminada não volta;
   começada vai pra "continuar", não pra recomendação. */
import { listarHistorias } from './catalogo'

const PERSONAGENS = {
  'lutas-de-ilusao': ['kim', 'jack', 'nina', 'helena', 'alan'],
  '01': ['ryan'],
  '02': ['alan', 'kim', 'jack'],
  '03': ['kim', 'jack', 'osvaldo'],
  '04': ['nina'],
  '05': ['jack', 'kim'],
  '06': ['jack', 'freddy', 'kim'],
  '07': ['kim', 'jack', 'helena', 'alan'],
}

// O que ler depois de cada história (em ordem de preferência).
const LIGACOES = {
  'lutas-de-ilusao': ['07', '05', '04'],
  '01': ['lutas-de-ilusao', '04'],
  '02': ['07', 'lutas-de-ilusao'],
  '03': ['05', '06'],
  '04': ['lutas-de-ilusao', '03'],
  '05': ['06', '07', '03'],
  '06': ['05', '03'],
  '07': ['02', 'lutas-de-ilusao'],
  'mundo-das-sombras': ['mar-de-cinzas', 'lutas-de-ilusao'],
  'mar-de-cinzas': ['mundo-das-sombras', 'lutas-de-ilusao'],
}

// Além das histórias: o que no portal conversa com cada uma.
const EXTRAS = {
  'lutas-de-ilusao': ['webshard', 'trunfo'],
  '01': ['webshard'],
  '02': ['gangues'],
  '03': ['radio'],
  '04': ['radio'],
  '05': ['trunfo'],
  '06': ['trunfo'],
  '07': ['gangues', 'webshard'],
  'mundo-das-sombras': ['webshard'],
  'mar-de-cinzas': ['webshard'],
}
export const EXTRAS_PORTAL = {
  gangues: { rota: '/games/ldi-gangues', chave: 'gangues' },
  trunfo: { rota: '/games/toptrumps', chave: 'trunfo' },
  webshard: { rota: '/webtoon', chave: 'webshard' },
  radio: { rota: '/musicas', chave: 'radio' },
}

const comum = (a = [], b = []) => a.filter(x => b.includes(x)).length

/** Pontua `alvo` como recomendação pra quem acabou de ler `base`. */
function pontuar(base, alvo) {
  const curadas = LIGACOES[base.slug] || []
  const i = curadas.indexOf(alvo.slug)
  let p = i >= 0 ? 10 - i * 1.5 : 0
  p += 2 * comum(PERSONAGENS[base.slug], PERSONAGENS[alvo.slug])
  p += 1.5 * comum(base.temas, alvo.temas)
  if (base.universo === alvo.universo) p += 1
  if (base.peso === alvo.peso) p += 0.5
  return p
}

/** O motivo principal da recomendação (pra mostrar "porque tem o Jack"). */
export function motivo(base, alvo) {
  // na ordem do ALVO: o protagonista da história recomendada vem primeiro
  const pers = (PERSONAGENS[alvo.slug] || []).filter(x => (PERSONAGENS[base.slug] || []).includes(x))
  if (pers.length) return { tipo: 'personagem', valor: pers[0] }
  const temas = (base.temas || []).filter(x => (alvo.temas || []).includes(x))
  if (temas.length) return { tipo: 'tema', valor: temas[0] }
  return null
}

/** Histórias pra ler depois de `slugBase`. `disponivel(h)` = tem capítulo
 *  liberado pra quem está lendo; `historico` exclui o que já terminou. */
export function recomendarDepoisDe(slugBase, { historico = {}, disponivel = () => true, n = 3 } = {}) {
  const todas = listarHistorias()
  const base = todas.find(h => h.slug === slugBase)
  if (!base) return []
  return todas
    .filter(h => h.slug !== slugBase && disponivel(h) && !historico[h.slug]?.terminou)
    .map(h => ({ historia: h, pontos: pontuar(base, h) - (historico[h.slug] ? 1 : 0) }))
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, n)
    .map(({ historia }) => ({ historia, motivo: motivo(base, historia) }))
}

/** Os cartões "além das histórias" (jogo, WEB SHARD, rádio) de uma história. */
export function extrasDe(slug) {
  return (EXTRAS[slug] || []).map(k => EXTRAS_PORTAL[k]).filter(Boolean)
}

/** A prateleira "Pra você" da Home pra quem volta: continuar de onde parou,
 *  porque você leu X, e o que saiu de novo desde a última leitura. */
export function praVoce({ historico = {}, disponivel = () => true, capLiberado = () => true, hoje = new Date().toISOString().slice(0, 10) }) {
  const todas = listarHistorias()
  const entradas = Object.entries(historico).sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0))
  if (!entradas.length) return null

  const continuar = entradas
    .filter(([, e]) => !e.terminou)
    .map(([slug, e]) => {
      const h = todas.find(x => x.slug === slug)
      if (!h) return null
      // o próximo capítulo não lido e liberado, a partir do último aberto
      const idx = Math.max(0, h.capitulos.findIndex(c => c.id === e.ultimo))
      const prox = h.capitulos.slice(idx).find(c => !e.lidos?.includes(c.id) && capLiberado(h, c))
      return prox ? { historia: h, cap: prox } : null
    })
    .filter(Boolean)
    .slice(0, 6)

  const [slugBase] = entradas[0]
  const base = todas.find(h => h.slug === slugBase)
  const porque = base ? { base, itens: recomendarDepoisDe(slugBase, { historico, disponivel, n: 6 }) } : null

  // Novidades: capítulo que abriu nos últimos 14 dias e a pessoa ainda não leu —
  // um cartão por história (o primeiro desses capítulos), não um por capítulo.
  const corte = new Date(Date.parse(hoje) - 14 * 864e5).toISOString().slice(0, 10)
  const novidades = []
  for (const h of todas) {
    for (const c of h.capitulos) {
      const data = c.liberacao?.publico
      if (!data || data < corte || data > hoje || !capLiberado(h, c)) continue
      if (historico[h.slug]?.lidos?.includes(c.id)) continue
      novidades.push({ historia: h, cap: c, data })
      break
    }
  }
  novidades.sort((a, b) => b.data.localeCompare(a.data))

  return { continuar, porque, novidades: novidades.slice(0, 8) }
}
