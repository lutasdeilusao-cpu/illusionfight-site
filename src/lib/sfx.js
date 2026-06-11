/**
 * SFX — Sound Effects System
 *
 * Synthesized sounds using Web Audio API.
 * No external audio files needed — all sounds are generated in real-time.
 *
 * Usage:
 *   import { sfx } from '../lib/sfx'
 *   sfx.click()       // button click
 *   sfx.explosion()   // boom!
 *   sfx.heartbeat()   // thump-thump
 *   sfx.vs()          // dramatic VS hit
 */

const SFX_STORAGE_KEY = 'ldi-sfx-enabled'

class SFX {
  constructor() {
    this.ctx = null
    this.enabled = localStorage.getItem(SFX_STORAGE_KEY) !== 'false'
    this._heartbeatInterval = null
  }

  /** Liga ou desliga todos os sons, persiste no localStorage */
  toggle() {
    this.enabled = !this.enabled
    localStorage.setItem(SFX_STORAGE_KEY, this.enabled ? 'true' : 'false')
    if (!this.enabled) this.stopHeartbeatLoop()
    return this.enabled
  }

  /** Ativa o som (se estiver desligado) */
  on() {
    this.enabled = true
    localStorage.setItem(SFX_STORAGE_KEY, 'true')
  }

  /** Desativa o som */
  off() {
    this.enabled = false
    localStorage.setItem(SFX_STORAGE_KEY, 'false')
    this.stopHeartbeatLoop()
  }

  _getCtx() {
    if (!this.ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
    }
    // Resume if suspended (autoplay policy)
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  /** Short oscillator + gain envelope helper */
  _tone(freq, duration, type = 'sine', volume = 0.15, delay = 0) {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + duration)
  }

  /** White noise burst */
  _noise(duration, volume = 0.1, delay = 0) {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime + delay
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2000, now)
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start(now)
  }

  // ──────────────────────────────────────────────
  //  PUBLIC SOUND EFFECTS
  // ──────────────────────────────────────────────

  /** Botão genérico — clique seco */
  click() {
    this._tone(800, 0.06, 'square', 0.06)
  }

  /** Hover / navegação no menu */
  menuHover() {
    this._tone(500, 0.04, 'sine', 0.04)
  }

  /** Seleção de atributo / carta */
  select() {
    this._tone(660, 0.1, 'triangle', 0.12)
    this._tone(880, 0.12, 'sine', 0.08, 0.05)
  }

  /** Cancelar ação */
  cancel() {
    this._tone(400, 0.08, 'square', 0.06)
    this._tone(300, 0.1, 'square', 0.04, 0.04)
  }

  /** Virar carta / revelar */
  cardFlip() {
    this._noise(0.12, 0.06)
    this._tone(300, 0.08, 'sine', 0.05, 0.02)
    this._tone(500, 0.06, 'sine', 0.04, 0.06)
  }

  /** VS dramático — batida dupla */
  vs() {
    this._tone(80, 0.3, 'sine', 0.2)
    this._tone(60, 0.4, 'sine', 0.15, 0.15)
    this._noise(0.15, 0.12)
    this._noise(0.1, 0.08, 0.15)
  }

  /** Coração pulsando — 2 batidas */
  heartbeat() {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime
    // First thump
    const osc1 = ctx.createOscillator()
    const g1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(50, now)
    osc1.frequency.exponentialRampToValueAtTime(30, now + 0.15)
    g1.gain.setValueAtTime(0.25, now)
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    osc1.connect(g1).connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.2)

    // Second thump (after pause)
    const osc2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(50, now + 0.35)
    osc2.frequency.exponentialRampToValueAtTime(30, now + 0.5)
    g2.gain.setValueAtTime(0.25, now + 0.35)
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    osc2.connect(g2).connect(ctx.destination)
    osc2.start(now + 0.35)
    osc2.stop(now + 0.55)

    // Sub rumble
    this._noise(0.1, 0.05)
    this._noise(0.1, 0.05, 0.35)
  }

  /** Iniciar heartbeat em loop (chamar stopHeartbeat para parar) */
  startHeartbeatLoop() {
    this.stopHeartbeatLoop()
    const play = () => {
      this.heartbeat()
      this._heartbeatInterval = setTimeout(play, 1600)
    }
    play()
  }

  stopHeartbeatLoop() {
    if (this._heartbeatInterval) {
      clearTimeout(this._heartbeatInterval)
      this._heartbeatInterval = null
    }
  }

  /** Explosão / KABOOM */
  explosion() {
    this._noise(0.35, 0.2)
    this._tone(50, 0.4, 'sawtooth', 0.15)
    this._tone(30, 0.5, 'sine', 0.2, 0.05)
    this._tone(100, 0.15, 'square', 0.08, 0.1)
  }

  /** Vitória — arpeggio ascendente */
  win() {
    const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
    notes.forEach((f, i) => {
      this._tone(f, 0.25, 'triangle', 0.12, i * 0.12)
    })
    this._tone(1047, 0.5, 'sine', 0.1, 0.5)
  }

  /** Derrota — descendente */
  lose() {
    this._tone(400, 0.25, 'triangle', 0.1)
    this._tone(350, 0.25, 'triangle', 0.08, 0.15)
    this._tone(300, 0.25, 'triangle', 0.06, 0.3)
    this._tone(200, 0.4, 'sine', 0.08, 0.45)
  }

  /** Empate — som neutro */
  draw() {
    this._tone(440, 0.15, 'triangle', 0.1)
    this._tone(440, 0.15, 'triangle', 0.08, 0.2)
    this._tone(350, 0.2, 'sine', 0.06, 0.35)
  }

  /** Tick de contagem regressiva */
  countdownTick() {
    this._tone(1000, 0.04, 'square', 0.05)
  }

  /** Tick de timer urgente (últimos segundos) */
  timerUrgent() {
    this._tone(1200, 0.06, 'square', 0.08)
  }

  /** Escolha no Pedra-Papel-Tesoura */
  pptChoice() {
    this._tone(700, 0.08, 'triangle', 0.07)
    this._tone(900, 0.08, 'triangle', 0.05, 0.06)
  }

  /** Revelação de recompensa */
  reward() {
    this._tone(800, 0.1, 'triangle', 0.1)
    this._tone(1000, 0.1, 'triangle', 0.08, 0.08)
    this._tone(1200, 0.2, 'sine', 0.1, 0.16)
  }

  /** Notificação / achievement */
  notification() {
    this._tone(1500, 0.08, 'sine', 0.06)
    this._tone(1800, 0.1, 'sine', 0.05, 0.06)
    this._tone(2200, 0.15, 'sine', 0.04, 0.13)
  }

  /** Som de "virar página" para próximas rodadas */
  nextRound() {
    this._tone(600, 0.06, 'triangle', 0.06)
    this._tone(800, 0.08, 'sine', 0.05, 0.04)
  }

  // ──────────────────────────────────────────────
  //  BATTLE SOUND EFFECTS (5+ variantes para ataques)
  // ──────────────────────────────────────────────

  /** Ataque 1 — slash agudo */
  attackSlash() {
    this._tone(1200, 0.08, 'sawtooth', 0.08)
    this._tone(800, 0.06, 'square', 0.05, 0.03)
    this._noise(0.06, 0.04)
  }

  /** Ataque 2 — impacto pesado */
  attackHeavy() {
    this._tone(150, 0.25, 'sawtooth', 0.18)
    this._tone(100, 0.3, 'sine', 0.15, 0.05)
    this._noise(0.12, 0.12)
  }

  /** Ataque 3 — golpe rápido */
  attackQuick() {
    this._tone(600, 0.04, 'square', 0.1)
    this._tone(900, 0.05, 'triangle', 0.08, 0.02)
    this._noise(0.04, 0.06)
  }

  /** Ataque 4 — energia / poder mágico */
  attackEnergy() {
    this._tone(400, 0.15, 'sawtooth', 0.1)
    this._tone(800, 0.12, 'sine', 0.08, 0.04)
    this._tone(1200, 0.08, 'sine', 0.06, 0.08)
    this._noise(0.08, 0.06)
  }

  /** Ataque 5 — crítico / especial */
  attackCritical() {
    this._tone(200, 0.2, 'square', 0.15)
    this._tone(300, 0.15, 'sawtooth', 0.12, 0.05)
    this._tone(600, 0.1, 'triangle', 0.1, 0.1)
    this._noise(0.15, 0.15)
  }

  /** Ataque 6 — soco seco */
  attackPunch() {
    this._tone(250, 0.06, 'square', 0.12)
    this._tone(180, 0.08, 'sine', 0.1, 0.02)
    this._noise(0.04, 0.08)
  }

  /** Mensagem / notificação de chat */
  message() {
    this._tone(1000, 0.05, 'sine', 0.04)
    this._tone(1200, 0.04, 'sine', 0.03, 0.03)
  }

  /** Som de digitação (texto aparecendo) */
  typing() {
    this._tone(600, 0.02, 'triangle', 0.02)
  }
}

export const sfx = new SFX()
