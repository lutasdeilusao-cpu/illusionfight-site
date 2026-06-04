import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

// Puzzle Decoder — Sintonizar frequência
// Props: onSolve(), onFail(), config = { toleranceExtra: 0 }

export default function PuzzleDecoder({ onSolve, onFail, config = {} }) {
  const [targetFreq] = useState(() => Math.floor(Math.random() * 100))
  const [slider, setSlider] = useState(50)
  const [attempts, setAttempts] = useState(0)
  const [hint, setHint] = useState('')
  const [done, setDone] = useState(false)

  const tolerance = config.toleranceExtra ? 15 : 5
  const maxAttempts = config.maxAttempts || 5

  useEffect(() => {
    return () => setDone(false)
  }, [])

  const handleDecode = useCallback(() => {
    if (done) return
    const diff = Math.abs(slider - targetFreq)
    if (diff <= tolerance) {
      setDone(true)
      setTimeout(() => onSolve?.(), 500)
    } else {
      const next = attempts + 1
      setAttempts(next)
      if (next >= maxAttempts) {
        setDone(true)
        setTimeout(() => onFail?.(), 800)
      } else {
        setHint(slider < targetFreq ? 'aumente a frequência' : 'diminua a frequência')
      }
    }
  }, [slider, targetFreq, done, attempts])

  const pct = Math.max(0, Math.min(100, slider))

  return (
    <div className="puzzle-container">
      <div className="puzzle-title">📡 Decodificador de Frequência</div>
      <p className="puzzle-desc">sintonize na frequência correta para decifrar a mensagem.</p>

      <div className="puzzle-decoder-wave">
        <svg viewBox="0 0 200 60" width="200" height="60">
          <path
            d={Array.from({ length: 200 }, (_, x) => {
              const amp = 25 * (slider / 100)
              const freq = 0.05 + (slider / 100) * 0.15
              const y = 30 + amp * Math.sin(x * freq)
              return `${x === 0 ? 'M' : 'L'}${x},${y}`
            }).join(' ')}
            fill="none" stroke="#00B4D8" strokeWidth="1.5"
          />
          <path d="M20,30 L180,30" stroke="#333" strokeWidth="0.5" strokeDasharray="4,4" />
          <text x="100" y="55" textAnchor="middle" fill="#666" fontSize="8" fontFamily="monospace">
            {slider} MHz — alvo: {Math.round(targetFreq)} ± {tolerance}
          </text>
        </svg>
      </div>

      <div className="puzzle-decoder-slider">
        <input type="range" min="0" max="100" value={slider}
          onChange={e => setSlider(Number(e.target.value))} disabled={done} />
        <span className="puzzle-decoder-value">{pct}%</span>
      </div>

      <div className="puzzle-buttons">
        <button className="jack-btn jack-btn--amber" onClick={handleDecode} disabled={done}>
          [ decodificar ({attempts}/{maxAttempts}) ]
        </button>
      </div>

      {hint && <p className="puzzle-hint">{hint}</p>}
    </div>
  )
}
