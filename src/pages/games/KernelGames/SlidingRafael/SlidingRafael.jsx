import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReader } from '../../../../context/ReaderContext'
import { useLanguage } from '../../../../context/LanguageContext'
import { useRafaelI18n } from '../_shared/useRafaelI18n'
import { sfx } from '../../../../lib/sfx'
import '../KernelGame.css'
import './PuzzleSlidingRafael.css'

const CFG = {
  easy:   { size: 3, time: 180,  labelKey:'games.minigames.dif_facil',   col: '#00e5ff' },
  normal: { size: 4, time: 600,  labelKey:'games.minigames.dif_medio',  col: '#b400ff' },
  hard:   { size: 5, time: 1200, labelKey:'games.minigames.dif_dificil', col: '#ff0055' },
}

function getNeighbors(idx, n) {
  const r = Math.floor(idx / n)
  const c = idx % n
  const nb = []
  if (r > 0) nb.push(idx - n)
  if (r < n - 1) nb.push(idx + n)
  if (c > 0) nb.push(idx - 1)
  if (c < n - 1) nb.push(idx + 1)
  return nb
}

function generateBoard(n) {
  const total = n * n
  let b = Array.from({ length: total }, (_, i) => (i + 1) % total)
  let empty = total - 1
  const shuffleMoves = total * 60
  for (let i = 0; i < shuffleMoves; i++) {
    const neighbors = getNeighbors(empty, n)
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)]
    ;[b[empty], b[pick]] = [b[pick], b[empty]]
    empty = pick
  }
  return b
}

function isSolved(board, size) {
  const total = size * size
  for (let i = 0; i < total - 1; i++) {
    if (board[i] !== i + 1) return false
  }
  return board[total - 1] === 0
}

function PuzzleSlidingRafael({ onSolve, onFail, onBack }) {
  const { t } = useRafaelI18n()
  const { t: gt } = useLanguage()

  const [phase, setPhase] = useState('select')
  const [diff, setDiff] = useState(null)
  const [board, setBoard] = useState([])
  const [moves, setMoves] = useState(0)
  const [displayTime, setDisplayTime] = useState(null)
  const [active, setActive] = useState(false)
  const [flashIdx, setFlashIdx] = useState(-1)
  const [cdownN, setCdownN] = useState(3)

  const cfgRef = useRef(null)
  const t0Ref = useRef(null)
  const tickerRef = useRef(null)
  const arenaRef = useRef(null)
  const gridRef = useRef(null)
  const boardRef = useRef([])
  const activeRef = useRef(false)

  const emptyIdx = board.indexOf(0)
  const size = cfgRef.current?.size || 3

  const cleanup = useCallback(() => {
    activeRef.current = false
    setActive(false)
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null }
  }, [])

  const endGame = useCallback((win) => {
    if (!activeRef.current) return
    cleanup()
    if (win) sfx.win(); else sfx.lose()
    const t = win ? 600 : 800
    setTimeout(() => { win ? onSolve?.() : onFail?.() }, t)
  }, [cleanup, onSolve, onFail])

  const startGame = useCallback(() => {
    const c = cfgRef.current
    const sz = c.size
    const newBoard = generateBoard(sz)
    boardRef.current = newBoard
    setBoard(newBoard)
    setMoves(0)
    setDisplayTime(c.time)
    setActive(true)
    activeRef.current = true
    t0Ref.current = Date.now()

    tickerRef.current = setInterval(() => {
      const elapsed = (Date.now() - t0Ref.current) / 1000
      const remaining = Math.max(0, c.time - elapsed)
      setDisplayTime(Math.ceil(remaining))
      if (remaining <= 0) {
        endGame(false)
      }
    }, 250)

    setPhase('game')
  }, [endGame])

  const countdown = useCallback((d) => {
    const c = CFG[d]
    cfgRef.current = c
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
      if (tickerRef.current) clearInterval(tickerRef.current)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'game' || !arenaRef.current) return
    const syncFont = () => {
      const a = arenaRef.current
      const g = gridRef.current
      if (!a || !g) return
      const sz = cfgRef.current?.size || 3
      const availW = a.clientWidth - 16
      const availH = a.clientHeight - 16
      const side = Math.max(0, Math.min(availW, availH))
      if (side <= 0) return
      g.style.setProperty('--sr-side', side + 'px')
      const cell = Math.floor((side - (sz - 1) * 4) / sz)
      const fs = Math.max(16, Math.floor(cell * 0.46))
      g.style.setProperty('--sr-fs', fs + 'px')
    }
    syncFont()
    const ro = new ResizeObserver(syncFont)
    ro.observe(arenaRef.current)
    window.addEventListener('resize', syncFont)
    return () => {
      window.removeEventListener('resize', syncFont)
      ro.disconnect()
    }
  }, [phase])

  const onTileClick = useCallback((idx) => {
    if (!activeRef.current) return
    if (boardRef.current[idx] === 0) return
    const neighbors = getNeighbors(boardRef.current.indexOf(0), cfgRef.current.size)
    if (!neighbors.includes(idx)) return

    sfx.click()
    const newBoard = [...boardRef.current]
    const eIdx = newBoard.indexOf(0)
    ;[newBoard[idx], newBoard[eIdx]] = [newBoard[eIdx], newBoard[idx]]
    boardRef.current = newBoard
    setBoard(newBoard)
    setMoves(m => m + 1)
    setFlashIdx(eIdx)
    setTimeout(() => setFlashIdx(-1), 230)

    if (isSolved(newBoard, cfgRef.current.size)) {
      endGame(true)
    }
  }, [endGame])

  const timerRatio = cfgRef.current ? displayTime / cfgRef.current.time : 1
  const timerClass = timerRatio <= 0.1 ? 'sr-t-danger' : timerRatio <= 0.25 ? 'sr-t-warn' : ''

  const formatTime = (sec) => {
    const t = Math.max(0, Math.ceil(sec))
    const m = Math.floor(t / 60)
    const s = t % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  if (phase === 'select') {
    return (
      <div className="sr-screen sr-grid-bg">
        <div className="sr-sel-tag">{t('sliding_rafael.mg_tag')}</div>
        <div className="sr-sel-title">{t('sliding_rafael.title')}</div>
        <div className="sr-sel-sub">{t('sliding_rafael.subtitulo')}</div>
        <div className="sr-btns">
          <button className="sr-diff-btn sr-dif-easy" onClick={() => countdown('easy')}>
            <span className="sr-dn">◎ {gt('games.minigames.dif_facil')}</span>
            <span className="sr-di">{t('sliding_rafael.dif_easy')}</span>
          </button>
          <button className="sr-diff-btn sr-dif-normal" onClick={() => countdown('normal')}>
            <span className="sr-dn">◎ {gt('games.minigames.dif_medio')}</span>
            <span className="sr-di">{t('sliding_rafael.dif_normal')}</span>
          </button>
          <button className="sr-diff-btn sr-dif-hard" onClick={() => countdown('hard')}>
            <span className="sr-dn">◎ {gt('games.minigames.dif_dificil')}</span>
            <span className="sr-di">{t('sliding_rafael.dif_hard')}</span>
          </button>
        </div>
        <div className="sr-back-row">
          <button className="sr-back-btn" onClick={onBack}>← {gt('games.minigames.voltar')}</button>
        </div>
      </div>
    )
  }

  if (phase === 'countdown') {
    const showText = cdownN === 0 ? 'GO!' : String(cdownN)
    const col = cdownN === 0 && cfgRef.current ? cfgRef.current.col : '#00e5ff'
    return (
      <div className="sr-screen sr-cdown">
        <div className="sr-cdown-n" style={{ '--cd-col': col }} key={cdownN}>
          {showText}
        </div>
      </div>
    )
  }

  return (
    <div className="sr-screen sr-game">
      <div className="sr-hud">
        <button className="sr-hud-back" onClick={() => { cleanup(); setPhase('select') }} aria-label={gt('games.minigames.voltar')}>
          ←
        </button>
        <div className={`sr-hud-timer ${timerClass}`}>
          {formatTime(displayTime || 0)}
        </div>
        <div className="sr-hud-center">
          <span className="sr-hud-moves">{moves}</span>
          <span className="sr-hud-lbl">{t('sliding_rafael.hud_moves')}</span>
        </div>
        <div className="sr-hud-diff" style={{ '--diff-col': cfgRef.current?.col }}>
          {gt(cfgRef.current?.labelKey)}
        </div>
      </div>
      <div className="sr-arena" ref={arenaRef}>
        <div
          ref={gridRef}
          className="sr-puzzle-grid"
          style={{ '--sr-cols': size }}
        >
          {board.map((val, i) => {
            const isMovable = val !== 0 && getNeighbors(emptyIdx, size).includes(i)
            const isCorrect = val !== 0 && val === i + 1
            const isEmpty = val === 0
            return (
              <div
                key={i}
                className={'sr-tile' +
                  (isEmpty ? ' sr-empty' : '') +
                  (isMovable ? ' sr-movable' : '') +
                  (!isMovable && isCorrect ? ' sr-correct' : '') +
                  (flashIdx === i ? ' sr-flash' : '')
                }
                onClick={() => onTileClick(i)}
              >
                {!isEmpty ? val : ''}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function SlidingRafael() {
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
          <p className="kg-result-sub">{t('site.games.nomes.sliding_rafael')}</p>
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
          <p className="kg-result-sub">{t('site.games.nomes.sliding_rafael')}</p>
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
      <PuzzleSlidingRafael key={plays} onSolve={handleSolve} onFail={handleFail} onBack={() => navigate('/games')} />
    </div>
  )
}
