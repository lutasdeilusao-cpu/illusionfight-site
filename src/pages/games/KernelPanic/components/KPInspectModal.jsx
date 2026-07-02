export default function KPInspectModal({ card, onClose }) {
  if (!card) return null
  const kind = card.kind || card.type
  return (
    <div className="inspect-overlay show">
      <div className="inspect-box">
        <div className="ib-type">{kind}</div>
        <div className="ib-name">{card.name}</div>
        {card.bonus !== undefined && (
          <div className={`ib-bonus ${card.bonus >= 0 ? 'pos' : 'neg'}`}>
            {card.bonus > 0 ? '+' : ''}{card.bonus}
          </div>
        )}
        {card.desc && <div className="ib-desc">{card.desc}</div>}
        {card.attr && <div className="ib-slot">Atributo: {card.attr}</div>}
        {card.trigger && <div className="ib-slot">Trigger: {card.trigger}</div>}
        <button className="btn-inspect-close" onClick={onClose}>FECHAR</button>
      </div>
    </div>
  )
}
