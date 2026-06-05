import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import kronikIdle from '../../../assets/images/tamagoshi/kroniki-idle.png'

// ── Config ───────────────────────────────────────
const LANE_COUNT = 5
const GAME_W = 360
const GAME_H = 520
const CAR_W = 56
const CAR_H = 56
const OBJ_W = 42
const OBJ_H = 42
const COL_W = 30
const COL_H = 30
const BASE_SPEED = 2.5
const STAGE_COUNT = 10
const LIVES = 3

const OBSTACLES = ['🚗', '🪨', '🌳', '🚙', '🛻']
const COLLECTIBLES = ['⭐', '🍪', '💎']

function laneX(lane) {
  const lw = GAME_W / LANE_COUNT
  return lw * lane + lw / 2 - CAR_W / 2
}

export default function Passear({ onConcluir }) {
  const store = useTamagoshiStore()

  // ── Refs ──
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const rafRef = useRef(null)
  const s = useRef({
    running: false, lane: 2, obstacles: [], collectibles: [],
    score: 0, lives: LIVES, speed: BASE_SPEED, frame: 0,
    roadOff: 0, lastObs: 0, lastCol: 0, invincible: 0,
    dragStart: null,
  })

  // ── State ──
  const [phase, setPhase] = useState('ready')
  const [stage, setStage] = useState(1)
  const [dispScore, setDisp] = useState(0)
  const [dispLives, setLives] = useState(LIVES)

  const stageSpeed = BASE_SPEED + (stage - 1) * 0.4
  const stageObsInterval = Math.max(40, 90 - (stage - 1) * 5)

  // ── End game ──
  const endGame = useCallback(() => {
    s.current.running = false
    cancelAnimationFrame(rafRef.current)
    setDisp(s.current.score)
    setPhase('gameover')
    store.passear()
    store.verificarBadge?.(store._userId, 'passeio')
  }, [store])

  // ── Draw ──
  const draw = useCallback((ctx, img) => {
    const state = s.current
    const W = GAME_W, H = GAME_H, lw = W / LANE_COUNT

    ctx.clearRect(0, 0, W, H)

    // Road
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#2d2d44'
    ctx.fillRect(lw, 0, W - lw * 2, H)

    // Lane markers
    ctx.strokeStyle = '#ffffff18'
    ctx.lineWidth = 1.5
    ctx.setLineDash([18, 14])
    for (let i = 1; i < LANE_COUNT; i++) {
      ctx.beginPath(); ctx.moveTo(lw * i, 0); ctx.lineTo(lw * i, H); ctx.stroke()
    }
    ctx.setLineDash([])

    // Center dashes
    ctx.strokeStyle = '#ffffff44'
    ctx.lineWidth = 3
    const dash = 48, gap = 28, total = dash + gap
    const off = state.roadOff % total
    for (let y = -total + off; y < H + total; y += total) {
      for (let lane = 1; lane < LANE_COUNT; lane++) {
        ctx.beginPath(); ctx.moveTo(lw * lane, y); ctx.lineTo(lw * lane, y + dash); ctx.stroke()
      }
    }

    // Obstacles
    ctx.font = '28px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    for (const ob of state.obstacles) ctx.fillText(ob.emoji, ob.x + OBJ_W / 2, ob.y + OBJ_H / 2)

    // Collectibles
    ctx.font = '22px serif'
    for (const col of state.collectibles) ctx.fillText(col.emoji, col.x + COL_W / 2, col.y + COL_H / 2)

    // Car
    const cx = laneX(state.lane)
    const cy = H - CAR_H - 16
    if (state.invincible > 0 && Math.floor(state.frame / 4) % 2 === 0) {
      // pisca — não desenha
    } else if (img?.complete) {
      ctx.drawImage(img, cx, cy, CAR_W, CAR_H)
    } else {
      ctx.font = '36px serif'
      ctx.fillText('🐱', cx + CAR_W / 2, cy + CAR_H / 2)
    }

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, W, 42)
    ctx.fillStyle = '#fff'
    ctx.font = '500 13px sans-serif'
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText(`⭐ ${state.score}`, 12, 21)
    ctx.textAlign = 'right'
    let hearts = ''
    for (let i = 0; i < LIVES; i++) hearts += i < state.lives ? '❤️' : '🖤'
    ctx.fillText(hearts, W - 12, 21)
    ctx.fillStyle = '#888'
    ctx.font = '11px sans-serif'
    ctx.fillText(`pista ${stage}`, W / 2, 21)
  }, [stage])

  // ── Game loop ──
  const loop = useCallback(() => {
    const state = s.current
    if (!state.running) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    state.frame++
    state.speed = stageSpeed
    state.roadOff += state.speed
    state.score = Math.floor(state.frame * state.speed / 8) + stage * 200
    if (state.invincible > 0) state.invincible--

    // Spawn obstacles
    if (state.frame - state.lastObs > stageObsInterval) {
      state.lastObs = state.frame
      const lane = Math.floor(Math.random() * LANE_COUNT)
      const lw = GAME_W / LANE_COUNT
      state.obstacles.push({ x: lw * lane + (lw - OBJ_W) / 2, y: -OBJ_H, lane, emoji: OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)] })
    }

    // Spawn collectibles
    if (state.frame - state.lastCol > 100) {
      state.lastCol = state.frame
      const lane = Math.floor(Math.random() * LANE_COUNT)
      const lw = GAME_W / LANE_COUNT
      state.collectibles.push({ x: lw * lane + (lw - COL_W) / 2, y: -COL_H, lane, emoji: COLLECTIBLES[Math.floor(Math.random() * COLLECTIBLES.length)] })
    }

    const cx = laneX(state.lane)
    const cy = GAME_H - CAR_H - 16

    // Move & collide obstacles
    state.obstacles = state.obstacles.filter(ob => {
      ob.y += state.speed
      if (ob.y > GAME_H) return false
      if (state.invincible === 0 &&
        ob.x < cx + CAR_W - 8 && ob.x + OBJ_W > cx + 8 &&
        ob.y < cy + CAR_H - 8 && ob.y + OBJ_H > cy + 8) {
        state.lives--
        state.invincible = 90
        if (state.lives <= 0) { endGame(); return false }
        return false
      }
      return true
    })

    // Collect
    state.collectibles = state.collectibles.filter(col => {
      col.y += state.speed
      if (col.y > GAME_H) return false
      if (col.x < cx + CAR_W - 4 && col.x + COL_W > cx + 4 &&
        col.y < cy + CAR_H - 4 && col.y + COL_H > cy + 4) {
        state.score += 50
        return false
      }
      return true
    })

    // Check stage progress
    if (state.score >= stage * 500 && stage < STAGE_COUNT) {
      setStage(prev => prev + 1)
    }

    // Update UI every 15 frames
    if (state.frame % 15 === 0) { setDisp(state.score); setLives(state.lives) }

    draw(ctx, imgRef.current)
    rafRef.current = requestAnimationFrame(loop)
  }, [draw, endGame, stageSpeed, stageObsInterval, stage])

  // ── Start ──
  const startGame = useCallback(() => {
    const state = s.current
    Object.assign(state, {
      running: true, lane: 2, obstacles: [], collectibles: [],
      score: 0, lives: LIVES, speed: BASE_SPEED, frame: 0,
      roadOff: 0, lastObs: 0, lastCol: 0, invincible: 0,
    })
    setStage(1); setDisp(0); setLives(LIVES); setPhase('playing')
    rafRef.current = requestAnimationFrame(loop)
  }, [loop])

  // ── Controls ──
  const moveLeft = useCallback(() => { if (s.current.lane > 0) s.current.lane-- }, [])
  const moveRight = useCallback(() => { if (s.current.lane < LANE_COUNT - 1) s.current.lane++ }, [])

  // Keyboard
  useEffect(() => {
    if (phase !== 'playing') return
    const h = (e) => { if (e.key === 'ArrowLeft') moveLeft(); if (e.key === 'ArrowRight') moveRight() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [phase, moveLeft, moveRight])

  // Touch / mouse drag contínuo
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || phase !== 'playing') return

    const onStart = (x) => { s.current.dragStart = x }
    const onMove = (x) => {
      if (s.current.dragStart === null) return
      const dx = x - s.current.dragStart
      const threshold = GAME_W / LANE_COUNT
      if (Math.abs(dx) > threshold * 0.6) {
        if (dx < 0) moveLeft()
        else moveRight()
        s.current.dragStart = x
      }
    }
    const onEnd = () => { s.current.dragStart = null }

    const tStart = (e) => { onStart(e.touches[0].clientX) }
    const tMove = (e) => { onMove(e.touches[0].clientX) }
    const tEnd = () => { onEnd() }
    const mDown = (e) => { onStart(e.clientX) }
    const mMove = (e) => { if (e.buttons === 1) onMove(e.clientX) }
    const mUp = () => { onEnd() }

    canvas.addEventListener('touchstart', tStart, { passive: true })
    canvas.addEventListener('touchmove', tMove, { passive: true })
    canvas.addEventListener('touchend', tEnd)
    canvas.addEventListener('mousedown', mDown)
    canvas.addEventListener('mousemove', mMove)
    canvas.addEventListener('mouseup', mUp)
    canvas.addEventListener('mouseleave', mUp)
    return () => {
      canvas.removeEventListener('touchstart', tStart)
      canvas.removeEventListener('touchmove', tMove)
      canvas.removeEventListener('touchend', tEnd)
      canvas.removeEventListener('mousedown', mDown)
      canvas.removeEventListener('mousemove', mMove)
      canvas.removeEventListener('mouseup', mUp)
      canvas.removeEventListener('mouseleave', mUp)
    }
  }, [phase, moveLeft, moveRight])

  // Cleanup
  useEffect(() => {
    return () => { cancelAnimationFrame(rafRef.current); s.current.running = false }
  }, [])

  // Load image
  useEffect(() => {
    const img = new Image(); img.src = kronikIdle; imgRef.current = img
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '1.5rem 0', userSelect: 'none', WebkitUserSelect: 'none',
    }}>
      <AnimatePresence mode="wait">
        {/* ── TELA INICIAL ── */}
        {phase === 'ready' && (
          <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ textAlign: 'center', maxWidth: 320, padding: '0 1rem' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏎️</div>
            <p style={{ fontSize: 15, marginBottom: 4, fontWeight: 600, letterSpacing: '0.05em' }}>PASSAR COM KRONIKI</p>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 6, lineHeight: 1.5 }}>
              {STAGE_COUNT} pistas · desvie dos obstáculos · colete estrelas
            </p>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 20 }}>
              ← → ou arraste · quanto mais longe, mais difícil
            </p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="tama-btn"
            >
              [ iniciar passeio ]
            </motion.button>
          </motion.div>
        )}

        {/* ── JOGANDO ── */}
        {phase === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'relative' }}>
            <canvas ref={canvasRef} width={GAME_W} height={GAME_H}
              style={{ display: 'block', borderRadius: 12, touchAction: 'none', cursor: 'grab', maxWidth: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#666' }}>
              <span>← → arraste</span>
              <span>pista {stage}/{STAGE_COUNT}</span>
            </div>
          </motion.div>
        )}

        {/* ── GAME OVER ── */}
        {phase === 'gameover' && (
          <motion.div key="gameover" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ textAlign: 'center', maxWidth: 320, padding: '0 1rem' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>💥</div>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>FIM DE PASSEIO</p>
            {stage >= STAGE_COUNT && <p style={{ fontSize: 13, color: '#22C55E', marginBottom: 4 }}>🏁 Todas as pistas concluídas!</p>}
            <p style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>⭐ {dispScore}</p>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>pista {stage}/{STAGE_COUNT}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={startGame} className="tama-btn">
                [ jogar de novo ]
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => onConcluir?.()} className="tama-btn"
                style={{ opacity: 0.6 }}>
                [ voltar ]
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
