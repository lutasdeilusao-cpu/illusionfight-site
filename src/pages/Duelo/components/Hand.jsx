import Card from './Card'

export default function Hand({ cards, onCardClick, onCardHover, selectedCardId, disabled }) {
  if (!cards || cards.length === 0) return null

  return (
    <div className="duelo-hand">
      {cards.map((card, i) => (
        <div
          key={card.id}
          className={`duelo-hand-card ${selectedCardId === card.id ? 'duelo-hand-card--selected' : ''}`}
          style={{ transform: selectedCardId === card.id ? 'translateY(-12px)' : 'none' }}
        >
          <Card
            card={card}
            onClick={() => !disabled && onCardClick(card)}
            onMouseEnter={() => onCardHover(card)}
            onMouseLeave={() => onCardHover(null)}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  )
}
