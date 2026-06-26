import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'

export default function ConfirmEndTurn({ onConfirm, onCancel }) {
  const { t } = useLanguage()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="tatics-confirm-overlay"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="tatics-confirm-modal"
      >
        <div className="tatics-confirm-icone">â­</div>
        <div className="tatics-confirm-titulo">{t('tatics.confirm_titulo')}</div>
        <div className="tatics-confirm-desc">
          {t('tatics.confirm_desc')}<br />
          {t('tatics.confirm_desc2')}
        </div>

        <div className="tatics-confirm-botoes">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="tatics-confirm-btn tatics-confirm-btn-nao"
          >
            {t('tatics.confirm_nao')}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="tatics-confirm-btn tatics-confirm-btn-sim"
          >
            {t('tatics.confirm_sim')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
