import fs from 'fs'
import path from 'path'

const SITE_URL = 'https://illusionfight.com'
const DIST_DIR = path.resolve(process.cwd(), 'dist')
const INDEX_PATH = path.join(DIST_DIR, 'index.html')
const PUBLIC_SITEMAP_PATH = path.resolve(process.cwd(), 'public', 'sitemap.xml')
const LAST_MODIFIED = '2026-08-27'

const readJson = file => JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8'))
const personagens = readJson('src/data/personagens-pt.json')
const capitulos = readJson('src/data/livro-index.json')
const episodios = readJson('src/data/episodios.json')

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

const extraGameRoutes = [
  ['/games/ldi-gangues/treinamento', 'Jogo tático grátis — Treinamento LDI Gangues', 'Teste grátis o combate tático de LDI Gangues, um RPG de arena por turnos do universo Illusion Fight.', 'Treinamento grátis de LDI Gangues', 'Experimente batalhas táticas por turnos, monte sua estratégia e conheça o sistema de combate do RPG LDI Gangues.'],
  ['/games/kernel-panic', 'Kernel Panic — jogo de puzzle hacker grátis', 'Jogue Kernel Panic, um puzzle hacker grátis de dedução, comandos e sobrevivência digital no portal Illusion Fight.', 'Kernel Panic', 'Resolva desafios de terminal e sobreviva a um sistema digital hostil neste jogo de puzzle gratuito.'],
  ['/games/sliding-rafael', 'Sliding Rafael — puzzle deslizante grátis', 'Jogue Sliding Rafael, um puzzle deslizante gratuito com desafios de raciocínio no portal Illusion Fight.', 'Sliding Rafael', 'Organize o tabuleiro, resolva o quebra-cabeça e complete o desafio no menor número de movimentos.'],
  ['/games/codigo-perdido', 'Código Perdido — jogo de palavras grátis', 'Jogue Código Perdido, um puzzle gratuito de palavras, pistas e dedução inspirado em sistemas corrompidos.', 'Código Perdido', 'Descubra a palavra escondida usando pistas e raciocínio antes que o sistema entre em colapso.'],
  ['/games/maze-rafael', 'Maze Rafael — jogo de labirinto grátis', 'Encontre a saída em Maze Rafael, um jogo de labirinto gratuito com desafios progressivos no portal Illusion Fight.', 'Maze Rafael', 'Atravesse labirintos, encontre o caminho correto e conclua desafios de navegação.'],
  ['/games/glitch-rafael', 'Glitch Rafael — jogo de memória grátis', 'Jogue Glitch Rafael, um desafio gratuito de memória e sequência no portal de games Illusion Fight.', 'Glitch Rafael', 'Memorize os sinais do sistema, repita as sequências e resista a cada novo glitch.'],
  ['/games/bullet-hell-rafael', 'Bullet Hell Rafael — jogo de esquiva grátis', 'Sobreviva em Bullet Hell Rafael, um jogo bullet hell gratuito de reflexo, movimento e esquiva de projéteis.', 'Bullet Hell Rafael', 'Desvie dos projéteis e sobreviva até o fim em diferentes dificuldades.'],
  ['/games/stabilizer-rafael', 'Stabilizer Rafael — jogo de precisão grátis', 'Jogue Stabilizer Rafael, um desafio gratuito de precisão, tempo e controle no portal Illusion Fight.', 'Stabilizer Rafael', 'Mantenha o sistema estável, controle o medidor e teste sua precisão.'],
]

extraGameRoutes.forEach(([routePath, title, description, heading, content]) => ROUTES.push({ path: routePath, title, description, heading, content, priority: '0.6', changefreq: 'monthly', indexable: true, schemaType: 'game', parent: { name: 'Games', path: '/games/' } }))

personagens.forEach(personagem => ROUTES.push({
  path: `/personagens/${personagem.id}`,
  title: `${personagem.nome} — personagem de Illusion Fight`,
  description: personagem.descricaoBreve,
  heading: personagem.nomeCompleto || personagem.nome,
  content: personagem.descricaoCompleta,
  priority: '0.8', changefreq: 'monthly', indexable: true, schemaType: 'character', image: personagem.imagem,
  parent: { name: 'Personagens', path: '/personagens/' },
}))

capitulos.filter(capitulo => capitulo.id === 'capitulo-01').forEach(capitulo => ROUTES.push({
  path: `/livro/${capitulo.id}`,
  title: `${capitulo.titulo} — livro Illusion Fight, capítulo ${capitulo.numero}`,
  description: capitulo.resumo_pt || capitulo.tagline_pt,
  heading: `Capítulo ${capitulo.numero} — ${capitulo.titulo}`,
  content: `${capitulo.tagline_pt} ${capitulo.resumo_pt || ''} Leia online e gratuitamente em português; versões em inglês e espanhol também estão disponíveis no portal.`,
  priority: '0.9', changefreq: 'monthly', indexable: true, schemaType: 'chapter', datePublished: capitulo.data_publicacao,
  parent: { name: 'Livro', path: '/livro/' },
}))

episodios.filter(episodio => episodio.id === '00').forEach(episodio => ROUTES.push({
  path: `/webtoon/${episodio.id}`,
  title: `${episodio.titulo_pt} — webtoon Illusion Fight, episódio ${episodio.numero}`,
  description: episodio.descricao_pt,
  heading: `Episódio ${episodio.numero} — ${episodio.titulo_pt}`,
  content: `${episodio.frase_pt} Leia online este episódio do webtoon brasileiro de ação Illusion Fight.`,
  priority: '0.9', changefreq: 'monthly', indexable: true, schemaType: 'webtoon', datePublished: episodio.data_publicacao,
  parent: { name: 'Webtoon', path: '/webtoon/' },
}))

const REDIRECTS = [
  { path: '/games/ldi-arena', target: '/games/ldi-gangues' },
  { path: '/games/toptrumps/lobby', target: '/games/multiplayer/lobby?game=toptrumps&mode=free' },
]

const escapeHtml = value => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char])
const canonicalUrl = route => `${SITE_URL}${route.path}/`
const replace = (html, pattern, value) => html.replace(pattern, value)

function schemaFor(route, url) {
  const common = { name: route.heading, description: route.description, url, inLanguage: 'pt-BR' }
  if (route.schemaType === 'character') return { '@type': 'ProfilePage', ...common, mainEntity: { '@type': 'Person', name: route.heading, description: route.description } }
  if (route.schemaType === 'chapter') return { '@type': 'Chapter', ...common, datePublished: route.datePublished, isPartOf: { '@type': 'Book', name: 'Illusion Fight — Lutas de Ilusão', author: { '@type': 'Person', name: 'Isaias Leal' }, url: `${SITE_URL}/livro/` } }
  if (route.schemaType === 'webtoon') return { '@type': 'ComicStory', ...common, datePublished: route.datePublished, isPartOf: { '@type': 'ComicSeries', name: 'Illusion Fight', author: { '@type': 'Person', name: 'Isaias Leal' }, url: `${SITE_URL}/webtoon/` } }
  if (route.schemaType === 'game' || route.path.startsWith('/games/')) return { '@type': 'VideoGame', ...common, gamePlatform: 'Web Browser', playMode: 'SinglePlayer', genre: ['Indie game', 'Action', 'Strategy'] }
  if (route.path === '/livro') return { '@type': 'Book', ...common, author: { '@type': 'Person', name: 'Isaias Leal' }, genre: ['Action fiction', 'Science fiction', 'Web novel'] }
  if (route.path === '/webtoon') return { '@type': 'ComicSeries', ...common, author: { '@type': 'Person', name: 'Isaias Leal' }, genre: ['Action', 'Science fiction', 'Brazilian webtoon'] }
  if (route.path === '') return { '@type': 'WebSite', ...common, publisher: { '@type': 'Organization', name: 'Illusion Fight', url: SITE_URL } }
  return { '@type': 'WebPage', ...common }
}

function breadcrumbFor(route, url) {
  const items = [{ '@type': 'ListItem', position: 1, name: 'Illusion Fight', item: `${SITE_URL}/` }]
  if (route.parent) items.push({ '@type': 'ListItem', position: 2, name: route.parent.name, item: `${SITE_URL}${route.parent.path}` })
  if (route.path) items.push({ '@type': 'ListItem', position: items.length + 1, name: route.heading, item: url })
  return { '@type': 'BreadcrumbList', itemListElement: items }
}

function staticContent(route, heroImage = '') {
  const parentLink = route.parent ? `<a href="${route.parent.path}">${escapeHtml(route.parent.name)}</a> · ` : ''
  const homeClass = route.path === '' ? ' class="seo-static-home"' : ''
  const hero = route.path === '' && heroImage ? `<img class="seo-static-hero" src="${heroImage}" alt="" width="1258" height="768" fetchpriority="high">` : ''
  return `<main data-seo-static${homeClass}>${hero}<nav aria-label="Navegação estrutural"><a href="/">Illusion Fight</a> · ${parentLink}<a href="/livro/">Livro e webnovel</a> · <a href="/webtoon/">Webtoon</a> · <a href="/games/">Games</a> · <a href="/personagens/">Personagens</a></nav><article><h1>${escapeHtml(route.heading)}</h1><p>${escapeHtml(route.content)}</p></article></main>`
}

function pageHtml(baseHtml, route) {
  const url = canonicalUrl(route)
  const title = escapeHtml(route.title)
  const description = escapeHtml(route.description)
  const structuredData = JSON.stringify({ '@context': 'https://schema.org', '@graph': [schemaFor(route, url), breadcrumbFor(route, url)] })
  const heroImage = route.path === '' ? baseHtml.match(/<link data-home-hero-preload[^>]+href="([^"]+)"/i)?.[1] || '' : ''
  let html = baseHtml
  if (route.path !== '') html = html.replace(/\s*<link data-home-hero-preload[^>]*>/i, '')
  html = replace(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
  html = replace(html, /<meta name="description" content="[^"]*">/i, `<meta name="description" content="${description}">`)
  if (route.indexable === false) html = replace(html, /<meta name="robots" content="[^"]*">/i, '<meta name="robots" content="noindex, follow">')
  html = replace(html, /<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${url}">`)
  html = replace(html, /<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${url}">`)
  html = replace(html, /<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${title}">`)
  html = replace(html, /<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${description}">`)
  html = replace(html, /<meta name="twitter:url" content="[^"]*">/i, `<meta name="twitter:url" content="${url}">`)
  html = replace(html, /<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${title}">`)
  html = replace(html, /<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${description}">`)
  html = html.replace('</head>', `    <script type="application/ld+json">${structuredData}</script>\n  </head>`)
  return html.replace('<div id="root"></div>', `<div id="root">${staticContent(route, heroImage)}</div><noscript>${staticContent(route, heroImage)}</noscript>`)
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
const homeRoute = {
  path: '',
  title: 'Illusion Fight — webtoon, livro e games grátis',
  description: 'Explore Illusion Fight, um universo brasileiro de ação com webtoon, webnovel, livro, personagens, música e jogos indie grátis.',
  heading: 'Illusion Fight: webtoon, livro e games no mesmo universo',
  content: 'Descubra uma história brasileira de ação e ficção científica. Leia o livro e o webtoon online, conheça os personagens e jogue games indie gratuitos conectados ao universo Lutas de Ilusão.',
}
fs.writeFileSync(INDEX_PATH, pageHtml(indexHtml, homeRoute))
const sitemap = sitemapXml()
fs.writeFileSync(PUBLIC_SITEMAP_PATH, sitemap)
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap)
console.log(`[prerender] ${ROUTES.length} páginas SEO e ${REDIRECTS.length} redirects estáticos gerados.`)
