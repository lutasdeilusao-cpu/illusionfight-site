import { useState, useEffect, useRef, useCallback } from 'react'
import { useRafaelI18n } from '../_shared/useRafaelI18n'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'
import './PuzzleStabilizerRafael.css'

const NEEDED_TIME = 5

const CFG = {
  easy:   { drift:100, push:160, zoneW:.20, zoneStay:2.2, dangerChance:.20, dangerDur:1.2, roundTime:30, labelKey:'games.minigames.dif_facil',   col:'#00e5ff' },
  normal: { drift:60,  push:120, zoneW:.17, zoneStay:2.8, dangerChance:.35, dangerDur:1.5, roundTime:30, labelKey:'games.minigames.dif_medio',  col:'#b400ff' },
  hard:   { drift:105, push:200, zoneW:.13, zoneStay:1.6, dangerChance:.55, dangerDur:1.8, roundTime:40, labelKey:'games.minigames.dif_dificil', col:'#ff0055' },
}

const MSGS_OK = [
  'stabilizer_rafael.msg_ok_1',
  'stabilizer_rafael.msg_ok_2',
  'stabilizer_rafael.msg_ok_3',
  'stabilizer_rafael.msg_ok_4',
]
const MSGS_FAIL = [
  'stabilizer_rafael.msg_fail_1',
  'stabilizer_rafael.msg_fail_2',
  'stabilizer_rafael.msg_fail_3',
  'stabilizer_rafael.msg_fail_4',
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function PuzzleStabilizerRafael({ onSolve, onFail, onBack, initialDiff }) {
  const { t } = useRafaelI18n()
  const { t: gt } = useLanguage()

  const [phase, setPhase] = useState(initialDiff ? 'countdown' : 'select')
  const [diff, setDiff] = useState(initialDiff || null)
  const [cdownN, setCdownN] = useState(initialDiff ? 3 : 3)

  const markerRef = useRef(0.5)
  const zonePosRef = useRef(0.1)
  const zoneDangerRef = useRef(false)
  const zoneTimerRef = useRef(0)
  const roundTimeRef = useRef(0)
  const lockedTimeRef = useRef(0)
  const pressingRef = useRef(false)
  const activeRef = useRef(false)
  const rafRef = useRef(null)
  const lastTsRef = useRef(0)
  const barRef = useRef(null)
  const arenaRef = useRef(null)
  const hintRef = useRef(null)

  const [displayTime, setDisplayTime] = useState(0)
  const [displayLocked, setDisplayLocked] = useState('0.0')
  const [displayProgress, setDisplayProgress] = useState(0)
  const [inside, setInside] = useState(false)
  const [dangerWarn, setDangerWarn] = useState('')
  const [markerStyle, setMarkerStyle] = useState({})
  const [zoneStyle, setZoneStyle] = useState({})
  const [zoneCSS, setZoneCSS] = useState('st-zone st-zone-green-inactive')
  const [markerCSS, setMarkerCSS] = useState('st-marker')
  const [hintHidden, setHintHidden] = useState(false)

  const cfg = diff ? CFG[diff] : null

  const cleanup = useCallback(() => {
    activeRef.current = false
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [])

  const endGame = useCallback((win) => {
    if (!activeRef.current) return
    cleanup()
    if (win) sfx.win(); else sfx.lose()
    const t = win ? 400 : 600
    setTimeout(() => { win ? onSolve?.() : onFail?.() }, t)
  }, [cleanup, onSolve, onFail])

  const updateBar = useCallback(() => {
    const mp = markerRef.current
    const zp = zonePosRef.current
    const zd = zoneDangerRef.current
    const ins = inside

    setZoneStyle({ left: (zp * 100) + '%', width: (CFG[diff].zoneW * 100) + '%' })
    setMarkerStyle({ left: (mp * 100) + '%' })

    if (zd) {
      setZoneCSS('st-zone ' + (ins ? 'st-zone-red-active' : 'st-zone-red-inactive'))
    } else {
      setZoneCSS('st-zone ' + (ins ? 'st-zone-green-active' : 'st-zone-green-inactive'))
    }

    if (ins && !zd) setMarkerCSS('st-marker st-on-green')
    else if (ins && zd) setMarkerCSS('st-marker st-on-red')
    else setMarkerCSS('st-marker')
  }, [diff, inside])

  const updateHUD = useCallback(() => {
    const rt = roundTimeRef.current
    const lt = lockedTimeRef.current
    const zd = zoneDangerRef.current
    const ins = inside
    const c = CFG[diff]

    setDisplayTime(Math.ceil(Math.max(0, rt)))
    setDisplayLocked(lt.toFixed(1))
    setDisplayProgress((lt / NEEDED_TIME) * 100)

    const lockColor = ins ? (zd ? 'var(--st-red)' : 'var(--st-green)') : 'var(--st-ghost)'
    document.documentElement.style.setProperty('--st-lock-color', lockColor)

    setDangerWarn(zd ? '⚠ ' + t('stabilizer_rafael.danger_warn') : '')
  }, [diff, inside, t])

  const jumpZone = useCallback(() => {
    zonePosRef.current = Math.random() * (1 - CFG[diff].zoneW)
    zoneTimerRef.current = CFG[diff].zoneStay
  }, [diff])

  const startGame = useCallback(() => {
    const c = CFG[diff]
    markerRef.current = 0.5
    zonePosRef.current = Math.random() * (1 - c.zoneW)
    zoneDangerRef.current = false
    zoneTimerRef.current = c.zoneStay
    roundTimeRef.current = c.roundTime
    lockedTimeRef.current = 0
    pressingRef.current = false
    activeRef.current = true
    lastTsRef.current = 0
    setHintHidden(false)
    setDangerWarn('')

    updateBar()
    updateHUD()

    setPhase('game')
  }, [diff, updateBar, updateHUD])

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
    if (phase !== 'game' || !activeRef.current) return

    const loop = (ts) => {
      if (!activeRef.current) return
      const dt = Math.min((ts - (lastTsRef.current || ts)) / 1000, .05)
      lastTsRef.current = ts

      const c = CFG[diff]
      const barW = barRef.current ? barRef.current.clientWidth : 300
      const drift = c.drift / barW
      const push = c.push / barW

      if (pressingRef.current) markerRef.current += push * dt
      markerRef.current -= drift * dt
      markerRef.current = Math.max(0, Math.min(1, markerRef.current))

      zoneTimerRef.current -= dt
      if (zoneTimerRef.current <= 0) {
        if (!zoneDangerRef.current) {
          if (Math.random() < c.dangerChance) {
            zoneDangerRef.current = true
            zoneTimerRef.current = c.dangerDur
          } else {
            jumpZone()
          }
        } else {
          zoneDangerRef.current = false
          jumpZone()
        }
      }

      const ins = markerRef.current >= zonePosRef.current &&
        markerRef.current <= zonePosRef.current + c.zoneW

      if (ins) {
        if (zoneDangerRef.current) {
          lockedTimeRef.current = Math.max(0, lockedTimeRef.current - dt)
        } else {
          lockedTimeRef.current = Math.min(NEEDED_TIME, lockedTimeRef.current + dt)
        }
      }

      roundTimeRef.current -= dt

      setInside(ins)
      updateBar()
      updateHUD()

      if (lockedTimeRef.current >= NEEDED_TIME) { endGame(true); return }
      if (roundTimeRef.current <= 0) { endGame(false); return }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [phase, diff, jumpZone, updateBar, updateHUD, endGame])

  useEffect(() => {
    if (phase !== 'game') return

    const onDown = (e) => { e.preventDefault(); if (!activeRef.current) return; pressingRef.current = true; setHintHidden(true) }
    const onUp = (e) => { e.preventDefault(); pressingRef.current = false }

    const arena = arenaRef.current
    if (!arena) return
    arena.addEventListener('touchstart', onDown, { passive: false })
    arena.addEventListener('touchend', onUp, { passive: false })
    arena.addEventListener('touchcancel', onUp, { passive: false })
    arena.addEventListener('mousedown', onDown)
    arena.addEventListener('mouseup', onUp)

    return () => {
      arena.removeEventListener('touchstart', onDown)
      arena.removeEventListener('touchend', onUp)
      arena.removeEventListener('touchcancel', onUp)
      arena.removeEventListener('mousedown', onDown)
      arena.removeEventListener('mouseup', onUp)
    }
  }, [phase])

  useEffect(() => {
    return () => { cleanup() }
  }, [cleanup])

  const timerRatio = cfg ? displayTime / cfg.roundTime : 1
  const timerClass = timerRatio <= 0.2 ? 'st-t-danger' : timerRatio <= 0.4 ? 'st-t-warn' : ''

  if (phase === 'select') {
    return (
      <div className="st-screen st-grid-bg">
        <div className="st-sel-tag">{t('stabilizer_rafael.mg_tag')}</div>
        <div className="st-sel-title">{t('stabilizer_rafael.title')}</div>
        <div className="st-sel-sub">{t('stabilizer_rafael.subtitulo')}</div>
        <div className="st-btns">
          <button className="st-diff-btn st-dif-easy" onClick={() => countdown('easy')}>
            <span className="st-dn">◎ {gt('games.minigames.dif_facil')}</span>
            <span className="st-di">{t('stabilizer_rafael.dif_easy')}</span>
          </button>
          <button className="st-diff-btn st-dif-normal" onClick={() => countdown('normal')}>
            <span className="st-dn">◎ {gt('games.minigames.dif_medio')}</span>
            <span className="st-di">{t('stabilizer_rafael.dif_normal')}</span>
          </button>
          <button className="st-diff-btn st-dif-hard" onClick={() => countdown('hard')}>
            <span className="st-dn">◎ {gt('games.minigames.dif_dificil')}</span>
            <span className="st-di">{t('stabilizer_rafael.dif_hard')}</span>
          </button>
        </div>
        <div className="st-back-row">
          <button className="st-back-btn" onClick={onBack}>← {gt('games.minigames.voltar')}</button>
        </div>
      </div>
    )
  }

  if (phase === 'countdown') {
    const showText = cdownN === 0 ? 'GO!' : String(cdownN)
    const col = cdownN === 0 && cfg ? cfg.col : '#00e5ff'
    return (
      <div className="st-screen st-cdown">
        <div className="st-cdown-n" style={{ '--cd-col': col }} key={cdownN}>
          {showText}
        </div>
      </div>
    )
  }

  const pct = displayProgress

  return (
    <div className="st-screen st-game">
      <div className="st-hud">
        <button className="st-hud-back" onClick={() => { cleanup(); setPhase('select') }} aria-label={gt('games.minigames.voltar')}>
          ←
        </button>
        <div className={`st-hud-timer ${timerClass}`}>
          {displayTime}
        </div>
        <div className="st-hud-center">
          <span className="st-hud-lock">{displayLocked}s</span>
          <span className="st-hud-lbl">{t('stabilizer_rafael.hud_na_zona')}</span>
        </div>
        <div className="st-hud-diff" style={{ '--diff-col': cfg?.col }}>
          {gt(cfg?.labelKey)}
        </div>
      </div>
      <div className="st-arena" ref={arenaRef}>
        <div className={`st-touch-hint${hintHidden ? ' st-hint-hidden' : ''}`} ref={hintRef}>
          {t('stabilizer_rafael.touch_hint')}
        </div>
        <div className="st-bar-wrap">
          <div className="st-bar-track" ref={barRef}>
            <div className={zoneCSS} style={zoneStyle} />
            <div className={markerCSS} style={markerStyle} />
          </div>
        </div>
        <div className="st-danger-warn">{dangerWarn}</div>
        <div className="st-progress-wrap">
          <div className="st-progress-label">
            <span>{t('stabilizer_rafael.hud_tempo_zona')}</span>
            <span>{displayLocked}s / {NEEDED_TIME}.0s</span>
          </div>
          <div className="st-progress-track">
            <div
              className={'st-progress-fill' + (lockedTimeRef.current >= NEEDED_TIME ? ' st-complete' : '')}
              style={{ '--st-pct': pct + '%' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
