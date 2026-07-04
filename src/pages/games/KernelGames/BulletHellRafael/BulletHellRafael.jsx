import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReader } from '../../../../context/ReaderContext'
import { useLanguage } from '../../../../context/LanguageContext'
import { useRafaelI18n } from '../_shared/useRafaelI18n'
import { sfx } from '../../../../lib/sfx'
import '../KernelGame.css'
import './PuzzleBulletHellRafael.css'

const CFG = {
  easy:   { n:5, time:15, speed:160, r:22, tracking:false, steerDeg:0,  labelKey:'games.minigames.dif_facil',   col:'#00e5ff' },
  normal: { n:7, time:20, speed:200, r:18, tracking:false, steerDeg:0,  labelKey:'games.minigames.dif_medio',  col:'#b400ff' },
  hard:   { n:5, time:20, speed:240, r:14, tracking:true,  steerDeg:10, labelKey:'games.minigames.dif_dificil', col:'#ff0055' },
}

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return `rgba(${r},${g},${b},${a})`
}

function PuzzleBulletHellRafael({ onSolve, onFail, onBack, initialDiff }) {
  const { t } = useRafaelI18n()
  const { t: gt } = useLanguage()

  const [phase, setPhase] = useState(initialDiff ? 'countdown' : 'select')
  const [diff, setDiff] = useState(initialDiff || null)
  const [cdownN, setCdownN] = useState(initialDiff ? 3 : 3)
  const [displayTime, setDisplayTime] = useState(0)

  const cfg = diff ? CFG[diff] : null
  const canvasRef = useRef(null)
  const hudRef = useRef(null)
  const rafRef = useRef(null)
  const tickerRef = useRef(null)
  const activeRef = useRef(false)
  const wonRef = useRef(false)
  const t0Ref = useRef(0)
  const timeLeftRef = useRef(0)
  const lastTimeRef = useRef(0)
  const waitingRef = useRef(true)

  const playerRef = useRef({ x:0, y:0, placed:false })
  const bulletsRef = useRef([])
  const WRef = useRef(0)
  const HRef = useRef(0)

  const cleanup = useCallback(() => {
    activeRef.current = false
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [])

  const endGame = useCallback((win) => {
    if (!activeRef.current) return
    cleanup()
    if (!win) {
      playerRef.current.alive = false
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = 'rgba(255,0,85,0.28)'
          ctx.fillRect(0, 0, WRef.current, HRef.current)
        }
      }
    }
    if (win) sfx.win(); else sfx.lose()
    const t = win ? 400 : 900
    setTimeout(() => { win ? onSolve?.() : onFail?.() }, t)
  }, [cleanup, onSolve, onFail])

  function spawnBullets() {
    const c = CFG[diff]
    const W = WRef.current, H = HRef.current
    const bullets = []
    for (let i = 0; i < c.n; i++) {
      const side = Math.floor(Math.random() * 4)
      let bx, by
      if (side === 0) { bx = Math.random() * W; by = -c.r * 2 }
      else if (side === 1) { bx = W + c.r * 2; by = Math.random() * H }
      else if (side === 2) { bx = Math.random() * W; by = H + c.r * 2 }
      else { bx = -c.r * 2; by = Math.random() * H }
      const cx = W / 2 + (Math.random() - .5) * W * .3
      const cy = H / 2 + (Math.random() - .5) * H * .3
      const ang = Math.atan2(cy - by, cx - bx)
      bullets.push({
        x: bx, y: by,
        vx: Math.cos(ang) * c.speed,
        vy: Math.sin(ang) * c.speed,
        phase: Math.random() * Math.PI * 2,
        isTracker: c.tracking && i === 0,
      })
    }
    bulletsRef.current = bullets
  }

  function updateBullets(dt) {
    const c = CFG[diff]
    const W = WRef.current, H = HRef.current
    const steer = c.steerDeg * (Math.PI / 180)
    const player = playerRef.current
    bulletsRef.current.forEach(b => {
      if (c.tracking && b.isTracker && player.placed) {
        const desired = Math.atan2(player.y - b.y, player.x - b.x)
        let current = Math.atan2(b.vy, b.vx)
        let delta = desired - current
        while (delta > Math.PI) delta -= Math.PI * 2
        while (delta < -Math.PI) delta += Math.PI * 2
        delta = Math.max(-steer, Math.min(steer, delta)) * dt * 60
        current += delta
        const sp = Math.hypot(b.vx, b.vy)
        b.vx = Math.cos(current) * sp
        b.vy = Math.sin(current) * sp
      }
      b.x += b.vx * dt
      b.y += b.vy * dt
      if (b.x - c.r < 0) { b.x = c.r; b.vx = Math.abs(b.vx) }
      if (b.x + c.r > W) { b.x = W - c.r; b.vx = -Math.abs(b.vx) }
      if (b.y - c.r < 0) { b.y = c.r; b.vy = Math.abs(b.vy) }
      if (b.y + c.r > H) { b.y = H - c.r; b.vy = -Math.abs(b.vy) }
    })
  }

  function checkCollision() {
    const player = playerRef.current
    if (!player.placed || !player.alive) return false
    const c = CFG[diff]
    const hitR = player.r + c.r - 4
    return bulletsRef.current.some(b =>
      Math.hypot(b.x - player.x, b.y - player.y) < hitR
    )
  }

  const draw = useCallback((ts) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = WRef.current, H = HRef.current
    const player = playerRef.current
    const c = CFG[diff]
    const now = ts / 1000

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#05050f'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(0,229,255,0.04)'
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    bulletsRef.current.forEach(b => {
      const bCol = b.isTracker ? '#ffcc00' : c.col
      const pulse = .7 + .3 * Math.sin(now * 4 + b.phase)
      const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, c.r * 2.5)
      grd.addColorStop(0, hexAlpha(bCol, .35 * pulse))
      grd.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(b.x, b.y, c.r * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = grd; ctx.fill()
      ctx.beginPath(); ctx.arc(b.x, b.y, c.r, 0, Math.PI * 2)
      ctx.fillStyle = hexAlpha(bCol, .15)
      ctx.strokeStyle = bCol
      ctx.lineWidth = b.isTracker ? 2.5 : 1.5
      ctx.fill()
      ctx.shadowColor = bCol; ctx.shadowBlur = 8 * pulse
      ctx.stroke(); ctx.shadowBlur = 0
      if (b.isTracker) {
        const ang = Math.atan2(b.vy, b.vx)
        ctx.beginPath()
        ctx.moveTo(b.x + Math.cos(ang) * c.r, b.y + Math.sin(ang) * c.r)
        ctx.lineTo(b.x + Math.cos(ang) * (c.r + 7), b.y + Math.sin(ang) * (c.r + 7))
        ctx.strokeStyle = hexAlpha('#ffcc00', .6); ctx.lineWidth = 1.5; ctx.stroke()
      }
    })

    if (player.placed && player.alive) {
      const pr = player.r
      const grd2 = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, pr * 3)
      grd2.addColorStop(0, 'rgba(0,229,255,0.2)')
      grd2.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(player.x, player.y, pr * 3, 0, Math.PI * 2)
      ctx.fillStyle = grd2; ctx.fill()
      const s = pr + 6
      ctx.strokeStyle = 'rgba(0,229,255,0.6)'; ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(player.x - s, player.y); ctx.lineTo(player.x + s, player.y)
      ctx.moveTo(player.x, player.y - s); ctx.lineTo(player.x, player.y + s)
      ctx.stroke()
      ctx.beginPath(); ctx.arc(player.x, player.y, pr, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,229,255,0.15)'
      ctx.strokeStyle = '#00e5ff'
      ctx.lineWidth = 2
      ctx.fill()
      ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 12
      ctx.stroke(); ctx.shadowBlur = 0
    }

    if (waitingRef.current) {
      ctx.fillStyle = 'rgba(5,5,15,0.55)'
      ctx.fillRect(0, 0, W, H)
      ctx.beginPath(); ctx.arc(W / 2, H / 2, player.r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(0,229,255,0.25)'; ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([])
      ctx.font = `${Math.round(W * 0.038)}px 'Share Tech Mono', monospace`
      ctx.fillStyle = 'rgba(0,229,255,0.7)'
      ctx.textAlign = 'center'
      ctx.fillText(t('bullet_hell_rafael.tap_to_start'), W / 2, H / 2 - player.r - 22)
      ctx.fillStyle = 'rgba(42,58,90,0.9)'
      ctx.font = `${Math.round(W * 0.028)}px 'Share Tech Mono', monospace`
      ctx.fillText(t('bullet_hell_rafael.timer_on_tap'), W / 2, H / 2 + player.r + 22)
    }

    if (!player.alive) {
      ctx.fillStyle = 'rgba(255,0,85,0.28)'
      ctx.fillRect(0, 0, W, H)
    }
  }, [diff, t])

  const loop = useCallback((ts) => {
    if (!activeRef.current) return
    const dt = Math.min((ts - (lastTimeRef.current || ts)) / 1000, .05)
    lastTimeRef.current = ts
    if (!waitingRef.current) updateBullets(dt)
    if (checkCollision()) {
      playerRef.current.alive = false
      endGame(false)
      draw(ts)
      return
    }
    draw(ts)
    rafRef.current = requestAnimationFrame(loop)
  }, [draw, endGame])

  const tickTimer = useCallback(() => {
    if (!activeRef.current || waitingRef.current) return
    timeLeftRef.current = CFG[diff].time - (Date.now() - t0Ref.current) / 1000
    if (timeLeftRef.current <= 0) {
      timeLeftRef.current = 0
      setDisplayTime(0)
      endGame(true)
      return
    }
    setDisplayTime(Math.ceil(timeLeftRef.current))
  }, [diff, endGame])

  const onInput = useCallback((clientX, clientY) => {
    if (!activeRef.current || !playerRef.current.alive) return
    const rect = canvasRef.current.getBoundingClientRect()
    const p = playerRef.current
    p.x = clientX - rect.left
    p.y = clientY - rect.top
    p.placed = true
    if (waitingRef.current) {
      waitingRef.current = false
      const c = CFG[diff]
      p.r = c.r
      t0Ref.current = Date.now()
      timeLeftRef.current = c.time
      setDisplayTime(c.time)
      tickerRef.current = setInterval(tickTimer, 150)
    }
  }, [diff, tickTimer])

  const onTouch = useCallback((e) => {
    e.preventDefault()
    onInput(e.touches[0].clientX, e.touches[0].clientY)
  }, [onInput])

  const onMouse = useCallback((e) => {
    if (!activeRef.current || !playerRef.current.alive) return
    if (e.buttons === 0 && e.type === 'mousemove') return
    onInput(e.clientX, e.clientY)
  }, [onInput])

  const startGame = useCallback(() => {
    const c = CFG[diff]
    const canvas = canvasRef.current
    const hud = hudRef.current
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight - (hud ? hud.offsetHeight : 0)
    WRef.current = canvas.width
    HRef.current = canvas.height

    const p = playerRef.current
    p.x = WRef.current / 2
    p.y = HRef.current / 2
    p.r = c.r
    p.alive = true
    p.placed = false

    waitingRef.current = true
    timeLeftRef.current = c.time
    activeRef.current = true
    setDisplayTime(c.time)

    spawnBullets()

    canvas.addEventListener('touchstart', onTouch, { passive: false })
    canvas.addEventListener('touchmove', onTouch, { passive: false })
    canvas.addEventListener('mousedown', onMouse)
    canvas.addEventListener('mousemove', onMouse)

    rafRef.current = requestAnimationFrame(loop)

    setPhase('game')
  }, [diff, spawnBullets, onTouch, onMouse, loop])

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
    const t = setTimeout(() => { sfx.select(); setPhase('game'); requestAnimationFrame(() => startGame()) }, 550)
    return () => clearTimeout(t)
  }, [phase, cdownN, startGame])

  useEffect(() => {
    return () => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.removeEventListener('touchstart', onTouch)
        canvas.removeEventListener('touchmove', onTouch)
        canvas.removeEventListener('mousedown', onMouse)
        canvas.removeEventListener('mousemove', onMouse)
      }
      cleanup()
    }
  }, [onTouch, onMouse, cleanup])

  const timerRatio = cfg ? displayTime / cfg.time : 1
  const timerClass = timerRatio <= 0.2 ? 'bh-t-danger' : timerRatio <= 0.4 ? 'bh-t-warn' : ''

  if (phase === 'select') {
    return (
      <div className="bh-screen bh-grid-bg">
        <div className="bh-sel-tag">{t('bullet_hell_rafael.mg_tag')}</div>
        <div className="bh-sel-title">{t('bullet_hell_rafael.title')}</div>
        <div className="bh-sel-sub">{t('bullet_hell_rafael.subtitulo')}</div>
        <div className="bh-btns">
          <button className="bh-diff-btn bh-dif-easy" onClick={() => countdown('easy')}>
            <span className="bh-dn">◎ {gt('games.minigames.dif_facil')}</span>
            <span className="bh-di">{t('bullet_hell_rafael.dif_easy')}</span>
          </button>
          <button className="bh-diff-btn bh-dif-normal" onClick={() => countdown('normal')}>
            <span className="bh-dn">◎ {gt('games.minigames.dif_medio')}</span>
            <span className="bh-di">{t('bullet_hell_rafael.dif_normal')}</span>
          </button>
          <button className="bh-diff-btn bh-dif-hard" onClick={() => countdown('hard')}>
            <span className="bh-dn">◎ {gt('games.minigames.dif_dificil')}</span>
            <span className="bh-di">{t('bullet_hell_rafael.dif_hard')}</span>
          </button>
        </div>
        <div className="bh-back-row">
          <button className="bh-back-btn" onClick={onBack}>← {gt('games.minigames.voltar')}</button>
        </div>
      </div>
    )
  }

  if (phase === 'countdown') {
    const showText = cdownN === 0 ? 'GO!' : String(cdownN)
    const col = cdownN === 0 && cfg ? cfg.col : '#00e5ff'
    return (
      <div className="bh-screen bh-cdown">
        <div className="bh-cdown-n" style={{ '--cd-col': col }} key={cdownN}>
          {showText}
        </div>
      </div>
    )
  }

  return (
    <div className="bh-screen bh-game">
      <div className="bh-hud" ref={hudRef}>
        <button className="bh-hud-back" onClick={() => { cleanup(); setPhase('select') }} aria-label={gt('games.minigames.voltar')}>
          ←
        </button>
        <div className={`bh-hud-timer ${timerClass}`}>
          {waitingRef.current ? '—' : displayTime}
        </div>
        <div className="bh-hud-center">
          <span className="bh-hud-mode" style={{ '--mode-col': cfg?.col }}>{gt(cfg?.labelKey)}</span>
          <span className="bh-hud-lbl">{t('bullet_hell_rafael.hud_sobreviva')}</span>
        </div>
        <div className="bh-hud-diff" style={{ '--diff-col': cfg?.col }}>
          {gt(cfg?.labelKey)}
        </div>
      </div>
      <canvas ref={canvasRef} className="bh-canvas" />
    </div>
  )
}

export default function BulletHellRafael() {
  const navigate = useNavigate()
  const { setReaderMode } = useReader()
  const { t } = useLanguage()

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const [result, setResult] = useState(null)
  const [plays, setPlays] = useState(0)

  const handleSolve = () => { setResult('win'); setPlays(p => p + 1) }
  const handleFail = () => { setResult('lose'); setPlays(p => p + 1) }

  const retry = () => { setResult(null) }

  if (result === 'win') {
    return (
      <div className="kg-page">
        <div className="kg-scanlines" />
        <div className="kg-result">
          <div className="kg-result-emoji">🏆</div>
          <h2 className="kg-result-title kg-result-win">{t('games.minigames.resultado_vitoria')}</h2>
          <p className="kg-result-sub">{t('site.games.nomes.bullet_hell_rafael')}</p>
          <div className="kg-result-btns">
            <button className="kg-btn kg-btn-win" onClick={retry}>{t('games.minigames.resultado_jogar_novamente')}</button>
            <button className="kg-btn kg-btn-back" onClick={() => navigate('/games')}>{t('games.minigames.voltar')}</button>
          </div>
        </div>
      </div>
    )
  }

  if (result === 'lose') {
    return (
      <div className="kg-page">
        <div className="kg-scanlines" />
        <div className="kg-result">
          <div className="kg-result-emoji">💀</div>
          <h2 className="kg-result-title kg-result-lose">{t('games.minigames.resultado_derrota')}</h2>
          <p className="kg-result-sub">{t('site.games.nomes.bullet_hell_rafael')}</p>
          <div className="kg-result-btns">
            <button className="kg-btn kg-btn-lose" onClick={retry}>{t('games.minigames.resultado_tentar_novamente')}</button>
            <button className="kg-btn kg-btn-back" onClick={() => navigate('/games')}>{t('games.minigames.voltar')}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="kg-page">
      <div className="kg-scanlines" />
      <PuzzleBulletHellRafael key={plays} onSolve={handleSolve} onFail={handleFail} onBack={() => navigate('/games')} />
    </div>
  )
}
