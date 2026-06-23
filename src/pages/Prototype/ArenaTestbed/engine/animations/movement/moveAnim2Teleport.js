const SHRINK_STEPS = 10
const SHRINK_INTERVAL = 30
const GROW_STEPS = 13
const GROW_INTERVAL = 30

export function execute({
  charId, destino,
  charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharScales, moveAnimId, onFinalize,
}) {
  let step = 0

  function shrink() {
    step++
    const scale = Math.max(0, 1 - step / SHRINK_STEPS)
    setCharScales(prev => ({ ...prev, [charId]: scale }))
    if (step < SHRINK_STEPS) {
      setAnimTimer(shrink, SHRINK_INTERVAL)
    } else {
      syncCharacters(prev =>
        prev.map(c => c.id === charId
          ? { ...c, posicao: { row: destino.row, col: destino.col } }
          : c
        )
      )
      step = 0
      setAnimTimer(grow, SHRINK_INTERVAL)
    }
  }

  function grow() {
    step++
    const scale = Math.min(1, step / GROW_STEPS)
    setCharScales(prev => ({ ...prev, [charId]: scale }))
    if (step < GROW_STEPS) {
      setAnimTimer(grow, GROW_INTERVAL)
    } else {
      setCharScales(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (onClearTrail) onClearTrail()
      if (onFinalize) onFinalize()
    }
  }

  shrink()
}
