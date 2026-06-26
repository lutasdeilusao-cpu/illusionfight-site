import { getLinePath } from '../../animations/particles'

const KICKBACK_STEPS   = 4
const KICKBACK_DIST    = 0.25
const KICKBACK_INTERVAL = 25
const PROJ_STEPS       = 14
const PROJ_INTERVAL    = 18

export function execute({
  charId, atacante, alvo, obstaculos,
  onGetHexCenter, setAnimTimer,
  setCharVisualPos, onEmitParticles,
  setProjectile, onBalloon, onFinalize,
}) {
  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)

  const dx = targetPos.x - originPos.x
  const dy = targetPos.y - originPos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist
  const ny = dy / dist

  const recoilX = originPos.x - nx * dist * KICKBACK_DIST * 0.3
  const recoilY = originPos.y - ny * dist * KICKBACK_DIST * 0.3

  let step = 0

  function kickback() {
    step++
    const t = step / KICKBACK_STEPS
    const x = originPos.x + (recoilX - originPos.x) * t
    const y = originPos.y + (recoilY - originPos.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < KICKBACK_STEPS) {
      setAnimTimer(kickback, KICKBACK_INTERVAL)
    } else {
      step = 0
      setAnimTimer(kickReturn, KICKBACK_INTERVAL)
    }
  }

  function kickReturn() {
    step++
    const t = step / KICKBACK_STEPS
    const x = recoilX + (originPos.x - recoilX) * t
    const y = recoilY + (originPos.y - recoilY) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < KICKBACK_STEPS) {
      setAnimTimer(kickReturn, KICKBACK_INTERVAL)
    } else {
      setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
      const path = getLinePath(originPos.x, originPos.y,
        targetPos.x, targetPos.y, PROJ_STEPS)
      step = 0
      setProjectile({ x: originPos.x, y: originPos.y,
        trail: [], color: '#ffcc00', radius: 5, active: true })
      setAnimTimer(() => advanceProj(path), PROJ_INTERVAL)
    }
  }

  function advanceProj(path) {
    const point = path[step]
    if (!point) {
      setProjectile(null)
      if (onEmitParticles) {
        onEmitParticles(targetPos.x, targetPos.y, {
          count: 14, color: '#ffcc00', speed: 6, radius: 3, mode: 'radiate',
        })
        onEmitParticles(targetPos.x, targetPos.y, {
          count: 8, color: '#ffffff', speed: 3, radius: 2, mode: 'radiate',
        })
      }
      if (onBalloon) onBalloon(alvo.id, 'POW!', 'impact',
        alvo.posicao.row, alvo.posicao.col)
      if (onFinalize) onFinalize()
      return
    }
    if (onEmitParticles) {
      onEmitParticles(point.x, point.y, {
        count: 2, color: '#ffaa00', speed: 1,
        radius: 2, mode: 'trail',
        trailDir: { x: -nx, y: -ny },
      })
    }
    setProjectile(prev => prev ? {
      ...prev, x: point.x, y: point.y,
      trail: [...(prev.trail || []),
        { x: point.x, y: point.y, alpha: 0.8 }],
    } : null)
    step++
    setAnimTimer(() => advanceProj(path), PROJ_INTERVAL)
  }

  kickback()
}
