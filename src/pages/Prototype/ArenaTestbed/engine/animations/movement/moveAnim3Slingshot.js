const RECOIL_STEPS = 7
const RECOIL_INTERVAL = 28
const LAUNCH_STEPS = 9
const LAUNCH_INTERVAL = 28

export function execute({
  charId, origem, destino,
  sz, charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharVisualPos, moveAnimId, onFinalize,
  hexCenter, padX, padY,
}) {
  const originCenter = hexCenter(origem.row, origem.col, padX, padY, sz)
  const destCenter   = hexCenter(destino.row, destino.col, padX, padY, sz)

  const dx = destCenter.x - originCenter.x
  const dy = destCenter.y - originCenter.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist
  const ny = dy / dist

  const recoilDist = sz * 1.5
  const recoilX = originCenter.x - nx * recoilDist
  const recoilY = originCenter.y - ny * recoilDist

  let step = 0

  function recoil() {
    step++
    const t = step / RECOIL_STEPS
    const x = originCenter.x + (recoilX - originCenter.x) * t
    const y = originCenter.y + (recoilY - originCenter.y) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < RECOIL_STEPS) {
      setAnimTimer(recoil, RECOIL_INTERVAL)
    } else {
      step = 0
      setAnimTimer(launch, RECOIL_INTERVAL)
    }
  }

  function launch() {
    step++
    const t = step / LAUNCH_STEPS
    const x = recoilX + (destCenter.x - recoilX) * t
    const y = recoilY + (destCenter.y - recoilY) * t
    setCharVisualPos(prev => ({ ...prev, [charId]: { x, y } }))
    if (step < LAUNCH_STEPS) {
      setAnimTimer(launch, LAUNCH_INTERVAL)
    } else {
      syncCharacters(prev =>
        prev.map(c => c.id === charId
          ? { ...c, posicao: { row: destino.row, col: destino.col } }
          : c
        )
      )
      setCharVisualPos(prev => { const n = { ...prev }; delete n[charId]; return n })
      if (onClearTrail) onClearTrail()
      if (onFinalize) onFinalize()
    }
  }

  recoil()
}
