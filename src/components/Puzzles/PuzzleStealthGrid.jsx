import { useState, useEffect, useCallback } from 'react'

function getVisionCone(r, c, dir, size) {
  const cells = new Set()
  const deltas = [[-1, 0], [0, 1], [1, 0], [0, -1]]
  const [dr, dc] = deltas[dir]
  for (let i = 1; i <= 2; i++) {
    const nr = r + dr * i
    const nc = c + dc * i
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) cells.add(`${nr},${nc}`)
  }
  return cells
}

function calculateAllVision(cams, size) {
  const all = new Set()
  for (const cam of cams) {
    const cone = getVisionCone(cam.r, cam.c, cam.direcao, size)
    cone.forEach(k => all.add(k))
  }
  return all
}

function temCaminhoLivre(blockedCells, cameras, size) {
  const blocked = new Set(blockedCells)
  cameras.forEach(cam => blocked.add(`${cam.r},${cam.c}`))
  if (blocked.has('0,0') || blocked.has(`${size-1},${size-1}`)) return false
  const visited = new Set(['0,0'])
  const queue = [[0, 0]]
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
  while (queue.length) {
    const [r, c] = queue.shift()
    if (`${r},${c}` === `${size-1},${size-1}`) return true
    for (const [dr, dc] of dirs) {
      const nr = r+dr, nc = c+dc
      const key = `${nr},${nc}`
      if (nr>=0 && nr<size && nc>=0 && nc<size && !blocked.has(key) && !visited.has(key)) {
        visited.add(key)
        queue.push([nr, nc])
      }
    }
  }
  return false
}

function gerarCameras(size, count) {
  const cams = []
  const used = new Set(['0,0', `${size-1},${size-1}`])
  const dirs = ['horizontal', 'vertical', 'diagonal']
  for (let i = 0; i < count; i++) {
    let r, c, attempts = 0
    do {
      r = Math.floor(Math.random() * size)
      c = Math.floor(Math.random() * size)
      attempts++
      if (attempts > 50) break
    } while (used.has(`${r},${c}`))
    if (attempts > 50) continue
    used.add(`${r},${c}`)
    cams.push({ r, c, direcao: Math.floor(Math.random() * 4), intervalo: 2000 + Math.random() * 2000 })
  }
  return cams
}

export default function PuzzleStealthGrid({ onSolve, onFail, config = {} }) {
  const size = config.size || 4
  const hasTimer = config.hasTimer || false
  const cameraCount = Math.min(size, 3)

  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 })
  const [cameras, setCameras] = useState([])
  const [visionCells, setVisionCells] = useState(new Set())
  const [alarm, setAlarm] = useState(false)
  const [caughtCell, setCaughtCell] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [done, setDone] = useState(false)
  const [toast, setToast] = useState(false)

  const goalPos = { r: size - 1, c: size - 1 }

  useEffect(() => {
    let tentativas = 0
    let camsValidas, visionValida
    do {
      camsValidas = gerarCameras(size, cameraCount)
      visionValida = calculateAllVision(camsValidas, size)
      visionValida.delete('0,0')
      visionValida.delete(`${size-1},${size-1}`)
      tentativas++
      console.log('[STEALTH] tentativa', tentativas, '| caminho livre:', temCaminhoLivre(visionValida, camsValidas, size))
    } while (!temCaminhoLivre(visionValida, camsValidas, size) && tentativas < 10)

    setCameras(camsValidas)
    setVisionCells(visionValida)

    const timers = camsValidas.map((cam, idx) => {
      return setInterval(() => {
        setCameras(prev => {
          const next = [...prev]
          const cur = next[idx]
          if (!cur) return prev
          let newDir
          if (Math.random() < 0.7) newDir = (cur.direcao + 1) % 4
          else newDir = (cur.direcao + 3) % 4
          next[idx] = { ...cur, direcao: newDir }
          return next
        })
      }, cam.intervalo)
    })

    return () => timers.forEach(t => clearInterval(t))
  }, [])

  useEffect(() => {
    if (cameras.length === 0) return
    setVisionCells(calculateAllVision(cameras, size))
  }, [cameras])

  useEffect(() => {
    if (!hasTimer || done) return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setDone(true); setTimeout(() => onFail?.(), 500); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [hasTimer, done])

  useEffect(() => {
    const handleKey = (e) => {
      if (done) return
      const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1], w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1] }
      const delta = moves[e.key]
      if (delta) { e.preventDefault(); handleMove(delta[0], delta[1]) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [playerPos, cameras, done, alarm])

  const handleMove = useCallback((dr, dc) => {
    if (done || alarm) return
    const nr = playerPos.r + dr
    const nc = playerPos.c + dc
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) return

    const onCamera = cameras.some(cam => cam.r === nr && cam.c === nc)
    const currentVision = calculateAllVision(cameras, size)
    const inVision = currentVision.has(`${nr},${nc}`)

    if (onCamera || inVision) {
      setPlayerPos({ r: nr, c: nc })
      setCaughtCell({ r: nr, c: nc })
      setAlarm(true)
      setDone(true)
      setToast(true)
      setTimeout(() => setToast(false), 1500)
      setTimeout(() => onFail?.(), 1800)
      return
    }

    setPlayerPos({ r: nr, c: nc })

    if (nr === goalPos.r && nc === goalPos.c) {
      setDone(true)
      setTimeout(() => onSolve?.(), 300)
    }
  }, [playerPos, cameras, done, alarm])

  return (
    <div className="puzzle-container">
      <div className="puzzle-title">🥷 Grade de Infiltração</div>
      <p className="puzzle-desc">evite as câmeras e seus cones de visão. use WASD ou setas.</p>
      {hasTimer && <p className="puzzle-timer">⏱️ {timeLeft}s</p>}
      {done && !alarm && <p style={{ color: '#22C55E', textAlign: 'center', fontFamily: "'Share Tech Mono', monospace" }}>✓ passou.</p>}

      <div className="puzzle-stealth-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, position: 'relative' }}>
        {toast && <div className="puzzle-stealth-toast">você foi capturado</div>}
        {Array.from({ length: size * size }, (_, i) => {
          const r = Math.floor(i / size)
          const c = i % size
          const isPlayer = playerPos.r === r && playerPos.c === c
          const isGoal = goalPos.r === r && goalPos.c === c
          const isCam = cameras.some(cam => cam.r === r && cam.c === c)
          const isVision = visionCells.has(`${r},${c}`)
          const isCaught = caughtCell?.r === r && caughtCell?.c === c
          let cellClass = 'puzzle-stealth-cell'
          if (isPlayer) cellClass += isCaught ? ' puzzle-stealth-cell--caught' : ' puzzle-stealth-cell--player'
          else if (isGoal) cellClass += ' puzzle-stealth-cell--goal'
          else if (isCam) cellClass += ' puzzle-stealth-cell--camera'
          else if (isVision) cellClass += ' puzzle-stealth-cell--vision'
          let icon = ''
          if (isPlayer) icon = isCaught ? '💀' : '🕵️'
          else if (isGoal) icon = '🏁'
          else if (isCam) icon = '📹'
          return (<div key={i} className={cellClass}>{icon && <span style={{ position: 'relative', zIndex: 2 }}>{icon}</span>}</div>)
        })}
      </div>

      <div className="puzzle-dpad">
        <button className="puzzle-dpad-btn puzzle-dpad-btn--up" onClick={() => handleMove(-1, 0)} disabled={done}>▲</button>
        <button className="puzzle-dpad-btn puzzle-dpad-btn--left" onClick={() => handleMove(0, -1)} disabled={done}>◀</button>
        <button className="puzzle-dpad-btn puzzle-dpad-btn--down" onClick={() => handleMove(1, 0)} disabled={done}>▼</button>
        <button className="puzzle-dpad-btn puzzle-dpad-btn--right" onClick={() => handleMove(0, 1)} disabled={done}>▶</button>
      </div>
    </div>
  )
}
