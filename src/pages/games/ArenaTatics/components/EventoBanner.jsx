import { motion } from 'framer-motion'

export default function EventoBanner({ evento, onClose }) {
  if (!evento) return null
  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="tatics-evento-banner"
    >
      <div className="tatics-evento-label">⚡ EVENTO DE BATALHA</div>
      <div className="tatics-evento-desc">{evento.desc}</div>
      <button className="tatics-evento-btn" onClick={onClose}>ENTENDI</button>
    </motion.div>
  )
}
