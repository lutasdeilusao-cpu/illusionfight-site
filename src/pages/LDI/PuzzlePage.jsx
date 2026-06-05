import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGameStore } from './store/useGameStore'
import { useReader } from '../../context/ReaderContext'
import PuzzleRouter from './components/PuzzleRouter'
import './LDI.css'

const PUZZLE_MAP = {
  'terminal': 'sliding',
  'stealth': 'stealth',
  'decoder': 'decoder',
  'simon': 'simon',
  'wire': 'wire',
}

export default function PuzzlePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { setReaderMode } = useReader()
  const { gainXp, gainCredits, addClue } = useGameStore()

  const puzzleType = PUZZLE_MAP[params.get('type')] || 'simon'
  const difficulty = parseInt(params.get('diff') || '3', 10)
  const returnScene = params.get('return') || '3.2_dia8'

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  const handleComplete = (solved, rewards) => {
    if (!rewards) {
      navigate(`/games/ldi/game?scene=${returnScene}`)
      return
    }
    for (const r of rewards) {
      if (r.amount <= 0) continue
      if (r.label === 'XP') gainXp(r.amount)
      if (r.label === 'créditos') gainCredits(r.amount)
      if (r.label === 'pista') addClue({ text: r.desc, type: 'puzzle' })
    }
    setTimeout(() => {
      navigate(`/games/ldi/game?scene=${returnScene}`)
    }, 1500)
  }

  return (
    <div className="ldi-page ldi-page--puzzle">
      <PuzzleRouter
        type={puzzleType}
        difficulty={difficulty}
        onComplete={handleComplete}
      />
    </div>
  )
}
