import { getLinePath } from '../../animations/particles'

const BURST_COUNT      = 5
const BURST_INTERVAL   = 120
const KICKBACK_DIST    = 8
const KICKBACK_STEPS   = 3
const KICKBACK_INTERVAL = 20
const PROJ_STEPS       = 12
const PROJ_INTERVAL    = 16

export function execute({
  charId, atacante, alvo,
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

  let shotsFired = 0

  function fireNext() {
    if (shotsFired >= BURST_COUNT) {
      if (onFinalize) onFinalize()
      return
    }
    const isLast = shotsFired === BURST_COUNT - 1
    shotsFired++

    const recoilX = originPos.x - nx * KICKBACK_DIST
    const recoilY = originPos.y - ny * KICKBACK_DIST
    let kStep = 0

    function doKickback() {
      kStep++
      const t = kStep / KICKBACK_STEPS
      const x = originPos.x + (recoilX - originPos.x) * t
      const y = originPos.y + (recoilY - originPos.y) * t
      setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
      if (kStep < KICKBACK_STEPS) {
        setAnimTimer(doKickback, KICKBACK_INTERVAL)
      } else {
        kStep = 0
        setAnimTimer(doReturn, KICKBACK_INTERVAL)
      }
    }

    function doReturn() {
      kStep++
      const t = kStep / KICKBACK_STEPS
      const x = recoilX + (originPos.x - recoilX) * t
      const y = recoilY + (originPos.y - recoilY) * t
      setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
      if (kStep < KICKBACK_STEPS) {
        setAnimTimer(doReturn, KICKBACK_INTERVAL)
      } else {
        setCharVisualPos(prev => ({ ...prev, [charId]: originPos }))
        launchProjectile(isLast)
      }
    }

    doKickback()
  }

  function launchProjectile(isLast) {
    const path = getLinePath(originPos.x, originPos.y,
      targetPos.x, targetPos.y, PROJ_STEPS)
    let pStep = 0
    const color = isLast ? '#ff6600' : '#ffaa44'

    setProjectile({ x: originPos.x, y: originPos.y,
      trail: [], color, radius: isLast ? 6 : 4, active: true })

    function advance() {
      const point = path[pStep]
      if (!point) {
        setProjectile(null)
        if (isLast) {
          if (onEmitParticles) {
            onEmitParticles(targetPos.x, targetPos.y, {
              count: 16, color: '#ff6600', speed: 7,
              radius: 4, mode: 'radiate',
            })
            onEmitParticles(targetPos.x, targetPos.y, {
              count: 10, color: '#ffffff', speed: 3,
              radius: 2, mode: 'radiate',
            })
          }
          if (onBalloon) onBalloon(alvo.id, 'KABOOM!', 'impact',
            alvo.posicao.row, alvo.posicao.col)
        }
        setAnimTimer(fireNext, isLast ? 0 : BURST_INTERVAL)
        return
      }
      if (onEmitParticles) {
        onEmitParticles(point.x, point.y, {
          count: 1, color, speed: 0.5,
          radius: 2, mode: 'trail',
          trailDir: { x: -nx, y: -ny },
        })
      }
      setProjectile(prev => prev ? {
        ...prev, x: point.x, y: point.y,
        trail: [...(prev.trail || []),
          { x: point.x, y: point.y, alpha: 0.7 }],
      } : null)
      pStep++
      setAnimTimer(advance, PROJ_INTERVAL)
    }

    advance()
  }

  fireNext()
}
