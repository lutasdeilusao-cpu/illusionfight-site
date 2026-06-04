import { useState, useEffect, useCallback, useRef } from 'react'
import { useSwipe } from '../../hooks/useSwipe'
import { useZoom } from '../../hooks/useZoom'
import { useViewportScroll } from '../../hooks/useViewportScroll'

function getVisionCone(r, c, dir, size, range = 2) {
  const cells = new Set()
  const deltas = [[-1,0],[0,1],[1,0],[0,-1]]
  const [dr, dc] = deltas[dir]
  for (let i = 1; i <= range; i++) {
    const nr = r + dr * i
    const nc = c + dc * i
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) cells.add(`${nr},${nc}`)
  }
  return cells
}

function calculateAllVision(cams, size, range = 2) {
  const all = new Set()
  for (const cam of cams) {
    const cone = getVisionCone(cam.r, cam.c, cam.direcao, size, range)
    cone.forEach(k => all.add(k))
  }
  return all
}

function temCaminhoLivre(visionCells, cameras, size) {
  const blocked = new Set(visionCells)
  cameras.forEach(cam => blocked.add(`${cam.r},${cam.c}`))
  if (blocked.has('0,0') || blocked.has(`${size-1},${size-1}`)) return false
  const visited = new Set(['0,0'])
  const queue = [[0,0]]
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
  while (queue.length) {
    const [r,c] = queue.shift()
    if (`${r},${c}` === `${size-1},${size-1}`) return true
    for (const [dr,dc] of dirs) {
      const nr=r+dr, nc=c+dc
      const key=`${nr},${nc}`
      if (nr>=0&&nr<size&&nc>=0&&nc<size&&!blocked.has(key)&&!visited.has(key)) {
        visited.add(key); queue.push([nr,nc])
      }
    }
  }
  return false
}

function gerarCameras(size, count) {
  const cams = []
  const used = new Set(['0,0',`${size-1},${size-1}`])
  for (let i = 0; i < count; i++) {
    let r, c, attempts = 0
    do {
      r = Math.floor(Math.random() * size)
      c = Math.floor(Math.random() * size)
      attempts++
      if (attempts > 100) break
    } while (used.has(`${r},${c}`))
    if (attempts > 100) continue
    used.add(`${r},${c}`)
    cams.push({ r, c, direcao: Math.floor(Math.random() * 4), intervalo: 2000 + Math.random() * 2000 })
  }
  return cams
}

export default function PuzzleStealthGrid({ onSolve, onFail, config = {} }) {
  const size = config.size || 4
  const hasTimer = config.hasTimer || false
  const timerInicial = config.timerSegundos || 30
  const cameraCountConfig = config.cameraCount || Math.min(size - 1, 3)
  const visionRange = config.visionRange || 2
  const isMobile = window.innerWidth < 600

  const containerRef = useRef(null)
  const viewportRef = useRef(null)
  const gridRef = useRef(null)
  const [cellSize, setCellSize] = useState(44)

  const viewportCells = isMobile ? (size >= 12 ? 7 : Math.min(6, size)) : size
  const viewportPx = viewportCells * cellSize

  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 })
  const [cameras, setCameras] = useState([])
  const [visionCells, setVisionCells] = useState(new Set())
  const [alarm, setAlarm] = useState(false)
  const [caughtCell, setCaughtCell] = useState(null)
  const [timeLeft, setTimeLeft] = useState(timerInicial)
  const [done, setDone] = useState(false)
  const [toast, setToast] = useState(false)
  const { zoom, setZoom, controlsVisible, showControls } = useZoom({ min: 1, max: 3 })
  const zoomTimerRef = useRef(null)
  const pegadasTimerRef = useRef(null)

  const [pegadasVisiveis, setPegadasVisiveis] = useState(false)
  const [pegadasPos, setPegadasPos] = useState([])

  const goalPos = { r: size-1, c: size-1 }

  console.log('[STEALTH] hard mode | visionRange:', visionRange, '| pegadas ativas:', pegadasVisiveis)

  useEffect(() => {
    const update = () => {
      const el = containerRef.current
      if (!el) return
      const w = el.offsetWidth || 400
      const maxCells = isMobile ? viewportCells : size
      const computed = Math.floor((w - 8) / maxCells)
      setCellSize(Math.max(24, Math.min(44, computed)))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [size, isMobile, viewportCells])

  useEffect(() => {
    let camsValidas, visionValida
    const maxTentativas = size >= 12 ? 30 : size >= 8 ? 20 : 10
    let tentativas = 0
    do {
      camsValidas = gerarCameras(size, cameraCountConfig)
      visionValida = calculateAllVision(camsValidas, size, visionRange)
      visionValida.delete('0,0')
      visionValida.delete(`${size-1},${size-1}`)
      tentativas++
      console.log(`[STEALTH] tentativa ${tentativas} | caminho livre:`, temCaminhoLivre(visionValida, camsValidas, size))
    } while (!temCaminhoLivre(visionValida, camsValidas, size) && tentativas < maxTentativas)
    console.log('[STEALTH] size:', size, '| maxTentativas:', maxTentativas, '| tentativas usadas:', tentativas)
    setCameras(camsValidas)
    setVisionCells(visionValida)

    const timers = camsValidas.map((cam, idx) =>
      setInterval(() => {
        setCameras(prev => {
          const next = [...prev]
          const cur = next[idx]
          if (!cur) return prev
          const newDir = Math.random() < 0.7 ? (cur.direcao+1)%4 : (cur.direcao+3)%4
          next[idx] = { ...cur, direcao: newDir }
          return next
        })
      }, cam.intervalo)
    )
    return () => timers.forEach(t => clearInterval(t))
  }, [])

  useEffect(() => {
    if (cameras.length === 0) return
    const v = calculateAllVision(cameras, size, visionRange)
    v.delete('0,0')
    v.delete(`${size-1},${size-1}`)
    setVisionCells(v)
  }, [cameras])

  // Viewport scroll via hook
  const gridOffset = useViewportScroll(playerPos, cellSize, viewportPx, size)

  // Swipe via hook
  useSwipe(viewportRef, handleMove)

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

  // Pegadas Hard
  useEffect(() => {
    if (size < 12 || done) return
    const ciclo = () => {
      const pts = []
      for (let i = 1; i <= 4; i++) {
        const t = i / 5
        const r = Math.round(playerPos.r + (goalPos.r - playerPos.r) * t) + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2)
        const c = Math.round(playerPos.c + (goalPos.c - playerPos.c) * t) + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2)
        if (r >= 0 && r < size && c >= 0 && c < size) pts.push({ r: Math.max(0, Math.min(size-1, r)), c: Math.max(0, Math.min(size-1, c)) })
      }
      setPegadasPos(pts)
      setPegadasVisiveis(true)
      setTimeout(() => setPegadasVisiveis(false), 3000)
    }
    ciclo()
    const t = setInterval(ciclo, 10000)
    pegadasTimerRef.current = t
    return () => clearInterval(t)
  }, [done, size])

  useEffect(() => {
    const handleKey = (e) => {
      if (done) return
      const moves = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1], w:[-1,0], s:[1,0], a:[0,-1], d:[0,1] }
      const delta = moves[e.key]
      if (delta) { e.preventDefault(); handleMove(delta[0], delta[1]) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [playerPos, cameras, done, alarm, visionCells])

  const handleMove = useCallback((dr, dc) => {
    if (done || alarm) return
    const nr = playerPos.r + dr
    const nc = playerPos.c + dc
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) return
    const currentVision = calculateAllVision(cameras, size, visionRange)
    currentVision.delete('0,0')
    currentVision.delete(`${size-1},${size-1}`)
    const onCamera = cameras.some(cam => cam.r === nr && cam.c === nc)
    const inVision = currentVision.has(`${nr},${nc}`)
    if (onCamera || inVision) {
      setPlayerPos({ r: nr, c: nc })
      setCaughtCell({ r: nr, c: nc })
      setAlarm(true); setDone(true); setToast(true)
      setTimeout(() => setToast(false), 1500)
      setTimeout(() => onFail?.(), 1800)
      return
    }
    setPlayerPos({ r: nr, c: nc })
    if (nr === goalPos.r && nc === goalPos.c) {
      setDone(true)
      setTimeout(() => onSolve?.(), 300)
    }
  }, [playerPos, cameras, done, alarm, visionCells, visionRange])

  console.log('[HOOKS] useSwipe, useZoom, useViewportScroll extraídos e aplicados no Stealth')

  const distToGoal = Math.abs(playerPos.r - goalPos.r) + Math.abs(playerPos.c - goalPos.c)
  const showGoalArrow = isMobile && (distToGoal > viewportCells || size >= 12) && zoom < 3
  const goalArrowDir = (() => {
    const dr = goalPos.r - playerPos.r
    const dc = goalPos.c - playerPos.c
    if (Math.abs(dr) > Math.abs(dc)) return dr > 0 ? '↓' : '↑'
    return dc > 0 ? '→' : '←'
  })()

  const zoomScale = zoom === 3 ? viewportPx / (size * cellSize) : zoom === 2 ? 0.65 : 1

  return (
    <div ref={containerRef} className="puzzle-container" style={{ userSelect: 'none' }}>
      <div className="puzzle-title">🥷 Grade de Infiltração</div>
      <p className="puzzle-desc">evite as câmeras e seus cones de visão. use WASD, setas ou swipe.</p>
      {hasTimer && <p className="puzzle-timer">⏱️ {timeLeft}s</p>}
      {done && !alarm && <p style={{ color: '#22C55E', textAlign: 'center', fontFamily: "'Share Tech Mono',monospace" }}>✓ passou.</p>}

      <div ref={viewportRef} className="puzzle-stealth-viewport"
        style={{ width: viewportPx, height: viewportPx, overflow: isMobile && zoom < 3 ? 'hidden' : 'visible', position: 'relative', margin: '0 auto', cursor: 'crosshair' }}
        onTouchStart={showControls} onClick={showControls}>
        {toast && <div className="puzzle-stealth-toast">você foi capturado</div>}

        <div ref={gridRef} className="puzzle-stealth-grid" style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)`, transform: `scale(${zoomScale}) translate(${gridOffset.x}px, ${gridOffset.y}px)`, transformOrigin: 'top left', width: size * cellSize, position: 'relative' }}>
          {Array.from({ length: size * size }, (_, i) => {
            const r = Math.floor(i / size)
            const c = i % size
            const isPlayer = playerPos.r === r && playerPos.c === c
            const isGoal = goalPos.r === r && goalPos.c === c
            const isCam = cameras.some(cam => cam.r === r && cam.c === c)
            const isVision = visionCells.has(`${r},${c}`)
            const isCaught = caughtCell?.r === r && caughtCell?.c === c
            const isPegada = pegadasVisiveis && size >= 12 && pegadasPos.some(p => p.r === r && p.c === c)

            let cellClass = 'puzzle-stealth-cell'
            if (isPlayer) cellClass += isCaught ? ' puzzle-stealth-cell--caught' : ' puzzle-stealth-cell--player'
            else if (isGoal) cellClass += ' puzzle-stealth-cell--goal'
            else if (isCam) cellClass += ' puzzle-stealth-cell--camera'
            else if (isVision) cellClass += ' puzzle-stealth-cell--vision'

            return (
              <div key={i} className={cellClass} style={{ width: cellSize, height: cellSize, position: 'relative' }}>
                {isPlayer ? (isCaught ? '💀' : '🕵️') : isGoal ? <span className="puzzle-stealth-goal-icon">🏁</span> : isCam ? '📹' : ''}
                {isPegada && !isPlayer && !isGoal && !isCam && <span className="puzzle-stealth-pegada">👣</span>}
              </div>
            )
          })}
        </div>

        {showGoalArrow && <div className="puzzle-stealth-goal-arrow">{goalArrowDir}</div>}
      </div>

      {isMobile && (
        <div className="puzzle-stealth-zoom-btns" style={{ opacity: controlsVisible ? 1 : 0.2, transition: 'opacity 0.3s' }}>
          <button onClick={() => { setZoom(z => Math.max(1, z-1)); showControls() }} className="puzzle-stealth-zoom-btn">−</button>
          <span className="puzzle-stealth-zoom-label">{zoom === 1 ? 'NORMAL' : zoom === 2 ? 'WIDE' : 'MAPA'}</span>
          <button onClick={() => { setZoom(z => Math.min(3, z+1)); showControls() }} className="puzzle-stealth-zoom-btn">+</button>
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
