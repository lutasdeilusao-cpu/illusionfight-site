import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const itemAnim = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
}

export default function ChoiceList({ choices, onChoice, transitioning, selectedId }) {
  return (
    <motion.div
      className="ldi-choice-list"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {choices.map((choice, i) => {
        const isSelected = selectedId === choice.id
        const isDisabled = !choice.available || transitioning

        return (
          <motion.button
            key={choice.id}
            className={`ldi-choice-btn ${!choice.available ? 'ldi-choice-btn--blocked' : ''} ${isSelected ? 'ldi-choice-btn--selected' : ''}`}
            variants={itemAnim}
            onClick={() => !isDisabled && onChoice(choice)}
            disabled={isDisabled}
            whileHover={choice.available ? { scale: 1.02, borderColor: 'var(--ldi-accent-blue)' } : {}}
            whileTap={choice.available ? { scale: 0.98 } : {}}
          >
            <span className="ldi-choice-number">{String.fromCharCode(65 + i)}</span>
            <span className="ldi-choice-label">{choice.label}</span>

            {choice.cost > 0 && (
              <span className={`ldi-choice-cost ${!choice.available ? 'ldi-choice-cost--insufficient' : ''}`}>
                💰 {choice.cost}
              </span>
            )}

            {!choice.available && choice.reason && (
              <span className="ldi-choice-reason">🔒 {choice.reason}</span>
            )}
          </motion.button>
        )
      })}
    </motion.div>
  )
}
