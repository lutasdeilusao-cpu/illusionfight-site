import { motion, AnimatePresence } from 'framer-motion'

export default function DanoPopup({ danos = [] }) {
  return (
    <AnimatePresence>
      {danos.map(d => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 0, scale: 0.3 }}
          animate={{ opacity: 1, y: -50, scale: 1.3 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="tatics-dano-popup"
          style={{
            left: d.x, top: d.y,
            '--dano-cor': d.critico ? '#F4A227' : d.curativo ? '#1D9E75' : '#E24B4A',
            fontSize: d.critico ? '2rem' : '1.4rem',
          }}
        >
          {d.curativo ? `+${d.valor}` : d.critico ? `⚡${d.valor}` : `-${d.valor}`}
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
