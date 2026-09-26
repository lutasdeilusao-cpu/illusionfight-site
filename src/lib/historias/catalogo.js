import livroIndex from '../../data/livro-index.json'
import contosIndex from '../../data/contos-index.json'
import obrasIndex from '../../data/obras-index.json'
import { imagemWebshard, tituloLegado } from '../webshard/catalogo'
import comingSoon from '../../assets/images/ComingSoon.png'
// Arte oficial da área de Contos (Illusion Tales) — por enquanto a mesma pra
// tudo: capa da coleção, capa de cada conto e miniatura de cada capítulo.
import capaContosArte from '../../assets/images/contos/capa-illusion-tales.webp'

/* Catálogo de Histórias — mesma ideia do catálogo WEB SHARD: a UI nunca lê
   livro-index / contos-index / obras-index direto. Os três viram "títulos"
   no mesmo formato (nome_*, tagline_*, sinopse_*, capa, cor, capítulos com
   `liberacao`), então a vitrine e a página do título não sabem de onde o
   dado veio. Título novo entra só com dado.

   Rotas antigas ficam (indexadas): /historias/lutas-de-ilusao/:id,
   /historias/contos/:historia/:cap, /historias/:slug/:cap. */

const obraAssets = import.meta.glob('../../assets/obras/*/*.{webp,jpg,png}', { eager: true, import: 'default' })
const obraAsset = (slug, file) => (file ? obraAssets[`../../assets/obras/${slug}/${file}`] || null : null)

// Cor de cada título — só fio/selo (--ws-cor); a moldura é a do portal.
const COR_LDI = 'var(--if-danger)'
const COR_PESO = { leve: 'var(--if-ok)', media: 'var(--if-amber)', pesada: 'var(--if-danger)' }
const COR_SELO = { 'dark-fantasy': 'var(--if-violet)' }

/** Capítulo com títulos/resumos em `_pt/_en/_es` (o dado usa `titulo` puro pro pt). */
function normalizarCap(cap) {
  return { ...cap, titulo_pt: cap.titulo_pt || cap.titulo }
}

// A linha principal é a mesma história do WEB SHARD: nome, chamada,
// sinopse e capa oficiais vêm de lá (uma fonte só pro produto).
const LDI = tituloLegado()

const LINHA_PRINCIPAL = {
  id: 'lutas-de-ilusao',
  universo: 'ldi',
  nome_pt: LDI.nome_pt, nome_en: LDI.nome_en, nome_es: LDI.nome_es,
  tagline_pt: LDI.tagline_pt, tagline_en: LDI.tagline_en, tagline_es: LDI.tagline_es,
  sinopse_pt: LDI.sinopse_pt, sinopse_en: LDI.sinopse_en, sinopse_es: LDI.sinopse_es,
  slug: 'lutas-de-ilusao',
  tipo: 'livro',
  canon: true,
  peso: 'pesada',
  temas: ['luta', 'familia', 'amizade', 'crime', 'humor'],
  cor: COR_LDI,
  capa: imagemWebshard(LDI.capa),
  arte: true,
  capitulos: livroIndex.map(normalizarCap),
  rota: '/historias/lutas-de-ilusao',
  rotaCap: cap => `/historias/lutas-de-ilusao/${cap.id}`,
  // O capítulo 01 é sempre aberto: é a porta de entrada do livro.
  sempreLivre: cap => cap.id === 'capitulo-01',
}

const CONTOS = contosIndex.map(h => ({
  id: h.id,
  slug: h.id,
  tipo: 'conto',
  universo: 'ldi',
  canon: h.canon,
  peso: h.peso,
  temas: h.temas || [],
  cor: COR_PESO[h.peso] || COR_PESO.media,
  capa: capaContosArte,
  arte: true,
  nome_pt: h.titulo, nome_en: h.titulo_en, nome_es: h.titulo_es,
  tagline_pt: h.tagline_pt, tagline_en: h.tagline_en, tagline_es: h.tagline_es,
  sinopse_pt: h.resumo_pt, sinopse_en: h.resumo_en, sinopse_es: h.resumo_es,
  capitulos: h.capitulos.map(normalizarCap),
  rota: `/historias/contos/${h.id}`,
  rotaCap: cap => `/historias/contos/${h.id}/${cap.id}`,
}))

const OBRAS = obrasIndex.map(o => ({
  id: o.id,
  slug: o.id,
  tipo: 'obra',
  // Cada obra externa é um universo próprio (outro mundo, outra história).
  universo: o.id,
  canon: o.canon,
  peso: o.peso,
  temas: o.temas || [],
  selo: o.selo,
  cor: COR_SELO[o.selo] || COR_PESO[o.peso] || COR_PESO.media,
  capa: obraAsset(o.id, o.capa) || comingSoon,
  arte: Boolean(obraAsset(o.id, o.capa)),
  galeria: (o.galeria || []).map(f => obraAsset(o.id, f)),
  idiomas: o.idiomas || ['pt'],
  autor: o.autor,
  amazon: o.amazon,
  nome_pt: o.titulo, nome_en: o.titulo_en, nome_es: o.titulo_es,
  tagline_pt: o.tagline_pt, tagline_en: o.tagline_en, tagline_es: o.tagline_es,
  sinopse_pt: o.resumo_pt, sinopse_en: o.resumo_en, sinopse_es: o.resumo_es,
  saga_pt: o.saga_pt, saga_en: o.saga_en, saga_es: o.saga_es,
  universo_pt: o.universo_pt, universo_en: o.universo_en, universo_es: o.universo_es,
  capitulos: o.capitulos.map(normalizarCap),
  rota: `/historias/${o.id}`,
  rotaCap: cap => `/historias/${o.id}/${cap.id}`,
}))

const TODOS = [LINHA_PRINCIPAL, ...CONTOS, ...OBRAS]

export function listarHistorias(tipo = null) {
  return tipo ? TODOS.filter(h => h.tipo === tipo) : TODOS
}

export function historiaPorSlug(slug, tipo = null) {
  return listarHistorias(tipo).find(h => h.slug === slug) || null
}

/** Capa oficial da coleção dos Contos de Ilusão. */
export function capaContos() {
  return capaContosArte
}

export function linhaPrincipal() {
  return LINHA_PRINCIPAL
}

/** Miniatura do capítulo: galeria da obra (1 arte por capítulo) ou a capa. */
export function miniaturaCapHistoria(historia, cap) {
  const i = historia.capitulos.findIndex(c => c.id === cap.id)
  return historia.galeria?.[i] || historia.capa
}

export function numeroCapHistoria(cap) {
  return String(cap.numero).padStart(2, '0')
}

/** Último capítulo aberto em cada título (as chaves que os leitores já gravam). */
export function progressoHistoria(historia) {
  try {
    if (historia.tipo === 'livro') {
      const id = localStorage.getItem('ldi-livro-ultimo')
      return historia.capitulos.find(c => c.id === id) || null
    }
    const chave = historia.tipo === 'conto' ? 'ldi-conto-ultimo' : 'ldi-obra-ultimo'
    const [slug, capId] = (localStorage.getItem(chave) || '').split('/')
    if (slug !== historia.slug) return null
    return historia.capitulos.find(c => c.id === capId) || null
  } catch {
    return null
  }
}
