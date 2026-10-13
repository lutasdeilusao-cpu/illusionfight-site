// Som da luta rítmica: a música da luta (arquivo) e, sintetizado na hora (Web
// Audio), a batida de reserva (quando a música não toca) e a cara sonora de cada golpe.
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
  }
  if (ctx.state === 'suspended') ctx.resume()
}

export const estaMudo = () => mudo
// Atraso entre o áudio sair do código e chegar no ouvido (alto-falante, fone), em ms.
export const latenciaSom = () => ((ctx && (ctx.outputLatency || ctx.baseLatency)) || 0) * 1000
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
export function tocarMusica(url, velocidade = 1) {
  pararMusica()
  faixa = new Audio(url)
  faixa.preload = 'auto'
  faixa.playbackRate = velocidade
  faixa.volume = 0.6
  faixa.muted = mudo
  faixa.play().catch(() => {})
  return faixa
}
export function pararMusica() {
  if (!faixa) return
  faixa.pause(); faixa.removeAttribute('src'); faixa.load(); faixa = null
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

export function somGolpe(tipo, quando = 0) {
  if (!ctx) return
  TIMBRES[{ soco: 'soco', chute: 'chute', cabecada: 'cabeca', super: 'joelho' }[tipo] || 'soco'](ctx.currentTime + quando)
}

export function somBloqueio(duro, quando = 0) {
  if (!ctx) return
  const t = ctx.currentTime + quando
  tom(t, { f0: 950, f1: 700, dur: 0.07, vol: 0.35, tipo: 'square' })
  sopro(t, { dur: 0.06, vol: 0.7, filtro: 'highpass', f0: 3000 })
  if (duro) tom(t + 0.05, { f0: 140, f1: 60, dur: 0.12, vol: 0.7 })
}

export function somEsquiva(quando = 0) {
  if (!ctx) return
  sopro(ctx.currentTime + quando, { dur: 0.22, vol: 0.5, f0: 2500, f1: 600, q: 3 })
}

export function somPoder() {
  if (!ctx) return
  const t = ctx.currentTime
  for (let i = 0; i < 5; i++) tom(t + i * 0.05, { f0: 1200 + i * 380, f1: 2400 + i * 300, dur: 0.25, vol: 0.18, tipo: 'triangle' })
  tom(t + 0.2, { f0: 80, f1: 30, dur: 0.7, vol: 1 })
  sopro(t + 0.2, { dur: 0.6, vol: 0.6, filtro: 'lowpass', f0: 900, f1: 200 })
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
