import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import './ModalConfirmacaoFicha.css'

export default function ModalConfirmacaoFicha({ visivel, onConfirmar, onCancelar, jogo = 'este jogo', saldo }) {
  const { t } = useLanguage()
  const saldoRestante = saldo - 1
  return (
    <AnimatePresence>
      {visivel && (
        <motion.div className="mcf-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancelar}>
          <motion.div className="mcf-modal" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={e => e.stopPropagation()}>
            <div className="mcf-scanlines" />
            <div className="mcf-inner">
              <div className="mcf-emoji">🎰</div>
              <h2 className="mcf-titulo">{t('modal_confirmacao_ficha.titulo')}</h2>
              <p className="mcf-desc">{t('modal_confirmacao_ficha.desc', { jogo })}</p>
              <p className="mcf-destaque">{t('modal_confirmacao_ficha.duracao')}</p>
              <div className="mcf-saldo">
                <span className="mcf-saldo-label">{t('modal_confirmacao_ficha.saldo_atual')}</span>
                <span className="mcf-saldo-val">{saldo} 🎰</span>
              </div>
              <div className="mcf-saldo mcf-saldo--restante">
                <span className="mcf-saldo-label">{t('modal_confirmacao_ficha.saldo_restante')}</span>
                <span className="mcf-saldo-val">{saldoRestante} 🎰</span>
              </div>
              <div className="mcf-btns">
                <button className="mcf-btn mcf-btn--confirmar" onClick={onConfirmar}>
                  [ {t('modal_confirmacao_ficha.confirmar')} ]
                </button>
                <button className="mcf-btn" onClick={onCancelar}>
                  [ {t('modal_confirmacao_ficha.cancelar')} ]
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
