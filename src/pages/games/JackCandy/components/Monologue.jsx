import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'

export default function Monologue({ text, onClose }) {
  const { t } = useLanguage()
  if (!text) return null
  return (
    <AnimatePresence>
      <motion.div
        className="jdc-monologo"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        onClick={onClose}
      >
        <p className="jdc-monologo-text">"{text}"</p>
        <p className="jack-text jack-text--dim jdc-monologo-close">{t('games.jackcandy.monologo_fechar')}</p>
      </motion.div>
    </AnimatePresence>
  )
}
