import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDueloStore } from './store/useDueloStore'
import { useReader } from '../../context/ReaderContext'
import { useLanguage } from '../../context/LanguageContext'
import DueloMenu from './screens/DueloMenu'
import DueloVitoria from './screens/DueloVitoria'
import DueloDerrota from './screens/DueloDerrota'
import Board from './components/Board'
import Hand from './components/Hand'
import StatusBar from './components/StatusBar'
import BattleLog from './components/BattleLog'
import CardPreviewModal from './components/CardPreviewModal'
import { aiTurn, aiPreparationPhase } from './engine/ai'
import { GRID_ROWS, GRID_COLS } from './engine/gameState'
import './Duelo.css'

const delay = ms => new Promise(r => setTimeout(r, ms))

export default function DueloRoute() {
  const store = useDueloStore()
  window.__dueloStore = useDueloStore
  const { user, perfil, carregando } = useAuth()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { setReaderMode } = useReader()
  const [fase, setFase] = useState('menu')
  const [previewCard, setPreviewCard] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [iaPending, setIaPending] = useState(false)
  const [selectedHandCard, setSelectedHandCard] = useState(null)
  const [summonTarget, setSummonTarget] = useState(null)
  const aiRunning = useRef(false)

  // ── Route protection: only admins ──
  useEffect(() => {
    if (!carregando && (!user || perfil?.is_admin !== true)) {
      navigate('/games')
    }
  }, [user, perfil, carregando, navigate])

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  const startGame = () => {
    store.resetGame()
    setFase('game')
    // Inicia preparação automaticamente
    setTimeout(() => {
      store.startPreparation()
    }, 100)
  }

  const handleCardHover = useCallback((card) => setHoveredCard(card), [])

  // ── Clique em carta da mão ──
  const handleCardClick = useCallback((card) => {
    const s = useDueloStore.getState()
    if (!card || s.currentTurn !== 'PLAYER' || s.gamePhase === 'OVER') return

    if (s.preparationPhase) {
      // Na preparação, monstros já foram posicionados automaticamente
      // Clicar em armadilha na mão → modo de posicionamento
      if (card.type === 'TRAP') {
        setSelectedHandCard(card)
        setSummonTarget('prep-trap')
      }
      return
    }

    // Fora da preparação
    if (card.type === 'MONSTER' && s.gamePhase === 'INVOCAR' && !s.hasSummonedThisTurn) {
      // Seleciona monstro para invocar — precisa de target no grid
      setSelectedHandCard(card)
      setSummonTarget('grid')
    } else if (card.type === 'SPELL' && s.gamePhase === 'MAGIA' && !s.hasPlayedMagicThisTurn) {
      // Seleciona magia
      setSelectedHandCard(card)
      setSummonTarget('spell')
    } else if (card.type === 'TRAP' && s.gamePhase === 'INVOCAR') {
      // Coloca armadilha no grid
      setSelectedHandCard(card)
      setSummonTarget('grid-trap')
    } else {
      setSelectedHandCard(card)
    }
  }, [])

  // ── Clique no grid (vem do Board) ──
  const handleGridClick = useCallback((row, col) => {
    const s = useDueloStore.getState()

    // Preparação — colocar armadilha
    if (s.preparationPhase && selectedHandCard?.type === 'TRAP') {
      if (row < 3 || row > 4) return // só nas próprias fileiras
      store.placeTrapPrep(row, col)
      setSelectedHandCard(null)
      return
    }

    // Invocar monstro no grid
    if (summonTarget === 'grid' && selectedHandCard?.type === 'MONSTER') {
      if (row < 3 || row > 4) return // só nas próprias fileiras
      store.summonMonster(selectedHandCard.id_num, row, col)
      setSelectedHandCard(null)
      setSummonTarget(null)
      return
    }

    // Colocar armadilha (fora da preparação)
    if (summonTarget === 'grid-trap' && selectedHandCard?.type === 'TRAP') {
      if (row < 3 || row > 4) return
      const grid = s.grid.map(r => r.map(c => ({ ...c })))
      if (grid[row][col].trap || grid[row][col].monster) return
      grid[row][col] = { ...grid[row][col], trap: { ...selectedHandCard, revealed: false } }
      const newHand = s.playerHand.filter(c => c.id_num !== selectedHandCard.id_num)
      store.setState({
        grid,
        playerHand: newHand,
        battleLog: [...s.battleLog, `Armadilha ${selectedHandCard.name} colocada em [${row},${col}].`],
      })
      setSelectedHandCard(null)
      setSummonTarget(null)
      return
    }

    // Usar magia
    if (summonTarget === 'spell' && selectedHandCard?.type === 'SPELL') {
      const target = s.grid[row]?.[col]?.monster || null
      store.useSpell(selectedHandCard.id_num, row, col)
      setSelectedHandCard(null)
      setSummonTarget(null)
      return
    }
  }, [selectedHandCard, summonTarget, store])

  // ── Finalizar preparação ──
  const handleFinishPrep = () => {
    store.finishPreparation()
    setSelectedHandCard(null)
    setSummonTarget(null)
  }

  // ── Ações de fase ──
  const handleDraw = () => { store.drawCard() }
  const handleNextPhase = () => { store.nextPhase() }
  const handleEndTurn = () => { store.endTurn() }

  // ── IA Turn ──
  useEffect(() => {
    if (store.currentTurn !== 'AI' || store.gamePhase === 'OVER' || fase !== 'game' || iaPending) return
    if (store.preparationPhase) return

    const runAI = async () => {
      if (aiRunning.current) return
      aiRunning.current = true
      setIaPending(true)
      await delay(600)

      // IA compra
      store.drawCard()
      await delay(500)

      // IA executa turno completo
      const currentState = useDueloStore.getState()
      const aiResult = aiTurn(currentState)
      store.setAiState(aiResult)
      await delay(800)

      // IA encerra turno
      store.endTurn()
      await delay(400)

      aiRunning.current = false
      setIaPending(false)
    }

    runAI()
  }, [store.currentTurn, store.gamePhase, fase, store.preparationPhase])

  // ── Game Over ──
  useEffect(() => {
    if (store.gamePhase === 'OVER' && fase === 'game') {
      setTimeout(() => setFase(store.winner === 'PLAYER' ? 'victory' : 'defeat'), 1200)
    }
  }, [store.gamePhase, fase, store.winner])

  // ── Render ──
  if (fase === 'menu') return <><DueloMenu onStart={startGame} /></>
  if (fase === 'victory') return <DueloVitoria onRevanche={() => startGame()} onMenu={() => setFase('menu')} />
  if (fase === 'defeat') return <DueloDerrota onRevanche={() => startGame()} onMenu={() => setFase('menu')} />

  const showMonsterTargeting = summonTarget === 'grid' && selectedHandCard
  const showSpellTargeting = summonTarget === 'spell' && selectedHandCard
  const showTrapTargeting = summonTarget === 'grid-trap' && selectedHandCard
  const showPrepTargeting = summonTarget === 'prep-trap' && selectedHandCard

  return (
    <div className="duelo-page">
      {/* Fase de Preparação */}
      {store.preparationPhase && (
        <div className="duelo-preparation-banner">
          <h3>⚔ PREPARE SEU CAMPO</h3>
          <p>Posicione suas armadilhas nas fileiras 3-4.</p>
          <p>Clique nas armadilhas da mão e depois no grid para posicionar.</p>
          <p className="duelo-prep-hint">Monstros iniciais já foram posicionados automaticamente.</p>
          <button className="duelo-phase-btn duelo-prep-btn" onClick={handleFinishPrep}>
            ✅ PRONTO — COMEÇAR BATALHA
          </button>
        </div>
      )}

      {/* Targeting hint */}
      {(showMonsterTargeting || showSpellTargeting || showTrapTargeting || showPrepTargeting) && (
        <div className="duelo-targeting-hint">
          {showMonsterTargeting && `👆 Clique em uma casa vazia nas fileiras 3-4 para invocar ${selectedHandCard.name}`}
          {showSpellTargeting && `👆 Clique em um monstro alvo para usar ${selectedHandCard.name}`}
          {(showTrapTargeting || showPrepTargeting) && `👆 Clique em uma casa vazia nas fileiras 3-4 para colocar ${selectedHandCard.name}`}
        </div>
      )}

      {/* Grid wrapper - passa clique para o handler */}
      <div onClick={(e) => {
        // O Board tem seu próprio onClick nas células, mas precisamos do handler global
      }}>
        <Board onGridClick={handleGridClick} selectedHandCard={selectedHandCard} />
      </div>

      {store.playerHand.length > 0 && (
        <Hand cards={store.playerHand} onCardClick={handleCardClick} onCardHover={handleCardHover}
          selectedCardId={selectedHandCard?.id_num} disabled={store.currentTurn !== 'PLAYER' || store.preparationPhase} />
      )}

      <StatusBar card={hoveredCard || selectedHandCard} />
      <BattleLog log={store.battleLog} />

      {/* Controles de fase */}
      <div className="duelo-controls">
        <span className="duelo-turn-indicator">
          {t('games.duelo.turno_label')} <span>{store.turnNumber}</span> · {store.currentTurn === 'PLAYER' ? t('games.duelo.turno_voce') : iaPending ? t('games.duelo.turno_ia_pensando') : t('games.duelo.turno_ia')}
        </span>
        <span className="duelo-phase-indicator">Fase: {store.gamePhase}</span>

        {store.currentTurn === 'PLAYER' && store.gamePhase !== 'OVER' && !store.preparationPhase && (
          <>
            <button className="duelo-phase-btn"
              onClick={handleDraw}
              disabled={store.gamePhase !== 'COMPRA'}>
              {t('games.duelo.btn_draw')}
            </button>
            <button className={`duelo-phase-btn ${store.gamePhase === 'INVOCAR' ? 'duelo-phase-btn--active' : ''}`}
              onClick={() => store.setGamePhase('INVOCAR')}
              disabled={store.gamePhase === 'COMPRA' || store.gamePhase === 'FIM'}>
              INVOCAR
            </button>
            <button className={`duelo-phase-btn ${store.gamePhase === 'ACAO' ? 'duelo-phase-btn--active' : ''}`}
              onClick={() => store.setGamePhase('ACAO')}
              disabled={store.gamePhase === 'COMPRA' || store.gamePhase === 'FIM'}>
              AÇÃO
            </button>
            <button className={`duelo-phase-btn ${store.gamePhase === 'MAGIA' ? 'duelo-phase-btn--active' : ''}`}
              onClick={() => store.setGamePhase('MAGIA')}
              disabled={store.gamePhase === 'COMPRA' || store.gamePhase === 'FIM'}>
              MAGIA
            </button>
            <button className="duelo-phase-btn"
              onClick={handleEndTurn}
              disabled={store.gamePhase === 'COMPRA'}>
              {t('games.duelo.btn_end')}
            </button>
          </>
        )}

        {store.gamePhase === 'OVER' && (
          <span className="duelo-phase-over">
            {store.winner === 'PLAYER' ? `🏆 ${t('games.duelo.vitoria')}!` : `💀 ${t('games.duelo.derrota')}`}
          </span>
        )}
      </div>

      {previewCard && (
        <CardPreviewModal card={previewCard} onClose={() => setPreviewCard(null)} />
      )}
    </div>
  )
}