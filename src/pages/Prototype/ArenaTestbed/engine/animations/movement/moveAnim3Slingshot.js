const RECOIL_DIST_MULTIPLIER = 4.5
const RECOIL_STEPS = 8
const RECOIL_INTERVAL = 22
const LAUNCH_STEPS = 10
const LAUNCH_INTERVAL = 18

export function execute({
  charId, origem, destino,
  sz, charsRef, syncCharacters,
  setAnimTimer, onClearTrail,
  setCharVisualPos, moveAnimId, onFinalize,
  hexCenter, padX, padY,
  onEmitParticles,
}) {
  console.log('[SLINGSHOT] execute called', { charId, origem, destino, sz })
  const originCenter = hexCenter(origem.row, origem.col, padX, padY, sz)
  const destCenter   = hexCenter(destino.row, destino.col, padX, padY, sz)
  console.log('[SLINGSHOT] originCenter', originCenter, 'destCenter', destCenter)

  const dx = destCenter.x - originCenter.x
  const dy = destCenter.y - originCenter.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist
  const ny = dy / dist

  const recoilDist = sz * RECOIL_DIST_MULTIPLIER
  console.log('[SLINGSHOT] recoilDist', recoilDist)
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
    if (onEmitParticles) {
      const trailDir = { x: nx, y: ny }
      onEmitParticles(x, y, {
        count: 3, color: '#ffaa00',
        speed: 2, radius: 2,
        mode: 'trail', trailDir,
      })
    }
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
