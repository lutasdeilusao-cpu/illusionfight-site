import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'

export default function Vitoria({ sdrGanho, vitorias, streak, onContinuar }) {
  const { t } = useLanguage()
  const [contador, setContador] = useState(0)
  const target = sdrGanho

  useEffect(() => {
    if (contador < target) {
      const t = setTimeout(() => setContador(c => Math.min(c + 1, target)), 30)
      return () => clearTimeout(t)
    }
  }, [contador, target])

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Partículas de fundo */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 0, x: Math.random() * 100 + '%' }}
            animate={{ opacity: [0, 1, 0], y: -200 }}
            transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity }}
            style={{ position: 'absolute', bottom: 0, fontSize: '0.6rem' }}>
            ✨
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        style={{ fontSize: '4rem', marginBottom: '1rem' }}>
        ⚔️
      </motion.div>

      <h1 style={{ fontFamily: 'Courier New', fontSize: '1.5rem', fontWeight: 900, color: '#FFD700', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
        {t('tatics.vitoria')}!
      </h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ fontFamily: 'Courier New', fontSize: '2.5rem', fontWeight: 900, color: '#00ff88', marginBottom: '0.5rem' }}>
        +{contador} SDR
      </motion.div>

      <div style={{ color: '#888', fontFamily: 'Courier New', fontSize: '0.7rem', marginBottom: '0.5rem' }}>
        {t('tatics.vitorias_streak', { n: vitorias, streak: streak })}
      </div>

      {streak >= 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ color: '#FFD700', fontFamily: 'Courier New', fontSize: '0.65rem', marginBottom: '1.5rem' }}>
          {t('tatics.streak_bonus', { n: streak })}
        </motion.div>
      )}

      <motion.button whileTap={{ scale: 0.97 }} onClick={onContinuar}
        style={{
          padding: '0.85rem 2.5rem', background: '#00ff8822',
          border: '2px solid #00ff88', borderRadius: 12,
          color: '#00ff88', fontFamily: 'Courier New', fontSize: '0.85rem',
          fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer',
        }}>
        {t('tatics.proxima_batalha')}
      </motion.button>
    </div>
  )
}
