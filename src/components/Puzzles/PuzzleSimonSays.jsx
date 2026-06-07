import { useState, useEffect } from 'react'

const COLORS = ['#00B4D8', '#FF6B6B', '#22C55E', '#A855F4']

export default function PuzzleSimonSays({ onSolve, onFail, config = {} }) {
  const difficulty = config?.difficulty || 'easy'
  const maxRounds = difficulty === 'hard' ? 8 : difficulty === 'medium' ? 6 : 5

  const [sequence, setSequence] = useState([])
  const [playerSeq, setPlayerSeq] = useState([])
  const [phase, setPhase] = useState('showing')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [round, setRound] = useState(0)

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
  }, [round, phase, maxRounds])

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
    <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
        Round {round + 1}/{maxRounds}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        maxWidth: '280px',
        margin: '0 auto',
      }}>
        {[0, 1, 2, 3].map(i => (
          <button
            key={i}
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '12px',
              border: `3px solid ${COLORS[i]}`,
              backgroundColor: activeIndex === i ? COLORS[i] : `${COLORS[i]}33`,
              cursor: phase === 'input' ? 'pointer' : 'default',
              transition: 'background-color 0.1s, transform 0.1s',
              transform: activeIndex === i ? 'scale(1.05)' : 'scale(1)',
              boxShadow: activeIndex === i ? `0 0 20px ${COLORS[i]}88` : 'none',
            }}
            onClick={() => handleColorClick(i)}
            disabled={phase !== 'input'}
          />
        ))}
      </div>
      <div style={{
        fontFamily: "'Share Tech Mono',monospace",
        fontSize: '0.85rem',
        color: '#F5A623',
        marginTop: '1rem',
      }}>
        {phase === 'showing' ? '👁️ Observando...' : '👆 Repita!'}
      </div>
    </div>
  )
}
