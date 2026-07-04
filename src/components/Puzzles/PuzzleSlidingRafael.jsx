import { useState, useEffect, useRef, useCallback } from 'react'
import { useRafaelI18n } from './useRafaelI18n'
import { useLanguage } from '../../context/LanguageContext'
import { sfx } from '../../lib/sfx'
import './PuzzleSlidingRafael.css'

const CFG = {
  easy:   { size: 3, time: 180,  label: 'FÁCIL',   col: '#00e5ff' },
  normal: { size: 4, time: 600,  label: 'NORMAL',  col: '#b400ff' },
  hard:   { size: 5, time: 1200, label: 'DIFÍCIL', col: '#ff0055' },
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

export default function PuzzleSlidingRafael({ onSolve, onFail, onBack }) {
  const { t } = useRafaelI18n()
  const { t: gt } = useLanguage()

  const [phase, setPhase] = useState('select')
  const [diff, setDiff] = useState(null)
  const [board, setBoard] = useState([])
  const [moves, setMoves] = useState(0)
  const [displayTime, setDisplayTime] = useState(null)
  const [active, setActive] = useState(false)
  const [tileSize, setTileSize] = useState(0)
  const [flashIdx, setFlashIdx] = useState(-1)
  const [cdownN, setCdownN] = useState(3)

  const cfgRef = useRef(null)
  const t0Ref = useRef(null)
  const tickerRef = useRef(null)
  const arenaRef = useRef(null)
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
    const calcSize = () => {
      const a = arenaRef.current
      if (!a) return
      const aW = a.clientWidth - 16
      const aH = a.clientHeight - 16
      const maxSide = Math.min(aW, aH)
      const sz = cfgRef.current?.size || 3
      const ts = Math.floor((maxSide - (sz - 1) * 4) / sz)
      setTileSize(Math.max(ts, 30))
    }
    calcSize()
    window.addEventListener('resize', calcSize)
    return () => window.removeEventListener('resize', calcSize)
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

  const fontSize = Math.max(14, Math.floor(tileSize * 0.38))

  if (phase === 'select') {
    return (
      <div className="sr-screen sr-grid-bg">
        <div className="sr-sel-tag">Minigame · MG-01</div>
        <div className="sr-sel-title">SLIDING<br />PUZZLE</div>
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
        <div className="sr-cdown-n" style={{ color: col, textShadow: `0 0 30px ${col}` }} key={cdownN}>
          {showText}
        </div>
      </div>
    )
  }

  return (
    <div className="sr-screen sr-game" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="sr-hud">
        <button className="sr-hud-back" onClick={() => { cleanup(); setPhase('select') }} aria-label="Voltar">
          ←
        </button>
        <div className={`sr-hud-timer ${timerClass}`}>
          {formatTime(displayTime || 0)}
        </div>
        <div className="sr-hud-center">
          <span className="sr-hud-moves">{moves}</span>
          <span className="sr-hud-lbl">{t('sliding_rafael.hud_moves')}</span>
        </div>
        <div className="sr-hud-diff" style={{ color: cfgRef.current?.col }}>
          {cfgRef.current?.label}
        </div>
      </div>
      <div className="sr-arena" ref={arenaRef}>
        {tileSize > 0 && (
          <div
            className="sr-puzzle-grid"
            style={{
              gridTemplateColumns: `repeat(${size}, ${tileSize}px)`,
              gridTemplateRows: `repeat(${size}, ${tileSize}px)`,
            }}
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
                  style={{
                    width: tileSize + 'px',
                    height: tileSize + 'px',
                    fontSize: fontSize + 'px',
                  }}
                  onClick={() => onTileClick(i)}
                >
                  {!isEmpty ? val : ''}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
