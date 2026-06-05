import { motion } from 'framer-motion'

export default function Ovo({ onEclodir }) {
  return (
    <div className="tama-screen">
      <div className="tama-ovo-container">
        <motion.div
          className="tama-ovo"
          animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🥚
        </motion.div>
        <p className="tama-ovo-text">um ovo misterioso... algo se mexe lá dentro</p>
        <motion.button
          className="tama-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEclodir}
        >
          [ tocar no ovo ]
        </motion.button>
      </div>
    </div>
  )
}
