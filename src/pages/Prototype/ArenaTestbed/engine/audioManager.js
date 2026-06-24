const SFX_STORAGE_KEY = 'arena-sfx-enabled'

/**
 * ArenaTestbed AudioManager
 *
 * Procedural sound synthesis using Web Audio API.
 * Techniques used:
 *   - Layered oscillators + noise for rich impacts
 *   - BiquadFilterNode for harmonic shaping (explosions, whooshes)
 *   - StereoPannerNode for spatial movement cues
 *   - ADSR-like envelopes via scheduled rampToValue
 *   - Random pitch variation (±varPct) for organic repetition
 *   - Arpeggios for victory/defeat/item sequences
 *
 * No external files — all sounds generated at runtime.
 */
class AudioManager {
  constructor() {
    this.ctx = null
    this.enabled = localStorage.getItem(SFX_STORAGE_KEY) !== 'false'
    this._oscCount = 0
  }

  toggle() {
    this.enabled = !this.enabled
    localStorage.setItem(SFX_STORAGE_KEY, this.enabled ? 'true' : 'false')
    return this.enabled
  }

  on() {
    this.enabled = true
    localStorage.setItem(SFX_STORAGE_KEY, 'true')
  }

  off() {
    this.enabled = false
    localStorage.setItem(SFX_STORAGE_KEY, 'false')
  }

  _getCtx() {
    if (!this.ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  /** Apply ±varPct random variation to a frequency */
  _vary(freq, varPct = 0.05) {
    return freq * (1 + (Math.random() - 0.5) * varPct * 2)
  }

  /** Single oscillator with gain envelope */
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

  /** White noise burst through optional lowpass filter */
  _noise(duration, volume = 0.1, delay = 0, filterFreq = null) {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime + delay
    const bufferSize = Math.max(1, Math.ceil(ctx.sampleRate * duration))
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    let output = source
    if (filterFreq !== null) {
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(filterFreq, now)
      source.connect(filter)
      output = filter
    }
    output.connect(gain)
    gain.connect(ctx.destination)
    source.start(now)
  }

  /** Tone with exponential frequency sweep (up or down) */
  _sweep(fromFreq, toFreq, duration, type = 'sine', volume = 0.15, delay = 0) {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(fromFreq, now)
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, toFreq), now + duration)
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + duration)
  }

  /** Two tones in quick succession (dual blip) */
  _dualTone(f1, f2, gap, duration, type = 'sine', volume = 0.12) {
    this._tone(f1, duration, type, volume)
    this._tone(f2, duration, type, volume * 0.8, gap)
  }

  /** Rapid sequence of notes (arpeggio) */
  _arpeggio(notes, noteDuration, gap, type = 'triangle', volume = 0.1) {
    notes.forEach((f, i) => {
      this._tone(f, noteDuration, type, volume, i * gap)
    })
  }

  /** Noise burst with bandpass filter — "click" layer */
  _clickNoise(volume = 0.06, filterFreq = 3000, Q = 0.5) {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime
    const dur = 0.03
    const bufferSize = Math.max(1, Math.ceil(ctx.sampleRate * dur))
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(filterFreq, now)
    filter.Q.setValueAtTime(Q, now)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start(now)
  }

  // ──────────────────────────────
  //  UI SOUNDS
  // ──────────────────────────────

  click() {
    this._tone(this._vary(800), 0.05, 'square', 0.05)
  }

  select() {
    this._dualTone(this._vary(660), this._vary(880), 0.05, 0.1, 'triangle', 0.1)
  }

  confirm() {
    this._tone(this._vary(523), 0.1, 'triangle', 0.08)
    this._tone(this._vary(659), 0.1, 'triangle', 0.07, 0.08)
    this._tone(this._vary(784), 0.12, 'sine', 0.06, 0.16)
  }

  cancel() {
    this._tone(this._vary(400), 0.08, 'square', 0.06)
    this._tone(this._vary(300), 0.12, 'square', 0.04, 0.06)
  }

  toggle() {
    this._tone(this._vary(600), 0.04, 'square', 0.04)
    this._tone(this._vary(900), 0.04, 'square', 0.03, 0.04)
  }

  notification() {
    this._tone(this._vary(1200), 0.06, 'sine', 0.05)
    this._tone(this._vary(1500), 0.08, 'sine', 0.04, 0.06)
    this._tone(this._vary(2000), 0.1, 'sine', 0.03, 0.13)
  }

  error() {
    this._tone(this._vary(300), 0.1, 'sawtooth', 0.06)
    this._tone(this._vary(250), 0.15, 'sawtooth', 0.04, 0.08)
  }

  // ──────────────────────────────
  //  COMBAT SOUNDS
  // ──────────────────────────────

  /** Light hit — quick sawtooth sweep down + noise tick */
  hit() {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime
    const basePitch = this._vary(400, 0.1)

    // Percussive body: quick downward sweep
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(basePitch, now)
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.06)
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.08)

    // Sharp noise transient on top
    this._clickNoise(0.04, 4000, 1)
  }

  /** Heavy hit — deeper sweep + filtered noise rumble */
  hitHeavy() {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime
    const basePitch = this._vary(200, 0.08)

    // Deep body
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(basePitch, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15)
    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.2)

    // Low rumble layer
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(60, now)
    osc2.frequency.exponentialRampToValueAtTime(30, now + 0.2)
    gain2.gain.setValueAtTime(0.15, now)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now)
    osc2.stop(now + 0.25)

    // Filtered noise thud
    this._noise(0.12, 0.1, 0, 800)
  }

  /** Critical hit — bright ping + heavy impact layered */
  hitCritical() {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime

    // Bright pre-ping
    const ping = ctx.createOscillator()
    const pingGain = ctx.createGain()
    ping.type = 'triangle'
    ping.frequency.setValueAtTime(this._vary(1200), now)
    ping.frequency.exponentialRampToValueAtTime(600, now + 0.12)
    pingGain.gain.setValueAtTime(0.12, now)
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
    ping.connect(pingGain)
    pingGain.connect(ctx.destination)
    ping.start(now)
    ping.stop(now + 0.12)

    this.hitHeavy()
  }

  /** Miss — short airy whoosh (filtered noise, high) */
  miss() {
    this._noise(0.08, 0.03, 0, 4000)
    this._tone(this._vary(200), 0.06, 'triangle', 0.03, 0.02)
  }

  /** Block — metallic ping (high square wave) */
  block() {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime
    const freq = this._vary(2000, 0.05)

    // Bright metallic strike
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.08)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.1)

    // Subtle low thud
    this._tone(80, 0.06, 'sine', 0.06, 0.02)
  }

  /** Counter — quick reverse sweep (up then down) */
  counter() {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime
    const freq = this._vary(300)

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(freq * 2.5, now + 0.06)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.14)
    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.16)
  }

  /** Magic shield — ethereal shimmer with vibrato-like modulation */
  magicShield() {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime

    // Rising shimmer
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(this._vary(600), now)
    osc.frequency.linearRampToValueAtTime(this._vary(1200), now + 0.2)
    osc.frequency.linearRampToValueAtTime(this._vary(800), now + 0.35)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.setValueAtTime(0.12, now + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.4)

    // Sparkle noise
    this._noise(0.12, 0.03, 0.05, 5000)
    this._noise(0.08, 0.02, 0.2, 8000)
  }

  /** Extra hit — quick double tap */
  extraHit() {
    this._tone(this._vary(500), 0.04, 'square', 0.06)
    this._tone(this._vary(400), 0.04, 'square', 0.05, 0.05)
    this._clickNoise(0.03, 3500)
  }

  // ──────────────────────────────
  //  MOVEMENT SOUNDS
  // ──────────────────────────────

  /** Footstep — soft noise burst with low thud */
  step() {
    this._noise(0.04, 0.03, 0, 1500)
    this._tone(this._vary(80, 0.15), 0.05, 'sine', 0.04)
  }

  /** Teleport — ascending whoosh + arrival pop, panned */
  teleport() {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime

    // Ascending sweep (whoosh)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.25)

    // Whoosh noise layer
    this._noise(0.2, 0.04, 0, 2000)
    this._noise(0.15, 0.03, 0, 500)

    // Arrival pop
    this._tone(800, 0.06, 'square', 0.06, 0.22)
  }

  /** Slingshot — stretch (tension) then release (snap) */
  slingshot() {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime

    // Stretching tension (slow descending)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(500, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15)
    gain.gain.setValueAtTime(0.06, now)
    gain.gain.setValueAtTime(0.08, now + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.18)

    // Release snap at end
    this._tone(this._vary(1500), 0.04, 'square', 0.07, 0.16)
    this._noise(0.04, 0.05, 0.16, 4000)
  }

  // ──────────────────────────────
  //  PHASE / EVENT SOUNDS
  // ──────────────────────────────

  /** Victory — triumphant ascending arpeggio with finale */
  victory() {
    this._arpeggio([523, 659, 784, 1047], 0.2, 0.1, 'triangle', 0.1)
    this._tone(1047, 0.5, 'sine', 0.08, 0.45)
    // Sparkle
    this._noise(0.3, 0.04, 0.4, 6000)
  }

  /** Defeat — sad descending */
  defeat() {
    this._tone(this._vary(500), 0.2, 'triangle', 0.08)
    this._tone(this._vary(420), 0.2, 'triangle', 0.06, 0.2)
    this._tone(this._vary(340), 0.25, 'triangle', 0.05, 0.4)
    this._tone(this._vary(220), 0.4, 'sine', 0.06, 0.6)
  }

  /** Turn start — attention chime */
  turnStart() {
    this._tone(this._vary(880), 0.08, 'triangle', 0.06)
    this._tone(this._vary(1100), 0.12, 'sine', 0.05, 0.06)
  }

  /** IA thinking — subtle wooden tick */
  iaThinking() {
    this._tone(this._vary(300), 0.03, 'square', 0.03)
    this._tone(this._vary(350), 0.03, 'square', 0.02, 0.04)
  }

  /** Phase transition — swipe whoosh */
  phaseTransition() {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.25)
    gain.gain.setValueAtTime(0.06, now)
    gain.gain.setValueAtTime(0.08, now + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.3)

    this._noise(0.25, 0.05, 0, 3000)
  }

  /** Battle start — dramatic hit */
  battleStart() {
    this._tone(80, 0.3, 'sine', 0.15)
    this._tone(60, 0.4, 'sine', 0.1, 0.15)
    this._noise(0.15, 0.1)
    this._noise(0.1, 0.06, 0.15)
  }

  // ──────────────────────────────
  //  ITEM SOUNDS
  // ──────────────────────────────

  /** Use item — positive glug */
  itemUse() {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(this._vary(400), now)
    osc.frequency.exponentialRampToValueAtTime(this._vary(600), now + 0.1)
    osc.frequency.exponentialRampToValueAtTime(this._vary(500), now + 0.18)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.setValueAtTime(0.1, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.22)
  }

  /** Item error — buzz */
  itemError() {
    this._tone(this._vary(200), 0.12, 'square', 0.05)
    this._tone(this._vary(150), 0.15, 'square', 0.04, 0.08)
  }

  // ──────────────────────────────
  //  SPECIAL SOUNDS
  // ──────────────────────────────

  /** Power activation — rising energy surge */
  powerActivate() {
    const ctx = this._getCtx()
    if (!ctx || !this.enabled) return
    const now = ctx.currentTime

    // Rumble ascendente
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(80, now)
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.35)
    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.4)

    // Harmonics brilhantes
    this._tone(this._vary(600), 0.12, 'triangle', 0.07, 0.08)
    this._tone(this._vary(900), 0.1, 'sine', 0.05, 0.14)
    this._tone(this._vary(1200), 0.08, 'sine', 0.04, 0.2)

    // Explosão final
    this._noise(0.12, 0.08, 0.25, 3000)
    this._tone(60, 0.3, 'sine', 0.12, 0.3)
  }

  /** Jokenpo choice reveal — drumroll-like build up */
  jokenpoChoice() {
    this._tone(this._vary(700), 0.06, 'triangle', 0.06)
    this._tone(this._vary(900), 0.06, 'triangle', 0.05, 0.07)
  }

  /** Jokenpo result — decisive hit */
  jokenpoResult() {
    this._tone(this._vary(600), 0.08, 'square', 0.08)
    this._tone(this._vary(400), 0.12, 'sine', 0.06, 0.04)
  }

  /** Dice roll tick */
  diceTick() {
    this._noise(0.03, 0.03, 0, 4000)
    this._tone(this._vary(1500), 0.02, 'square', 0.03)
  }

  /** Dice land */
  diceLand() {
    this._tone(this._vary(200), 0.06, 'square', 0.08)
    this._tone(this._vary(150), 0.1, 'sine', 0.06, 0.02)
    this._noise(0.04, 0.05)
  }

  /** Generic play by sound name (for effectsMap wiring) */
  play(name) {
    if (typeof this[name] === 'function') {
      this[name]()
    }
  }
}

export const audio = new AudioManager()
