import { useState, useCallback, useEffect, useRef } from 'react'
import { useKernelPanicEngine, terrainInfoLine } from './hooks/useKernelPanicEngine'
import { useAITurnPresenter } from './hooks/useAITurnPresenter'
import { useKpI18n } from './hooks/useKpI18n'
import { useReader } from '../../../../context/ReaderContext'
import KPMenu from './components/KPMenu'
import KPInfoBar from './components/KPInfoBar'
import KPTerrainBar from './components/KPTerrainBar'
import KPPerigoMeter from './components/KPPerigoMeter'
import KPPlayerPanel from './components/KPPlayerPanel'
import KPShotModal from './components/KPShotModal'
import KPDefenseModal from './components/KPDefenseModal'
import KPReactionPopup from './components/KPReactionPopup'
import KPResultOverlay from './components/KPResultOverlay'
import KPVictoryScreen from './components/KPVictoryScreen'
import KPMessagePopup from './components/KPMessagePopup'
import KPHandoffScreen from './components/KPHandoffScreen'
import KPIntelModal from './components/KPIntelModal'
import KPInspectModal from './components/KPInspectModal'
import KPAIWaitOverlay from './components/KPAIWaitOverlay'
import './KernelPanic.css'

export default function KernelPanic() {
  const { setReaderMode } = useReader()
  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const { state, actions } = useKernelPanicEngine()
  const { t } = useKpI18n()
  const { initGame, drawCard, playToField, activateEquip, advanceTurn, confirmShot, resolveShot, activateReaction } = actions
  const { isPresenting, currentStep, actionQueue, cancel: cancelPresentation } = useAITurnPresenter(state)

  const [screen, setScreen] = useState('menu')
  const [shotModal, setShotModal] = useState(false)
  const [defenseModal, setDefenseModal] = useState(false)
  const [reactionPopup, setReactionPopup] = useState(null)
  const [resultOverlay, setResultOverlay] = useState(null)
  const [messagePopup, setMessagePopup] = useState(null)
  const [handoff, setHandoff] = useState(null)
  const [intelResult, setIntelResult] = useState(null)
  const [inspectCard, setInspectCard] = useState(null)
  const [atkSelection, setAtkSelection] = useState([])
  const prevGameOverRef = useRef(false)
  const prevShotResultRef = useRef(null)
  const lastHandoffPlayerRef = useRef(-1)

  useEffect(() => {
    if (state.gameOver) prevGameOverRef.current = true
    else prevGameOverRef.current = false
  }, [state.gameOver])

  useEffect(() => {
    if (state._intelResult) setIntelResult(state._intelResult)
  }, [state._intelResult])

  useEffect(() => {
    if (!state._shotResult) return
    if (prevShotResultRef.current === state._shotResult) return
    prevShotResultRef.current = state._shotResult
    if (!isPresenting) setResultOverlay(state._shotResult)
  }, [state._shotResult, isPresenting])

  useEffect(() => {
    if (state.gameOver || resultOverlay || isPresenting) return
    const isAIMode = state.mode === 'solo-easy' || state.mode === 'solo-medium'
    if (isAIMode || state.currentPlayer < 0) return
    if (state.currentPlayer === lastHandoffPlayerRef.current) return
    lastHandoffPlayerRef.current = state.currentPlayer
    const t = setTimeout(() => setHandoff(state.currentPlayer), 300)
    return () => clearTimeout(t)
  }, [state.currentPlayer, state.round, state.gameOver, resultOverlay, isPresenting, state.mode])

  const startGame = useCallback((mode) => {
    setScreen('game')
    initGame(mode)
    setResultOverlay(null)
    setIntelResult(null)
    setMessagePopup(null)
    setHandoff(null)
    setAtkSelection([])
    prevShotResultRef.current = null
    cancelPresentation()
  }, [initGame, cancelPresentation])

  const openShotModal = useCallback(() => {
    setShotModal(true)
    setAtkSelection([])
  }, [])

  const handleConfirmShot = useCallback((selection) => {
    confirmShot(state.currentPlayer, selection)
    setAtkSelection(selection)
    setShotModal(false)
    setDefenseModal(true)
  }, [confirmShot, state.currentPlayer])

  const handleConfirmDefense = useCallback((defSel) => {
    resolveShot(defSel)
    setDefenseModal(false)
  }, [resolveShot])

  const closeResult = useCallback(() => {
    const result = resultOverlay
    setResultOverlay(null)
    if (result?.missReaction) {
      const field = state.players[state.currentPlayer].field
      const reactionSlot = field.findIndex(c => c && c.trigger === 'on_own_miss')
      if (reactionSlot !== -1) {
        setReactionPopup({ card: field[reactionSlot], slotIdx: reactionSlot })
        return
      }
    }
    if (!state.gameOver) advanceTurn()
  }, [resultOverlay, state.players, state.currentPlayer, state.gameOver, advanceTurn])

  const handleReaction = useCallback((useIt) => {
    setReactionPopup(null)
    if (useIt && reactionPopup) {
      activateReaction(state.currentPlayer, reactionPopup.card, reactionPopup.slotIdx)
    }
    if (!state.gameOver) advanceTurn()
  }, [state.currentPlayer, reactionPopup, activateReaction, state.gameOver, advanceTurn])

  const handleInspect = useCallback((card) => setInspectCard(card), [])
  const closeInspect = useCallback(() => setInspectCard(null), [])

  if (screen === 'menu') {
    return (
      <div className="kp-wrapper">
        <div className="reticle-bg" />
        <KPMenu onStart={startGame} />
      </div>
    )
  }

  const p0 = state.players[0]
  const p1 = state.players[1]
  const isAIMode = state.mode === 'solo-easy' || state.mode === 'solo-medium'
  const isHumanTurn = !(isAIMode && state.currentPlayer === 1)
  const canAct = isHumanTurn && !state.gameOver && !isPresenting

  return (
    <div className="kp-wrapper">
      <div className="reticle-bg" />

      <header>
        <div className="logo">KERNEL<span> PANIC</span></div>
        <div className="header-meta">
          <div>{t('kp.global.ciclo')} {state.round}</div>
          <div>{state.mode === 'solo-easy' ? t('kp.global.solo_facil') : state.mode === 'solo-medium' ? t('kp.global.solo_medio') : t('kp.global.versus')}</div>
          <button className="btn-header-menu" onClick={() => setScreen('menu')}>{t('kp.menu.voltar')}</button>
        </div>
      </header>

      <KPPerigoMeter players={state.players} />

      <KPInfoBar
        round={state.round}
        currentPlayer={state.currentPlayer}
        deckCount={state.deck.length}
        cemeteryCount={state.cemetery.length}
        terrainName={state.terrain?.name || null}
      />

      {state.terrain && (
        <KPTerrainBar
          terrain={state.terrain}
          roundsLeft={state.terrain_rounds_left}
          terrainInfo={terrainInfoLine(state.terrain, state.terrain_mods, state.terrain_contra_sol, state.currentPlayer)}
        />
      )}

      <div className="main-grid">
        <KPPlayerPanel
          player={p0}
          playerIdx={0}
          isCurrent={state.currentPlayer === 0}
          isOpponent={state.currentPlayer === 1}
          round={state.round}
          canAct={canAct && state.currentPlayer === 0}
          onInspect={handleInspect}
          onPlayToField={(handIdx) => playToField(0, handIdx)}
          onActivateEquip={(slotIdx) => activateEquip(0, slotIdx)}
          onDrawCard={() => drawCard(0)}
          onOpenShot={openShotModal}
          onPass={() => advanceTurn()}
          showActions={state.currentPlayer === 0 && isHumanTurn}
          cardsPlayedThisTurn={state.cardsPlayedThisTurn}
          drawnThisTurn={state.drawnThisTurn}
        />

        <KPPlayerPanel
          player={p1}
          playerIdx={1}
          isCurrent={state.currentPlayer === 1}
          isOpponent={state.currentPlayer === 0}
          round={state.round}
          canAct={canAct && state.currentPlayer === 1}
          onInspect={handleInspect}
          onPlayToField={(handIdx) => playToField(1, handIdx)}
          onActivateEquip={(slotIdx) => activateEquip(1, slotIdx)}
          onDrawCard={() => drawCard(1)}
          onOpenShot={openShotModal}
          onPass={() => advanceTurn()}
          showActions={state.currentPlayer === 1 && isHumanTurn}
          cardsPlayedThisTurn={state.cardsPlayedThisTurn}
          drawnThisTurn={state.drawnThisTurn}
        />
      </div>

      <KPShotModal
        open={shotModal}
        playerField={state.players[state.currentPlayer].field}
        playerIdx={state.currentPlayer}
        onConfirm={handleConfirmShot}
        onCancel={() => setShotModal(false)}
      />

      <KPDefenseModal
        open={defenseModal}
        playerField={state.players[1 - state.currentPlayer].field}
        atkSelection={atkSelection}
        playerIdx={1 - state.currentPlayer}
        onConfirm={handleConfirmDefense}
        onCancel={() => setDefenseModal(false)}
      />

      {reactionPopup && (
        <KPReactionPopup
          open={true}
          card={reactionPopup.card}
          onReact={() => handleReaction(true)}
          onDecline={() => handleReaction(false)}
        />
      )}

      {resultOverlay && (
        <KPResultOverlay
          result={resultOverlay}
          onContinue={closeResult}
        />
      )}

      {state.gameOver && (
        <KPVictoryScreen
          winner={state.winner}
          onRestart={() => startGame(state.mode)}
          onMenu={() => setScreen('menu')}
        />
      )}

      {messagePopup && (
        <KPMessagePopup
          message={messagePopup}
          onClose={() => setMessagePopup(null)}
        />
      )}

      {handoff !== null && !isPresenting && (
        <KPHandoffScreen
          playerIdx={handoff}
          onContinue={() => setHandoff(null)}
        />
      )}

      {intelResult && (
        <KPIntelModal
          cards={intelResult}
          onClose={() => setIntelResult(null)}
        />
      )}

      {inspectCard && (
        <KPInspectModal
          card={inspectCard}
          onClose={closeInspect}
        />
      )}

      {isPresenting && (
        <KPAIWaitOverlay
          currentStep={currentStep}
          totalSteps={actionQueue.length}
          actions={actionQueue}
        />
      )}
    </div>
  )
}
