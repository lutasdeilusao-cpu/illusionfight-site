import { useDueloStore } from '../store/useDueloStore'

const TYPE_COLORS = { MONSTER: '#F5A623', SPELL: '#22C55E', TRAP: '#EF4444' }
const TYPE_LABELS = { MONSTER: 'MONSTRO', SPELL: 'MAGIA', TRAP: 'ARMADILHA' }

export default function Card({ card, faceDown = false, small = false, onClick, onMouseEnter, onMouseLeave, disabled }) {
  const store = useDueloStore()
  const buff = card ? store.tempBuffs.find(b => b.cardId === card.id) : null
  const effectiveAtk = card ? (card.atk || 0) + (buff?.atkBonus || 0) : 0

  if (!card && !faceDown) return null

  const color = card ? TYPE_COLORS[card.type] || '#888' : '#3A3A5A'

  const handleClick = () => {
    if (!disabled && onClick) onClick(card)
  }

  const cardStyle = {
    width: small ? 50 : card?.type === 'MONSTER' ? 72 : 68,
    height: small ? 70 : card?.type === 'MONSTER' ? 100 : 70,
    background: faceDown ? '#1A1A2E' : '#0D0D1A',
    border: `2px solid ${faceDown ? '#3A3A5A' : color}`,
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    cursor: disabled ? 'default' : 'pointer',
    position: 'relative',
    flexShrink: 0,
    transition: 'transform 0.15s, border-color 0.15s',
    fontFamily: '"Courier New", monospace',
    userSelect: 'none',
  }

  if (faceDown) {
    return (
      <div style={cardStyle} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={handleClick}
        title="Face-down">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
          <span style={{ fontSize: 20, color: '#3A3A5A' }}>LDI</span>
        </div>
      </div>
    )
  }

  const isMonster = card.type === 'MONSTER'
  const stars = isMonster ? '★'.repeat(card.level) : ''

  return (
    <div style={cardStyle} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={handleClick}>
      {/* Art placeholder */}
      <div style={{
        flex: 1,
        background: `linear-gradient(135deg, ${color}22, ${color}08)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isMonster ? 24 : 18,
        minHeight: isMonster ? 55 : 0,
      }}>
        {isMonster ? '⚔️' : card.type === 'SPELL' ? '✨' : '🕳️'}
      </div>
      {/* Nome + info */}
      <div style={{
        padding: '2px 4px', borderTop: `1px solid ${color}33`,
        display: 'flex', flexDirection: 'column', gap: 1,
      }}>
        <span style={{ fontSize: small ? 7 : 8, color, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {card.name}
        </span>
        {isMonster && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#666' }}>
            <span style={{ color: '#F5A623', fontSize: 6 }}>{stars}</span>
            <span>ATK {effectiveAtk}/{card.def}</span>
          </div>
        )}
        {!isMonster && card.type === 'SPELL' && (
          <span style={{ fontSize: 7, color: '#22C55E', letterSpacing: 1 }}>MAGIA</span>
        )}
        {!isMonster && card.type === 'TRAP' && (
          <span style={{ fontSize: 7, color: '#EF4444', letterSpacing: 1 }}>ARMADILHA</span>
        )}
      </div>
    </div>
  )
}

export { TYPE_COLORS, TYPE_LABELS }
