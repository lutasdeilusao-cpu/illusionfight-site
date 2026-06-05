import CardSlot from './CardSlot'

export default function PlayerZone({ monsterZones, spellZones, isPlayer, onSlotClick }) {
  return (
    <div className="duelo-player-zone">
      <div className="duelo-zone-row">
        {spellZones.map((card, i) => (
          <CardSlot key={`spell-${i}`} card={card} faceDown={card?.faceDown}
            onClick={(c) => onSlotClick('SPELL', i, c)} small />
        ))}
      </div>
      <div className="duelo-zone-row">
        {monsterZones.map((card, i) => (
          <CardSlot key={`monster-${i}`} card={card} isDefense={card?.position === 'DEF'}
            onClick={(c) => onSlotClick('MONSTER', i, c)} small />
        ))}
      </div>
    </div>
  )
}
