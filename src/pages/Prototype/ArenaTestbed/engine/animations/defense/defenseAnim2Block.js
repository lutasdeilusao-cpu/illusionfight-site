const FLASH_STEPS     = 10
const FLASH_INTERVAL  = 35
const RECOIL_STEPS    = 5
const RECOIL_INTERVAL = 28
const RETURN_STEPS    = 4
const RETURN_INTERVAL = 28

export function execute({
  charId, alvo, atacante,
  onGetHexCenter, setAnimTimer,
  setCharVisualPos, setCharFlash,
  onEmitParticles, onFinalize,
}) {
  const alvoPos = onGetHexCenter(alvo.posicao.row, alvo.posicao.col)
  const atacPos = onGetHexCenter(atacante.posicao.row, atacante.posicao.col)

  const dx = alvoPos.x - atacPos.x
  const dy = alvoPos.y - atacPos.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist
  const ny = dy / dist

  const recoilX = alvoPos.x + nx * 12
  const recoilY = alvoPos.y + ny * 12

  setCharFlash(prev => ({ ...prev, [charId]: { color: '#ffd700', alpha: 0.8 } }))

  if (onEmitParticles) {
    onEmitParticles(alvoPos.x, alvoPos.y, {
      count: 10, color: '#ffd700',
      speed: 4, radius: 3, mode: 'radiate',
    })
  }

  let step = 0

  function recoil() {
    step++
    const t = step / RECOIL_STEPS
    const x = alvoPos.x + (recoilX - alvoPos.x) * t
    const y = alvoPos.y + (recoilY - alvoPos.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    const alpha = Math.max(0, 0.8 - (step / FLASH_STEPS) * 0.8)
    setCharFlash(prev => ({ ...prev, [charId]: { color: '#ffd700', alpha } }))
    if (step < RECOIL_STEPS) {
      setAnimTimer(recoil, RECOIL_INTERVAL)
    } else {
      step = 0
      setAnimTimer(returnFn, RECOIL_INTERVAL)
    }
  }

  function returnFn() {
    step++
    const t = step / RETURN_STEPS
    const x = recoilX + (alvoPos.x - recoilX) * t
    const y = recoilY + (alvoPos.y - recoilY) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    const alpha = Math.max(0, 0.8 - ((step + RECOIL_STEPS) / FLASH_STEPS) * 0.8)
    setCharFlash(prev => ({ ...prev, [charId]: { color: '#ffd700', alpha } }))
    if (step < RETURN_STEPS) {
      setAnimTimer(returnFn, RETURN_INTERVAL)
    } else {
      setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
      setCharFlash(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (onFinalize) onFinalize()
    }
  }

  recoil()
}
