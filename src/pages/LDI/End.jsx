import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from './store/useGameStore'
import { useReader } from '../../context/ReaderContext'
import './LDI.css'

const END_MESSAGES = {
  defeat_combat: {
    title: 'K.O.',
    text: 'Você foi longe. Mas não longe o suficiente.',
  },
  fork_refused: {
    title: 'RECUSA',
    text: 'Você estava certo em recusar. Mas isso não foi suficiente.',
  },
  fork_betrayal: {
    title: 'TRAIÇÃO',
    text: 'Você escolheu o lado errado. Ou o certo, dependendo de como mede.',
  },
  ended_victory: {
    title: 'VITÓRIA',
    text: 'O Arco 1 está completo. Mas a lenda apenas começou.',
  },
}

export default function End() {
  const { setReaderMode } = useReader()
  const { sheet, save, resetGame } = useGameStore()

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])
  const endType = save?.status || 'ended_victory'
  const msg = END_MESSAGES[endType] || END_MESSAGES.ended_victory

  return (
    <div className="ldi-end">
      <motion.div
        className="ldi-end-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <motion.div
          className="ldi-end-title"
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {msg.title}
        </motion.div>

        <motion.p
          className="ldi-end-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          {msg.text}
        </motion.p>

        <motion.div
          className="ldi-end-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <div className="ldi-end-stat">
            <span className="ldi-end-stat-label">Dia in-game</span>
            <span className="ldi-end-stat-value">{save?.day_in_game || 1}</span>
          </div>
          <div className="ldi-end-stat">
            <span className="ldi-end-stat-label">Pistas Coletadas</span>
            <span className="ldi-end-stat-value">{save?.clues_collected?.length || 0}</span>
          </div>
          <div className="ldi-end-stat">
            <span className="ldi-end-stat-label">Créditos</span>
            <span className="ldi-end-stat-value">{save?.credits || 0}</span>
          </div>
        </motion.div>

        {save?.clues_collected?.length > 0 && (
          <motion.div
            className="ldi-end-clues"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
          >
            <h3>Pistas:</h3>
            <ul>
              {save.clues_collected.map((clue, i) => (
                <li key={i}>{clue.text}</li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          className="ldi-end-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.5 }}
        >
          <Link
            to="/extras/ldi/game"
            className="ldi-btn ldi-btn--primary"
            onClick={resetGame}
          >
            NOVO RUN COM ESTA FICHA
          </Link>
          <Link
            to="/extras/ldi/create"
            className="ldi-btn ldi-btn--outline"
            onClick={resetGame}
          >
            CRIAR NOVA FICHA
          </Link>
          <Link
            to="/extras"
            className="ldi-btn ldi-btn--ghost"
          >
            VOLTAR AOS EXTRAS
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
