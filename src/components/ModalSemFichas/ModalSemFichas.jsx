import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './ModalSemFichas.css'

export default function ModalSemFichas({ visivel, onFechar, jogo = 'este jogo' }) {
  const navigate = useNavigate()
  return (
    <AnimatePresence>
      {visivel && (
        <motion.div className="msf-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onFechar}>
          <motion.div className="msf-modal" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={e => e.stopPropagation()}>
            <div className="msf-scanlines" />
            <div className="msf-inner">
              <div className="msf-emoji">🎰</div>
              <h2 className="msf-titulo">SEM FICHAS</h2>
              <p className="msf-desc">você precisa de <span className="msf-destaque">1 ficha</span> para jogar {jogo}.</p>
              <p className="msf-desc msf-desc--dim">fichas diárias resetam à meia-noite.<br />colete as suas no seu perfil.</p>
              <div className="msf-btns">
                <button className="msf-btn msf-btn--primary" onClick={() => { navigate('/perfil?aba=recompensas'); onFechar() }}>[ coletar fichas ]</button>
                <button className="msf-btn msf-btn--elite" onClick={() => { navigate('/assinar'); onFechar() }}>[ assinar elite — 10 fichas/dia ]</button>
                <button className="msf-btn" onClick={onFechar}>[ voltar ]</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
