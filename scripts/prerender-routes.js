import fs from 'fs'
import path from 'path'

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const INDEX_PATH = path.join(DIST_DIR, 'index.html')

// Todas as rotas públicas estáticas (sem :params dinâmicos)
// Manter em sincronia com public/sitemap.xml
const ROUTES = [
  '/personagens',
  '/livro',
  '/webtoon',
  '/musicas',
  '/mundo',
  '/autor',
  '/assinar',
  '/games',
  '/games/ldi',
  '/games/ldi-tatics',
  '/games/ldi-arena',
  '/games/jackcandy',
  '/games/pesadelo',
  '/games/tamagoshi',
  '/games/toptrumps',
  '/games/toptrumps/v2',
  '/games/toptrumps/v2/reward-test',
  '/games/toptrumps/legacy',
  '/games/toptrumps/lobby',
  '/games/toptrumps/multiplayer',
  '/games/minigames',
  '/games/duelo',
  '/leaderboard',
  '/quiz',
  '/login',
  '/cadastro',
  '/perfil',
  '/loja',
  '/custos',
]

function main() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.error('[prerender] dist/index.html não encontrado. Rode `npm run build` primeiro.')
    process.exit(1)
  }

  const indexHtml = fs.readFileSync(INDEX_PATH, 'utf-8')
  let count = 0

  for (const route of ROUTES) {
    const routeDir = path.join(DIST_DIR, route)
    const routeIndex = path.join(routeDir, 'index.html')

    fs.mkdirSync(routeDir, { recursive: true })
    fs.writeFileSync(routeIndex, indexHtml)
    count++
  }

  console.log(`[prerender] ${count} rotas pré-renderizadas com index.html estático (status 200 nativo).`)
}

main()
