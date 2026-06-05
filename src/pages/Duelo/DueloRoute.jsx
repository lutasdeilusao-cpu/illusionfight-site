import { useState, useCallback } from 'react'
import { useDueloStore } from './store/useDueloStore'
import Board from './components/Board'
import Hand from './components/Hand'
import StatusBar from './components/StatusBar'
import './Duelo.css'

export default function DueloRoute() {
  const store = useDueloStore()
  const [fase, setFase] = useState('game') // menu | game | victory | defeat
  const [hoveredCard, setHoveredCard] = useState(null)

  const handleCardHover = useCallback((card) => {
    setHoveredCard(card)
  }, [])

  const handleCardClick = useCallback((card) => {
    if (!card) return
    const isMain = store.gamePhase === 'MAIN'
    const isBattle = store.gamePhase === 'BATTLE'
    const isPlayerTurn = store.currentTurn === 'PLAYER'

    if (!isPlayerTurn) return

    if (isMain) {
      // Selecionar/desselecionar carta da mão
      if (store.selectedCard?.id === card.id) {
        store.setState({ selectedCard: null })
      } else if (card.type === 'SPELL') {
        store.setState({ selectedCard: card })
      } else {
        store.setState({ selectedCard: card })
      }
    }

    if (isBattle && card.type === 'MONSTER' && card.position === 'ATK') {
      // Selecionar atacante
      if (store.selectedCard?.id === card.id) {
        store.setState({ selectedCard: null })
      } else {
        store.setState({ selectedCard: card })
      }
    }
  }, [store])

  const handleSlotClick = useCallback((owner, zoneType, zoneIndex, card) => {
    const isMain = store.gamePhase === 'MAIN'
    const isBattle = store.gamePhase === 'BATTLE'
    const isPlayerTurn = store.currentTurn === 'PLAYER'
    const sel = store.selectedCard

    if (!isPlayerTurn) return

    // MAIN: colocar carta selecionada na zona vazia
    if (isMain && sel && !card && owner === 'PLAYER') {
      if (sel.type === 'MONSTER' && zoneType === 'MONSTER') {
        if (sel.level >= 4 && !store.awaitingTribute) {
          const tributesNeeded = sel.level >= 6 ? 2 : 1
          const available = store.playerMonsterZones.filter(m => m)
          if (available.length < tributesNeeded) return
          // TODO: abrir TributeSelector
          return
        }
        if (store.hasNormalSummonedThisTurn) return
        store.placeCardInZone(sel.id, 'MONSTER', zoneIndex, 'ATK', 'PLAYER')
      } else if (sel.type === 'SPELL') {
        store.activateEffect(sel, 'PLAYER')
      } else if (sel.type === 'TRAP') {
        const trapCard = { ...sel, faceDown: true }
        store.setState(state => {
          const zones = [...state.playerSpellZones]
          const freeIdx = zones.findIndex(z => z === null)
          if (freeIdx < 0) return state
          zones[freeIdx] = trapCard
          const hand = state.playerHand.filter(c => c.id !== sel.id)
          return { playerSpellZones: zones, playerHand: hand, selectedCard: null }
        })
      }
    }

    // BATTLE: atacar alvo
    if (isBattle && sel && sel.type === 'MONSTER' && sel.position === 'ATK') {
      if (card && owner === 'AI' && zoneType === 'MONSTER') {
        // Encontrar o índice do atacante
        const attIdx = store.playerMonsterZones.findIndex(m => m?.id === sel.id)
        if (attIdx >= 0) {
          store.declareAttack(attIdx, zoneIndex)
        }
      } else if (!card && owner === 'AI' && zoneType === 'MONSTER') {
        // Ataque direto
        const attIdx = store.playerMonsterZones.findIndex(m => m?.id === sel.id)
        if (attIdx >= 0) {
          store.declareAttack(attIdx, -1) // -1 = direto
        }
      }
    }

    // Hover info
    if (card) setHoveredCard(card)
  }, [store])

  return (
    <div className="duelo-page">
      {/* Campo principal */}
      <Board onSlotClick={handleSlotClick} />

      {/* Mão do jogador */}
      {store.playerHand.length > 0 && (
        <Hand
          cards={store.playerHand}
          onCardClick={handleCardClick}
          onCardHover={handleCardHover}
          selectedCardId={store.selectedCard?.id}
          disabled={store.currentTurn !== 'PLAYER'}
        />
      )}

      {/* Status Bar */}
      <StatusBar card={hoveredCard || store.focusedCard} />

      {/* Phase Controls */}
      <div className="duelo-controls">
        <span className="duelo-turn-indicator">
          Turno <span>{store.turnNumber}</span> · {store.currentTurn === 'PLAYER' ? 'VOCÊ' : 'IA'}
        </span>
        {store.currentTurn === 'PLAYER' && store.gamePhase !== 'OVER' && (
          <>
            <button
              className={`duelo-phase-btn ${store.gamePhase === 'MAIN' ? 'duelo-phase-btn--active' : ''}`}
              disabled={store.gamePhase !== 'BATTLE' && store.gamePhase !== 'END'}
              onClick={() => store.setState({ gamePhase: 'MAIN' })}
            >MAIN</button>
            <button
              className={`duelo-phase-btn ${store.gamePhase === 'BATTLE' ? 'duelo-phase-btn--active' : ''}`}
              disabled={store.gamePhase !== 'MAIN' && store.gamePhase !== 'BATTLE'}
              onClick={() => {
                if (store.gamePhase === 'MAIN') store.endMainPhase()
              }}
            >BATTLE</button>
            <button
              className={`duelo-phase-btn ${store.gamePhase === 'END' ? 'duelo-phase-btn--active' : ''}`}
              onClick={() => { store.endPhase(); store.drawPhase() }}
            >END</button>
          </>
        )}
      </div>
    </div>
  )
}
