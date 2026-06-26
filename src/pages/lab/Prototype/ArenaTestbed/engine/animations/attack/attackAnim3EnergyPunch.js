// Attack animation — EnergyPunch
// Ki ball aparece, personagem recua carregando, ki ball pulsa, ambos disparam, impacto, volta

const RECOIL_STEPS = 5
const RECOIL_INTERVAL = 35
const CHARGE_FRAMES = 10
const CHARGE_INTERVAL = 30
const PUNCH_STEPS = 7
const PUNCH_INTERVAL = 20
const RETURN_STEPS = 5
const RETURN_INTERVAL = 22
const ONOMATOPEIAS = ['POW!', 'KABOOM!', 'CRASH!', 'WHAM!', 'SMASH!']

export function execute({
  charId, atacante, alvo,
  onGetHexCenter, setAnimTimer,
  setCharVisualPos, onEmitParticles,
  setKiBall, onBalloon, onFinalize,
}) {
  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)

  const dx = targetPos.x - originPos.x
  const dy = targetPos.y - originPos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist
  const ny = dy / dist

  // ki ball starts 0.4 cells ahead of attacker
  const kiBallOffset = dist * 0.15
  let kiBallX = originPos.x + nx * kiBallOffset
  let kiBallY = originPos.y + ny * kiBallOffset

  const recoilDist = dist * 0.3
  const recoilX = originPos.x - nx * recoilDist
  const recoilY = originPos.y - ny * recoilDist

  let step = 0

  if (setKiBall) setKiBall({ x: kiBallX, y: kiBallY, active: true })

  function recoil() {
    step++
    const t = step / RECOIL_STEPS
    const x = originPos.x + (recoilX - originPos.x) * t
    const y = originPos.y + (recoilY - originPos.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < RECOIL_STEPS) {
      setAnimTimer(recoil, RECOIL_INTERVAL)
    } else {
      step = 0
      setAnimTimer(charge, CHARGE_INTERVAL)
    }
  }

  function charge() {
    step++
    if (onEmitParticles) {
      const orbitAngle = (step / CHARGE_FRAMES) * Math.PI * 2
      const orbitR = 8
      onEmitParticles(
        kiBallX + Math.cos(orbitAngle) * orbitR,
        kiBallY + Math.sin(orbitAngle) * orbitR,
        { count: 2, color: '#ffffff', speed: 1, radius: 2, mode: 'radiate' }
      )
    }
    if (step < CHARGE_FRAMES) {
      setAnimTimer(charge, CHARGE_INTERVAL)
    } else {
      step = 0
      setAnimTimer(punch, PUNCH_INTERVAL)
    }
  }

  function punch() {
    step++
    const t = step / PUNCH_STEPS
    const charX = recoilX + (targetPos.x - recoilX) * t
    const charY = recoilY + (targetPos.y - recoilY) * t
    kiBallX = kiBallX + (targetPos.x - kiBallX) * (t + 0.1)
    kiBallY = kiBallY + (targetPos.y - kiBallY) * (t + 0.1)
    setCharVisualPos(prev => ({ ...prev, [charId]: { x: charX, y: charY } }))
    if (setKiBall) setKiBall({ x: kiBallX, y: kiBallY, active: true })
    if (step < PUNCH_STEPS) {
      setAnimTimer(punch, PUNCH_INTERVAL)
    } else {
      // explosion
      if (setKiBall) setKiBall(null)
      if (onEmitParticles) {
        onEmitParticles(targetPos.x, targetPos.y, {
          count: 18, color: '#ffff88',
          speed: 7, radius: 4, mode: 'radiate',
        })
        onEmitParticles(targetPos.x, targetPos.y, {
          count: 10, color: '#ffffff',
          speed: 4, radius: 2, mode: 'radiate',
        })
      }
      if (onBalloon) {
        const word = ONOMATOPEIAS[Math.floor(Math.random() * ONOMATOPEIAS.length)]
        onBalloon(alvo.id, word, 'impact', alvo.posicao.row, alvo.posicao.col)
      }
      step = 0
      setAnimTimer(returnFn, 80)
    }
  }

  function returnFn() {
    step++
    const t = step / RETURN_STEPS
    const x = targetPos.x + (originPos.x - targetPos.x) * t
    const y = targetPos.y + (originPos.y - targetPos.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < RETURN_STEPS) {
      setAnimTimer(returnFn, RETURN_INTERVAL)
    } else {
      setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (onFinalize) onFinalize()
    }
  }

  recoil()
}
