import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReader } from '../../../../context/ReaderContext'
import { useLanguage } from '../../../../context/LanguageContext'
import { useRafaelI18n } from '../_shared/useRafaelI18n'
import { sfx } from '../../../../lib/sfx'
import '../KernelGame.css'
import './PuzzleGlitchRafael.css'

const CFG = {
  easy:   { n:1, time:30, fs:20, lh:1.38, labelKey:'games.minigames.dif_facil',   col:'#00e5ff' },
  normal: { n:3, time:40, fs:14, lh:1.36, labelKey:'games.minigames.dif_medio',  col:'#b400ff' },
  hard:   { n:6, time:50, fs:13, lh:1.34, labelKey:'games.minigames.dif_dificil', col:'#ff0055' },
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function PuzzleGlitchRafael({ onSolve, onFail, onBack, initialDiff }) {
  const { t } = useRafaelI18n()
  const { t: gt } = useLanguage()

  const [phase, setPhase] = useState(initialDiff ? 'countdown' : 'select')
  const [diff, setDiff] = useState(initialDiff || null)
  const [cdownN, setCdownN] = useState(initialDiff ? 3 : 3)
  const [found, setFound] = useState(0)
  const [total, setTotal] = useState(0)
  const [displayTime, setDisplayTime] = useState(0)

  const cfg = diff ? CFG[diff] : null
  const wrapRef = useRef(null)
  const preRef = useRef(null)
  const activeRef = useRef(false)
  const tickerRef = useRef(null)
  const t0Ref = useRef(null)
  const timeLeftRef = useRef(0)
  const foundRef = useRef(0)
  const totalRef = useRef(0)
  const glitchSetRef = useRef(new Set())
  const glitchSpansRef = useRef([])

  const cleanup = useCallback(() => {
    activeRef.current = false
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null }
  }, [])

  const endGame = useCallback((win) => {
    if (!activeRef.current) return
    cleanup()

    if (!win) {
      glitchSpansRef.current.forEach(sp => {
        if (!sp.classList.contains('gr-hit')) {
          sp.style.color = '#ff0055'
          sp.style.textShadow = '0 0 8px #ff0055'
        }
      })
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
    if (!sp || sp.tagName !== 'SPAN') return

    if (sp.dataset.g === '1') {
      if (sp.classList.contains('gr-hit')) return
      sp.className = 'gr-ch gr-gl gr-hit'
      foundRef.current++
      sfx.click()
      updateHUD()
      if (foundRef.current >= totalRef.current) endGame(true)
    } else {
      sp.classList.add('gr-err')
      setTimeout(() => sp.classList.remove('gr-err'), 320)
    }
  }, [updateHUD, endGame])

  const buildGrid = useCallback(() => {
    const wrap = wrapRef.current
    const pre = preRef.current
    if (!wrap || !pre) return
    const c = CFG[diff]

    pre.innerHTML = ''
    glitchSpansRef.current = []

    pre.style.fontSize = c.fs + 'px'
    pre.style.lineHeight = String(c.lh)

    const measure = document.createElement('span')
    measure.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:${c.fs}px;position:absolute;visibility:hidden;white-space:pre;`
    measure.textContent = '0'.repeat(200)
    document.body.appendChild(measure)
    const charW = measure.getBoundingClientRect().width / 200
    document.body.removeChild(measure)

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

    const frag = document.createDocumentFragment()
    for (let i = 0; i < total; i++) {
      if (i > 0 && i % cols === 0) frag.appendChild(document.createTextNode('\n'))

      const sp = document.createElement('span')
      if (gpos.has(i)) {
        sp.className = 'gr-ch gr-gl'
        sp.textContent = '2'
        sp.dataset.g = '1'
        glitchSpansRef.current.push(sp)
      } else {
        sp.className = 'gr-ch'
        sp.textContent = arr[i]
      }
      frag.appendChild(sp)
    }
    pre.appendChild(frag)

    foundRef.current = 0
    totalRef.current = c.n
    updateHUD()
  }, [diff, updateHUD])

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
    const t = setTimeout(() => { sfx.select(); setPhase('game'); requestAnimationFrame(() => startGame()) }, 550)
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
        <div className="gr-sel-tag">{t('glitch_rafael.mg_tag')}</div>
        <div className="gr-sel-title">{t('glitch_rafael.title')}</div>
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
        <div className="gr-cdown-n" style={{ '--cd-col': col }} key={cdownN}>
          {showText}
        </div>
      </div>
    )
  }

  return (
    <div className="gr-screen gr-game">
      <div className="gr-hud">
        <button className="gr-hud-back" onClick={() => { cleanup(); setPhase('select') }} aria-label={gt('games.minigames.voltar')}>
          ←
        </button>
        <div className={`gr-hud-timer ${timerClass}`}>
          {displayTime}
        </div>
        <div className="gr-hud-center">
          <span className="gr-hud-found">{found}/{total}</span>
          <span className="gr-hud-lbl">{t('glitch_rafael.hud_glitches')}</span>
        </div>
        <div className="gr-hud-diff" style={{ '--diff-col': cfg?.col }}>
          {gt(cfg?.labelKey)}
        </div>
      </div>
      <div className="gr-grid-wrap" ref={wrapRef}>
        <pre className="gr-grid-pre" ref={preRef} />
      </div>
    </div>
  )
}

export default function GlitchRafael() {
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
          <p className="kg-result-sub">{t('site.games.nomes.glitch_rafael')}</p>
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
          <p className="kg-result-sub">{t('site.games.nomes.glitch_rafael')}</p>
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
      <PuzzleGlitchRafael key={plays} onSolve={handleSolve} onFail={handleFail} onBack={() => navigate('/games')} />
    </div>
  )
}
