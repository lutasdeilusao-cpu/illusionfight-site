// Som da luta rítmica: a música da luta (arquivo), os efeitos gravados (impacto,
// metal, explosão, passos — Kenney, CC0, em ./sfx) e, sintetizado na hora (Web
// Audio), a batida de reserva (quando a música não toca) e o peso grave por baixo
// de cada golpe. Efeito gravado que não carregou: fica só o sintetizado.
const CHAVE_MUDO = 'ldi-luta-mudo'
let ctx = null
let master = null
let mudo = (() => { try { return localStorage.getItem(CHAVE_MUDO) === '1' } catch { return false } })()

// Precisa nascer num toque do jogador (o navegador bloqueia áudio antes disso).
export function ligarSom() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = mudo ? 0 : 0.7
    master.connect(ctx.destination)
    carregarAmostras()
  }
  if (ctx.state === 'suspended') ctx.resume()
}

export const estaMudo = () => mudo
export function alternarMudo() {
  mudo = !mudo
  try { localStorage.setItem(CHAVE_MUDO, mudo ? '1' : '0') } catch { /* sem storage */ }
  if (master) master.gain.value = mudo ? 0 : 0.7
  if (faixa) faixa.muted = mudo
  return mudo
}

// Música da luta (arquivo). Mudo só cala: ela continua andando, porque é ela que
// marca o tempo das notas.
let faixa = null
// `adiado`: só carrega; quem chama dá o play quando a luta estiver pronta.
export function tocarMusica(url, velocidade = 1, adiado = false) {
  pararMusica()
  faixa = new Audio(url)
  faixa.preload = 'auto'
  faixa.playbackRate = velocidade
  faixa.volume = 0.6
  faixa.muted = mudo
  if (adiado) faixa.load()
  else faixa.play().catch(() => {})
  return faixa
}
export function pararMusica() {
  if (!faixa) return
  faixa.pause(); faixa.removeAttribute('src'); faixa.load(); faixa = null
}

// Efeitos gravados: cada nome tem algumas variações (soco-1, soco-2...) e cada
// toque sorteia uma, pra não soar repetido.
const ARQUIVOS_SFX = import.meta.glob('./sfx/*.mp3', { eager: true, query: '?url', import: 'default' })
const amostras = {}
let sonsCarregados = 0
// todos os efeitos já baixados e decodificados (ou desistiu de algum)?
export const sonsProntos = () => sonsCarregados >= Object.keys(ARQUIVOS_SFX).length
function carregarAmostras() {
  for (const [caminho, url] of Object.entries(ARQUIVOS_SFX)) {
    const nome = caminho.match(/([a-z]+)-\d+\.mp3$/)[1]
    fetch(url).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(buf => { (amostras[nome] ||= []).push(buf) }).catch(() => {}).finally(() => { sonsCarregados++ })
  }
}
// toca uma variação do efeito; devolve false se ainda não tem (aí entra o sintetizado)
function amostra(nome, { vol = 1, quando = 0, tom: velocidade = 1 } = {}) {
  const lista = amostras[nome]
  if (!ctx || !lista?.length) return false
  const s = ctx.createBufferSource(), g = ctx.createGain()
  s.buffer = lista[Math.floor(Math.random() * lista.length)]
  s.playbackRate.value = velocidade * (0.95 + Math.random() * 0.1)
  g.gain.value = vol
  s.connect(g).connect(master)
  s.start(ctx.currentTime + quando)
  return true
}

let ruidoCache = null
function ruido() {
  if (!ruidoCache) {
    ruidoCache = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = ruidoCache.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  return ruidoCache
}

// Peças básicas: um tom que cai de altura e um sopro de ruído filtrado.
function tom(t, { f0, f1 = f0, dur, vol, tipo = 'sine' }) {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = tipo
  o.frequency.setValueAtTime(f0, t)
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master)
  o.start(t); o.stop(t + dur + 0.02)
}
function sopro(t, { dur, vol, filtro = 'bandpass', f0, f1 = f0, q = 1 }) {
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain()
  s.buffer = ruido()
  f.type = filtro; f.Q.value = q
  f.frequency.setValueAtTime(f0, t)
  f.frequency.exponentialRampToValueAtTime(f1, t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(f).connect(g).connect(master)
  s.start(t); s.stop(t + dur + 0.02)
}

// A cara sonora de cada golpe.
const TIMBRES = {
  soco: t => { sopro(t, { dur: 0.09, vol: 0.9, f0: 1400, q: 1.2 }); tom(t, { f0: 160, f1: 70, dur: 0.12, vol: 0.8 }) },
  cotovelo: t => { sopro(t, { dur: 0.05, vol: 1, filtro: 'highpass', f0: 2600 }); tom(t, { f0: 420, f1: 180, dur: 0.06, vol: 0.5, tipo: 'triangle' }) },
  joelho: t => { tom(t, { f0: 95, f1: 38, dur: 0.28, vol: 1 }); sopro(t, { dur: 0.12, vol: 0.5, filtro: 'lowpass', f0: 500 }) },
  chute: t => { sopro(t, { dur: 0.14, vol: 0.6, f0: 380, f1: 2200, q: 2 }); tom(t + 0.1, { f0: 120, f1: 55, dur: 0.16, vol: 0.85 }) },
  cabeca: t => { tom(t, { f0: 260, f1: 140, dur: 0.18, vol: 0.6, tipo: 'triangle' }); tom(t, { f0: 175, f1: 90, dur: 0.22, vol: 0.6 }); sopro(t, { dur: 0.04, vol: 0.5, f0: 900 }) },
}

// O golpe: o efeito gravado + o grave sintetizado por baixo (dá o peso).
const GRAVADO = { soco: ['soco', 1], chute: ['pesado', 1], cabecada: ['pesado', 0.85], super: ['laser', 0.8] }
export function somGolpe(tipo, quando = 0) {
  if (!ctx) return
  const [nome, velocidade] = GRAVADO[tipo] || GRAVADO.soco
  const tocou = amostra(nome, { vol: 1.1, quando, tom: velocidade })
  if (tipo === 'cabecada') amostra('macio', { vol: 0.8, quando })
  if (tocou) tom(ctx.currentTime + quando, { f0: 120, f1: 45, dur: 0.18, vol: 0.55 })
  else TIMBRES[{ soco: 'soco', chute: 'chute', cabecada: 'cabeca', super: 'joelho' }[tipo] || 'soco'](ctx.currentTime + quando)
}

// Você tomou: soco pesado + chapa de metal (o robô) + grave.
export function somApanhou() {
  if (!ctx) return
  const t = ctx.currentTime
  if (!amostra('pesado', { vol: 1.2, tom: 0.8 })) TIMBRES.joelho(t)
  amostra('placa', { vol: 0.6 })
  tom(t, { f0: 90, f1: 35, dur: 0.3, vol: 0.8 })
}

// Nocaute: explosão grave.
export function somNocaute() {
  if (!ctx) return
  amostra('explosao', { vol: 1.3 }); amostra('estalo', { vol: 0.8, quando: 0.05 })
  tom(ctx.currentTime, { f0: 70, f1: 25, dur: 1.2, vol: 1 })
}

// Passo do lutador andando no ringue (baixinho, de fundo).
export function somPasso() { if (ctx) amostra('passo', { vol: 0.22, tom: 0.8 }) }

export function somBloqueio(duro, quando = 0) {
  if (!ctx) return
  // a mão de metal do robô batendo na sua guarda
  if (amostra('metal', { vol: duro ? 1.1 : 0.8, quando })) return
  const t = ctx.currentTime + quando
  tom(t, { f0: 950, f1: 700, dur: 0.07, vol: 0.35, tipo: 'square' })
  sopro(t, { dur: 0.06, vol: 0.7, filtro: 'highpass', f0: 3000 })
  if (duro) tom(t + 0.05, { f0: 140, f1: 60, dur: 0.12, vol: 0.7 })
}

export function somEsquiva(quando = 0) {
  if (!ctx) return
  sopro(ctx.currentTime + quando, { dur: 0.22, vol: 0.5, f0: 2500, f1: 600, q: 3 })
}

// Super carregando (a luta para): campo de força + raio subindo.
export function somPoder() {
  if (!ctx) return
  const t = ctx.currentTime
  if (amostra('carga', { vol: 1 })) { amostra('raio', { vol: 0.7, quando: 0.15, tom: 0.8 }); return }
  for (let i = 0; i < 5; i++) tom(t + i * 0.05, { f0: 1200 + i * 380, f1: 2400 + i * 300, dur: 0.25, vol: 0.18, tipo: 'triangle' })
  tom(t + 0.2, { f0: 80, f1: 30, dur: 0.7, vol: 1 })
  sopro(t + 0.2, { dur: 0.6, vol: 0.6, filtro: 'lowpass', f0: 900, f1: 200 })
}

// Super solto (a apresentação): explosão grave, mais forte quanto mais carga.
export function somSuperSolta(carga) {
  if (!ctx) return
  const t = ctx.currentTime
  if (!amostra('explosao', { vol: 0.6 + carga * 0.8 })) sopro(t, { dur: 0.6, vol: 0.6, filtro: 'lowpass', f0: 900, f1: 200 })
  amostra('raio', { vol: 0.5 * carga })
  tom(t, { f0: 80, f1: 30, dur: 0.8, vol: 0.6 + carga * 0.4 })
}

// Batida de break (boom bap de b-boy/popping): bumbo no 1 e no "e" do 3,
// CAIXA forte no 2 e no 4, chimbal em colcheia. `passo` = colcheia dentro do
// compasso (0 a 7). As notas da luta caem na caixa.
const BUMBO = [0, 5]
const CAIXA = [2, 6]
export function somBatida(passo, quando = 0) {
  if (!ctx) return
  const t = ctx.currentTime + quando
  if (BUMBO.includes(passo)) { tom(t, { f0: 150, f1: 42, dur: 0.24, vol: 1.2 }); sopro(t, { dur: 0.03, vol: 0.4, filtro: 'lowpass', f0: 900 }) }
  if (CAIXA.includes(passo)) {
    sopro(t, { dur: 0.2, vol: 1.2, f0: 1900, f1: 1100, q: 0.7 })
    sopro(t, { dur: 0.05, vol: 0.6, filtro: 'highpass', f0: 4000 })
    tom(t, { f0: 240, f1: 170, dur: 0.11, vol: 0.6, tipo: 'triangle' })
  }
  sopro(t, { dur: passo % 2 ? 0.02 : 0.035, vol: passo % 2 ? 0.07 : 0.13, filtro: 'highpass', f0: 7500 })
}
