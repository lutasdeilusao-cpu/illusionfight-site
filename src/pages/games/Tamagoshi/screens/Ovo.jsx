import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'

export default function Ovo({ onEclodir }) {
  const { t } = useLanguage()
  return (
    <div className="tama-screen">
      <div className="tama-ovo-container">
        <motion.div
          className="tama-ovo"
          animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          ðŸ¥š
        </motion.div>
        <p className="tama-ovo-text">{t('games.tamagoshi.ovo_texto')}</p>
        <motion.button
          className="tama-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEclodir}
        >
          {t('games.tamagoshi.ovo_tocar')}
        </motion.button>
      </div>
    </div>
  )
}
