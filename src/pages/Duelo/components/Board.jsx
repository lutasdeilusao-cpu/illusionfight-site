import { useDueloStore } from '../store/useDueloStore'
import PlayerZone from './PlayerZone'
import LPDisplay from './LPDisplay'

export default function Board({ onSlotClick }) {
  const store = useDueloStore()

  return (
    <div className="duelo-board">
      {/* Lado IA */}
      <div className="duelo-field-row duelo-field-row--ai">
        <div className="duelo-field-meta">
          <LPDisplay lp={store.aiLP} isPlayer={false} />
          <div className="duelo-deck-count">🂠 {store.aiDeck.length}</div>
        </div>
        <PlayerZone
          monsterZones={store.aiMonsterZones}
          spellZones={store.aiSpellZones}
          isPlayer={false}
          onSlotClick={(zone, idx, card) => onSlotClick('AI', zone, idx, card)}
        />
      </div>

      {/* Separador */}
      <div className="duelo-divider" />

      {/* Lado Jogador */}
      <div className="duelo-field-row duelo-field-row--player">
        <PlayerZone
          monsterZones={store.playerMonsterZones}
          spellZones={store.playerSpellZones}
          isPlayer={true}
          onSlotClick={(zone, idx, card) => onSlotClick('PLAYER', zone, idx, card)}
        />
        <div className="duelo-field-meta">
          <LPDisplay lp={store.playerLP} isPlayer={true} />
          <div className="duelo-deck-count">🂠 {store.playerDeck.length}</div>
        </div>
      </div>
    </div>
  )
}
