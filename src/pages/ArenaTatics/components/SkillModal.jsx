import { motion } from 'framer-motion'

export default function SkillModal({ personagem, skills, onSelect, onClose }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 'auto', maxHeight: '45vh', background: '#0d0d0d', borderTop: '2px solid #FFD700',
        borderRadius: '20px 20px 0 0', padding: '1rem',
        overflowY: 'auto', zIndex: 100,
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <div style={{ color: '#FFD700', fontFamily: 'Courier New', fontSize: '0.9rem', fontWeight: 700 }}>{personagem.nome}</div>
          <div style={{ color: '#888', fontSize: '0.7rem', fontFamily: 'Courier New' }}>MP: {personagem.energia}/{personagem.energiaMax}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {skills.map(skill => {
          const podeUsar = personagem.energia >= skill.custo
          return (
            <motion.button
              key={skill.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => podeUsar && onSelect(skill)}
              disabled={!podeUsar}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '0.75rem 1rem', borderRadius: 12,
                background: podeUsar ? '#1a2a1a' : '#111',
                border: `1px solid ${podeUsar ? '#00ff8844' : '#333'}`,
                cursor: podeUsar ? 'pointer' : 'default',
                opacity: podeUsar ? 1 : 0.5, textAlign: 'left', width: '100%',
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: podeUsar ? 'rgba(0,255,136,0.15)' : '#1a1a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', color: podeUsar ? '#00ff88' : '#555',
                fontFamily: 'Courier New', fontWeight: 700, flexShrink: 0,
              }}>
                {skill.custo}MP
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#eee', fontSize: '0.85rem', fontWeight: 600 }}>{skill.nome}</div>
                <div style={{ color: '#888', fontSize: '0.7rem' }}>{skill.desc}</div>
              </div>
              <div style={{
                fontSize: '0.6rem', color: '#666', fontFamily: 'Courier New',
                background: '#1a1a1a', padding: '2px 6px', borderRadius: 4,
              }}>
                {skill.alcance}⤴ {skill.dano}x
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
