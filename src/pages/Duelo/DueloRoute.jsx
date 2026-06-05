import { useState, useCallback, useEffect } from 'react'
import { useDueloStore } from './store/useDueloStore'
import Board from './components/Board'
import Hand from './components/Hand'
import StatusBar from './components/StatusBar'
import BattleLog from './components/BattleLog'
import TributeSelector from './components/TributeSelector'
import TrapActivator from './components/TrapActivator'
import { aiMainPhase, aiBattlePhase } from './engine/ai'
import './Duelo.css'

const delay = ms => new Promise(r => setTimeout(r, ms))

export default function DueloRoute() {
  const store = useDueloStore()
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showTribute, setShowTribute] = useState(null)
  const [showTrap, setShowTrap] = useState(null) // AI trap activation prompt
  const [iaPending, setIaPending] = useState(false)
  const [attackAnim, setAttackAnim] = useState(null) // { attackerIdx, targetIdx, dmg }

  const handleCardHover = useCallback((card) => setHoveredCard(card), [])

  const handleCardClick = useCallback((card) => {
    if (!card || store.currentTurn !== 'PLAYER') return
    if (store.gamePhase === 'MAIN') {
      store.setState({ selectedCard: store.selectedCard?.id === card.id ? null : card })
    }
    if (store.gamePhase === 'BATTLE' && card.type === 'MONSTER' && card.position === 'ATK') {
      store.setState({ selectedCard: store.selectedCard?.id === card.id ? null : card })
    }
  }, [store])

  const handleSlotClick = useCallback((owner, zoneType, zoneIndex, card) => {
    if (store.currentTurn !== 'PLAYER' || store.gamePhase === 'OVER') return
    const sel = store.selectedCard

    if (store.gamePhase === 'MAIN' && sel && !card && owner === 'PLAYER') {
      if (sel.type === 'MONSTER' && zoneType === 'MONSTER') {
        if (store.hasNormalSummonedThisTurn) return
        if (sel.level >= 4) {
          const needed = sel.level >= 6 ? 2 : 1
          const available = store.playerMonsterZones.filter(m => m)
          if (available.length < needed) return
          setShowTribute({ card: sel, needed, available })
          return
        }
        store.placeCardInZone(sel.id, 'MONSTER', zoneIndex, 'ATK', 'PLAYER')
      } else if (sel.type === 'SPELL') {
        store.activateEffect(sel, 'PLAYER')
      } else if (sel.type === 'TRAP') {
        store.setState(state => {
          const zones = [...state.playerSpellZones]
          const freeIdx = zones.findIndex(z => z === null)
          if (freeIdx < 0) return state
          zones[freeIdx] = { ...sel, faceDown: true, placedOnTurn: state.turnNumber }
          return {
            playerSpellZones: zones,
            playerHand: state.playerHand.filter(c => c.id !== sel.id),
            selectedCard: null,
            battleLog: [...state.battleLog, `Você colocou ${sel.name} face-down.`],
          }
        })
      }
    }

    if (store.gamePhase === 'BATTLE' && sel?.type === 'MONSTER' && sel.position === 'ATK' && owner === 'AI') {
      if (zoneType === 'MONSTER' && card) {
        const attIdx = store.playerMonsterZones.findIndex(m => m?.id === sel.id)
        if (attIdx >= 0) {
          // Checar armadilha da IA
          const aiTrap = store.aiSpellZones.find(s => s?.type === 'TRAP' && s.faceDown && (s.placedOnTurn || 0) < store.turnNumber)
          if (aiTrap && card.atk > 1500) {
            // IA tem armadilha e monstro atacante é ameaça
            store.activateEffect({ ...aiTrap, id: aiTrap.id }, 'AI')
            // Remove armadilha do campo após ativar
            store.setState(state => {
              const zones = [...state.aiSpellZones]
              const idx = zones.findIndex(s => s?.id === aiTrap.id)
              if (idx >= 0) zones[idx] = null
              return { aiSpellZones: zones }
            })
          }
          store.declareAttack(attIdx, zoneIndex)
        }
      } else if (!card && !store.aiMonsterZones.some(m => m)) {
        // Ataque direto
        const attIdx = store.playerMonsterZones.findIndex(m => m?.id === sel.id)
        if (attIdx >= 0) store.declareAttack(attIdx, -1)
      }
    }

    if (card) setHoveredCard(card)
  }, [store])

  const handleTributeSelect = (indices) => {
    if (!showTribute) return
    const zones = [...store.playerMonsterZones]
    const graveyard = [...store.playerGraveyard]
    const sacrificed = []
    indices.forEach(i => { sacrificed.push(zones[i]); zones[i] = null; graveyard.push(sacrificed[sacrificed.length - 1]) })
    const freeIdx = zones.findIndex(z => z === null)
    zones[freeIdx] = { ...showTribute.card, position: 'ATK', placedOnTurn: store.turnNumber }
    store.setState({
      playerMonsterZones: zones, playerGraveyard: graveyard,
      playerHand: store.playerHand.filter(c => c.id !== showTribute.card.id),
      selectedCard: null, hasNormalSummonedThisTurn: true,
      summonTurn: { ...store.summonTurn, [showTribute.card.id]: store.turnNumber },
      battleLog: [...store.battleLog, `Você invocou ${showTribute.card.name} com ${indices.length} tributo(s).`],
    })
    setShowTribute(null)
  }

  // ── IA Turn ──
  useEffect(() => {
    if (store.currentTurn !== 'AI' || store.gamePhase === 'OVER' || iaPending) return

    const runAI = async () => {
      setIaPending(true)
      await delay(800)

      // Draw
      store.drawPhase()
      await delay(600)

      // Main Phase
      let mainResult = aiMainPhase(store)
      while (mainResult) {
        store.setState({ ...mainResult, gamePhase: 'MAIN' })
        await delay(1000)
        mainResult = aiMainPhase(store)
      }

      // Battle Phase
      const battleResult = aiBattlePhase(store)
      if (battleResult) {
        store.declareAttack(battleResult.attackerIdx, battleResult.targetIdx)
        await delay(1200)
      }

      // End
      store.endPhase()
      await delay(500)

      // Auto-draw for player
      store.drawPhase()
      setIaPending(false)
    }

    runAI()
  }, [store.currentTurn, store.gamePhase])

  return (
    <div className="duelo-page">
      <Board onSlotClick={handleSlotClick} />

      {store.playerHand.length > 0 && (
        <Hand cards={store.playerHand} onCardClick={handleCardClick} onCardHover={handleCardHover}
          selectedCardId={store.selectedCard?.id} disabled={store.currentTurn !== 'PLAYER'} />
      )}

      <StatusBar card={hoveredCard || store.selectedCard || store.focusedCard} />
      <BattleLog log={store.battleLog} />

      <div className="duelo-controls">
        <span className="duelo-turn-indicator">
          Turno <span>{store.turnNumber}</span> · {store.currentTurn === 'PLAYER' ? 'VOCÊ' : iaPending ? 'IA pensando...' : 'IA'}
        </span>
        {store.currentTurn === 'PLAYER' && store.gamePhase !== 'OVER' && (
          <>
            <button className="duelo-phase-btn" onClick={() => handlePhase('DRAW')} disabled={store.gamePhase !== 'DRAW'}>DRAW</button>
            <button className={`duelo-phase-btn ${store.gamePhase === 'MAIN' ? 'duelo-phase-btn--active' : ''}`}
              onClick={() => store.setState({ gamePhase: 'MAIN' })} disabled={store.gamePhase === 'DRAW'}>MAIN</button>
            <button className={`duelo-phase-btn ${store.gamePhase === 'BATTLE' ? 'duelo-phase-btn--active' : ''}`}
              onClick={() => store.endMainPhase()} disabled={store.gamePhase !== 'MAIN'}>BATTLE</button>
            <button className="duelo-phase-btn" onClick={() => handlePhase('END')} disabled={store.gamePhase !== 'BATTLE'}>END</button>
          </>
        )}
        {store.gamePhase === 'OVER' && (
          <span style={{ color: '#F5A623', fontWeight: 700, letterSpacing: 2 }}>
            {store.winner === 'PLAYER' ? '🏆 VITÓRIA!' : '💀 DERROTA'}
          </span>
        )}
      </div>

      {showTribute && (
        <TributeSelector tributesNeeded={showTribute.needed} availableMonsters={showTribute.available}
          onSelect={handleTributeSelect} onCancel={() => setShowTribute(null)} />
      )}
    </div>
  )
}

function handlePhase(phase) {
  const store = useDueloStore.getState()
  if (phase === 'DRAW') store.drawPhase()
  if (phase === 'END') { store.endPhase(); setTimeout(() => store.drawPhase(), 600) }
}
