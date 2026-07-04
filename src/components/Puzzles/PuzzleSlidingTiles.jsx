import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { sfxMinigames } from './sfx-minigames'

// Puzzle Sliding Tiles — Reconstituir imagem/documento
// Props: onSolve(), onFail(), config = { size: 3 }

function shuffleSolvable(size) {
  const total = size * size
  const arr = Array.from({ length: total - 1 }, (_, i) => i + 1)
  arr.push(null)
  for (let attempt = 0; attempt < 100; attempt++) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    // Check solvability by inversion count
    const flat = arr.filter(x => x !== null)
    let inversions = 0
    for (let i = 0; i < flat.length; i++)
      for (let j = i + 1; j < flat.length; j++)
        if (flat[i] > flat[j]) inversions++
    const blankRow = Math.floor(arr.indexOf(null) / size) + 1
    const solvable = size % 2 === 1 ? inversions % 2 === 0 : (inversions + blankRow) % 2 === 1
    if (solvable) return arr
  }
  return arr
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function PuzzleSlidingTiles({ onSolve, onFail, config = {} }) {
  const { t } = useLanguage()
  const size = config.size || 3
  const total = size * size
  const goal = Array.from({ length: total - 1 }, (_, i) => i + 1).concat(null)

  const timerSeconds = config.timerSeconds || 0
  const difficultyLabel = config.difficultyLabel || ''
  const difficultyColor = config.difficultyColor || ''

  const [board, setBoard] = useState(() => shuffleSolvable(size))
  const [moves, setMoves] = useState(0)
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timerSeconds)
  const [timerActive, setTimerActive] = useState(false)
  const lastSlideSfx = useRef(0)
  const timerRef = useRef(null)

  const blankIdx = board.indexOf(null)

  useEffect(() => {
    if (!timerSeconds || done) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setDone(true); clearInterval(timerRef.current); setTimeout(() => onFail?.(), 500); return 0 }
        return prev - 1
      })
    }, 1000)
    setTimerActive(true)
    return () => { clearInterval(timerRef.current) }
  }, [timerSeconds, done])

  const timerRatio = timerSeconds ? timeLeft / timerSeconds : 1
  const timerClass = timerRatio <= 0.1 ? 'sliding-timer--danger' : timerRatio <= 0.25 ? 'sliding-timer--warn' : ''

  const tryMove = useCallback((idx) => {
    if (done) return
    const br = Math.floor(blankIdx / size)
    const bc = blankIdx % size
    const tr = Math.floor(idx / size)
    const tc = idx % size
    const dist = Math.abs(br - tr) + Math.abs(bc - tc)
    if (dist !== 1) return

    sfxMinigames.slide()

    const newBoard = [...board]
    newBoard[blankIdx] = newBoard[idx]
    newBoard[idx] = null
    setBoard(newBoard)
    setMoves(m => m + 1)

    const valor = newBoard[blankIdx]
    if (valor !== null && valor === goal[blankIdx]) {
      sfxMinigames.revelar()
    }

    if (newBoard.every((t, i) => t === goal[i])) {
      setDone(true)
      clearInterval(timerRef.current)
      sfxMinigames.vitoria()
      setTimeout(() => onSolve?.(), 500)
    }
  }, [board, blankIdx, done, goal, size])

  useEffect(() => {
    const handleKey = (e) => {
      if (done) return
      const br = Math.floor(blankIdx / size)
      const bc = blankIdx % size
      let tr = br, tc = bc
      if (e.key === 'ArrowUp') tr = br + 1
      else if (e.key === 'ArrowDown') tr = br - 1
      else if (e.key === 'ArrowLeft') tc = bc + 1
      else if (e.key === 'ArrowRight') tc = bc - 1
      else return
      if (tr < 0 || tr >= size || tc < 0 || tc >= size) return
      tryMove(tr * size + tc)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [board, blankIdx, done, size, tryMove])

  return (
    <div className="puzzle-container">
      {(timerSeconds || difficultyLabel) && (
        <div className="sliding-hud">
          {timerSeconds > 0 && (
            <span className={`sliding-timer ${timerClass}`}>
              {formatTimer(Math.max(0, Math.ceil(timeLeft)))}
            </span>
          )}
          <span className="sliding-moves">
            {t('games.minigames.sliding.movimentos', { n: moves })}
          </span>
          {difficultyLabel && (
            <span className="sliding-diff" style={{ color: difficultyColor }}>
              {difficultyLabel}
            </span>
          )}
        </div>
      )}

      <div className="puzzle-sliding-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {board.map((tile, idx) => (
          <motion.div
            key={tile ?? 'blank'}
            className={`puzzle-sliding-tile ${tile === null ? 'puzzle-sliding-tile--blank' : ''}`}
            onClick={() => tryMove(idx)}
            whileHover={tile !== null && !done ? { scale: 1.05, borderColor: '#F5A623' } : {}}
            animate={tile !== null ? { scale: 1 } : {}}
          >
            {tile !== null && (
              <span className="puzzle-sliding-tile-num">{tile}</span>
            )}
          </motion.div>
        ))}
      </div>

      <p className="puzzle-hint">{t('games.minigames.sliding.objetivo', { n: total - 1 })}</p>
      <button className="jack-btn" onClick={() => onFail?.()} style={{ fontSize: '0.7rem', borderColor: '#8B000033', color: '#666' }}>
        {t('games.minigames.sliding.desistir')}
      </button>

      {!timerSeconds && !difficultyLabel && (
        <p className="puzzle-moves">{t('games.minigames.sliding.movimentos', { n: moves })}</p>
      )}
    </div>
  )
}
