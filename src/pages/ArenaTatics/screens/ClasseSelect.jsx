import { useState } from 'react'
import { motion } from 'framer-motion'
import { CLASSES, getClassesDisponiveis } from '../data/classes'
import { ELEMENTAIS } from '../data/elementais'
import { getCorPorElemental } from '../data/cosmeticos'

const LOCALE = 'pt'

export default function ClasseSelect({ tier, rotacao, onSelect }) {
  const [info, setInfo] = useState(null)
  const classesData = getClassesDisponiveis(tier, rotacao)

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ color: '#FFD700', fontFamily: 'Courier New', fontSize: '0.65rem', letterSpacing: '0.2em', marginBottom: 4 }}>SELECIONE SUA CLASSE</div>
        <div style={{ color: '#666', fontSize: '0.7rem', fontFamily: 'Courier New' }}>Toque em uma classe para ver detalhes</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
        {classesData.map(cls => {
          const cor = getCorPorElemental('fogo')
          return (
            <motion.div key={cls.id}
              whileHover={!cls.locked ? { scale: 1.03 } : {}}
              whileTap={!cls.locked ? { scale: 0.97 } : {}}
              onClick={() => { if (!cls.locked) { setInfo(cls.id === info ? null : cls.id); onSelect(cls.id) } }}
              style={{
                background: info === cls.id ? `linear-gradient(135deg, ${cor}22, #000)` : '#0d0d0d',
                border: `1px solid ${cls.locked ? '#222' : info === cls.id ? `${cor}66` : '#222'}`,
                borderRadius: 16, padding: '0.75rem', cursor: cls.locked ? 'not-allowed' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                transition: 'all 0.2s', opacity: cls.locked ? 0.4 : 1, position: 'relative',
              }}>
              {cls.locked && (
                <div style={{ position: 'absolute', top: 6, right: 6, background: '#333', borderRadius: 4, padding: '1px 6px', fontSize: '0.5rem', color: '#888', fontFamily: 'Courier New' }}>
                  🔒 FREE
                </div>
              )}
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: `radial-gradient(circle, ${cor}44, #111)`,
                border: `2px solid ${cls.locked ? '#333' : cor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', marginBottom: 8, filter: cls.locked ? 'grayscale(1)' : 'none',
              }}>
                {cls.id === 'karuak' ? '🛡️' : cls.id === 'moraki' ? '🌪️' : cls.id === 'tivara' ? '🏹' : cls.id === 'zephyra' ? '🌊' : cls.id === 'ignis' ? '🔥' : '🗡️'}
              </div>
              <div style={{ color: '#eee', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Courier New', letterSpacing: '0.1em' }}>{cls.nome}</div>
              <div style={{ color: '#888', fontSize: '0.6rem', fontFamily: 'Courier New', marginTop: 2 }}>{cls.tipo} · {cls.papel}</div>
              {info === cls.id && !cls.locked && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  style={{ marginTop: 8, textAlign: 'center' }}>
                  <div style={{ color: '#aaa', fontSize: '0.65rem', fontStyle: 'italic', marginBottom: 6 }}>{cls.desc}</div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {Object.entries(cls.atributos_base).map(([k, v]) => (
                      <span key={k} style={{
                        background: '#1a1a1a', color: '#888', fontSize: '0.55rem',
                        padding: '2px 6px', borderRadius: 4, fontFamily: 'Courier New',
                      }}>
                        {k.toUpperCase()}:{v}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
              {cls.locked && (
                <div style={{ color: '#555', fontSize: '0.55rem', fontFamily: 'Courier New', marginTop: 4, textAlign: 'center' }}>
                  Disponível no plano Elite
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
