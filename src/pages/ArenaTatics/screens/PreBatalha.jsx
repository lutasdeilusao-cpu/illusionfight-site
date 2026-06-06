import { motion } from 'framer-motion'
import { CLASSES } from '../data/classes'
import { getCorPorElemental } from '../data/cosmeticos'

export default function PreBatalha({ aliados, inimigos, onIniciar }) {
  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '1rem', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', color: '#FFD700', fontFamily: 'Courier New', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>PRÉ-BATALHA</div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Aliados */}
        <div>
          <div style={{ color: '#00ff88', fontFamily: 'Courier New', fontSize: '0.6rem', letterSpacing: '0.1em', marginBottom: 6 }}>SEU TIME</div>
          {aliados.map(a => {
            const cor = getCorPorElemental(a.elemental || 'fogo')
            return (
              <div key={a.id} style={{
                background: '#0d0d0d', border: `1px solid ${cor}33`, borderRadius: 10,
                padding: '0.5rem', marginBottom: 6,
              }}>
                <div style={{ color: '#eee', fontSize: '0.75rem', fontWeight: 600 }}>{a.nome}</div>
                <div style={{ color: '#888', fontSize: '0.55rem', fontFamily: 'Courier New' }}>{CLASSES[a.classe]?.nome} · Nv.{a.nivel}</div>
              </div>
            )
          })}
        </div>

        {/* VS */}
        <div style={{ textAlign: 'center', padding: '0.25rem 0' }}>
          <span style={{ color: '#ff4444', fontFamily: 'Courier New', fontSize: '1.2rem', fontWeight: 900 }}>⚔️ VS ⚔️</span>
        </div>

        {/* Inimigos */}
        <div>
          <div style={{ color: '#ff4444', fontFamily: 'Courier New', fontSize: '0.6rem', letterSpacing: '0.1em', marginBottom: 6 }}>INIMIGOS</div>
          {inimigos.map(i => (
            <div key={i.nome} style={{
              background: '#0d0d0d', border: '1px solid #ff444433', borderRadius: 10,
              padding: '0.5rem', marginBottom: 6,
            }}>
              <div style={{ color: '#eee', fontSize: '0.75rem', fontWeight: 600 }}>{i.nome}</div>
              <div style={{ color: '#888', fontSize: '0.55rem', fontFamily: 'Courier New' }}>{CLASSES[i.classe]?.nome} · Nv.{i.nivel} · Tier {i.tier || '?'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Batalha info */}
      <div style={{ textAlign: 'center', color: '#666', fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '0.7rem', margin: '0.5rem 0' }}>
        A arena se materializa ao redor. O SBI sincroniza.
      </div>

      <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
        onClick={onIniciar}
        style={{
          width: '100%', padding: '0.85rem',
          background: 'linear-gradient(135deg, #FFD70022, #FF450022)',
          border: '2px solid #FFD700', borderRadius: 12,
          color: '#FFD700', fontFamily: 'Courier New', fontSize: '0.9rem',
          fontWeight: 700, letterSpacing: '0.15em', cursor: 'pointer',
        }}>
        INICIAR LUTA
      </motion.button>
    </div>
  )
}
