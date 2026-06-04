import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { PISTAS } from '../data/pistas'

export default function PistaCard({ pista }) {
  if (!pista) return null

  const icone = {
    testemunho: '🗣️',
    objeto: '📦',
    documento: '📄',
    rastro: '👣',
    alibiFalso: '❌',
  }

  const tipoNome = {
    testemunho: 'Testemunho',
    objeto: 'Objeto',
    documento: 'Documento',
    rastro: 'Rastro',
    alibiFalso: 'Álibi Falso',
  }

  return (
    <motion.div
      className="jdc-pista-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: '#F5A623' }}
    >
      <div className="jdc-pista-card-type">
        <span>{icone[pista.tipo] || '🔍'}</span>
        <span className="jdc-pista-card-type-label">{tipoNome[pista.tipo] || 'Pista'}</span>
      </div>
      <p className="jdc-pista-card-text">{pista.texto}</p>
    </motion.div>
  )
}
