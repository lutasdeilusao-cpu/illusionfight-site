import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { CRIATURAS } from '../data/criaturas'
import { ITENS_LOJA, COMIDA_TEMATICA } from '../data/itens_loja'
import { DIX_POR_ACAO } from '../data/moedas'

export default function Alimentar({ onConcluir }) {
  const store = useTamagoshiStore()
  const [progress, setProgress] = useState(0)
  const [animando, setAnimando] = useState(false)

  const inv = store.inventario || {}
  const comidasDisponiveis = ITENS_LOJA.filter(i => i.categoria === 'comida')
  const tematica = COMIDA_TEMATICA[store.criaturaId]
  const todasComidas = tematica ? [tematica, ...comidasDisponiveis] : comidasDisponiveis
  const temAlguma = todasComidas.some(c => inv[c.id] > 0)
  const itemUsar = todasComidas.find(c => inv[c.id] > 0)

  const handleAlimentar = async () => {
    if (!itemUsar || animando) return
    setAnimando(true)
    const novo = Math.min(progress + 25, 100)
    setProgress(novo)
    if (novo >= 100) {
      try {
        await store.consumirItem(itemUsar.id)
        store.alimentar()
        store.ganharDix(store._userId, DIX_POR_ACAO, 'alimentou criatura')
        onConcluir()
      } catch (e) { console.error(e) }
    }
    setAnimando(false)
  }

  const criaturaEmoji = CRIATURAS.find(c => c.id === store.criaturaId)?.emoji || '?'

  return (
    <div className="tama-acao-screen">
      <h2 className="tama-acao-title">🍖 alimentar</h2>

      <div className="tama-acao-progress-container">
        <div className="tama-acao-progress-track">
          <div className="tama-acao-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="tama-acao-progress-label">{Math.round(progress)}%</span>
      </div>

      <div className="tama-acao-sprite-area">
        <AnimatePresence mode="wait">
          {animando && (
            <motion.div className="tama-acao-item-voando"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}>
              {itemUsar?.emoji || '🍖'}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="tama-acao-sprite">{criaturaEmoji}</div>
      </div>

      {temAlguma ? (
        <motion.button
          className="tama-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAlimentar}
          disabled={animando}
        >
          {itemUsar?.emoji || '🍖'} {itemUsar?.nome || 'alimentar'} ({inv[itemUsar?.id] || 0}x)
        </motion.button>
      ) : (
        <p className="tama-aviso">você não tem comida — visite a loja</p>
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
