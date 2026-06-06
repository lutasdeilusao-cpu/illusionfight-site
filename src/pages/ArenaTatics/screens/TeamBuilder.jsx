import { motion } from 'framer-motion'
import { CLASSES } from '../data/classes'
import { getCorPorElemental } from '../data/cosmeticos'

export default function TeamBuilder({ personagemPrincipal, onAdd, onRemove, time, onConfirm, onBack }) {
  const slots = [personagemPrincipal, ...time, null, null]
  const preenchidos = slots.filter(Boolean).length

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '1rem' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', fontFamily: 'Courier New', fontSize: '0.7rem', cursor: 'pointer', marginBottom: '0.5rem' }}>← VOLTAR</button>
      <div style={{ textAlign: 'center', color: '#FFD700', fontFamily: 'Courier New', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: '1rem' }}>MONTAR TIME · {preenchidos}/3</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {slots.slice(0, 3).map((membro, i) => {
          if (!membro) {
            return (
              <div key={i} style={{
                background: '#0d0d0d', border: '1px dashed #333', borderRadius: 12,
                padding: '1rem', textAlign: 'center',
              }}>
                <div style={{ color: '#555', fontFamily: 'Courier New', fontSize: '0.7rem' }}>{i === 0 ? 'VOCÊ' : `SLOT ${i}`}</div>
                <div style={{ color: '#333', fontSize: '0.6rem', marginTop: 4 }}>vazio</div>
              </div>
            )
          }
          const cor = getCorPorElemental(membro.elemental || 'fogo')
          return (
            <motion.div key={membro.id} layout
              style={{
                background: '#0d0d0d', border: `1px solid ${cor}44`, borderRadius: 12,
                padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: 12,
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `radial-gradient(circle, ${cor}, #111)`, border: `2px solid ${cor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
              }}>
                {membro.classe === 'karuak' ? '🛡️' : membro.classe === 'moraki' ? '🌪️' : membro.classe === 'tivara' ? '🏹' : membro.classe === 'zephyra' ? '🌊' : membro.classe === 'ignis' ? '🔥' : '🗡️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#eee', fontSize: '0.8rem', fontWeight: 600 }}>{membro.nome}</div>
                <div style={{ color: '#888', fontSize: '0.6rem', fontFamily: 'Courier New' }}>{CLASSES[membro.classe]?.nome} · {CLASSES[membro.classe]?.papel}</div>
              </div>
              {i > 0 && <button onClick={() => onRemove(membro.id)} style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '0.8rem', cursor: 'pointer' }}>✕</button>}
            </motion.div>
          )
        })}
      </div>

      <motion.button whileTap={{ scale: 0.97 }}
        onClick={onConfirm}
        style={{
          width: '100%', padding: '0.85rem', marginTop: '1rem',
          background: preenchidos >= 2 ? '#00ff8822' : '#111',
          border: `2px solid ${preenchidos >= 2 ? '#00ff88' : '#333'}`,
          borderRadius: 12, color: preenchidos >= 2 ? '#00ff88' : '#555',
          fontFamily: 'Courier New', fontSize: '0.85rem',
          fontWeight: 700, cursor: preenchidos >= 2 ? 'pointer' : 'default',
        }}>
        {preenchidos >= 2 ? 'CONFIRMAR TIME' : `Mínimo 2 personagens (${preenchidos}/2)`}
      </motion.button>
    </div>
  )
}
