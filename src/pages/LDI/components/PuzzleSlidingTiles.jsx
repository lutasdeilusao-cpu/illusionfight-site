import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function isSolvable(grid, size) {
  const flat = grid.filter(t => t !== null)
  let inversions = 0
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) inversions++
    }
  }
  if (size % 2 === 1) return inversions % 2 === 0
  const blankRow = Math.floor(grid.indexOf(null) / size)
  return (inversions + blankRow) % 2 === 1
}

function generateGoal(size) {
  const grid = []
  let num = 1
  for (let r = 0; r < size; r++) {
    const row = []
    for (let c = 0; c < size; c++) {
      if (r === size - 1 && c === size - 1) row.push(null)
      else row.push(num++)
    }
    grid.push(row)
  }
  return grid.flat()
}

export default function PuzzleSlidingTiles({ size = 3, furtividade = 0, onSolve, onSkip, onFail }) {
  const [tiles, setTiles] = useState([])
  const [blankIndex, setBlankIndex] = useState(0)
  const [moves, setMoves] = useState(0)
  const [solved, setSolved] = useState(false)
  const goal = generateGoal(size)

  const initPuzzle = useCallback(() => {
    let grid = generateGoal(size)
    let attempts = 0
    do {
      grid = shuffleArray(generateGoal(size))
      attempts++
    } while (isSolvable(grid, size) === false && attempts < 100)

    if (furtividade >= 1) {
      for (let i = 0; i < size; i++) {
        if (Math.random() < 0.5) {
          const idx = grid.indexOf(i + 1)
          if (idx >= 0 && grid[idx + 1] !== null && grid[idx + 1] !== undefined) {
            [grid[idx], grid[idx + 1]] = [grid[idx + 1], grid[idx]]
          }
        }
      }
    }

    setTiles(grid)
    setBlankIndex(grid.indexOf(null))
    setMoves(0)
    setSolved(false)
  }, [size, furtividade])

  useEffect(() => { initPuzzle() }, [initPuzzle])

  const tryMove = (index) => {
    if (solved) return

    const sizeNum = size
    const blankR = Math.floor(blankIndex / sizeNum)
    const blankC = blankIndex % sizeNum
    const tileR = Math.floor(index / sizeNum)
    const tileC = index % sizeNum
    const isAdjacent = (Math.abs(blankR - tileR) + Math.abs(blankC - tileC)) === 1

    if (!isAdjacent) return

    const newTiles = [...tiles];
    [newTiles[blankIndex], newTiles[index]] = [newTiles[index], newTiles[blankIndex]]
    setTiles(newTiles)
    setBlankIndex(index)
    setMoves(m => m + 1)

    if (newTiles.every((t, i) => t === goal[i])) {
      setSolved(true)
      setTimeout(onSolve, 500)
    }
  }

  return (
    <div className="ldi-puzzle-sliding">
      <h3 className="ldi-puzzle-title">Puzzle {size}x{size}</h3>
      <p className="ldi-puzzle-moves">Movimentos: {moves}</p>

      <div
        className="ldi-sliding-grid"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {tiles.map((tile, i) => (
          <motion.button
            key={i}
            className={`ldi-sliding-tile ${tile === null ? 'ldi-sliding-tile--empty' : solved ? 'ldi-sliding-tile--solved' : ''}`}
            onClick={() => tryMove(i)}
            whileHover={tile !== null ? { scale: 1.05 } : {}}
            whileTap={tile !== null ? { scale: 0.95 } : {}}
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {tile}
          </motion.button>
        ))}
      </div>

      <button className="ldi-puzzle-skip" onClick={onSkip}>
        Pular Puzzle
      </button>

      {solved && (
        <motion.div
          className="ldi-puzzle-solved"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >✓ Puzzle resolvido!</motion.div>
      )}
    </div>
  )
}
