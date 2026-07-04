import { useState, useEffect, useRef, useCallback } from 'react'
import { useRafaelI18n } from './useRafaelI18n'
import { useLanguage } from '../../context/LanguageContext'
import { sfx } from '../../lib/sfx'
import './PuzzleGlitchRafael.css'

const CFG = {
  easy:   { n:1, time:30, fs:20, lh:1.38, label:'FÁCIL',   col:'#00e5ff' },
  normal: { n:3, time:40, fs:14, lh:1.36, label:'NORMAL',  col:'#b400ff' },
  hard:   { n:6, time:50, fs:13, lh:1.34, label:'DIFÍCIL', col:'#ff0055' },
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

export default function PuzzleGlitchRafael({ onSolve, onFail, onBack, initialDiff }) {
  const { t } = useRafaelI18n()
  const { t: gt } = useLanguage()

  const [phase, setPhase] = useState(initialDiff ? 'countdown' : 'select')
  const [diff, setDiff] = useState(initialDiff || null)
  const [cdownN, setCdownN] = useState(initialDiff ? 3 : 3)
  const [found, setFound] = useState(0)
  const [total, setTotal] = useState(0)
  const [gridData, setGridData] = useState([])
  const [displayTime, setDisplayTime] = useState(0)
  const [hitIndices, setHitIndices] = useState(new Set())

  const cfg = diff ? CFG[diff] : null
  const wrapRef = useRef(null)
  const activeRef = useRef(false)
  const tickerRef = useRef(null)
  const t0Ref = useRef(null)
  const timeLeftRef = useRef(0)
  const foundRef = useRef(0)
  const totalRef = useRef(0)
  const glitchSetRef = useRef(new Set())
  const hitSetRef = useRef(new Set())
  const revealedRef = useRef(false)
  const gridCacheRef = useRef([])

  const cleanup = useCallback(() => {
    activeRef.current = false
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null }
  }, [])

  const endGame = useCallback((win) => {
    if (!activeRef.current) return
    cleanup()

    if (!win) {
      revealedRef.current = true
      setGridData([...gridCacheRef.current])
    }

    if (win) sfx.win(); else sfx.lose()
    const t = win ? 700 : 1300
    setTimeout(() => { win ? onSolve?.() : onFail?.() }, t)
  }, [cleanup, onSolve, onFail])

  const updateHUD = useCallback(() => {
    const secs = Math.ceil(Math.max(0, timeLeftRef.current))
    setDisplayTime(secs)
    setFound(foundRef.current)
    setTotal(totalRef.current)
  }, [])

  const handleClick = useCallback((e) => {
    if (!activeRef.current) return
    const sp = e.target
    if (!sp || sp.tagName !== 'SPAN' || !sp.dataset) return

    const idx = parseInt(sp.dataset.idx, 10)
    if (isNaN(idx)) return

    if (glitchSetRef.current.has(idx)) {
      if (hitSetRef.current.has(idx)) return
      hitSetRef.current.add(idx)
      sfx.click()
      foundRef.current++
      setHitIndices(new Set(hitSetRef.current))
      updateHUD()
      if (foundRef.current >= totalRef.current) endGame(true)
    } else {
      sp.classList.remove('gr-err')
      void sp.offsetWidth
      sp.classList.add('gr-err')
      setTimeout(() => sp.classList.remove('gr-err'), 320)
    }
  }, [updateHUD, endGame])

  const buildGrid = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const c = CFG[diff]
    const charW = c.fs * 0.6
    const charH = c.fs * c.lh

    const W = wrap.clientWidth - 16
    const H = wrap.clientHeight - 12
    const cols = Math.max(10, Math.floor(W / charW))
    const rows = Math.max(5, Math.floor(H / charH))
    const total = cols * rows

    const arr = Array.from({ length: total }, () => Math.random() > 0.5 ? '1' : '0')

    const gpos = new Set()
    const margin = 3
    let tries = 0
    while (gpos.size < c.n && tries < 50000) {
      tries++
      const idx = Math.floor(Math.random() * total)
      const r = Math.floor(idx / cols)
      const c2 = idx % cols
      if (c2 < margin || c2 > cols - margin - 1) continue
      if (r < margin || r > rows - margin - 1) continue
      let ok = true
      for (const ex of gpos) {
        const dr = Math.abs(r - Math.floor(ex / cols))
        const dc = Math.abs(c2 - (ex % cols))
        if (dr + dc < 6) { ok = false; break }
      }
      if (ok) gpos.add(idx)
    }

    glitchSetRef.current = gpos
    hitSetRef.current = new Set()
    foundRef.current = 0
    totalRef.current = c.n
    revealedRef.current = false

    const data = []
    for (let i = 0; i < total; i++) {
      data.push({
        idx: i,
        char: gpos.has(i) ? '2' : arr[i],
        isGlitch: gpos.has(i),
        rowBreak: i > 0 && i % cols === 0,
      })
    }
    gridCacheRef.current = data
    setGridData(data)
    setHitIndices(new Set())
    setFound(0)
    setTotal(c.n)
  }, [diff])

  const startGame = useCallback(() => {
    const c = CFG[diff]
    activeRef.current = true
    buildGrid()

    t0Ref.current = Date.now()
    timeLeftRef.current = c.time
    setDisplayTime(c.time)

    tickerRef.current = setInterval(() => {
      const elapsed = (Date.now() - t0Ref.current) / 1000
      timeLeftRef.current = c.time - elapsed
      if (timeLeftRef.current <= 0) {
        timeLeftRef.current = 0
        updateHUD()
        endGame(false)
        return
      }
      updateHUD()
    }, 150)

    setPhase('game')
  }, [diff, buildGrid, updateHUD, endGame])

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
    return () => { cleanup() }
  }, [cleanup])

  useEffect(() => {
    if (phase !== 'game' || !wrapRef.current) return
    const wrap = wrapRef.current
    wrap.addEventListener('click', handleClick)
    return () => wrap.removeEventListener('click', handleClick)
  }, [phase, handleClick])

  const timerRatio = cfg ? displayTime / cfg.time : 1
  const timerClass = timerRatio <= 0.2 ? 'gr-t-danger' : timerRatio <= 0.4 ? 'gr-t-warn' : ''

  if (phase === 'select') {
    return (
      <div className="gr-screen gr-grid-bg">
        <div className="gr-sel-tag">Minigame · MG-04</div>
        <div className="gr-sel-title">ENCONTRE<br />O GLITCH</div>
        <div className="gr-sel-sub">{t('glitch_rafael.subtitulo')}</div>
        <div className="gr-btns">
          <button className="gr-diff-btn gr-dif-easy" onClick={() => countdown('easy')}>
            <span className="gr-dn">◎ {gt('games.minigames.dif_facil')}</span>
            <span className="gr-di">{t('glitch_rafael.dif_easy')}</span>
          </button>
          <button className="gr-diff-btn gr-dif-normal" onClick={() => countdown('normal')}>
            <span className="gr-dn">◎ {gt('games.minigames.dif_medio')}</span>
            <span className="gr-di">{t('glitch_rafael.dif_normal')}</span>
          </button>
          <button className="gr-diff-btn gr-dif-hard" onClick={() => countdown('hard')}>
            <span className="gr-dn">◎ {gt('games.minigames.dif_dificil')}</span>
            <span className="gr-di">{t('glitch_rafael.dif_hard')}</span>
          </button>
        </div>
        <div className="gr-back-row">
          <button className="gr-back-btn" onClick={onBack}>← {gt('games.minigames.voltar')}</button>
        </div>
      </div>
    )
  }

  if (phase === 'countdown') {
    const showText = cdownN === 0 ? 'GO!' : String(cdownN)
    const col = cdownN === 0 && cfg ? cfg.col : '#00e5ff'
    return (
      <div className="gr-screen gr-cdown">
        <div className="gr-cdown-n" style={{ color: col, textShadow: `0 0 30px ${col}` }} key={cdownN}>
          {showText}
        </div>
      </div>
    )
  }

  return (
    <div className="gr-screen gr-game">
      <div className="gr-hud">
        <button className="gr-hud-back" onClick={() => { cleanup(); setPhase('select') }} aria-label="Voltar">
          ←
        </button>
        <div className={`gr-hud-timer ${timerClass}`}>
          {displayTime}
        </div>
        <div className="gr-hud-center">
          <span className="gr-hud-found">{found}/{total}</span>
          <span className="gr-hud-lbl">{t('glitch_rafael.hud_glitches')}</span>
        </div>
        <div className="gr-hud-diff" style={{ color: cfg?.col }}>
          {cfg?.label}
        </div>
      </div>
      <div className="gr-grid-wrap" ref={wrapRef}>
        <pre className="gr-grid-pre" style={{ fontSize: cfg?.fs + 'px', lineHeight: cfg?.lh }}>
          {gridData.map(d => {
            const isHit = hitIndices.has(d.idx)
            const isRevealed = revealedRef.current && d.isGlitch && !isHit
            let cls = 'gr-ch'
            if (isHit) cls += ' gr-hit'
            else if (isRevealed) cls += ' gr-revealed'
            else if (d.isGlitch) cls += ' gr-gl'
            return (
              <span key={d.idx} className={cls} data-idx={d.idx}>
                {d.char}
              </span>
            )
          })}
        </pre>
      </div>
    </div>
  )
}
