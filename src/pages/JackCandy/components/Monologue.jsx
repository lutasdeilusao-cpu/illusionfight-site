import { motion, AnimatePresence } from 'framer-motion'

export default function Monologue({ text, onClose }) {
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
        <p className="jack-text jack-text--dim" style={{ fontSize: '0.65rem', marginTop: '0.3rem' }}>[ clique para fechar ]</p>
      </motion.div>
    </AnimatePresence>
  )
}
