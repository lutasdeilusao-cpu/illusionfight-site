const fs = require('fs')

const code = `import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import kronikIdle from '../../../assets/images/tamagoshi/kroniki-idle.png'

const LANE_COUNT = 5
const GAME_W = 360
const GAME_H = 560
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

function createState() {
  return { running: false, lane: 2, obstacles: [], score: 0, lives: LIVES, speed: BASE_SPEED, frame: 0, roadOff: 0, lastObs: 0, lastCol: 0, invincible: 0, dragStart: null, stage: 1 }
}

export default function Passear({ onConcluir }) {
  const store = useTamagoshiStore()
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const rafRef = useRef(null)
  const g = useRef(createState())
  const [phase, setPhase] = useState('ready')
  const [stage, setStage] = useState(1)
  const [dispScore, setDisp] = useState(0)

  function draw() {
    const state = g.current
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = GAME_W, H = GAME_H, lw = W / LANE_COUNT
    ctx.clearRect(0, 0, W, H)
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#0d0d2b')
    grad.addColorStop(1, '#1a1a3e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#2a2a50'
    ctx.fillRect(lw, 0, W - lw * 2, H)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([12, 10])
    for (let i = 1; i < LANE_COUNT; i++) {
      ctx.beginPath(); ctx.moveTo(lw * i, 0); ctx.lineTo(lw * i, H); ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 3
    const dash = 40, gap = 24, total = dash + gap
    const off = state.roadOff % total
    for (let y = -total + off; y < H + total; y += total) {
      for (let lane = 1; lane < LANE_COUNT; lane++) {
        ctx.beginPath(); ctx.moveTo(lw * lane, y); ctx.lineTo(lw * lane, y + dash); ctx.stroke()
      }
    }
    ctx.font = '26px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const ob of state.obstacles) {
      ctx.fillText(ob.emoji, ob.x + OBJ_W / 2, ob.y + OBJ_H / 2)
    }
    const cx = laneX(state.lane)
    const cy = H - CAR_H - 16
    const piscando = state.invincible > 0 && Math.floor(state.frame / 4) % 2 === 0
    if (!piscando) {
      const img = imgRef.current
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx + CAR_W / 2, cy + CAR_H / 2, CAR_W / 2 - 4, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, cx + 4, cy + 4, CAR_W - 8, CAR_H - 8)
        ctx.restore()
      } else {
        ctx.font = '32px sans-serif'
        ctx.fillText('🐱', cx + CAR_W / 2, cy + CAR_H / 2 + 2)
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.8)'
    ctx.fillRect(0, 0, W, 40)
    ctx.fillStyle = '#eee'
    ctx.font = 'bold 13px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('⭐ ' + state.score, 12, 20)
    ctx.textAlign = 'right'
    let h = ''
    for (let i = 0; i < LIVES; i++) h += i < state.lives ? '❤️' : '🖤'
    ctx.fillText(h, W - 12, 20)
    ctx.fillStyle = '#999'
    ctx.textAlign = 'center'
    ctx.font = '12px monospace'
    ctx.fillText('pista ' + state.stage + '/' + STAGE_COUNT, W / 2, 20)
  }

  function loop() {
    const state = g.current
    if (!state.running) return
    try {
      const canvas = canvasRef.current
      if (!canvas) return
      state.frame++
      state.speed = BASE_SPEED + (state.stage - 1) * 0.4
      state.roadOff += state.speed
      state.score = Math.floor(state.frame * state.speed / 8) + state.stage * 200
      if (state.invincible > 0) state.invincible--
      const lw = GAME_W / LANE_COUNT
      const obsInterval = Math.max(40, 90 - (state.stage - 1) * 5)
      if (state.frame - state.lastObs > obsInterval) {
        state.lastObs = state.frame
        const lane = Math.floor(Math.random() * LANE_COUNT)
        state.obstacles.push({ x: lw * lane + (lw - OBJ_W) / 2, y: -OBJ_H, lane, emoji: OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)] })
      }
      if (state.frame - state.lastCol > 100) {
        state.lastCol = state.frame
        const lane = Math.floor(Math.random() * LANE_COUNT)
        state.obstacles.push({ x: lw * lane + (lw - COL_W) / 2, y: -COL_H, lane, emoji: COLLECTIBLES[Math.floor(Math.random() * COLLECTIBLES.length)] })
      }
      const cx = laneX(state.lane)
      const cy = GAME_H - CAR_H - 16
      state.obstacles = state.obstacles.filter(ob => {
        ob.y += state.speed
        if (ob.y > GAME_H) return false
        if (state.invincible === 0 && ob.x < cx + CAR_W - 8 && ob.x + OBJ_W > cx + 8 && ob.y < cy + CAR_H - 8 && ob.y + OBJ_H > cy + 8) {
          state.lives--; state.invincible = 90
          if (state.lives <= 0) { endGame(); return false }
          return false
        }
        if (COLLECTIBLES.includes(ob.emoji) && ob.x < cx + CAR_W - 4 && ob.x + COL_W > cx + 4 && ob.y < cy + CAR_H - 4 && ob.y + COL_H > cy + 4) {
          state.score += 50; return false
        }
        return true
      })
      if (state.score >= state.stage * 500 && state.stage < STAGE_COUNT) {
        state.stage++
        setStage(state.stage)
      }
      if (state.frame % 15 === 0) setDisp(state.score)
      draw()
    } catch (e) { console.error('[ENDURO] loop error:', e); state.running = false; return }
    rafRef.current = requestAnimationFrame(loop)
  }

  function endGame() {
    const state = g.current
    state.running = false
    cancelAnimationFrame(rafRef.current)
    setDisp(state.score)
    setPhase('gameover')
    try { store.passear(); store.verificarBadge?.(store._userId, 'passeio') } catch (e) { console.error('[ENDURO] end error:', e) }
  }

  function startGame() {
    const state = createState()
    state.running = true
    g.current = state
    setStage(1); setDisp(0); setPhase('playing')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (g.current.running) rafRef.current = requestAnimationFrame(loop)
      })
    })
  }

  useEffect(() => {
    if (phase !== 'playing') return
    function h(e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); if (g.current.lane > 0) g.current.lane-- }
      if (e.key === 'ArrowRight') { e.preventDefault(); if (g.current.lane < LANE_COUNT - 1) g.current.lane++ }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [phase])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || phase !== 'playing') return
    function os(x) { g.current.dragStart = x }
    function om(x) {
      if (g.current.dragStart === null) return
      const dx = x - g.current.dragStart
      const th = GAME_W / LANE_COUNT
      if (Math.abs(dx) > th * 0.5) {
        if (dx < 0 && g.current.lane > 0) g.current.lane--
        else if (dx > 0 && g.current.lane < LANE_COUNT - 1) g.current.lane++
        g.current.dragStart = x
      }
    }
    function oe() { g.current.dragStart = null }
    canvas.addEventListener('touchstart', e => os(e.touches[0].clientX), { passive: true })
    canvas.addEventListener('touchmove', e => om(e.touches[0].clientX), { passive: true })
    canvas.addEventListener('touchend', oe)
    canvas.addEventListener('mousedown', e => os(e.clientX))
    canvas.addEventListener('mousemove', e => { if (e.buttons === 1) om(e.clientX) })
    canvas.addEventListener('mouseup', oe)
    canvas.addEventListener('mouseleave', oe)
    return () => { canvas.replaceWith(canvas.cloneNode(true)) }
  }, [phase])

  useEffect(() => { return () => { cancelAnimationFrame(rafRef.current); g.current.running = false } }, [])

  useEffect(() => {
    const img = new Image()
    img.src = kronikIdle
    img.onload = () => { imgRef.current = img }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0', userSelect: 'none' }}>
      <AnimatePresence mode="wait">
        {phase === 'ready' && (
          <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ textAlign: 'center', maxWidth: 320, padding: '0 1rem' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏎️</div>
            <p style={{ fontSize: 16, marginBottom: 4, fontWeight: 700, letterSpacing: '0.05em', color: '#F5A623' }}>ENDURO KRONIKI</p>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 6, lineHeight: 1.5 }}>{STAGE_COUNT} pistas · desvie dos obstáculos · colete estrelas</p>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 20 }}>← → ou arraste · quanto mais longe, mais difícil</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame} className="tama-btn">[ INICIAR ]</motion.button>
          </motion.div>
        )}
        {phase === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'relative' }}>
            <canvas ref={canvasRef} width={GAME_W} height={GAME_H}
              style={{ display: 'block', borderRadius: 12, touchAction: 'none', cursor: 'grab', maxWidth: '100%', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#888', fontFamily: "'Share Tech Mono',monospace" }}>
              <span>← → arraste</span>
              <span>pista {stage}/{STAGE_COUNT}</span>
            </div>
          </motion.div>
        )}
        {phase === 'gameover' && (
          <motion.div key="gameover" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ textAlign: 'center', maxWidth: 320, padding: '0 1rem' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>💥</div>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#E02020' }}>FIM DE PASSEIO</p>
            {stage >= STAGE_COUNT && <p style={{ fontSize: 13, color: '#22C55E', marginBottom: 4 }}>🏁 Todas as pistas concluídas!</p>}
            <p style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#F5A623' }}>⭐ {dispScore}</p>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>pista {stage}/{STAGE_COUNT}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame} className="tama-btn">[ JOGAR DE NOVO ]</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onConcluir?.()} className="tama-btn" style={{ opacity: 0.6 }}>[ VOLTAR ]</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
`

fs.writeFileSync('src/pages/Tamagoshi/screens/Passear.jsx', code, 'utf8')
console.log('Passear.jsx rewritten OK')
