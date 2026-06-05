import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { CRIATURAS } from '../data/criaturas'
import { DIX_POR_ACAO } from '../data/moedas'

export default function Banhar({ onConcluir }) {
  const store = useTamagoshiStore()
  const [progress, setProgress] = useState(0)
  const [bolhas, setBolhas] = useState([])
  const acumulado = useRef(0)
  const lastY = useRef(null)
  const containerRef = useRef(null)

  const inv = store.inventario || {}
  const temSabonete = (inv['sabonete'] || 0) > 0 || (inv['shampoo'] || 0) > 0
  const itemUsar = inv['shampoo'] > 0 ? 'shampoo' : inv['sabonete'] > 0 ? 'sabonete' : null

  const handleMove = (y) => {
    if (lastY.current === null) { lastY.current = y; return }
    const delta = Math.abs(y - lastY.current)
    lastY.current = y
    acumulado.current += delta
    const novoProgress = Math.min(Math.floor(acumulado.current / 8), 100)
    setProgress(novoProgress)
    if (novoProgress % 20 === 0 && delta > 5) {
      setBolhas(b => [...b.slice(-15), { id: Date.now(), x: Math.random() * 80 + 10, size: Math.random() * 12 + 6 }])
    }
  }

  useEffect(() => {
    if (progress >= 100 && itemUsar) {
      const concluir = async () => {
        try {
          await store.consumirItem(itemUsar)
          store.banhar()
          store.ganharDix(store._userId, DIX_POR_ACAO, 'banhou criatura')
          onConcluir()
        } catch (e) { console.error(e) }
      }
      concluir()
    }
  }, [progress])

  const resetTracking = () => { lastY.current = null; acumulado.current = 0 }

  const criaturaEmoji = CRIATURAS.find(c => c.id === store.criaturaId)?.emoji || '?'

  return (
    <div className="tama-acao-screen"
      ref={containerRef}
      onMouseMove={e => e.buttons === 1 && handleMove(e.clientY)}
      onTouchMove={e => handleMove(e.touches[0].clientY)}
      onMouseUp={resetTracking}
      onTouchEnd={resetTracking}
    >
      <h2 className="tama-acao-title">🧼 banhar</h2>

      <div className="tama-acao-progress-container">
        <div className="tama-acao-progress-track">
          <div className="tama-acao-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="tama-acao-progress-label">{Math.round(progress)}%</span>
      </div>

      <div className="tama-acao-banho-area">
        <div className="tama-acao-sprite">{criaturaEmoji}</div>
        {bolhas.map(b => (
          <motion.div
            key={b.id}
            className="tama-acao-banho-bolha"
            initial={{ y: 0, opacity: 0.8, x: `${b.x}%` }}
            animate={{ y: -80, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ width: b.size, height: b.size, left: `${b.x}%` }}
          />
        ))}
      </div>

      {temSabonete ? (
        <p className="tama-acao-hint">arraste para cima e para baixo para esfregar</p>
      ) : (
        <p className="tama-aviso">você não tem sabonete — visite a loja</p>
      )}

      <motion.button
        className="tama-btn"
        style={{ marginTop: '0.5rem', opacity: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onConcluir}
      >
        [ voltar ]
      </motion.button>
    </div>
  )
}
