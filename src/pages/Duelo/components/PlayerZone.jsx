import CardSlot from './CardSlot'

export default function PlayerZone({ monsterZones, spellZones, isPlayer, onSlotClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      {/* Magia / Armadilha */}
      <div style={{ display: 'flex', gap: 6 }}>
        {spellZones.map((card, i) => (
          <CardSlot
            key={`spell-${i}`}
            card={card}
            faceDown={card?.faceDown}
            onClick={(c) => onSlotClick('SPELL', i, c)}
            small
          />
        ))}
      </div>
      {/* Monstros */}
      <div style={{ display: 'flex', gap: 6 }}>
        {monsterZones.map((card, i) => (
          <CardSlot
            key={`monster-${i}`}
            card={card}
            isDefense={card?.position === 'DEF'}
            onClick={(c) => onSlotClick('MONSTER', i, c)}
            small
          />
        ))}
      </div>
    </div>
  )
}
