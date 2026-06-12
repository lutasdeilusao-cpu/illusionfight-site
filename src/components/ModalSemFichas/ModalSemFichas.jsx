import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import './ModalSemFichas.css'

export default function ModalSemFichas({ visivel, onFechar, jogo = 'este jogo' }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  return (
    <AnimatePresence>
      {visivel && (
        <motion.div className="msf-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onFechar}>
          <motion.div className="msf-modal" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={e => e.stopPropagation()}>
            <div className="msf-scanlines" />
            <div className="msf-inner">
              <div className="msf-emoji">🚀</div>
              <h2 className="msf-titulo">{t('modal_sem_fichas.titulo')}</h2>
              <p className="msf-desc">{t('modal_sem_fichas.desc', { jogo })}</p>
              <div className="msf-btns">
                <button className="msf-btn msf-btn--primary" onClick={() => { navigate('/cadastro'); onFechar() }}>[ {t('modal_sem_fichas.criar_conta')} ]</button>
                <button className="msf-btn" onClick={onFechar}>[ {t('modal_sem_fichas.voltar')} ]</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
