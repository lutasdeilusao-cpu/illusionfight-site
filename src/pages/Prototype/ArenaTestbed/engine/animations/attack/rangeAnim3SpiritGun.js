import { getLinePath } from '../../animations/particles'

const CHARGE_FRAMES    = 16
const CHARGE_INTERVAL  = 32
const RECOIL_STEPS     = 8
const RECOIL_INTERVAL  = 30
const PROJ_STEPS       = 10
const PROJ_INTERVAL    = 16
const RETURN_STEPS     = 5
const RETURN_INTERVAL  = 22

export function execute({
  charId, atacante, alvo,
  onGetHexCenter, setAnimTimer,
  setCharVisualPos, onEmitParticles,
  setProjectile, setKiBall, onBalloon, onFinalize,
}) {
  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)

  const dx = targetPos.x - originPos.x
  const dy = targetPos.y - originPos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist
  const ny = dy / dist

  const ballStartX = originPos.x + nx * 20
  const ballStartY = originPos.y + ny * 20

  const recoilX = originPos.x - nx * dist * 0.25
  const recoilY = originPos.y - ny * dist * 0.25

  let chargeStep = 0

  if (setKiBall) setKiBall({ x: ballStartX, y: ballStartY,
    active: true, radius: 2 })

  function charge() {
    chargeStep++
    const progress = chargeStep / CHARGE_FRAMES
    const radius = 2 + progress * 16

    if (setKiBall) setKiBall({ x: ballStartX, y: ballStartY,
      active: true, radius })

    if (onEmitParticles) {
      const angle = chargeStep * 0.4
      onEmitParticles(
        ballStartX + Math.cos(angle) * radius * 1.3,
        ballStartY + Math.sin(angle) * radius * 1.3,
        { count: 2, color: '#88ffff', speed: 1.5,
          radius: 2, mode: 'radiate' }
      )
    }

    const t = Math.min(1, chargeStep / RECOIL_STEPS)
    const cx = originPos.x + (recoilX - originPos.x) * t
    const cy = originPos.y + (recoilY - originPos.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x: cx, y: cy } }))

    if (chargeStep < CHARGE_FRAMES) {
      setAnimTimer(charge, CHARGE_INTERVAL)
    } else {
      if (setKiBall) setKiBall(null)
      const path = getLinePath(ballStartX, ballStartY,
        targetPos.x, targetPos.y, PROJ_STEPS)
      let pStep = 0

      setProjectile({ x: ballStartX, y: ballStartY,
        trail: [], color: '#00eeff', radius: 18, active: true })

      function advance() {
        const point = path[pStep]
        if (!point) {
          setProjectile(null)
          if (onEmitParticles) {
            onEmitParticles(targetPos.x, targetPos.y, {
              count: 20, color: '#00eeff', speed: 8,
              radius: 5, mode: 'radiate',
            })
            onEmitParticles(targetPos.x, targetPos.y, {
              count: 12, color: '#ffffff', speed: 4,
              radius: 3, mode: 'radiate',
            })
          }
          if (onBalloon) onBalloon(alvo.id, 'SPIRIT GUN!', 'impact',
            alvo.posicao.row, alvo.posicao.col)
          let rStep = 0
          setAnimTimer(returnFn, 80)

          function returnFn() {
            rStep++
            const t = rStep / RETURN_STEPS
            const x = recoilX + (originPos.x - recoilX) * t
            const y = recoilY + (originPos.y - recoilY) * t
            setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
            if (rStep < RETURN_STEPS) {
              setAnimTimer(returnFn, RETURN_INTERVAL)
            } else {
              setCharVisualPos(prev => {
                const n = { ...prev }; delete n[charId]; return n
              })
              if (onFinalize) onFinalize()
            }
          }
          return
        }
        if (onEmitParticles) {
          onEmitParticles(point.x, point.y, {
            count: 3, color: '#00eeff', speed: 1.5,
            radius: 3, mode: 'trail',
            trailDir: { x: -nx, y: -ny },
          })
        }
        setProjectile(prev => prev ? {
          ...prev, x: point.x, y: point.y,
          trail: [...(prev.trail || []),
            { x: point.x, y: point.y, alpha: 0.9 }],
        } : null)
        pStep++
        setAnimTimer(advance, PROJ_INTERVAL)
      }

      setAnimTimer(advance, PROJ_INTERVAL)
    }
  }

  charge()
}
