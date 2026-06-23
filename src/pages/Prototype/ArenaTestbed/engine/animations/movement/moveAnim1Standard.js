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
  moveAnimId, onFinalize,
}) {
  let stepIdx = 0

  function advance() {
    if (stepIdx >= steps.length) {
      if (onClearTrail) onClearTrail()
      if (onFinalize) onFinalize()
      return
    }
    const step = steps[stepIdx]
    syncCharacters(prev =>
      prev.map(c => c.id === charId
        ? { ...c, posicao: { row: step.row, col: step.col } }
        : c
      )
    )
    if (onTrail) onTrail({ row: step.row, col: step.col, moveAnimId })
    stepIdx++
    setAnimTimer(advance, 150)
  }

  setAnimTimer(advance, 50)
}
