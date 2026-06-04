import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['Vermelho', 'Azul', 'Verde', 'Amarelo', 'Roxo', 'Laranja']

function generatePuzzle(size) {
  const wireCount = size === 4 ? 6 : 4
  const wires = []
  const used = new Set()
  for (let i = 0; i < wireCount; i++) {
    let color
    do { color = COLORS[Math.floor(Math.random() * COLORS.length)] } while (used.has(color))
    used.add(color)
    wires.push({ color, id: i, cut: false })
  }
  const order = [...wires.map((_, i) => i)]
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]]
  }
  return { wires, correctOrder: order }
}

export default function PuzzleWireCut({ size = 3, furtividade = 0, onSolve, onSkip, onFail }) {
  const [puzzle, setPuzzle] = useState(null)
  const [nextCut, setNextCut] = useState(0)
  const [cutting, setCutting] = useState(null)
  const [timeLeft, setTimeLeft] = useState(size === 4 ? 15 : 30)

  useEffect(() => {
    setPuzzle(generatePuzzle(size))
  }, [])

  useEffect(() => {
    if (!puzzle || nextCut >= puzzle.correctOrder.length) return
    if (timeLeft <= 0) { onFail(); return }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, nextCut, puzzle])

  const handleCut = (wireId) => {
    if (!puzzle) return
    if (cutting) return
    setCutting(wireId)
    setTimeout(() => {
      setCutting(null)
      if (wireId === puzzle.correctOrder[nextCut]) {
        const newWires = puzzle.wires.map(w => w.id === wireId ? { ...w, cut: true } : w)
        setPuzzle({ ...puzzle, wires: newWires })
        const next = nextCut + 1
        setNextCut(next)
        if (next >= puzzle.correctOrder.length) {
          onSolve()
        }
      } else {
        onFail()
      }
    }, 400)
  }

  if (!puzzle) return null

  return (
    <div className="ldi-puzzle-wire">
      <div className="ldi-puzzle-moves">
        Corte os cabos na ordem correta
        {size === 4 && <span className="ldi-puzzle-wire-timer" style={{ color: timeLeft <= 5 ? '#E02020' : '#00B4D8' }}> ⏱ {timeLeft}s</span>}
      </div>
      <div className="ldi-wire-grid">
        {puzzle.wires.map((wire, i) => (
          <motion.button
            key={wire.id}
            className="ldi-wire-btn"
            style={{
              borderColor: wire.cut ? '#444' : cutting === wire.id ? '#FFD700' : '#555',
              opacity: wire.cut ? 0.3 : 1,
              backgroundColor: `${getWireColor(wire.color)}22`,
            }}
            animate={cutting === wire.id ? { x: [0, -3, 3, -3, 3, 0] } : {}}
            onClick={() => handleCut(wire.id)}
            disabled={wire.cut || cutting !== null}
          >
            <span className="ldi-wire-color" style={{ color: getWireColor(wire.color) }}>
              {wire.cut ? '✂️' : '🔌'}
            </span>
            <span className="ldi-wire-label" style={{ color: wire.cut ? '#666' : getWireColor(wire.color) }}>
              {wire.color}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function getWireColor(color) {
  const map = {
    Vermelho: '#E02020', Azul: '#1E6FBF', Verde: '#22C55E',
    Amarelo: '#F5A623', Roxo: '#A855F4', Laranja: '#F97316',
  }
  return map[color] || '#888'
}
