// Attack animation — StandardPlus
// Personagem avança visualmente até o alvo, impacto com partículas e onomatopeia, depois volta

const ONOMATOPEIAS = ['POW!', 'KABOOM!', 'CRASH!', 'WHAM!', 'SMASH!']
const ADVANCE_STEPS = 7
const ADVANCE_INTERVAL = 28
const RETURN_STEPS = 5
const RETURN_INTERVAL = 22

export function execute({
  charId, atacante, alvo, resultado,
  onGetHexCenter, setAnimTimer,
  setCharVisualPos, onEmitParticles,
  onBalloon, onFinalize,
}) {
  const originPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)
  const targetPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)

  let step = 0

  function advance() {
    step++
    const t = step / ADVANCE_STEPS
    const x = originPos.x + (targetPos.x - originPos.x) * t
    const y = originPos.y + (targetPos.y - originPos.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < ADVANCE_STEPS) {
      setAnimTimer(advance, ADVANCE_INTERVAL)
    } else {
      if (onEmitParticles) {
        onEmitParticles(targetPos.x, targetPos.y, {
          count: 12, color: '#ffcc00',
          speed: 5, radius: 3, mode: 'radiate',
        })
      }
      if (onBalloon) {
        const word = ONOMATOPEIAS[Math.floor(Math.random() * ONOMATOPEIAS.length)]
        onBalloon(alvo.id, word, 'impact',
          alvo.posicao.row, alvo.posicao.col)
      }
      step = 0
      setAnimTimer(returnToOrigin, 80)
    }
  }

  function returnToOrigin() {
    step++
    const t = step / RETURN_STEPS
    const x = targetPos.x + (originPos.x - targetPos.x) * t
    const y = targetPos.y + (originPos.y - targetPos.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < RETURN_STEPS) {
      setAnimTimer(returnToOrigin, RETURN_INTERVAL)
    } else {
      setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (onFinalize) onFinalize()
    }
  }

  advance()
}
