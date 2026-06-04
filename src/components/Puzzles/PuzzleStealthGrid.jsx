import { useState, useEffect, useCallback } from 'react'

function calcVisionCells(cam, size) {
  const cells = new Set()
  cells.add(`${cam.r},${cam.c}`)
  if (cam.direction === 'horizontal') {
    for (let dc = -2; dc <= 2; dc++) {
      const c = cam.c + dc
      if (c >= 0 && c < size) cells.add(`${cam.r},${c}`)
    }
  } else if (cam.direction === 'vertical') {
    for (let dr = -2; dr <= 2; dr++) {
      const r = cam.r + dr
      if (r >= 0 && r < size) cells.add(`${r},${cam.c}`)
    }
  } else {
    for (let d = -2; d <= 2; d++) {
      if (d === 0) continue
      const r1 = cam.r + d, c1 = cam.c + d
      const r2 = cam.r + d, c2 = cam.c - d
      if (r1 >= 0 && r1 < size && c1 >= 0 && c1 < size) cells.add(`${r1},${c1}`)
      if (r2 >= 0 && r2 < size && c2 >= 0 && c2 < size) cells.add(`${r2},${c2}`)
    }
  }
  return cells
}

export default function PuzzleStealthGrid({ onSolve, onFail, config = {} }) {
  const size = config.size || 4
  const hasTimer = config.hasTimer || false
  const cameraCount = config.cameras === 'few' ? Math.max(1, size - 1) : Math.min(size, 3)

  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 })
  const [cameras, setCameras] = useState([])
  const [visionCells, setVisionCells] = useState(new Set())
  const [alarm, setAlarm] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [done, setDone] = useState(false)

  const goalPos = { r: size - 1, c: size - 1 }

  useEffect(() => {
    const cams = []
    const used = new Set(['0,0', `${size - 1},${size - 1}`])
    const dirs = ['horizontal', 'vertical', 'diagonal']

    for (let i = 0; i < cameraCount; i++) {
      let r, c, attempts = 0
      do {
        r = Math.floor(Math.random() * size)
        c = Math.floor(Math.random() * size)
        attempts++
        if (attempts > 50) break
      } while (used.has(`${r},${c}`))
      if (attempts > 50) continue
      used.add(`${r},${c}`)
      cams.push({ r, c, direction: dirs[i % dirs.length] })
    }

    const allVision = new Set()
    for (const cam of cams) {
      const cells = calcVisionCells(cam, size)
      cells.delete('0,0')
      cells.delete(`${size - 1},${size - 1}`)
      cells.forEach(c => allVision.add(c))
    }

    setCameras(cams)
    setVisionCells(allVision)
  }, [])

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
      if (delta) { e.preventDefault(); move(delta[0], delta[1]) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [playerPos, done])

  const move = useCallback((dr, dc) => {
    if (done || alarm) return
    const nr = playerPos.r + dr
    const nc = playerPos.c + dc
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) return

    if (visionCells.has(`${nr},${nc}`)) {
      setPlayerPos({ r: nr, c: nc })
      setAlarm(true)
      setDone(true)
      setTimeout(() => onFail?.(), 800)
      return
    }

    setPlayerPos({ r: nr, c: nc })

    if (nr === goalPos.r && nc === goalPos.c) {
      setDone(true)
      setTimeout(() => onSolve?.(), 300)
    }
  }, [playerPos, done, alarm, visionCells])

  return (
    <div className="puzzle-container">
      <div className="puzzle-title">🥷 Grade de Infiltração</div>
      <p className="puzzle-desc">evite as zonas vermelhas e chegue ao 🏁. use WASD ou setas.</p>
      {hasTimer && <p className="puzzle-timer">⏱️ {timeLeft}s</p>}
      {alarm && <p className="puzzle-alarm">🚨 DETECTADO!</p>}
      {done && !alarm && <p style={{ color: '#22C55E', textAlign: 'center', fontFamily: "'Share Tech Mono', monospace" }}>✓ passou.</p>}

      <div className="puzzle-stealth-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {Array.from({ length: size * size }, (_, i) => {
          const r = Math.floor(i / size)
          const c = i % size
          const isPlayer = playerPos.r === r && playerPos.c === c
          const isGoal = goalPos.r === r && goalPos.c === c
          const isCam = cameras.some(cam => cam.r === r && cam.c === c)
          const isVision = visionCells.has(`${r},${c}`)
          let cellClass = 'puzzle-stealth-cell'
          if (isPlayer) cellClass += alarm ? ' puzzle-stealth-cell--caught' : ' puzzle-stealth-cell--player'
          else if (isGoal) cellClass += ' puzzle-stealth-cell--goal'
          else if (isCam) cellClass += ' puzzle-stealth-cell--camera'
          else if (isVision) cellClass += ' puzzle-stealth-cell--vision'
          return (
            <div key={i} className={cellClass}>
              {isPlayer ? (alarm ? '💀' : '🕵️') : isGoal ? '🏁' : isCam ? '📹' : ''}
            </div>
          )
        })}
      </div>

      <div className="puzzle-dpad">
        <button className="puzzle-dpad-btn puzzle-dpad-btn--up" onClick={() => move(-1, 0)} disabled={done}>▲</button>
        <button className="puzzle-dpad-btn puzzle-dpad-btn--left" onClick={() => move(0, -1)} disabled={done}>◀</button>
        <button className="puzzle-dpad-btn puzzle-dpad-btn--down" onClick={() => move(1, 0)} disabled={done}>▼</button>
        <button className="puzzle-dpad-btn puzzle-dpad-btn--right" onClick={() => move(0, 1)} disabled={done}>▶</button>
      </div>
    </div>
  )
}
