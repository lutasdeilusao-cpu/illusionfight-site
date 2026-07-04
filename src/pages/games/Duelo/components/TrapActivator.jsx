import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import './TrapActivator.css'

export default function TrapActivator({ trap, onActivate, onSkip }) {
  const { t } = useLanguage()
  if (!trap) return null
  return (
    <AnimatePresence>
      <div className="ta-overlay">
        <motion.div className="ta-card" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="ta-emoji">🕳️</div>
          <p className="ta-title">
            {t('games.duelo.btn_ativar_armadilha')}
          </p>
          <p className="ta-name">
            {trap.name}
          </p>
          <p className="ta-desc">
            {trap.desc || trap.description}
          </p>
          <p className="ta-area">
            Área: {trap.area} · Gatilho: {trap.gatilho}
          </p>
          <div className="ta-actions">
            <button className="ta-btn-skip" onClick={onSkip}>{t('games.duelo.btn_nao_ativar')}</button>
            <button className="ta-btn-activate" onClick={onActivate}>{t('games.duelo.btn_ativar')}</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
