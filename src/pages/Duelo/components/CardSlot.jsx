import Card from './Card'

export default function CardSlot({ card, faceDown, isDefense, onClick, onMouseEnter, onMouseLeave, disabled, small }) {
  if (!card) {
    return (
      <div
        onClick={onClick}
        style={{
          width: small ? 50 : 72,
          height: small ? 70 : 100,
          border: '1px dashed #1A1A2E',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
          background: 'rgba(255,255,255,0.01)',
          flexShrink: 0,
        }}
      />
    )
  }

  const cardData = faceDown ? null : card

  return (
    <div style={{ position: 'relative', transform: isDefense ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
      <Card
        card={cardData}
        faceDown={faceDown}
        small={small}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        disabled={disabled}
      />
    </div>
  )
}
