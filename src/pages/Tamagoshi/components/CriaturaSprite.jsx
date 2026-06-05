import { motion, AnimatePresence } from 'framer-motion'

const ESTADO_EMOJI = {
  vivo: { scale: 1, y: 0 },
  critico: { scale: 0.85, y: 5 },
  morto: { scale: 0, y: 20 },
}

export default function CriaturaSprite({ criaturaId, status, estagio, criaturas }) {
  const c = criaturas.find(x => x.id === criaturaId)
  if (!c) return <div className="tama-sprite-placeholder">?</div>

  const anim = ESTADO_EMOJI[status] || ESTADO_EMOJI.vivo
  const tam = estagio >= 2 ? 4 : estagio === 1 ? 3 : 2

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${criaturaId}-${status}`}
        className="tama-sprite"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: anim.scale, opacity: 1, y: anim.y }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ fontSize: `${tam}rem` }}
      >
        {c.emoji}
      </motion.div>
    </AnimatePresence>
  )
}
