import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import useCombatEngine from '../engine/useCombatEngine'
import useInputLock from '../engine/useInputLock'
import useUIController from '../engine/useUIController'
import useCanvasLoop from '../engine/useCanvasLoop'
import useHexCanvas from '../engine/useHexCanvas'
import { useLanguage } from '../../../../context/LanguageContext'
import { drawCombatBoard } from '../engine/drawCombatBoard'
import { encontrarCaminho } from '../engine/hexUtils'
import JokenpoModal from '../components/modals/JokenpoModal'
import PowerChoiceModal from '../components/modals/PowerChoiceModal'
import CharModal from '../components/modals/CharModal'
import './Phase6CombatV2.css'
import './atb-canvas.css'
import './atb-hud.css'
import './atb-ui.css'
import useEffectMachine from '../engine/useEffectMachine'
import { init as initRenderer, clearHighlight } from '../components/effects/EffectRenderer'
import { emit } from '../engine/eventBus'
import { emitBurst, updateParticles, drawParticles, drawKiBall } from '../engine/animations/particles'

const SQRT3 = Math.sqrt(3)

export default function Phase6CombatV2({ boardState, poderesEscolhidos = {}, animacoesPorChar = {}, onBackToPhase1, onBackToPhase5 }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  const canvasContainerRef = useRef(null)
  const angleRef = useRef(0)
  const trailRef = useRef([])
  const charsFnRef = useRef()
  const syncCharsFnRef = useRef()
  const setAnimTimerFnRef = useRef()
  const highlightRef = useRef({ move: [], attack: [], range: [] })
  const setProjectilePosRef = useRef()
  const setProjectilePathRef = useRef()
  const charactersRef = useRef([])

  const { obstaculos, itensChao, cols, rows, tileUrl } = boardState
  const rawBoardChars = boardState.boardChars
  const boardChars = useMemo(() =>
    rawBoardChars.map(bc => ({
      ...bc,
      charData: {
        ...bc.charData,
        animacoes: animacoesPorChar[bc.charData?.id] || {
          movimento: 1, ataqueMelee: 1, ataqueRange: 1,
          defesa: 1, habilidade: 1, efeito: 1,
        },
      },
    })),
    [rawBoardChars, animacoesPorChar]
  )

  const { recalc, calcVersion, getCellAt, getHexCenter, drawHex,
          hexCenter, hexCorner, pixelToHex,
          padRef, sizeRef } = useHexCanvas({
    canvasRef, cols, rows, minSz: 18, maxSz: 36,
  })

  const { inputLocked, inputLockedRef, lockInput, unlockInput } = useInputLock()

  const uiCtrl = useUIController()
  const { dispatchEffect, setEffectTimer } = useEffectMachine()

  const engine = useCombatEngine({
    boardChars, obstaculos, itensChao, cols, rows, poderesEscolhidos, agiUmPraUm: true,

    onLog: (text) => setBattleLog(prev => [...prev, { text, time: Date.now() }]),

    onDano: (alvoId, dano) => {
      if (dano <= 0) return
      const alvo = charactersRef.current.find(c => c.id === alvoId)
      if (!alvo) return
      setHpAnterior(prev => ({ ...prev, [alvoId]: alvo.hp }))
      dispatchEffect({ tipo: 'dano', alvo: alvoId, dados: { valor: dano }, caller: 'onDano' })
      dispatchEffect({ tipo: 'popup', alvo: alvoId, dados: { valor: dano }, caller: 'onDano' })
      dispatchEffect({ tipo: 'shake', alvo: null, dados: {}, caller: 'onDano' })
      dispatchEffect({ tipo: 'flash', alvo: alvoId, dados: {}, caller: 'onDano' })
      dispatchEffect({ tipo: 'hp_delta', alvo: alvoId, dados: { dano }, caller: 'onDano' })
    },

    onBalao: ({ alvoId, texto, tipo, row, col }) => {
      dispatchEffect({ tipo: 'balao', alvo: alvoId, dados: { texto, tipo, row, col }, caller: 'onBalao' })
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const sz = sizeRef.current
      const center = hexCenter(row, col, padRef.current.x, padRef.current.y, sz)
      const scaleX = rect.width / canvas.width
      const scaleY = rect.height / canvas.height
      const containerRect = canvasContainerRef.current?.getBoundingClientRect()
      const x = center.x * scaleX + rect.left - (containerRect?.left ?? 0)
      const y = center.y * scaleY + rect.top - (containerRect?.top ?? 0) - sz * 0.8
    },

    onAnimarMelee: (atacante, alvo, resultado, onFinalizar) => {
      dispatchEffect({ tipo: 'melee', alvo: alvo.id, dados: { atacanteId: atacante.id, alvoId: alvo.id, resultado, onFinalizar }, caller: 'onAnimarMelee' })
    },

    onAnimarProjetil: (atacante, alvo, resultado, onFinalizar) => {
      dispatchEffect({ tipo: 'projetil', alvo: alvo.id, dados: { atacanteId: atacante.id, alvoId: alvo.id, resultado, onFinalizar }, caller: 'onAnimarProjetil' })
    },

    onVitoria: (vencedor) => {
      dispatchEffect({ tipo: 'vitoria', alvo: null, dados: { vencedor }, caller: 'onVitoria' })
      setPhase('resultado')
      uiCtrl.anunciar(
        vencedor === 'jogador'
          ? t('prototype.arena_testbed.announce_victory')
          : t('prototype.arena_testbed.announce_defeat'),
        3000,
        vencedor === 'jogador' ? 'vitoria' : 'ia'
      )
    },

    onTurnoJogador: (proxChar) => {
      dispatchEffect({ tipo: 'anuncio_turno', alvo: proxChar.id, dados: { nome: proxChar.nome, time: 'jogador' }, caller: 'onTurnoJogador' })
      const nome = proxChar.aparencia?.nome || proxChar.nome || 'Jogador'
      uiCtrl.anunciar(t('prototype.arena_testbed.announce_player_turn', { nome }))
      unlockInput(1500)
    },

    onTurnoIA: (proxChar) => {
      dispatchEffect({ tipo: 'anuncio_turno', alvo: proxChar.id, dados: { nome: proxChar.nome, time: 'ia' }, caller: 'onTurnoIA' })
      dispatchEffect({ tipo: 'ia_thinking', alvo: proxChar.id, dados: {}, caller: 'onTurnoIA' })
      const nome = proxChar.aparencia?.nome || proxChar.nome || 'IA'
      uiCtrl.anunciar(t('prototype.arena_testbed.announce_ia_turn', { nome }), 1500, 'ia')
    },

    onAtualizarChars: () => {},
    onLockInput: () => { lockInput() },
    onUnlockInput: (delay) => { unlockInput(delay) },

    onTrail: (passo) => {
      dispatchEffect({ tipo: 'trail', alvo: null, dados: { row: passo.row, col: passo.col, moveAnimId: passo.moveAnimId }, caller: 'onTrail' })
    },
    onClearHighlight: () => {
      clearHighlight()
      emit('effect:end', { canal: 'canvas' })
    },
    onClearTrail: () => {
      trailRef.current = []
    },
    onBannerIA: (nome) => {
      dispatchEffect({ tipo: 'banner_ia', alvo: null, dados: { nome }, caller: 'onBannerIA' })
    },
    onAnimating: (val) => setAnimating(val),
    onProjetilPos: (pos) => setProjectilePos(pos),
    onProjetilPath: (path) => setProjectilePath(path),
    onSetCharScales: (updater) => setCharScalesRef.current(updater),
    onSetCharVisualPos: (updater) => setCharVisualPosRef.current(updater),
    onSetCharRotation: (updater) => setCharRotationRef.current(updater),
    onGetHexCenter: (row, col) => hexCenter(row, col, padRef.current.x, padRef.current.y, sizeRef.current),
    onGetSz: () => sizeRef.current,
    onEmitParticles: (x, y, options) => {
      emitBurst(
        (updater) => { particlesRef.current = updater(particlesRef.current) },
        x, y, options
      )
    },
    onSetKiBall: (val) => setKiBall(val),
  })

  const { combat, ui, ordering, move, actions, set, utils } = engine
  const { characters, currentCharId, turnoAcoes, winner, iaThinking, itensChaoAtual } = combat
  charactersRef.current = characters
  const { subPhase, subPhaseStep, highlightedCells, attackCells, rangeCells,
          actionPanel, powerAttackMode, powerChoiceModal, defensePending } = ui
  const { orderingPhase, jokenpoNeeded, currentCrossTie,
          playerTeamOrder, crossTieQueue } = ordering
  const { pendingMove, destinoEscolhido, caminhoEscolhido } = move

  const currentChar = useMemo(() => characters.find(c => c.id === currentCharId), [characters, currentCharId])
  const isPlayerTurn = currentChar?.time === 'jogador'

  const [phase, setPhase] = useState('prepare')
  const [battleLog, setBattleLog] = useState([])
  const [animating, setAnimating] = useState(false)
  const [logDrawerOpen, setLogDrawerOpen] = useState(false)
  const [charModal, setCharModal] = useState(null)
  const [projectilePos, setProjectilePos] = useState(null)
  const [projectilePath, setProjectilePath] = useState([])
  const [hpAnterior, setHpAnterior] = useState({})
  const [tileLoaded, setTileLoaded] = useState(false)
  const [charScales, setCharScales] = useState({})
  const [charVisualPos, setCharVisualPos] = useState({})
  const [charRotation, setCharRotation] = useState({})
  const [kiBall, setKiBall] = useState(null)
  const frameCountRef = useRef(0)
  const particlesRef = useRef([])

  charsFnRef.current = characters
  syncCharsFnRef.current = utils.syncCharacters
  setAnimTimerFnRef.current = utils.setAnimTimer
  setProjectilePosRef.current = setProjectilePos
  setProjectilePathRef.current = setProjectilePath

  const setCharScalesRef = useRef(setCharScales)
  const setCharVisualPosRef = useRef(setCharVisualPos)
  const setCharRotationRef = useRef(setCharRotation)
  useEffect(() => { setCharScalesRef.current = setCharScales }, [setCharScales])
  useEffect(() => { setCharVisualPosRef.current = setCharVisualPos }, [setCharVisualPos])
  useEffect(() => { setCharRotationRef.current = setCharRotation }, [setCharRotation])

  highlightRef.current = { move: highlightedCells, attack: attackCells, range: rangeCells }

  const tileImgRef = useRef(null)
  const offsetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    actions.iniciarPartida()
  }, [])

  useEffect(() => {
    setEffectTimer(utils.setAnimTimer)
  }, [])

  useEffect(() => {
    if (!tileUrl) return
    const img = new Image()
    img.src = tileUrl
    img.onload = () => {
      tileImgRef.current = img
      setTileLoaded(true)
    }
  }, [tileUrl])

  useEffect(() => {
    initRenderer({
      trailRef,
      charsRef: charsFnRef,
      syncCharsRef: syncCharsFnRef,
      setAnimTimerRef: setAnimTimerFnRef,
      setProjectilePosRef: setProjectilePosRef,
      setProjectilePathRef: setProjectilePathRef,
      highlightRef,
    })
  }, [])

  const prevCellsRef = useRef({ move: [], attack: [], range: [] })
  useEffect(() => {
    const prev = prevCellsRef.current
    if (highlightedCells.length > 0 && prev.move.length === 0) {
      dispatchEffect({ tipo: 'highlight_movimento', canal: 'canvas', dados: { cells: highlightedCells } })
    }
    if (attackCells.length > 0 && prev.attack.length === 0) {
      dispatchEffect({ tipo: 'highlight_ataque', canal: 'canvas', dados: { cells: attackCells } })
    }
    if (rangeCells.length > 0 && prev.range.length === 0) {
      dispatchEffect({ tipo: 'highlight_range', canal: 'canvas', dados: { cells: rangeCells } })
    }
    if (highlightedCells.length === 0 && prev.move.length > 0) {
      emit('effect:end', { canal: 'canvas' })
    }
    if (attackCells.length === 0 && prev.attack.length > 0) {
      emit('effect:end', { canal: 'canvas' })
    }
    if (rangeCells.length === 0 && prev.range.length > 0) {
      emit('effect:end', { canal: 'canvas' })
    }
    prevCellsRef.current = { move: highlightedCells, attack: attackCells, range: rangeCells }
  }, [highlightedCells, attackCells, rangeCells, dispatchEffect])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const sz = sizeRef.current
    const padX = padRef.current.x
    const padY = padRef.current.y
    offsetRef.current = { x: padX, y: padY }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const hl = highlightRef.current
      drawCombatBoard(ctx, {
        characters, obstaculos, itensChaoAtual, cols, rows,
        highlightedCells: hl.move, attackCells: hl.attack, rangeCells: hl.range, currentChar,
        damageFlash: {}, projectilePos, projectilePath, caminhoEscolhido, destinoEscolhido,
        tileImg: tileImgRef.current, sz, padX, padY,
        angle: angleRef.current, trail: trailRef.current,
        hexCenter, drawHex,
        charScales, charVisualPos, charRotation,
      })
      drawParticles(ctx, particlesRef.current)
      if (kiBall?.active) {
        drawKiBall(ctx, kiBall.x, kiBall.y, frameCountRef.current)
      }
  }, [characters, obstaculos, itensChaoAtual, cols, rows, currentChar, projectilePos, projectilePath, caminhoEscolhido, destinoEscolhido, tileLoaded, charScales, charVisualPos, charRotation, kiBall])

  useCanvasLoop({
    draw,
    calcVersion,
    onFrame: () => {
      angleRef.current = (angleRef.current || 0) + 0.018
      trailRef.current = trailRef.current
        .map(t => ({ ...t, alpha: t.alpha - 0.07 }))
        .filter(t => t.alpha > 0)
      particlesRef.current = updateParticles(particlesRef.current)
      frameCountRef.current++
    },
  })

  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas || inputLockedRef.current || !isPlayerTurn || winner) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY
    const sz = sizeRef.current
    const padX = offsetRef.current.x || sz * 1.5
    const padY = offsetRef.current.y || sz * SQRT3
    const hex = pixelToHex(mx, my, cols, rows, padX, padY, sz)
    if (!hex) return
    const { row, col } = hex

    if (subPhase === 'free' && isPlayerTurn && !iaThinking) {
      const clickedOwnToken = currentChar?.posicao?.row === row && currentChar?.posicao?.col === col
      if (clickedOwnToken && !actionPanel) { set.setActionPanel(true); return }
      if (actionPanel) { set.setActionPanel(false); return }
    }

    if (subPhase === 'movimento') {
      const hl = highlightRef.current
      if (hl.move.some(c => c.row === row && c.col === col)) {
        const ocupadas = new Set(
          characters.filter(c => c.vivo && c.id !== currentChar.id)
            .map(c => `${c.posicao.row}_${c.posicao.col}`)
        )
        const cam = encontrarCaminho(
          currentChar.posicao.row, currentChar.posicao.col,
          row, col, cols, rows, obstaculos, ocupadas
        )
        set.setDestinoEscolhido({ row, col })
        set.setCaminhoEscolhido(cam ? cam.slice(1) : [{ row, col }])
        set.setPendingMove({ row, col })
      }
    } else if (subPhase === 'acao') {
      const hl2 = highlightRef.current
      if (subPhaseStep === 'escolher_alvo' && hl2.attack.some(c => c.row === row && c.col === col)) {
        const target = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)
        if (target) actions.executarAtaque(target)
      }
    }
  }, [isPlayerTurn, iaThinking, cols, rows, subPhase, subPhaseStep,
      currentChar, actionPanel, characters, obstaculos, set, actions])

  const handleTouch = useCallback((e) => {
    if (e.cancelable) e.preventDefault()
    const touch = e.changedTouches[0]
    handleCanvasClick({ clientX: touch.clientX, clientY: touch.clientY })
  }, [handleCanvasClick])

  if (phase === 'resultado' && winner) {
    return (
      <div className="atb-result">
        <div className="atb-result-card">
          <h2>{winner === 'jogador'
            ? t('prototype.arena_testbed.victory_player')
            : t('prototype.arena_testbed.victory_ia')}
          </h2>
          <p className="atb-result-sub">{t('prototype.arena_testbed.match_over')}</p>
          <button className="atb-btn atb-btn-primary" onClick={onBackToPhase1}>
            {t('prototype.arena_testbed.play_again')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {orderingPhase === 'player_internal' && (
        <div className="atb-ordering-overlay">
          <div className="atb-ordering-modal">
            <div className="atb-ordering-title">{t('prototype.arena_testbed.ordering_title')}</div>
            <div className="atb-ordering-subtitle">{t('prototype.arena_testbed.ordering_subtitle')}</div>
            <div className="atb-ordering-list">
              {playerTeamOrder.map((ch, idx) => {
                const prevSameAgi = idx > 0 && playerTeamOrder[idx - 1].agi === ch.agi
                const nextSameAgi = idx < playerTeamOrder.length - 1 && playerTeamOrder[idx + 1].agi === ch.agi
                const isMovable = prevSameAgi || nextSameAgi
                return (
                  <div key={ch.id} className={`atb-ordering-row ${isMovable ? 'movable' : 'locked'}`}>
                    <div className="atb-ordering-position">{idx + 1}º</div>
                    <div className="atb-ordering-name">{ch.nome}</div>
                    <div className="atb-ordering-agi">AGI {ch.agi}</div>
                    <div className="atb-ordering-arrows">
                      <button className="atb-ordering-btn"
                        disabled={!isMovable || idx === 0 || playerTeamOrder[idx - 1].agi !== ch.agi}
                        onClick={() => {
                          const novo = [...playerTeamOrder]
                          ;[novo[idx - 1], novo[idx]] = [novo[idx], novo[idx - 1]]
                          set.setPlayerTeamOrder(novo)
                        }}>▲</button>
                      <button className="atb-ordering-btn"
                        disabled={!isMovable || idx === playerTeamOrder.length - 1 || playerTeamOrder[idx + 1].agi !== ch.agi}
                        onClick={() => {
                          const novo = [...playerTeamOrder]
                          ;[novo[idx], novo[idx + 1]] = [novo[idx + 1], novo[idx]]
                          set.setPlayerTeamOrder(novo)
                        }}>▼</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <button className="atb-ordering-confirm" onClick={() => actions.confirmarOrdemInterna(playerTeamOrder)}>
              ✓ {t('prototype.arena_testbed.ordering_confirm')}
            </button>
          </div>
        </div>
      )}
      <div className="atb-root">
        {jokenpoNeeded && (
          <JokenpoModal
            player1Name={jokenpoNeeded[0]?.nome || '?'}
            player2Name={jokenpoNeeded[1]?.nome || '?'}
            onResult={actions.handleJokenpoResult}
          />
        )}
        {powerChoiceModal && (
          <PowerChoiceModal
            mode={powerChoiceModal.mode}
            charName={powerChoiceModal.charName}
            opcoes={[
              { rotulo: t('prototype.arena_testbed.pcm_comum'), poderId: null, custoMP: 0, disponivel: true },
              ...(powerChoiceModal.opcoes || []).map(p => ({
                rotulo: `${t('prototype.arena_testbed.' + p.chaveI18n)} (-${p.custoMP} MP)`,
                poderId: p.id,
                custoMP: p.custoMP,
                disponivel: true,
              })),
            ]}
            onEscolher={(op) => {
              if (powerChoiceModal.mode === 'ataque') {
                actions.confirmarEscolhaAtaque(op)
              } else if (powerChoiceModal.mode === 'defesa') {
                set.setDefensePending(null)
                const bonus = op.poderId ? 2 : 0
                defensePending.onResolve(bonus)
              }
            }}
          />
        )}
        {uiCtrl.turnAnnouncement && (
          <div className="atb-announcement-overlay">
            <div className={`atb-announcement-text ${uiCtrl.announcementClass}`}>{uiCtrl.turnAnnouncement}</div>
          </div>
        )}
        {defensePending && (
          <PowerChoiceModal
            mode="defesa" charName={defensePending.alvo.nome}
            faBruto={defensePending.faBruto} opcoes={defensePending.opcoes}
            onEscolher={(op) => {
              set.setDefensePending(null)
              const bonus = op.poderId ? 2 : 0
              defensePending.onResolve(bonus)
            }}
          />
        )}

        {actionPanel && isPlayerTurn && subPhase === 'free' && currentChar && !inputLocked && (
          <div className="atb-action-panel">
            <div className="atb-action-panel-name">{currentChar.nome}</div>
            <button className="atb-action-panel-btn"
              disabled={turnoAcoes.moveu}
              onClick={actions.iniciarMovimento}>
              👟 {t('prototype.arena_testbed.btn_move')}
            </button>
            <button className="atb-action-panel-btn atb-action-panel-btn--attack"
              disabled={turnoAcoes.atacou}
              onClick={actions.escolherTipoAtaque}>
              ⚔ {t('prototype.arena_testbed.btn_attack')}
            </button>
            {currentChar?.inventario?.pocaoHP > 0 && (
              <button className="atb-action-panel-btn atb-action-panel-btn--hp"
                onClick={() => actions.usarItem('hp')}>
                ❤ ×{currentChar.inventario.pocaoHP}
              </button>
            )}
            {currentChar?.inventario?.pocaoMP > 0 && (
              <button className="atb-action-panel-btn atb-action-panel-btn--mp"
                onClick={() => actions.usarItem('mp')}>
                💧 ×{currentChar.inventario.pocaoMP}
              </button>
            )}
          </div>
        )}
        <div className="atb-top-bar">
          <button className="atb-top-back" onClick={onBackToPhase1}>←</button>
          <div className="atb-top-info">
            <span className={`atb-top-turn ${currentChar?.time === 'ia' ? 'enemy' : 'player'}`}>
              {currentChar
                ? `${t('prototype.arena_testbed.turn_of')} ${currentChar.nome}`
                : t('prototype.arena_testbed.preparing_battle')}
              {isPlayerTurn && subPhase && (
                <span className="atb-top-subphase"> · {uiCtrl.getSubPhaseLabel(subPhase, t)}</span>
              )}
              {iaThinking ? ` · ${t('prototype.arena_testbed.ia_thinking_short')}` : null}
            </span>
          </div>
          <button className="atb-top-log-btn" onClick={() => setLogDrawerOpen(true)}>≡</button>
        </div>
        <div className="atb-canvas-wrap" ref={canvasContainerRef}>
          <canvas ref={canvasRef} className="atb-canvas" onClick={handleCanvasClick} onTouchEnd={handleTouch} />
          <div className="atb-balloon-container"></div>
        </div>
        <div className="atb-hud">
          {characters.filter(c => c.vivo).map(ch => {
            const isActive = ch.id === currentChar?.id
            const hpAntigo = hpAnterior[ch.id] ?? ch.hp
            const hpPct = (ch.hp / ch.hpMax) * 100
            const antigoPct = (hpAntigo / ch.hpMax) * 100
            const perdeuHP = hpAntigo > ch.hp
            const isPlayer = ch.time === 'jogador'
            const dotColor = ch.aparencia?.cor || (isPlayer ? 'var(--color-team-jogador)' : 'var(--color-team-ia)')
            return (
              <div key={ch.id} className={`atb-hud-chip ${isActive ? 'atb-hud-chip--active' : ''}`}
                onClick={() => setCharModal(ch)}>
                <div className="atb-hud-dot" style={{ '--dot-color': dotColor }} />
                <div className="atb-hud-info">
                  <div className="atb-hud-name">{ch.aparencia?.nome || ch.nome}</div>
                  <div className="atb-hud-bars">
                    <div className="atb-hud-bar-row">
                      <div className="atb-hud-bar-track">
                        {perdeuHP && <div className="atb-hud-bar-fill hp-delta" style={{ '--pct': `${antigoPct}%` }} />}
                        <div className="atb-hud-bar-fill hp" style={{ '--pct': `${hpPct}%` }} />
                      </div>
                    </div>
                    <div className="atb-hud-bar-row">
                      <div className="atb-hud-bar-track">
                        <div className="atb-hud-bar-fill mp" style={{ '--pct': `${(ch.mp / ch.mpMax) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="atb-bottom-nav">
          {isPlayerTurn && !iaThinking && !inputLocked ? (
            <>
              {subPhase === 'free' && (
                <button className="atb-action-btn atb-action-btn--end-turn" onClick={actions.finalizarTurno}>
                  ⏭ {t('prototype.arena_testbed.end_turn')}
                </button>
              )}
              {subPhase === 'movimento' && (
                <>
                  {pendingMove ? (
                    <>
                      <button className="atb-action-btn atb-action-btn--confirm" onClick={actions.confirmarMovimento}>
                        ✓ {t('prototype.arena_testbed.btn_confirm_move')}
                      </button>
                      <button className="atb-action-btn atb-action-btn--cancel" onClick={actions.cancelarAcao}>
                        ✕ {t('prototype.arena_testbed.btn_cancel')}
                      </button>
                    </>
                  ) : null}
                </>
              )}
              {subPhase === 'acao' && subPhaseStep === 'escolher_alvo' && (
                <button className="atb-action-btn atb-action-btn--cancel" onClick={actions.cancelarAcao}>
                  × {t('prototype.arena_testbed.btn_cancel')}
                </button>
              )}
            </>
          ) : iaThinking ? (
            <div className="atb-ia-thinking-row">
              <span className="atb-ia-dots">{t('prototype.arena_testbed.ia_thinking')}</span>
            </div>
          ) : null}
        </div>
        {logDrawerOpen && (
          <div className="atb-drawer-overlay" onClick={() => setLogDrawerOpen(false)}>
            <div className="atb-drawer" onClick={e => e.stopPropagation()}>
              <div className="atb-drawer-handle" />
              <div className="atb-drawer-title">{t('prototype.arena_testbed.battle_log')}</div>
              <div className="atb-drawer-list">
                {battleLog.slice(-30).map((entry, i) => (
                  <div key={i} className="atb-drawer-entry">{entry.text}</div>
                ))}
              </div>
            </div>
          </div>
        )}
        {charModal && (
          <CharModal
            char={charModal}
            onClose={() => setCharModal(null)}
            t={t}
          />
        )}
      </div>
    </>
  )
}
