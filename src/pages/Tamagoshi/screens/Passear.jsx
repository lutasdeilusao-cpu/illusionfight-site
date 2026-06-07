import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import kronikIdle from '../../../assets/images/tamagoshi/kroniki-idle.png'

const LANE_COUNT = 5, GAME_W = 360, GAME_H = 560
const BASE_SPEED = 4, STAGE_COUNT = 10, LIVES = 3

export default function Passear({ onConcluir }) {
  const store = useTamagoshiStore()
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const imgRef = useRef(null)
  const g = useRef({ running: false, lane: 2, score: 0, coinsCollected: 0, lives: LIVES, stage: 1, frame: 0, roadOff: 0, speed: BASE_SPEED, lastObs: 0, lastCoin: 0, obstacles: [], coins: [] })
  const [phase, setPhase] = useState('ready')
  const [stage, setStage] = useState(1)
  const [dispScore, setDisp] = useState(0)
  const [dispCoins, setDispCoins] = useState(0)
  const [historico, setHistorico] = useState([])

  useEffect(() => {
    const img = new Image()
    img.src = kronikIdle
    img.onload = () => { imgRef.current = img }
  }, [])

  function draw() {
    const ca = canvasRef.current; if (!ca) return
    const ctx = ca.getContext('2d'); if (!ctx) return
    const s = g.current
    const W = GAME_W, H = GAME_H, lw = W / LANE_COUNT
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#1e1e4a'; ctx.fillRect(lw, 0, W - lw * 2, H)
    ctx.strokeStyle = '#ffffff88'; ctx.lineWidth = 2; ctx.setLineDash([14, 10])
    for (let i = 1; i < LANE_COUNT; i++) { ctx.beginPath(); ctx.moveTo(lw * i, 0); ctx.lineTo(lw * i, H); ctx.stroke() }
    ctx.setLineDash([])
    ctx.strokeStyle = '#ffffffcc'; ctx.lineWidth = 3
    for (let y = -(48+24) + (s.roadOff % (48+24)); y < H + (48+24); y += 48+24) {
      for (let lane = 1; lane < LANE_COUNT; lane++) { ctx.beginPath(); ctx.moveTo(lw * lane, y); ctx.lineTo(lw * lane, y + 48); ctx.stroke() }
    }
    ctx.font = '38px "Segoe UI Emoji","Apple Color Emoji",sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    for (const ob of s.obstacles) { ctx.fillText(ob.e, ob.x + 25, ob.y + 25) }
    // Estrela com brilho pulsante
    const glow = 0.4 + 0.6 * Math.abs(Math.sin(s.frame * 0.08))
    for (const c of s.coins) {
      ctx.save()
      ctx.globalAlpha = glow
      ctx.shadowColor = '#FFD700'
      ctx.shadowBlur = 20
      ctx.font = '30px "Segoe UI Emoji","Apple Color Emoji",sans-serif'
      ctx.fillText(c.e, c.x + 18, c.y + 18)
      ctx.restore()
      ctx.font = '30px "Segoe UI Emoji","Apple Color Emoji",sans-serif'
      ctx.globalAlpha = 1
      ctx.fillText(c.e, c.x + 18, c.y + 18)
    }
    const cx = lw * s.lane + (lw - 50) / 2 + 25
    const cy = H - 50 - 16 + 25
    ctx.save()
    // Animação de dano: girar 360° + emoji de raiva
    if (s.dmgTimer > 0) {
      const rot = (1 - s.dmgTimer / 15) * Math.PI * 2
      ctx.translate(cx, cy)
      ctx.rotate(rot)
      ctx.beginPath()
      ctx.arc(0, 0, 25, 0, Math.PI * 2)
      ctx.clip()
      if (imgRef.current && imgRef.current.complete) {
        ctx.drawImage(imgRef.current, -25, -25, 50, 50)
      }
      ctx.restore()
      // Emoji de raiva acima
      ctx.save()
      ctx.font = '28px "Segoe UI Emoji","Apple Color Emoji",sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('😠', cx, cy - 40)
      ctx.restore()
    } else {
      ctx.beginPath()
      ctx.arc(cx, cy, 25, 0, Math.PI * 2)
      ctx.clip()
      if (imgRef.current && imgRef.current.complete) {
        ctx.drawImage(imgRef.current, cx - 25, cy - 25, 50, 50)
      } else {
        ctx.fillStyle = '#FF3366'; ctx.fill()
        ctx.fillStyle = '#fff'; ctx.font = 'bold 20px monospace'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('K', cx, cy + 1)
      }
      ctx.restore()
    }
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, W, 40)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace'; ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'; ctx.fillText('\uD83D\uDEE3\uFE0F ' + s.score, 12, 20)
    ctx.textAlign = 'right'
    let h = ''; for (let i = 0; i < LIVES; i++) h += i < s.lives ? '❤️' : '🖤'
    ctx.fillText(h, W - 12, 20)
    ctx.fillStyle = '#FFD700'; ctx.textAlign = 'left'; ctx.font = '11px monospace'; ctx.textBaseline = 'bottom'
    ctx.fillText('\u25C6 ' + s.coinsCollected, 12, H - 8)
    ctx.fillStyle = '#aaa'; ctx.textAlign = 'center'; ctx.font = '12px monospace'; ctx.textBaseline = 'middle'
    ctx.fillText('pista ' + s.stage + '/' + STAGE_COUNT, W / 2, 20)
  }

  function tick() {
    const s = g.current; if (!s.running) return
    try {
      s.frame++
      // Pausa temporária após dano (efeito visual)
      if (s.dmgTimer > 0) { s.dmgTimer--; draw(); return }
      s.speed = BASE_SPEED + (s.stage - 1) * 0.6; s.roadOff += s.speed
      s.score = Math.floor(s.frame * s.speed / 6) + s.stage * 200
      const lw = GAME_W / LANE_COUNT
      if (s.frame - (s.lastObs || 0) > Math.max(30, 70 - (s.stage - 1) * 5)) {
        s.lastObs = s.frame
        s.obstacles.push({ x: lw * Math.floor(Math.random() * LANE_COUNT), y: -50, e: ['🪨','🌳','🧱','🗿','🪵'][Math.floor(Math.random() * 5)] })
      }
      if (s.frame - (s.lastCoin || 0) > Math.max(60, 120 - (s.stage - 1) * 8)) {
        s.lastCoin = s.frame
        s.coins.push({ x: lw * Math.floor(Math.random() * LANE_COUNT) + 7, y: -36, e: '⭐' })
      }
      const cx = lw * s.lane + lw / 2
      const cy = GAME_H - 50 - 16 + 25
      s.obstacles = s.obstacles.filter(o => {
        o.y += s.speed
        if (o.y > GAME_H) return false
        if (o.x < cx + 25 - 8 && o.x + 50 > cx - 25 + 8 && o.y < cy + 25 - 8 && o.y + 50 > cy - 25 + 8) {
          s.lives--
          s.dmgTimer = 15 // pause 15 frames = ~450ms
          if (s.lives <= 0) { endGame(); return false }
          return false
        }
        return true
      })
      s.coins = s.coins.filter(c => {
        c.y += s.speed
        if (c.y > GAME_H) return false
        if (c.x < cx + 25 - 4 && c.x + 36 > cx - 25 + 4 && c.y < cy + 25 - 4 && c.y + 36 > cy - 25 + 4) {
          s.score += 50; s.coinsCollected++; return false
        }
        return true
      })
      if (s.score >= s.stage * 500 && s.stage < STAGE_COUNT) { s.stage++; setStage(s.stage) }
      if (s.frame % 10 === 0) { setDisp(s.score); setDispCoins(s.coinsCollected) }
      draw()
    } catch (e) { console.error('[ENDURO]', e); s.running = false }
  }

  function endGame() {
    const s = g.current
    s.running = false
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDisp(s.score)
    setDispCoins(s.coinsCollected)
    // Salva no historico local
    const entry = { score: s.score, coins: s.coinsCollected, stage: s.stage, date: new Date().toLocaleString() }
    try {
      const saved = JSON.parse(localStorage.getItem('enduro-historico') || '[]')
      saved.unshift(entry)
      if (saved.length > 5) saved.length = 5
      localStorage.setItem('enduro-historico', JSON.stringify(saved))
      setHistorico(saved)
    } catch (e) {}
    setPhase('gameover')
    try { store.passear(); store.verificarBadge?.(store._userId, 'passeio') } catch (e) {}
  }

  function startGame() {
    g.current = { running: true, lane: 2, score: 0, coinsCollected: 0, lives: LIVES, stage: 1, frame: 1, roadOff: 0, speed: BASE_SPEED, lastObs: 0, lastCoin: 0, obstacles: [], coins: [], dmgTimer: 0 }
    setStage(1); setDisp(0); setPhase('playing')
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick, 30)
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
    if (phase !== 'playing') return
    function os(x) { g.current.dragStart = x; g.current.dragLast = x }
    function om(x, isTouch) {
      if (g.current.dragStart == null) return
      const dx = x - g.current.dragStart, th = GAME_W / LANE_COUNT
      if (Math.abs(dx) > th * 0.3) {
        if (dx < 0 && g.current.lane > 0) g.current.lane--
        else if (dx > 0 && g.current.lane < LANE_COUNT - 1) g.current.lane++
        g.current.dragStart = x
      }
      if (isTouch) g.current.dragLast = x
    }
    function oe() { g.current.dragStart = null }
    const ca = canvasRef.current; if (!ca) return
    ca.addEventListener('touchstart', e => { e.preventDefault(); os(e.touches[0].clientX) }, { passive: false })
    ca.addEventListener('touchmove', e => { e.preventDefault(); om(e.touches[0].clientX, true) }, { passive: false })
    ca.addEventListener('touchend', oe)
    ca.addEventListener('mousedown', e => os(e.clientX))
    ca.addEventListener('mousemove', e => { if (e.buttons === 1) om(e.clientX, false) })
    ca.addEventListener('mouseup', oe); ca.addEventListener('mouseleave', oe)
  }, [phase])

  useEffect(() => {
    // Carrega historico ao montar
    try {
      const saved = JSON.parse(localStorage.getItem('enduro-historico') || '[]')
      setHistorico(saved)
    } catch (e) {}
  }, [])

  useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current); g.current.running = false } }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0', userSelect: 'none' }}>
      <AnimatePresence mode="wait">
        {phase === 'ready' && (
          <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ textAlign: 'center', maxWidth: 320, padding: '0 1rem' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏎</div>
            <p style={{ fontSize: 16, marginBottom: 4, fontWeight: 700, letterSpacing: '0.05em', color: '#F5A623' }}>ENDURO KRONIKI</p>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 6, lineHeight: 1.5 }}>{STAGE_COUNT} pistas desvie colete ⭐</p>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 20 }}>setas ou arraste</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame} className="tama-btn">INICIAR</motion.button>
          </motion.div>
        )}
        {phase === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'relative', touchAction: 'none', overscrollBehavior: 'none' }}>
            <canvas ref={canvasRef} width={GAME_W} height={GAME_H}
              style={{ display: 'block', borderRadius: 12, touchAction: 'none', cursor: 'grab', maxWidth: '100%', boxShadow: '0 0 30px rgba(0,0,0,0.5)', overscrollBehavior: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#888', fontFamily: 'monospace' }}>
              <span>moedas: {dispCoins}</span>
              <span>pista {stage}/{STAGE_COUNT}</span>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { g.current.running = false; if (intervalRef.current) clearInterval(intervalRef.current); onConcluir?.() }}
              className="tama-btn" style={{ marginTop: 8, opacity: 0.5, fontSize: '0.7rem' }}>
              desistir
            </motion.button>
          </motion.div>
        )}
        {phase === 'gameover' && (
          <motion.div key="gameover" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ textAlign: 'center', maxWidth: 320, padding: '0 1rem' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>💥</div>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#E02020' }}>FIM DE PASSEIO</p>
            {stage >= STAGE_COUNT && <p style={{ fontSize: 13, color: '#22C55E', marginBottom: 4 }}>Todas as pistas concluidas!</p>}
            <p style={{ fontSize: 32, fontWeight: 700, marginBottom: 4, color: '#F5A623' }}>\uD83D\uDEE3\uFE0F {dispScore}</p>
            <p style={{ fontSize: 14, color: '#FFD700', marginBottom: 16 }}>\u2B50 {dispCoins} coletadas</p>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>pista {stage}/{STAGE_COUNT}</p>
            {historico.length > 0 && (
              <div style={{ fontSize: 10, color: '#555', marginBottom: 12, width: '100%', textAlign: 'left' }}>
                <p style={{ fontSize: 10, color: '#666', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>ultimos resultados:</p>
                {historico.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', fontFamily: 'monospace' }}>
                    <span>\uD83D\uDEE3\uFE0F {h.score}</span>
                    <span>\u2B50 {h.coins}</span>
                    <span>p{h.stage}</span>
                    <span style={{ color: '#444' }}>{h.date}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame} className="tama-btn">JOGAR DE NOVO</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onConcluir?.()} className="tama-btn" style={{ opacity: 0.6 }}>VOLTAR</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
