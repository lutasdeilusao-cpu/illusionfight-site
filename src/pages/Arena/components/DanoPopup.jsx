import { motion, AnimatePresence } from 'framer-motion'

export default function DanoPopup({ danos = [] }) {
  return (
    <AnimatePresence>
      {danos.map(d => (
        <motion.div
          key={d.id}
          initial={{ opacity: 1, y: 0, scale: 0.5 }}
          animate={{ opacity: 0, y: -40, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute', left: d.x, top: d.y,
            color: d.critico ? '#FFD700' : d.curativo ? '#00FF88' : '#FF4444',
            fontSize: d.critico ? '1.8rem' : '1.2rem',
            fontWeight: 900, fontFamily: 'Courier New',
            pointerEvents: 'none', zIndex: 50,
            textShadow: `0 0 10px ${d.critico ? '#FFD700' : '#FF4444'}88`,
          }}>
          {d.curativo ? `+${d.valor}` : d.critico ? `⚡${d.valor}` : `-${d.valor}`}
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
