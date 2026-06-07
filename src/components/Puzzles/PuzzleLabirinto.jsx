function gerarLabirinto(rows, cols) {
  const grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ r, c, n: true, s: true, e: true, w: true, visited: false }))
  )
  const vizinhos = (r, c) => [
    { r: r-1, c, dir: 'n', opp: 's' }, { r: r+1, c, dir: 's', opp: 'n' },
    { r, c: c+1, dir: 'e', opp: 'w' }, { r, c: c-1, dir: 'w', opp: 'e' },
  ].filter(v => v.r >= 0 && v.r < rows && v.c >= 0 && v.c < cols && !grid[v.r][v.c].visited)
  const stack = []
  grid[0][0].visited = true
  stack.push(grid[0][0])
  while (stack.length) {
    const cur = stack[stack.length - 1]
    const nb = vizinhos(cur.r, cur.c)
    if (nb.length === 0) { stack.pop(); continue }
    const next = nb[Math.floor(Math.random() * nb.length)]
    grid[cur.r][cur.c][next.dir] = false
    grid[next.r][next.c][next.opp] = false
    grid[next.r][next.c].visited = true
    stack.push(grid[next.r][next.c])
  }
  return grid
}

function bfsPath(maze, start, goal, rows, cols) {
  const queue = [{ r: start.r, c: start.c, path: [start] }]
  const visited = new Set([`${start.r},${start.c}`])
  const dirMap = [
    { dr: -1, dc: 0, wall: 'n' }, { dr: 1, dc: 0, wall: 's' },
    { dr: 0, dc: 1, wall: 'e' }, { dr: 0, dc: -1, wall: 'w' },
  ]
  while (queue.length) {
    const { r, c, path } = queue.shift()
    if (r === goal.r && c === goal.c) return path
    for (const { dr, dc, wall } of dirMap) {
      const nr = r + dr, nc = c + dc
      const key = `${nr},${nc}`
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(key) && !maze[r][c][wall]) {
        visited.add(key)
        queue.push({ r: nr, c: nc, path: [...path, { r: nr, c: nc }] })
      }
    }
  }
  return []
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSwipe } from '../../hooks/useSwipe'
import { useZoom } from '../../hooks/useZoom'
import { useViewportScroll } from '../../hooks/useViewportScroll'

const MAZE_CONFIGS = {
  easy:   { rows: 8,  cols: 8,  cellPx: 36, timer: null  },
  medium: { rows: 12, cols: 12, cellPx: 32, timer: 90    },
  hard:   { rows: 16, cols: 16, cellPx: 28, timer: 60    },
}

export default function PuzzleLabirinto({ onSolve, onFail, config = {} }) {
  const difficulty = config.difficulty || 'easy'
  const cfg = MAZE_CONFIGS[difficulty]
  const { rows, cols, cellPx } = cfg
  const isMobile = window.innerWidth < 600

  const containerRef = useRef(null)
  const viewportRef = useRef(null)

  const [maze] = useState(() => gerarLabirinto(rows, cols))
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 })
  const [done, setDone] = useState(false)
  const [moves, setMoves] = useState(0)
  const [timeLeft, setTimeLeft] = useState(cfg.timer)
  const [dica, setDica] = useState(false)
  const [dicaPath, setDicaPath] = useState([])

  const goalPos = { r: rows - 1, c: cols - 1 }
  const viewportCells = isMobile ? (difficulty === 'hard' ? 8 : 7) : Math.max(rows, cols)
  const viewportPx = viewportCells * cellPx

  console.log('[LABIRINTO] difficulty:', difficulty, '| size:', rows, 'x', cols, '| timer:', cfg.timer)

  const { zoom, setZoom, controlsVisible, showControls } = useZoom({ min: 1, max: 3 })
  const gridOffset = useViewportScroll(playerPos, cellPx, viewportPx, Math.max(rows, cols))

  useEffect(() => {
    if (!cfg.timer || done) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setDone(true); setTimeout(() => onFail?.(), 500); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [done, cfg.timer])

  useEffect(() => {
    if (difficulty === 'easy' || done) return
    const calcDica = () => {
      const path = bfsPath(maze, playerPos, goalPos, rows, cols)
      setDicaPath(path.slice(1, Math.min(5, path.length)))
      setDica(true)
      setTimeout(() => setDica(false), 3000)
    }
    const dicaInt = setInterval(calcDica, 15000)
    return () => clearInterval(dicaInt)
  }, [done, playerPos, difficulty])

  const handleMove = useCallback((dr, dc) => {
    if (done) return
    const { r, c } = playerPos
    const cell = maze[r][c]
    const dirMap = [
      { dr: -1, dc: 0, wall: 'n' }, { dr: 1, dc: 0, wall: 's' },
      { dr: 0, dc: 1, wall: 'e' }, { dr: 0, dc: -1, wall: 'w' },
    ]
    const move = dirMap.find(d => d.dr === dr && d.dc === dc)
    if (!move || cell[move.wall]) return
    const nr = r + dr, nc = c + dc
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return
    setPlayerPos({ r: nr, c: nc })
    setMoves(m => m + 1)
    if (nr === goalPos.r && nc === goalPos.c) { setDone(true); setTimeout(() => onSolve?.(), 400) }
  }, [playerPos, maze, done, rows, cols])

  useEffect(() => {
    const handleKey = (e) => {
      if (done) return
      const moves = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1], w:[-1,0], s:[1,0], a:[0,-1], d:[0,1] }
      const delta = moves[e.key]
      if (delta) { e.preventDefault(); handleMove(delta[0], delta[1]) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleMove])

  useSwipe(viewportRef, handleMove)

  const zoomScale = zoom === 3 ? viewportPx / (Math.max(rows,cols) * cellPx) : zoom === 2 ? 0.7 : 1
  const timerColor = timeLeft <= 10 ? '#DC143C' : timeLeft <= 20 ? '#F5A623' : '#555'

  return (
    <div ref={containerRef} className="puzzle-container" style={{ userSelect: 'none' }}>
      <div className="puzzle-title">🌀 Labirinto</div>
      <p className="puzzle-desc">encontre a saída. use WASD, setas ou swipe.</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', marginBottom: '0.3rem' }}>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:'0.65rem', color: cfg.timer ? timerColor : '#555', animation: cfg.timer && timeLeft <= 10 ? 'timer-urgent 0.5s infinite' : 'none' }}>
          {cfg.timer ? `⏱ ${timeLeft}s` : `movimentos: ${moves}`}
        </span>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:'0.65rem', color:'#555' }}>{difficulty.toUpperCase()} · {rows}×{cols}</span>
      </div>
      <div ref={viewportRef} className="puzzle-stealth-viewport"
        style={{ width: viewportPx, height: viewportPx, overflow: 'hidden', position: 'relative', margin: '0 auto', cursor: 'crosshair' }}
        onTouchStart={showControls} onClick={showControls}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: cols * cellPx, height: rows * cellPx, transform: `translate(${gridOffset.x}px, ${gridOffset.y}px) scale(${zoomScale})`, transformOrigin: 'top left' }}>
          {maze.map((row, r) => row.map((cell, c) => {
            const isPlayer = playerPos.r === r && playerPos.c === c
            const isGoal = goalPos.r === r && goalPos.c === c
            const isDica = dica && dicaPath.some(p => p.r === r && p.c === c)
            return (
              <div key={`${r},${c}`} style={{
                position: 'absolute', top: r * cellPx, left: c * cellPx, width: cellPx, height: cellPx,
                background: isPlayer ? 'rgba(245,166,35,0.2)' : isGoal ? 'rgba(34,197,94,0.15)' : isDica ? 'rgba(168,85,247,0.15)' : '#0a0a0a',
                borderTop: cell.n ? '2px solid #2a2a2a' : '2px solid transparent',
                borderBottom: cell.s ? '2px solid #2a2a2a' : '2px solid transparent',
                borderRight: cell.e ? '2px solid #2a2a2a' : '2px solid transparent',
                borderLeft: cell.w ? '2px solid #2a2a2a' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: cellPx * 0.5, transition: 'background 0.15s', boxSizing: 'border-box',
              }}>
                {isPlayer ? '🕵️' : isGoal ? <span className="puzzle-stealth-goal-icon">🚪</span> : ''}
                {isDica && !isPlayer && !isGoal && <span style={{ opacity: 0.6, fontSize: cellPx * 0.4 }}>👣</span>}
              </div>
            )
          }))}
        </div>
      </div>
      {isMobile && (
        <div className="puzzle-stealth-zoom-btns" style={{ opacity: controlsVisible ? 1 : 0.2, transition: 'opacity 0.3s' }}>
          <button onClick={() => setZoom(z => z - 1)} className="puzzle-stealth-zoom-btn">−</button>
          <span className="puzzle-stealth-zoom-label">{zoom === 1 ? 'NORMAL' : zoom === 2 ? 'WIDE' : 'MAPA'}</span>
          <button onClick={() => setZoom(z => z + 1)} className="puzzle-stealth-zoom-btn">+</button>
        </div>
      )}
      {!isMobile && (
        <div className="puzzle-dpad">
          <button className="puzzle-dpad-btn puzzle-dpad-btn--up" onClick={() => handleMove(-1,0)} disabled={done}>▲</button>
          <button className="puzzle-dpad-btn puzzle-dpad-btn--left" onClick={() => handleMove(0,-1)} disabled={done}>◀</button>
          <button className="puzzle-dpad-btn puzzle-dpad-btn--down" onClick={() => handleMove(1,0)} disabled={done}>▼</button>
          <button className="puzzle-dpad-btn puzzle-dpad-btn--right" onClick={() => handleMove(0,1)} disabled={done}>▶</button>
        </div>
      )}
    </div>
  )
}
