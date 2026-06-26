import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'

export default function ClueBook({ clues, onClose }) {
  const { t } = useLanguage()
  const [filter, setFilter] = useState('all')
  const [newClueId, setNewClueId] = useState(null)

  if (!clues || clues.length === 0) {
    return (
      <div className="ldi-cluebook">
        <div className="ldi-cluebook-header">
          <h2>{t('games.ldi.cluebook.titulo')}</h2>
          <button className="ldi-cluebook-close" onClick={onClose}>âœ•</button>
        </div>
        <p className="ldi-cluebook-empty">{t('games.ldi.cluebook.vazio')}</p>
      </div>
    )
  }

  const filtered = filter === 'all' ? clues : clues.filter(c => c.type === filter)
  const types = [...new Set(clues.map(c => c.type))]

  return (
    <div className="ldi-cluebook">
      <div className="ldi-cluebook-header">
        <h2>{t('games.ldi.cluebook.titulo')}</h2>
        <button className="ldi-cluebook-close" onClick={onClose}>âœ•</button>
      </div>

      <div className="ldi-cluebook-filters">
        <button
          className={`ldi-cluebook-filter ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >{t('games.ldi.cluebook.todas', { n: clues.length })}</button>
        {types.map(t => (
          <button
            key={t}
            className={`ldi-cluebook-filter ${filter === t ? 'active' : ''}`}
            onClick={() => setFilter(t)}
          >{t} ({clues.filter(c => c.type === t).length})</button>
        ))}
      </div>

      <div className="ldi-cluebook-grid">
        <AnimatePresence>
          {filtered.map((clue, i) => (
            <motion.div
              key={clue.id || i}
              className={`ldi-clue-card ${newClueId === clue.id ? 'ldi-clue-card--new' : ''}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="ldi-clue-card-header">
                <span className="ldi-clue-day">{t('games.ldi.cluebook.dia', { n: clue.day || '?' })}</span>
                {clue.type && <span className="ldi-clue-type">{clue.type}</span>}
              </div>
              <p className="ldi-clue-text">{clue.text}</p>
              {clue.connected && (
                <div className="ldi-clue-connected">
                  ðŸ”— Conectadas
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
