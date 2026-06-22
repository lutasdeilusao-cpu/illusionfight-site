import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import useCombatEngine from '../engine/useCombatEngine'
import useInputLock from '../engine/useInputLock'
import { useLanguage } from '../../../../context/LanguageContext'
import useHexCanvas from '../engine/useHexCanvas'
import {
  resolverAtaque, resolverContraAtaque, rolarD6, calcularFA, calcularFD,
  getCasasMovimento, getChanceAcerto,
} from '../engine/combat'
import { getCelulasAlcance, getCelulasAtaque, distanciaHex, encontrarCaminho, getHexLine } from '../engine/hexUtils'
import { decidirAcaoIA } from '../engine/ai'
import { getPersonalidadePorId } from '../engine/ai/personalidades/index'
import { EstagioIA } from '../engine/ai/estagios'
import { mostrarBannerAtaqueIA } from '../engine/ai/efeitosVisuaisIA'
import { PODERES_BASE, getPoderesPorId, temPoderDisponivel } from '../data/poderes'
import JokenpoModal from '../components/modals/JokenpoModal'
import PowerChoiceModal from '../components/modals/PowerChoiceModal'
import * as tc from '../engine/TurnController'
import { TipoAcao } from '../engine/TurnController'
import { executarMecanica } from '../engine/mecanicasPoder'
import { drawCombatBoard } from '../engine/drawCombatBoard'
import {
  calcularGruposEOrdem, aplicarOrdemInterna,
  encontrarProximoJokenpo, processarResultadoJokenpo,
  aplicarResultadosCruzados,
} from '../engine/turnOrder'
import './Phase6Combat.css'

const SQRT3 = Math.sqrt(3)
const SUB_PHASES = ['movimento', 'ataque', 'item']

export default function Phase6Combat({ boardState, poderesEscolhidos = {}, onBackToPhase1, onBackToPhase5 }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  const canvasContainerRef = useRef(null)
  const angleRef = useRef(0)
  const trailRef = useRef([])
  const rafRef = useRef(null)

  const { boardChars, obstaculos, itensChao, cols, rows, tileUrl } = boardState
  const agiUmPraUm = true

  const { recalc, calcVersion, getCellAt, getHexCenter, drawHex,
          hexCenter, hexCorner, pixelToHex,
          padRef, sizeRef } = useHexCanvas({
    canvasRef, cols, rows, minSz: 18, maxSz: 36,
  })

  const { inputLocked, inputLockedRef, lockInput, unlockInput } = useInputLock()

  const engine = useCombatEngine({
    boardChars, obstaculos, itensChao, cols, rows, poderesEscolhidos, agiUmPraUm,
    onLog: (text) => setBattleLog(prev => [...prev, { text, time: Date.now() }]),
    onDano: (alvoId, dano) => {
      if (dano <= 0) return
      const alvo = engine.combat.characters.find(c => c.id === alvoId)
      if (!alvo) return
      setHpAnterior(prev => ({ ...prev, [alvoId]: alvo.hp }))
      setDanoPopup({ dano, alvoId, key: Date.now() })
      setTimeout(() => setDanoPopup(null), 800)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
      setFlashDmg(true)
      setTimeout(() => setFlashDmg(false), 400)
      const fazerFlash = (count) => {
        if (count >= 6) {
          setDamageFlash(prev => { const n = { ...prev }; delete n[alvoId]; return n })
          return
        }
        setDamageFlash(prev => ({ ...prev, [alvoId]: count }))
        setTimeout(() => fazerFlash(count + 1), 120)
      }
      fazerFlash(0)
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
      const balaoX = center.x * scaleX + rect.left - (containerRect?.left ?? 0)
      const balaoY = center.y * scaleY + rect.top - (containerRect?.top ?? 0) - sz * 0.8
      const key = Date.now() + Math.random()
      setBalloons(prev => [...prev, { id: key, x: balaoX, y: balaoY, texto, tipo, key }])
      setTimeout(() => { setBalloons(prev => prev.filter(b => b.key !== key)) }, 1300)
    },
    onAnimarMelee: (atacante, alvo, resultado, onFinalizar) => {
      const origem = atacante.posicao
      const destino = alvo.posicao
      const dirRow = destino.row - origem.row
      const dirCol = destino.col - origem.col
      const meioRow = Math.round(origem.row + dirRow * 0.7)
      const meioCol = Math.round(origem.col + dirCol * 0.7)
      console.log('[INV-HP] syncCharacters chamado', { caller: 'onAnimarMelee-lunge', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
      engine.utils.syncCharacters(prev =>
        prev.map(c =>
          c.id === atacante.id ? { ...c, posicao: { row: meioRow, col: meioCol } } : c
        )
      )
      console.log('[INV-HP] syncCharacters resultado', { caller: 'onAnimarMelee-lunge', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
      engine.utils.setAnimTimer(() => {
        console.log('[INV-HP] syncCharacters chamado', { caller: 'onAnimarMelee-return', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
        engine.utils.syncCharacters(prev =>
          prev.map(c =>
            c.id === atacante.id ? { ...c, posicao: origem } : c
          )
        )
        console.log('[INV-HP] syncCharacters resultado', { caller: 'onAnimarMelee-return', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
        engine.utils.setAnimTimer(() => {
          if (onFinalizar) onFinalizar()
          else aposAnimacaoAtaque(atacante, alvo, resultado)
        }, 200)
      }, 300)
    },
    onAnimarProjetil: (atacante, alvo, resultado, onFinalizar) => {
      const origem = atacante.posicao
      const destino = alvo.posicao
      const steps = getHexLine(origem.row, origem.col, destino.row, destino.col)
      console.log('[DEBUG] animarAtaqueProjetil', { origem, destino, stepsLength: steps.length })
      if (steps.length === 0) {
        console.warn('[DEBUG] animarAtaqueProjetil: steps vazio, chamando onFinalizar direto')
        if (onFinalizar) onFinalizar()
        else aposAnimacaoAtaque(atacante, alvo, resultado)
        return
      }
      setProjectilePath(steps)
      let stepIdx = 0
      let maxIter = steps.length * 2
      function avancarProjetil() {
        if (stepIdx >= steps.length || stepIdx >= maxIter) {
          console.log('[DEBUG] avancarProjetil: finalizado', { stepIdx, stepsLength: steps.length, finalizou: stepIdx >= steps.length })
          setProjectilePos(null)
          setProjectilePath([])
          if (onFinalizar) onFinalizar()
          else aposAnimacaoAtaque(atacante, alvo, resultado)
          return
        }
        setProjectilePos({ row: steps[stepIdx].row, col: steps[stepIdx].col })
        setProjectilePath(prev => prev.filter((_, i) => i > 0))
        stepIdx++
        engine.utils.setAnimTimer(avancarProjetil, 320)
      }
      avancarProjetil()
    },
    onVitoria: (vencedor) => {
      setPhase('resultado')
      anunciar(
        vencedor === 'jogador'
          ? t('prototype.arena_testbed.announce_victory')
          : t('prototype.arena_testbed.announce_defeat'),
        3000,
        vencedor === 'jogador' ? 'vitoria' : 'ia'
      )
    },
    onTurnoJogador: (proxChar) => {
      const nomeAnuncio = proxChar.aparencia?.nome || proxChar.nome || getDisplayName(proxChar)
      anunciar(t('prototype.arena_testbed.announce_player_turn', { nome: nomeAnuncio }))
      unlockInput(1500)
    },
    onTurnoIA: (proxChar) => {
      const nomeAnuncio = proxChar.aparencia?.nome || proxChar.nome || getDisplayName(proxChar)
      anunciar(t('prototype.arena_testbed.announce_ia_turn', { nome: nomeAnuncio }), 1500, 'ia')
    },
    onLockInput: lockInput,
    onUnlockInput: unlockInput,
    onAtualizarChars: () => {},
    onTrail: (passo) => {
      trailRef.current = [...trailRef.current, { ...passo, alpha: 1.0 }]
    },
    onBannerIA: (nome) => mostrarBannerAtaqueIA(nome, t, setAttackBanner),
    onAnimating: (val) => setAnimating(val),
    onProjetilPos: (pos) => setProjectilePos(pos),
    onProjetilPath: (path) => setProjectilePath(path),
  })

  const { combat, ui, ordering, move, actions, set, utils } = engine
  const {
    characters, currentCharId, turnoAcoes, winner, iaThinking, itensChaoAtual,
  } = combat
  const {
    subPhase, subPhaseStep, highlightedCells, attackCells, rangeCells,
    actionPanel, powerAttackMode, powerChoiceModal, defensePending,
  } = ui
  const {
    orderingPhase, jokenpoNeeded, currentCrossTie, playerTeamOrder, crossTieQueue,
  } = ordering
  const {
    pendingMove, destinoEscolhido, caminhoEscolhido,
  } = move
  const [turnVersion, setTurnVersion] = useState(0)
  const [phase, setPhase] = useState('prepare')
  const [projectilePath, setProjectilePath] = useState([])
  const [battleLog, setBattleLog] = useState([])
  const [animating, setAnimating] = useState(false)
  const [d6Result, setD6Result] = useState(null)
  const [turnAnnouncement, setTurnAnnouncement] = useState(null)
  const [announcementClass, setAnnouncementClass] = useState('')

  const [logDrawerOpen, setLogDrawerOpen] = useState(false)
  const [charModal, setCharModal] = useState(null)
  const drawerListRef = useRef(null)

  useEffect(() => {
    if (logDrawerOpen && drawerListRef.current) {
      drawerListRef.current.scrollTop = drawerListRef.current.scrollHeight
    }
  }, [battleLog, logDrawerOpen])

  const [movementPath, setMovementPath] = useState(null)
  const [attackAnim, setAttackAnim] = useState(null)
  const [damageFlash, setDamageFlash] = useState({})
  const [projectilePos, setProjectilePos] = useState(null)
  const [balloons, setBalloons] = useState([])
  const [shaking, setShaking] = useState(false)
  const [flashDmg, setFlashDmg] = useState(false)
  const [danoPopup, setDanoPopup] = useState(null)
  const [hpAnterior, setHpAnterior] = useState({})
  const [attackBanner, setAttackBanner] = useState(null)
  const animatingRef = useRef(false)
  const announceTimerRef = useRef(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const tileImgRef = useRef(null)
  const [tileLoaded, setTileLoaded] = useState(false)

  function clearAnimTimers() {
    animTimersRef.current.forEach(t => clearTimeout(t))
    animTimersRef.current = []
  }

  function setAnimTimer(fn, delay) {
    const id = setTimeout(fn, delay)
    animTimersRef.current.push(id)
    return id
  }

  function anunciar(texto, duracao = 2000, cls = '') {
    setTurnAnnouncement(texto)
    setAnnouncementClass(cls)
    if (announceTimerRef.current) clearTimeout(announceTimerRef.current)
    announceTimerRef.current = setTimeout(() => { setTurnAnnouncement(null); setAnnouncementClass('') }, duracao)
  }

  const [remainingMove, setRemainingMove] = useState(0)

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
    engine.actions.iniciarPartida()
  }, [])

  function getDisplayName(ch) {
    if (ch?.nome) return ch.nome
    const jogadores = characters.filter(c => c.time === 'jogador')
    const idx = jogadores.findIndex(j => j.id === ch?.id)
    if (ch?.time === 'jogador') return `Jogador ${idx + 1}`
    const ias = characters.filter(c => c.time === 'ia')
    const iaIdx = ias.findIndex(i => i.id === ch?.id)
    return `IA ${iaIdx + 1}`
  }

  const currentChar = useMemo(() => {
    if (!engine.combat.currentCharId) return null
    return engine.combat.characters.find(c => c.id === engine.combat.currentCharId)
  }, [engine.combat.characters, engine.combat.currentCharId])

  const isPlayerTurn = currentChar?.time === 'jogador'

  const subPhaseLabel = useMemo(() => {
    if (!subPhase) return ''
    if (subPhase === 'free') return t('prototype.arena_testbed.free_turn_hint')
    if (subPhase === 'movimento') return t('prototype.arena_testbed.subphase_move')
    return t('prototype.arena_testbed.subphase_action')
  }, [subPhase, t])

  useEffect(() => {
    return tc.onTurnoIniciado(() => {})
  }, [])

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
      damageFlash, projectilePos, projectilePath, caminhoEscolhido, destinoEscolhido,
      tileImg: tileImgRef.current, sz, padX, padY,
      angle: angleRef.current, trail: trailRef.current,
      hexCenter, drawHex,
    })
  }, [characters, obstaculos, itensChaoAtual, cols, rows, highlightedCells, attackCells, rangeCells, currentChar, damageFlash, projectilePos, projectilePath, caminhoEscolhido, destinoEscolhido, tileLoaded])

  useEffect(() => {
    const container = canvasContainerRef.current
    const canvas = canvasRef.current
    if (container) {
      const ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          const { inlineSize, blockSize } = entry.contentBoxSize?.[0] || {}
          const w = entry.contentRect.width
          const h = entry.contentRect.height
        }
      })
      ro.observe(container)
      return () => { ro.disconnect() }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function loop() {
      angleRef.current = (angleRef.current || 0) + 0.018
      trailRef.current = trailRef.current
        .map(t => ({ ...t, alpha: t.alpha - 0.07 }))
        .filter(t => t.alpha > 0)
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw, calcVersion])

  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas || inputLockedRef.current || !isPlayerTurn || winnerRef.current) return
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
      if (clickedOwnToken && !actionPanel) {
        set.setActionPanel(true)
        return
      }
      if (actionPanel) {
        set.setActionPanel(false)
        return
      }
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
  }, [
    isPlayerTurn, iaThinking, cols, rows, subPhase, subPhaseStep,
    currentChar, actionPanel, highlightedCells, attackCells, characters, obstaculos,
    set, actions,
  ])

  const handleTouch = useCallback((e) => {
    if (e.cancelable) e.preventDefault()
    const touch = e.changedTouches[0]
    handleCanvasClick({ clientX: touch.clientX, clientY: touch.clientY })
  }, [handleCanvasClick])

  function moverPersonagem(row, col) {
    if (!currentChar || animating || inputLockedRef.current) return
    clearAnimTimers()
    setDestinoEscolhido(null)
    setCaminhoEscolhido([])

    const origem = currentChar.posicao
    const ocupadas = new Set(
      characters
        .filter(c => c.vivo && c.id !== currentChar.id)
        .map(c => `${c.posicao.row}_${c.posicao.col}`)
    )
    const caminho = encontrarCaminho(
      origem.row, origem.col, row, col,
      cols, rows, obstaculos, ocupadas
    )

    if (!caminho || caminho.length < 2) {
      console.log('[INV-HP] syncCharacters chamado', { caller: 'moverPersonagem-fallback', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
      engine.utils.syncCharacters(prev =>
        prev.map(c =>
          c.id === currentChar.id ? { ...c, posicao: { row, col } } : c
        )
      )
      console.log('[INV-HP] syncCharacters resultado', { caller: 'moverPersonagem-fallback', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
      setHighlightedCells([])
      setRemainingMove(0)
      aposMovimento(row, col)
      return
    }

    const steps = caminho.slice(1)
    animatingRef.current = true
    lockInput()
    setAnimating(true)
    setHighlightedCells([])

    let stepIdx = 0
    function avancarPasso() {
      if (stepIdx >= steps.length) {
        animatingRef.current = false
        setAnimating(false)
        setRemainingMove(0)
        aposMovimento(row, col)
        return
      }
      const passo = steps[stepIdx]
      trailRef.current = [...trailRef.current, { row: passo.row, col: passo.col, alpha: 1.0 }]
      console.log('[INV-HP] syncCharacters chamado', { caller: 'moverPersonagem-step', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
      engine.utils.syncCharacters(prev =>
        prev.map(c =>
          c.id === currentChar.id ? { ...c, posicao: { row: passo.row, col: passo.col } } : c
        )
      )
      console.log('[INV-HP] syncCharacters resultado', { caller: 'moverPersonagem-step', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
      stepIdx++
      setAnimTimer(avancarPasso, 150)
    }
    setAnimTimer(avancarPasso, 50)
  }
  moverPersonagemRef.current = moverPersonagem

  function aposMovimento(row, col) {
    if (!currentChar) return
    addLog(`[${currentChar.nome}] Moveu para (${row}, ${col})`)
    const charAtualizado = {
      ...currentChar,
      posicao: { row, col },
    }
    const key = `${row}_${col}`
    if (itensChaoAtual[key]) {
      const item = itensChaoAtual[key]
      console.log('[INV-HP] syncCharacters chamado', { caller: 'aposMovimento-item', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
      engine.utils.syncCharacters(prev =>
        prev.map(c =>
          c.id === currentChar.id
            ? {
                ...c,
                inventario: {
                  ...c.inventario,
                  [item.tipo === 'hp' ? 'pocaoHP' : 'pocaoMP']: (c.inventario?.[item.tipo === 'hp' ? 'pocaoHP' : 'pocaoMP'] || 0) + 1,
                },
              }
            : c
        )
      )
      console.log('[INV-HP] syncCharacters resultado', { caller: 'aposMovimento-item', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
      setItensChaoAtual(prev => { const n = { ...prev }; delete n[key]; return n })
      addLog(`[${currentChar.nome}] Coletou Poção ${item.tipo === 'hp' ? 'HP' : 'MP'} do chão!`)
    }
    setTurnoAcoes(prev => ({ ...prev, moveu: true }))
    tc.registrarAcao(currentChar.id, TipoAcao.MOVER)
    setSubPhase('free')
    setHighlightedCells([])
    setActionPanel(false)
    unlockInput(0)
  }

  function iniciarMovimento() {
    if (!currentChar || animating || inputLockedRef.current || turnoAcoes.moveu) return
    if (!tc.podeAgir(currentChar.id, TipoAcao.MOVER)) return
    setActionPanel(false)
    const mov = getCasasMovimento(currentChar.agi, agiUmPraUm)
    const moveCells = getCelulasAlcance(
      currentChar.posicao.row, currentChar.posicao.col,
      mov, cols, rows, obstaculos
    )
    const freeCells = moveCells.filter(c => {
      const occupied = characters.some(ch =>
        ch.vivo && ch.id !== currentChar.id && ch.posicao?.row === c.row && ch.posicao?.col === c.col
      )
      const hasObstacle = obstaculos[`${c.row}_${c.col}`]?.tipo === 1
      return !occupied && !hasObstacle
    })
    setHighlightedCells(freeCells)
    setAttackCells([])
    setRemainingMove(mov)
    setSubPhase('movimento')
  }

  function cancelarAcao() {
    setHighlightedCells([])
    setAttackCells([])
    setRangeCells([])
    setSubPhaseStep(null)
    setPendingMove(null)
    setDestinoEscolhido(null)
    setCaminhoEscolhido([])
    setSubPhase('free')
    setActionPanel(false)
  }

  function confirmarMovimento() {
    if (!pendingMove) return
    moverPersonagemRef.current?.(pendingMove.row, pendingMove.col)
    setPendingMove(null)
  }

  function pularMovimento() {
    if (!currentChar) return
    addLog(`[${currentChar.nome}] Pulou a fase de movimento.`)
    setHighlightedCells([])
    enterSubPhase('acao', currentChar)
  }

  function escolherAcao(tipoAcao) {
    if (!currentChar || animating || inputLockedRef.current) return
    setPowerAttackMode(tipoAcao === 'power_attack')
    addLog(`[${currentChar.nome}] Escolheu: ${tipoAcao}`)
    const alcanceMax = currentChar.tipoAtaque === 'melee' ? 1 : currentChar.pdf
    const atkCells = getCelulasAtaque(
      currentChar.posicao.row, currentChar.posicao.col,
      currentChar.tipoAtaque, cols, rows,
      alcanceMax, obstaculos
    )
    setRangeCells(atkCells)
    const enemyCells = atkCells.filter(c =>
      characters.some(ch => ch.vivo && ch.time !== currentChar.time && ch.posicao?.row === c.row && ch.posicao?.col === c.col)
    )
    setAttackCells(enemyCells)
    setHighlightedCells([])
    setSubPhaseStep('escolher_alvo')
    setSubPhase('acao')
  }

  function escolherTipoAtaque() {
    if (!currentChar || animating || inputLockedRef.current) return
    const poderesDisponiveis = getPoderesPorId(poderesEscolhidos[currentChar.id] || currentChar.poderesEscolhidos || [])
      .filter(p => p.gatilho === 'ataque' && currentChar.mp >= p.custoMP)
    if (poderesDisponiveis.length === 0) {
      setActionPanel(false)
      confirmarEscolhaAtaque({ rotulo: '', poderId: null, custoMP: 0, disponivel: true })
      return
    }
    const opcoes = [
      { rotulo: t('prototype.arena_testbed.pcm_comum'), poderId: null, custoMP: 0, disponivel: true },
      ...poderesDisponiveis.map(p => ({
        rotulo: `${t('prototype.arena_testbed.' + p.chaveI18n)} (-${p.custoMP} MP)`,
        poderId: p.id,
        custoMP: p.custoMP,
        disponivel: true,
      })),
    ]
    setPowerChoiceModal({ mode: 'ataque', charName: currentChar.nome, opcoes })
  }

  function confirmarEscolhaAtaque(opcao) {
    setPowerChoiceModal(null)
    if (!currentChar || animating || inputLockedRef.current) return

    if (opcao.poderId) {
      const poder = PODERES_BASE.find(p => p.id === opcao.poderId)
      if (poder) addLog(`⚡ ${currentChar.nome} usará ${t('prototype.arena_testbed.' + poder.chaveI18n)}!`)
    }
    setPowerAttackMode(!!opcao.poderId)
    const nomeTipo = opcao.poderId ? 'power_attack' : 'common_attack'
    addLog(`[${currentChar.nome}] Escolheu: ${nomeTipo}`)
    const alcanceMax = currentChar.tipoAtaque === 'melee' ? 1 : currentChar.pdf
    const atkCells = getCelulasAtaque(
      currentChar.posicao.row, currentChar.posicao.col,
      currentChar.tipoAtaque, cols, rows,
      alcanceMax, obstaculos
    )
    setRangeCells(atkCells)
    const enemyCells = atkCells.filter(c =>
      characters.some(ch => ch.vivo && ch.time !== currentChar.time && ch.posicao?.row === c.row && ch.posicao?.col === c.col)
    )
    setAttackCells(enemyCells)
    setHighlightedCells([])
    setSubPhaseStep('escolher_alvo')
    setSubPhase('acao')
  }

  function handleLinePreviewConfirm({ direcao, alvos, distancia: alcance }) {
    setLinePreview(null)
    if (!currentChar || animating || inputLockedRef.current) return
    executarLinhaAtaque(direcao, alvos)
  }

  function executarLinhaAtaque(direcao, alvos) {
    if (!currentChar) return
    setActionPanel(false)

    const poder = PODERES_BASE.find(p => p.id === 'investida')
    if (poder && currentChar.mp >= poder.custoMP) {
      console.log('[INV-HP] syncCharacters chamado', { caller: 'executarLinhaAtaque-power', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
      engine.utils.syncCharacters(prev => prev.map(c =>
        c.id === currentChar.id ? { ...c, mp: c.mp - poder.custoMP } : c
      ))
      console.log('[INV-HP] syncCharacters resultado', { caller: 'executarLinhaAtaque-power', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
    }

    clearAnimTimers()
    animatingRef.current = true
    lockInput()
    setAnimating(true)

    const d6Atk = rolarD6()
    const isCritico = d6Atk === 6
    const fa = calcularFA(currentChar, isCritico, 1, d6Atk)

    addLog(`⚡ ${currentChar.nome} usou Investida! (${direcao}) — FA=${fa}`)

    if (alvos.length === 0) {
      addLog(`  Nenhum alvo na linha ${direcao}.`)
      finalizarAposAtaque(currentChar, { dano: 0 })
      return
    }

    const charsAtualizados = [...characters]
    const attackerId = currentChar.id

    alvos.forEach((a, i) => {
      const multiplier = a.multiplier
      const faFinal = Math.round(fa * multiplier * 10) / 10
      const d6Def = rolarD6()
      const isCriticoDef = d6Def === 6
      const fd = calcularFD(a.char, isCriticoDef, d6Def)
      const dano = Math.max(1, Math.round(faFinal - fd))
      const idx = charsAtualizados.findIndex(c => c.id === a.char.id)
      if (idx !== -1) {
        charsAtualizados[idx] = { ...charsAtualizados[idx], hp: Math.max(0, charsAtualizados[idx].hp - dano) }
      }
      addLog(`  🎯 ${a.char.nome} (casa ${a.pos}): FA=${faFinal} × FD=${fd} = ${dano} de dano!`)
      applyDanoEffect(a.char.id, dano, currentChar)
    })

    console.log('[INV-HP] syncCharacters chamado', { caller: 'executarLinhaAtaque-bulk', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: charsAtualizados.map(c => ({ id: c.id, hp: c.hp })) })
    engine.utils.syncCharacters(charsAtualizados)

    const ultimoAlvo = alvos[alvos.length - 1]
    addLog(`  ✅ ${ultimoAlvo.char.nome} foi o último alvo da Investida.`)
    finalizarAposAtaque(ultimoAlvo.char, { dano: 0 })
  }

  function pularAcao() {
    if (!currentChar) return
    addLog(`[${currentChar.nome}] Pulou a fase de ação.`)
    setAttackCells([])
    setRangeCells([])
    setSubPhaseStep(null)
    finalizarTurno()
  }

  function addBalao(alvoId, texto, tipo, row, col) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const sz = sizeRef.current
    const center = hexCenter(row, col, padRef.current.x, padRef.current.y, sz)
    const scaleX = rect.width / canvas.width
    const scaleY = rect.height / canvas.height
    const containerRect = canvasContainerRef.current?.getBoundingClientRect()
    const balaoX = center.x * scaleX + rect.left - (containerRect?.left ?? 0)
    const balaoY = center.y * scaleY + rect.top - (containerRect?.top ?? 0) - sz * 0.8

    const key = Date.now() + Math.random()
    setBalloons(prev => [...prev, { id: key, x: balaoX, y: balaoY, texto, tipo, key }])
    setTimeout(() => {
      setBalloons(prev => prev.filter(b => b.key !== key))
    }, 1300)
  }

  function applyDanoEffect(alvoId, dano, donoDoAtaque) {
    if (dano <= 0) return
    const alvo = characters.find(c => c.id === alvoId)
    if (!alvo) return
    const novoHp = Math.max(0, alvo.hp - dano)
    console.log('[INV-HP] fluxo-dano', { origem: donoDoAtaque?.time || 'phase6', alvoId, dano, alvoNome: alvo.nome })
    setHpAnterior(prev => ({ ...prev, [alvoId]: alvo.hp }))
    console.log('[INV-HP] syncCharacters chamado', { caller: 'applyDanoEffect', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
    engine.utils.syncCharacters(prev =>
      prev.map(c =>
        c.id === alvoId ? { ...c, hp: novoHp } : c
      )
    )
    console.log('[INV-HP] syncCharacters resultado', { caller: 'applyDanoEffect', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
    setDanoPopup({ dano, alvoId, key: Date.now() })
    setTimeout(() => setDanoPopup(null), 800)
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
    setFlashDmg(true)
    setTimeout(() => setFlashDmg(false), 400)
    const fazerFlash = (count) => {
      if (count >= 6) {
        setDamageFlash(prev => { const n = { ...prev }; delete n[alvoId]; return n })
        return
      }
      setDamageFlash(prev => ({ ...prev, [alvoId]: count }))
      setTimeout(() => fazerFlash(count + 1), 120)
    }
    fazerFlash(0)
  }

  function meleeAttackAnim(atacante, alvo, resultado, onFinalizar) {
    const origem = atacante.posicao
    const destino = alvo.posicao
    const dirRow = destino.row - origem.row
    const dirCol = destino.col - origem.col
    const meioRow = Math.round(origem.row + dirRow * 0.7)
    const meioCol = Math.round(origem.col + dirCol * 0.7)
    console.log('[INV-HP] syncCharacters chamado', { caller: 'meleeAttackAnim-lunge', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
    engine.utils.syncCharacters(prev =>
      prev.map(c =>
        c.id === atacante.id ? { ...c, posicao: { row: meioRow, col: meioCol } } : c
      )
    )
    console.log('[INV-HP] syncCharacters resultado', { caller: 'meleeAttackAnim-lunge', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
    setAnimTimer(() => {
      console.log('[INV-HP] syncCharacters chamado', { caller: 'meleeAttackAnim-return', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
      engine.utils.syncCharacters(prev =>
        prev.map(c =>
          c.id === atacante.id ? { ...c, posicao: origem } : c
        )
      )
      console.log('[INV-HP] syncCharacters resultado', { caller: 'meleeAttackAnim-return', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
      setAnimTimer(() => {
        if (onFinalizar) onFinalizar()
        else aposAnimacaoAtaque(atacante, alvo, resultado)
      }, 200)
    }, 300)
  }

  function projetilAttackAnim(atacante, alvo, resultado, onFinalizar) {
    const origem = atacante.posicao
    const destino = alvo.posicao
    const steps = getHexLine(origem.row, origem.col, destino.row, destino.col)
    console.log('[DEBUG] animarAtaqueProjetil', { origem, destino, stepsLength: steps.length })
    if (steps.length === 0) {
      console.warn('[DEBUG] animarAtaqueProjetil: steps vazio, chamando onFinalizar direto')
      if (onFinalizar) onFinalizar()
      else aposAnimacaoAtaque(atacante, alvo, resultado)
      return
    }
    setProjectilePath(steps)
    let stepIdx = 0
    let maxIter = steps.length * 2
    function avancarProjetil() {
      if (stepIdx >= steps.length || stepIdx >= maxIter) {
        console.log('[DEBUG] avancarProjetil: finalizado', { stepIdx, stepsLength: steps.length, finalizou: stepIdx >= steps.length })
        setProjectilePos(null)
        setProjectilePath([])
        if (onFinalizar) onFinalizar()
        else aposAnimacaoAtaque(atacante, alvo, resultado)
        return
      }
      setProjectilePos({ row: steps[stepIdx].row, col: steps[stepIdx].col })
      setProjectilePath(prev => prev.filter((_, i) => i > 0))
      stepIdx++
      setAnimTimer(avancarProjetil, 320)
    }
    avancarProjetil()
  }

  function aposAnimacaoAtaque(atacante, alvo, resultado) {
    setProjectilePos(null)
    clearAnimTimers()
    const danoBase = resultado.criticoDefensivo ? 0 : Math.max(1, resultado.dano || 1)
    let danoTotal = danoBase
    if (resultado.criticoDefensivo) {
      addLog(`  🛡️ ${t('prototype.arena_testbed.log_blocked')}`)
      addBalao(alvo.id, 'CRÍTICO DEF!', 'block', alvo.posicao?.row, alvo.posicao?.col)
    } else {
      addLog(`  💥 ${alvo.nome} recebeu ${danoBase} de dano!`)
    }
    if (resultado.criticoDefensivo) {
      adicionarFloatTexto(alvo.id, t('prototype.arena_testbed.float_blocked'), '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
    }
    if (resultado.criticoDefensivo) {
      setAnimTimer(() => {
        const contra = resolverContraAtaque(alvo, atacante, resultado.fa / 2)
        contra.logs.forEach(l => addLog(`  ↺ ${l}`))
        if (contra.dano > 0) {
          applyDanoEffect(atacante.id, contra.dano, alvo)
          adicionarFloatTexto(atacante.id, t('prototype.arena_testbed.float_contra'), '#ff8800', atacante.posicao?.row, atacante.posicao?.col)
          addLog(`  ${atacante.nome} recebe ${contra.dano} de dano do contra-ataque!`)
        }
        if (resultado.ataqueExtra) {
          setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa, danoTotal), 600)
        } else {
          if (danoTotal > 0) applyDanoEffect(alvo.id, danoTotal, atacante)
          setAnimTimer(() => {
            const hpAtacante = engine.utils.getCharacters().find(c => c.id === atacante.id)?.hp ?? 0
            if (hpAtacante <= 0) {
              console.log('[INV-HP] syncCharacters chamado', { caller: 'aposAnimacaoAtaque-death', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
              engine.utils.syncCharacters(prev => prev.map(c =>
                c.id === atacante.id ? { ...c, vivo: false } : c
              ))
              console.log('[INV-HP] syncCharacters resultado', { caller: 'aposAnimacaoAtaque-death', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
              tc.marcarMorto(atacante.id)
              addLog(`💀 ${atacante.nome} foi derrotado pelo contra-ataque!`)
              setAnimating(false)
              animatingRef.current = false
              if (!verificarVitoria()) finalizarTurno()
            } else {
              finalizarAposAtaque(alvo, resultado)
            }
          }, 400)
        }
      }, 500)
    } else {
      if (resultado.ataqueExtra) {
        setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa, danoTotal), 600)
      } else {
        if (danoTotal > 0) applyDanoEffect(alvo.id, danoTotal, atacante)
        setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
      }
    }
  }

  function adicionarFloatTexto(charId, texto, cor, row, col) {
    let tipo = 'block'
    if (cor === '#ffcc00') tipo = 'extra'
    else if (cor === '#ff8800') tipo = 'contra'
    else if (cor === '#4488ff') tipo = 'block'
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const sz = sizeRef.current
    const center = hexCenter(row, col, padRef.current.x, padRef.current.y, sz)
    const scaleX = rect.width / canvas.width
    const scaleY = rect.height / canvas.height
    const containerRect = canvasContainerRef.current?.getBoundingClientRect()
    const balaoX = center.x * scaleX + rect.left - (containerRect?.left ?? 0)
    const balaoY = center.y * scaleY + rect.top - (containerRect?.top ?? 0) - sz * 0.8
    const key = Date.now() + Math.random()
    setBalloons(prev => [...prev, { id: key, x: balaoX, y: balaoY, texto, tipo, key }])
    setTimeout(() => { setBalloons(prev => prev.filter(b => b.key !== key)) }, 1300)
  }

  function executarAtaque(target) {
    if (!currentChar || animating || inputLockedRef.current) return
    if (!tc.podeAgir(currentChar.id, TipoAcao.ATACAR)) return
    clearAnimTimers()
    animatingRef.current = true
    lockInput()
    setAnimating(true)
    setAttackCells([])

    let atacanteFinal = currentChar
    const poderesAtivos = getPoderesPorId(poderesEscolhidos[currentChar.id] || currentChar.poderesEscolhidos || [])

    if (powerAttackMode) {
      const poder = poderesAtivos.find(p => p.gatilho === 'ataque')
        if (poder && currentChar.mp >= poder.custoMP) {
          console.log('[INV-HP] syncCharacters chamado', { caller: 'executarAtaque-power', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
          engine.utils.syncCharacters(prev => prev.map(c =>
            c.id === currentChar.id ? { ...c, mp: c.mp - poder.custoMP } : c
          ))
          console.log('[INV-HP] syncCharacters resultado', { caller: 'executarAtaque-power', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
          atacanteFinal = executarMecanica(poder.mecanicaId, poder.params, { atacante: currentChar })
          addLog(`⚡ ${currentChar.nome} usou ${t('prototype.arena_testbed.' + poder.chaveI18n)}!`)
        }
      setPowerAttackMode(false)
    }

    const d6Val = rolarD6()
    setD6Result(d6Val)
    const dist = distanciaHex(currentChar.posicao, target.posicao)
    const resultado = resolverAtaque(atacanteFinal, target, Math.ceil(dist))
    addLog(`⚔️ ${currentChar.nome} ataca ${target.nome}!`)
    resultado.logs.forEach(l => addLog(`  ${l}`))
    if (currentChar.tipoAtaque === 'melee') {
      meleeAttackAnim(currentChar, target, resultado)
    } else {
      projetilAttackAnim(currentChar, target, resultado)
    }
  }
  executarAtaqueRef.current = executarAtaque

  function handleAtaqueExtra(atacante, alvo, faBase, danoAcumulado = 0) {
    const faExtra = Math.round((faBase / 2) * 10) / 10
    addLog(`⚡ ATAQUE EXTRA! FA = ${faExtra}`)
    adicionarFloatTexto(atacante.id, t('prototype.arena_testbed.float_extra'), '#ffcc00', atacante.posicao?.row, atacante.posicao?.col)

    const d6Def = rolarD6()
    const isCriticoDefExtra = d6Def === 6
    const fd = calcularFD(alvo, isCriticoDefExtra, d6Def)
    addLog(`  🎲 ${alvo.nome} FD extra: ARM=${alvo.arm} AGI=${alvo.agi} d6=${d6Def}${isCriticoDefExtra ? ' [CRÍTICO DEFENSIVO]' : ''} → FD=${fd}`)

    if (isCriticoDefExtra) {
      addLog(`  🛡️ ${alvo.nome} defendeu criticamente o ataque extra!`)
      adicionarFloatTexto(alvo.id, t('prototype.arena_testbed.float_blocked'), '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
      if (danoAcumulado > 0) applyDanoEffect(alvo.id, danoAcumulado, atacante)
      finalizarAposAtaque(alvo, { dano: 0 })
    } else {
      const danoExtra = Math.max(1, Math.round(faExtra - fd))
      danoAcumulado += danoExtra
      addLog(`  💥 Dano extra: ${danoExtra}`)
      applyDanoEffect(alvo.id, danoAcumulado, atacante)
      finalizarAposAtaque(alvo, { dano: danoExtra })
    }
  }

  function finalizarAposAtaque(alvo, resultado) {
    setAnimating(false)
    animatingRef.current = false
    setD6Result(null)
    clearAnimTimers()
    lockInput()

    if (winnerRef.current) return

    const hpAtual = engine.utils.getCharacters().find(c => c.id === alvo.id)?.hp ?? 0
    if (hpAtual <= 0) {
      console.log('[INV-HP] syncCharacters chamado', { caller: 'finalizarAposAtaque-death', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
      engine.utils.syncCharacters(prev => prev.map(c =>
        c.id === alvo.id ? { ...c, vivo: false } : c
      ))
      console.log('[INV-HP] syncCharacters resultado', { caller: 'finalizarAposAtaque-death', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
      tc.marcarMorto(alvo.id)
        addLog(`💀 ${alvo.nome} foi derrotado!`)
      setAnimTimer(() => {
        if (verificarVitoria()) return
        setTurnoAcoes(prev => ({ ...prev, atacou: true }))
        tc.registrarAcao(currentChar.id, TipoAcao.ATACAR)
        setSubPhase('free')
        setHighlightedCells([])
        setAttackCells([])
        setRangeCells([])
        setTimeout(() => {
          unlockInput(0)
        }, 1500)
      }, 1200)
    } else {
      setAnimTimer(() => {
        setTurnoAcoes(prev => ({ ...prev, atacou: true }))
        tc.registrarAcao(currentChar.id, TipoAcao.ATACAR)
        setSubPhase('free')
        setHighlightedCells([])
        setAttackCells([])
        setRangeCells([])
        setTimeout(() => {
          unlockInput(0)
        }, 1500)
      }, 800)
    }
  }

  function usarItem(tipo) {
    if (!currentChar || animating || inputLockedRef.current) return
    const key = tipo === 'hp' ? 'pocaoHP' : 'pocaoMP'
    const qty = currentChar.inventario?.[key] || 0
    if (qty <= 0) return
    console.log('[INV-HP] syncCharacters chamado', { caller: 'usarItem-potion', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
    engine.utils.syncCharacters(prev =>
      prev.map(c => {
        if (c.id !== currentChar.id) return c
        const newQty = (c.inventario?.[key] || 0) - 1
        const max = tipo === 'hp' ? c.hpMax : c.mpMax
        const newVal = Math.min(max, (tipo === 'hp' ? c.hp : c.mp) + 5)
        return {
          ...c,
          [tipo === 'hp' ? 'hp' : 'mp']: newVal,
          inventario: { ...c.inventario, [key]: newQty },
        }
      })
    )
    console.log('[INV-HP] syncCharacters resultado', { caller: 'usarItem-potion', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
    addLog(`💊 ${currentChar.nome} usou Poção ${tipo === 'hp' ? 'HP' : 'MP'}! (+5)`)
    finalizarTurno()
  }

  function addLog(text) {
    setBattleLog(prev => [...prev, { text, time: Date.now() }])
  }

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
            <div className="atb-ordering-title">ORDEM DE ATAQUE — SEU TIME</div>
            <div className="atb-ordering-subtitle">
              Reordene os personagens com mesma AGI usando as setas
            </div>
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
                      <button
                        className="atb-ordering-btn"
                        disabled={!isMovable || idx === 0 || playerTeamOrder[idx - 1].agi !== ch.agi}
                        onClick={() => {
                          const novo = [...playerTeamOrder]
                          ;[novo[idx - 1], novo[idx]] = [novo[idx], novo[idx - 1]]
                          set.setPlayerTeamOrder(novo)
                        }}
                      >▲</button>
                      <button
                        className="atb-ordering-btn"
                        disabled={!isMovable || idx === playerTeamOrder.length - 1 || playerTeamOrder[idx + 1].agi !== ch.agi}
                        onClick={() => {
                          const novo = [...playerTeamOrder]
                          ;[novo[idx], novo[idx + 1]] = [novo[idx + 1], novo[idx]]
                          set.setPlayerTeamOrder(novo)
                        }}
                      >▼</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <button className="atb-ordering-confirm" onClick={() => actions.confirmarOrdemInterna(playerTeamOrder)}>
              ✓ CONFIRMAR ORDEM
            </button>
          </div>
        </div>
      )}
    <div className={`atb-root ${shaking ? 'atb-shake' : ''}`}>
      {flashDmg && <div className="atb-flash-overlay" />}
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
              engine.actions.confirmarEscolhaAtaque(op)
            }
          }}
        />
      )}

      {turnAnnouncement && (
        <div className="atb-announcement-overlay">
          <div className={`atb-announcement-text ${announcementClass}`}>
            {turnAnnouncement}
          </div>
        </div>
      )}

      {defensePending && (() => {
        const poderesDefesa = getPoderesPorId(poderesEscolhidos[defensePending.alvo.id] || defensePending.alvo.poderesEscolhidos || [])
          .filter(p => p.gatilho === 'defesa' && defensePending.alvo.mp >= p.custoMP)
        const opcoes = [
          { rotulo: t('prototype.arena_testbed.pcm_sem_poder'), poderId: null, custoMP: 0, disponivel: true },
          ...poderesDefesa.map(p => ({
            rotulo: `${t('prototype.arena_testbed.' + p.chaveI18n)} (-${p.custoMP} MP)`,
            poderId: p.id,
            custoMP: p.custoMP,
            disponivel: true,
          })),
        ]
        return (
          <PowerChoiceModal
            mode="defesa"
            charName={defensePending.alvo.nome}
            faBruto={defensePending.faBruto}
            opcoes={opcoes}
            onEscolher={(op) => {
              setDefensePending(null)
              const bonus = op.poderId ? 2 : 0
              defesaBonusRef.current = bonus
              if (bonus > 0) {
                console.log('[INV-HP] syncCharacters chamado', { caller: 'defensePending-mp', hpAntes: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })), snapshot: 'reducer' })
                engine.utils.syncCharacters(prev => prev.map(c =>
                  c.id === defensePending.alvo.id ? { ...c, mp: c.mp - 3 } : c
                ))
                console.log('[INV-HP] syncCharacters resultado', { caller: 'defensePending-mp', hpDepois: engine.utils.getCharacters().map(c => ({ id: c.id, hp: c.hp })) })
                addLog(`🛡️ ${defensePending.alvo.nome} usou Defesa+2! (-3 MP)`)
              }
              defensePending.onResolve(bonus)
            }}
          />
        )
      })()}

      {danoPopup && (
        <div className="atb-dano-popup" key={danoPopup.key}>
          <div className="atb-dano-popup-num">-{danoPopup.dano}</div>
        </div>
      )}

      {attackBanner && (
        <div className="atb-attack-banner">
          <div className="atb-attack-banner-text">{attackBanner.texto}</div>
        </div>
      )}

      {actionPanel && isPlayerTurn && subPhase === 'free' && currentChar && !inputLocked && (
        <div className="atb-action-panel">
          <div className="atb-action-panel-name">{currentChar.nome}</div>
          <button
            className="atb-action-panel-btn"
            disabled={turnoAcoes.moveu}
            onClick={actions.iniciarMovimento}
          >
            👟 {t('prototype.arena_testbed.btn_move')}
          </button>
          <button
            className="atb-action-panel-btn atb-action-panel-btn--attack"
            disabled={turnoAcoes.atacou}
            onClick={actions.escolherTipoAtaque}
          >
            ⚔ {t('prototype.arena_testbed.btn_attack')}
          </button>
          {currentChar?.inventario?.pocaoHP > 0 && (
            <button
              className="atb-action-panel-btn atb-action-panel-btn--hp"
              onClick={() => actions.usarItem('hp')}
            >
              ❤ ×{currentChar.inventario.pocaoHP}
            </button>
          )}
          {currentChar?.inventario?.pocaoMP > 0 && (
            <button
              className="atb-action-panel-btn atb-action-panel-btn--mp"
              onClick={() => actions.usarItem('mp')}
            >
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
              <span className="atb-top-subphase"> · {subPhaseLabel}</span>
            )}
            {iaThinking && ` · ${t('prototype.arena_testbed.ia_thinking_short')}`}
          </span>
        </div>
        <button className="atb-top-log-btn" onClick={() => setLogDrawerOpen(true)}>≡</button>
      </div>

      <div className="atb-canvas-wrap" ref={canvasContainerRef}>
        <canvas ref={canvasRef} className="atb-canvas" onClick={handleCanvasClick} onTouchEnd={handleTouch} />
        <div className="atb-balloon-container">
          {balloons.map(b => (
            <div
              key={b.key}
              className={`atb-balloon atb-balloon--${b.tipo}`}
              style={{ '--x': `${b.x}px`, '--y': `${b.y}px` }}
            >
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
          const dotColor = ch.aparencia?.cor || (isPlayer ? '#00ff88' : '#ff2244')
          return (
            <div
              key={ch.id}
              className={`atb-hud-chip ${isActive ? 'atb-hud-chip--active' : ''}`}
              onClick={() => setCharModal(ch)}
            >
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
              <>
                <button className="atb-action-btn atb-action-btn--cancel" onClick={actions.cancelarAcao}>
                  × {t('prototype.arena_testbed.btn_cancel')}
                </button>
              </>
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
            <div className="atb-drawer-list" ref={drawerListRef}>
              {battleLog.slice(-30).map((entry, i) => (
                <div key={i} className="atb-drawer-entry">{entry.text}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {charModal && (
        <div className="atb-modal-overlay" onClick={() => setCharModal(null)}>
          <div className="atb-modal" onClick={e => e.stopPropagation()}>
            <div className="atb-modal-header">
              <div className={`atb-modal-dot ${charModal.time}`} />
              <span className="atb-modal-name">{charModal.nome}</span>
              <button className="atb-modal-close" onClick={() => setCharModal(null)}>✕</button>
            </div>
            <div className="atb-modal-body">
              <div className="atb-modal-stat">
                <span className="atb-modal-stat-label hp">{t('prototype.arena_testbed.label_hp')}</span>
                <div className="atb-modal-bar-track">
                  <div className="atb-modal-bar-fill hp" style={{ '--pct': `${(charModal.hp / charModal.hpMax) * 100}%` }} />
                </div>
                <span className="atb-modal-stat-val">{Math.ceil(charModal.hp)}/{charModal.hpMax}</span>
              </div>
              <div className="atb-modal-stat">
                <span className="atb-modal-stat-label mp">{t('prototype.arena_testbed.label_mp')}</span>
                <div className="atb-modal-bar-track">
                  <div className="atb-modal-bar-fill mp" style={{ '--pct': `${(charModal.mp / charModal.mpMax) * 100}%` }} />
                </div>
                <span className="atb-modal-stat-val">{Math.ceil(charModal.mp)}/{charModal.mpMax}</span>
              </div>
              <div className="atb-modal-attr-row">
                <span>{t('prototype.arena_testbed.attr_forca')}: {charModal.forca}</span>
                <span>{t('prototype.arena_testbed.attr_agi')}: {charModal.agi}</span>
                <span>{t('prototype.arena_testbed.attr_dex')}: {charModal.dex}</span>
              </div>
              <div className="atb-modal-attr-row">
                <span>{t('prototype.arena_testbed.attr_pdf')}: {charModal.pdf}</span>
                <span>{t('prototype.arena_testbed.attr_res')}: {charModal.res}</span>
                <span>{t('prototype.arena_testbed.attr_arm')}: {charModal.arm}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
