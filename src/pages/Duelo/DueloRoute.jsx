import { useState, useCallback } from 'react'
import { useDueloStore } from './store/useDueloStore'
import Board from './components/Board'
import Hand from './components/Hand'
import StatusBar from './components/StatusBar'
import BattleLog from './components/BattleLog'
import TributeSelector from './components/TributeSelector'
import './Duelo.css'

export default function DueloRoute() {
  const store = useDueloStore()
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showTribute, setShowTribute] = useState(null) // { card, needed, available }

  const handleCardHover = useCallback((card) => {
    setHoveredCard(card)
  }, [])

  const handleCardClick = useCallback((card) => {
    if (!card || store.currentTurn !== 'PLAYER') return

    // MAIN: selecionar da mão
    if (store.gamePhase === 'MAIN') {
      if (store.selectedCard?.id === card.id) {
        store.setState({ selectedCard: null })
      } else {
        store.setState({ selectedCard: card })
      }
    }
    // BATTLE: selecionar atacante no campo
    if (store.gamePhase === 'BATTLE' && card.type === 'MONSTER' && card.position === 'ATK') {
      if (store.selectedCard?.id === card.id) {
        store.setState({ selectedCard: null })
      } else {
        store.setState({ selectedCard: card })
      }
    }
  }, [store])

  const handleSlotClick = useCallback((owner, zoneType, zoneIndex, card) => {
    const isPlayerTurn = store.currentTurn === 'PLAYER'
    if (!isPlayerTurn || store.gamePhase === 'OVER') return
    const sel = store.selectedCard

    // MAIN: colocar carta na zona
    if (store.gamePhase === 'MAIN' && sel && !card && owner === 'PLAYER') {
      if (sel.type === 'MONSTER' && zoneType === 'MONSTER') {
        if (store.hasNormalSummonedThisTurn) return
        // Tributo
        if (sel.level >= 4) {
          const needed = sel.level >= 6 ? 2 : 1
          const available = store.playerMonsterZones.filter(m => m)
          if (available.length < needed) return
          setShowTribute({ card: sel, needed, available })
          return
        }
        store.placeCardInZone(sel.id, 'MONSTER', zoneIndex, 'ATK', 'PLAYER')
      } else if (sel.type === 'SPELL' && zoneType === 'SPELL') {
        store.activateEffect(sel, 'PLAYER')
      } else if (sel.type === 'TRAP' && zoneType === 'SPELL') {
        store.setState(state => {
          const zones = [...state.playerSpellZones]
          const freeIdx = zones.findIndex(z => z === null)
          if (freeIdx < 0) return state
          zones[freeIdx] = { ...sel, faceDown: true }
          return {
            playerSpellZones: zones,
            playerHand: state.playerHand.filter(c => c.id !== sel.id),
            selectedCard: null,
            battleLog: [...state.battleLog, `Você colocou ${sel.name} face-down.`],
          }
        })
      }
    }

    // BATTLE: atacar
    if (store.gamePhase === 'BATTLE' && sel?.type === 'MONSTER' && sel.position === 'ATK') {
      if (owner === 'AI' && zoneType === 'MONSTER' && card) {
        const attIdx = store.playerMonsterZones.findIndex(m => m?.id === sel.id)
        if (attIdx >= 0) store.declareAttack(attIdx, zoneIndex)
      } else if (owner === 'AI' && zoneType === 'MONSTER' && !card) {
        // Ataque direto
        const enemyHasMonsters = store.aiMonsterZones.some(m => m)
        if (!enemyHasMonsters) {
          const attIdx = store.playerMonsterZones.findIndex(m => m?.id === sel.id)
          if (attIdx >= 0) store.declareAttack(attIdx, -1)
        }
      }
    }

    if (card) setHoveredCard(card)
  }, [store])

  // Tributo
  const handleTributeSelect = (indices) => {
    if (!showTribute) return
    const zones = [...store.playerMonsterZones]
    const graveyard = [...store.playerGraveyard]
    indices.forEach(i => {
      const m = zones.find((m, idx) => m && i === idx)
      if (m) {
        zones[zones.indexOf(m)] = null
        graveyard.push(m)
      }
    })
    // Encontrar zona livre
    const freeIdx = zones.findIndex(z => z === null)
    if (freeIdx < 0) { setShowTribute(null); return }
    zones[freeIdx] = { ...showTribute.card, position: 'ATK', placedOnTurn: store.turnNumber }
    const hand = store.playerHand.filter(c => c.id !== showTribute.card.id)
    const summonTurn = { ...store.summonTurn, [showTribute.card.id]: store.turnNumber }

    store.setState({
      playerMonsterZones: zones,
      playerGraveyard: graveyard,
      playerHand: hand,
      selectedCard: null,
      hasNormalSummonedThisTurn: true,
      summonTurn,
      battleLog: [...store.battleLog, `Você invocou ${showTribute.card.name} (${showTribute.card.atk}/${showTribute.card.def}) com ${indices.length} tributo${indices.length > 1 ? 's' : ''}.`],
    })
    setShowTribute(null)
  }

  // Draw + End
  const handlePhase = (phase) => {
    if (phase === 'DRAW') store.drawPhase()
    if (phase === 'END') {
      store.endPhase()
      // Auto-draw after end
      setTimeout(() => store.drawPhase(), 600)
    }
  }

  return (
    <div className="duelo-page">
      <Board onSlotClick={handleSlotClick} />

      {store.playerHand.length > 0 && (
        <Hand
          cards={store.playerHand}
          onCardClick={handleCardClick}
          onCardHover={handleCardHover}
          selectedCardId={store.selectedCard?.id}
          disabled={store.currentTurn !== 'PLAYER'}
        />
      )}

      <StatusBar card={hoveredCard || store.selectedCard || store.focusedCard} />

      <BattleLog log={store.battleLog} />

      <div className="duelo-controls">
        <span className="duelo-turn-indicator">
          Turno <span>{store.turnNumber}</span> · {store.currentTurn === 'PLAYER' ? 'VOCÊ' : 'IA'}
        </span>
        {store.currentTurn === 'PLAYER' && store.gamePhase !== 'OVER' && (
          <>
            <button className="duelo-phase-btn" onClick={() => handlePhase('DRAW')}
              disabled={store.gamePhase !== 'DRAW'}>
              DRAW
            </button>
            <button className={`duelo-phase-btn ${store.gamePhase === 'MAIN' ? 'duelo-phase-btn--active' : ''}`}
              onClick={() => store.setState({ gamePhase: 'MAIN' })}
              disabled={store.gamePhase === 'DRAW'}>
              MAIN
            </button>
            <button className={`duelo-phase-btn ${store.gamePhase === 'BATTLE' ? 'duelo-phase-btn--active' : ''}`}
              onClick={() => store.endMainPhase()}
              disabled={store.gamePhase !== 'MAIN'}>
              BATTLE
            </button>
            <button className="duelo-phase-btn"
              onClick={() => handlePhase('END')}
              disabled={store.gamePhase !== 'BATTLE'}>
              END
            </button>
          </>
        )}
        {store.gamePhase === 'OVER' && (
          <span style={{ color: '#F5A623', fontWeight: 700, letterSpacing: 2 }}>
            {store.winner === 'PLAYER' ? '🏆 VITÓRIA!' : '💀 DERROTA'}
          </span>
        )}
      </div>

      {/* Tribute Modal */}
      {showTribute && (
        <TributeSelector
          tributesNeeded={showTribute.needed}
          availableMonsters={showTribute.available}
          onSelect={handleTributeSelect}
          onCancel={() => setShowTribute(null)}
        />
      )}
    </div>
  )
}
