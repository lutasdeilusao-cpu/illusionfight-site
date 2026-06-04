import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

// Puzzle Anagrama — Reordenar letras para formar a palavra
// Props: onSolve(), onFail(), config = { palavra: 'MARELIA', tentativas: 5 }

const PALAVRAS = ['MARELIA', 'XAKIXI', 'YAWANARI', 'PRIMORDIAL', 'SANGUE', 'BRAVARA', 'KARNAZAR', 'AURANIS', 'KRONOS', 'SHUNTARO']

function shuffle(str) {
  const arr = str.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  // Garante que não fique igual ao original
  if (arr.join('') === str) { [arr[0], arr[1]] = [arr[1], arr[0]] }
  return arr
}

export default function PuzzleAnagrama({ onSolve, onFail, config = {} }) {
  const maxTentativas = config.tentativas || 5
  const [palavraCorreta] = useState(() => config.palavra || PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)])
  const [letras, setLetras] = useState(() => shuffle(palavraCorreta))
  const [selected, setSelected] = useState([])
  const [tentativas, setTentativas] = useState(0)
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)

  const handleClick = useCallback((idx) => {
    if (done) return
    setSelected(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx)
      return [...prev, idx]
    })
  }, [done])

  const handleSubmit = useCallback(() => {
    if (done) return
    const formada = selected.map(i => letras[i]).join('')
    if (formada === palavraCorreta) {
      setDone(true)
      setMsg(`✅ "${palavraCorreta}"!`)
      setTimeout(() => onSolve?.(), 600)
    } else {
      const nova = tentativas + 1
      setTentativas(nova)
      setSelected([])
      if (nova >= maxTentativas) {
        setDone(true)
        setMsg(`❌ era "${palavraCorreta}"`)
        setTimeout(() => onFail?.(), 800)
      } else {
        setMsg(`"${formada}" não é a palavra. ${maxTentativas - nova} tentativas restantes.`)
      }
    }
  }, [selected, letras, done, tentativas])

  return (
    <div className="puzzle-container">
      <div className="puzzle-title">🔤 Anagrama</div>
      <p className="puzzle-desc">reordene as letras para formar a palavra correta.</p>
      <p className="puzzle-moves">tentativas: {tentativas}/{maxTentativas}</p>

      <div className="puzzle-anagrama-letras">
        {letras.map((letra, idx) => (
          <motion.button
            key={idx}
            className={`puzzle-anagrama-letra ${selected.includes(idx) ? 'puzzle-anagrama-letra--selected' : ''}`}
            onClick={() => handleClick(idx)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={done}
          >
            {letra}
          </motion.button>
        ))}
      </div>

      <div className="puzzle-anagrama-preview">
        <span className="puzzle-anagrama-preview-label">sua palavra: </span>
        <span className="puzzle-anagrama-preview-text">
          {selected.map(i => letras[i]).join('') || '...'}
        </span>
      </div>

      {msg && <p className="puzzle-hint">{msg}</p>}

      <div className="puzzle-buttons">
        <button className="jack-btn" onClick={() => setSelected([])} disabled={done}>
          [ limpar ]
        </button>
        <button className="jack-btn jack-btn--amber" onClick={handleSubmit} disabled={done || selected.length === 0}>
          [ confirmar ]
        </button>
      </div>
    </div>
  )
}
