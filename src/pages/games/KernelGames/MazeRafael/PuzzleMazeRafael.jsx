import { useState, useEffect, useRef, useCallback } from 'react'
import { useRafaelI18n } from '../_shared/useRafaelI18n'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'
import './PuzzleMazeRafael.css'

const CFG = {
  easy:   { time:30, cellsMinDim:5, wallThick:8, playerR:10, checkpoint:false, label:'FÁCIL',   col:'#00e5ff' },
  normal: { time:45, cellsMinDim:7, wallThick:6, playerR:9,  checkpoint:true,  label:'NORMAL',  col:'#b400ff' },
  hard:   { time:60, cellsMinDim:8, wallThick:4, playerR:7,  checkpoint:true,  label:'DIFÍCIL', col:'#ff0055' },
}
const PENALTY = 5

const MSGS_OK = [
  'maze_rafael.msg_ok_1','maze_rafael.msg_ok_2',
  'maze_rafael.msg_ok_3','maze_rafael.msg_ok_4',
]
const MSGS_FAIL = [
  'maze_rafael.msg_fail_1','maze_rafael.msg_fail_2',
  'maze_rafael.msg_fail_3','maze_rafael.msg_fail_4',
]

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function opposite(d) { return { N:'S', S:'N', E:'W', W:'E' }[d] }

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return `rgba(${r},${g},${b},${a})`
}

export default function PuzzleMazeRafael({ onSolve, onFail, onBack, initialDiff }) {
  const { t } = useRafaelI18n()
  const { t: gt } = useLanguage()

  const [phase, setPhase] = useState(initialDiff ? 'countdown' : 'select')
  const [diff, setDiff] = useState(initialDiff || null)
  const [cdownN, setCdownN] = useState(initialDiff ? 3 : 3)
  const [displayTime, setDisplayTime] = useState(0)
  const [errors, setErrors] = useState(0)
  const autoStarted = useRef(false)

  const cfg = diff ? CFG[diff] : null
  const canvasRef = useRef(null)
  const hudRef = useRef(null)
  const arenaRef = useRef(null)
  const tickerRef = useRef(null)
  const rafRef = useRef(null)
  const activeRef = useRef(false)
  const t0Ref = useRef(0)
  const timeLeftRef = useRef(0)
  const errorsRef = useRef(0)
  const penaltyFlashRef = useRef(0)
  const wonRef = useRef(false)

  const mazeRef = useRef(null)
  const cellSizeRef = useRef(0)
  const wallThickRef = useRef(0)
  const colsRef = useRef(0)
  const rowsRef = useRef(0)
  const WRef = useRef(0)
  const HRef = useRef(0)

  const playerRef = useRef({ x:0, y:0 })
  const startPosRef = useRef({ x:0, y:0 })
  const endPosRef = useRef({ x:0, y:0 })
  const checkpointPosRef = useRef(null)
  const checkpointReachedRef = useRef(false)

  const cleanup = useCallback(() => {
    activeRef.current = false
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [])

  const endGame = useCallback((win) => {
    if (!activeRef.current) return
    cleanup()
    if (win) sfx.win(); else sfx.lose()
    const t = win ? 500 : 800
    setTimeout(() => { win ? onSolve?.() : onFail?.() }, t)
  }, [cleanup, onSolve, onFail])

  const updateTimerHUD = useCallback(() => {
    const total = Math.ceil(Math.max(0, timeLeftRef.current))
    setDisplayTime(total)
  }, [])

  function cellCenter(r, c) {
    const W = WRef.current, H = HRef.current
    const cs = cellSizeRef.current
    const ox = (W - colsRef.current * cs) / 2
    const oy = (H - rowsRef.current * cs) / 2
    return { x: ox + c * cs + cs / 2, y: oy + r * cs + cs / 2 }
  }

  function getUnvisitedNeighbors(r, c) {
    const m = mazeRef.current
    return [['N',r-1,c],['S',r+1,c],['E',r,c+1],['W',r,c-1]]
      .filter(([,nr,nc]) => nr >= 0 && nr < rowsRef.current && nc >= 0 && nc < colsRef.current && !m[nr][nc].visited)
  }

  const findPath = useCallback(() => {
    const rows = rowsRef.current, cols = colsRef.current, maze = mazeRef.current
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false))
    const parent = Array.from({ length: rows }, () => Array(cols).fill(null))
    const queue = [[0, 0]]
    visited[0][0] = true
    while (queue.length) {
      const [r, c] = queue.shift()
      if (r === rows - 1 && c === cols - 1) break
      for (const [dir, nr, nc] of [['N',r-1,c],['S',r+1,c],['E',r,c+1],['W',r,c-1]]) {
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
        if (visited[nr][nc]) continue
        if (maze[r][c].walls[dir]) continue
        visited[nr][nc] = true
        parent[nr][nc] = [r, c]
        queue.push([nr, nc])
      }
    }
    const path = []
    let cur = [rows - 1, cols - 1]
    while (cur) {
      path.unshift(cur)
      cur = parent[cur[0]]?.[cur[1]]
    }
    return path
  }, [])

  const generateMaze = useCallback(() => {
    const W = WRef.current, H = HRef.current
    const c = CFG[diff]
    let cs = Math.floor(Math.min(W, H) / c.cellsMinDim)
    cs = Math.max(cs, 28)
    cellSizeRef.current = cs
    wallThickRef.current = c.wallThick

    let cols = Math.floor(W / cs)
    let rows = Math.floor(H / cs)
    if (cols % 2 === 0) cols--
    if (rows % 2 === 0) rows--
    cols = Math.max(3, cols)
    rows = Math.max(3, rows)
    colsRef.current = cols
    rowsRef.current = rows

    const maze = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ walls: { N: true, S: true, E: true, W: true }, visited: false }))
    )

    const stack = [[0, 0]]
    maze[0][0].visited = true
    while (stack.length) {
      const [r, c] = stack[stack.length - 1]
      const nbrs = shuffleArr(getUnvisitedNeighbors(r, c))
      if (nbrs.length === 0) { stack.pop(); continue }
      const [dir, nr, nc] = nbrs[0]
      maze[r][c].walls[dir] = false
      maze[nr][nc].walls[opposite(dir)] = false
      maze[nr][nc].visited = true
      stack.push([nr, nc])
    }
    mazeRef.current = maze

    startPosRef.current = cellCenter(0, 0)
    endPosRef.current = cellCenter(rows - 1, cols - 1)

    if (c.checkpoint) {
      const path = findPath()
      const mid = path[Math.floor(path.length / 2)]
      checkpointPosRef.current = cellCenter(mid[0], mid[1])
      checkpointReachedRef.current = false
    } else {
      checkpointPosRef.current = null
    }
  }, [diff, findPath])

  const resetPlayer = useCallback(() => {
    const p = playerRef.current
    const cp = checkpointPosRef.current
    if (CFG[diff].checkpoint && checkpointReachedRef.current && cp) {
      p.x = cp.x
      p.y = cp.y
    } else {
      p.x = startPosRef.current.x
      p.y = startPosRef.current.y
    }
  }, [diff])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = WRef.current, H = HRef.current
    const maze = mazeRef.current
    const cs = cellSizeRef.current
    const wt = wallThickRef.current
    const cols = colsRef.current
    const rows = rowsRef.current
    const player = playerRef.current
    const pr = CFG[diff].playerR
    const ts = Date.now() / 1000

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#05050f'
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(0,229,255,0.03)'
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    if (maze) {
      const ox = (W - cols * cs) / 2
      const oy = (H - rows * cs) / 2
      ctx.fillStyle = '#07071a'
      ctx.fillRect(ox, oy, cols * cs, rows * cs)
      ctx.fillStyle = '#0d1a2e'
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = ox + c * cs, y2 = oy + r * cs
          const cell = maze[r][c]
          if (cell.walls.N) ctx.fillRect(x, y2, cs, wt)
          if (cell.walls.S) ctx.fillRect(x, y2 + cs - wt, cs, wt)
          if (cell.walls.W) ctx.fillRect(x, y2, wt, cs)
          if (cell.walls.E) ctx.fillRect(x + cs - wt, y2, wt, cs)
        }
      }
      ctx.strokeStyle = 'rgba(0,229,255,0.3)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(ox, oy, cols * cs, rows * cs)

      const fs = Math.max(8, Math.floor(cs * 0.26))
      ctx.font = `${fs}px Share Tech Mono, monospace`
      ctx.fillStyle = 'rgba(0,229,255,0.45)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('IN', startPosRef.current.x, startPosRef.current.y)
    }

    const cp = checkpointPosRef.current
    if (cp) {
      const pulse = 0.6 + 0.4 * Math.sin(ts * 4)
      const col = checkpointReachedRef.current ? 'rgba(180,0,255,0.3)' : `rgba(255,204,0,${0.8 * pulse})`
      const colG = checkpointReachedRef.current ? '#b400ff' : '#ffcc00'
      const grd = ctx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, cs * 0.6)
      grd.addColorStop(0, checkpointReachedRef.current ? 'rgba(180,0,255,0.15)' : `rgba(255,204,0,${0.25 * pulse})`)
      grd.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(cp.x, cp.y, cs * 0.6, 0, Math.PI * 2)
      ctx.fillStyle = grd; ctx.fill()
      ctx.beginPath(); ctx.arc(cp.x, cp.y, cs * 0.28, 0, Math.PI * 2)
      ctx.strokeStyle = col
      ctx.lineWidth = 2
      ctx.shadowColor = colG; ctx.shadowBlur = checkpointReachedRef.current ? 4 : 10 * pulse
      ctx.stroke(); ctx.shadowBlur = 0
      const fs2 = Math.max(7, Math.floor(cs * 0.22))
      ctx.font = `${fs2}px Share Tech Mono, monospace`
      ctx.fillStyle = col
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(checkpointReachedRef.current ? '✓ CP' : 'CP', cp.x, cp.y)
    }

    if (endPosRef.current) {
      const ep = endPosRef.current
      const pulse2 = 0.6 + 0.4 * Math.sin(ts * 3)
      const grd2 = ctx.createRadialGradient(ep.x, ep.y, 0, ep.x, ep.y, cs * 0.55)
      grd2.addColorStop(0, `rgba(0,229,255,${0.3 * pulse2})`); grd2.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(ep.x, ep.y, cs * 0.55, 0, Math.PI * 2)
      ctx.fillStyle = grd2; ctx.fill()
      ctx.beginPath(); ctx.arc(ep.x, ep.y, cs * 0.28, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(0,229,255,${0.8 * pulse2})`; ctx.lineWidth = 2
      ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 10 * pulse2; ctx.stroke(); ctx.shadowBlur = 0
      const fs3 = Math.max(8, Math.floor(cs * 0.24))
      ctx.font = `${fs3}px Share Tech Mono, monospace`
      ctx.fillStyle = `rgba(0,229,255,${0.8 * pulse2})`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('OUT', ep.x, ep.y)
    }

    if (player) {
      const pulse3 = 0.8 + 0.2 * Math.sin(ts * 6)
      const grd3 = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, pr * 2.8)
      grd3.addColorStop(0, `rgba(0,229,255,${0.22 * pulse3})`); grd3.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(player.x, player.y, pr * 2.8, 0, Math.PI * 2)
      ctx.fillStyle = grd3; ctx.fill()
      ctx.beginPath(); ctx.arc(player.x, player.y, pr, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,229,255,0.18)'; ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2
      ctx.fill(); ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 10 * pulse3; ctx.stroke(); ctx.shadowBlur = 0
      const s = pr + 5
      ctx.strokeStyle = 'rgba(0,229,255,0.45)'; ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(player.x - s, player.y); ctx.lineTo(player.x + s, player.y)
      ctx.moveTo(player.x, player.y - s); ctx.lineTo(player.x, player.y + s)
      ctx.stroke()
    }

    if (penaltyFlashRef.current > 0) {
      const prog = penaltyFlashRef.current / 24
      ctx.fillStyle = `rgba(255,0,85,${prog * 0.22})`
      ctx.fillRect(0, 0, W, H)
      for (let i = 0; i < 10; i++) {
        const y2 = Math.random() * H, h = 1 + Math.random() * prog * 8
        const shift = (Math.random() - 0.5) * prog * 36
        ctx.fillStyle = '#05050f'
        ctx.fillRect(shift, y2, W, h)
        ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,0,85,${prog * .55})` : `rgba(0,229,255,${prog * .35})`
        ctx.fillRect(shift, y2, W * (0.4 + Math.random() * 0.6), h * 0.5)
      }
      if (prog > 0.3) {
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,0,85,${prog * .5})` : `rgba(0,229,255,${prog * .35})`
          ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() * prog * 60 + 5, Math.random() * prog * 5 + 1)
        }
      }
      ctx.strokeStyle = `rgba(255,0,85,${prog * .9})`
      ctx.lineWidth = 3
      ctx.shadowColor = '#ff0055'; ctx.shadowBlur = 18 * prog
      ctx.strokeRect(2, 2, W - 4, H - 4)
      ctx.shadowBlur = 0
    }
  }, [diff])

  const loop = useCallback(() => {
    if (!activeRef.current) return
    draw()
    if (penaltyFlashRef.current > 0) penaltyFlashRef.current--
    rafRef.current = requestAnimationFrame(loop)
  }, [draw])

  const triggerPenalty = useCallback(() => {
    errorsRef.current++
    timeLeftRef.current = Math.max(0, timeLeftRef.current - PENALTY)
    t0Ref.current = Date.now() - (CFG[diff].time - timeLeftRef.current) * 1000
    setErrors(errorsRef.current)
    penaltyFlashRef.current = 24
    resetPlayer()
    updateTimerHUD()
    if (timeLeftRef.current <= 0) endGame(false)
  }, [diff, resetPlayer, updateTimerHUD, endGame])

  function checkWallCollision() {
    const maze = mazeRef.current
    if (!maze) return false
    const W = WRef.current, H = HRef.current
    const cs = cellSizeRef.current, wt = wallThickRef.current
    const cols = colsRef.current, rows = rowsRef.current
    const ox = (W - cols * cs) / 2
    const oy = (H - rows * cs) / 2
    const player = playerRef.current
    const c = Math.floor((player.x - ox) / cs)
    const r = Math.floor((player.y - oy) / cs)
    if (r < 0 || r >= rows || c < 0 || c >= cols) { triggerPenalty(); return true }
    const cell = maze[r][c]
    const cx = ox + c * cs, cy = oy + r * cs
    const pr = CFG[diff].playerR
    if (cell.walls.N && player.y - pr < cy + wt) { triggerPenalty(); return true }
    if (cell.walls.S && player.y + pr > cy + cs - wt) { triggerPenalty(); return true }
    if (cell.walls.W && player.x - pr < cx + wt) { triggerPenalty(); return true }
    if (cell.walls.E && player.x + pr > cx + cs - wt) { triggerPenalty(); return true }
    return false
  }

  function checkGoal() {
    const dist = Math.hypot(playerRef.current.x - endPosRef.current.x, playerRef.current.y - endPosRef.current.y)
    if (dist < cellSizeRef.current * 0.42) {
      wonRef.current = true
      endGame(true)
      return true
    }
    return false
  }

  function checkCheckpoint() {
    const cp = checkpointPosRef.current
    if (!cp || checkpointReachedRef.current) return
    if (Math.hypot(playerRef.current.x - cp.x, playerRef.current.y - cp.y) < cellSizeRef.current * 0.42) {
      checkpointReachedRef.current = true
    }
  }

  const movePlayer = useCallback((nx, ny) => {
    if (!activeRef.current || wonRef.current) return
    if (penaltyFlashRef.current > 0) return
    const player = playerRef.current
    const dx = nx - player.x, dy = ny - player.y
    const dist = Math.hypot(dx, dy)
    const maxStep = CFG[diff].playerR * 0.6
    const steps = Math.max(1, Math.ceil(dist / maxStep))
    for (let i = 1; i <= steps; i++) {
      player.x += dx / steps
      player.y += dy / steps
      if (checkWallCollision()) return
      checkCheckpoint()
      if (checkGoal()) return
    }
  }, [diff])

  const onTouch = useCallback((e) => {
    e.preventDefault()
    if (!activeRef.current || wonRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    movePlayer(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top)
  }, [movePlayer])

  const onMouse = useCallback((e) => {
    if (!activeRef.current || wonRef.current) return
    if (e.buttons === 0 && e.type === 'mousemove') return
    const rect = canvasRef.current.getBoundingClientRect()
    movePlayer(e.clientX - rect.left, e.clientY - rect.top)
  }, [movePlayer])

  const startGame = useCallback(() => {
    const c = CFG[diff]
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const hud = hudRef.current
    const arena = arenaRef.current

    // Canvas sizing: arena clientWidth/Height - 16 (padding 8px each side)
    // The canvas fills the arena after subtracting HUD height
    const arenaRect = arena.getBoundingClientRect()
    const hudH = hud ? hud.offsetHeight : 0
    WRef.current = canvas.width = arena.clientWidth - 16
    HRef.current = canvas.height = arena.clientHeight - hudH - 16

    errorsRef.current = 0
    activeRef.current = true
    wonRef.current = false
    penaltyFlashRef.current = 0
    checkpointReachedRef.current = false
    setErrors(0)
    setDisplayTime(c.time)

    generateMaze()
    resetPlayer()

    t0Ref.current = Date.now()
    timeLeftRef.current = c.time
    updateTimerHUD()

    tickerRef.current = setInterval(() => {
      if (!activeRef.current || wonRef.current) return
      timeLeftRef.current = c.time - (Date.now() - t0Ref.current) / 1000
      if (timeLeftRef.current <= 0) {
        timeLeftRef.current = 0
        updateTimerHUD()
        endGame(false)
        return
      }
      updateTimerHUD()
    }, 200)

    canvas.addEventListener('touchstart', onTouch, { passive: false })
    canvas.addEventListener('touchmove', onTouch, { passive: false })
    canvas.addEventListener('touchend', () => {}, { passive: false })
    canvas.addEventListener('mousedown', onMouse)
    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('mouseup', () => {})

    rafRef.current = requestAnimationFrame(loop)

    setPhase('game')
  }, [diff, generateMaze, resetPlayer, updateTimerHUD, endGame, onTouch, onMouse, loop])

  const countdown = useCallback((d) => {
    setDiff(d)
    setCdownN(3)
    setPhase('countdown')
  }, [])

  useEffect(() => {
    if (phase !== 'countdown') return
    if (cdownN > 0) {
      const t = setTimeout(() => { sfx.countdownTick(); setCdownN(n => n - 1) }, 850)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => { sfx.select(); startGame() }, 550)
    return () => clearTimeout(t)
  }, [phase, cdownN, startGame])

  useEffect(() => {
    return () => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.removeEventListener('touchstart', onTouch)
        canvas.removeEventListener('touchmove', onTouch)
        canvas.removeEventListener('touchend', () => {})
        canvas.removeEventListener('mousedown', onMouse)
        canvas.removeEventListener('mousemove', onMouse)
        canvas.removeEventListener('mouseup', () => {})
      }
      cleanup()
    }
  }, [onTouch, onMouse, cleanup])

  const timerRatio = cfg ? displayTime / cfg.time : 1
  const timerClass = timerRatio <= 0.15 ? 'mz-t-danger' : timerRatio <= 0.33 ? 'mz-t-warn' : ''

  const formatTime = (sec) => {
    const t = Math.max(0, Math.ceil(sec))
    const m = Math.floor(t / 60)
    const s = t % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  if (phase === 'select') {
    return (
      <div className="mz-screen mz-grid-bg">
        <div className="mz-sel-tag">Minigame · MG-02</div>
        <div className="mz-sel-title">LABIRINTO</div>
        <div className="mz-sel-sub">{t('maze_rafael.subtitulo')}</div>
        <div className="mz-btns">
          <button className="mz-diff-btn mz-dif-easy" onClick={() => countdown('easy')}>
            <span className="mz-dn">◎ {gt('games.minigames.dif_facil')}</span>
            <span className="mz-di">{t('maze_rafael.dif_easy')}</span>
          </button>
          <button className="mz-diff-btn mz-dif-normal" onClick={() => countdown('normal')}>
            <span className="mz-dn">◎ {gt('games.minigames.dif_medio')}</span>
            <span className="mz-di">{t('maze_rafael.dif_normal')}</span>
          </button>
          <button className="mz-diff-btn mz-dif-hard" onClick={() => countdown('hard')}>
            <span className="mz-dn">◎ {gt('games.minigames.dif_dificil')}</span>
            <span className="mz-di">{t('maze_rafael.dif_hard')}</span>
          </button>
        </div>
        <div className="mz-back-row">
          <button className="mz-back-btn" onClick={onBack}>← {gt('games.minigames.voltar')}</button>
        </div>
      </div>
    )
  }

  if (phase === 'countdown') {
    const showText = cdownN === 0 ? 'GO!' : String(cdownN)
    const col = cdownN === 0 && cfg ? cfg.col : '#00e5ff'
    return (
      <div className="mz-screen mz-cdown">
        <div className="mz-cdown-n" style={{ color: col, textShadow: `0 0 30px ${col}` }} key={cdownN}>
          {showText}
        </div>
      </div>
    )
  }

  return (
    <div className="mz-screen mz-game">
      <div className="mz-hud" ref={hudRef}>
        <button className="mz-hud-back" onClick={() => { cleanup(); setPhase('select') }} aria-label="Voltar">
          ←
        </button>
        <div className={`mz-hud-timer ${timerClass}`}>
          {formatTime(displayTime || 0)}
        </div>
        <div className="mz-hud-center">
          <span className="mz-hud-errors">{errors}</span>
          <span className="mz-hud-lbl">{t('maze_rafael.hud_erros')}</span>
        </div>
        <div className="mz-hud-diff" style={{ color: cfg?.col }}>
          {cfg?.label}
        </div>
      </div>
      <div className="mz-arena" ref={arenaRef}>
        <canvas ref={canvasRef} className="mz-canvas" />
      </div>
    </div>
  )
}
