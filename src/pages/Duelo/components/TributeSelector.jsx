import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'

export default function TributeSelector({ tributesNeeded, availableMonsters, onSelect, onCancel }) {
  const { t } = useLanguage()
  const [selected, setSelected] = useState([])
  const canConfirm = selected.length === tributesNeeded

  const toggleMonster = (idx) => {
    setSelected(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : prev.length < tributesNeeded ? [...prev, idx] : prev
    )
  }

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        zIndex: 500, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 20,
      }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 18, color: '#F5A623', marginBottom: 8 }}>
            {t('games.duelo.tribute_titulo', { n: tributesNeeded })}
          </p>
          <p style={{ fontSize: 11, color: '#555', fontFamily: "'Courier New',monospace", marginBottom: 16 }}>
            {t('games.duelo.tribute_hint')}
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {availableMonsters.map((m, i) => (
              <div key={i} onClick={() => toggleMonster(i)} style={{
                padding: '8px 14px', cursor: 'pointer',
                border: selected.includes(i) ? '2px solid #F5A623' : '1px solid #333',
                background: selected.includes(i) ? 'rgba(245,166,35,0.08)' : 'rgba(255,255,255,0.02)',
                color: selected.includes(i) ? '#F5A623' : '#888',
                fontFamily: "'Courier New',monospace", fontSize: 11,
                borderRadius: 6, transition: 'all 0.15s',
              }}>
                {m.name}
                <span style={{ display: 'block', color: '#555', fontSize: 9 }}>{t('games.duelo.card_atk')} {m.atk} / {t('games.duelo.card_def')} {m.def}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={onCancel} style={{
              background: 'none', border: '1px solid #333', color: '#666',
              padding: '8px 20px', cursor: 'pointer', fontFamily: "'Courier New',monospace", fontSize: 12,
            }}>{t('games.duelo.btn_cancelar')}</button>
            <button onClick={() => canConfirm && onSelect(selected)} disabled={!canConfirm} style={{
              background: canConfirm ? 'linear-gradient(135deg, #8B0000, #a00000)' : '#1A1A1A',
              border: canConfirm ? '1px solid #cc0000' : '1px solid #333',
              color: canConfirm ? '#eee' : '#444',
              padding: '8px 20px', cursor: canConfirm ? 'pointer' : 'not-allowed',
              fontFamily: "'Courier New',monospace", fontSize: 12,
              letterSpacing: 2, transition: 'all 0.2s',
            }}>{t('games.duelo.btn_sacrificar')}</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
