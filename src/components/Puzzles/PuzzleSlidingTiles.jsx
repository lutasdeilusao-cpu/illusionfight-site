import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
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

export default function PuzzleSlidingTiles({ onSolve, onFail, config = {} }) {
  const size = config.size || 3
  const total = size * size
  const goal = Array.from({ length: total - 1 }, (_, i) => i + 1).concat(null)

  const [board, setBoard] = useState(() => shuffleSolvable(size))
  const [moves, setMoves] = useState(0)
  const [done, setDone] = useState(false)
  const lastSlideSfx = useRef(0)

  const blankIdx = board.indexOf(null)

  const tryMove = useCallback((idx) => {
    if (done) return
    const br = Math.floor(blankIdx / size)
    const bc = blankIdx % size
    const tr = Math.floor(idx / size)
    const tc = idx % size
    const dist = Math.abs(br - tr) + Math.abs(bc - tc)
    if (dist !== 1) return

    // SFX: slide
    sfxMinigames.slide()

    const newBoard = [...board]
    newBoard[blankIdx] = newBoard[idx]
    newBoard[idx] = null
    setBoard(newBoard)
    setMoves(m => m + 1)

    // SFX: revelar se peça foi pro lugar certo
    const valor = newBoard[blankIdx]
    if (valor !== null && valor === goal[blankIdx]) {
      sfxMinigames.revelar()
    }

    // Check win
    if (newBoard.every((t, i) => t === goal[i])) {
      setDone(true)
      sfxMinigames.vitoria()
      setTimeout(() => onSolve?.(), 500)
    }
  }, [board, blankIdx, done])

  // Keyboard
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
  }, [board, blankIdx, done])

  return (
    <div className="puzzle-container">
      <div className="puzzle-title">🧩 Documento Rasgado</div>
      <p className="puzzle-desc">reconstitua o documento. ordene os pedaços. use setas ou clique.</p>
      <p className="puzzle-moves">movimentos: {moves}</p>

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

      <p className="puzzle-hint">objetivo: ordenar 1-{total - 1} da esquerda pra direita, espaço vazio no canto inferior direito</p>
      <button className="jack-btn" onClick={() => onFail?.()} style={{ fontSize: '0.7rem', borderColor: '#8B000033', color: '#666' }}>
        [ desistir ]
      </button>
    </div>
  )
}
