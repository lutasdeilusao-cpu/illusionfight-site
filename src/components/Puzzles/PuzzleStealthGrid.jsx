import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

// Puzzle Stealth Grid — Navegar sem ser detectado
// Props: onSolve(), onFail(), config = { size: 4, cameras: 'normal', hasTimer: false }

export default function PuzzleStealthGrid({ onSolve, onFail, config = {} }) {
  const size = config.size || 4
  const hasTimer = config.hasTimer || false
  const cameraCount = config.cameras === 'few' ? Math.max(1, size - 1) : size

  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 })
  const [cameras, setCameras] = useState([])
  const [turn, setTurn] = useState(0)
  const [alarm, setAlarm] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [done, setDone] = useState(false)

  const goalPos = { r: size - 1, c: size - 1 }

  // Init cameras
  useEffect(() => {
    const cams = []
    const used = new Set()
    used.add('0,0')
    used.add(`${size - 1},${size - 1}`)
    for (let i = 0; i < cameraCount; i++) {
      let r, c
      do { r = Math.floor(Math.random() * size); c = Math.floor(Math.random() * size) } while (used.has(`${r},${c}`))
      used.add(`${r},${c}`)
      cams.push({
        r, c,
        direction: Math.random() > 0.5 ? 'horizontal' : 'diagonal',
        phase: Math.floor(Math.random() * 3),
        interval: config.cameras === 'few' ? 2 + Math.floor(Math.random() * 2) : 1,
      })
    }
    setCameras(cams)
  }, [])

  // Timer
  useEffect(() => {
    if (!hasTimer || done) return
    const t = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setDone(true); setTimeout(() => onFail?.(), 500); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [hasTimer, done])

  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (done) return
      const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
        w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1] }
      const delta = moves[e.key]
      if (delta) move(delta[0], delta[1])
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [playerPos, done, alarm])

  const move = useCallback((dr, dc) => {
    if (done || alarm) return
    const nr = playerPos.r + dr
    const nc = playerPos.c + dc
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) return

    setPlayerPos({ r: nr, c: nc })
    const newTurn = turn + 1
    setTurn(newTurn)

    // Check cameras
    for (const cam of cameras) {
      const active = (newTurn + cam.phase) % cam.interval === 0
      if (!active) continue
      let detected = false
      if (cam.direction === 'horizontal' && cam.r === nr) detected = true
      else if (cam.direction === 'diagonal' && Math.abs(nr - cam.r) === Math.abs(nc - cam.c)) detected = true
      else {
        const dist = Math.abs(nr - cam.r) + Math.abs(nc - cam.c)
        if (dist <= 1) detected = true
      }
      if (detected) {
        setAlarm(true)
        setDone(true)
        setTimeout(() => onFail?.(), 500)
        return
      }
    }

    // Check goal
    if (nr === goalPos.r && nc === goalPos.c) {
      setDone(true)
      setTimeout(() => onSolve?.(), 300)
    }
  }, [playerPos, turn, cameras, done, alarm])

  const isGoal = playerPos.r === goalPos.r && playerPos.c === goalPos.c

  return (
    <div className="puzzle-container">
      <div className="puzzle-title">🥷 Grade de Infiltração</div>
      <p className="puzzle-desc">navegue até o canto oposto sem ser detectado. use WASD ou setas.</p>

      {hasTimer && <p className="puzzle-timer">⏱️ {timeLeft}s</p>}
      {alarm && <p className="puzzle-alarm">🚨 DETECTADO!</p>}

      <div className="puzzle-stealth-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {Array.from({ length: size * size }, (_, i) => {
          const r = Math.floor(i / size)
          const c = i % size
          const isPlayer = playerPos.r === r && playerPos.c === c
          const isGoal = goalPos.r === r && goalPos.c === c
          const isCam = cameras.some(cam => cam.r === r && cam.c === c)
          return (
            <div key={i} className={`puzzle-stealth-cell ${isPlayer ? 'puzzle-stealth-cell--player' : ''} ${isGoal ? 'puzzle-stealth-cell--goal' : ''} ${isCam ? 'puzzle-stealth-cell--camera' : ''}`}>
              {isPlayer ? '🕵️' : isGoal ? '🏁' : isCam ? '📹' : ''}
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
