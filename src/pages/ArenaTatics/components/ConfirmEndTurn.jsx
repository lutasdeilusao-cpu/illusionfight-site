import { motion } from 'framer-motion'

export default function ConfirmEndTurn({ onConfirm, onCancel }) {
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
        <div className="tatics-confirm-icone">⏭</div>
        <div className="tatics-confirm-titulo">FINALIZAR TURNO?</div>
        <div className="tatics-confirm-desc">
          Tem certeza que quer encerrar sua vez?<br />
          Os aliados que não agiram perderão a vez.
        </div>

        <div className="tatics-confirm-botoes">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="tatics-confirm-btn tatics-confirm-btn-nao"
          >
            NÃO, AINDA NÃO
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="tatics-confirm-btn tatics-confirm-btn-sim"
          >
            SIM, ENCERRAR
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
