// scripts/deploy-gh-pages.cjs
//
// Substitui `gh-pages -d dist`. Por quê: a lib `gh-pages` limpa o branch
// antigo passando CADA arquivo rastreado como argumento separado pro
// `git rm` (globby expande o glob de remoção em ~1400 caminhos individuais
// hoje). No Windows isso estoura o limite de linha de comando do processo
// assim que o site cresce o suficiente — aconteceu de verdade em
// 22/09/2026 (ENAMETOOLONG), contornado na hora com a flag --add (que só
// ADICIONA o build novo, nunca remove o antigo — o branch ia inchar pra
// sempre, sem nunca depurar arquivo obsoleto).
//
// Este script faz a MESMA coisa que o passo normal do gh-pages (troca o
// conteúdo do branch gh-pages pelo dist/ atual, removendo o que não existe
// mais) só que com `git rm -r -f -- .` — UM argumento só; é o próprio git,
// não o shell do SO, quem resolve a recursão por dentro do processo, então
// não existe limite de linha de comando pra estourar não importa quantos
// milhares de arquivos o build tenha.
//
// Usa um git worktree local do branch gh-pages (não clona nada à parte —
// é o MESMO .git do projeto, só um segundo diretório de trabalho apontando
// pro outro branch). Nunca faz force-push nem reescreve/squasha histórico:
// scripts/restaurar-preview-privado.cjs depende de um commit FIXO antigo
// desse histórico continuar alcançável pra sempre (ver o comentário dele).

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const BRANCH = 'gh-pages'
const WORKTREE = path.join(ROOT, '.gh-pages-worktree')

const MANIFESTO = 'assets-build.json'

function lerManifesto(dir) {
  try { return JSON.parse(fs.readFileSync(path.join(dir, MANIFESTO), 'utf8')) } catch { return [] }
}

function arquivosDe(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isFile()).map(e => e.name)
}

// O gancho post-commit do graphify reconstrói o grafo de conhecimento em segundo plano
// a cada commit. No commit do branch gh-pages isso é o site compilado inteiro (centenas
// de arquivos minificados): o processo pesado segura arquivos da pasta do deploy e o
// git do deploy seguinte falha ao limpar. O build publicado não tem grafo: gancho
// desligado em todo git daqui (GRAPHIFY_SKIP_HOOK é a chave do próprio gancho).
const ENV_GIT = { ...process.env, GRAPHIFY_SKIP_HOOK: '1' }
const INICIO = Date.now()
const LIMITE_MS = 5 * 60 * 1000

function tempo() { return `${((Date.now() - INICIO) / 1000).toFixed(1)}s` }

// Roda um passo do git; se falhar (arquivo travado por outro processo no Windows),
// diz QUAL passo falhou e tenta mais uma vez depois de 3 s antes de desistir.
function git(args, cwd = ROOT) {
  for (let tentativa = 1; ; tentativa++) {
    try {
      return execFileSync('git', args, { cwd, stdio: 'inherit', env: ENV_GIT })
    } catch (e) {
      console.error(`[deploy] falhou: git ${args.join(' ')} (tentativa ${tentativa}, ${tempo()})`)
      if (tentativa >= 2) throw e
      execFileSync(process.execPath, ['-e', 'setTimeout(() => {}, 3000)'])
    }
  }
}

function gitCapture(args, cwd = ROOT) {
  return execFileSync('git', args, { cwd, env: ENV_GIT }).toString().trim()
}

function lerVersaoAtual() {
  try {
    const src = fs.readFileSync(path.join(ROOT, 'src', 'config', 'version.js'), 'utf8')
    const m = src.match(/SITE_VERSION = '([^']+)'/)
    return m ? ` v${m[1]}` : ''
  } catch {
    return ''
  }
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('[deploy] dist/ não existe — rode `npm run build` antes (o predeploy já faz isso).')
    process.exit(1)
  }

  console.log(`[deploy] buscando ${BRANCH} do remoto... (${tempo()})`)
  git(['fetch', 'origin', BRANCH])

  const jaExiste = fs.existsSync(WORKTREE)
  if (jaExiste) {
    console.log('[deploy] reaproveitando worktree existente, sincronizando com origin/' + BRANCH + '...')
    git(['fetch', 'origin', BRANCH], WORKTREE)
    git(['reset', '--hard', `origin/${BRANCH}`], WORKTREE)
    git(['clean', '-fdx', '--exclude=.git'], WORKTREE)
  } else {
    console.log('[deploy] criando worktree novo em', WORKTREE)
    git(['worktree', 'add', '--track', '-B', BRANCH, WORKTREE, `origin/${BRANCH}`])
  }

  // Arquivos de assets/ da versão que está no ar: guardados pra quem ainda
  // está com uma aba aberta na versão anterior (o HTML antigo em cache pede o
  // CSS/JS antigo; sem eles a página abre sem estilo). Só a versão anterior
  // é mantida, pela lista que cada deploy grava em MANIFESTO.
  let anteriores = lerManifesto(WORKTREE)
  if (!anteriores.length && fs.existsSync(path.join(WORKTREE, 'assets'))) anteriores = arquivosDe(path.join(WORKTREE, 'assets'))
  const guarda = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ldi-assets-'))
  for (const f of anteriores) {
    const origem = path.join(WORKTREE, 'assets', f)
    if (fs.existsSync(origem) && fs.statSync(origem).isFile()) fs.copyFileSync(origem, path.join(guarda, f))
  }

  // Sobra de grafo gerado aqui dentro por gancho de commit: não é do site.
  fs.rmSync(path.join(WORKTREE, 'graphify-out'), { recursive: true, force: true })

  // Remove TUDO que está versionado no worktree de uma vez só — 1 argumento
  // pro processo do git ('.'), sem limite de linha de comando do SO, seja
  // qual for o tamanho real do build.
  console.log('[deploy] limpando conteúdo antigo do branch...')
  git(['rm', '-r', '-f', '-q', '--ignore-unmatch', '--', '.'], WORKTREE)
  git(['clean', '-fdx', '--exclude=.git'], WORKTREE)

  console.log('[deploy] copiando dist/ para o worktree...')
  for (const entry of fs.readdirSync(DIST)) {
    fs.cpSync(path.join(DIST, entry), path.join(WORKTREE, entry), { recursive: true })
  }

  const novos = arquivosDe(path.join(DIST, 'assets'))
  let mantidos = 0
  for (const f of fs.readdirSync(guarda)) {
    const destino = path.join(WORKTREE, 'assets', f)
    if (!fs.existsSync(destino)) { fs.copyFileSync(path.join(guarda, f), destino); mantidos++ }
  }
  fs.rmSync(guarda, { recursive: true, force: true })
  fs.writeFileSync(path.join(WORKTREE, MANIFESTO), JSON.stringify(novos))
  console.log(`[deploy] ${mantidos} arquivo(s) da versão anterior mantido(s) em assets/.`)

  git(['add', '-A'], WORKTREE)

  const status = gitCapture(['status', '--porcelain'], WORKTREE)
  if (!status) {
    console.log('[deploy] build idêntico ao já publicado — nada pra enviar.')
    return
  }

  console.log(`[deploy] commitando... (${tempo()})`)
  git(['commit', '-q', '-m', `Deploy${lerVersaoAtual()}`], WORKTREE)

  console.log(`[deploy] enviando pro GitHub Pages... (${tempo()})`)
  git(['push', 'origin', `HEAD:${BRANCH}`], WORKTREE)

  console.log(`[deploy] concluído em ${tempo()} — histórico do gh-pages preservado (sem force-push, sem squash).`)
  if (Date.now() - INICIO > LIMITE_MS) console.error(`[deploy] ATENÇÃO: passou de 5 minutos (${tempo()}). Deploy normal leva menos que isso: investigar.`)
}

try {
  main()
} catch (e) {
  console.error(`[deploy] DEPLOY FALHOU depois de ${tempo()}: ${e.message}`)
  process.exit(1)
}
