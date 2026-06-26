const FLASH_STEPS    = 8
const FLASH_INTERVAL = 38

export function execute({
  charId, alvo,
  onGetHexCenter, setAnimTimer,
  setCharFlash, onEmitParticles,
  onFinalize,
}) {
  const pos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)

  if (onEmitParticles) {
    onEmitParticles(pos.x, pos.y, {
      count: 12, color: '#cc0022',
      speed: 4, radius: 3, mode: 'radiate',
    })
    onEmitParticles(pos.x, pos.y, {
      count: 6, color: '#ff4444',
      speed: 2, radius: 2, mode: 'radiate',
    })
  }

  let step = 0
  setCharFlash(prev => ({ ...prev, [charId]: { color: '#ff0000', alpha: 0.7 } }))

  function fadeFlash() {
    step++
    const alpha = Math.max(0, 0.7 - (step / FLASH_STEPS) * 0.7)
    setCharFlash(prev => ({ ...prev, [charId]: { color: '#ff0000', alpha } }))
    if (step < FLASH_STEPS) {
      setAnimTimer(fadeFlash, FLASH_INTERVAL)
    } else {
      setCharFlash(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (onFinalize) onFinalize()
    }
  }

  setAnimTimer(fadeFlash, FLASH_INTERVAL)
}
