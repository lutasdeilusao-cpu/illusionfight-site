import fs from 'fs'
import path from 'path'
import { validateRelease } from '../src/lib/releaseAccess.js'
import { IDIOMAS, HTML_LANG, OG_LOCALE, FIXAS, HOME, UI, preencher } from './seo-textos.js'

// Páginas estáticas de SEO — uma por rota E POR IDIOMA (01/10/2026, Isaias:
// "fazer a sugestão 1"): inglês na raiz, português em /pt/..., espanhol em
// /es/.... Cada versão aponta pras outras (hreflang) e pra si mesma
// (canonical), em HTML com lang certo. O app abre /pt e /es no idioma do
// endereço (src/lib/idiomaUrl.js → basename do roteador). Os textos das
// páginas fixas moram em scripts/seo-textos.js; o das histórias vem dos dados.
// Nunca copie o index da home sem trocar o canonical: o Google trata todas
// como duplicatas.

const SITE_URL = 'https://illusionfight.com'
const DIST_DIR = path.resolve(process.cwd(), 'dist')
const INDEX_PATH = path.join(DIST_DIR, 'index.html')
const PUBLIC_SITEMAP_PATH = path.resolve(process.cwd(), 'public', 'sitemap.xml')
const BUILD_DATE = new Date().toISOString().slice(0, 10)
// Data de "última modificação" pro sitemap: usa a data real quando ela já passou,
// senão a data do build. Evita lastmod uniforme (sem sinal de novidade pro Google).
const pastOr = date => (date && date <= BUILD_DATE ? date : BUILD_DATE)

const readJson = file => JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8'))
const existe = file => fs.existsSync(path.resolve(process.cwd(), file))
const capitulos = readJson('src/data/historias/lutas-de-ilusao.json')
const contos = readJson('src/data/historias/contos.json')
const obras = readJson('src/data/historias/obras.json')
const episodios = readJson('src/data/episodios.json')

const releaseItems = [
  ...capitulos.map(cap => [`livro/${cap.id}`, cap]),
  ...contos.flatMap(conto => conto.capitulos.map(cap => [`conto/${conto.id}/${cap.id}`, cap])),
  ...obras.flatMap(obra => obra.capitulos.map(cap => [`obra/${obra.id}/${cap.id}`, cap])),
]
releaseItems.forEach(([label, item]) => validateRelease(item, label))

/** Prefixo do idioma no caminho ('en' fica na raiz). */
const px = (L, p) => (L === 'en' ? p : `/${L}${p === '' ? '/' : p}`)
// campos dos dados: pt usa `titulo`/`*_pt`, os outros `titulo_<L>`; cai pro inglês e depois pro pt
const titulo = (o, L) => (L === 'pt' ? o.titulo || o.titulo_pt : o[`titulo_${L}`]) || o.titulo_en || o.titulo || o.titulo_pt
const campo = (o, base, L) => o[`${base}_${L}`] || o[`${base}_en`] || o[`${base}_pt`] || ''

// TEXTO DO CAPÍTULO no HTML estático (SEO, 01/10/2026): antes o Google só via
// o resumo (~130 palavras) e nunca a história. Vai exatamente o que o visitante
// sem conta lê no site — os primeiros 50% dos parágrafos (mesma regra do
// GateLeitura, GATE_FRACAO) — e só de capítulo já liberado ao público.
// Nunca pôr no estático mais do que o visitante vê (o Google pune cloaking).
const GATE_FRACAO = 0.5
const escapeTexto = v => v.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
function inlineMd(t, L) {
  return escapeTexto(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, (_, txt, href) => `<a href="${px(L, href)}">${txt}</a>`)
}
function trechoLivre(arquivo, L) {
  if (!existe(arquivo)) return null
  const blocos = fs.readFileSync(path.resolve(process.cwd(), arquivo), 'utf-8').replace(/\r\n/g, '\n').split(/\n\s*\n/).map(b => b.trim()).filter(Boolean)
  if (blocos.length < 2) return null
  // mesmo corte do site (conta os blocos com o título, como o cortarTexto),
  // e o "# CAPÍTULO" sai porque o <h1> da página já diz
  const livres = blocos.slice(0, Math.max(1, Math.floor(blocos.length * GATE_FRACAO))).filter((b, i) => !(i === 0 && /^#\s/.test(b)))
  const html = livres.map(b => (/^(-{3,}|\*{3,})$/.test(b) ? '<hr>'
    : /^#+\s/.test(b) ? `<h2>${inlineMd(b.replace(/^#+\s*/, ''), L)}</h2>`
      : `<p>${inlineMd(b, L).replace(/\n/g, '<br>')}</p>`)).join('')
  return `${html}<p><a href="${px(L, '/cadastro/')}">${UI[L].resto}</a></p>`
}
const liberadoAte = cap => Boolean(cap.liberacao?.publico && cap.liberacao.publico <= BUILD_DATE)
// arquivo do capítulo no idioma (cai pro inglês se a tradução não existir)
const arquivoNoIdioma = (pasta, nome, L) => [L, 'en', 'pt'].map(l => `${pasta}/${l}/${nome}.md`).find(existe)

/** Todas as rotas de UM idioma, com caminho SEM prefixo (o prefixo entra depois). */
function rotasDoIdioma(L) {
  const U = UI[L]
  const personagens = readJson(`src/data/personagens-${L}.json`)
  const R = []

  for (const [p, t] of Object.entries(FIXAS)) {
    const [title, description, heading, content] = t[L]
    const [priority, changefreq, indexable = true] = t.meta
    R.push({ path: p, title, description, heading, content, priority, changefreq, indexable })
  }

  personagens.forEach(personagem => {
    const outros = personagens.filter(p => p.id !== personagem.id).slice(0, 5)
    R.push({
      path: `/personagens/${personagem.id}`,
      title: preencher(U.personagemTitulo, { nome: personagem.nome }),
      description: personagem.descricaoBreve,
      heading: personagem.nomeCompleto || personagem.nome,
      content: personagem.descricaoCompleta,
      extra: [personagem.frase && `"${personagem.frase}"`, personagem.descricaoBreve].filter(Boolean),
      facts: [personagem.apelido, personagem.idade, personagem.grupo, personagem.arma, personagem.estilo, personagem.elemental, personagem.ranking].map((v, i) => [U.fatos[i], v]),
      related: [
        ...outros.map(p => ({ name: p.nome, path: `/personagens/${p.id}/` })),
        { name: U.todosPersonagens, path: '/personagens/' },
        { name: U.lerHistorias, path: '/historias/' },
      ],
      priority: '0.8', changefreq: 'monthly', indexable: true, schemaType: 'character', image: personagem.imagem,
      parent: { name: U.personagens, path: '/personagens/' },
    })
  })

  capitulos.forEach((capitulo, i) => {
    const anterior = capitulos[i - 1]
    const proximo = capitulos[i + 1]
    const nomeCap = c => `${U.cap} ${c.numero} — ${titulo(c, L)}`
    R.push({
      path: `/historias/lutas-de-ilusao/${capitulo.id}`,
      title: preencher(U.capLivro, { titulo: titulo(capitulo, L), n: capitulo.numero }),
      description: campo(capitulo, 'resumo', L) || campo(capitulo, 'tagline', L),
      heading: nomeCap(capitulo),
      content: campo(capitulo, 'resumo', L) || campo(capitulo, 'tagline', L),
      extra: [campo(capitulo, 'tagline', L), U.livroExtra].filter(Boolean),
      related: [
        anterior && { name: nomeCap(anterior), path: `/historias/lutas-de-ilusao/${anterior.id}/` },
        proximo && { name: nomeCap(proximo), path: `/historias/lutas-de-ilusao/${proximo.id}/` },
        { name: U.todos, path: '/historias/lutas-de-ilusao/' },
      ].filter(Boolean),
      body: liberadoAte(capitulo) ? trechoLivre(arquivoNoIdioma('src/data/historias/lutas-de-ilusao', capitulo.id, L), L) : null,
      lastmod: pastOr(capitulo.liberacao.publico),
      priority: '0.9', changefreq: 'monthly', indexable: true, schemaType: 'chapter', datePublished: capitulo.liberacao.publico,
      parent: { name: U.livro, path: '/historias/lutas-de-ilusao/' },
    })
  })

  // Contos de Ilusão e as obras de fora (Mundo das Sombras, Mar de Cinzas):
  // página estática pro hub de cada história e pra cada capítulo. Sem isso o
  // GitHub Pages responde 404 nesses endereços e o WhatsApp/Twitter/Google não
  // veem título nem miniatura (pedido do Isaias, 29/09/2026). Capítulo ainda
  // não liberado ganha página (a prévia do link funciona), só sem o texto.
  contos.forEach(conto => {
    const nome = titulo(conto, L)
    const hub = `/historias/contos/${conto.id}`
    const nomeCap = c => `${U.cap} ${c.numero} — ${titulo(c, L)}`
    R.push({
      path: hub,
      title: preencher(U.hubConto, { nome }),
      description: campo(conto, 'tagline', L) || campo(conto, 'resumo', L),
      heading: nome,
      content: campo(conto, 'resumo', L),
      extra: [campo(conto, 'tagline', L), U.gratis].filter(Boolean),
      related: [
        ...conto.capitulos.filter(liberadoAte).map(cap => ({ name: nomeCap(cap), path: `${hub}/${cap.id}/` })),
        { name: U.todosContos, path: '/historias/contos/' },
      ],
      priority: '0.7', changefreq: 'monthly', indexable: true, schemaType: 'book', book: { name: nome, path: `${hub}/` },
      parent: { name: U.contos, path: '/historias/contos/' },
      // Miniatura própria do conto (public/og/contos/<id>.jpg, 1200×630)
      ogImage: `/og/contos/${conto.id}.jpg`,
    })
    conto.capitulos.forEach((cap, i) => {
      const anterior = conto.capitulos[i - 1]
      const proximo = conto.capitulos[i + 1]
      R.push({
        path: `${hub}/${cap.id}`,
        title: preencher(U.capConto, { nome, n: cap.numero, titulo: titulo(cap, L) }),
        description: campo(cap, 'resumo', L) || campo(conto, 'tagline', L),
        heading: `${nome} — ${nomeCap(cap)}`,
        content: campo(cap, 'resumo', L),
        extra: [campo(conto, 'tagline', L)].filter(Boolean),
        related: [
          anterior && { name: nomeCap(anterior), path: `${hub}/${anterior.id}/` },
          proximo && { name: nomeCap(proximo), path: `${hub}/${proximo.id}/` },
          { name: nome, path: `${hub}/` },
        ].filter(Boolean),
        body: liberadoAte(cap) ? trechoLivre(arquivoNoIdioma(`src/data/historias/contos/${conto.id}`, cap.id, L), L) : null,
        lastmod: pastOr(cap.liberacao?.publico),
        priority: '0.6', changefreq: 'monthly', indexable: true, schemaType: 'chapter', datePublished: cap.liberacao?.publico, book: { name: nome, path: `${hub}/` },
        parent: { name: nome, path: `${hub}/` },
        ogImage: `/og/contos/${conto.id}.jpg`,
      })
    })
  })
  obras.forEach(obra => {
    const nome = titulo(obra, L)
    obra.capitulos.forEach(cap => R.push({
      path: `/historias/${obra.id}/${cap.id}`,
      title: preencher(U.obraCap, { nome, titulo: titulo(cap, L) }),
      description: campo(cap, 'resumo', L) || campo(obra, 'tagline', L) || campo(obra, 'resumo', L),
      heading: `${nome} — ${titulo(cap, L)}`,
      content: campo(cap, 'resumo', L) || campo(obra, 'resumo', L) || campo(obra, 'tagline', L),
      related: [{ name: nome, path: `/historias/${obra.id}/` }],
      body: liberadoAte(cap) ? trechoLivre(arquivoNoIdioma(`src/data/historias/obras/${obra.id}`, cap.id, L), L) : null,
      lastmod: pastOr(cap.liberacao?.publico),
      priority: '0.5', changefreq: 'monthly', indexable: liberadoAte(cap), schemaType: 'chapter', datePublished: cap.liberacao?.publico, book: { name: nome, path: `/historias/${obra.id}/` },
      parent: { name: nome, path: `/historias/${obra.id}/` },
    }))
  })

  episodios.filter(episodio => episodio.paginas).forEach(episodio => {
    const nomeEp = titulo(episodio, L)
    // 1ª página do capítulo no idioma: miniatura no compartilhamento e imagem pro Google
    const pag1 = [L, 'en'].map(l => `/webtoon/${episodio.id}/${l}/01.webp`).find(p => existe(`public${p}`))
    R.push({
      path: `/webtoon/${episodio.id}`,
      title: preencher(U.ep, { titulo: nomeEp, n: episodio.numero }),
      description: campo(episodio, 'descricao', L),
      heading: `${U.cap} ${episodio.numero} — ${nomeEp}`,
      content: campo(episodio, 'descricao', L),
      extra: [campo(episodio, 'frase', L), U.epExtra].filter(Boolean),
      related: [
        { name: U.todosEps, path: '/webtoon/lutas-de-ilusao/' },
        { name: U.personagens, path: '/personagens/' },
      ],
      ...(pag1 && {
        ogImage: pag1,
        body: `<img src="${pag1}" alt="${escapeTexto(`${preencher(U.ep, { titulo: nomeEp, n: episodio.numero })} — ${U.pagina} 1`).replace(/"/g, '&quot;')}" loading="lazy" width="800">`,
      }),
      lastmod: pastOr(episodio.data_publicacao),
      priority: '0.9', changefreq: 'monthly', indexable: true, schemaType: 'webtoon', datePublished: episodio.data_publicacao,
      parent: { name: 'WEB SHARD', path: '/webtoon/' },
    })
  })

  // Links contextuais pros hubs — caminhos reais pro Googlebot circular em vez
  // de só o menu repetido em toda página.
  const RELATED_BY_PATH = {
    '/personagens': ['kim', 'jack', 'nina', 'helena', 'shuntaro', 'yawanari'].map(id => ({ name: id[0].toUpperCase() + id.slice(1), path: `/personagens/${id}/` })),
    '/historias': ['/historias/lutas-de-ilusao', '/historias/contos', '/historias/mundo-das-sombras', '/historias/mar-de-cinzas'].map(p => ({ name: FIXAS[p][L][2], path: `${p}/` })),
    '/historias/lutas-de-ilusao': [
      { name: `${U.cap} 1`, path: '/historias/lutas-de-ilusao/capitulo-01/' },
      { name: U.contos, path: '/historias/contos/' },
      { name: U.personagens, path: '/personagens/' },
    ],
    '/historias/contos': contos.map(c => ({ name: titulo(c, L), path: `/historias/contos/${c.id}/` })),
    '/games': ['/games/ldi-gangues', '/games/toptrumps', '/games/ldi'].map(p => ({ name: FIXAS[p][L][2], path: `${p}/` })),
    '/universos': ['/universos/lutas-de-ilusao', '/universos/mundo-das-sombras', '/universos/mar-de-cinzas'].map(p => ({ name: FIXAS[p][L][2], path: `${p}/` })),
    '/webtoon': [
      { name: U.todosEps, path: '/webtoon/lutas-de-ilusao/' },
      ...episodios.filter(e => e.paginas).map(e => ({ name: `${U.cap} ${e.numero} — ${titulo(e, L)}`, path: `/webtoon/${e.id}/` })),
      { name: U.oQueEWebshard, path: '/web-shard/' },
      { name: U.personagens, path: '/personagens/' },
    ],
  }
  // Enriquecimento final: links contextuais nos hubs e um segundo parágrafo
  // quando a descrição acrescenta algo ao content.
  R.forEach(route => {
    if (!route.related && RELATED_BY_PATH[route.path]) route.related = RELATED_BY_PATH[route.path]
    if (!route.extra && route.description && route.description !== route.content) route.extra = [route.description]
  })
  return R
}

const REDIRECTS = [
  { path: '/games/ldi-arena', target: '/games/ldi-gangues' },
  { path: '/games/toptrumps/lobby', target: '/games/multiplayer/lobby?game=toptrumps&mode=free' },
  { path: '/mundo', target: '/universos' },
  { path: '/livro', target: '/historias' },
  { path: '/creator', target: '/creators' },
  { path: '/livro/contos', target: '/historias/contos' },
  { path: '/webtoon/00', target: '/webtoon/01' },
]

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char])
const urlDe = (L, base) => `${SITE_URL}${px(L, base === '' ? '/' : `${base}/`)}`
const replace = (html, pattern, value) => html.replace(pattern, value)

function schemaFor(route, url) {
  const common = { name: route.heading, description: route.description, url, inLanguage: HTML_LANG[route.lang] }
  const autor = { '@type': 'Person', name: 'Isaias Leal', url: urlDe(route.lang, '/autor') }
  const livro = route.book || { name: UI[route.lang].livro, path: '/historias/lutas-de-ilusao/' }
  if (route.schemaType === 'character') return { '@type': 'ProfilePage', ...common, mainEntity: { '@type': 'Person', name: route.heading, description: route.description } }
  if (route.schemaType === 'chapter') return { '@type': 'Chapter', ...common, datePublished: route.datePublished, isAccessibleForFree: true, isPartOf: { '@type': 'Book', name: livro.name, author: autor, url: `${SITE_URL}${px(route.lang, livro.path)}` } }
  if (route.schemaType === 'book') return { '@type': 'Book', ...common, author: autor, genre: ['Fiction', 'Short story'] }
  if (route.schemaType === 'webtoon') return { '@type': 'ComicStory', ...common, datePublished: route.datePublished, isPartOf: { '@type': 'ComicSeries', name: 'Illusion Fight', author: autor, url: urlDe(route.lang, '/webtoon') } }
  if (route.schemaType === 'game' || route.base.startsWith('/games/')) return { '@type': 'VideoGame', ...common, gamePlatform: 'Web Browser', playMode: 'SinglePlayer', genre: ['Indie game', 'Action', 'Strategy'], isAccessibleForFree: true }
  if (route.base === '/historias/lutas-de-ilusao') return { '@type': 'Book', ...common, author: autor, genre: ['Action fiction', 'Science fiction', 'Web novel'] }
  if (route.base === '/historias/mundo-das-sombras' || route.base === '/historias/mar-de-cinzas') return { '@type': 'Book', ...common, author: autor, genre: ['Dark fantasy', 'Fiction'] }
  if (route.base === '/webtoon') return { '@type': 'ComicSeries', ...common, author: autor, genre: ['Action', 'Science fiction', 'Webcomic'] }
  if (route.base === '/autor') return { '@type': 'ProfilePage', ...common, mainEntity: autor }
  if (route.base === '') return { '@type': 'WebSite', ...common, publisher: { '@type': 'Organization', name: 'Illusion Fight', alternateName: ['Lutas de Ilusão', 'Luchas de Ilusión'], url: SITE_URL, logo: `${SITE_URL}/icon-if-512.png`, sameAs: ['https://x.com/IllusionFightIF', 'https://www.instagram.com/illusionfightif', 'https://www.tiktok.com/@illusionfightif', 'https://www.youtube.com/@illusionfightIF'] } }
  return { '@type': 'WebPage', ...common }
}

function breadcrumbFor(route, url) {
  const items = [{ '@type': 'ListItem', position: 1, name: 'Illusion Fight', item: urlDe(route.lang, '') }]
  if (route.parent) items.push({ '@type': 'ListItem', position: 2, name: route.parent.name, item: `${SITE_URL}${px(route.lang, route.parent.path)}` })
  if (route.base) items.push({ '@type': 'ListItem', position: items.length + 1, name: route.heading, item: url })
  return { '@type': 'BreadcrumbList', itemListElement: items }
}

const SITE_NAV = ['/historias/', '/webtoon/', '/games/', '/personagens/', '/universos/']

function staticContent(route, heroImage = '') {
  const L = route.lang
  const U = UI[L]
  const parentLink = route.parent ? `<a href="${px(L, route.parent.path)}">${escapeHtml(route.parent.name)}</a> · ` : ''
  const navLinks = SITE_NAV
    .map((href, i) => [href, U.nav[i]])
    .filter(([href]) => href !== route.parent?.path)
    .map(([href, label]) => `<a href="${px(L, href)}">${label}</a>`)
    .join(' · ')
  const homeClass = route.base === '' ? ' class="seo-static-home"' : ''
  const hero = route.base === '' && heroImage ? `<img class="seo-static-hero" src="${heroImage}" alt="" width="1258" height="768" fetchpriority="high">` : ''
  const paragraphs = [route.content, ...(route.extra || [])]
    .filter(Boolean)
    .map(text => `<p>${escapeHtml(text)}</p>`)
    .join('')
  const facts = (route.facts || []).filter(([, value]) => value !== undefined && value !== null && value !== '')
  const factList = facts.length
    ? `<dl>${facts.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(String(value))}</dd>`).join('')}</dl>`
    : ''
  const related = (route.related || []).filter(item => item && item.path && item.name)
  const relatedNav = related.length
    ? `<nav aria-label="${U.verTambem}"><h2>${U.verTambem}</h2><ul>${related.map(item => `<li><a href="${px(L, item.path)}">${escapeHtml(item.name)}</a></li>`).join('')}</ul></nav>`
    : ''
  // troca de idioma em texto: o Google segue e o leitor também
  const idiomas = IDIOMAS.filter(l => l !== L).map(l => `<a href="${px(l, route.base === '' ? '/' : `${route.base}/`)}" hreflang="${HTML_LANG[l]}">${{ en: 'English', pt: 'Português', es: 'Español' }[l]}</a>`).join(' · ')
  return `<main data-seo-static${homeClass}>${hero}<nav aria-label="${U.migalha}"><a href="${px(L, '/')}">Illusion Fight</a> · ${parentLink}${navLinks}</nav><article><h1>${escapeHtml(route.heading)}</h1>${paragraphs}${route.body || ''}${factList}</article>${relatedNav}<p>${idiomas}</p></main>`
}

function pageHtml(baseHtml, route) {
  const L = route.lang
  const url = urlDe(L, route.base)
  const title = escapeHtml(route.title)
  const description = escapeHtml(route.description)
  const structuredData = JSON.stringify({ '@context': 'https://schema.org', '@graph': [schemaFor(route, url), breadcrumbFor(route, url)] })
  const heroImage = route.base === '' ? baseHtml.match(/<link data-home-hero-preload[^>]+href="([^"]+)"/i)?.[1] || '' : ''
  let html = baseHtml
  if (route.base !== '') html = html.replace(/\s*<link data-home-hero-preload[^>]*>/i, '')
  html = replace(html, /<html lang="[^"]*">/i, `<html lang="${HTML_LANG[L]}">`)
  html = replace(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
  html = replace(html, /<meta name="description" content="[^"]*">/i, `<meta name="description" content="${description}">`)
  if (route.indexable === false) html = replace(html, /<meta name="robots" content="[^"]*">/i, '<meta name="robots" content="noindex, follow">')
  // canonical = esta versão; hreflang = as 3 versões + x-default (inglês)
  const alternates = [...IDIOMAS.map(l => `<link rel="alternate" hreflang="${HTML_LANG[l]}" href="${urlDe(l, route.base)}">`), `<link rel="alternate" hreflang="x-default" href="${urlDe('en', route.base)}">`].join('\n    ')
  html = replace(html, /<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${url}">\n    ${alternates}`)
  html = replace(html, /<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${url}">`)
  html = replace(html, /<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${title}">`)
  html = replace(html, /<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${description}">`)
  html = html.replace(/<meta property="og:locale" content="[^"]*">\s*(<meta property="og:locale:alternate" content="[^"]*">\s*)*/i,
    `<meta property="og:locale" content="${OG_LOCALE[L]}">\n    ${IDIOMAS.filter(l => l !== L).map(l => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`).join('\n    ')}\n    `)
  html = replace(html, /<meta name="twitter:url" content="[^"]*">/i, `<meta name="twitter:url" content="${url}">`)
  html = replace(html, /<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${title}">`)
  html = replace(html, /<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${description}">`)
  if (route.ogImage) {
    const img = `${SITE_URL}${route.ogImage}`
    html = replace(html, /<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${img}">`)
    html = replace(html, /<meta name="twitter:image" content="[^"]*">/i, `<meta name="twitter:image" content="${img}">`)
  }
  html = html.replace('</head>', `    <meta name="ldi-build" content="${escapeHtml(BUILD_HASH)}">\n    <script type="application/ld+json">${structuredData}</script>\n  </head>`)
  return html.replace('<div id="root"></div>', `<div id="root">${staticContent(route, heroImage)}</div><noscript>${staticContent(route, heroImage)}</noscript>`)
}

function writeRoute(caminho, html) {
  const routeDir = path.join(DIST_DIR, caminho)
  fs.mkdirSync(routeDir, { recursive: true })
  fs.writeFileSync(path.join(routeDir, 'index.html'), html)
}

function redirectHtml(target) {
  const url = `${SITE_URL}${target}`
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0; url=${url}"><meta name="robots" content="noindex, follow"><link rel="canonical" href="${url}"><title>Redirecting — Illusion Fight</title></head><body><p>Redirecting to <a href="${url}">Illusion Fight</a>.</p></body></html>`
}

function sitemapXml(rotas) {
  const entries = rotas.filter(r => r.indexable !== false).map(route => {
    const alts = [...IDIOMAS.map(l => `    <xhtml:link rel="alternate" hreflang="${HTML_LANG[l]}" href="${urlDe(l, route.base)}"/>`), `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlDe('en', route.base)}"/>`].join('\n')
    return `  <url>\n    <loc>${urlDe(route.lang, route.base)}</loc>\n${alts}\n    <lastmod>${route.lastmod || BUILD_DATE}</lastmod>\n    <changefreq>${route.changefreq || 'weekly'}</changefreq>\n    <priority>${route.priority || '1.0'}</priority>\n  </url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`
}

if (!fs.existsSync(INDEX_PATH)) {
  console.error('[prerender] dist/index.html não encontrado. Rode npm run build primeiro.')
  process.exit(1)
}

const indexHtml = fs.readFileSync(INDEX_PATH, 'utf-8')
// Hash do chunk de entrada (igual em toda rota — Vite injeta o mesmo <script
// type="module"> no shell inteiro). A vinheta de abertura (index.html) usa
// esse hash pra saber se o navegador já tem o bundle em cache: nome de
// arquivo com hash de conteúdo só muda quando o deploy muda o código, então
// "mesmo hash de antes" é o sinal real de cache, ao contrário de "mesmo dia".
const BUILD_HASH = (indexHtml.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/) || [])[1] || ''

const todas = []
for (const L of IDIOMAS) {
  const [title, description, heading, content] = HOME[L]
  const rotas = [
    { path: '', title, description, heading, content, priority: '1.0', changefreq: 'weekly', indexable: true },
    ...rotasDoIdioma(L),
  ].map(r => ({ ...r, lang: L, base: r.path }))
  for (const r of rotas) {
    const html = pageHtml(indexHtml, r)
    if (r.base === '' && L === 'en') fs.writeFileSync(INDEX_PATH, html)
    else writeRoute(px(L, r.base === '' ? '' : r.base), html)
  }
  for (const red of REDIRECTS) writeRoute(px(L, red.path), redirectHtml(px(L, red.target)))
  todas.push(...rotas)
}
const sitemap = sitemapXml(todas)
fs.writeFileSync(PUBLIC_SITEMAP_PATH, sitemap)
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap)
console.log(`[prerender] ${todas.length} páginas SEO (${IDIOMAS.join('/')}) e ${REDIRECTS.length * IDIOMAS.length} redirects estáticos gerados.`)
