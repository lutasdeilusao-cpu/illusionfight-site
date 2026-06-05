import { motion } from 'framer-motion'

export default function Derrota({ onRevanche, onSair }) {
  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💀</div>
        <h1 style={{ fontFamily: 'Courier New', fontSize: '1.3rem', fontWeight: 900, color: '#ff4444', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
          DERROTA
        </h1>
        <p style={{ color: '#888', fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          "Sessão encerrada. Retornando ao modo observador."
        </p>
        <p style={{ color: '#555', fontFamily: 'Courier New', fontSize: '0.65rem', marginBottom: '2rem' }}>
          Nenhum SDR perdido. Tente novamente.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onRevanche}
            style={{
              padding: '0.75rem 1.5rem', background: '#ff444422',
              border: '2px solid #ff4444', borderRadius: 10,
              color: '#ff4444', fontFamily: 'Courier New', fontSize: '0.75rem',
              fontWeight: 700, cursor: 'pointer',
            }}>
            REVANCHE
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onSair}
            style={{
              padding: '0.75rem 1.5rem', background: '#111',
              border: '1px solid #333', borderRadius: 10,
              color: '#888', fontFamily: 'Courier New', fontSize: '0.75rem', cursor: 'pointer',
            }}>
            SAIR
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
