import { motion, AnimatePresence } from 'framer-motion'

export default function BalloonFala({ texto, tipo }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={texto}
        className="tama-balloon"
        data-tipo={tipo || 'CARENTE'}
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <span className="tama-balloon-text">{texto}</span>
        <div className="tama-balloon-arrow" />
      </motion.div>
    </AnimatePresence>
  )
}
