import { motion } from 'framer-motion'
import { useDueloStore } from '../store/useDueloStore'

export default function DueloVitoria({ onRevanche, onMenu }) {
  const store = useDueloStore()
  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0F',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 40, gap: 24,
    }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
        <span style={{ fontSize: 72 }}>🏆</span>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 42, color: '#F5A623', margin: 0, letterSpacing: 8 }}>
        VITÓRIA!
      </motion.h1>
      <p style={{ fontFamily: "'Courier New',monospace", fontSize: 12, color: '#555', letterSpacing: 2 }}>
        LP restante: {store.playerLP} · Turnos: {store.turnNumber}
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={onRevanche} style={{
          padding: '10px 28px', background: 'rgba(245,166,35,0.1)', border: '1px solid #F5A623',
          color: '#F5A623', cursor: 'pointer', fontFamily: "'Courier New',monospace", fontSize: 12, letterSpacing: 3,
        }}>REVANCHE</button>
        <button onClick={onMenu} style={{
          padding: '10px 28px', background: 'none', border: '1px solid #333',
          color: '#666', cursor: 'pointer', fontFamily: "'Courier New',monospace", fontSize: 12, letterSpacing: 3,
        }}>MENU</button>
      </div>
    </div>
  )
}
