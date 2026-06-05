import { motion } from 'framer-motion'

export default function EventoBanner({ evento, onClose }) {
  if (!evento) return null
  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 60,
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        borderBottom: '2px solid #FFD700',
        padding: '0.75rem 1rem', textAlign: 'center',
      }}>
      <div style={{ color: '#FFD700', fontFamily: 'Courier New', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: 4 }}>
        ⚡ EVENTO DE BATALHA
      </div>
      <div style={{ color: '#eee', fontSize: '0.8rem', fontFamily: 'Georgia', fontStyle: 'italic' }}>
        {evento.desc}
      </div>
      <button onClick={onClose}
        style={{ marginTop: 6, background: 'none', border: '1px solid #FFD70044', color: '#FFD700', borderRadius: 6, padding: '2px 12px', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'Courier New' }}>
        ENTENDI
      </button>
    </motion.div>
  )
}
