// Central juice system — screen shake, damage numbers,
// hit stop, canvas flash, floating combat text

// ─── SCREEN SHAKE ────────────────────────────────────────

/**
 * Trigger a screen shake
 * @param {Object} shakeRef — React ref holding ShakeState
 * @param {number} intensity — pixels (2=light, 6=medium, 12=heavy, 20=critical)
 * @param {number} [decay=0.85]
 */
export function triggerShake(shakeRef, intensity, decay = 0.85) {
  shakeRef.current = { intensity, decay, offsetX: 0, offsetY: 0 }
}

/**
 * Update shake each frame — call in onFrame
 * @param {Object} shakeRef
 */
export function updateShake(shakeRef) {
  const s = shakeRef.current
  if (!s || s.intensity < 0.3) {
    shakeRef.current = null
    return
  }
  s.offsetX = (Math.random() * 2 - 1) * s.intensity
  s.offsetY = (Math.random() * 2 - 1) * s.intensity
  s.intensity *= s.decay
}

/**
 * Apply shake transform to ctx — call before drawing
 * Pair with restoreShake after drawing
 */
export function applyShake(ctx, shakeRef) {
  const s = shakeRef.current
  if (!s) return
  ctx.save()
  ctx.translate(s.offsetX, s.offsetY)
}

/**
 * Restore ctx after shake transform
 */
export function restoreShake(ctx, shakeRef) {
  if (shakeRef.current) ctx.restore()
}

// Shake intensity presets
export const ShakePreset = {
  LIGHT:    { intensity: 3,  decay: 0.80 },
  MEDIUM:   { intensity: 7,  decay: 0.82 },
  HEAVY:    { intensity: 13, decay: 0.84 },
  CRITICAL: { intensity: 20, decay: 0.86 },
}

// ─── CANVAS FLASH ────────────────────────────────────────

/**
 * Trigger a full-canvas color flash
 * @param {Object} canvasFlashRef
 * @param {string} color
 * @param {number} [alpha=0.35]
 * @param {number} [decay=0.12]
 */
export function triggerCanvasFlash(canvasFlashRef, color,
  alpha = 0.35, decay = 0.12) {
  canvasFlashRef.current = { color, alpha, decay }
}

/**
 * Update canvas flash each frame
 */
export function updateCanvasFlash(canvasFlashRef) {
  const f = canvasFlashRef.current
  if (!f) return
  f.alpha -= f.decay
  if (f.alpha <= 0) canvasFlashRef.current = null
}

/**
 * Draw canvas flash overlay — call AFTER all other draw calls
 */
export function drawCanvasFlash(ctx, canvasFlashRef,
  canvasWidth, canvasHeight) {
  const f = canvasFlashRef.current
  if (!f || f.alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = f.alpha
  ctx.fillStyle = f.color
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  ctx.restore()
}

// Flash presets
export const FlashPreset = {
  NORMAL_HIT:  { color: '#ff0000', alpha: 0.20, decay: 0.08 },
  CRITICAL:    { color: '#ffffff', alpha: 0.40, decay: 0.10 },
  BLOCK:       { color: '#ffd700', alpha: 0.25, decay: 0.09 },
  MAGIC:       { color: '#00aaff', alpha: 0.20, decay: 0.08 },
  COUNTER:     { color: '#ff8800', alpha: 0.25, decay: 0.09 },
}

// ─── HIT STOP ────────────────────────────────────────────

/**
 * Trigger a hit stop — freezes animation timers briefly
 * @param {Object} hitStopRef — { active, duration, startTime }
 * @param {number} [duration=90] — milliseconds
 */
export function triggerHitStop(hitStopRef, duration = 90) {
  hitStopRef.current = {
    active: true,
    duration,
    startTime: Date.now(),
  }
}

/**
 * Check if hit stop is currently active
 */
export function isHitStopActive(hitStopRef) {
  const h = hitStopRef.current
  if (!h?.active) return false
  if (Date.now() - h.startTime >= h.duration) {
    hitStopRef.current = null
    return false
  }
  return true
}

// Hit stop duration presets
export const HitStopPreset = {
  LIGHT:    80,
  MEDIUM:   110,
  HEAVY:    150,
  CRITICAL: 200,
}

// ─── FLOATING NUMBERS & COMBAT TEXT ──────────────────────

/**
 * Spawn a floating text/number
 * @param {Object} floatingTextsRef
 * @param {number} x
 * @param {number} y
 * @param {string} text
 * @param {Object} options
 */
export function spawnFloatingText(floatingTextsRef, x, y, text, {
  color = '#ffffff',
  size = 1.0,
  vy = -1.8,
  vx = (Math.random() - 0.5) * 1.2,
  life = 55,
  weight = 'bold',
} = {}) {
  floatingTextsRef.current = [
    ...floatingTextsRef.current,
    { x, y, text, color, size, alpha: 1.0, vy, vx, life, weight },
  ]
}

/**
 * Update floating texts each frame
 */
export function updateFloatingTexts(floatingTextsRef) {
  floatingTextsRef.current = floatingTextsRef.current
    .map(t => ({
      ...t,
      x: t.x + t.vx,
      y: t.y + t.vy,
      alpha: t.alpha - (1.0 / t.life),
      life: t.life - 1,
    }))
    .filter(t => t.life > 0 && t.alpha > 0)
}

/**
 * Draw all floating texts
 */
export function drawFloatingTexts(ctx, floatingTextsRef, sz) {
  for (const t of floatingTextsRef.current) {
    ctx.save()
    ctx.globalAlpha = t.alpha
    ctx.font = `${t.weight} ${Math.round(sz * 0.4 * t.size)}px Orbitron, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = 'rgba(0,0,0,0.8)'
    ctx.lineWidth = 3
    ctx.strokeText(t.text, t.x, t.y)
    ctx.fillStyle = t.color
    ctx.fillText(t.text, t.x, t.y)
    ctx.restore()
  }
}

// Text presets
export const TextPreset = {
  DAMAGE_NORMAL:   { color: '#ffffff', size: 1.0, life: 50 },
  DAMAGE_CRITICAL: { color: '#ffcc00', size: 1.5, life: 60, vy: -2.2 },
  DAMAGE_HEAVY:    { color: '#ff4444', size: 1.3, life: 55 },
  BLOCK:           { color: '#ffd700', size: 1.1, life: 50 },
  COUNTER:         { color: '#ff8800', size: 1.2, life: 55 },
  EXTRA_HIT:       { color: '#00eeff', size: 1.2, life: 55 },
  CRITICAL_TEXT:   { color: '#ffcc00', size: 1.6, life: 65,
                     vy: -2.5, vx: 0 },
  MISS:            { color: '#888888', size: 0.9, life: 40 },
  MAGIC:           { color: '#00aaff', size: 1.1, life: 50 },
}
