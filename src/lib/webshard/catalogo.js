import titulos from '../../data/webshard-titulos.json'
import episodios from '../../data/episodios.json'

/* Catálogo WEB SHARD — única porta de entrada para "quais títulos existem,
   quais capítulos cada um tem e onde moram as páginas". A UI nunca lê
   episodios.json / webshard-titulos.json direto: assim um título novo
   (ex.: Heróis da Cidade) entra só com dado, sem tocar em componente.

   Rotas: Lutas de Ilusão mantém as URLs antigas /webtoon/:id (já indexadas
   no Google, linkadas na Home e na busca). Qualquer outro título usa
   /webtoon/:slug/:cap. Quem decide é rotaCapitulo(), nunca a página. */

const TITULO_LEGADO = 'lutas-de-ilusao'

// Capítulos que mudaram de número. Set/2026: o antigo Ep. 00 (Apresentação)
// saiu; a introdução oficial agora é o Cap. 01 — /webtoon/00 está indexada.
const CAPITULOS_MOVIDOS = { [TITULO_LEGADO]: { '00': '01' } }

export function capituloMovido(titulo, id) {
  return CAPITULOS_MOVIDOS[titulo?.slug]?.[id] || null
}

const imagens = import.meta.glob('../../assets/webshard/*.webp', { eager: true, import: 'default' })
const imagemPorNome = Object.fromEntries(
  Object.entries(imagens).map(([caminho, url]) => [caminho.split('/').pop(), url])
)

const FONTES = {
  episodios: () => episodios,
  nenhuma: () => [],
}

export function localizado(obj, campo, locale) {
  if (!obj) return ''
  return obj[`${campo}_${locale}`] || obj[`${campo}_pt`] || ''
}

export function imagemWebshard(nome) {
  return nome ? imagemPorNome[nome] || null : null
}

/** Miniatura do capítulo: src/assets/webshard/cap-<slug>-<id>.webp; sem
 *  arte própria, usa a capa do título. */
export function miniaturaCapitulo(titulo, cap) {
  return imagemWebshard(`cap-${titulo.slug}-${cap.id}.webp`) || imagemWebshard(titulo.capa)
}

export function listarTitulos({ isAdmin = false } = {}) {
  return titulos.filter(t => t.visivel === 'publico' || isAdmin)
}

export function tituloPorSlug(slug, { isAdmin = false } = {}) {
  return listarTitulos({ isAdmin }).find(t => t.slug === slug) || null
}

export function capitulosDe(titulo) {
  if (!titulo) return []
  const fonte = FONTES[titulo.fonte_capitulos] || FONTES.nenhuma
  return fonte()
}

export function capituloPorId(titulo, id) {
  return capitulosDe(titulo).find(c => c.id === id) || null
}

/** Capítulo real (tem páginas) — os "Em breve" sem data são só marcadores. */
export function capituloTemConteudo(cap) {
  return Boolean(cap?.paginas)
}

export function rotaTitulo(titulo) {
  return `/webtoon/${titulo.slug}`
}

export function rotaCapitulo(titulo, cap) {
  if (titulo.slug === TITULO_LEGADO) return `/webtoon/${cap.id}`
  return `/webtoon/${titulo.slug}/${cap.id}`
}

export function tituloLegado() {
  return titulos.find(t => t.slug === TITULO_LEGADO)
}

export function numeroCapitulo(cap) {
  return cap.especial ? `E${cap.numero}` : String(cap.numero).padStart(2, '0')
}

/** "Cap. 01" ou "Especial · Parte 1" — especiais são história à parte. */
export function rotuloCapitulo(cap, t) {
  return cap.especial
    ? t('webShard.cap.especial', { n: cap.numero })
    : t('webShard.cap.rotulo', { n: numeroCapitulo(cap) })
}

/** Linha principal x especiais (fora da linha principal). */
export function capitulosPrincipais(titulo) {
  return capitulosDe(titulo).filter(c => !c.especial)
}

export function capitulosEspeciais(titulo) {
  return capitulosDe(titulo).filter(c => c.especial)
}

/** Idioma em que o capítulo vai ser lido: o do site se o capítulo tiver,
 *  senão português (o original). */
export function idiomaInicial(cap, locale) {
  const idiomas = cap?.idiomas || ['pt']
  return idiomas.includes(locale) ? locale : idiomas[0]
}

/** URLs das páginas no idioma pedido. Página que ainda não existe no idioma
 *  (ex.: ES do cap. 01 sem a 37) cai no português, em vez de deixar buraco
 *  na leitura. */
export function paginasDe(cap, idioma) {
  const formato = cap.formato || 'png'
  const faltando = cap.paginas_faltando?.[idioma] || []
  return Array.from({ length: cap.paginas }, (_, i) => {
    const numero = i + 1
    const lingua = faltando.includes(numero) ? 'pt' : idioma
    return {
      numero,
      src: `/webtoon/${cap.id}/${lingua}/${String(numero).padStart(2, '0')}.${formato}`,
    }
  })
}

export function vizinhos(titulo, cap) {
  // Anterior/próximo andam só dentro da mesma linha (principal ou especiais).
  const lista = capitulosDe(titulo).filter(c => Boolean(c.especial) === Boolean(cap.especial))
  const idx = lista.findIndex(c => c.id === cap.id)
  return {
    anterior: idx > 0 ? lista[idx - 1] : null,
    proximo: idx >= 0 && idx < lista.length - 1 ? lista[idx + 1] : null,
  }
}

const hojeISO = () => new Date().toISOString().slice(0, 10)

/** Capítulo aberto pra todo mundo pela Beta, por tempo limitado
 *  (`beta_ate`, inclusive). Depois disso vale só a cascata oficial. */
export function emBeta(cap, hoje = hojeISO()) {
  return Boolean(cap?.beta_ate && hoje <= cap.beta_ate)
}

/** Dias corridos de hoje até `data` (0 = é hoje). */
export function diasAte(data, hoje = hojeISO()) {
  return Math.round((Date.parse(`${data}T00:00:00Z`) - Date.parse(`${hoje}T00:00:00Z`)) / 86400000)
}

export function formatarData(dataStr) {
  if (!dataStr) return ''
  const [a, m, d] = dataStr.split('-')
  return `${d}/${m}/${a}`
}
