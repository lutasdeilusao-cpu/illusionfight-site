// Som da batalha do pentagrama, sintetizado na hora (Web Audio, sem arquivo).
// Cada golpe tem um timbre próprio e a batida é um compasso de 8 tempos:
// bumbo no 1 e no 5, chimbal nos outros, estalo no 8 (a troca fecha).
import { PONTOS } from './motorPentagrama'

const CHAVE_MUDO = 'ldi-pentagrama-mudo'
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
export function alternarMudo() {
  mudo = !mudo
  try { localStorage.setItem(CHAVE_MUDO, mudo ? '1' : '0') } catch { /* sem storage */ }
  if (master) master.gain.value = mudo ? 0 : 0.7
  return mudo
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
const TIMBRE_DO_PONTO = { cab: 'cabeca', maoD: 'soco', maoE: 'soco', cotD: 'cotovelo', cotE: 'cotovelo', peD: 'chute', peE: 'chute', joeD: 'joelho', joeE: 'joelho' }

export function somGolpe(ponto, quando = 0) {
  if (!ctx) return
  TIMBRES[TIMBRE_DO_PONTO[ponto]](ctx.currentTime + quando)
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

// Tique de ligar um ponto no traço: a altura sobe a cada ponto do combo.
export function somLigar(ordem, ponto) {
  if (!ctx) return
  const base = PONTOS[ponto]?.grande ? 520 : 780
  tom(ctx.currentTime, { f0: base * (1 + ordem * 0.18), dur: 0.05, vol: 0.18, tipo: 'triangle' })
}

// O ponto do inimigo acendendo, no tempo da batida.
export function somAcende() {
  if (!ctx) return
  tom(ctx.currentTime, { f0: 330, f1: 300, dur: 0.06, vol: 0.2, tipo: 'sawtooth' })
}

// Um compasso inteiro da batida, agendado de uma vez.
export function tocarCompasso(duracaoMs) {
  if (!ctx) return
  const t0 = ctx.currentTime, oitavo = duracaoMs / 8000
  for (let i = 0; i < 8; i++) {
    const t = t0 + i * oitavo
    if (i === 0 || i === 4) tom(t, { f0: 110, f1: 42, dur: 0.16, vol: i === 0 ? 0.75 : 0.55 })
    else if (i === 7) sopro(t, { dur: 0.05, vol: 0.55, filtro: 'highpass', f0: 4500 })
    else sopro(t, { dur: 0.03, vol: 0.18, filtro: 'highpass', f0: 7000 })
  }
}
