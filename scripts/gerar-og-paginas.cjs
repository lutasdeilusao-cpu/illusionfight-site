// Gera public/og/<nome>.jpg (1200×630): a miniatura de compartilhamento das
// páginas principais (WEB SHARD, Histórias, Games, Gangues, Super Trunfo,
// Músicas, Autor, Home), montada com as artes do próprio produto.
// O texto é em inglês (a miniatura é uma só pros 3 idiomas).
// Rodar de novo quando trocar arte: node scripts/gerar-og-paginas.cjs
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const RAIZ = path.join(__dirname, '..') + '/'

const tipo = { webp: 'webp', png: 'png', jpg: 'jpeg' }
const img = rel => `data:image/${tipo[rel.split('.').pop()]};base64,` + fs.readFileSync(RAIZ + rel).toString('base64')
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])

const LOGO = 'src/assets/images/logos/logo-completa-en.png'
const G = 'src/pages/games/Gangues/assets/personagens/'

// layout 'arte': arte vertical recortada à esquerda; 'pagina': páginas do WEB SHARD
// em leque; 'lutadores': corpos inteiros lado a lado; 'cartas': cartas em leque.
const PAGINAS = [
  { nome: 'home', layout: 'arte', arte: 'src/assets/images/banners/banner-02.webp', fundo: 'src/assets/images/banners/banner-02.webp',
    eye: 'WEBTOON · STORIES · GAMES', titulo: 'Illusion Fight', texto: 'A Brazilian universe where the pain is 100% real. Read and play for free.', cor: '#18dafb' },
  { nome: 'webshard', layout: 'pagina', paginas: ['public/webtoon/01/en/05.webp', 'public/webtoon/01/en/12.webp', 'public/webtoon/01/en/20.webp'], fundo: 'src/assets/images/banners/banner-05.webp',
    eye: 'WEB SHARD · FREE WEBTOON', titulo: 'Read Illusion Fight', texto: 'A Brazilian action webtoon in vertical chapters. Start with chapter 1.', cor: '#ff2a3d' },
  { nome: 'historias', layout: 'arte', arte: 'src/assets/images/contos/capa-illusion-tales.webp', fundo: 'src/assets/images/contos/capa-illusion-tales.webp',
    eye: 'STORIES · READ FREE', titulo: 'Illusion Tales', texto: 'The novel and the short stories of the Illusion Fight universe.', cor: '#ffae32' },
  { nome: 'games', layout: 'arte', arte: 'src/assets/images/banners/banner-03.webp', fundo: 'src/assets/images/banners/banner-03.webp',
    eye: 'FREE BROWSER GAMES', titulo: 'Play Illusion Fight', texto: 'Street gangs, trading cards and stories you choose. No download.', cor: '#a855f4' },
  { nome: 'gangues', layout: 'lutadores', lutadores: ['trinca', 'faisca', 'fenda'], fundo: 'src/pages/games/Gangues/assets/backgrounds/parede-oficial.jpg',
    logo: 'src/pages/games/Gangues/assets/logos/logo-en.png', eye: 'FREE BROWSER RPG', titulo: 'LDI Gangs', texto: 'Found your gang, recruit fighters and take over the streets of Marelia.', cor: '#ffae32' },
  { nome: 'toptrumps', layout: 'cartas', cartas: ['card-01.png', 'card-02.png', 'card-03.png'], fundo: 'src/assets/images/banners/banner-03.webp',
    eye: 'CARD GAME · FREE', titulo: 'Illusion Fight Top Trumps', texto: 'Pick the strongest stat and beat your rival, card by card.', cor: '#18dafb' },
  { nome: 'musicas', layout: 'arte', arte: 'src/assets/images/banners/banner-04.webp', fundo: 'src/assets/images/banners/banner-04.webp',
    eye: 'RADIO NINA · MUSIC', titulo: 'The Band of Illusion Fight', texto: 'Original songs from the story, played by Kim, Jack and Nina.', cor: '#ff5fa2' },
  { nome: 'autor', layout: 'arte', arte: 'src/assets/images/banners/banner-01.webp', fundo: 'src/assets/images/banners/banner-01.webp',
    eye: 'BEHIND THE STORIES', titulo: 'Isaias Leal', texto: 'The Brazilian creator of Illusion Fight: webtoon, novel and games.', cor: '#18dafb' },
]

function miolo(p) {
  if (p.layout === 'arte') return `<img class="arte" src="${img(p.arte)}">`
  if (p.layout === 'pagina') return p.paginas.map((f, i) => `<img class="pag pag${i}" src="${img(f)}">`).join('')
  if (p.layout === 'cartas') return p.cartas.map((f, i) => `<img class="carta c${i}" src="${img('src/assets/images/cards/characters/' + f)}">`).join('')
  return p.lutadores.map((n, i) => `<img class="lut l${i}" src="${img(G + n + '/corpo-frente.webp')}">`).join('')
}

;(async () => {
  fs.mkdirSync(RAIZ + 'public/og', { recursive: true })
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
  const pg = await b.newPage({ viewport: { width: 1200, height: 630 } })
  for (const p of PAGINAS) {
    await pg.setContent(`<!doctype html><html><head><style>
      *{margin:0;box-sizing:border-box} body{width:1200px;height:630px;overflow:hidden;background:#05090c;font-family:'Arial Black',Impact,sans-serif;color:#eaffff;position:relative}
      .bg{position:absolute;inset:-40px;background:url(${img(p.fundo)}) center/cover;filter:blur(26px) brightness(.32) saturate(1.3)}
      .fx{position:absolute;inset:0;background:linear-gradient(90deg,transparent 30%,rgba(5,9,12,.75) 62%)}
      .arte{position:absolute;left:70px;top:45px;height:540px;width:360px;object-fit:cover;object-position:center 20%;box-shadow:0 20px 60px rgba(0,0,0,.8);clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%);border:2px solid ${p.cor}}
      .pag{position:absolute;height:500px;width:294px;object-fit:cover;object-position:top;box-shadow:0 18px 50px rgba(0,0,0,.85);border:2px solid #000}
      .pag0{left:30px;top:80px;transform:rotate(-7deg)} .pag1{left:115px;top:55px;z-index:2} .pag2{left:200px;top:80px;transform:rotate(7deg)}
      .carta{position:absolute;height:400px;width:270px;object-fit:cover;border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.85)}
      .c0{left:30px;top:130px;transform:rotate(-10deg)} .c1{left:120px;top:105px;z-index:2} .c2{left:210px;top:130px;transform:rotate(10deg)}
      .lut{position:absolute;bottom:-10px;height:540px;max-width:230px;object-fit:contain;object-position:bottom;filter:drop-shadow(0 12px 30px rgba(0,0,0,.9))}
      .l0{left:10px} .l1{left:140px;z-index:2;height:590px} .l2{left:270px}
      .txt{position:absolute;left:530px;right:60px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:20px}
      .logo{height:${p.logo ? 130 : 100}px;align-self:flex-start;object-fit:contain}
      .eye{font:700 22px 'Courier New',monospace;letter-spacing:.22em;color:${p.cor}}
      h1{font-size:${p.titulo.length > 20 ? 56 : 68}px;line-height:1;text-transform:uppercase;text-shadow:0 4px 24px #000}
      p{font:600 28px/1.35 Arial,sans-serif;color:rgba(234,255,255,.85)}
      .fio{width:120px;height:6px;background:${p.cor}}
      .site{font:700 20px 'Courier New',monospace;letter-spacing:.16em;color:#ffae32}
    </style></head><body><div class="bg"></div><div class="fx"></div>${miolo(p)}
      <div class="txt"><img class="logo" src="${img(p.logo || LOGO)}"><span class="eye">${esc(p.eye)}</span><h1>${esc(p.titulo)}</h1><div class="fio"></div><p>${esc(p.texto)}</p><span class="site">ILLUSIONFIGHT.COM</span></div></body></html>`)
    await pg.waitForTimeout(200)
    const out = `${RAIZ}public/og/${p.nome}.jpg`
    await pg.screenshot({ path: out, type: 'jpeg', quality: 86 })
    console.log(p.nome, fs.statSync(out).size)
  }
  await b.close()
})()
