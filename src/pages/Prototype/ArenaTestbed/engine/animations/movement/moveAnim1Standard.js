/**
 * Movement animation — standard contract
 * @param {string}   charId
 * @param {{row,col}} origem
 * @param {{row,col}} destino
 * @param {Array<{row,col}>} steps  — path excluindo origem
 * @param {number}   sz             — hex size em pixels
 * @param {React.RefObject} charsRef
 * @param {function} syncCharacters
 * @param {function} setAnimTimer
 * @param {function} onTrail        — ({row, col, moveAnimId}) => void
 * @param {function} onClearTrail   — () => void
 * @param {function} setCharScales  — (updater) => void
 * @param {function} setCharVisualPos — (updater) => void
 * @param {number}   moveAnimId
 * @param {function} onFinalize     — () => void
 */
export function execute({
  charId, steps,
  charsRef, syncCharacters,
  setAnimTimer, onTrail, onClearTrail,
  setCharVisualPos, moveAnimId, onFinalize,
  hexCenter, padX, padY, sz,
}) {
  let stepIdx = 0

  function advance() {
    if (stepIdx >= steps.length) {
      if (onClearTrail) onClearTrail()
      if (onFinalize) onFinalize()
      return
    }
    const isLastStep = stepIdx === steps.length - 1
    const step = steps[stepIdx]

    if (isLastStep) {
      syncCharacters(prev =>
        prev.map(c => c.id === charId
          ? { ...c, posicao: { row: step.row, col: step.col } }
          : c
        )
      )
      if (setCharVisualPos) {
        setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
      }
    } else {
      const center = hexCenter(step.row, step.col, padX, padY, sz)
      if (setCharVisualPos) {
        setCharVisualPos(prev => ({ ...prev, [charId]: { x: center.x, y: center.y } }))
      }
    }

    if (onTrail) onTrail({ row: step.row, col: step.col, moveAnimId })
    stepIdx++
    setAnimTimer(advance, 150)
  }

  setAnimTimer(advance, 50)
}
