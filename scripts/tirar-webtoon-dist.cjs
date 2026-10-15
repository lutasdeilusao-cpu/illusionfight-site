// As páginas do WEB SHARD são servidas pelo R2 (scripts/webshard-r2.py), não pelo
// GitHub Pages: tira as imagens de dist/webtoon depois do build, pra o deploy ficar leve.
// Os HTML de rota (index.html) continuam.
const fs = require('fs')
const path = require('path')

const PASTA = path.join(__dirname, '..', 'dist', 'webtoon')
const IMAGEM = /\.(webp|png|jpe?g)$/i
let n = 0, bytes = 0

function varrer(dir) {
  if (!fs.existsSync(dir)) return
  for (const nome of fs.readdirSync(dir)) {
    const p = path.join(dir, nome)
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      varrer(p)
      if (!fs.readdirSync(p).length) fs.rmdirSync(p)
    } else if (IMAGEM.test(nome)) {
      bytes += st.size
      fs.unlinkSync(p)
      n++
    }
  }
}

varrer(PASTA)
console.log(`[webtoon] ${n} páginas fora do pacote (${(bytes / 1048576).toFixed(0)} MB) — servidas pelo R2`)
