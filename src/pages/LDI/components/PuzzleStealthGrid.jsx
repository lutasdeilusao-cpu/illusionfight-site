import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function PuzzleStealthGrid({ size = 4, furtividade = 0, onSolve, onFail, onSkip, hasTimer }) {
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 })
  const [cameras, setCameras] = useState([])
  const [turn, setTurn] = useState(0)
  const [alarm, setAlarm] = useState(false)
  const [solved, setSolved] = useState(false)
  const [timeLeft, setTimeLeft] = useState(hasTimer ? 30 : null)

  const goalPos = { r: size - 1, c: size - 1 }

  const initGrid = useCallback(() => {
    setPlayerPos({ r: 0, c: 0 })
    setTurn(0)
    setAlarm(false)
    setSolved(false)

    const numCameras = furtividade >= 1 ? Math.max(1, size - 1) : size
    const cams = []
    for (let i = 0; i < numCameras; i++) {
      let pos
      do {
        pos = { r: Math.floor(Math.random() * size), c: Math.floor(Math.random() * size) }
      } while (
        (pos.r === 0 && pos.c === 0) ||
        (pos.r === size - 1 && pos.c === size - 1) ||
        cams.some(c => c.r === pos.r && c.c === pos.c)
      )
      cams.push({
        ...pos,
        direction: Math.random() < 0.5 ? 'horizontal' : 'diagonal',
        phase: Math.floor(Math.random() * 3),
        interval: furtividade >= 1 ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 1),
      })
    }
    setCameras(cams)
  }, [size, furtividade])

  useEffect(() => { initGrid() }, [initGrid])

  useEffect(() => {
    if (!hasTimer || solved || alarm) return
    if (timeLeft <= 0) { onFail?.(); return }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000)
    return () => clearInterval(t)
  }, [hasTimer, solved, alarm, timeLeft, onFail])

  const move = (dr, dc) => {
    if (alarm || solved) return
    const nr = playerPos.r + dr
    const nc = playerPos.c + dc
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) return

    setPlayerPos({ r: nr, c: nc })
    setTurn(t => t + 1)

    const detected = cameras.some(cam => {
      const dist = Math.abs(nr - cam.r) + Math.abs(nc - cam.c)
      const isActive = (turn + cam.phase) % cam.interval === 0
      if (!isActive) return false
      if (cam.direction === 'horizontal') return cam.r === nr
      if (cam.direction === 'diagonal') return Math.abs(nr - cam.r) === Math.abs(nc - cam.c)
      return dist <= 1
    })

    if (detected && !alarm) {
      setAlarm(true)
      setTimeout(onFail, 500)
    }

    if (nr === goalPos.r && nc === goalPos.c) {
      setSolved(true)
      setTimeout(onSolve, 300)
    }
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp') move(-1, 0)
      if (e.key === 'ArrowDown') move(1, 0)
      if (e.key === 'ArrowLeft') move(0, -1)
      if (e.key === 'ArrowRight') move(0, 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [playerPos, alarm, solved])

  return (
    <div className="ldi-puzzle-stealth">
      <h3 className="ldi-puzzle-title">Stealth Grid</h3>
      {timeLeft !== null && (
        <div className={`ldi-stealth-timer ${timeLeft <= 10 ? 'ldi-stealth-timer--warn' : ''}`}>
          ⏱ {timeLeft}s
        </div>
      )}

      <div className="ldi-stealth-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {Array.from({ length: size * size }, (_, i) => {
          const r = Math.floor(i / size)
          const c = i % size
          const isPlayer = r === playerPos.r && c === playerPos.c
          const isGoal = r === goalPos.r && c === goalPos.c
          const hasCam = cameras.some(cam => cam.r === r && cam.c === c)

          return (
            <div
              key={i}
              className={`ldi-stealth-cell ${isPlayer ? 'ldi-stealth-cell--player' : ''} ${isGoal ? 'ldi-stealth-cell--goal' : ''} ${hasCam ? 'ldi-stealth-cell--cam' : ''}`}
            >
              {isPlayer && <motion.span layoutId="player" transition={{ type: 'spring', stiffness: 300 }}>👤</motion.span>}
              {isGoal && !isPlayer && <span>🚪</span>}
              {hasCam && !isPlayer && <span>📷</span>}
            </div>
          )
        })}
      </div>

      <div className="ldi-stealth-controls">
        <button onClick={() => move(-1, 0)} disabled={alarm || solved}>↑</button>
        <div>
          <button onClick={() => move(0, -1)} disabled={alarm || solved}>←</button>
          <button onClick={() => move(0, 1)} disabled={alarm || solved}>→</button>
        </div>
        <button onClick={() => move(1, 0)} disabled={alarm || solved}>↓</button>
      </div>

      <button className="ldi-puzzle-skip" onClick={onSkip}>Pular Puzzle</button>

      {alarm && <div className="ldi-puzzle-alarm">🚨 ALARME!</div>}
      {solved && <motion.div className="ldi-puzzle-solved" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓ Complete!</motion.div>}
    </div>
  )
}
