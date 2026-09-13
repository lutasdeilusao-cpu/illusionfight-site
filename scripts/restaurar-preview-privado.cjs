// Restaura os 2 PNGs grandes (webtoon-00-novo.png ~90MB, webtoon-00-antigo.png
// ~28MB) da página privada de comparação (src/pages/preview/WebtoonCompare.jsx,
// rota /preview-privado/webtoon-00-comparar) dentro de dist/preview-privado/
// depois do build.
//
// Por quê: essas imagens NUNCA ficaram em src/assets nem em public/ (grandes
// demais pro histórico do git principal) — foram coladas manualmente dentro
// de dist/ e publicadas direto com `gh-pages -d dist`, sem passar pelo `npm
// run deploy` normal. Isso funcionou até alguém (inclusive este agente, em
// 12-13/09/2026) rodar `npm run deploy` de novo pra outra coisa qualquer: o
// hook `predeploy` roda `npm run build`, o Vite limpa `dist/` inteiro
// (emptyOutDir padrão), e como essas imagens não fazem parte do build normal,
// elas somem — a página privada quebra silenciosamente (ícone de imagem
// quebrada) sem nenhum erro de build. Foi exatamente o que aconteceu: Isaias
// reportou a página funcionando com o sócio e quebrada no dia seguinte, sem
// nenhuma mudança relacionada a ela.
//
// A cópia definitiva das 2 imagens sobrevive no HISTÓRICO do branch gh-pages
// (commit onde o Isaias colou elas manualmente pela 1ª vez, 12/09/2026) — a
// gh-pages nunca reescreve/squasha esse histórico, só adiciona commit novo a
// cada deploy. Este script busca esse branch e reextrai os blobs de lá,
// então todo `npm run deploy` daqui pra frente restaura sozinho, sem
// depender de ninguém lembrar de copiar manualmente de novo.
//
// Quando a comparação acabar (Isaias: "depois vamos destruir ela"), apagar:
// este script, a chamada dele em package.json (predeploy), e
// src/pages/preview/WebtoonCompare.jsx.
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const COMMIT = 'd314ef12d8d0eaca30762ddf46a4c7584d151c1f' // gh-pages: 1ª cópia manual das imagens (Isaias, 12/09/2026)
const ARQUIVOS = ['webtoon-00-novo.png', 'webtoon-00-antigo.png']
const DEST_DIR = path.join(__dirname, '..', 'dist', 'preview-privado')

function run(cmd) {
  return execSync(cmd, { cwd: path.join(__dirname, '..'), stdio: ['ignore', 'pipe', 'inherit'] })
}

try {
  run('git rev-parse --verify --quiet ' + COMMIT) // já temos o commit localmente?
} catch {
  try {
    console.log('[preview-privado] buscando histórico do gh-pages...')
    run('git fetch origin gh-pages --quiet')
  } catch (e) {
    console.warn('[preview-privado] AVISO: não deu pra buscar gh-pages (sem rede/permissão?) — pulando restauração das imagens da página privada de comparação.')
    process.exit(0)
  }
}

fs.mkdirSync(DEST_DIR, { recursive: true })

let algumFalhou = false
for (const nome of ARQUIVOS) {
  const destino = path.join(DEST_DIR, nome)
  try {
    const buf = execSync(`git show ${COMMIT}:preview-privado/${nome}`, { cwd: path.join(__dirname, '..'), maxBuffer: 1024 * 1024 * 200 })
    fs.writeFileSync(destino, buf)
    console.log(`[preview-privado] restaurado: ${nome} (${(buf.length / 1024 / 1024).toFixed(1)}MB)`)
  } catch (e) {
    algumFalhou = true
    console.warn(`[preview-privado] AVISO: não deu pra restaurar ${nome} — ${e.message}`)
  }
}

if (algumFalhou) {
  console.warn('[preview-privado] alguma imagem não foi restaurada — a página privada pode ficar quebrada, mas o deploy do site principal segue normalmente.')
}
