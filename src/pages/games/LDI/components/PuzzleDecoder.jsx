import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function PuzzleDecoder({ computacao = 0, onSolve, onSkip, onFail }) {
  const targetFreq = Math.floor(Math.random() * 100)
  const tolerance = computacao >= 1 ? 15 : 5
  const [freq, setFreq] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const maxAttempts = 5

  useEffect(() => {
    setFreq(0)
    setAttempts(0)
    setSolved(false)
    setFeedback(null)
  }, [computacao])

  const handleDecode = () => {
    if (solved) return
    setAttempts(a => a + 1)
    const diff = Math.abs(freq - targetFreq)

    if (diff <= tolerance) {
      setSolved(true)
      setFeedback(`✓ Sinal decodificado! Frequência: ${freq}MHz`)
      setTimeout(onSolve, 500)
    } else {
      if (attempts + 1 >= maxAttempts) {
        setFeedback(`✗ Falha. Muitas tentativas. Frequência correta: ${targetFreq}MHz`)
        setTimeout(onFail, 800)
      } else {
        const hint = freq < targetFreq ? 'aumente' : 'diminua'
        setFeedback(`✗ Fora da janela. Tente ${hint} a frequência (${targetFreq} ±${tolerance})`)
      }
    }
  }

  const waveStyle = {
    width: '100%',
    height: 60,
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--ldi-surface)',
    borderRadius: 4,
  }

  const wavePath = []
  for (let x = 0; x < 200; x++) {
    const y = 30 + Math.sin((x / 10) + freq * 0.1) * (10 + freq * 0.3)
    wavePath.push(y)
  }

  return (
    <div className="ldi-puzzle-decoder">
      <h3 className="ldi-puzzle-title">Decoder de Frequência</h3>

      <div style={waveStyle}>
        <svg width="100%" height="60" viewBox="0 0 200 60">
          <polyline
            points={wavePath.map((y, x) => `${x},${y}`).join(' ')}
            fill="none"
            stroke="var(--ldi-accent-blue)"
            strokeWidth="1.5"
          />
          <line x1="0" y1="30" x2="200" y2="30" stroke="var(--ldi-muted)" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>

      <div className="ldi-decoder-target">Alvo: {targetFreq}MHz</div>

      <div className="ldi-decoder-slider">
        <input
          type="range"
          min="0"
          max="100"
          value={freq}
          onChange={(e) => setFreq(Number(e.target.value))}
          className="ldi-decoder-range"
        />
        <span className="ldi-decoder-value">{freq}MHz</span>
      </div>

      <div className="ldi-decoder-buttons">
        <button className="ldi-decoder-decode" onClick={handleDecode} disabled={solved}>
          📡 Decodificar ({maxAttempts - attempts} tentativas)
        </button>
        <button className="ldi-puzzle-skip" onClick={onSkip}>
          Pular
        </button>
      </div>

      {feedback && (
        <motion.div
          className={`ldi-decoder-feedback ${solved ? 'ldi-decoder-feedback--success' : 'ldi-decoder-feedback--fail'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {feedback}
        </motion.div>
      )}
    </div>
  )
}
