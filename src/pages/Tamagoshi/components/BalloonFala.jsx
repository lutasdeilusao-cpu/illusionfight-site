import { motion, AnimatePresence } from 'framer-motion'

export default function BalloonFala({ texto, cor }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={texto}
        className="tama-balloon"
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        transition={{ duration: 0.3 }}
        style={{ borderColor: cor || '#555' }}
      >
        <span className="tama-balloon-text">{texto}</span>
        <div className="tama-balloon-arrow" style={{ borderTopColor: cor || '#555' }} />
      </motion.div>
    </AnimatePresence>
  )
}
