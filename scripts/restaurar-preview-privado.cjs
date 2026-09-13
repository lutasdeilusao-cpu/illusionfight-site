// Restaura, dentro de dist/preview-privado/paginas/{novo,antigo}/NN.png, as
// páginas individuais da página privada de comparação
// (src/pages/preview/WebtoonCompare.jsx, rota
// /preview-privado/webtoon-00-comparar) depois do build.
//
// Por quê: essas imagens NUNCA ficaram em src/assets nem em public/ (o total
// passa de 80MB — grande demais pro histórico do git principal). Foram
// coladas manualmente dentro de dist/ e publicadas direto com
// `gh-pages -d dist`, sem passar pelo `npm run deploy` normal. Isso quebrou
// em set/2026: alguém (inclusive este agente) rodou `npm run deploy` de novo
// pra outra coisa qualquer do site; o hook `predeploy` roda `npm run build`,
// o Vite limpa `dist/` inteiro (emptyOutDir padrão), e como essas imagens
// não fazem parte do build normal, elas somem — a página privada quebra
// silenciosamente (ícone de imagem quebrada) sem nenhum erro de build. Foi
// exatamente o que aconteceu: Isaias reportou a página funcionando com o
// sócio e quebrada no dia seguinte, sem nenhuma mudança relacionada a ela.
//
// A cópia definitiva sobrevive no HISTÓRICO do branch gh-pages (nunca
// reescrito/squashado, cada deploy só soma um commit novo) — o commit fixo
// abaixo é onde as 69 páginas (32 do remake + 37 da versão antiga, já
// recortadas da imagem unificada original) foram publicadas uma vez. Este
// script busca esse branch e reextrai os arquivos de lá, então todo
// `npm run deploy` daqui pra frente restaura sozinho, sem depender de
// ninguém lembrar de copiar manualmente de novo.
//
// Quando a comparação acabar (Isaias: "depois vamos destruir ela"), apagar:
// este script, a chamada dele em package.json (predeploy), e
// src/pages/preview/WebtoonCompare.jsx (+ .css).
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const COMMIT = 'e78392b158334b9b38de3dce630a00d48c24daa7' // gh-pages: paginas/{novo 01-32, antigo 01-37}.png (recortadas da imagem unificada, set/2026)
const TOTAL_PAGINAS = { novo: 32, antigo: 37 }
const ROOT = path.join(__dirname, '..')
const DEST_BASE = path.join(ROOT, 'dist', 'preview-privado', 'paginas')

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit'] })
}

try {
  run('git rev-parse --verify --quiet ' + COMMIT) // já temos o commit localmente?
} catch {
  try {
    console.log('[preview-privado] buscando histórico do gh-pages...')
    run('git fetch origin gh-pages --quiet')
  } catch (e) {
    console.warn('[preview-privado] AVISO: não deu pra buscar gh-pages (sem rede/permissão?) — pulando restauração das páginas da comparação privada.')
    process.exit(0)
  }
}

let restauradas = 0
let falhas = 0
for (const [versao, total] of Object.entries(TOTAL_PAGINAS)) {
  const destDir = path.join(DEST_BASE, versao)
  fs.mkdirSync(destDir, { recursive: true })
  for (let n = 1; n <= total; n++) {
    const nome = `${String(n).padStart(2, '0')}.png`
    const destino = path.join(destDir, nome)
    try {
      const buf = execSync(`git show ${COMMIT}:preview-privado/paginas/${versao}/${nome}`, { cwd: ROOT, maxBuffer: 1024 * 1024 * 20 })
      fs.writeFileSync(destino, buf)
      restauradas++
    } catch (e) {
      falhas++
      console.warn(`[preview-privado] AVISO: não deu pra restaurar paginas/${versao}/${nome} — ${e.message}`)
    }
  }
}

console.log(`[preview-privado] ${restauradas} página(s) restaurada(s)${falhas ? `, ${falhas} falha(s)` : ''}.`)
if (falhas) {
  console.warn('[preview-privado] alguma página não foi restaurada — a comparação privada pode ficar incompleta, mas o deploy do site principal segue normalmente.')
}
