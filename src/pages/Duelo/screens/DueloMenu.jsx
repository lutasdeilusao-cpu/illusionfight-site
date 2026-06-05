import { motion } from 'framer-motion'

export default function DueloMenu({ onStart }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0F',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 40, gap: 32,
    }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: 6,
          color: '#00B4D8', opacity: 0.5, margin: '0 0 8px', textTransform: 'uppercase'
        }}>modo card game</p>
        <h1 style={{
          fontFamily: "'Rajdhani',sans-serif", fontSize: 52, fontWeight: 900,
          color: '#F5A623', letterSpacing: 12, margin: 0, lineHeight: 1,
        }}>LDI DUELO</h1>
        <p style={{
          fontFamily: "'Courier New',monospace", fontSize: 10, color: '#444',
          letterSpacing: 4, marginTop: 8,
        }}>invocar · atacar · vencer</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{
          maxWidth: 420, width: '100%',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          padding: '24px 20px', textAlign: 'center',
        }}>
        <p style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: '#555', lineHeight: 1.8, margin: '0 0 16px' }}>
          60 cartas. 30 monstros. 15 magias. 15 armadilhas.<br />
          Monte sua estratégia. Derrote a IA.<br />
          Mesmo deck para os dois lados — vitória é skill.
        </p>
        <button onClick={onStart} style={{
          padding: '14px 48px',
          background: 'linear-gradient(135deg, #8B0000 0%, #a00000 100%)',
          border: '1px solid #cc0000',
          color: '#eee', cursor: 'pointer',
          fontFamily: "'Julius Sans One','Rajdhani',sans-serif", fontSize: 16, fontWeight: 700,
          letterSpacing: 8, transition: 'all 0.2s',
          boxShadow: '0 0 30px rgba(139,0,0,0.4)',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 50px rgba(139,0,0,0.7)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(139,0,0,0.4)'}
        >
          INICIAR DUELO
        </button>
      </motion.div>

      <div style={{ display: 'flex', gap: 24, fontSize: 10, color: '#333', fontFamily: "'Courier New',monospace", letterSpacing: 2 }}>
        <span>LP 8000</span>
        <span>·</span>
        <span>5 CARTAS</span>
        <span>·</span>
        <span>1v1 VS IA</span>
      </div>
    </div>
  )
}
