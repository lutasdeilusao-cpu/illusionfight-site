import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function getVisionCone(r, c, dir, size) {
  const cells = new Set()
  const deltas = [[-1,0],[0,1],[1,0],[0,-1]]
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

const CELL_SIZE = 44

export default function PuzzleStealthGrid({ onSolve, onFail, config = {} }) {
  const size = config.size || 4
  const hasTimer = config.hasTimer || false
  const timerInicial = config.timerSegundos || 30
  const cameraCountConfig = config.cameraCount || Math.min(size - 1, 3)
  const isMobile = window.innerWidth < 600

  const viewportCells = isMobile ? (size >= 12 ? 7 : Math.min(6, size)) : size
  const viewportPx = viewportCells * CELL_SIZE

  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 })
  const [cameras, setCameras] = useState([])
  const [visionCells, setVisionCells] = useState(new Set())
  const [alarm, setAlarm] = useState(false)
  const [caughtCell, setCaughtCell] = useState(null)
  const [timeLeft, setTimeLeft] = useState(timerInicial)
  const [done, setDone] = useState(false)
  const [toast, setToast] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [zoomBtnVisible, setZoomBtnVisible] = useState(false)
  const zoomTimerRef = useRef(null)
  const gridRef = useRef(null)

  const goalPos = { r: size-1, c: size-1 }

  useEffect(() => {
    let camsValidas, visionValida
    const maxTentativas = size >= 12 ? 30 : size >= 8 ? 20 : 10
    let tentativas = 0
    do {
      camsValidas = gerarCameras(size, cameraCountConfig)
      visionValida = calculateAllVision(camsValidas, size)
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
    const v = calculateAllVision(cameras, size)
    v.delete('0,0')
    v.delete(`${size-1},${size-1}`)
    setVisionCells(v)
  }, [cameras])

  useEffect(() => {
    if (!isMobile || !gridRef.current) return
    const targetX = playerPos.c * CELL_SIZE - viewportPx / 2 + CELL_SIZE / 2
    const targetY = playerPos.r * CELL_SIZE - viewportPx / 2 + CELL_SIZE / 2
    gridRef.current.scrollTo({ left: Math.max(0, targetX), top: Math.max(0, targetY), behavior: 'smooth' })
  }, [playerPos, isMobile])

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
    const currentVision = calculateAllVision(cameras, size)
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
  }, [playerPos, cameras, done, alarm, visionCells])

  // Swipe touch
  useEffect(() => {
    const container = gridRef.current
    if (!container) return
    let touchStartX = 0, touchStartY = 0
    const onStart = (e) => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY }
    const onEnd = (e) => {
      if (done) return
      const dx = e.changedTouches[0].clientX - touchStartX
      const dy = e.changedTouches[0].clientY - touchStartY
      const absDx = Math.abs(dx), absDy = Math.abs(dy)
      if (Math.max(absDx, absDy) < 15) return
      if (absDx > absDy) handleMove(0, dx > 0 ? 1 : -1)
      else handleMove(dy > 0 ? 1 : -1, 0)
    }
    container.addEventListener('touchstart', onStart, { passive: true })
    container.addEventListener('touchend', onEnd, { passive: true })
    return () => { container.removeEventListener('touchstart', onStart); container.removeEventListener('touchend', onEnd) }
  }, [handleMove, done])

  const showZoomBtns = () => {
    setZoomBtnVisible(true)
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
    zoomTimerRef.current = setTimeout(() => setZoomBtnVisible(false), 2000)
  }

  const distToGoal = Math.abs(playerPos.r - goalPos.r) + Math.abs(playerPos.c - goalPos.c)
  const showGoalArrow = isMobile && (distToGoal > viewportCells || size >= 12) && zoom < 3
  const goalArrowDir = (() => {
    const dr = goalPos.r - playerPos.r
    const dc = goalPos.c - playerPos.c
    if (Math.abs(dr) > Math.abs(dc)) return dr > 0 ? '↓' : '↑'
    return dc > 0 ? '→' : '←'
  })()

  const zoomScale = zoom === 3 ? viewportPx / (size * CELL_SIZE) : zoom === 2 ? 0.65 : 1

  return (
    <div className="puzzle-container" style={{ userSelect: 'none' }}>
      <div className="puzzle-title">🥷 Grade de Infiltração</div>
      <p className="puzzle-desc">evite as câmeras e seus cones de visão. use WASD, setas ou swipe.</p>
      {hasTimer && <p className="puzzle-timer">⏱️ {timeLeft}s</p>}
      {done && !alarm && <p style={{ color: '#22C55E', textAlign: 'center', fontFamily: "'Share Tech Mono',monospace" }}>✓ passou.</p>}

      <div ref={gridRef} className="puzzle-stealth-viewport"
        style={{ width: viewportPx, height: viewportPx, overflow: isMobile && zoom < 3 ? 'hidden' : 'visible', position: 'relative', margin: '0 auto', cursor: 'crosshair' }}
        onTouchStart={showZoomBtns} onClick={showZoomBtns}>
        {toast && <div className="puzzle-stealth-toast">você foi capturado</div>}

        <div className="puzzle-stealth-grid" style={{ gridTemplateColumns: `repeat(${size}, ${CELL_SIZE}px)`, transform: `scale(${zoomScale})`, transformOrigin: 'top left', width: size * CELL_SIZE }}>
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
            return (
              <div key={i} className={cellClass} style={{ width: CELL_SIZE, height: CELL_SIZE }}>
                {isPlayer ? (isCaught ? '💀' : '🕵️') : isGoal ? <span className="puzzle-stealth-goal-icon">🏁</span> : isCam ? '📹' : ''}
              </div>
            )
          })}
        </div>

        {showGoalArrow && <div className="puzzle-stealth-goal-arrow">{goalArrowDir}</div>}
      </div>

      {isMobile && (
        <div className="puzzle-stealth-zoom-btns" style={{ opacity: zoomBtnVisible ? 1 : 0.2, transition: 'opacity 0.3s' }}>
          <button onClick={() => { setZoom(z => Math.max(1, z-1)); showZoomBtns() }} className="puzzle-stealth-zoom-btn">−</button>
          <span className="puzzle-stealth-zoom-label">{zoom === 1 ? 'NORMAL' : zoom === 2 ? 'WIDE' : 'MAPA'}</span>
          <button onClick={() => { setZoom(z => Math.min(3, z+1)); showZoomBtns() }} className="puzzle-stealth-zoom-btn">+</button>
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
