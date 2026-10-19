import titulos from '../../data/webshard-titulos.json'
import episodios from '../../data/episodios.json'
import heroisEpisodios from '../../data/herois-episodios.json'
import agradecimentosEpisodios from '../../data/agradecimentos-episodios.json'
import marDeCinzasEpisodios from '../../data/mar-de-cinzas-episodios.json'
import mundoDasSombrasEpisodios from '../../data/mundo-das-sombras-episodios.json'

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
const CAPITULOS_MOVIDOS = { [TITULO_LEGADO]: { '00': '01', 'especial-6-realista': 'especial-6' } }

export function capituloMovido(titulo, id) {
  return CAPITULOS_MOVIDOS[titulo?.slug]?.[id] || null
}

const imagens = import.meta.glob('../../assets/webshard/*.webp', { eager: true, import: 'default' })
const imagemPorNome = Object.fromEntries(
  Object.entries(imagens).map(([caminho, url]) => [caminho.split('/').pop(), url])
)

const FONTES = {
  episodios: () => episodios,
  herois: () => heroisEpisodios,
  agradecimentos: () => agradecimentosEpisodios,
  'mar-de-cinzas': () => marDeCinzasEpisodios,
  'mundo-das-sombras': () => mundoDasSombrasEpisodios,
  nenhuma: () => [],
}

export function localizado(obj, campo, locale) {
  if (!obj) return ''
  return obj[`${campo}_${locale}`] || obj[`${campo}_pt`] || ''
}

export function imagemWebshard(nome) {
  return nome ? imagemPorNome[nome] || null : null
}

/** Miniatura do capítulo: cap-<slug>-<id>-<idioma>.webp (capa do idioma,
 *  retrato), depois cap-<slug>-<id>.webp; sem arte própria, usa a capa do título. */
export function miniaturaCapitulo(titulo, cap, locale = 'pt') {
  return imagemWebshard(`cap-${titulo.slug}-${cap.id}-${locale}.webp`)
    || imagemWebshard(`cap-${titulo.slug}-${cap.id}-pt.webp`)
    || imagemWebshard(`cap-${titulo.slug}-${cap.id}.webp`)
    || imagemWebshard(`cap-${titulo.slug}-${cap.base}.webp`)
    || imagemWebshard(titulo.capa)
}

/** `visivel`: 'publico' (todos leem), 'previa' (todos veem a capa, só lê
 *  quem o capítulo libera), 'admin' (só admin e creator veem) ou 'so_admin'
 *  (só o administrador vê; creator não). */
export function listarTitulos({ isAdmin = false, soAdmin = false } = {}) {
  return titulos.filter(t => t.visivel === 'so_admin' ? soAdmin : (t.visivel === 'publico' || t.visivel === 'previa' || isAdmin))
}

export function tituloPorSlug(slug, { isAdmin = false, soAdmin = false } = {}) {
  return listarTitulos({ isAdmin, soAdmin }).find(t => t.slug === slug) || null
}

/** Capítulo com `versoes` (o mesmo capítulo desenhado de jeitos diferentes)
 *  vira uma leitura por versão: id `01-codex`, páginas em `<pasta>/<versão>`,
 *  título com o nome da versão. Cada versão diz quantas páginas tem. */
function abrirVersoes(cap) {
  if (!cap.versoes) return [cap]
  return cap.versoes.map(v => ({
    ...cap,
    id: `${cap.id}-${v.id}`,
    base: cap.id,
    versao: v.id,
    paginas: v.paginas,
    pasta: `${cap.pasta}/${v.id}`,
    titulo_pt: `${cap.titulo_pt} · ${v.nome_pt}`,
    titulo_en: `${cap.titulo_en} · ${v.nome_en}`,
    titulo_es: `${cap.titulo_es} · ${v.nome_es}`,
  }))
}

export function capitulosDe(titulo) {
  if (!titulo) return []
  const fonte = FONTES[titulo.fonte_capitulos] || FONTES.nenhuma
  return fonte().flatMap(abrirVersoes)
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

/** URLs das páginas no idioma pedido. Capítulo de outro título mora em
 *  `cap.pasta` (ex.: herois-da-cidade/01), pra não colidir com o LDI. Página que ainda não existe no idioma
 *  (ex.: ES do cap. 01 sem a 37) cai no português, em vez de deixar buraco
 *  na leitura. */
/** Onde as páginas moram: bucket R2 `webshard`, servido pelo Worker (mesmo caminho de public/webtoon). */
export const WEBSHARD_CDN = 'https://webshardillusionfight.lutasdeilusao.workers.dev'

export function paginasDe(cap, idioma) {
  const formato = cap.formato || 'png'
  const faltando = cap.paginas_faltando?.[idioma] || []
  return Array.from({ length: cap.paginas }, (_, i) => {
    const numero = i + 1
    const lingua = faltando.includes(numero) ? 'pt' : idioma
    return {
      numero,
      src: `${WEBSHARD_CDN}/${cap.pasta || cap.id}/${lingua}/${String(numero).padStart(2, '0')}.${formato}`,
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
