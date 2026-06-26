import { useDueloStore } from '../store/useDueloStore'
import { useLanguage } from '../../../../context/LanguageContext'

export default function Card({ card, faceDown = false, small = false, onClick, onMouseEnter, onMouseLeave, disabled }) {
  const { t } = useLanguage()
  const store = useDueloStore()
  const buff = card ? store.tempBuffs?.find(b => b.cardId === card.id_num) : null
  const effectiveAtk = card ? (card.atk || 0) + (buff?.atkBonus || 0) : 0

  if (!card && !faceDown) return null

  const color = card ? { MONSTER: '#F5A623', SPELL: '#22C55E', TRAP: '#EF4444' }[card.type] || '#888' : '#3A3A5A'

  const handleClick = () => { if (!disabled && onClick) onClick(card) }

  const isMonster = card?.type === 'MONSTER'
  const typeClass = faceDown ? 'duelo-card--facedown' : isMonster ? 'duelo-card--monster' : card?.type === 'SPELL' ? 'duelo-card--spell' : 'duelo-card--trap'
  const sizeClass = small ? (isMonster ? 'duelo-card--small-monster' : 'duelo-card--small-other') : ''
  const cursorClass = disabled ? 'duelo-card--disabled' : ''

  const borderStyle = { border: `2px solid ${faceDown ? '#3A3A5A' : color}` }
  const artBg = { background: faceDown ? undefined : `linear-gradient(135deg, ${color}22, ${color}08)` }

  if (faceDown) {
    return (
      <div className={`duelo-card duelo-card--facedown ${sizeClass} ${cursorClass}`}
        onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={handleClick}
        title="Face-down">
        <div className="duelo-card-facedown-inner">
          <span className="duelo-card-facedown-text">LDI</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`duelo-card ${typeClass} ${sizeClass} ${cursorClass}`}
      style={borderStyle}
      onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={handleClick}>
      <div className="duelo-card-art" style={artBg}>
        <span className="duelo-card-art-icon">{isMonster ? 'âš”ï¸' : card.type === 'SPELL' ? 'âœ¨' : 'ðŸ•³ï¸'}</span>
      </div>
      <div className="duelo-card-info" style={{ borderTop: `1px solid ${color}33` }}>
        <span className="duelo-card-name" style={{ color }}>{card.name}</span>
        {isMonster && (
          <div className="duelo-card-stats">
            <span>{t('games.duelo.card_atk')} {effectiveAtk} / {t('games.duelo.card_def')} {card.def}</span>
            <span className="duelo-card-movrng">
              ðŸ‘Ÿ{card.mov} ðŸŽ¯{card.rng}
            </span>
          </div>
        )}
        {!isMonster && card.type === 'SPELL' && (
          <span className="duelo-card-type-badge" style={{ color: '#22C55E' }}>{t('games.duelo.card_magia')}</span>
        )}
        {!isMonster && card.type === 'TRAP' && (
          <span className="duelo-card-type-badge" style={{ color: '#EF4444' }}>{t('games.duelo.card_armadilha')}</span>
        )}
      </div>
    </div>
  )
}
