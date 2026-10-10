/* Artes de divulgação do press kit: cada jogo, o WEB SHARD e o universo em
   3 formatos (16:9 thumbnail, 4:5 feed, 9:16 stories) e 3 idiomas, montadas
   com as artes oficiais e fotografadas pelo Chromium. Saem em
   scripts/presskit/artes/ e o gerar-presskit.cjs põe no .zip.
   Rodar de novo quando arte, nome ou texto mudar:
   CHROMIUM_PATH=/opt/pw-browsers/chromium node scripts/presskit/gerar-artes.cjs */
const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const RAIZ = path.join(__dirname, '../..')
const SAIDA = path.join(__dirname, 'artes')
const BASE = 'http://kit.local/'
const IDIOMAS = ['pt', 'en', 'es']
const FORMATOS = { '16x9': [1920, 1080], '4x5': [1080, 1350], '9x16': [1080, 1920] }

const i18n = l => JSON.parse(fs.readFileSync(path.join(RAIZ, `src/i18n/core/${l}.json`), 'utf8')).site.games
const creators = l => JSON.parse(fs.readFileSync(path.join(RAIZ, `src/i18n/creators/${l}.json`), 'utf8')).creators

const SELO = { pt: 'Grátis · no navegador', en: 'Free · in your browser', es: 'Gratis · en el navegador' }
const UNIVERSO = {
  pt: ['Livros · Webtoon · Jogos · Música', 'Season 1 · 15.11.2026'],
  en: ['Books · Webtoon · Games · Music', 'Season 1 · 11.15.2026'],
  es: ['Libros · Webtoon · Juegos · Música', 'Season 1 · 15.11.2026'],
}
const WEBSHARD = { pt: 'Webtoon grátis em português, inglês e espanhol', en: 'Free webtoon in English, Portuguese and Spanish', es: 'Webtoon gratis en español, portugués e inglés' }

const PONTOS = [[150, 30], [266, 114], [34, 114], [222, 252], [78, 252], [208, 132], [92, 132], [186, 201], [114, 201]]
const ESTRELA = '150,30 222,252 34,114 266,114 78,252 150,30'
const VEIA_COR = ['#18dafb', '#ff0055', '#ffae32', '#22c55e', '#a855f4']
const VEIA_ICONE = ['⌁', '✊', '◉', '❝', '≋']

const f = p => BASE + p
const LUTADORES = ['mira', 'navalha', 'trinca', 'marreta', 'muro']

const CSS = `
@font-face { font-family: 'Ethnocentric'; src: url('${f('public/fonts/Ethnocentric-Regular.otf')}'); }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: var(--w); height: var(--h); overflow: hidden; background: #0b0d0f; color: #eaffff; font-family: 'IBM Plex Sans', sans-serif; }
.arte { position: relative; width: 100%; height: 100%; overflow: hidden; display: grid; }
.fundo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.moldura { position: absolute; inset: calc(var(--u) * 2.2); border: 2px solid rgb(24 218 251 / .35); pointer-events: none;
  clip-path: polygon(0 0, calc(100% - var(--u) * 4) 0, 100% calc(var(--u) * 4), 100% 100%, 0 100%); }
.rodape { position: absolute; left: calc(var(--u) * 4.5); right: calc(var(--u) * 4.5); bottom: calc(var(--u) * 4); display: flex; align-items: center; justify-content: space-between; gap: 20px; z-index: 5; }
.rodape img { height: calc(var(--u) * 5.5); width: auto; }
.url { font: 700 calc(var(--u) * 2.1) 'JetBrains Mono', monospace; letter-spacing: .14em; text-transform: uppercase; color: #18dafb; }
.selo { display: inline-block; padding: calc(var(--u) * .9) calc(var(--u) * 2); font: 700 calc(var(--u) * 2) 'JetBrains Mono', monospace; letter-spacing: .16em; text-transform: uppercase;
  color: #0b0d0f; background: #ffae32; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
.texto { position: relative; z-index: 4; display: grid; gap: calc(var(--u) * 2.4); align-content: center; }
.nome { font: 900 calc(var(--u) * 7.5)/1.05 'Ethnocentric', sans-serif; text-transform: uppercase; letter-spacing: .03em; }
.desc { font: 500 calc(var(--u) * 2.8)/1.45 'IBM Plex Sans', sans-serif; color: #c8d4d8; max-width: 30em; }
.chips { display: flex; flex-wrap: wrap; gap: calc(var(--u) * 1.2); }
.chips span { padding: calc(var(--u) * .7) calc(var(--u) * 1.6); font: 700 calc(var(--u) * 1.8) 'JetBrains Mono', monospace; letter-spacing: .1em; text-transform: uppercase; color: var(--c, #ffae32); border: 2px solid var(--c, #ffae32); }
/* horizontal: arte à direita, texto à esquerda; vertical: arte em cima, texto embaixo */
.h .texto { position: absolute; left: calc(var(--u) * 6); top: 0; bottom: calc(var(--u) * 10); width: 40%; justify-items: start; }
.selo { justify-self: start; }
.v .selo { justify-self: center; }
.v .texto { position: absolute; left: calc(var(--u) * 6); right: calc(var(--u) * 6); bottom: calc(var(--u) * 12); justify-items: center; text-align: center; }
.v .chips { justify-content: center; }
.veu-h { position: absolute; inset: 0; background: linear-gradient(90deg, #0b0d0f 30%, rgb(11 13 15 / .75) 50%, transparent 75%); z-index: 2; }
.veu-v { position: absolute; inset: 0; background: linear-gradient(to top, #0b0d0f 30%, rgb(11 13 15 / .85) 45%, transparent 65%); z-index: 2; }
/* Gangues */
.lutadores { position: absolute; display: flex; align-items: flex-end; justify-content: center; z-index: 3; }
.lutadores img { height: 100%; width: auto; margin: 0 -5%; image-rendering: pixelated; filter: drop-shadow(0 18px 30px rgb(0 0 0 / .7)); }
.lutadores img:nth-child(3) { height: 108%; position: relative; z-index: 2; }
.lutadores img:nth-child(2), .lutadores img:nth-child(4) { height: 100%; position: relative; z-index: 1; }
.lutadores img:nth-child(1), .lutadores img:nth-child(5) { height: 90%; filter: brightness(.75) drop-shadow(0 18px 30px rgb(0 0 0 / .7)); }
.h .lutadores { right: -3%; bottom: 9%; width: 52%; height: 76%; }
.v .lutadores { left: 0; right: 0; top: 8%; height: 52%; }
.f9x16 .lutadores { top: 16%; height: 40%; }
.h .lutadores img:nth-child(1) { display: none; }
.f9x16 .paginas { top: 8%; height: 58%; }
.logo-gangues { width: 100%; max-width: calc(var(--u) * 60); height: auto; filter: drop-shadow(0 6px 18px rgb(0 0 0 / .8)); }
/* Lendas */
.pentagrama { position: absolute; z-index: 3; overflow: visible; }
.pentagrama polyline { fill: none; stroke: rgb(255 0 85 / .7); stroke-width: 2.5; filter: drop-shadow(0 0 8px #ff0055); }
.pentagrama circle { fill: #0b0d0f; stroke: #18dafb; stroke-width: 3; }
.pentagrama circle.aceso { fill: #18dafb; filter: drop-shadow(0 0 10px #18dafb); }
.pentagrama circle.centro { stroke: #22c55e; }
.h .pentagrama { right: 8%; top: 12%; height: 70%; }
.v .pentagrama { left: 50%; top: 9%; height: 42%; transform: translateX(-50%); }
.lendas .nome { color: #ff0055; text-shadow: 0 0 30px rgb(255 0 85 / .55); }
/* Super Trunfo */
.leque { position: absolute; z-index: 3; }
.leque img { position: absolute; left: 50%; bottom: 0; width: 34%; aspect-ratio: 3 / 4; object-fit: cover; border: 3px solid rgb(24 218 251 / .6); box-shadow: 0 16px 34px rgb(0 0 0 / .6); transform-origin: 50% 120%; }
.leque img:nth-child(1) { transform: translateX(-50%) rotate(-22deg) translateX(-38%); }
.leque img:nth-child(2) { transform: translateX(-50%) rotate(-11deg) translateX(-18%); }
.leque img:nth-child(3) { transform: translateX(-50%); z-index: 2; }
.leque img:nth-child(4) { transform: translateX(-50%) rotate(11deg) translateX(18%); }
.leque img:nth-child(5) { transform: translateX(-50%) rotate(22deg) translateX(38%); }
.h .leque { right: 3%; top: 14%; width: 52%; height: 64%; }
.v .leque { left: 5%; right: 5%; top: 9%; height: 42%; }
.trunfo .nome { color: #18dafb; text-shadow: 0 0 30px rgb(24 218 251 / .45); }
/* WEB SHARD */
.paginas { position: absolute; z-index: 3; }
.paginas img { position: absolute; top: 0; height: 100%; width: auto; aspect-ratio: 960 / 1637; object-fit: cover; object-position: top; border: 3px solid rgb(234 255 255 / .25); box-shadow: 0 18px 40px rgb(0 0 0 / .7); }
.paginas img:nth-child(1) { left: 0; transform: rotate(-6deg) scale(.88); filter: brightness(.7); }
.paginas img:nth-child(2) { left: 50%; transform: translateX(-50%); z-index: 2; }
.paginas img:nth-child(3) { right: 0; transform: rotate(6deg) scale(.88); filter: brightness(.7); }
.h .paginas { right: 4%; top: 7%; width: 50%; height: 80%; }
.v .paginas { left: 6%; right: 6%; top: 6%; height: 52%; }
.webshard .nome { color: #eaffff; }
/* Universo */
.universo .fundo { object-position: 50% 22%; filter: brightness(.8); }
.h.universo .fundo { left: auto; right: 0; width: 58%; object-position: 50% 30%; }
.logo-if { width: 100%; max-width: calc(var(--u) * 62); height: auto; filter: drop-shadow(0 6px 20px rgb(0 0 0 / .85)); }
.v .lutadores, .v .leque, .v .paginas { }
`

function pagina(fmt, corpo) {
  const [w, h] = FORMATOS[fmt]
  const u = Math.min(w, h) / 100
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@700&display=block" rel="stylesheet">
<style>:root{--w:${w}px;--h:${h}px;--u:${u}px}${CSS}</style></head><body class="f${fmt}">${corpo}</body></html>`
}

function rodape(l) {
  return `<div class="moldura"></div><div class="rodape"><span class="url">illusionfight.com</span><img src="${f(`src/assets/images/logos/logo-completa-${l}.png`)}" alt=""></div>`
}

const ARTES = {
  gangues: (l, o) => {
    const g = i18n(l).vitrine
    return `<div class="arte ${o}"><img class="fundo" src="${f('src/pages/games/Gangues/assets/backgrounds/parede-oficial.jpg')}" style="filter:brightness(.5) saturate(.9)">
<div class="lutadores">${LUTADORES.map(n => `<img src="${f(`src/pages/games/Gangues/assets/personagens/${n}/corpo-frente.webp`)}">`).join('')}</div>
<div class="veu-${o}"></div>
<div class="texto"><img class="logo-gangues" src="${f(`src/pages/games/Gangues/assets/logos/logo-${l}.png`)}"><p class="desc">${g.gangues}</p>
<div class="chips"><span>${g.gangues_tag1}</span><span>${g.gangues_tag2}</span><span>${g.gangues_tag3}</span></div><span class="selo">${SELO[l]}</span></div>${rodape(l)}</div>`
  },
  lendas: (l, o) => {
    const g = i18n(l)
    return `<div class="arte lendas ${o}" style="background:radial-gradient(70% 60% at ${o === 'h' ? '72% 45%' : '50% 30%'}, rgb(255 0 85 / .22), transparent 70%), #111416">
<svg class="pentagrama" viewBox="0 -10 300 290"><polyline points="${ESTRELA}"/>${PONTOS.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i < 5 ? 13 : 8}" class="${i === 0 || i === 6 ? 'aceso' : ''}"/>`).join('')}<circle class="centro" cx="150" cy="150" r="10"/></svg>
<div class="texto"><span class="nome">${g.nomes.ldi}</span><p class="desc">${g.vitrine.lendas}</p>
<div class="chips">${[1, 2, 3, 4, 5].map(i => `<span style="--c:${VEIA_COR[i - 1]}">${VEIA_ICONE[i - 1]} ${g.vitrine.veias[i]}</span>`).join('')}</div><span class="selo">${SELO[l]}</span></div>${rodape(l)}</div>`
  },
  trunfo: (l, o) => {
    const g = i18n(l)
    return `<div class="arte trunfo ${o}" style="background:radial-gradient(80% 60% at ${o === 'h' ? '72% 40%' : '50% 25%'}, rgb(24 218 251 / .16), transparent 70%), #111416">
<div class="leque">${[1, 4, 9, 14, 20].map(n => `<img src="${f(`src/assets/images/cards/characters/card-${String(n).padStart(2, '0')}.png`)}">`).join('')}</div>
<div class="texto"><span class="nome">${g.nomes.trumps}</span><p class="desc">${g.vitrine.trunfo}</p>
<div class="chips"><span>${g.vitrine.trunfo_tag1}</span><span>${g.vitrine.trunfo_tag2}</span></div><span class="selo">${SELO[l]}</span></div>${rodape(l)}</div>`
  },
  webshard: (l, o) => `<div class="arte webshard ${o}" style="background:radial-gradient(80% 60% at ${o === 'h' ? '72% 40%' : '50% 25%'}, rgb(255 174 50 / .12), transparent 70%), #111416">
<div class="paginas">${['02', '01', '03'].map(c => `<img src="${f(`public/webtoon/${c}/${l}/01.webp`)}">`).join('')}</div>
<div class="texto"><span class="nome">WEB SHARD</span><p class="desc">${creators(l).webtoon.pratos.webshard.desc}</p>
<div class="chips"><span>${creators(l).livros.pratos.lutas.nome}</span><span>${WEBSHARD[l]}</span></div></div>${rodape(l)}</div>`,
  universo: (l, o) => `<div class="arte universo ${o}"><img class="fundo" src="${f('src/assets/images/banners/banner-02.webp')}"><div class="veu-${o}"></div>
<div class="texto"><img class="logo-if" src="${f(`src/assets/images/logos/logo-completa-${l}.png`)}"><p class="desc">${creators(l).ficha.descricao}</p>
<div class="chips"><span>${UNIVERSO[l][0]}</span></div><span class="selo">${UNIVERSO[l][1]}</span></div>
<div class="moldura"></div><div class="rodape"><span class="url">illusionfight.com</span></div></div>`,
}

;(async () => {
  fs.mkdirSync(SAIDA, { recursive: true })
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' })
  let n = 0
  for (const [fmt, [w, h]] of Object.entries(FORMATOS)) {
    const p = await b.newPage({ viewport: { width: w, height: h } })
    await p.route(`${BASE}**`, r => {
      const rel = decodeURIComponent(r.request().url().slice(BASE.length))
      if (rel === 'kit.html') return r.fulfill({ body: p.__html, contentType: 'text/html' })
      r.fulfill({ path: path.join(RAIZ, rel) })
    })
    const o = w > h ? 'h' : 'v'
    for (const [id, montar] of Object.entries(ARTES)) {
      for (const l of IDIOMAS) {
        p.__html = pagina(fmt, montar(l, o))
        await p.goto(`${BASE}kit.html`, { waitUntil: 'networkidle' })
        await p.evaluate(() => document.fonts.ready)
        await p.screenshot({ path: path.join(SAIDA, `${id}-${fmt}-${l}.jpg`), type: 'jpeg', quality: 88 })
        n++
      }
    }
    await p.close()
  }
  await b.close()
  console.log(`[presskit] ${n} artes em scripts/presskit/artes/`)
})()
