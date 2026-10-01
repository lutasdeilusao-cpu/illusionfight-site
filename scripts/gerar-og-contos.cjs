// Gera public/og/contos/<id>.jpg (1200×630) — a miniatura de compartilhamento de
// cada conto (capa do Illusion Tales + nome e chamada em inglês). Rodar de novo
// quando entrar conto novo: node scripts/gerar-og-contos.cjs
const { chromium } = require('playwright')
const fs = require('fs')
const RAIZ = require('path').join(__dirname, '..') + '/'
const capa = 'data:image/webp;base64,' + fs.readFileSync(RAIZ + 'src/assets/images/contos/capa-illusion-tales.webp').toString('base64')
const contos = JSON.parse(fs.readFileSync(RAIZ + 'src/data/historias/contos.json', 'utf8'))
const COR = { leve: '#22c55e', media: '#ffae32', pesada: '#ff0055' }
const esc = s => String(s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } })
  for (const c of contos) {
    const cor = COR[c.peso] || '#18dafb'
    await p.setContent(`<!doctype html><html><head><style>
      *{margin:0;box-sizing:border-box} body{width:1200px;height:630px;overflow:hidden;background:#05090c;font-family:'Arial Black',Impact,sans-serif;color:#eaffff;position:relative}
      .bg{position:absolute;inset:-40px;background:url(${capa}) center/cover;filter:blur(28px) brightness(.35) saturate(1.3)}
      .capa{position:absolute;left:70px;top:45px;height:540px;box-shadow:0 20px 60px rgba(0,0,0,.8);clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,0 100%)}
      .txt{position:absolute;left:510px;right:70px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:22px}
      .eye{font:700 22px 'Courier New',monospace;letter-spacing:.24em;color:#18dafb}
      h1{font-size:${c.titulo_en.length > 26 ? 58 : 72}px;line-height:.98;text-transform:uppercase;letter-spacing:.01em;text-shadow:0 4px 24px #000}
      p{font:600 28px/1.35 Arial,sans-serif;color:rgba(234,255,255,.82)}
      .fio{width:120px;height:6px;background:${cor}}
      .site{font:700 20px 'Courier New',monospace;letter-spacing:.16em;color:#ffae32}
    </style></head><body><div class="bg"></div><img class="capa" src="${capa}">
      <div class="txt"><span class="eye">ILLUSION TALES · ${esc(c.id)}</span><h1>${esc(c.titulo_en)}</h1><div class="fio"></div><p>${esc(c.tagline_en)}</p><span class="site">ILLUSIONFIGHT.COM</span></div></body></html>`)
    await p.waitForTimeout(150)
    await p.screenshot({ path: `${RAIZ}public/og/contos/${c.id}.jpg`, type: 'jpeg', quality: 86 })
    console.log(c.id, fs.statSync(`${RAIZ}public/og/contos/${c.id}.jpg`).size)
  }
  await b.close()
})()
