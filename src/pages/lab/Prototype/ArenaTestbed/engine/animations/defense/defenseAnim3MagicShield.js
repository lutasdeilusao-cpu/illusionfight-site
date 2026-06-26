const APPEAR_STEPS    = 5
const APPEAR_INTERVAL = 25
const HOLD_DURATION  = 300
const SHAKE_DURATION = 400
const FADE_STEPS     = 8
const FADE_INTERVAL  = 35

export function execute({
  charId, alvo, atacante,
  onGetHexCenter, setAnimTimer,
  setCharFlash, setShield,
  sz, onFinalize,
}) {
  const alvoPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
  const atacPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)

  const angle = Math.atan2(
    atacPos.y - alvoPos.y,
    atacPos.x - alvoPos.x
  )

  setCharFlash(prev => ({
    ...prev, [charId]: { color: '#00aaff', alpha: 0.4 }
  }))

  let step = 0

  function appear() {
    step++
    const alpha = step / APPEAR_STEPS
    setShield({ x: alvoPos.x, y: alvoPos.y,
      angle, alpha, shake: false, active: true })
    if (step < APPEAR_STEPS) {
      setAnimTimer(appear, APPEAR_INTERVAL)
    } else {
      setAnimTimer(hold, HOLD_DURATION)
    }
  }

  function hold() {
    setShield(prev => prev ? { ...prev, shake: true } : null)
    setCharFlash(prev => ({
      ...prev, [charId]: { color: '#00aaff', alpha: 0.6 }
    }))
    setAnimTimer(fadeOut, SHAKE_DURATION)
  }

  function fadeOut() {
    step = 0
    function doFade() {
      step++
      const alpha = Math.max(0, 1 - step / FADE_STEPS)
      setShield(prev => prev ? { ...prev, alpha, shake: false } : null)
      setCharFlash(prev => ({
        ...prev, [charId]: { color: '#00aaff',
          alpha: Math.max(0, 0.4 - (step / FADE_STEPS) * 0.4) }
      }))
      if (step < FADE_STEPS) {
        setAnimTimer(doFade, FADE_INTERVAL)
      } else {
        setShield(null)
        setCharFlash(prev => { const n = { ...prev }; delete n[charId]; return n })
        if (onFinalize) onFinalize()
      }
    }
    doFade()
  }

  appear()
}
