import { motion } from 'framer-motion'

export default function ActionMenu({ personagem, onMover, onAtacar, onItem, onClose, onEndTurn, jaMoveu, jaAtacou }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      }}>
      {/* Overlay transparente para bloquear toques no grid */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.05)',
          zIndex: -1,
        }}
      />

      <div style={{
        background: '#0d0d0d', borderTop: '2px solid #FFD700',
        borderRadius: '20px 20px 0 0', padding: '1rem 1rem 1.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ color: '#FFD700', fontFamily: 'Courier New', fontSize: '0.85rem', fontWeight: 700 }}>{personagem.nome}</div>
            <div style={{ color: '#888', fontSize: '0.6rem', fontFamily: 'Courier New' }}>HP:{personagem.hp}/{personagem.hpMax} · MP:{personagem.energia}/{personagem.energiaMax}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            whileTap={!jaMoveu ? { scale: 0.95 } : {}}
            onClick={!jaMoveu ? onMover : undefined}
            style={{
              flex: 1, padding: '0.8rem 0.5rem', borderRadius: 12,
              cursor: jaMoveu ? 'default' : 'pointer',
              background: jaMoveu ? '#0a0a0a' : 'linear-gradient(135deg, #FFD70022, #0d0d0d)',
              border: `1px solid ${jaMoveu ? '#333' : '#FFD70055'}`,
              textAlign: 'center', opacity: jaMoveu ? 0.35 : 1,
              transition: 'all 0.2s',
            }}>
            <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>
              {jaMoveu ? '🔒' : '👣'}
            </div>
            <div style={{
              color: jaMoveu ? '#555' : '#FFD700',
              fontFamily: 'Courier New', fontSize: '0.7rem',
              fontWeight: 700, letterSpacing: '0.1em',
            }}>
              {jaMoveu ? 'JÁ MOVIDO' : 'MOVER'}
            </div>
          </motion.button>

          <motion.button
            whileTap={!jaAtacou ? { scale: 0.95 } : {}}
            onClick={!jaAtacou ? onAtacar : undefined}
            style={{
              flex: 1, padding: '0.8rem 0.5rem', borderRadius: 12,
              cursor: jaAtacou ? 'default' : 'pointer',
              background: jaAtacou ? '#0a0a0a' : 'linear-gradient(135deg, #FF444422, #0d0d0d)',
              border: `1px solid ${jaAtacou ? '#333' : '#FF444455'}`,
              textAlign: 'center', opacity: jaAtacou ? 0.35 : 1,
              transition: 'all 0.2s',
            }}>
            <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>
              {jaAtacou ? '🔒' : '⚔️'}
            </div>
            <div style={{
              color: jaAtacou ? '#555' : '#FF4444',
              fontFamily: 'Courier New', fontSize: '0.7rem',
              fontWeight: 700, letterSpacing: '0.1em',
            }}>
              {jaAtacou ? 'JÁ ATACOU' : 'ATACAR'}
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onItem}
            style={{
              flex: 1, padding: '0.8rem 0.5rem', borderRadius: 12, cursor: 'pointer',
              background: 'linear-gradient(135deg, #88888822, #0d0d0d)',
              border: '1px solid #88888855', textAlign: 'center', opacity: 0.4,
            }}>
            <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>🎒</div>
            <div style={{ color: '#888', fontFamily: 'Courier New', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em' }}>ITEM</div>
          </motion.button>
        </div>

        {/* End Turn — dentro do modal */}
        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          <button
            onClick={onEndTurn}
            style={{
              background: 'none', border: 'none',
              color: '#555', fontFamily: 'Courier New', fontSize: '0.6rem',
              cursor: 'pointer', letterSpacing: '0.1em', padding: '4px 12px',
            }}
            onMouseEnter={e => e.target.style.color = '#888'}
            onMouseLeave={e => e.target.style.color = '#555'}
          >
            ⏭ FINALIZAR TURNO
          </button>
        </div>
      </div>
    </motion.div>
  )
}
