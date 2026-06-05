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
import TrapActivator from './components/TrapActivator'
import { aiMainPhase, aiBattlePhase } from './engine/ai'
import './Duelo.css'

const delay = ms => new Promise(r => setTimeout(r, ms))

export default function DueloRoute() {
  const store = useDueloStore()
  window.__dueloStore = useDueloStore
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
  const [pendingTrap, setPendingTrap] = useState(null) // { trap, onResolve }

  const startGame = () => { console.log('[BTN] startGame'); store.resetGame(); setFase('game') }

  const handleCardHover = useCallback((card) => setHoveredCard(card), [])

  const handleCardLongPress = useCallback((card) => {
    console.log('[LONGPRESS] card:', card?.name, card?.id_num)
    if (card) setPreviewCard(card)
  }, [])

  const handleCardClick = useCallback((card) => {
    console.log('[CLICK] handleCardClick | card:', card?.name, card?.id_num)
    const s = useDueloStore.getState()
    if (!card || s.currentTurn !== 'PLAYER') return
    const isMain = s.gamePhase === 'MAIN'
    const isBattle = s.gamePhase === 'BATTLE' && card.type === 'MONSTER' && card.position === 'ATK'
    if (isMain || isBattle) {
      s.setState({ selectedCard: s.selectedCard?.id_num === card.id_num ? null : card })
      console.log('[SET] selectedCard:', useDueloStore.getState().selectedCard?.name ?? 'null')
    }
  }, [])

  const handleSlotClick = useCallback((owner, zoneType, zoneIndex, card) => {
    console.log('[CLICK] handleSlotClick | owner:', owner, '| zoneType:', zoneType, '| zoneIndex:', zoneIndex, '| card:', card?.name ?? 'vazio')
    const s = useDueloStore.getState()
    console.log('[STATE] selectedCard:', s.selectedCard?.name, '| gamePhase:', s.gamePhase, '| turn:', s.currentTurn)

    if (s.currentTurn !== 'PLAYER' || s.gamePhase === 'OVER') {
      console.log('[BLOQUEIO] turno ou fase incorreta')
      return
    }

    // ── Selecionar atacante no board em BATTLE ──
    if (s.gamePhase === 'BATTLE' && owner === 'PLAYER' && card && card.type === 'MONSTER' && card.position === 'ATK') {
      console.log('[BATTLE] selecionando atacante:', card.name)
      s.setState({ selectedCard: card })
      return
    }

    const sel = s.selectedCard
    console.log('[SEL]', sel?.name, '| sel.type:', sel?.type, '| zoneType:', zoneType, '| owner:', owner, '| card vazio?', !card)

    if (s.gamePhase === 'MAIN' && sel && !card && owner === 'PLAYER') {
      console.log('[PASSOU condição principal]')
      if (sel.type === 'MONSTER' && zoneType === 'MONSTER') {
        console.log('[MONSTER] hasNormalSummoned:', s.hasNormalSummonedThisTurn, '| level:', sel.level)
        if (s.hasNormalSummonedThisTurn) { console.log('[BLOQUEIO] já invocou'); return }
        if (sel.level >= 4) {
          const needed = sel.level >= 6 ? 2 : 1
          const available = s.playerMonsterZones.filter(m => m)
          console.log('[TRIBUTE] needed:', needed, '| available:', available.length)
          if (available.length < needed) { console.log('[BLOQUEIO] sem tributo'); return }
          setShowTribute({ card: sel, needed, available })
          return
        }
        console.log('[INVOCAR] placeCardInZone', sel.id_num, zoneIndex)
        s.placeCardInZone(sel.id_num, 'MONSTER', zoneIndex, 'ATK', 'PLAYER')
      } else if (sel.type === 'SPELL') {
        console.log('[SPELL] ativando:', sel.name)
        s.activateEffect(sel, 'PLAYER')
      } else if (sel.type === 'TRAP') {
        console.log('[TRAP] colocando face-down:', sel.name)
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
      } else {
        console.log('[NENHUM BLOCO] sel.type não reconhecido:', sel?.type)
      }
    } else {
      console.log('[FALHOU condição principal] gamePhase:', s.gamePhase, '| sel:', sel?.name, '| !card:', !card, '| owner:', owner)
    }

    if (s.gamePhase === 'BATTLE' && sel?.type === 'MONSTER' && sel.position === 'ATK' && owner === 'AI') {
      if (zoneType === 'MONSTER') {
        const attIdx = s.playerMonsterZones.findIndex(m => m?.id_num === sel.id_num)
        if (attIdx < 0) return

        const doAttack = () => {
          const current = useDueloStore.getState()
          if (card) {
            console.log('[ATAQUE] atacante:', sel.name, '→ alvo:', card.name)
            current.declareAttack(attIdx, zoneIndex)
          } else {
            const enemyHasMonsters = current.aiMonsterZones.some(m => m)
            if (!enemyHasMonsters) {
              console.log('[ATAQUE DIRETO] atacante:', sel.name)
              current.declareAttack(attIdx, -1)
            }
          }
        }

        // Prompt armadilha do jogador
        if (card) {
          const playerTrap = s.playerSpellZones.find(t => t?.type === 'TRAP' && t.faceDown && (t.placedOnTurn || 0) < s.turnNumber)
          if (playerTrap) {
            setPendingTrap({
              trap: playerTrap,
              onActivate: () => {
                const cur = useDueloStore.getState()
                cur.activateEffect({ ...playerTrap, id: playerTrap.id_num }, 'PLAYER')
                cur.setState(st => {
                  const zones = [...st.playerSpellZones]
                  const idx = zones.findIndex(t => t?.id_num === playerTrap.id_num)
                  if (idx >= 0) zones[idx] = null
                  return { playerSpellZones: zones }
                })
                doAttack()
                setPendingTrap(null)
              },
              onSkip: () => { doAttack(); setPendingTrap(null) },
            })
            return
          }
        }

        // IA trap auto-activa (sem prompt)
        if (card) {
          const aiTrap = s.aiSpellZones.find(t => t?.type === 'TRAP' && t.faceDown && (t.placedOnTurn || 0) < s.turnNumber)
          if (aiTrap && card.atk > 1500) {
            s.activateEffect({ ...aiTrap, id: aiTrap.id_num }, 'AI')
            s.setState(st => {
              const zones = [...st.aiSpellZones]
              const idx = zones.findIndex(t => t?.id_num === aiTrap.id_num)
              if (idx >= 0) zones[idx] = null
              return { aiSpellZones: zones }
            })
          }
        }

        doAttack()
      }
    }

    if (card) setHoveredCard(card)
  }, [])

  const handleTributeSelect = (indices) => {
    console.log('[BTN] handleTributeSelect | indices:', indices, '| card:', showTribute?.card?.name)
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

      let mainResult = aiMainPhase(useDueloStore.getState())
      while (mainResult) {
        store.setState({ ...mainResult, gamePhase: 'MAIN' })
        await delay(1000)
        mainResult = aiMainPhase(useDueloStore.getState())
      }

      const battleResult = aiBattlePhase(useDueloStore.getState())
      const finishAiTurn = async () => {
        store.endPhase()
        await delay(500)
        store.drawPhase()
        setIaPending(false)
      }

      if (battleResult) {
        const s = useDueloStore.getState()
        // Prompt player trap during AI attack
        const playerTrap = s.playerSpellZones.find(t => t?.type === 'TRAP' && t.faceDown && (t.placedOnTurn || 0) < s.turnNumber)
        if (playerTrap) {
          setIaPending(false)
          setPendingTrap({
            trap: playerTrap,
            onActivate: () => {
              const cur = useDueloStore.getState()
              cur.activateEffect({ ...playerTrap, id: playerTrap.id_num }, 'PLAYER')
              cur.setState(st => {
                const zones = [...st.playerSpellZones]
                const idx = zones.findIndex(t => t?.id_num === playerTrap.id_num)
                if (idx >= 0) zones[idx] = null
                return { playerSpellZones: zones }
              })
              setPendingTrap(null)
              store.declareAttack(battleResult.attackerIdx, battleResult.targetIdx)
              finishAiTurn()
            },
            onSkip: () => {
              setPendingTrap(null)
              store.declareAttack(battleResult.attackerIdx, battleResult.targetIdx)
              finishAiTurn()
            },
          })
          return
        }
        // AI trap auto-activate
        const aiTrap = s.aiSpellZones.find(t => t?.type === 'TRAP' && t.faceDown && (t.placedOnTurn || 0) < s.turnNumber)
        if (aiTrap) {
          store.activateEffect({ ...aiTrap, id: aiTrap.id_num }, 'AI')
          store.setState(st => {
            const zones = [...st.aiSpellZones]
            const idx = zones.findIndex(t => t?.id_num === aiTrap.id_num)
            if (idx >= 0) zones[idx] = null
            return { aiSpellZones: zones }
          })
        }
        store.declareAttack(battleResult.attackerIdx, battleResult.targetIdx)
        await delay(1200)
      }
      finishAiTurn()
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
  if (fase === 'victory') return <DueloVitoria onRevanche={() => { console.log('[BTN] Revanche'); startGame() }} onMenu={() => { console.log('[BTN] Menu (vitória)'); setFase('menu') }} />
  if (fase === 'defeat') return <DueloDerrota onRevanche={() => { console.log('[BTN] Revanche'); startGame() }} onMenu={() => { console.log('[BTN] Menu (derrota)'); setFase('menu') }} />

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
            <button className="duelo-phase-btn" onClick={() => { console.log('[BTN] DRAW | gamePhase:', store.gamePhase, '| currentTurn:', store.currentTurn); store.drawPhase(); }} disabled={store.gamePhase !== 'DRAW'}>DRAW</button>
            <button className={`duelo-phase-btn ${store.gamePhase === 'MAIN' ? 'duelo-phase-btn--active' : ''}`}
              onClick={() => { console.log('[BTN] MAIN | gamePhase:', store.gamePhase); store.setState({ gamePhase: 'MAIN' }) }} disabled={store.gamePhase === 'DRAW'}>MAIN</button>
            <button className={`duelo-phase-btn ${store.gamePhase === 'BATTLE' ? 'duelo-phase-btn--active' : ''}`}
              onClick={() => { console.log('[BTN] BATTLE | gamePhase:', store.gamePhase); store.endMainPhase() }} disabled={store.gamePhase !== 'MAIN'}>BATTLE</button>
            <button className="duelo-phase-btn" onClick={() => { console.log('[BTN] END | gamePhase:', store.gamePhase); store.endPhase(); setTimeout(() => store.drawPhase(), 600) }} disabled={store.gamePhase !== 'BATTLE'}>END</button>
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
          onSelect={handleTributeSelect} onCancel={() => { console.log('[BTN] Cancelar tribute'); setShowTribute(null) }} />
      )}

      {previewCard && <CardPreviewModal card={previewCard} onClose={() => { console.log('[BTN] Fechar preview | card:', previewCard?.name); setPreviewCard(null) }} />}

      {pendingTrap && (
        <TrapActivator trap={pendingTrap.trap} onActivate={pendingTrap.onActivate} onSkip={pendingTrap.onSkip} />
      )}
    </div>
  )
}