import fs from 'fs'
import path from 'path'
import { validateRelease } from '../src/lib/releaseAccess.js'

const SITE_URL = 'https://illusionfight.com'
const DIST_DIR = path.resolve(process.cwd(), 'dist')
const INDEX_PATH = path.join(DIST_DIR, 'index.html')
const PUBLIC_SITEMAP_PATH = path.resolve(process.cwd(), 'public', 'sitemap.xml')
const BUILD_DATE = new Date().toISOString().slice(0, 10)
// Data de "última modificação" pro sitemap: usa a data real quando ela já passou,
// senão a data do build. Evita lastmod uniforme (sem sinal de novidade pro Google).
const pastOr = date => (date && date <= BUILD_DATE ? date : BUILD_DATE)

const readJson = file => JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8'))
const personagens = readJson('src/data/personagens-en.json')
const capitulos = readJson('src/data/livro-index.json')
const contos = readJson('src/data/contos-index.json')
const obras = readJson('src/data/obras-index.json')
const episodios = readJson('src/data/episodios.json')

const releaseItems = [
  ...capitulos.map(cap => [`livro/${cap.id}`, cap]),
  ...contos.flatMap(conto => conto.capitulos.map(cap => [`conto/${conto.id}/${cap.id}`, cap])),
  ...obras.flatMap(obra => obra.capitulos.map(cap => [`obra/${obra.id}/${cap.id}`, cap])),
]
releaseItems.forEach(([label, item]) => validateRelease(item, label))

// Idioma principal da comunicação: INGLÊS (português e espanhol são
// secundários). Todo metadado e texto estático daqui sai em inglês — é o que
// Twitter/WhatsApp/Google leem, já que eles não rodam o React.
// Páginas públicas com metadados e fallback próprios. Nunca copie o index da
// home sem trocar o canonical: isso faz o Google tratar todas como duplicatas.
const ROUTES = [
  ['/login', 'Log in — Illusion Fight', 'Log in to your Illusion Fight account to access your profile and pick up your progress.', 'Log in to Illusion Fight', 'Access your account to continue your progress.', '0.0', 'yearly', false],
  ['/cadastro', 'Create a free account — Illusion Fight', 'Create your free account to save your progress, cards and achievements across Illusion Fight games.', 'Create a free account', 'Save your progress, cards and achievements on any device.', '0.0', 'yearly', false],
  ['/personagens', 'Characters — Illusion Fight', 'Meet the fighters of Illusion Fight: Kim, Jack, Nina, Helena, Shuntaro and the rest of the LDI arena cast.', 'Illusion Fight characters', 'Explore the fighters, their stories, fighting styles and place in the Illusion Fight universe.', '0.9', 'monthly'],
  ['/historias', 'Stories — Illusion Fight', 'The Illusion Fight main storyline, the Illusion Tales and other worlds by the same creator — read online for free.', 'Illusion Fight stories', 'The whole Illusion Fight reading universe in one place: the main storyline, the tales and other stories.', '0.9', 'weekly'],
  ['/historias/lutas-de-ilusao', 'The Novel — Illusion Fight', 'Read the Illusion Fight novel online, chapter by chapter, and follow Kim, Jack and the fighters of Bravara.', 'The Illusion Fight novel', 'Follow the published chapters of the novel that expands the LDI universe.', '0.9', 'weekly'],
  ['/historias/contos', 'Illusion Tales | Illusion Fight', 'Side stories from the Illusion Fight universe: other characters, other experiences, the same world.', 'Illusion Tales', 'Side stories from the Illusion Fight universe — characters and experiences that expand the LDI arena beyond the main storyline.', '0.7', 'weekly'],
  ['/historias/mundo-das-sombras', 'The Shadow World — Illusion Fight', 'The Shadow World, a dark fantasy novel by Isaias Leal. Book 1 of the Discovery Saga. Coming soon, for free, on Illusion Fight.', 'The Shadow World', 'Minus is nine years old and has already lost everything three times. The mark on his shoulder draws the shadows. Dark fantasy from the creator of Illusion Fight.', '0.6', 'monthly'],
  ['/historias/mar-de-cinzas', 'Sea of Ashes — Illusion Fight', 'Sea of Ashes, a dark fantasy of cosmic horror and oppression by Isaias Leal. Arc I. Coming soon, for free, on Illusion Fight.', 'Sea of Ashes', 'Seventeen years old, a white dress, a groom with three dead wives — and something at the bottom of the ocean that has been waiting for thirty thousand years.', '0.6', 'monthly'],
  ['/webtoon', 'WEB SHARD — Read Illusion Fight Online for Free', 'Read Illusion Fight online for free in WEB SHARD, the vertical action comic — chapters, art and the story of Kim and the fighters of Bravara.', 'WEB SHARD — Illusion Fight', 'Illusion Fight is the first WEB SHARD series: a Brazilian vertical action comic published in free chapters right here on the site. If you like manga, manhwa or action webcomics, you will recognize the rhythm — with a 100% Brazilian universe and cast.', '0.9', 'weekly'],
  ['/webtoon/lutas-de-ilusao', 'Illusion Fight — WEB SHARD', 'Read Illusion Fight in WEB SHARD, the vertical action comic: Kim, 17, in a virtual arena where the pain is 100% real. Free, in English, Portuguese and Spanish.', 'Illusion Fight — WEB SHARD', 'Bravara, 2XXX. In the LDI, the pain is real and winning is everything. Kim, 17, sells candy on the bus and never cared about some rich-kid game. Until he lost a bet.', '0.8', 'weekly'],
  ['/musicas', 'Music — Illusion Fight', 'Listen to the original soundtrack of Illusion Fight, the universe of WEB SHARD comics, games and science fiction.', 'Illusion Fight music', 'Discover and listen to the original songs of the LDI universe.', '0.8', 'monthly'],
  ['/universos', 'Universes — Illusion Fight', 'The three universes by Isaias Leal: Illusion Fight, The Shadow World and Sea of Ashes. Lore, races, maps and glossaries.', 'The Illusion Fight universes', "Explore the worldbuilding of the creator's three universes: Illusion Fight, The Shadow World and Sea of Ashes.", '0.8', 'monthly'],
  ['/universos/lutas-de-ilusao', 'The World of Illusion Fight', 'Explore Bravara, the LDI arena, the characters, factions and history of the Illusion Fight universe.', 'The world of Illusion Fight', 'Discover the lore, places, organizations and events of the LDI universe.', '0.8', 'monthly'],
  ['/universos/mundo-das-sombras', 'The Shadow World — universe | Illusion Fight', 'The worldbuilding of The Shadow World: the Shadows and the Illuminated, the Marked, the Shield and the Arc 1 glossary.', 'The Shadow World universe', 'The Shadows and the Illuminated, the Marked, the Shield — what the characters know by the end of Arc 1.', '0.5', 'monthly'],
  ['/universos/mar-de-cinzas', 'Sea of Ashes — the Thalvorn universe | Illusion Fight', 'The worldbuilding of Sea of Ashes: Thalvorn, its races, the six human crowns, the creatures of the ocean and the cosmic horror.', 'The Sea of Ashes universe', 'Thalvorn: an ocean of islands run on the memory of dead gods. Races, human crowns and what lives at the bottom.', '0.5', 'monthly'],
  ['/autor', 'The Author — Illusion Fight', 'Meet Isaias Leal, creator of Illusion Fight — Brazilian WEB SHARD comics, games and a transmedia universe.', 'The author of Illusion Fight', 'Meet the creator and go behind the scenes of the Illusion Fight universe.', '0.7', 'monthly'],
  ['/assinar', 'Subscribe to Illusion Fight', 'See the plans to support Illusion Fight and unlock perks across the LDI universe.', 'Subscribe to Illusion Fight', "See the plans and support the creation of Illusion Fight's WEB SHARD comics, games and stories.", '0.6', 'monthly'],
  ['/games', 'Free Games — Illusion Fight', 'Play for free in the Illusion Fight universe: tactical RPG, card game, browser minigames, a virtual pet and more — right in your browser, nothing to download.', 'Illusion Fight games', 'Play for free in the Illusion Fight universe: tactical RPG, card game, browser minigames, a virtual pet and more — right in your browser, nothing to download.', '0.8', 'weekly'],
  ['/loja', 'Shop — Illusion Fight', 'Find DIX and digital items from the Illusion Fight universe.', 'Illusion Fight shop', 'Explore digital items and ways to support the Illusion Fight universe.', '0.7', 'monthly'],
  ['/quiz', 'Quiz — Illusion Fight', 'Test your knowledge of Illusion Fight and the LDI universe.', 'Illusion Fight quiz', 'Answer questions and find out how well you know the LDI arena.', '0.5', 'monthly'],
  ['/custos', 'Platform costs — Illusion Fight', 'See the costs and the structure that keep the Illusion Fight platform running.', 'Platform costs', 'Transparency about the structure and costs behind the Illusion Fight project.', '0.4', 'monthly'],
  ['/web-shard', 'WEB SHARD: Vertical Webcomic and Manga in Composed Pages — Illusion Fight', "WEB SHARD is Illusion Fight's own format: composed vertical pages built for scrolling on your phone. Learn what it is and read the debut series.", "WEB SHARD — Illusion Fight's own format", 'A reading format created by Illusion Fight: composed vertical pages designed for scrolling on your phone.', '0.6', 'monthly'],
  ['/calendario', 'Release calendar — Illusion Fight', 'Follow the releases of chapters, WEB SHARD, games, music and partners of Illusion Fight.', 'Release calendar', 'See the public Season 1 calendar and follow every release channel of the Illusion Fight universe.', '0.8', 'weekly'],
  ['/leaderboard', 'Leaderboard — Illusion Fight', 'Follow the player rankings of the Illusion Fight universe.', 'Illusion Fight leaderboard', 'See the arena player standings.', '0.5', 'weekly'],
  ['/games/ldi', 'LDI Legends — Illusion Fight', 'Play LDI Legends, the narrative RPG of the Illusion Fight universe.', 'LDI Legends', 'Step into the narrative adventure and write your story in the LDI arena.', '0.6', 'monthly'],
  ['/games/ldi-gangues', 'LDI Gangs — Illusion Fight', 'Build your crew and fight in LDI Gangs, the tactical game of the Illusion Fight universe.', 'LDI Gangs', 'Form your gang and join battles in the LDI universe.', '0.6', 'monthly'],
  ['/games/ldi-tatics', 'LDI Tactics — Illusion Fight', 'Play turn-based tactical battles in the Illusion Fight universe.', 'LDI Tactics', 'Plan your moves and take on tactical battles in the arena.', '0.6', 'monthly'],
  ['/games/jackcandy', 'Jack Dream Beer — Illusion Fight', 'Investigate cases in Jack Dream Beer, the noir game of the Illusion Fight universe.', 'Jack Dream Beer', 'Investigate mysteries in the noir game of the LDI universe.', '0.6', 'monthly'],
  ['/games/pesadelo', 'Particular Nightmare — Illusion Fight', 'Face cases, puzzles and fights in Particular Nightmare.', 'Particular Nightmare', 'Investigate cases and solve challenges in the Illusion Fight universe.', '0.6', 'monthly'],
  ['/games/tamagoshi', 'LDI Tama — Illusion Fight', 'Take care of your creature in LDI Tama, the virtual pet game of the Illusion Fight universe.', 'LDI Tama', 'Adopt, care for and raise your creature in the LDI universe.', '0.6', 'monthly'],
  ['/games/toptrumps', 'LDI Trumps — Illusion Fight', 'Collect cards and play Top Trumps matches in the Illusion Fight universe.', 'LDI Trumps', 'Build your deck and play matches with characters from the LDI universe.', '0.6', 'monthly'],
  ['/games/minigames', 'LDI Mini Games — Illusion Fight', 'Play puzzles and quick challenges in the Illusion Fight universe.', 'LDI Mini Games', 'Find challenges, puzzles and quick games from the arena.', '0.6', 'monthly'],
  ['/games/duelo', 'LDI Duel — Illusion Fight', 'Meet LDI Duel, the one-on-one card game of Illusion Fight.', 'LDI Duel', 'Get your cards ready for duels in the LDI universe.', '0.5', 'monthly'],
].map(([path, title, description, heading, content, priority, changefreq, indexable = true]) => ({ path, title, description, heading, content, priority, changefreq, indexable }))

// Links contextuais pros hubs — dá caminhos reais pro Googlebot circular em vez de
// só o menu repetido em toda página.
const RELATED_BY_PATH = {
  '/personagens': ['kim', 'jack', 'nina', 'helena', 'shuntaro', 'yawanari'].map(id => ({ name: id[0].toUpperCase() + id.slice(1), path: `/personagens/${id}/` })),
  '/historias': [
    { name: 'The Novel — Illusion Fight', path: '/historias/lutas-de-ilusao/' },
    { name: 'Illusion Tales', path: '/historias/contos/' },
    { name: 'The Shadow World', path: '/historias/mundo-das-sombras/' },
    { name: 'Sea of Ashes', path: '/historias/mar-de-cinzas/' },
  ],
  '/historias/lutas-de-ilusao': [
    { name: 'Chapter 1', path: '/historias/lutas-de-ilusao/capitulo-01/' },
    { name: 'Illusion Tales', path: '/historias/contos/' },
    { name: 'Characters', path: '/personagens/' },
  ],
  '/games': [
    { name: 'LDI Legends', path: '/games/ldi/' },
    { name: 'LDI Gangs', path: '/games/ldi-gangues/' },
    { name: 'LDI Tactics', path: '/games/ldi-tatics/' },
    { name: 'LDI Trumps', path: '/games/toptrumps/' },
  ],
  '/universos': [
    { name: 'The world of Illusion Fight', path: '/universos/lutas-de-ilusao/' },
    { name: 'The Shadow World', path: '/universos/mundo-das-sombras/' },
    { name: 'Sea of Ashes', path: '/universos/mar-de-cinzas/' },
  ],
  '/webtoon': [
    { name: 'Illusion Fight — all chapters', path: '/webtoon/lutas-de-ilusao/' },
    { name: 'Chapter 01 — The Illusion Dream', path: '/webtoon/01/' },
    { name: 'What is WEB SHARD', path: '/web-shard/' },
    { name: 'Characters', path: '/personagens/' },
  ],
}

const extraGameRoutes = [
  ['/games/kernel-panic', 'Kernel Panic — free hacker puzzle game', 'Play Kernel Panic, a free hacker puzzle of deduction, commands and digital survival on Illusion Fight.', 'Kernel Panic', 'Solve terminal challenges and survive a system about to crash.'],
  ['/games/sliding-rafael', 'Sliding Puzzle — free sliding puzzle game', 'Play Sliding Puzzle, a free sliding puzzle full of logic challenges on Illusion Fight.', 'Sliding Puzzle', 'Arrange the board, solve the puzzle and complete every level.'],
  ['/games/codigo-perdido', 'Lost Code — free word game', 'Play Lost Code, a free puzzle of words, clues and deduction inspired by corrupted systems.', 'Lost Code', 'Find the hidden word using clues and reasoning.'],
  ['/games/maze-rafael', 'Maze Runner — free maze game', 'Find the way out in Maze Runner, a free maze game with progressive challenges on Illusion Fight.', 'Maze Runner', 'Cross the mazes, find the right path and beat every stage.'],
  ['/games/glitch-rafael', 'Find the Glitch — free memory game', 'Play Find the Glitch, a free memory and sequence challenge on Illusion Fight.', 'Find the Glitch', 'Memorize the system signals, repeat the sequences and resist the glitches.'],
  ['/games/bullet-hell-rafael', 'Bullet Hell — free dodge game', 'Survive Bullet Hell, a free bullet hell game of reflexes, movement and dodging projectiles.', 'Bullet Hell', 'Dodge the projectiles and survive to the end.'],
  ['/games/stabilizer-rafael', 'Signal Stabilizer — free precision game', 'Play Signal Stabilizer, a free challenge of precision, timing and control on Illusion Fight.', 'Signal Stabilizer', 'Keep the system stable, control the meter and hold on as long as you can.'],
]

extraGameRoutes.forEach(([routePath, title, description, heading, content]) => ROUTES.push({ path: routePath, title, description, heading, content, priority: '0.6', changefreq: 'monthly', indexable: true, schemaType: 'game', parent: { name: 'Games', path: '/games/' } }))

personagens.forEach((personagem, i) => {
  const outros = personagens.filter(p => p.id !== personagem.id).slice(0, 5)
  ROUTES.push({
    path: `/personagens/${personagem.id}`,
    title: `${personagem.nome} — Illusion Fight character`,
    description: personagem.descricaoBreve,
    heading: personagem.nomeCompleto || personagem.nome,
    content: personagem.descricaoCompleta,
    extra: [
      personagem.frase && `"${personagem.frase}"`,
      personagem.descricaoBreve,
    ].filter(Boolean),
    facts: [
      ['Nickname', personagem.apelido],
      ['Age', personagem.idade],
      ['Group', personagem.grupo],
      ['Weapon', personagem.arma],
      ['Fighting style', personagem.estilo],
      ['Elemental affinity', personagem.elemental],
      ['Ranking', personagem.ranking],
    ],
    related: [
      ...outros.map(p => ({ name: p.nome, path: `/personagens/${p.id}/` })),
      { name: 'All characters', path: '/personagens/' },
      { name: 'Read the stories', path: '/historias/' },
    ],
    priority: '0.8', changefreq: 'monthly', indexable: true, schemaType: 'character', image: personagem.imagem,
    parent: { name: 'Characters', path: '/personagens/' },
  })
})

capitulos.forEach((capitulo, i) => {
  const anterior = capitulos[i - 1]
  const proximo = capitulos[i + 1]
  ROUTES.push({
    path: `/historias/lutas-de-ilusao/${capitulo.id}`,
    title: `${capitulo.titulo_en || capitulo.titulo} — Illusion Fight novel, chapter ${capitulo.numero}`,
    description: capitulo.resumo_en || capitulo.tagline_en || capitulo.resumo_pt,
    heading: `Chapter ${capitulo.numero} — ${capitulo.titulo_en || capitulo.titulo}`,
    content: capitulo.resumo_en || capitulo.tagline_en || capitulo.resumo_pt,
    extra: [
      capitulo.tagline_en,
      'Read it online for free in English. Portuguese and Spanish versions are also available on Illusion Fight.',
    ].filter(Boolean),
    related: [
      anterior && { name: `Chapter ${anterior.numero} — ${anterior.titulo_en || anterior.titulo}`, path: `/historias/lutas-de-ilusao/${anterior.id}/` },
      proximo && { name: `Chapter ${proximo.numero} — ${proximo.titulo_en || proximo.titulo}`, path: `/historias/lutas-de-ilusao/${proximo.id}/` },
      { name: 'All chapters', path: '/historias/lutas-de-ilusao/' },
    ].filter(Boolean),
    lastmod: pastOr(capitulo.liberacao.publico),
    priority: '0.9', changefreq: 'monthly', indexable: true, schemaType: 'chapter', datePublished: capitulo.liberacao.publico,
    parent: { name: 'The Novel — Illusion Fight', path: '/historias/lutas-de-ilusao/' },
  })
})

episodios.filter(episodio => episodio.paginas).forEach(episodio => ROUTES.push({
  path: `/webtoon/${episodio.id}`,
  title: `${episodio.titulo_en || episodio.titulo_pt} — Illusion Fight WEB SHARD, chapter ${episodio.numero}`,
  description: episodio.descricao_en || episodio.descricao_pt,
  heading: `Chapter ${episodio.numero} — ${episodio.titulo_en || episodio.titulo_pt}`,
  content: episodio.descricao_en || episodio.descricao_pt,
  extra: [
    episodio.frase_en,
    'Read this chapter of Illusion Fight, the Brazilian action and sci-fi WEB SHARD, online in English, Portuguese and Spanish.',
  ].filter(Boolean),
  related: [
    { name: 'All chapters', path: '/webtoon/lutas-de-ilusao/' },
    { name: 'Meet the characters', path: '/personagens/' },
  ],
  lastmod: pastOr(episodio.data_publicacao),
  priority: '0.9', changefreq: 'monthly', indexable: true, schemaType: 'webtoon', datePublished: episodio.data_publicacao,
  parent: { name: 'WEB SHARD', path: '/webtoon/' },
}))

const REDIRECTS = [
  { path: '/games/ldi-arena', target: '/games/ldi-gangues' },
  { path: '/games/toptrumps/lobby', target: '/games/multiplayer/lobby?game=toptrumps&mode=free' },
  { path: '/mundo', target: '/universos' },
  { path: '/livro', target: '/historias' },
  { path: '/livro/contos', target: '/historias/contos' },
  { path: '/webtoon/00', target: '/webtoon/01' },
]

// Enriquecimento final, depois de todos os push: links contextuais nos hubs e um
// segundo parágrafo quando a descrição acrescenta algo ao content.
ROUTES.forEach(route => {
  if (!route.related && RELATED_BY_PATH[route.path]) route.related = RELATED_BY_PATH[route.path]
  if (!route.extra && route.description && route.description !== route.content) route.extra = [route.description]
})

const escapeHtml = value => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char])
const canonicalUrl = route => `${SITE_URL}${route.path}/`
const replace = (html, pattern, value) => html.replace(pattern, value)

function schemaFor(route, url) {
  const common = { name: route.heading, description: route.description, url, inLanguage: 'en' }
  if (route.schemaType === 'character') return { '@type': 'ProfilePage', ...common, mainEntity: { '@type': 'Person', name: route.heading, description: route.description } }
  if (route.schemaType === 'chapter') return { '@type': 'Chapter', ...common, datePublished: route.datePublished, isPartOf: { '@type': 'Book', name: 'Illusion Fight', author: { '@type': 'Person', name: 'Isaias Leal' }, url: `${SITE_URL}/historias/lutas-de-ilusao/` } }
  if (route.schemaType === 'webtoon') return { '@type': 'ComicStory', ...common, datePublished: route.datePublished, isPartOf: { '@type': 'ComicSeries', name: 'Illusion Fight', author: { '@type': 'Person', name: 'Isaias Leal' }, url: `${SITE_URL}/webtoon/` } }
  if (route.schemaType === 'game' || route.path.startsWith('/games/')) return { '@type': 'VideoGame', ...common, gamePlatform: 'Web Browser', playMode: 'SinglePlayer', genre: ['Indie game', 'Action', 'Strategy'] }
  if (route.path === '/historias/lutas-de-ilusao') return { '@type': 'Book', ...common, author: { '@type': 'Person', name: 'Isaias Leal' }, genre: ['Action fiction', 'Science fiction', 'Web novel'] }
  if (route.path === '/historias/mundo-das-sombras' || route.path === '/historias/mar-de-cinzas') return { '@type': 'Book', ...common, author: { '@type': 'Person', name: 'Isaias Leal' }, genre: ['Dark fantasy', 'Fiction'] }
  if (route.path === '/webtoon') return { '@type': 'ComicSeries', ...common, author: { '@type': 'Person', name: 'Isaias Leal' }, genre: ['Action', 'Science fiction', 'Webcomic'] }
  if (route.path === '') return { '@type': 'WebSite', ...common, publisher: { '@type': 'Organization', name: 'Illusion Fight', url: SITE_URL } }
  return { '@type': 'WebPage', ...common }
}

function breadcrumbFor(route, url) {
  const items = [{ '@type': 'ListItem', position: 1, name: 'Illusion Fight', item: `${SITE_URL}/` }]
  if (route.parent) items.push({ '@type': 'ListItem', position: 2, name: route.parent.name, item: `${SITE_URL}${route.parent.path}` })
  if (route.path) items.push({ '@type': 'ListItem', position: items.length + 1, name: route.heading, item: url })
  return { '@type': 'BreadcrumbList', itemListElement: items }
}

const SITE_NAV = [
  ['/historias/', 'Stories'],
  ['/webtoon/', 'WEB SHARD'],
  ['/games/', 'Games'],
  ['/personagens/', 'Characters'],
  ['/universos/', 'Universes'],
]

function staticContent(route, heroImage = '') {
  const parentLink = route.parent ? `<a href="${route.parent.path}">${escapeHtml(route.parent.name)}</a> · ` : ''
  const navLinks = SITE_NAV
    .filter(([href]) => href !== route.parent?.path)
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
    .join(' · ')
  const homeClass = route.path === '' ? ' class="seo-static-home"' : ''
  const hero = route.path === '' && heroImage ? `<img class="seo-static-hero" src="${heroImage}" alt="" width="1258" height="768" fetchpriority="high">` : ''
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
    ? `<nav aria-label="See also"><h2>See also</h2><ul>${related.map(item => `<li><a href="${item.path}">${escapeHtml(item.name)}</a></li>`).join('')}</ul></nav>`
    : ''
  return `<main data-seo-static${homeClass}>${hero}<nav aria-label="Breadcrumb"><a href="/">Illusion Fight</a> · ${parentLink}${navLinks}</nav><article><h1>${escapeHtml(route.heading)}</h1>${paragraphs}${factList}</article>${relatedNav}</main>`
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
  html = html.replace('</head>', `    <meta name="ldi-build" content="${escapeHtml(BUILD_HASH)}">\n    <script type="application/ld+json">${structuredData}</script>\n  </head>`)
  return html.replace('<div id="root"></div>', `<div id="root">${staticContent(route, heroImage)}</div><noscript>${staticContent(route, heroImage)}</noscript>`)
}

function writeRoute(route, html) {
  const routeDir = path.join(DIST_DIR, route.path)
  fs.mkdirSync(routeDir, { recursive: true })
  fs.writeFileSync(path.join(routeDir, 'index.html'), html)
}

function redirectHtml(route) {
  const target = `${SITE_URL}${route.target}`
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0; url=${target}"><meta name="robots" content="noindex, follow"><link rel="canonical" href="${target}"><title>Redirecting — Illusion Fight</title></head><body><p>Redirecionando para <a href="${target}">Illusion Fight</a>.</p></body></html>`
}

function sitemapXml() {
  const urls = [{ path: '/', priority: '1.0', changefreq: 'weekly' }, ...ROUTES.filter(route => route.indexable)]
  const entries = urls.map(route => `  <url>\n    <loc>${route.path === '/' ? `${SITE_URL}/` : canonicalUrl(route)}</loc>\n    <lastmod>${route.lastmod || BUILD_DATE}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
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
ROUTES.forEach(route => writeRoute(route, pageHtml(indexHtml, route)))
REDIRECTS.forEach(route => writeRoute(route, redirectHtml(route)))
const homeRoute = {
  path: '',
  title: 'Illusion Fight — Free WEB SHARD Comics, Games and Stories',
  description: 'Explore Illusion Fight, a Brazilian action universe with free WEB SHARD comics (vertical webcomic), free online games and stories in chapters — characters, music and more.',
  heading: 'Illusion Fight: WEB SHARD comics, games and stories in one universe',
  content: 'Discover a Brazilian action and science fiction story. Read the WEB SHARD comic and the chapter-by-chapter stories online for free, meet the characters and play for free in the Illusion Fight universe: tactical RPG, card game, minigames and more — right in your browser.',
}
fs.writeFileSync(INDEX_PATH, pageHtml(indexHtml, homeRoute))
const sitemap = sitemapXml()
fs.writeFileSync(PUBLIC_SITEMAP_PATH, sitemap)
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap)
console.log(`[prerender] ${ROUTES.length} páginas SEO e ${REDIRECTS.length} redirects estáticos gerados.`)
