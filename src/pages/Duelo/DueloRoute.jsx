import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
import { aiDescerFase, aiMovimentoFase, aiAtaqueFase } from './engine/ai'
import { GRID_ROWS, GRID_COLS } from './engine/gameState'
import { checkVictoryCondition } from './engine/phases'
import './Duelo.css'

const delay = ms => new Promise(r => setTimeout(r, ms))

// Animação de moeda girando — puramente visual, timeline gerenciada pelo store
function CoinTossAnimation() {
  const { t } = useLanguage()
  const coinResult = useDueloStore(s => s.coinResult)
  const gamePhase = useDueloStore(s => s.gamePhase)
  const isDone = gamePhase !== 'COIN_TOSS'

  return (
    <div className="duelo-coin-toss">
      <motion.div
        className="duelo-coin"
        animate={!isDone ? {
          rotateY: [0, 360, 720, 1080, 1440],
          scale: [1, 1.2, 1, 1.2, 1],
        } : { rotateY: 0 }}
        transition={!isDone ? { duration: 2, ease: 'easeInOut' } : { duration: 0.3 }}
      >
        <span className="duelo-coin-face">
          {isDone ? (coinResult === 'PLAYER' ? '👤' : '🤖') : '🪙'}
        </span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="duelo-coin-text"
      >
        {isDone
          ? (coinResult === 'PLAYER' ? t('games.duelo.voce_comeca') : t('games.duelo.ia_comeca'))
          : t('games.duelo.sorteando_moeda')}
      </motion.p>
    </div>
  )
}

// Animação de saque de 5 cartas — puramente visual
function DrawAnimation() {
  const [revealed, setRevealed] = useState(0)
  const { t } = useLanguage()
  const handCards = useDueloStore(s => s.playerHand)
  const gamePhase = useDueloStore(s => s.gamePhase)
  const isDone = gamePhase !== 'DRAW_ANIMATION'

  useEffect(() => {
    if (!isDone && revealed < 5) {
      const timer = setTimeout(() => setRevealed(r => r + 1), 400)
      return () => clearTimeout(timer)
    }
  }, [revealed, isDone])

  return (
    <div className="duelo-draw-animation">
      <p className="duelo-draw-title">{t('games.duelo.compra_cartas')}</p>
      <div className="duelo-draw-cards">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            className="duelo-draw-card"
            initial={{ x: -200, y: -100, rotate: -20, opacity: 0 }}
            animate={revealed > i ? {
              x: (i - 2) * 70,
              y: 0,
              rotate: 0,
              opacity: 1,
            } : {}}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className={`duelo-draw-card-inner ${revealed > i ? 'duelo-draw-card--revealed' : ''}`}>
              {revealed > i && handCards?.[i] ? (
                <span className="duelo-draw-card-name">{handCards[i].name}</span>
              ) : (
                <span className="duelo-draw-card-back">LDI</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed >= 5 ? 1 : 0 }}
        className="duelo-draw-ready"
      >
        {t('games.duelo.mao_pronta')}
      </motion.p>
    </div>
  )
}

// Modal "Descer no tabuleiro?"
function ConfirmPlaceModal({ card, onConfirm, onCancel }) {
  return (
    <motion.div
      className="duelo-confirm-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="duelo-confirm-modal"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
      >
        <p className="duelo-confirm-title">🃏 {card.name}</p>
        <p className="duelo-confirm-desc">
          ⚔ {card.atk}/{card.def} · 👟{card.mov} 🎯{card.rng}
        </p>
        {card.desc && <p className="duelo-confirm-flavor">"{card.desc}"</p>}
        <p className="duelo-confirm-question">Descer no tabuleiro?</p>
        <div className="duelo-confirm-btns">
          <button className="duelo-phase-btn duelo-phase-btn--active" onClick={onConfirm}>
            ✅ DESCER
          </button>
          <button className="duelo-phase-btn" onClick={onCancel}>
            ❌ CANCELAR
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Modal de confirmação para Armadilha/Magia
function ConfirmTrapSpellModal({ pending, onConfirm, onCancel }) {
  if (!pending) return null
  const { row, col, type, card } = pending
  const isTrap = type === 'trap'
  return (
    <motion.div
      className="duelo-confirm-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="duelo-confirm-modal duelo-confirm-modal--trap"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
      >
        <p className="duelo-confirm-title">
          {isTrap ? '🕳️' : '✨'} {card.name}
        </p>
        <p className="duelo-confirm-desc">
          {isTrap
            ? `📍 Célula [${row},${col}] · Área: ${card.area} · Gatilho: ${card.gatilho}`
            : `📍 Alvo: [${row},${col}] · Efeito: ${card.effect}${card.duracao > 0 ? ` (${card.duracao}t)` : ''}`
          }
        </p>
        {card.desc && <p className="duelo-confirm-flavor">"{card.desc}"</p>}
        <p className="duelo-confirm-question">
          {isTrap
            ? `Armar ${card.name} em [${row},${col}]?`
            : `Usar ${card.name} em [${row},${col}]?`
          }
        </p>
        <p className="duelo-confirm-area-hint">
          {isTrap
            ? `⚠️ A área de ${card.area} casa(s) ao redor será afetada (destaque roxo)`
            : card.duracao > 0
              ? `⏳ Efeito persistente por ${card.duracao} turno(s) no campo`
              : '⚡ Efeito instantâneo — use com sabedoria'
          }
        </p>
        <div className="duelo-confirm-btns">
          <button className="duelo-phase-btn duelo-phase-btn--active" onClick={onConfirm}>
            ✅ {isTrap ? 'ARMAR' : 'USAR'}
          </button>
          <button className="duelo-phase-btn" onClick={onCancel}>
            🔄 ESCOLHER OUTRA CÉLULA
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Modal 1: Aviso de que a carta precisa de sacrifícios
function SacrificeWarningModal({ card, onSelect, onCancel }) {
  if (!card) return null
  const grid = useDueloStore.getState().grid
  const meusMonstros = (() => {
    let count = 0
    for (let r = 0; r < GRID_ROWS; r++)
      for (let c = 0; c < GRID_COLS; c++)
        if (grid[r]?.[c]?.monster?.owner === 'PLAYER') count++
    return count
  })()
  const sac = card.estrelas >= 6 ? 3 : card.estrelas === 5 ? 2 : card.estrelas === 4 ? 1 : 0
  const insuficiente = meusMonstros < sac
  return (
    <motion.div className="duelo-confirm-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div className="duelo-confirm-modal duelo-confirm-modal--sacrifice"
        initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
      >
        <p className="duelo-confirm-title">🔥 {card.name}</p>
        <p className="duelo-confirm-desc">
          ⚔ {card.atk}/{card.def} · 👟{card.mov} 🎯{card.rng} · {'★'.repeat(card.estrelas || 1)}
        </p>
        {card.desc && <p className="duelo-confirm-flavor">"{card.desc}"</p>}
        <p className="duelo-confirm-question">
          Esta carta precisa de <strong>{sac} sacrifício(s)</strong> para ser invocada!
        </p>
        {insuficiente ? (
          <p className="duelo-confirm-area-hint" style={{ color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }}>
            ❌ Você tem apenas <strong>{meusMonstros} monstro(s)</strong> no campo,
            mas precisa de <strong>{sac} sacrifício(s)</strong>.
            Coloque mais monstros no campo primeiro!
          </p>
        ) : (
          <p className="duelo-confirm-area-hint">
            Você tem <strong>{meusMonstros} monstro(s)</strong> no campo.
            Clique em "SELECIONAR" e depois escolha {sac} monstro(s) aliado(s) para sacrificar.
          </p>
        )}
        <div className="duelo-confirm-btns">
          {!insuficiente && (
            <button className="duelo-phase-btn duelo-phase-btn--active" onClick={onSelect}>
              ✅ SELECIONAR SACRIFÍCIO(S)
            </button>
          )}
          <button className="duelo-phase-btn" onClick={onCancel}>
            {insuficiente ? '❌ VOLTAR' : '❌ CANCELAR'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Modal 2: Confirmação final do sacrifício
function ConfirmSacrificeModal({ targets, card, onConfirm, onCancel }) {
  if (!card || !targets?.length) return null
  return (
    <motion.div className="duelo-confirm-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div className="duelo-confirm-modal duelo-confirm-modal--sacrifice"
        initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}
      >
        <p className="duelo-confirm-title">⚠️ CONFIRMAR SACRIFÍCIO</p>
        <p className="duelo-confirm-desc">
          Invocar <strong>{card.name}</strong> ({card.estrelas}★)
        </p>
        <div className="duelo-sacrifice-list">
          <p className="duelo-sacrifice-list-title">Monstros a serem sacrificados:</p>
          {targets.map((t, i) => (
            <p key={i} className="duelo-sacrifice-item">
              🔥 {t.card.name} — [ATK {t.card.atk}/{t.card.def}] em [{t.row},{t.col}]
            </p>
          ))}
        </div>
        <p className="duelo-confirm-question">Tem certeza que deseja sacrificar esses monstros?</p>
        <p className="duelo-confirm-area-hint">Após confirmado, os monstros serão enviados ao cemitério e {card.name} será invocado no campo.</p>
        <div className="duelo-confirm-btns">
          <button className="duelo-phase-btn duelo-phase-btn--active" onClick={onConfirm}>
            ✅ SIM, SACRIFICAR
          </button>
          <button className="duelo-phase-btn" onClick={onCancel}>
            🔄 NÃO, VOLTAR
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Modal VER CARTAS
function VerCartasModal({ onClose }) {
  const hand = useDueloStore(s => s.playerHand)
  const grid = useDueloStore(s => s.grid)
  const fieldEffects = useDueloStore(s => s.fieldEffects) || []
  const [aba, setAba] = useState('mao')
  const [selCard, setSelCard] = useState(null)
  const { t } = useLanguage()

  const allFieldMonsters = []
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++)
      if (grid[r]?.[c]?.monster) allFieldMonsters.push({ ...grid[r][c].monster, row: r, col: c })

  return (
    <motion.div className="duelo-confirm-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div className="duelo-vercartas-modal"
        initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="duelo-vercartas-tabs">
          <button className={`duelo-vercartas-tab ${aba === 'mao' ? 'active' : ''}`}
            onClick={() => setAba('mao')}>🃏 MINHA MÃO ({hand.length})</button>
          <button className={`duelo-vercartas-tab ${aba === 'campo' ? 'active' : ''}`}
            onClick={() => setAba('campo')}>🎯 CAMPO ({allFieldMonsters.length})</button>
          <button className="duelo-vercartas-close" onClick={onClose}>✕</button>
        </div>
        <div className="duelo-vercartas-content">
          {aba === 'mao' && hand.map(card => (
            <div key={card.id_num} className="duelo-vercartas-card"
              onClick={() => setSelCard(card === selCard ? null : card)}
              style={{ borderColor: card.type === 'MONSTER' ? '#F5A623' : card.type === 'SPELL' ? '#22C55E' : '#EF4444' }}
            >
              <span className="duelo-vercartas-card-name">{card.name}</span>
              {card.type === 'MONSTER' && (
                <span className="duelo-vercartas-card-stats">
                  ⚔{card.atk} 🛡{card.def} 👟{card.mov} 🎯{card.rng}
                  {'★'.repeat(card.estrelas || 1)}
                </span>
              )}
              {card.type === 'SPELL' && <span className="duelo-vercartas-card-effect">{card.desc}</span>}
              {card.type === 'TRAP' && <span className="duelo-vercartas-card-effect">Área {card.area} — {card.desc}</span>}
            </div>
          ))}
          {aba === 'campo' && allFieldMonsters.map((m, i) => (
            <div key={i} className="duelo-vercartas-card duelo-vercartas-card--field"
              onClick={() => setSelCard(m === selCard ? null : m)}
              style={{ borderColor: m.owner === 'PLAYER' ? '#00B4D8' : '#EF4444' }}
            >
              <span className="duelo-vercartas-card-name">{m.owner === 'PLAYER' ? '👤' : '🤖'} {m.name}</span>
              <span className="duelo-vercartas-card-stats">
                ⚔{m.atk} 🛡{m.def} 👟{m.mov} 🎯{m.rng} [{m.row},{m.col}]
              </span>
              {fieldEffects.filter(fe => fe.targetId === m.id_num).map((fe, fi) => (
                <span key={fi} className="duelo-vercartas-effect">✨ {fe.cardName} ({fe.remainingTurns}t)</span>
              ))}
            </div>
          ))}
        </div>
        {selCard && (
          <div className="duelo-vercartas-preview">
            <p className="duelo-vercartas-preview-name">{selCard.name}</p>
            <p className="duelo-vercartas-preview-desc">{selCard.desc}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

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
  const [iaPhase, setIaPhase] = useState(null) // 'DESCER' | 'MOVIMENTO' | 'ATAQUE' | null
  const [verCartas, setVerCartas] = useState(false)
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

  const startTimers = useRef(null)

  const startGame = () => {
    store.resetGame()
    setFase('game')
    // Gerencia a timeline de animações diretamente no escopo do clique
    const t1 = setTimeout(() => {
      store.doCoinToss()
    }, 100)
    const t2 = setTimeout(() => {
      store.coinTossComplete()
    }, 2600)
    const t3 = setTimeout(() => {
      store.drawAnimationComplete()
    }, 5600)
    startTimers.current = [t1, t2, t3]
  }

  const handleCardHover = useCallback((card) => setHoveredCard(card), [])

  // ── Clique em carta da mão ──
  const handleCardClick = useCallback((card) => {
    const s = useDueloStore.getState()
    if (!card || s.currentTurn !== 'PLAYER' || s.gamePhase !== 'PLAYING' || s.turnPhase !== 'DESCER') return
    store.selectHandCard(card)
  }, [store])

  // ── Clique no grid ──
  const handleGridClick = useCallback((row, col) => {
    const s = useDueloStore.getState()
    if (s.gamePhase !== 'PLAYING' || s.currentTurn !== 'PLAYER') return

    // Fase DESCER — colocando carta no grid
    if (s.turnPhase === 'DESCER' && s.waitingForGridTarget) {
      store.placeCardOnGrid(row, col)
      return
    }

    // Fase MOVIMENTO — mover monstro
    if (s.turnPhase === 'MOVIMENTO') {
      const cell = s.grid[row][col]
      // Se clicou em casa de MOV
      if (s.selectedMonster && s.moveCells.some(c => c.row === row && c.col === col)) {
        store.moveMonster(row, col)
        return
      }
      // Se clicou em monstro aliado — seleciona
      if (cell?.monster && cell.monster.owner === 'PLAYER') {
        store.selectMonster(row, col)
        return
      }
      store.clearSelection()
      return
    }

    // Fase ATAQUE — atacar
    if (s.turnPhase === 'ATAQUE') {
      const cell = s.grid[row][col]
      // Se clicou em casa de ataque
      if (s.selectedMonster && s.attackCells.some(c => c.row === row && c.col === col) && cell?.monster?.owner !== 'PLAYER') {
        store.attackMonster(row, col)
        return
      }
      // Se clicou em monstro aliado — seleciona
      if (cell?.monster && cell.monster.owner === 'PLAYER') {
        store.selectMonster(row, col)
        return
      }
      store.clearSelection()
      return
    }
  }, [store])

  // ── PRÓXIMA FASE ──
  const handleProximaFase = () => {
    store.nextTurnPhase()
  }

  // ── Finalizar turno do player ──
  const handlePlayerEndTurn = () => {
    store.playerEndTurn()
  }

  // ── IA Turn (executa as 3 fases em sequência) ──
  useEffect(() => {
    if (store.currentTurn !== 'AI' || store.gamePhase !== 'PLAYING' || fase !== 'game' || iaPending) return

    const runAI = async () => {
      if (aiRunning.current) return
      aiRunning.current = true
      setIaPending(true)

      // Fase DESCER da IA
      setIaPhase('DESCER')
      await delay(800)
      const state1 = useDueloStore.getState()
      const r1 = aiDescerFase(state1)
      useDueloStore.getState().setAiState(r1)

      // Verifica se IA venceu
      if (r1.gamePhase === 'OVER') {
        aiRunning.current = false
        setIaPending(false)
        setIaPhase(null)
        return
      }

      // Fase MOVIMENTO da IA (sem movimento na primeira rodada se IA começar)
      if (!(state1.isFirstTurn && state1.coinResult === 'AI')) {
        setIaPhase('MOVIMENTO')
        await delay(600)
        const state2 = useDueloStore.getState()
        const r2 = aiMovimentoFase(state2)
        useDueloStore.getState().setAiState(r2)
      }

      // Fase ATAQUE da IA
      setIaPhase('ATAQUE')
      await delay(800)
      const state3 = useDueloStore.getState()
      const r3 = aiAtaqueFase(state3)
      useDueloStore.getState().setAiState(r3)

      // Verifica se IA venceu no ataque
      if (r3.gamePhase === 'OVER') {
        aiRunning.current = false
        setIaPending(false)
        setIaPhase(null)
        return
      }

      // IA encerra turno
      await delay(500)
      store.endTurn()

      await delay(300)
      aiRunning.current = false
      setIaPending(false)
      setIaPhase(null)
    }

    runAI()
  }, [store.currentTurn, store.gamePhase, fase, iaPending, store])

  // ── Verifica condição de vitória após cada ação ──
  useEffect(() => {
    const s = useDueloStore.getState()
    if (s.gamePhase === 'PLAYING') {
      const vc = checkVictoryCondition(s)
      if (vc) {
        store.setState({
          winner: vc.winner,
          gamePhase: 'OVER',
          battleLog: [...s.battleLog, vc.reason],
        })
      }
    }
  }, [store.grid, store.playerHand, store.aiHand, store.playerDeck, store.aiDeck])

  // ── Game Over ──
  useEffect(() => {
    if (store.gamePhase === 'OVER' && fase === 'game') {
      setTimeout(() => setFase(store.winner === 'PLAYER' ? 'victory' : 'defeat'), 1500)
    }
  }, [store.gamePhase, fase, store.winner])

  // ── Render ──
  if (fase === 'menu') return <DueloMenu onStart={startGame} />

  // Coin Toss
  if (fase === 'coinToss' || store.gamePhase === 'COIN_TOSS') {
    return (
      <div className="duelo-page">
        <CoinTossAnimation />
      </div>
    )
  }

  // Draw Animation
  if (fase === 'drawAnim' || store.gamePhase === 'DRAW_ANIMATION') {
    return (
      <div className="duelo-page">
        <DrawAnimation />
      </div>
    )
  }

  if (fase === 'victory') return <DueloVitoria onRevanche={() => startGame()} onMenu={() => setFase('menu')} />
  if (fase === 'defeat') return <DueloDerrota onRevanche={() => startGame()} onMenu={() => setFase('menu')} />

  const s = store
  const isPlayerTurn = s.currentTurn === 'PLAYER'
  const turnPhase = s.turnPhase

  // Hint text baseado no estado atual
  let hintText = ''
  if (s.gamePhase === 'OVER') {
    hintText = ''
  } else if (s.waitingForGridTarget === 'monster') {
    hintText = `👆 Clique em uma casa vazia no tabuleiro para posicionar ${s.selectedHandCard?.name}`
  } else if (s.waitingForGridTarget === 'trap') {
    hintText = `👆 Clique em uma casa vazia em QUALQUER lugar do tabuleiro para armar ${s.selectedHandCard?.name} (oculta)`
  } else if (s.waitingForGridTarget === 'sacrifice') {
    const sac = s.selectedHandCard?.estrelas >= 6 ? 3 : s.selectedHandCard?.estrelas === 5 ? 2 : s.selectedHandCard?.estrelas === 4 ? 1 : 0
    const selecionados = s.sacrificeTargets?.length || 0
    const restantes = Math.max(0, sac - selecionados)
    hintText = `⚠️ Clique em ${restantes > 0 ? `MAIS ${restantes} MONSTRO(S) ALIADO(S)` : 'MONSTRO(S) ALIADO(S)'} para sacrificar e invocar ${s.selectedHandCard?.name} (${s.selectedHandCard?.estrelas || 1}★, precisa de ${sac} sacrifício(s))`
  } else if (s.waitingForGridTarget === 'spell') {
    hintText = `👆 Clique em um alvo para usar ${s.selectedHandCard?.name}`
  } else if (turnPhase === 'DESCER' && isPlayerTurn) {
    hintText = t('games.duelo.hint_descer')
  } else if (turnPhase === 'MOVIMENTO' && isPlayerTurn) {
    hintText = t('games.duelo.hint_movimento')
  } else if (turnPhase === 'ATAQUE' && isPlayerTurn) {
    hintText = t('games.duelo.hint_ataque')
  } else if (iaPending) {
    hintText = `${t('games.duelo.turno_ia_pensando')} (${iaPhase || '...'})`
  }

  return (
    <div className="duelo-page">
      {/* Hint de targeting */}
      {hintText && (
        <div className="duelo-targeting-hint">
          {hintText}
        </div>
      )}

      {/* Confirm Place Modal */}
      <AnimatePresence>
        {s.confirmPlace && s.selectedHandCard && (
          <ConfirmPlaceModal
            card={s.selectedHandCard}
            onConfirm={() => store.confirmDescer()}
            onCancel={() => store.cancelSelection()}
          />
        )}
      </AnimatePresence>

      {/* Confirm Trap/Spell Placement Modal */}
      <AnimatePresence>
        {s.pendingPlacement && (
          <ConfirmTrapSpellModal
            pending={s.pendingPlacement}
            onConfirm={() => store.confirmPendingPlacement()}
            onCancel={() => store.cancelPendingPlacement()}
          />
        )}
      </AnimatePresence>

      {/* Sacrifice Warning Modal (Modal 1) */}
      <AnimatePresence>
        {s.showSacrificeWarning && s.selectedHandCard && (
          <SacrificeWarningModal
            card={s.selectedHandCard}
            onSelect={() => store.confirmSacrificeWarning()}
            onCancel={() => store.cancelSacrificeWarning()}
          />
        )}
      </AnimatePresence>

      {/* Confirm Sacrifice Modal (Modal 2) */}
      <AnimatePresence>
        {s.confirmSacrifice && s.selectedHandCard && s.sacrificeTargets?.length > 0 && (
          <ConfirmSacrificeModal
            card={s.selectedHandCard}
            targets={s.sacrificeTargets}
            onConfirm={() => store.confirmSacrificeExecution()}
            onCancel={() => store.cancelSacrificeExecution()}
          />
        )}
      </AnimatePresence>

      {/* Board */}
      <div className="duelo-board-wrapper">
        <Board />
      </div>

      {/* Mão do jogador */}
      {s.playerHand.length > 0 && (
        <Hand
          cards={s.playerHand}
          onCardClick={handleCardClick}
          onCardHover={handleCardHover}
          selectedCardId={s.selectedHandCard?.id_num}
          disabled={!isPlayerTurn || s.gamePhase !== 'PLAYING' || turnPhase !== 'DESCER' || s.waitingForGridTarget !== null || s.confirmPlace}
        />
      )}

      <StatusBar card={hoveredCard || s.selectedHandCard} />
      <BattleLog log={s.battleLog} />

      {/* Controles de fase */}
      <div className="duelo-controls">
        <span className="duelo-turn-indicator">
          {t('games.duelo.turno_label')} <span>{s.turnNumber}</span> · {isPlayerTurn ? t('games.duelo.turno_voce') : iaPending ? `${t('games.duelo.turno_ia_pensando')} (${iaPhase})` : t('games.duelo.turno_ia')}
        </span>
        <span className="duelo-phase-indicator">
          {turnPhase === 'DESCER' ? 'FASE 1 — DESCER' : turnPhase === 'MOVIMENTO' ? 'FASE 2 — MOVIMENTO' : 'FASE 3 — ATAQUE'}
        </span>

        {s.gamePhase !== 'OVER' && (
          <button className="duelo-phase-btn" onClick={() => setVerCartas(true)} style={{ fontSize: '9px' }}>
            📖 VER CARTAS
          </button>
        )}
        {isPlayerTurn && s.gamePhase !== 'OVER' && (
          <>
            {/* Cancelar seleção de carta na mão */}
            {s.selectedHandCard && (
              <button className="duelo-phase-btn" onClick={() => store.cancelSelection()}>
                ❌ CANCELAR CARTA
              </button>
            )}

            {/* PRÓXIMA FASE */}
            {s.turnPhase === 'DESCER' && !s.waitingForGridTarget && !s.confirmPlace && (
              <button className="duelo-phase-btn duelo-phase-btn--active" onClick={handleProximaFase}>
                📋 PRÓXIMA FASE
              </button>
            )}

            {s.turnPhase === 'MOVIMENTO' && (
              <>
                {s.selectedMonster && s.moveCells.length > 0 && (
                  <span className="duelo-phase-hint">Clique em uma casa azul para mover</span>
                )}
                <button className="duelo-phase-btn duelo-phase-btn--active" onClick={handleProximaFase}>
                  📋 PRÓXIMA FASE
                </button>
              </>
            )}

            {s.turnPhase === 'ATAQUE' && (
              <>
                <button className="duelo-phase-btn duelo-phase-btn--active" onClick={handlePlayerEndTurn}>
                  ⏹️ ENCERRAR TURNO
                </button>
              </>
            )}
          </>
        )}

        {s.gamePhase === 'OVER' && (
          <span className="duelo-phase-over">
            {s.winner === 'PLAYER' ? `🏆 ${t('games.duelo.vitoria')}!` : `💀 ${t('games.duelo.derrota')}`}
          </span>
        )}
      </div>

      {previewCard && (
        <CardPreviewModal card={previewCard} onClose={() => setPreviewCard(null)} />
      )}

      <AnimatePresence>
        {verCartas && <VerCartasModal onClose={() => setVerCartas(false)} />}
      </AnimatePresence>
    </div>
  )
}