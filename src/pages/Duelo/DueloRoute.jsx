import { useState, useCallback, useEffect } from 'react'
import { useDueloStore } from './store/useDueloStore'
import { useReader } from '../../context/ReaderContext'
import DueloMenu from './screens/DueloMenu'
import DueloVitoria from './screens/DueloVitoria'
import DueloDerrota from './screens/DueloDerrota'
import Board from './components/Board'
import Hand from './components/Hand'
import StatusBar from './components/StatusBar'
import BattleLog from './components/BattleLog'
import TributeSelector from './components/TributeSelector'
import CardPreviewModal from './components/CardPreviewModal'
import { aiMainPhase, aiBattlePhase } from './engine/ai'
import './Duelo.css'

const delay = ms => new Promise(r => setTimeout(r, ms))

export default function DueloRoute() {
  const store = useDueloStore()
  const { setReaderMode } = useReader()
  const [fase, setFase] = useState('menu')

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  const [hoveredCard, setHoveredCard] = useState(null)
  const [showTribute, setShowTribute] = useState(null)
  const [previewCard, setPreviewCard] = useState(null)
  const [iaPending, setIaPending] = useState(false)

  const startGame = () => { store.resetGame(); setFase('game') }

  const handleCardHover = useCallback((card) => setHoveredCard(card), [])

  const handleCardLongPress = useCallback((card) => {
    if (card) setPreviewCard(card)
  }, [])

  const handleCardClick = useCallback((card) => {
    const s = useDueloStore.getState()
    if (!card || s.currentTurn !== 'PLAYER') return
    const isMain = s.gamePhase === 'MAIN'
    const isBattle = s.gamePhase === 'BATTLE' && card.type === 'MONSTER' && card.position === 'ATK'
    if (isMain || isBattle) {
      s.setState({ selectedCard: s.selectedCard?.id_num === card.id_num ? null : card })
    }
  }, [])

  const handleSlotClick = useCallback((owner, zoneType, zoneIndex, card) => {
    const s = useDueloStore.getState()
    if (s.currentTurn !== 'PLAYER' || s.gamePhase === 'OVER') return
    const sel = s.selectedCard

    if (s.gamePhase === 'MAIN' && sel && !card && owner === 'PLAYER') {
      if (sel.type === 'MONSTER' && zoneType === 'MONSTER') {
        if (s.hasNormalSummonedThisTurn) return
        if (sel.level >= 4) {
          const needed = sel.level >= 6 ? 2 : 1
          const available = s.playerMonsterZones.filter(m => m)
          if (available.length < needed) return
          setShowTribute({ card: sel, needed, available })
          return
        }
        s.placeCardInZone(sel.id_num, 'MONSTER', zoneIndex, 'ATK', 'PLAYER')
      } else if (sel.type === 'SPELL') {
        s.activateEffect(sel, 'PLAYER')
      } else if (sel.type === 'TRAP') {
        s.setState(state => {
          const zones = [...state.playerSpellZones]
          const freeIdx = zones.findIndex(z => z === null)
          if (freeIdx < 0) return state
          zones[freeIdx] = { ...sel, faceDown: true, placedOnTurn: state.turnNumber }
          return {
            playerSpellZones: zones,
            playerHand: state.playerHand.filter(c => c.id_num !== sel.id_num),
            selectedCard: null,
            battleLog: [...state.battleLog, `Você colocou ${sel.name} face-down.`],
          }
        })
      }
    }

    if (s.gamePhase === 'BATTLE' && sel?.type === 'MONSTER' && sel.position === 'ATK' && owner === 'AI') {
      if (zoneType === 'MONSTER' && card) {
        const attIdx = s.playerMonsterZones.findIndex(m => m?.id_num === sel.id_num)
        if (attIdx >= 0) {
          const aiTrap = s.aiSpellZones.find(t => t?.type === 'TRAP' && t.faceDown && (t.placedOnTurn || 0) < s.turnNumber)
          if (aiTrap && card.atk > 1500) {
            s.activateEffect({ ...aiTrap, id: aiTrap.id_num }, 'AI')
            s.setState(state => {
              const zones = [...state.aiSpellZones]
              const idx = zones.findIndex(t => t?.id_num === aiTrap.id_num)
              if (idx >= 0) zones[idx] = null
              return { aiSpellZones: zones }
            })
          }
          s.declareAttack(attIdx, zoneIndex)
        }
      } else if (!card && !s.aiMonsterZones.some(m => m)) {
        const attIdx = s.playerMonsterZones.findIndex(m => m?.id_num === sel.id_num)
        if (attIdx >= 0) s.declareAttack(attIdx, -1)
      }
    }

    if (card) setHoveredCard(card)
  }, [])

  const handleTributeSelect = (indices) => {
    if (!showTribute) return
    const zones = [...store.playerMonsterZones]
    const graveyard = [...store.playerGraveyard]
    indices.forEach(i => { graveyard.push(zones[i]); zones[i] = null })
    const freeIdx = zones.findIndex(z => z === null)
    zones[freeIdx] = { ...showTribute.card, position: 'ATK', placedOnTurn: store.turnNumber }
    store.setState({
      playerMonsterZones: zones, playerGraveyard: graveyard,
      playerHand: store.playerHand.filter(c => c.id_num !== showTribute.card.id_num),
      selectedCard: null, hasNormalSummonedThisTurn: true,
      summonTurn: { ...store.summonTurn, [showTribute.card.id_num]: store.turnNumber },
      battleLog: [...store.battleLog, `Você invocou ${showTribute.card.name} com ${indices.length} tributo(s).`],
    })
    setShowTribute(null)
  }

  // ── IA Turn ──
  useEffect(() => {
    if (store.currentTurn !== 'AI' || store.gamePhase === 'OVER' || iaPending || fase !== 'game') return
    const runAI = async () => {
      setIaPending(true)
      await delay(800)
      store.drawPhase()
      await delay(600)
      let mainResult = aiMainPhase(store)
      while (mainResult) {
        store.setState({ ...mainResult, gamePhase: 'MAIN' })
        await delay(1000)
        mainResult = aiMainPhase(store)
      }
      const battleResult = aiBattlePhase(store)
      if (battleResult) { store.declareAttack(battleResult.attackerIdx, battleResult.targetIdx); await delay(1200) }
      store.endPhase()
      await delay(500)
      store.drawPhase()
      setIaPending(false)
    }
    runAI()
  }, [store.currentTurn, store.gamePhase, fase])

  // ── Check game over ──
  useEffect(() => {
    if (store.gamePhase === 'OVER' && fase === 'game') {
      setTimeout(() => setFase(store.winner === 'PLAYER' ? 'victory' : 'defeat'), 1200)
    }
  }, [store.gamePhase, fase])

  // ── RENDER ──
  if (fase === 'menu') return <><DueloMenu onStart={startGame} /></>
  if (fase === 'victory') return <DueloVitoria onRevanche={startGame} onMenu={() => setFase('menu')} />
  if (fase === 'defeat') return <DueloDerrota onRevanche={startGame} onMenu={() => setFase('menu')} />

  return (
    <div className="duelo-page">
      <Board onSlotClick={handleSlotClick} />

      {store.playerHand.length > 0 && (
        <Hand cards={store.playerHand} onCardClick={handleCardClick} onCardHover={handleCardHover}
          selectedCardId={store.selectedCard?.id_num} disabled={store.currentTurn !== 'PLAYER'} />
      )}

      <StatusBar card={hoveredCard || store.selectedCard || store.focusedCard} />
      <BattleLog log={store.battleLog} />

      <div className="duelo-controls">
        <span className="duelo-turn-indicator">
          Turno <span>{store.turnNumber}</span> · {store.currentTurn === 'PLAYER' ? 'VOCÊ' : iaPending ? 'IA pensando...' : 'IA'}
        </span>
        {store.currentTurn === 'PLAYER' && store.gamePhase !== 'OVER' && (
          <>
            <button className="duelo-phase-btn" onClick={() => store.drawPhase()} disabled={store.gamePhase !== 'DRAW'}>DRAW</button>
            <button className={`duelo-phase-btn ${store.gamePhase === 'MAIN' ? 'duelo-phase-btn--active' : ''}`}
              onClick={() => store.setState({ gamePhase: 'MAIN' })} disabled={store.gamePhase === 'DRAW'}>MAIN</button>
            <button className={`duelo-phase-btn ${store.gamePhase === 'BATTLE' ? 'duelo-phase-btn--active' : ''}`}
              onClick={() => store.endMainPhase()} disabled={store.gamePhase !== 'MAIN'}>BATTLE</button>
            <button className="duelo-phase-btn" onClick={() => { store.endPhase(); setTimeout(() => store.drawPhase(), 600) }} disabled={store.gamePhase !== 'BATTLE'}>END</button>
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

      {previewCard && <CardPreviewModal card={previewCard} onClose={() => setPreviewCard(null)} />}
    </div>
  )
}
