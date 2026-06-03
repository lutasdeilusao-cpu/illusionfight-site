import { motion, AnimatePresence } from 'framer-motion'
import { MANUAL_SECTIONS } from '../data/manualData'

const drawer = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
  exit: { x: '100%', transition: { duration: 0.2 } },
}

export default function ManualDrawer({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="ldi-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="ldi-drawer"
            variants={drawer}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="ldi-drawer-header">
              <h2>📖 Manual do Jogo</h2>
              <button className="ldi-drawer-close" onClick={onClose}>✕</button>
            </div>
            <div className="ldi-drawer-body">
              {MANUAL_SECTIONS.map((section, i) => (
                <div key={i} className="ldi-drawer-section">
                  <h3 className="ldi-drawer-section-title">{section.title}</h3>
                  <p className="ldi-drawer-section-text">{section.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
