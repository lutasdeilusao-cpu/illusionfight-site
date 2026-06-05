import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { CRIATURAS } from '../data/criaturas'
import { PASSEIOS } from '../data/passeios'
import { useSwipe } from '../../../hooks/useSwipe'
import { DIX_POR_ACAO, DIX_BONUS_LOCAL } from '../data/moedas'

const GRID_W = 8
const GRID_H = 4
const FIM = [7, 3]

const OBSTACULOS = [
  [2, 1], [3, 2], [5, 1], [4, 3], [6, 2],
]

export default function Passear({ localSelecionado, onConcluir }) {
  const store = useTamagoshiStore()
  const [pos, setPos] = useState([0, 0])
  const [concluiu, setConcluiu] = useState(false)
  const gridRef = useRef(null)

  const local = localSelecionado
    ? PASSEIOS.find(p => p.id === localSelecionado)
    : PASSEIOS[0]

  const mover = useCallback((dx, dy) => {
    if (concluiu) return
    setPos(([x, y]) => {
      const nx = Math.max(0, Math.min(GRID_W - 1, x + dx))
      const ny = Math.max(0, Math.min(GRID_H - 1, y - dy))
      if (OBSTACULOS.some(o => o[0] === nx && o[1] === ny)) return [x, y]
      const chegou = nx === FIM[0] && ny === FIM[1]
      if (chegou) {
        setTimeout(async () => {
          setConcluiu(true)
          store.passear(local?.id)
          store.ganharDix(store._userId, DIX_POR_ACAO + (local?.id === store.criaturaId ? DIX_BONUS_LOCAL : 0), 'completou passeio')
          setTimeout(() => onConcluir(), 1000)
        }, 300)
      }
      return [nx, ny]
    })
  }, [concluiu, local, store, onConcluir])

  useSwipe(gridRef, (dy, dx) => mover(dx, dy), { minDistance: 20 })

  const handleKey = useCallback((e) => {
    const map = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }
    const d = map[e.key]
    if (d) { e.preventDefault(); mover(d[0], d[1]) }
  }, [mover])

  const criaturaEmoji = CRIATURAS.find(c => c.id === store.criaturaId)?.emoji || '?'

  return (
    <div className="tama-acao-screen" tabIndex={0} onKeyDown={handleKey} ref={gridRef}>
      <h2 className="tama-acao-title">🗺️ passear — {local?.nome || 'Marelia'}</h2>
      <p className="tama-acao-hint">use as setas (ou swipe) para mover até o fim</p>

      <div className="tama-passear-grid" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_W}, 1fr)`,
        gap: '4px',
        maxWidth: '400px',
        margin: '1rem auto',
      }}>
        {Array.from({ length: GRID_H }).map((_, y) =>
          Array.from({ length: GRID_W }).map((_, x) => {
            const isCriatura = pos[0] === x && pos[1] === y
            const isFim = FIM[0] === x && FIM[1] === y
            const isObstaculo = OBSTACULOS.some(o => o[0] === x && o[1] === y)
            return (
              <div key={`${x}-${y}`} className="tama-passear-cell" style={{
                width: '100%', aspectRatio: '1',
                background: isObstaculo ? '#222' : isFim ? '#1a3a1a' : '#111',
                border: isCriatura ? '2px solid #00B4D8' : '1px solid #222',
                borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isFim ? '0.7rem' : '1.2rem',
                color: '#555',
              }}>
                {isCriatura ? criaturaEmoji : isFim ? '🚩' : isObstaculo ? '⬛' : ''}
              </div>
            )
          })
        )}
      </div>

      <div className="tama-passear-controles">
        <button className="tama-btn tama-btn--sm" onClick={() => mover(0, 1)}>⬆</button>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button className="tama-btn tama-btn--sm" onClick={() => mover(-1, 0)}>⬅</button>
          <button className="tama-btn tama-btn--sm" onClick={() => mover(1, 0)}>➡</button>
        </div>
        <button className="tama-btn tama-btn--sm" onClick={() => mover(0, -1)}>⬇</button>
      </div>

      {concluiu && (
        <motion.p className="tama-acao-feedback"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          passeio concluído! 🎉
        </motion.p>
      )}
    </div>
  )
}
