import { motion } from 'framer-motion'
import { getCorPorElemental } from '../data/cosmeticos'
import { useLanguage } from '../../../context/LanguageContext'

export default function ActionMenu({ personagem, onMover, onAtacar, onItem, onClose, onEndTurn, jaMoveu, jaAtacou }) {
  const { t } = useLanguage()
  const corElem = personagem.elemental ? getCorPorElemental(personagem.elemental) : '#00B4D8'
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="tatics-action-overlay"
    >
      <div className="tatics-action-backdrop" onClick={onClose} />
      <div className="tatics-action-sheet">
        {/* Handle */}
        <div className="tatics-action-handle" />

        {/* Character info */}
        <div className="tatics-action-char">
          <div className="tatics-action-char-token" style={{ '--cor-elem': corElem }}>
            {personagem.nome?.[0] || '?'}
          </div>
          <div className="tatics-action-char-info">
            <div className="tatics-action-char-nome">{personagem.nome}</div>
            <div className="tatics-action-char-stats">
              {t('tatics.hp')} <span style={{ color: corElem }}>{personagem.hp}/{personagem.hpMax}</span>
              {' · '}
              {t('tatics.mp')} <span className="tatics-action-mp">{personagem.energia}/{personagem.energiaMax}</span>
            </div>
          </div>
          <button className="tatics-action-close" onClick={onClose}>✕</button>
        </div>

        {/* Action buttons */}
        <div className="tatics-action-buttons">
          <motion.button
            whileTap={!jaMoveu ? { scale: 0.95 } : {}}
            onClick={!jaMoveu ? onMover : undefined}
            className={`tatics-action-btn ${jaMoveu ? 'btn-usado' : 'btn-mover'}`}
          >
            <span className="tatics-action-btn-icone">{jaMoveu ? '🔒' : '👣'}</span>
            <span className="tatics-action-btn-label">{jaMoveu ? t('tatics.ja_movido') : t('tatics.mover')}</span>
          </motion.button>

          <motion.button
            whileTap={!jaAtacou ? { scale: 0.95 } : {}}
            onClick={!jaAtacou ? onAtacar : undefined}
            className={`tatics-action-btn ${jaAtacou ? 'btn-usado' : 'btn-atacar'}`}
          >
            <span className="tatics-action-btn-icone">{jaAtacou ? '🔒' : '⚔️'}</span>
            <span className="tatics-action-btn-label">{jaAtacou ? t('tatics.ja_atacou') : t('tatics.atacar')}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onItem}
            className="tatics-action-btn btn-item"
          >
            <span className="tatics-action-btn-icone">🎒</span>
            <span className="tatics-action-btn-label">{t('tatics.item')}</span>
          </motion.button>
        </div>

        {/* End Turn */}
        <button className="tatics-action-endturn" onClick={onEndTurn}>
          ⏭ {t('tatics.finalizar_turno')}
        </button>
      </div>
    </motion.div>
  )
}
