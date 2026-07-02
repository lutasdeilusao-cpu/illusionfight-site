import KPFieldSlot from './KPFieldSlot'
import KPHandCard from './KPHandCard'

export default function KPPlayerPanel({
  player, playerIdx, isCurrent, isOpponent, round, canAct,
  onInspect, onPlayToField, onActivateEquip, onDrawCard,
  onOpenShot, onPass, showActions, cardsPlayedThisTurn, drawnThisTurn,
}) {
  const prefix = playerIdx === 0 ? 'p1' : 'p2'
  const panelClass = `player-panel ${isOpponent ? 'is-opponent' : ''}`

  return (
    <div className={panelClass}>
      <div className="player-header">
        <div className={`player-name ${prefix}`}>J{playerIdx + 1}</div>
        {isCurrent && <div className="player-turn-badge">OPERANDO</div>}
        {!isCurrent && <div className="player-turn-badge hidden">—</div>}
      </div>

      <div className="field-area">
        <div className="field-label">Grid</div>
        <div className="field-grid">
          {player.field.map((card, i) => (
            <KPFieldSlot
              key={i}
              slotIdx={i}
              card={card}
              disabled={player.disabledSlots && player.disabledSlots[i] > round}
              round={round}
              onClick={canAct && onActivateEquip && card && card.type === 'eqp' ? onActivateEquip : null}
              onInspect={onInspect}
              isOpponent={isOpponent}
            />
          ))}
        </div>
      </div>

      <div className="hand-area">
        <div className="hand-label">Buffer</div>
        <div className="hand-cards">
          {player.hand.length === 0 && (
            <div className="hand-empty">— vazio —</div>
          )}
          {player.hand.map((card, i) => (
            <KPHandCard
              key={i}
              handIdx={i}
              card={card}
              onClick={canAct && !isOpponent ? onPlayToField : null}
              onInspect={onInspect}
            />
          ))}
        </div>
      </div>

      {showActions && (
        <div className="action-row">
          <button className="btn btn-draw" disabled={!canAct || drawnThisTurn || player.hand.length >= 5} onClick={onDrawCard}>
            {drawnThisTurn ? 'COMPRADO' : 'COMPRAR'}
          </button>
          <button className="btn btn-shoot" disabled={!canAct || cardsPlayedThisTurn === 0} onClick={onOpenShot}>
            ATIRAR
          </button>
          <button className="btn btn-pass" disabled={!canAct} onClick={onPass}>
            PASSAR
          </button>
        </div>
      )}
    </div>
  )
}
