import Card from './Card'

export default function CardSlot({ card, faceDown, isDefense, onClick, onMouseEnter, onMouseLeave, disabled, small }) {
  if (!card) {
    return (
      <div
        className={`duelo-slot ${small ? 'duelo-slot--small' : 'duelo-slot--normal'}`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      />
    )
  }

  return (
    <div className="duelo-slot-wrap" style={{ transform: isDefense ? 'rotate(90deg)' : 'none' }}>
      <Card
        card={faceDown ? null : card}
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
