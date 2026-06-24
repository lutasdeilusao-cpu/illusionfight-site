const SFX_STORAGE_KEY = 'arena-sfx-enabled'

/**
 * ArenaTestbed AudioManager v2
 *
 * Real audio files loaded from /arena/sfx/ organized by category.
 * Uses Web Audio API decodeAudioData() for preloading + AudioBufferSourceNode for playback.
 * Fallback: synthesized noise-based step sound when file unavailable.
 */
class AudioManager {
  constructor() {
    this.ctx = null
    this.enabled = localStorage.getItem(SFX_STORAGE_KEY) !== 'false'
    this._buffers = {}
    this._loaded = false
  }

  getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  async preload() {
    if (this._loaded) return
    const ctx = this.getContext()

    const files = [
      // UI
      ['click', '/arena/sfx/ui/click.wav', 'wav'],
      ['select', '/arena/sfx/ui/select.wav', 'wav'],
      ['confirm', '/arena/sfx/ui/confirm.wav', 'wav'],
      ['cancel', '/arena/sfx/ui/cancel.wav', 'wav'],
      ['toggle', '/arena/sfx/ui/toggle.wav', 'wav'],
      ['notification', '/arena/sfx/ui/notification.wav', 'wav'],
      ['error', '/arena/sfx/ui/error.wav', 'wav'],
      ['select_magic', '/arena/sfx/ui/select_magic.wav', 'wav'],
      ['notification_magic', '/arena/sfx/ui/notification_magic.wav', 'wav'],

      // Combat
      ['sword_hit', '/arena/sfx/combat/sword_hit.wav', 'wav'],
      ['sword_hit_2', '/arena/sfx/combat/sword_hit_2.wav', 'wav'],
      ['sword_swing', '/arena/sfx/combat/sword_swing.wav', 'wav'],
      ['heavy_hit', '/arena/sfx/combat/heavy_hit.wav', 'wav'],
      ['heavy_swing', '/arena/sfx/combat/heavy_swing.wav', 'wav'],
      ['dagger_hit', '/arena/sfx/combat/dagger_hit.wav', 'wav'],
      ['dagger_swing', '/arena/sfx/combat/dagger_swing.wav', 'wav'],

      // Magic
      ['explosion', '/arena/sfx/magic/explosion.ogg', 'ogg'],
      ['fireball', '/arena/sfx/magic/fireball.ogg', 'ogg'],
      ['fireball_2', '/arena/sfx/magic/fireball_2.ogg', 'ogg'],
      ['fire_buff', '/arena/sfx/magic/fire_buff.ogg', 'ogg'],
      ['fire_spray', '/arena/sfx/magic/fire_spray.ogg', 'ogg'],
      ['fire_impact', '/arena/sfx/magic/fire_impact.wav', 'wav'],
      ['fire_launch', '/arena/sfx/magic/fire_launch.wav', 'wav'],
      ['ice_barrage', '/arena/sfx/magic/ice_barrage.ogg', 'ogg'],
      ['ice_freeze', '/arena/sfx/magic/ice_freeze.ogg', 'ogg'],
      ['ice_impact', '/arena/sfx/magic/ice_impact.wav', 'wav'],
      ['ice_launch', '/arena/sfx/magic/ice_launch.wav', 'wav'],
      ['ice_throw', '/arena/sfx/magic/ice_throw.ogg', 'ogg'],
      ['meteor', '/arena/sfx/magic/meteor.ogg', 'ogg'],
      ['water_spray', '/arena/sfx/magic/water_spray.ogg', 'ogg'],
      ['spell_impact', '/arena/sfx/magic/spell_impact.ogg', 'ogg'],
      ['heal', '/arena/sfx/magic/heal.wav', 'wav'],
      ['shield', '/arena/sfx/magic/shield.wav', 'wav'],
      ['teleport', '/arena/sfx/magic/teleport.wav', 'wav'],
      ['electric_hit', '/arena/sfx/magic/electric_hit.wav', 'wav'],
      ['electric_launch', '/arena/sfx/magic/electric_launch.wav', 'wav'],

      // Phase
      ['victory', '/arena/sfx/phase/victory.wav', 'wav'],
      ['defeat', '/arena/sfx/phase/defeat.ogg', 'ogg'],
      ['turn_start', '/arena/sfx/phase/turn_start.wav', 'wav'],
      ['ia_thinking', '/arena/sfx/phase/ia_thinking.wav', 'wav'],
      ['phase_transition', '/arena/sfx/phase/phase_transition.wav', 'wav'],
      ['battle_start', '/arena/sfx/phase/battle_start.ogg', 'ogg'],

      // Item
      ['item_pickup', '/arena/sfx/item/item_pickup.wav', 'wav'],
    ]

    const results = await Promise.allSettled(
      files.map(([key, url]) =>
        fetch(url)
          .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.arrayBuffer()
          })
          .then(buf => ctx.decodeAudioData(buf))
          .then(ab => { this._buffers[key] = ab })
      )
    )

    const ok = results.filter(r => r.status === 'fulfilled').length
    const fail = results.filter(r => r.status === 'rejected').length
    if (fail > 0) {
      console.warn(`[AudioManager] ${fail}/${files.length} files failed to load (${ok} OK)`)
    }
    this._loaded = true
  }

  _play(key) {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!this._buffers[key]) return

    const src = ctx.createBufferSource()
    src.buffer = this._buffers[key]
    src.connect(ctx.destination)
    src.start(0)
  }

  _playRandom(...keys) {
    if (!this.enabled) return
    const valid = keys.filter(k => this._buffers[k])
    if (valid.length === 0) return
    const pick = valid[Math.floor(Math.random() * valid.length)]
    this._play(pick)
  }

  // ── Master toggle ──

  toggleMute() {
    this.enabled = !this.enabled
    localStorage.setItem(SFX_STORAGE_KEY, this.enabled ? 'true' : 'false')
    return this.enabled
  }

  on() { this.enabled = true; localStorage.setItem(SFX_STORAGE_KEY, 'true') }
  off() { this.enabled = false; localStorage.setItem(SFX_STORAGE_KEY, 'false') }

  isEnabled() { return this.enabled }

  // ── UI Sounds ──

  click() { this._play('click') }
  select() { this._play('select') }
  confirm() { this._play('confirm') }
  cancel() { this._play('cancel') }
  toggleSound() { this._play('toggle') }
  /** @deprecated Use toggleSound() — kept for backward compat */
  toggle() { this._play('toggle') }
  notification() { this._play('notification') }
  error() { this._play('error') }

  // ── Combat Sounds ──

  hit() { this._playRandom('sword_hit', 'sword_hit_2') }
  hitHeavy() { this._play('heavy_hit') }
  hitCritical() { this._playRandom('spell_impact', 'explosion') }
  miss() { this._play('sword_swing') }  // whoosh = miss
  block() { this._playRandom('heavy_hit', 'sword_hit') }
  counter() { this._play('dagger_hit') }
  extraHit() { this._play('dagger_swing') }
  magicShield() { this._play('shield') }

  // ── Movement ──

  step() { this._playRandom('dagger_hit', 'item_pickup') }
  teleport() { this._play('teleport') }
  slingshot() {
    if (this._buffers['bow_attack']) this._play('bow_attack')
    else this._play('fire_launch')
  }

  // ── Phase ──

  victory() { this._play('victory') }
  defeat() { this._play('defeat') }
  turnStart() { this._play('turn_start') }
  iaThinking() { this._play('ia_thinking') }
  phaseTransition() { this._play('phase_transition') }
  battleStart() { this._play('battle_start') }

  // ── Item ──

  itemUse() { this._play('item_pickup') }
  itemError() { this._play('error') }

  // ── Special ──

  powerActivate() { this._playRandom('fire_launch', 'electric_launch', 'shield') }
  jokenpoChoice() { this._play('select_magic') }
  jokenpoResult() { this._play('confirm') }
  diceTick() { this._play('click') }
  diceLand() { this._play('toggle') }
}

const audio = new AudioManager()
export { audio }
