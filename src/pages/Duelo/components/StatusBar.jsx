export default function StatusBar({ card }) {
  if (!card) {
    return (
      <div className="duelo-statusbar">
        <span className="duelo-statusbar-hint">toque numa carta para ver detalhes</span>
      </div>
    )
  }

  const isMonster = card.type === 'MONSTER'
  const stars = isMonster ? '★'.repeat(card.level || 0) : ''

  return (
    <div className="duelo-statusbar">
      <div className="duelo-statusbar-inner">
        <span className="duelo-statusbar-name">{card.name}</span>
        {isMonster && (
          <>
            <span className="duelo-statusbar-stars">{stars}</span>
            <span className="duelo-statusbar-atk">ATK {card.atk} / DEF {card.def}</span>
          </>
        )}
        {!isMonster && (
          <span className="duelo-statusbar-type">{card.type === 'SPELL' ? 'MAGIA' : 'ARMADILHA'}</span>
        )}
        <span className="duelo-statusbar-desc">{card.description}</span>
      </div>
    </div>
  )
}
