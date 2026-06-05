import { motion, AnimatePresence } from 'framer-motion'

export default function TrapActivator({ trap, onActivate, onSkip }) {
  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        zIndex: 500, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 20,
      }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🕳️</div>
          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 18, color: '#EF4444', marginBottom: 8 }}>
            ATIVAR ARMADILHA?
          </p>
          <p style={{ fontSize: 12, color: '#888', fontFamily: "'Courier New',monospace", marginBottom: 4 }}>
            {trap.name}
          </p>
          <p style={{ fontSize: 10, color: '#555', fontFamily: "'Courier New',monospace", marginBottom: 20, fontStyle: 'italic' }}>
            {trap.description}
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={onSkip} style={{
              background: 'none', border: '1px solid #333', color: '#666',
              padding: '10px 24px', cursor: 'pointer', fontFamily: "'Courier New',monospace", fontSize: 12,
            }}>não ativar</button>
            <button onClick={onActivate} style={{
              background: 'linear-gradient(135deg, #8B0000, #a00000)',
              border: '1px solid #cc0000',
              color: '#eee',
              padding: '10px 24px', cursor: 'pointer',
              fontFamily: "'Courier New',monospace", fontSize: 12,
              letterSpacing: 2,
            }}>ATIVAR</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
