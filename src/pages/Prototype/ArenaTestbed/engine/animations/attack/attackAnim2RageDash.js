// Attack animation — RageDash
// Personagem treme no lugar, burst de raiva, dash até o alvo, impacto, volta

const SHAKE_CYCLES = 3
const SHAKE_AMPLITUDE = 5
const SHAKE_INTERVAL = 30
const DASH_STEPS = 6
const DASH_INTERVAL = 22
const RETURN_STEPS = 5
const RETURN_INTERVAL = 22
const ONOMATOPEIAS = ['POW!', 'KABOOM!', 'CRASH!', 'WHAM!', 'SMASH!']

export function execute({
  charId, atacante, alvo,
  onGetHexCenter, setAnimTimer,
  setCharVisualPos, onEmitParticles,
  onBalloon, onFinalize,
}) {
  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)

  const dx = targetPos.x - originPos.x
  const dy = targetPos.y - originPos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const perpX = -dy / dist
  const perpY = dx / dist

  let shakeStep = 0
  const totalShakeSteps = SHAKE_CYCLES * 2

  function shake() {
    shakeStep++
    const side = shakeStep % 2 === 0 ? 1 : -1
    const x = originPos.x + perpX * SHAKE_AMPLITUDE * side
    const y = originPos.y + perpY * SHAKE_AMPLITUDE * side
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (shakeStep < totalShakeSteps) {
      setAnimTimer(shake, SHAKE_INTERVAL)
    } else {
      // rage burst before dash
      if (onEmitParticles) {
        onEmitParticles(originPos.x, originPos.y, {
          count: 8, color: '#ff2244',
          speed: 3, radius: 2, mode: 'radiate',
        })
      }
      setCharVisualPos(prev => ({ ...prev, [charId]: originPos }))
      let step = 0
      setAnimTimer(dash, DASH_INTERVAL)

      function dash() {
        step++
        const t = step / DASH_STEPS
        const x = originPos.x + (targetPos.x - originPos.x) * t
        const y = originPos.y + (targetPos.y - originPos.y) * t
        setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
        if (step < DASH_STEPS) {
          setAnimTimer(dash, DASH_INTERVAL)
        } else {
          // impact
          if (onEmitParticles) {
            onEmitParticles(targetPos.x, targetPos.y, {
              count: 14, color: '#ff4400',
              speed: 6, radius: 3, mode: 'radiate',
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
    }
  }

  shake()
}
