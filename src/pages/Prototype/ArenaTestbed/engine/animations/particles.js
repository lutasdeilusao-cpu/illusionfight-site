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
