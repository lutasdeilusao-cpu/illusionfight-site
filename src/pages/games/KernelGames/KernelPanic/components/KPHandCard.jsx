export default function KPHandCard({ card, handIdx, onClick, onInspect }) {
  if (!card) return null

  const kind = card.kind || card.type
  const hcClass = kind === 'atk' ? 'hc-atk' : kind === 'def' ? 'hc-def' : kind === 'efx' ? 'hc-efx' : 'hc-eqp'

  function handleClick() {
    if (onClick) onClick(handIdx)
  }

  function handleContext(e) {
    e.preventDefault()
    if (onInspect) onInspect(card)
  }

  return (
    <div className={`hand-card ${hcClass}`} onClick={handleClick} onContextMenu={handleContext}>
      <div className="hc-type">{kind}</div>
      <div className="hc-name">{card.name}</div>
      {card.bonus !== undefined && (
        <div className={`hc-bonus ${card.bonus >= 0 ? 'pos' : 'neg'}`}>
          {card.bonus > 0 ? '+' : ''}{card.bonus}
        </div>
      )}
    </div>
  )
}
