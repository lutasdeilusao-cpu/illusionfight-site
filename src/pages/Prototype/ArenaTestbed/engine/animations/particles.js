/**
 * Particle system — shared across all animations
 */

export function emitBurst(setParticles, x, y, {
  count = 8,
  color = '#ffffff',
  speed = 3,
  radius = 3,
  mode = 'radiate',
  trailDir = null,
} = {}) {
  const newParticles = []
  for (let i = 0; i < count; i++) {
    let vx, vy
    if (mode === 'radiate') {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3
      vx = Math.cos(angle) * speed * (0.7 + Math.random() * 0.6)
      vy = Math.sin(angle) * speed * (0.7 + Math.random() * 0.6)
    } else if (mode === 'converge') {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3
      vx = -Math.cos(angle) * speed * (0.7 + Math.random() * 0.6)
      vy = -Math.sin(angle) * speed * (0.7 + Math.random() * 0.6)
    } else if (mode === 'trail' && trailDir) {
      const perp = { x: -trailDir.y, y: trailDir.x }
      const side = Math.random() > 0.5 ? 1 : -1
      vx = perp.x * side * speed * Math.random() - trailDir.x * speed * 0.3
      vy = perp.y * side * speed * Math.random() - trailDir.y * speed * 0.3
    }
    newParticles.push({ x, y, vx, vy, alpha: 1.0, radius, color })
  }
  setParticles(prev => [...prev, ...newParticles])
}

export function updateParticles(particles, decay = 0.06) {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      alpha: p.alpha - decay,
      vx: p.vx * 0.92,
      vy: p.vy * 0.92,
    }))
    .filter(p => p.alpha > 0)
}

/**
 * Draw a ki ball with spikes and glow
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} frameCount — for spike animation
 */
export function drawKiBall(ctx, x, y, frameCount) {
  const SPIKE_COUNT = 8
  const BASE_RADIUS = 6
  const MIN_SPIKE = 4
  const MAX_SPIKE = 10

  ctx.save()
  ctx.shadowBlur = 20
  ctx.shadowColor = '#ffff00'

  // glow ring
  ctx.beginPath()
  ctx.arc(x, y, BASE_RADIUS * 1.8, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,100,0.15)'
  ctx.fill()

  // spikes
  ctx.beginPath()
  for (let i = 0; i < SPIKE_COUNT; i++) {
    const angle = (Math.PI * 2 / SPIKE_COUNT) * i
      + (frameCount * 0.08)
    const spikeLen = MIN_SPIKE
      + Math.random() * (MAX_SPIKE - MIN_SPIKE)
    const innerX = x + Math.cos(angle) * BASE_RADIUS
    const innerY = y + Math.sin(angle) * BASE_RADIUS
    const outerX = x + Math.cos(angle) * (BASE_RADIUS + spikeLen)
    const outerY = y + Math.sin(angle) * (BASE_RADIUS + spikeLen)
    ctx.moveTo(innerX, innerY)
    ctx.lineTo(outerX, outerY)
  }
  ctx.strokeStyle = '#ffff44'
  ctx.lineWidth = 2
  ctx.stroke()

  // core
  ctx.beginPath()
  ctx.arc(x, y, BASE_RADIUS, 0, Math.PI * 2)
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, BASE_RADIUS)
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(0.5, '#ffff88')
  gradient.addColorStop(1, '#ffaa00')
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.restore()
}

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, p.alpha)
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fillStyle = p.color
    ctx.fill()
    ctx.restore()
  }
}

/**
 * Draw a projectile with trail
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} projectile — { x, y, trail, color, radius }
 */
export function drawProjectile(ctx, projectile) {
  if (!projectile?.active) return

  for (const t of projectile.trail || []) {
    ctx.save()
    ctx.globalAlpha = t.alpha * 0.6
    ctx.beginPath()
    ctx.arc(t.x, t.y, (projectile.radius || 5) * 0.6, 0, Math.PI * 2)
    ctx.fillStyle = projectile.color || '#ffcc00'
    ctx.fill()
    ctx.restore()
  }

  ctx.save()
  ctx.shadowBlur = 16
  ctx.shadowColor = projectile.color || '#ffcc00'
  ctx.beginPath()
  ctx.arc(projectile.x, projectile.y, projectile.radius || 5, 0, Math.PI * 2)
  const grad = ctx.createRadialGradient(
    projectile.x, projectile.y, 0,
    projectile.x, projectile.y, projectile.radius || 5
  )
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.5, projectile.color || '#ffcc00')
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()
}

/**
 * Get straight line points between two canvas positions
 * @param {number} x1 @param {number} y1
 * @param {number} x2 @param {number} y2
 * @param {number} steps
 * @returns {Array<{x,y}>}
 */
export function getLinePath(x1, y1, x2, y2, steps) {
  const points = []
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    points.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t })
  }
  return points
}
