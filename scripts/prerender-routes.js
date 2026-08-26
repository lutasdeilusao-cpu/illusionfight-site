import fs from 'fs'
import path from 'path'

const SITE_URL = 'https://illusionfight.com'
const DIST_DIR = path.resolve(process.cwd(), 'dist')
const INDEX_PATH = path.join(DIST_DIR, 'index.html')
const PUBLIC_SITEMAP_PATH = path.resolve(process.cwd(), 'public', 'sitemap.xml')
const LAST_MODIFIED = '2026-08-26'

// Páginas públicas com metadados e fallback próprios. Nunca copie o index da
// home sem trocar o canonical: isso faz o Google tratar todas como duplicatas.
const ROUTES = [
  ['/login', 'Entrar — Illusion Fight', 'Entre na sua conta Illusion Fight para acessar seu perfil e continuar seu progresso.', 'Entrar na Illusion Fight', 'Acesse sua conta para continuar seu progresso.', '0.0', 'yearly', false],
  ['/cadastro', 'Criar conta grátis — Illusion Fight', 'Crie sua conta grátis para salvar progresso, cartas e conquistas nos jogos Illusion Fight.', 'Criar conta grátis', 'Salve seu progresso, suas cartas e suas conquistas em qualquer dispositivo.', '0.0', 'yearly', false],
  ['/personagens', 'Personagens — Illusion Fight', 'Conheça os lutadores de Illusion Fight: Kim, Jack, Nina, Helena, Shuntaro e outros personagens da arena LDI.', 'Personagens de Illusion Fight', 'Explore os lutadores, suas histórias, estilos de combate e lugar no universo Lutas de Ilusão.', '0.9', 'monthly'],
  ['/livro', 'Livro — Illusion Fight', 'Leia online os capítulos do livro Illusion Fight e acompanhe Kim, Jack e os lutadores de Bravara.', 'Livro Illusion Fight', 'Acompanhe os capítulos publicados do romance que expande o universo LDI.', '0.9', 'weekly'],
  ['/webtoon', 'Webtoon — Illusion Fight', 'Leia o webtoon brasileiro de ação Illusion Fight e entre na arena onde a dor é 100% real.', 'Webtoon Illusion Fight', 'Leia os episódios publicados do webtoon de ação e ficção científica.', '0.9', 'weekly'],
  ['/musicas', 'Músicas — Illusion Fight', 'Ouça a trilha sonora original de Illusion Fight, o universo de webtoon, jogos e ficção científica.', 'Músicas de Illusion Fight', 'Conheça e ouça as músicas originais que acompanham o universo LDI.', '0.8', 'monthly'],
  ['/mundo', 'Mundo de Illusion Fight', 'Explore Bravara, a arena LDI, personagens, facções e a história do universo Illusion Fight.', 'O mundo de Illusion Fight', 'Descubra a lore, os lugares, as organizações e os acontecimentos do universo LDI.', '0.8', 'monthly'],
  ['/autor', 'Autor — Illusion Fight', 'Conheça Isaias Leal, criador de Illusion Fight, webtoon brasileiro, jogos e universo transmídia.', 'Autor de Illusion Fight', 'Conheça o criador e os bastidores do universo Illusion Fight.', '0.7', 'monthly'],
  ['/assinar', 'Assine Illusion Fight', 'Conheça os planos para apoiar Illusion Fight e acessar benefícios do universo LDI.', 'Assine Illusion Fight', 'Veja os planos e apoie a criação do webtoon, jogos e histórias de Illusion Fight.', '0.6', 'monthly'],
  ['/games', 'Jogos — Illusion Fight', 'Jogue os games de Illusion Fight: RPG tático, cartas, puzzles, desafios e aventuras no universo LDI.', 'Jogos de Illusion Fight', 'Escolha um jogo e entre na arena do universo LDI.', '0.8', 'weekly'],
  ['/loja', 'Loja — Illusion Fight', 'Encontre fichas, DIX e itens digitais do universo Illusion Fight.', 'Loja Illusion Fight', 'Explore itens digitais e formas de apoiar o universo Illusion Fight.', '0.7', 'monthly'],
  ['/quiz', 'Quiz — Illusion Fight', 'Teste seus conhecimentos sobre Illusion Fight e o universo LDI.', 'Quiz Illusion Fight', 'Responda perguntas e descubra quanto você conhece da arena LDI.', '0.5', 'monthly'],
  ['/custos', 'Custos da plataforma — Illusion Fight', 'Entenda os custos e a estrutura que mantêm a plataforma Illusion Fight ativa.', 'Custos da plataforma', 'Transparência sobre a estrutura e os custos do projeto Illusion Fight.', '0.4', 'monthly'],
  ['/leaderboard', 'Ranking — Illusion Fight', 'Acompanhe o ranking de jogadores do universo Illusion Fight.', 'Ranking Illusion Fight', 'Veja a classificação dos jogadores da arena.', '0.5', 'weekly'],
  ['/games/ldi', 'Lendas do LDI — Illusion Fight', 'Jogue Lendas do LDI, o RPG narrativo do universo Illusion Fight.', 'Lendas do LDI', 'Entre na aventura narrativa e crie sua história na arena LDI.', '0.6', 'monthly'],
  ['/games/ldi-gangues', 'LDI Gangues — Illusion Fight', 'Monte sua equipe e lute em LDI Gangues, o jogo tático do universo Illusion Fight.', 'LDI Gangues', 'Forme sua gangue e participe de batalhas no universo LDI.', '0.6', 'monthly'],
  ['/games/ldi-tatics', 'LDI Tactics — Illusion Fight', 'Jogue batalhas táticas por turnos no universo Illusion Fight.', 'LDI Tactics', 'Planeje movimentos e enfrente batalhas táticas na arena.', '0.6', 'monthly'],
  ['/games/jackcandy', 'Jack Dream Beer — Illusion Fight', 'Investigue casos no jogo noir Jack Dream Beer, do universo Illusion Fight.', 'Jack Dream Beer', 'Investigue mistérios no jogo noir do universo LDI.', '0.6', 'monthly'],
  ['/games/pesadelo', 'Pesadelo Particular — Illusion Fight', 'Enfrente casos, puzzles e combates em Pesadelo Particular.', 'Pesadelo Particular', 'Investigue casos e resolva desafios no universo Illusion Fight.', '0.6', 'monthly'],
  ['/games/tamagoshi', 'Tamagoshi LDI — Illusion Fight', 'Cuide da sua criatura em Tamagoshi LDI, o jogo de companhia do universo Illusion Fight.', 'Tamagoshi LDI', 'Adote, cuide e acompanhe sua criatura no universo LDI.', '0.6', 'monthly'],
  ['/games/toptrumps', 'Top Trumps — Illusion Fight', 'Colecione cartas e dispute partidas de Top Trumps no universo Illusion Fight.', 'Top Trumps Illusion Fight', 'Monte seu deck e dispute partidas com personagens do universo LDI.', '0.6', 'monthly'],
  ['/games/minigames', 'MiniGames — Illusion Fight', 'Jogue puzzles e desafios rápidos no universo Illusion Fight.', 'MiniGames Illusion Fight', 'Encontre desafios, puzzles e jogos rápidos da arena.', '0.6', 'monthly'],
  ['/games/duelo', 'Duelo LDI — Illusion Fight', 'Conheça Duelo LDI, o jogo de cartas um contra um de Illusion Fight.', 'Duelo LDI', 'Prepare suas cartas para os duelos do universo LDI.', '0.5', 'monthly'],
].map(([path, title, description, heading, content, priority, changefreq, indexable = true]) => ({ path, title, description, heading, content, priority, changefreq, indexable }))

const REDIRECTS = [
  { path: '/games/ldi-arena', target: '/games/ldi-gangues' },
  { path: '/games/toptrumps/lobby', target: '/games/multiplayer/lobby?game=toptrumps&mode=free' },
]

const escapeHtml = value => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char])
const canonicalUrl = route => `${SITE_URL}${route.path}/`
const replace = (html, pattern, value) => html.replace(pattern, value)

function pageHtml(baseHtml, route) {
  const url = canonicalUrl(route)
  const title = escapeHtml(route.title)
  const description = escapeHtml(route.description)
  const fallback = `<noscript><main><h1>${escapeHtml(route.heading)}</h1><p>${escapeHtml(route.content)}</p><p><a href="${url}">Acessar ${escapeHtml(route.heading)}</a></p></main></noscript>`
  const structuredData = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: route.title, description: route.description, url, isPartOf: { '@type': 'WebSite', name: 'Illusion Fight', url: SITE_URL }, inLanguage: 'pt-BR' })
  let html = baseHtml
  html = replace(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
  html = replace(html, /<meta name="description" content="[^"]*">/i, `<meta name="description" content="${description}">`)
  if (!route.indexable) html = replace(html, /<meta name="robots" content="[^"]*">/i, '<meta name="robots" content="noindex, follow">')
  html = replace(html, /<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${url}">`)
  html = replace(html, /<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${url}">`)
  html = replace(html, /<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${title}">`)
  html = replace(html, /<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${description}">`)
  html = replace(html, /<meta name="twitter:url" content="[^"]*">/i, `<meta name="twitter:url" content="${url}">`)
  html = replace(html, /<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${title}">`)
  html = replace(html, /<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${description}">`)
  html = html.replace('</head>', `    <script type="application/ld+json">${structuredData}</script>\n  </head>`)
  return html.replace('<div id="root"></div>', `<div id="root"></div>${fallback}`)
}

function writeRoute(route, html) {
  const routeDir = path.join(DIST_DIR, route.path)
  fs.mkdirSync(routeDir, { recursive: true })
  fs.writeFileSync(path.join(routeDir, 'index.html'), html)
}

function redirectHtml(route) {
  const target = `${SITE_URL}${route.target}`
  return `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0; url=${target}"><meta name="robots" content="noindex, follow"><link rel="canonical" href="${target}"><title>Redirecionando — Illusion Fight</title></head><body><p>Redirecionando para <a href="${target}">Illusion Fight</a>.</p></body></html>`
}

function sitemapXml() {
  const urls = [{ path: '/', priority: '1.0', changefreq: 'weekly' }, ...ROUTES.filter(route => route.indexable)]
  const entries = urls.map(route => `  <url>\n    <loc>${route.path === '/' ? `${SITE_URL}/` : canonicalUrl(route)}</loc>\n    <lastmod>${LAST_MODIFIED}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
}

if (!fs.existsSync(INDEX_PATH)) {
  console.error('[prerender] dist/index.html não encontrado. Rode npm run build primeiro.')
  process.exit(1)
}

const indexHtml = fs.readFileSync(INDEX_PATH, 'utf-8')
ROUTES.forEach(route => writeRoute(route, pageHtml(indexHtml, route)))
REDIRECTS.forEach(route => writeRoute(route, redirectHtml(route)))
const sitemap = sitemapXml()
fs.writeFileSync(PUBLIC_SITEMAP_PATH, sitemap)
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap)
console.log(`[prerender] ${ROUTES.length} páginas SEO e ${REDIRECTS.length} redirects estáticos gerados.`)
