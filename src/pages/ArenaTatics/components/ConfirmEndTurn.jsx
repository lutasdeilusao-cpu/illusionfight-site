import { motion } from 'framer-motion'

export default function ConfirmEndTurn({ onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d0d0d', border: '1px solid #FFD70044', borderRadius: 16,
          padding: '1.5rem', maxWidth: 300, width: '90%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏭</div>
        <div style={{
          color: '#eee', fontFamily: 'Courier New', fontSize: '0.85rem',
          fontWeight: 700, marginBottom: '0.5rem',
        }}>
          FINALIZAR TURNO?
        </div>
        <div style={{
          color: '#888', fontFamily: 'Courier New', fontSize: '0.65rem',
          marginBottom: '1.25rem', lineHeight: 1.5,
        }}>
          Tem certeza que quer encerrar sua vez?<br />
          Os aliados que não agiram perderão a vez.
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.7rem', borderRadius: 10, cursor: 'pointer',
              background: '#1a1a1a', border: '1px solid #555',
              color: '#888', fontFamily: 'Courier New', fontSize: '0.7rem',
              fontWeight: 700,
            }}>
            NÃO, AINDA NÃO
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            style={{
              flex: 1, padding: '0.7rem', borderRadius: 10, cursor: 'pointer',
              background: '#ff444422', border: '1px solid #ff4444',
              color: '#ff4444', fontFamily: 'Courier New', fontSize: '0.7rem',
              fontWeight: 700,
            }}>
            SIM, ENCERRAR
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
