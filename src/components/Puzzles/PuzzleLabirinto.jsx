import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

// Puzzle Labirinto — Navegar com WASD do canto superior esquerdo ao inferior direito
// Props: onSolve(), onFail(), config = { size: 'facil'|'medio'|'dificil' }

const SIZES = { facil: 5, medio: 7, dificil: 9 }

function generateMaze(size) {
  const grid = Array.from({ length: size }, () => Array(size).fill(1))
  const stack = [{ r: 0, c: 0 }]
  grid[0][0] = 0

  while (stack.length > 0) {
    const current = stack[stack.length - 1]
    const neighbors = []
    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]]
    for (const [dr, dc] of dirs) {
      const nr = current.r + dr
      const nc = current.c + dc
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 1) {
        neighbors.push({ r: nr, c: nc, dr: dr / 2, dc: dc / 2 })
      }
    }
    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)]
      grid[current.r + next.dr][current.c + next.dc] = 0
      grid[next.r][next.c] = 0
      stack.push({ r: next.r, c: next.c })
    } else {
      stack.pop()
    }
  }

  // Ensure goal is open
  grid[size - 1][size - 1] = 0
  if (grid[size - 2]?.[size - 1] === 1 && grid[size - 1]?.[size - 2] === 1) {
    grid[size - 2][size - 1] = 0
  }

  return grid
}

export default function PuzzleLabirinto({ onSolve, onFail, config = {} }) {
  const difficulty = config.size || 'facil'
  const size = SIZES[difficulty] || 5
  const [maze] = useState(() => generateMaze(size))
  const [pos, setPos] = useState({ r: 0, c: 0 })
  const [steps, setSteps] = useState(0)
  const [done, setDone] = useState(false)

  const goal = { r: size - 1, c: size - 1 }

  const move = useCallback((dr, dc) => {
    if (done) return
    const nr = pos.r + dr
    const nc = pos.c + dc
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) return
    if (maze[nr][nc] === 1) return
    setPos({ r: nr, c: nc })
    setSteps(s => s + 1)
    if (nr === goal.r && nc === goal.c) {
      setDone(true)
      setTimeout(() => onSolve?.(), 400)
    }
  }, [pos, done, maze])

  useEffect(() => {
    const handleKey = (e) => {
      const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
        w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1] }
      const delta = moves[e.key]
      if (delta) { e.preventDefault(); move(delta[0], delta[1]) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [move])

  return (
    <div className="puzzle-container">
      <div className="puzzle-title">🏃 Labirinto</div>
      <p className="puzzle-desc">use WASD ou setas para navegar até a saída. paredes = blocos escuros.</p>
      <p className="puzzle-moves">passos: {steps} | dificuldade: {difficulty}</p>

      <div className="puzzle-maze-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {maze.map((row, r) =>
          row.map((cell, c) => {
            const isPlayer = pos.r === r && pos.c === c
            const isGoal = goal.r === r && goal.c === c
            const isWall = cell === 1
            return (
              <div key={`${r}-${c}`}
                className={`puzzle-maze-cell ${isWall ? 'puzzle-maze-cell--wall' : ''} ${isPlayer ? 'puzzle-maze-cell--player' : ''} ${isGoal ? 'puzzle-maze-cell--goal' : ''}`}>
                {isPlayer ? '🕵️' : isGoal ? '🚪' : ''}
              </div>
            )
          })
        )}
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
