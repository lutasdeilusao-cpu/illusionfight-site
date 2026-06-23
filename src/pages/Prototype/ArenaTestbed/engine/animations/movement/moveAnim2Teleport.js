const SHRINK_STEPS = 10
const SHRINK_INTERVAL = 30
const GROW_STEPS = 13
const GROW_INTERVAL = 30
const ROTATION_SPEED = 0.45

export function execute({
  charId, origem, destino,
  charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharScales, setCharRotation, moveAnimId, onFinalize,
  onEmitParticles, onGetHexCenter,
}) {
  let step = 0
  let rotationAngle = 0

  function shrink() {
    step++
    rotationAngle += ROTATION_SPEED
    const scale = Math.max(0, 1 - step / SHRINK_STEPS)
    setCharScales(prev => ({ ...prev, [charId]: scale }))
    if (setCharRotation) setCharRotation(prev => ({ ...prev, [charId]: rotationAngle }))
    if (scale <= 0 && onEmitParticles && onGetHexCenter && origem) {
      const pos = onGetHexCenter(origem.row, origem.col)
      onEmitParticles(pos.x, pos.y, {
        count: 10, color: '#00eeff',
        speed: 4, radius: 3, mode: 'radiate',
      })
    }
    if (step < SHRINK_STEPS) {
      setAnimTimer(shrink, SHRINK_INTERVAL)
    } else {
      syncCharacters(prev =>
        prev.map(c => c.id === charId
          ? { ...c, posicao: { row: destino.row, col: destino.col } }
          : c
        )
      )
      if (onEmitParticles && onGetHexCenter) {
        const pos = onGetHexCenter(destino.row, destino.col)
        onEmitParticles(pos.x, pos.y, {
          count: 10, color: '#00eeff',
          speed: 4, radius: 3, mode: 'converge',
        })
      }
      step = 0
      setAnimTimer(grow, SHRINK_INTERVAL)
    }
  }

  function grow() {
    step++
    rotationAngle += ROTATION_SPEED
    const scale = Math.min(1, step / GROW_STEPS)
    setCharScales(prev => ({ ...prev, [charId]: scale }))
    if (setCharRotation) setCharRotation(prev => ({ ...prev, [charId]: rotationAngle }))
    if (step < GROW_STEPS) {
      setAnimTimer(grow, GROW_INTERVAL)
    } else {
      setCharScales(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (setCharRotation) setCharRotation(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (onClearTrail) onClearTrail()
      if (onFinalize) onFinalize()
    }
  }

  shrink()
}
