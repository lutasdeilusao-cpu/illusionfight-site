import { useKpI18n } from '../hooks/useKpI18n'

export default function KPFieldSlot({ card, slotIdx, disabled, round, onClick, onInspect, isOpponent }) {
  const { t } = useKpI18n()
  if (disabled) {
    return <div className="field-slot disabled-slot" title={t('kp.fieldslot.bloqueado', { round: round + 5 })} />
  }

  if (!card) {
    return <div className="field-slot" />
  }

  const kind = card.kind || card.type
  const typeClass = kind === 'atk' ? 'type-atk' : kind === 'def' ? 'type-def' : kind === 'efx' ? 'type-efx' : 'type-eqp'

  function handleClick(e) {
    if (onClick) onClick(slotIdx)
  }

  function handleContext(e) {
    e.preventDefault()
    if (onInspect) onInspect(card)
  }

  if (isOpponent) {
    return (
      <div className="field-slot has-card" onClick={(e) => { e.preventDefault(); if (onInspect) onInspect(card) }}>
        <div className="card-back">
          <div className="card-back-symbol">⬡</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`field-slot has-card`} onClick={handleClick} onContextMenu={handleContext}>
      <div className={`card-face ${typeClass}`}>
        <div className="cf-type">{kind}</div>
        <div className="cf-name">{card.name}</div>
        {card.bonus !== undefined && (
          <div className={`cf-bonus ${card.bonus >= 0 ? 'pos' : 'neg'}`}>
            {card.bonus > 0 ? '+' : ''}{card.bonus}
          </div>
        )}
        {card.desc && <div className="cf-desc">{card.desc}</div>}
      </div>
    </div>
  )
}
