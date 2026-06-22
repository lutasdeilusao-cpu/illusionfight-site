import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import useCombatEngine from '../engine/useCombatEngine'
import useInputLock from '../engine/useInputLock'
import useUIController from '../engine/useUIController'
import useCanvasLoop from '../engine/useCanvasLoop'
import useHexCanvas from '../engine/useHexCanvas'
import { useLanguage } from '../../../../context/LanguageContext'
import { drawCombatBoard } from '../engine/drawCombatBoard'
import { getHexLine, encontrarCaminho } from '../engine/hexUtils'
import JokenpoModal from '../components/modals/JokenpoModal'
import PowerChoiceModal from '../components/modals/PowerChoiceModal'
import CharModal from '../components/modals/CharModal'
import './Phase6Combat.css'

const SQRT3 = Math.sqrt(3)

export default function Phase6CombatV2({ boardState, poderesEscolhidos = {}, onBackToPhase1, onBackToPhase5 }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  const canvasContainerRef = useRef(null)
  const angleRef = useRef(0)
  const trailRef = useRef([])

  const { boardChars, obstaculos, itensChao, cols, rows, tileUrl } = boardState

  const { recalc, calcVersion, getCellAt, getHexCenter, drawHex,
          hexCenter, hexCorner, pixelToHex,
          padRef, sizeRef } = useHexCanvas({
    canvasRef, cols, rows, minSz: 18, maxSz: 36,
  })

  const { inputLocked, inputLockedRef, lockInput, unlockInput } = useInputLock()

  const uiCtrl = useUIController()

  const engine = useCombatEngine({
    boardChars, obstaculos, itensChao, cols, rows, poderesEscolhidos, agiUmPraUm: true,

    onLog: (text) => setBattleLog(prev => [...prev, { text, time: Date.now() }]),

    onDano: (alvoId, dano) => {
      if (dano <= 0) return
      const alvo = engine.combat.characters.find(c => c.id === alvoId)
      if (!alvo) return
      setHpAnterior(prev => ({ ...prev, [alvoId]: alvo.hp }))
      uiCtrl.mostrarDanoPopup(alvoId, dano)
      uiCtrl.dispararImpacto()
      uiCtrl.dispararFlash(alvoId)
    },

    onBalao: ({ alvoId, texto, tipo, row, col }) => {
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
      uiCtrl.adicionarBalao({ x, y, texto, tipo })
    },

    onAnimarMelee: (atacante, alvo, resultado, onFinalizar) => {
      console.log('[INV-12] onAnimarMelee callback chamado', { atacanteId: atacante.id, onFinalizarDefinido: !!onFinalizar })
      const origem = atacante.posicao
      const destino = alvo.posicao
      const dirRow = destino.row - origem.row
      const dirCol = destino.col - origem.col
      const meioRow = Math.round(origem.row + dirRow * 0.7)
      const meioCol = Math.round(origem.col + dirCol * 0.7)
      engine.utils.syncCharacters(prev =>
        prev.map(c => c.id === atacante.id
          ? { ...c, posicao: { row: meioRow, col: meioCol } } : c)
      )
      engine.utils.setAnimTimer(() => {
        engine.utils.syncCharacters(prev =>
          prev.map(c => c.id === atacante.id ? { ...c, posicao: origem } : c)
        )
        engine.utils.setAnimTimer(() => {
          if (onFinalizar) {
            console.log('[INV-13] onAnimarMelee → chamando onFinalizar')
            onFinalizar()
          }
        }, 200)
      }, 300)
    },

    onAnimarProjetil: (atacante, alvo, resultado, onFinalizar) => {
      console.log('[INV-14] onAnimarProjetil callback chamado', { atacanteId: atacante.id, onFinalizarDefinido: !!onFinalizar })
      const destino = alvo.posicao
      const steps = getHexLine(origem.row, origem.col, destino.row, destino.col)
      if (steps.length === 0) { console.log('[INV-15] onAnimarProjetil → chamando onFinalizar (steps vazio)'); if (onFinalizar) onFinalizar(); return }
      setProjectilePath(steps)
      let stepIdx = 0
      function avancar() {
        if (stepIdx >= steps.length) {
          setProjectilePos(null); setProjectilePath([])
          console.log('[INV-15] onAnimarProjetil → chamando onFinalizar (fim)'); if (onFinalizar) onFinalizar(); return
        }
        setProjectilePos({ row: steps[stepIdx].row, col: steps[stepIdx].col })
        setProjectilePath(prev => prev.filter((_, i) => i > 0))
        stepIdx++
        engine.utils.setAnimTimer(avancar, 320)
      }
      avancar()
    },

    onVitoria: (vencedor) => {
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
      const nome = proxChar.aparencia?.nome || proxChar.nome || 'Jogador'
      uiCtrl.anunciar(t('prototype.arena_testbed.announce_player_turn', { nome }))
      unlockInput(1500)
    },

    onTurnoIA: (proxChar) => {
      const nome = proxChar.aparencia?.nome || proxChar.nome || 'IA'
      uiCtrl.anunciar(t('prototype.arena_testbed.announce_ia_turn', { nome }), 1500, 'ia')
    },

    onLockInput: lockInput,
    onUnlockInput: unlockInput,
    onAtualizarChars: () => {},

    onTrail: (passo) => {
      trailRef.current = [...trailRef.current, { ...passo, alpha: 1.0 }]
    },

    onBannerIA: (nome) => uiCtrl.mostrarBannerAtaque(`${nome} ${t('prototype.arena_testbed.ia_attack_banner')}`),
    onAnimating: (val) => setAnimating(val),
    onProjetilPos: (pos) => setProjectilePos(pos),
    onProjetilPath: (path) => setProjectilePath(path),
  })

  const { combat, ui, ordering, move, actions, set, utils } = engine
  const { characters, currentCharId, turnoAcoes, winner, iaThinking, itensChaoAtual } = combat
  const { subPhase, subPhaseStep, highlightedCells, attackCells, rangeCells,
          actionPanel, powerAttackMode, powerChoiceModal, defensePending } = ui
  const { orderingPhase, jokenpoNeeded, currentCrossTie,
          playerTeamOrder, crossTieQueue } = ordering
  const { pendingMove, destinoEscolhido, caminhoEscolhido } = move

  const currentChar = useMemo(() =>
    characters.find(c => c.id === currentCharId),
    [characters, currentCharId]
  )
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

  const tileImgRef = useRef(null)
  const offsetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    actions.iniciarPartida()
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
    drawCombatBoard(ctx, {
      characters, obstaculos, itensChaoAtual, cols, rows,
      highlightedCells, attackCells, rangeCells, currentChar,
      damageFlash: uiCtrl.damageFlash, projectilePos, projectilePath, caminhoEscolhido, destinoEscolhido,
      tileImg: tileImgRef.current, sz, padX, padY,
      angle: angleRef.current, trail: trailRef.current,
      hexCenter, drawHex,
    })
  }, [characters, obstaculos, itensChaoAtual, cols, rows, highlightedCells, attackCells, rangeCells, currentChar, uiCtrl.damageFlash, projectilePos, projectilePath, caminhoEscolhido, destinoEscolhido, tileLoaded])

  useCanvasLoop({
    draw,
    calcVersion,
    onFrame: () => {
      angleRef.current = (angleRef.current || 0) + 0.018
      trailRef.current = trailRef.current
        .map(t => ({ ...t, alpha: t.alpha - 0.07 }))
        .filter(t => t.alpha > 0)
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
      if (highlightedCells.some(c => c.row === row && c.col === col)) {
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
      if (subPhaseStep === 'escolher_alvo' && attackCells.some(c => c.row === row && c.col === col)) {
        const target = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)
        if (target) actions.executarAtaque(target)
      }
    }
  }, [isPlayerTurn, iaThinking, cols, rows, subPhase, subPhaseStep,
      currentChar, actionPanel, highlightedCells, attackCells,
      characters, obstaculos, set, actions])

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
      <div className={`atb-root $      {uiCtrl.shaking ? 'atb-shake' : ''}`}>
        {uiCtrl.flashDmg && <div className="atb-flash-overlay" />}
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
            opcoes={powerChoiceModal.opcoes}
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
        {uiCtrl.danoPopup && <div className="atb-dano-popup" key={uiCtrl.danoPopup.key}>
          <div className="atb-dano-popup-num">-{uiCtrl.danoPopup.dano}</div>
        </div>}
        {uiCtrl.attackBanner && (
          <div className="atb-attack-banner">
            <div className="atb-attack-banner-text">{uiCtrl.attackBanner.texto}</div>
          </div>
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
              {iaThinking && ` · ${t('prototype.arena_testbed.ia_thinking_short')}`}
            </span>
          </div>
          <button className="atb-top-log-btn" onClick={() => setLogDrawerOpen(true)}>≡</button>
        </div>
        <div className="atb-canvas-wrap" ref={canvasContainerRef}>
          <canvas ref={canvasRef} className="atb-canvas" onClick={handleCanvasClick} onTouchEnd={handleTouch} />
          <div className="atb-balloon-container">
            {uiCtrl.balloons.map(b => (
              <div key={b.key} className={`atb-balloon atb-balloon--${b.tipo}`}
                style={{ '--x': `${b.x}px`, '--y': `${b.y}px` }}>
                {b.texto}
              </div>
            ))}
          </div>
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
          ) : (
            <div className="atb-ia-thinking-row">
              <span className="atb-ia-dots">{t('prototype.arena_testbed.ia_thinking')}</span>
            </div>
          )}
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
