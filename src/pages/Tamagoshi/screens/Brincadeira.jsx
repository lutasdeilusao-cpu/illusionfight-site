import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTamagoshiStore } from '../store/useTamagoshiStore'

const BRINCADEIRAS = [
  { id: 'esconde', emoji: '🙈', nome: 'Esconde-esconde', texto: 'cadê você? achei!', humor: 35 },
  { id: 'bola', emoji: '⚽', nome: 'Jogar bola', texto: 'bom passe!', humor: 30 },
  { id: 'cacar', emoji: '🔦', nome: 'Caça ao tesouro', texto: 'achou um brilho escondido!', humor: 40 },
  { id: 'danca', emoji: '💃', nome: 'Dançar', texto: 'que ritmo!', humor: 25 },
]

export default function Brincadeira() {
  const store = useTamagoshiStore()
  const [fez, setFez] = useState(false)
  const [atual, setAtual] = useState(null)

  const handleBrincar = (b) => {
    setAtual(b)
    store.brincar()
    setFez(true)
    setTimeout(() => {
      setFez(false)
      setAtual(null)
    }, 2000)
  }

  return (
    <div className="tama-screen">
      <div className="tama-brincadeira">
        <h2 className="tama-brincadeira-title">🎲 brincar</h2>
        <p className="tama-brincadeira-sub">o que vamos fazer?</p>
        <div className="tama-brincadeira-grid">
          {BRINCADEIRAS.map((b, i) => (
            <motion.button
              key={b.id}
              className={`tama-brincadeira-card ${atual?.id === b.id ? 'tama-brincadeira-card--ativo' : ''}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleBrincar(b)}
              disabled={fez}
            >
              <div className="tama-brincadeira-card-emoji">{b.emoji}</div>
              <div className="tama-brincadeira-card-nome">{b.nome}</div>
            </motion.button>
          ))}
        </div>
        {atual && (
          <motion.div
            className="tama-brincadeira-feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {atual.texto} 🎉
          </motion.div>
        )}
        <motion.button
          className="tama-btn"
          style={{ marginTop: '1rem' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => store.setFase('criatura')}
        >
          [ voltar ]
        </motion.button>
      </div>
    </div>
  )
}
