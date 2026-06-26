import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#00B4D8', '#FF6B6B', '#22C55E', '#A855F4']

export default function PuzzleSimonSays({ size = 3, furtividade = 0, onSolve, onSkip, onFail }) {
  const [sequence, setSequence] = useState([])
  const [playerSeq, setPlayerSeq] = useState([])
  const [phase, setPhase] = useState('showing')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [round, setRound] = useState(0)
  const maxRounds = size === 4 ? 8 : 5

  useEffect(() => {
    if (phase !== 'showing') return
    if (round >= maxRounds) { onSolve(); return }
    const newSeq = [...sequence]
    if (newSeq.length === 0) {
      for (let i = 0; i < 3; i++) newSeq.push(Math.floor(Math.random() * 4))
    } else {
      newSeq.push(Math.floor(Math.random() * 4))
    }
    setSequence(newSeq)
    let i = 0
    const interval = setInterval(() => {
      if (i >= newSeq.length) {
        clearInterval(interval)
        setPhase('input')
        setPlayerSeq([])
        return
      }
      setActiveIndex(newSeq[i])
      setTimeout(() => setActiveIndex(-1), 300)
      i++
    }, 600)
    return () => clearInterval(interval)
  }, [round, phase])

  const handleColorClick = (colorIndex) => {
    if (phase !== 'input') return
    const next = playerSeq.length
    if (colorIndex !== sequence[next]) {
      onFail()
      return
    }
    const newPlayer = [...playerSeq, colorIndex]
    setPlayerSeq(newPlayer)
    if (newPlayer.length >= sequence.length) {
      setPhase('showing')
      setRound(r => r + 1)
    }
  }

  return (
    <div className="ldi-puzzle-simon">
      <div className="ldi-puzzle-moves">Rodada {round + 1}/{maxRounds}</div>
      <div className="ldi-simon-grid">
        {[0, 1, 2, 3].map(i => (
          <motion.button
            key={i}
            className="ldi-simon-btn"
            style={{
              backgroundColor: activeIndex === i ? COLORS[i] : `${COLORS[i]}44`,
              borderColor: COLORS[i],
              cursor: phase === 'input' ? 'pointer' : 'default',
            }}
            animate={activeIndex === i ? { scale: 1.1 } : { scale: 1 }}
            onClick={() => handleColorClick(i)}
            disabled={phase !== 'input'}
          />
        ))}
      </div>
      <div className="ldi-puzzle-hint">
        {phase === 'showing' ? '👁️ Observando...' : '👆 Repita a sequência!'}
      </div>
    </div>
  )
}
