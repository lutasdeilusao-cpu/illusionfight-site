import { useState, useRef, useEffect, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import * as PIXI from 'pixi.js'
import {
  resolverAtaque, resolverContraAtaque, rolarD6,
  getCasasMovimento, getChanceAcerto,
} from '../engine/combat'
import { getCelulasAlcance, getCelulasAtaque, distanciaHex, encontrarCaminho, getHexLine } from '../engine/hexUtils'
import { decidirAcaoIA } from '../engine/ai'
import {
  createPixiApp, hexCenter, hexCorners, canvasSize,
  COLORS, obsIcon, itemIcon,
  spawnDamageFloat, spawnTextFloat, spawnMeleeParticles,
  spawnProjectile, screenFlash,
} from '../engine/pixiRenderer'
import JokenpoModal from './JokenpoModal'
import './Phase3Combat.css'

const SQRT3 = Math.sqrt(3)

/** Nomes das subfases do turno do jogador */
const SUB_PHASES = ['movimento', 'ataque', 'item']

export default function Phase3Combat({ boardState, onBackToPhase1 }) {
  const { t } = useLanguage()
  const pixiContainerRef = useRef(null)
  const appRef = useRef(null)
  const boardLayerRef = useRef(null)
  const effectsLayerRef = useRef(null)
  const canvasContainerRef = useRef(null)

  const { boardChars, obstaculos, itensChao, cols, rows, agiUmPraUm = false } = boardState

  // Combat state
  const [characters, setCharacters] = useState(() =>
    boardChars.map(bc => ({
      ...bc.charData,
      posicao: { row: bc.row, col: bc.col },
      vivo: true,
    }))
  )
  const [turnOrder, setTurnOrder] = useState([])
  const [currentTurn, setCurrentTurn] = useState(0)
  const [phase, setPhase] = useState('prepare')
  const [subPhase, setSubPhase] = useState(null)
  const [highlightedCells, setHighlightedCells] = useState([])
  const [attackCells, setAttackCells] = useState([])
  const [rangeCells, setRangeCells] = useState([])
  const [subPhaseStep, setSubPhaseStep] = useState(null)
  const [projectilePath, setProjectilePath] = useState([])
  const [battleLog, setBattleLog] = useState([])
  const [winner, setWinner] = useState(null)
  const [jokenpoNeeded, setJokenpoNeeded] = useState(null)
  const [pendingJokenpo, setPendingJokenpo] = useState([])
  const [animating, setAnimating] = useState(false)
  const [d6Result, setD6Result] = useState(null)
  const [itensChaoAtual, setItensChaoAtual] = useState(itensChao || {})
  const [iaThinking, setIaThinking] = useState(false)
  const [turnoAcoes, setTurnoAcoes] = useState({ moveu: false, atacou: false })

  // ── Mobile UI state ────────────────────────────
  const [hexSize, setHexSize] = useState(0)
  const [logDrawerOpen, setLogDrawerOpen] = useState(false)
  const [charModal, setCharModal] = useState(null)
  const [pendingMove, setPendingMove] = useState(null)
  const drawerListRef = useRef(null)

  // ── Destino escolhido / caminho highlight ──────
  const [destinoEscolhido, setDestinoEscolhido] = useState(null)
  const [caminhoEscolhido, setCaminhoEscolhido] = useState([])

  // ── Auto-scroll do log drawer ──────────────────
  useEffect(() => {
    if (logDrawerOpen && drawerListRef.current) {
      drawerListRef.current.scrollTop = drawerListRef.current.scrollHeight
    }
  }, [battleLog, logDrawerOpen])

  // ── Dynamic hexSize + Pixi initialization ──
  useEffect(() => {
    const el = pixiContainerRef.current
    if (!el) return

    function calcAndInit() {
      const containerW = el.clientWidth || 360
      const parentH = el.parentElement?.clientHeight || 0
      const containerH = el.clientHeight > 0
        ? el.clientHeight
        : parentH > 0
          ? parentH
          : Math.floor(window.innerHeight * 0.55)

      // DIAGNÓSTICO — remover após fix confirmado
      console.log('[ATB] calcAndInit', {
        elClientW: el.clientWidth,
        elClientH: el.clientHeight,
        parentClientH: el.parentElement?.clientHeight,
        windowInnerH: window.innerHeight,
        containerW,
        containerH,
        appExists: !!appRef.current,
      })

      const sizeByWidth  = Math.floor((containerW / (cols + 0.5)) / SQRT3)
      const sizeByHeight = Math.floor(containerH / (rows * 1.5 + 0.5))
      const sz = Math.max(18, Math.min(36, Math.min(sizeByWidth, sizeByHeight)))

      console.log('[ATB] hexSize calculado', { sizeByWidth, sizeByHeight, sz })

      setHexSize(sz)

      if (appRef.current) {
        const { width, height } = canvasSize(cols, rows, sz)
        appRef.current.renderer.resize(width, height)
      } else {
        const { width, height } = canvasSize(cols, rows, sz)
        console.log('[ATB] criando Pixi app', { width, height, sz })
        const app = createPixiApp(el, width, height)
        appRef.current = app

        const boardLayer = new PIXI.Container()
        app.stage.addChild(boardLayer)
        boardLayerRef.current = boardLayer

        const effectsLayer = new PIXI.Container()
        app.stage.addChild(effectsLayer)
        effectsLayerRef.current = effectsLayer

        app.view.addEventListener('click', handleCanvasEventPixi)
        app.view.addEventListener('touchend', handleTouchPixi, { passive: false })
      }
    }

    calcAndInit()
    const ro = new ResizeObserver(calcAndInit)
    ro.observe(el)
    window.addEventListener('resize', calcAndInit)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', calcAndInit)
      if (appRef.current) {
        appRef.current.view.removeEventListener('click', handleCanvasEventPixi)
        appRef.current.view.removeEventListener('touchend', handleTouchPixi)
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }
    }
  }, [cols, rows]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Animation state ─────────────────────────────
  const [movementPath, setMovementPath] = useState(null) // { charId, steps: [{row,col}], current: 0 }
  const [attackAnim, setAttackAnim] = useState(null) // { type, attackerId, targetId, phase, progress }
  const [damageFlash, setDamageFlash] = useState({}) // { [charId]: flashCount }
  const [projectilePos, setProjectilePos] = useState(null) // { x, y } during projectile anim
  const animatingRef = useRef(false)
  const animTimersRef = useRef([])

  function clearAnimTimers() {
    animTimersRef.current.forEach(t => clearTimeout(t))
    animTimersRef.current = []
  }

  function setAnimTimer(fn, delay) {
    const id = setTimeout(fn, delay)
    animTimersRef.current.push(id)
    return id
  }

  // FIX 5: usar refs para evitar closures obsoletas na IA
  const charsRef = useRef(characters)
  const turnRef = useRef(currentTurn)
  const orderRef = useRef(turnOrder)
  useEffect(() => { charsRef.current = characters }, [characters])
  useEffect(() => { turnRef.current = currentTurn }, [currentTurn])
  useEffect(() => { orderRef.current = turnOrder }, [turnOrder])

  // Remaining movement for current char
  const [remainingMove, setRemainingMove] = useState(0)

  // Initialize turn order
  useEffect(() => {
    const alive = characters.filter(c => c.vivo)
    const sorted = [...alive].sort((a, b) => b.agi - a.agi)

    // Check for ties
    const agiGroups = {}
    sorted.forEach(ch => {
      if (!agiGroups[ch.agi]) agiGroups[ch.agi] = []
      agiGroups[ch.agi].push(ch)
    })

    const ties = Object.values(agiGroups).filter(g => g.length > 1)

    setTimeout(() => {
      if (ties.length > 0) {
        setPendingJokenpo(ties)
        setJokenpoNeeded(ties[0])
      } else {
        const order = sorted.map(ch => ch.id)
        setTurnOrder(order)
        startPlayerTurn(order, 0)
      }
    }, 0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleJokenpoResult(winnerName) {
    const tieGroup = jokenpoNeeded
    const remaining = pendingJokenpo.slice(1)
    setPendingJokenpo(remaining)
    setJokenpoNeeded(null)

    if (!remaining.length) {
      const alive = characters.filter(c => c.vivo)
      const sorted = [...alive].sort((a, b) => b.agi - a.agi)
      setTurnOrder(sorted.map(ch => ch.id))
      startPlayerTurn(sorted.map(ch => ch.id), 0)
    } else {
      setTimeout(() => setJokenpoNeeded(remaining[0]), 500)
    }
  }

  /** Inicia o turno de um jogador — seta ordem, índice e entra na subfase de movimento */
  function startPlayerTurn(order, startIndex) {
    setTurnOrder(order)
    setCurrentTurn(startIndex)
    const firstChar = characters.find(c => c.id === order[startIndex])
    if (firstChar?.time === 'ia') {
      setPhase('enemy_turn')
      setTimeout(() => executarIA(firstChar), 1000)
    } else if (firstChar) {
      setPhase(null)
      setTurnoAcoes({ moveu: false, atacou: false })
      setSubPhase('free')
      setHighlightedCells([])
      setAttackCells([])
      setRangeCells([])
    }
  }

/** Entra em uma subfase do turno (movimento ou acao) */
  function enterSubPhase(sub, char) {
    if (!char) return
    if (sub === 'movimento') {
      const mov = getCasasMovimento(char.agi, agiUmPraUm)
      const moveCells = getCelulasAlcance(
        char.posicao.row, char.posicao.col,
        mov,
        cols, rows, obstaculos
      )
      const freeCells = moveCells.filter(c => {
        const occupied = characters.some(ch =>
          ch.vivo && ch.id !== char.id && ch.posicao?.row === c.row && ch.posicao?.col === c.col
        )
        const hasObstacle = obstaculos[`${c.row}_${c.col}`]?.tipo === 1
        return !occupied && !hasObstacle
      })
      setHighlightedCells(freeCells)
      setAttackCells([])
      setRemainingMove(mov)
      setSubPhase('movimento')
      setPhase(null)
    } else if (sub === 'acao') {
      // FIX 2: primeiro mostra menu de ações, depois de escolher mostra alcance
      setHighlightedCells([])
      setAttackCells([])
      setRangeCells([])
      setSubPhaseStep('escolher_acao')
      setSubPhase('acao')
      setPhase(null)
    }
  }

  const currentChar = useMemo(() => {
    if (turnOrder.length === 0) return null
    return characters.find(c => c.id === turnOrder[currentTurn])
  }, [characters, turnOrder, currentTurn])

  const isPlayerTurn = currentChar?.time === 'jogador'

  /** Label traduzido da subfase */
  const subPhaseLabel = useMemo(() => {
    if (!subPhase) return ''
    if (subPhase === 'free') return t('prototype.arena_testbed.free_turn_hint')
    if (subPhase === 'movimento') return t('prototype.arena_testbed.subphase_move')
    return t('prototype.arena_testbed.subphase_action')
  }, [subPhase, t])

  // ── Render Board with Pixi ──────────────────────
  useEffect(() => {
    renderBoardPixi()
  }, [characters, obstaculos, itensChaoAtual, cols, rows, highlightedCells, attackCells, rangeCells, currentChar, damageFlash, projectilePos, projectilePath, hexSize, caminhoEscolhido, destinoEscolhido])

  function renderBoardPixi() {
    const app = appRef.current
    const layer = boardLayerRef.current
    console.log('[ATB] renderBoardPixi', { hasApp: !!app, hasLayer: !!layer, hexSize })
    if (!app || !layer) return

    layer.removeChildren()

    const sz = hexSize
    const { padX, padY } = canvasSize(cols, rows, sz)

    const hlSet    = new Set(highlightedCells.map(c => `${c.row}_${c.col}`))
    const atkSet   = new Set(attackCells.map(c => `${c.row}_${c.col}`))
    const rangeSet = new Set(rangeCells.map(c => `${c.row}_${c.col}`))
    const destSet  = new Set(caminhoEscolhido.map(c => `${c.row}_${c.col}`))
    const destKey  = destinoEscolhido ? `${destinoEscolhido.row}_${destinoEscolhido.col}` : null

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const { x: cx, y: cy } = hexCenter(row, col, padX, padY, sz)
        const key = `${row}_${col}`
        const obs  = obstaculos[key]
        const item = itensChaoAtual[key]
        const ch   = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)

        let fillColor   = COLORS.hexBase
        let strokeColor = COLORS.hexStroke
        let strokeWidth = 1.5

        if (obs) {
          const colors = { 1: COLORS.obsWall, 2: COLORS.obsHole, 3: COLORS.obsTrap, 4: COLORS.obsBox }
          fillColor = colors[obs.tipo] || COLORS.obsWall
          strokeColor = 0x444444
        } else if (item) {
          fillColor   = item.tipo === 'hp' ? COLORS.itemHP : COLORS.itemMP
          strokeColor = item.tipo === 'hp' ? COLORS.hexHighStroke : 0x42a5f5
        }

        if (atkSet.has(key)) {
          fillColor = COLORS.hexAtk; strokeColor = COLORS.hexAtkStroke
        } else if (rangeSet.has(key)) {
          fillColor = COLORS.hexRange; strokeColor = COLORS.hexRangeStroke
        } else if (hlSet.has(key)) {
          fillColor = COLORS.hexHighlight; strokeColor = COLORS.hexHighStroke
        }

        if (destSet.has(key) && key !== destKey) {
          fillColor = COLORS.hexPath; strokeColor = COLORS.hexPathStroke
        }
        if (destKey && key === destKey) {
          fillColor = COLORS.hexDest; strokeColor = COLORS.hexDestStroke; strokeWidth = 2.5
        }

        const g = new PIXI.Graphics()
        const pts = hexCorners(cx, cy, sz)
        g.lineStyle(strokeWidth, strokeColor, 1)
        g.beginFill(fillColor)
        g.drawPolygon(pts)
        g.endFill()
        layer.addChild(g)

        if (obs && !ch) {
          const icon = new PIXI.Text(obsIcon(obs.tipo), { fontSize: 18 })
          icon.anchor.set(0.5, 0.5); icon.x = cx; icon.y = cy
          layer.addChild(icon)
        } else if (item && !ch && !obs) {
          const icon = new PIXI.Text(itemIcon(item.tipo), { fontSize: 16 })
          icon.anchor.set(0.5, 0.5); icon.x = cx; icon.y = cy
          layer.addChild(icon)
        } else if (!obs && !ch && !item) {
          const coord = new PIXI.Text(`${row},${col}`, { fontSize: 9, fill: 0x3a3a4a, fontFamily: 'monospace' })
          coord.anchor.set(0.5, 0.5); coord.x = cx; coord.y = cy + sz * 0.15
          layer.addChild(coord)
        }

        if (ch) {
          const isActive  = ch.id === currentChar?.id
          const flashOn   = damageFlash[ch.id] !== undefined && damageFlash[ch.id] % 2 === 0
          const fillC     = flashOn ? COLORS.flashFill : (ch.time === 'jogador' ? COLORS.playerFill : COLORS.iaFill)
          const strokeC   = isActive ? COLORS.activeStroke : (ch.time === 'jogador' ? COLORS.playerStroke : COLORS.iaStroke)
          const sWidth    = isActive ? 3 : 2

          const dot = new PIXI.Graphics()
          dot.lineStyle(sWidth, strokeC, 1)
          dot.beginFill(fillC)
          dot.drawCircle(cx, cy, sz * 0.55)
          dot.endFill()
          layer.addChild(dot)

          const label = new PIXI.Text(ch.emoji || ch.nome.charAt(0).toUpperCase(), {
            fontSize: Math.round(sz * 0.38),
            fill: 0xffffff,
            fontWeight: 'bold',
          })
          label.anchor.set(0.5, 0.5); label.x = cx; label.y = cy - 2
          layer.addChild(label)

          const barW = sz * 0.9
          const barBg = new PIXI.Graphics()
          barBg.beginFill(0x333333)
          barBg.drawRect(cx - barW / 2, cy + sz * 0.45, barW, 4)
          barBg.endFill()
          layer.addChild(barBg)

          const pct     = Math.max(0, ch.hp / ch.hpMax)
          const barColor = pct > 0.5 ? 0x4caf50 : pct > 0.25 ? 0xff9800 : 0xf44336
          const barFg = new PIXI.Graphics()
          barFg.beginFill(barColor)
          barFg.drawRect(cx - barW / 2, cy + sz * 0.45, barW * pct, 4)
          barFg.endFill()
          layer.addChild(barFg)
        }

        if (projectilePos && projectilePos.row === row && projectilePos.col === col) {
          const proj = new PIXI.Graphics()
          proj.beginFill(0xffcc00)
          proj.drawCircle(cx, cy, sz * 0.25)
          proj.endFill()
          proj.lineStyle(2, 0xff8800, 0.8)
          proj.drawCircle(cx, cy, sz * 0.35)
          layer.addChild(proj)
        }
      }
    }
  }

  // Handle touch on Pixi canvas
  function handleTouchPixi(e) {
    e.preventDefault()
    const touch = e.changedTouches[0]
    handleCanvasEventPixi({ clientX: touch.clientX, clientY: touch.clientY })
  }

  // Handle click on Pixi canvas
  function handleCanvasEventPixi(e) {
    const app = appRef.current
    if (!app || animating || animatingRef.current || !isPlayerTurn || iaThinking) return
    const rect = app.view.getBoundingClientRect()
    const scaleX = app.view.width / rect.width
    const scaleY = app.view.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY
    const sz = hexSize
    const { padX, padY } = canvasSize(cols, rows, sz)
    const hex = pixelToHex(mx, my, cols, rows, padX, padY, sz)
    if (!hex) return
    const { row, col } = hex

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
        setDestinoEscolhido({ row, col })
        setCaminhoEscolhido(cam ? cam.slice(1) : [{ row, col }])
        setPendingMove({ row, col })
      }
    } else if (subPhase === 'acao') {
      if (subPhaseStep === 'escolher_alvo' && attackCells.some(c => c.row === row && c.col === col)) {
        const target = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)
        if (target) executarAtaque(target)
      }
    }
  }

  function pixelToHex(px, py, cols, rows, padX, padY, size) {
    let closest = null
    let closestDist = Infinity
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const c = hexCenter(row, col, padX, padY, size)
        const dist = Math.sqrt((px - c.x) ** 2 + (py - c.y) ** 2)
        if (dist < closestDist && dist < size) {
          closestDist = dist
          closest = { row, col }
        }
      }
    }
    return closest
  }

  function moverPersonagem(row, col) {
    if (!currentChar || animating) return
    clearAnimTimers()

    // Limpa highlights de destino
    setDestinoEscolhido(null)
    setCaminhoEscolhido([])

    // 1. Encontra o caminho célula a célula
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
      // Fallback: movimento direto
      setCharacters(prev =>
        prev.map(c =>
          c.id === currentChar.id ? { ...c, posicao: { row, col } } : c
        )
      )
      setHighlightedCells([])
      setRemainingMove(0)
      aposMovimento(row, col)
      return
    }

    // Pula primeiro item que é a posição atual
    const steps = caminho.slice(1)
    animatingRef.current = true
    setAnimating(true)

    // Tira highlight imediatamente
    setHighlightedCells([])

    // Anima passo a passo
    let stepIdx = 0
    function avancarPasso() {
      if (stepIdx >= steps.length) {
        // Animação completa
        animatingRef.current = false
        setAnimating(false)
        setRemainingMove(0)
        aposMovimento(row, col)
        return
      }
      const passo = steps[stepIdx]
      setCharacters(prev =>
        prev.map(c =>
          c.id === currentChar.id ? { ...c, posicao: { row: passo.row, col: passo.col } } : c
        )
      )
      stepIdx++
      setAnimTimer(avancarPasso, 150)
    }
    setAnimTimer(avancarPasso, 50)
  }

  function aposMovimento(row, col) {
    if (!currentChar) return
    addLog(`[${currentChar.nome}] Moveu para (${row}, ${col})`)

    // FIX 3: Criar referência do char com posição já atualizada
    const charAtualizado = {
      ...currentChar,
      posicao: { row, col },
    }

    // Coleta item do chão
    const key = `${row}_${col}`
    if (itensChaoAtual[key]) {
      const item = itensChaoAtual[key]
      setCharacters(prev =>
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
      setItensChaoAtual(prev => { const n = { ...prev }; delete n[key]; return n })
      addLog(`[${currentChar.nome}] Coletou Poção ${item.tipo === 'hp' ? 'HP' : 'MP'} do chão!`)
    }

    // FIX 2: Volta ao estado livre com moveu=true
    setTurnoAcoes(prev => ({ ...prev, moveu: true }))
    setSubPhase('free')
    setHighlightedCells([])
  }

  // ── FIX 2: Ações livres do turno ──────────────────────
  function iniciarMovimento() {
    if (!currentChar || animating || turnoAcoes.moveu) return
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
  }

  function confirmarMovimento() {
    if (!pendingMove) return
    moverPersonagem(pendingMove.row, pendingMove.col)
    setPendingMove(null)
  }

  function pularMovimento() {
    if (!currentChar) return
    addLog(`[${currentChar.nome}] Pulou a fase de movimento.`)
    setHighlightedCells([])
    enterSubPhase('acao', currentChar)
  }

  // FIX 2: Escolher ação (menu) → mostrar alcance → clicar no alvo
  function escolherAcao(tipoAcao) {
    if (!currentChar || animating) return
    addLog(`[${currentChar.nome}] Escolheu: ${tipoAcao}`)

    const alcanceMax = currentChar.tipoAtaque === 'melee' ? 1 : currentChar.pdf
    const atkCells = getCelulasAtaque(
      currentChar.posicao.row, currentChar.posicao.col,
      currentChar.tipoAtaque, cols, rows,
      alcanceMax, obstaculos
    )

    // Todas as células no alcance (amarelo)
    setRangeCells(atkCells)

    // Células com inimigos (vermelho)
    const enemyCells = atkCells.filter(c =>
      characters.some(ch => ch.vivo && ch.time !== currentChar.time && ch.posicao?.row === c.row && ch.posicao?.col === c.col)
    )
    setAttackCells(enemyCells)
    setHighlightedCells([])
    setSubPhaseStep('escolher_alvo')
  }

  function pularAcao() {
    if (!currentChar) return
    addLog(`[${currentChar.nome}] Pulou a fase de ação.`)
    setAttackCells([])
    setRangeCells([])
    setSubPhaseStep(null)
    finalizarTurno()
  }

  function aplicarDano(alvoId, dano, donoDoAtaque) {
    if (dano <= 0) return

    const alvo = charsRef.current.find(c => c.id === alvoId)
    if (!alvo) return
    const novoHp = Math.max(0, alvo.hp - dano)

    charsRef.current = charsRef.current.map(c =>
      c.id === alvoId ? { ...c, hp: novoHp } : c
    )

    setCharacters(prev =>
      prev.map(c =>
        c.id === alvoId ? { ...c, hp: novoHp } : c
      )
    )

    // Pixi: Damage float
    const isCrit = false
    const sz = hexSize
    const { padX, padY } = canvasSize(cols, rows, sz)
    const pos = alvo.posicao
    if (pos && effectsLayerRef.current && appRef.current) {
      const { x, y } = hexCenter(pos.row, pos.col, padX, padY, sz)
      spawnDamageFloat(effectsLayerRef.current, x, y, dano, isCrit)
    }

    // Flash vermelho (3 pulsações)
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

  function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
    const sz = hexSize
    const { padX, padY } = canvasSize(cols, rows, sz)
    const origem  = atacante.posicao
    const destino = alvo.posicao
    const isCrit  = resultado.criticoOfensivo

    if (isCrit && effectsLayerRef.current && appRef.current) {
      const { width, height } = canvasSize(cols, rows, sz)
      screenFlash(effectsLayerRef.current, width, height, 0xff4444)
    }

    const dirRow  = destino.row - origem.row
    const dirCol  = destino.col - origem.col
    const meioRow = Math.round(origem.row + dirRow * 0.7)
    const meioCol = Math.round(origem.col + dirCol * 0.7)

    setCharacters(prev => prev.map(c =>
      c.id === atacante.id ? { ...c, posicao: { row: meioRow, col: meioCol } } : c
    ))

    setAnimTimer(() => {
      if (effectsLayerRef.current) {
        const { x, y } = hexCenter(destino.row, destino.col, padX, padY, sz)
        spawnMeleeParticles(effectsLayerRef.current, x, y, isCrit)
      }

      setCharacters(prev => prev.map(c =>
        c.id === atacante.id ? { ...c, posicao: origem } : c
      ))

      setAnimTimer(() => {
        if (onFinalizar) onFinalizar()
        else aposAnimacaoAtaque(atacante, alvo, resultado)
      }, 200)
    }, 300)
  }

  function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
    const sz = hexSize
    const { padX, padY } = canvasSize(cols, rows, sz)
    const { x: fromX, y: fromY } = hexCenter(atacante.posicao.row, atacante.posicao.col, padX, padY, sz)
    const { x: toX,   y: toY   } = hexCenter(alvo.posicao.row,    alvo.posicao.col,    padX, padY, sz)
    const isCrit = resultado.criticoOfensivo

    if (isCrit && effectsLayerRef.current && appRef.current) {
      const { width, height } = canvasSize(cols, rows, sz)
      screenFlash(effectsLayerRef.current, width, height, 0xffffff)
    }

    spawnProjectile(
      effectsLayerRef.current, fromX, fromY, toX, toY, isCrit,
      () => {
        if (onFinalizar) onFinalizar()
        else aposAnimacaoAtaque(atacante, alvo, resultado)
      }
    )
  }

  function aposAnimacaoAtaque(atacante, alvo, resultado) {
    setProjectilePos(null)
    clearAnimTimers()

    if (resultado.criticoDefensivo) {
      addLog(`  🛡️ ${t('prototype.arena_testbed.log_blocked')}`)
    } else {
      const danoFinal = Math.max(1, resultado.dano || 1)
      aplicarDano(alvo.id, danoFinal, atacante)
      addLog(`  💥 ${alvo.nome} ${t('prototype.arena_testbed.log_receives_damage', { dano: danoFinal })}`)
    }

    // FIX 4: Feedback visual de crítico defensivo
    if (resultado.criticoDefensivo) {
      adicionarFloatTexto(alvo.id, 'BLOQUEIO!', '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
    }

    if (resultado.criticoDefensivo) {
      setAnimTimer(() => {
        const contra = resolverContraAtaque(alvo, atacante, resultado.fa / 2)
        contra.logs.forEach(l => addLog(`  ↺ ${l}`))
        if (contra.dano > 0) {
          aplicarDano(atacante.id, contra.dano, alvo)
          // FIX 4: CONTRA! no atacante original
          adicionarFloatTexto(atacante.id, 'CONTRA!', '#ff8800', atacante.posicao?.row, atacante.posicao?.col)
          addLog(`  ${atacante.nome} recebe ${contra.dano} de dano do contra-ataque!`)
        }
        if (resultado.ataqueExtra) {
          setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa), 600)
        } else {
          setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
        }
      }, 500)
    } else {
      if (resultado.ataqueExtra) {
        setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa), 600)
      } else {
        setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
      }
    }
  }

  // FIX 4: Adiciona float de texto (bloqueio, extra, contra) via Pixi
  function adicionarFloatTexto(charId, texto, cor, row, col) {
    if (!effectsLayerRef.current || !appRef.current) return
    const sz = hexSize
    const { padX, padY } = canvasSize(cols, rows, sz)
    const { x, y } = hexCenter(row, col, padX, padY, sz)
    const colorMap = { '#4488ff': 0x4488ff, '#ff8800': 0xff8800, '#ffcc00': 0xffcc00 }
    const pixiColor = colorMap[cor] || 0xffffff
    spawnTextFloat(effectsLayerRef.current, x, y, texto, pixiColor)
  }

  function executarAtaque(target) {
    if (!currentChar || animating) return
    clearAnimTimers()
    animatingRef.current = true
    setAnimating(true)
    setAttackCells([])

    const d6Val = rolarD6()
    setD6Result(d6Val)

    const dist = distanciaHex(currentChar.posicao, target.posicao)
    const resultado = resolverAtaque(currentChar, target, Math.ceil(dist))

    addLog(`⚔️ ${currentChar.nome} ataca ${target.nome}!`)
    resultado.logs.forEach(l => addLog(`  ${l}`))

    if (currentChar.tipoAtaque === 'melee') {
      animarAtaqueMelee(currentChar, target, resultado)
    } else {
      animarAtaqueProjetil(currentChar, target, resultado)
    }
  }

  function handleAtaqueExtra(atacante, alvo, faBase) {
    const faExtra = Math.round((faBase / 2) * 10) / 10
    addLog(`⚡ ATAQUE EXTRA! FA = ${faExtra}`)
    // FIX 4: EXTRA! no atacante
    adicionarFloatTexto(atacante.id, 'EXTRA!', '#ffcc00', atacante.posicao?.row, atacante.posicao?.col)
    const danoExtra = Math.max(1, Math.round(faExtra - (alvo.arm + alvo.agi * 0.25)))
    if (danoExtra > 0) {
      aplicarDano(alvo.id, danoExtra, atacante)
      addLog(`  💥 Dano extra: ${danoExtra}`)
    }
    finalizarAposAtaque(alvo, { dano: danoExtra })
  }

  function finalizarAposAtaque(alvo, resultado) {
    setAnimating(false)
    animatingRef.current = false
    setD6Result(null)
    clearAnimTimers()

    // FIX 1: HP já foi atualizado por aplicarDano() mas ref pode estar desatualizado
    const hpAtual = charsRef.current.find(c => c.id === alvo.id)?.hp ?? 0
    if (hpAtual <= 0) {
      // Atualiza ref manualmente antes de verificar vitória
      charsRef.current = charsRef.current.map(c =>
        c.id === alvo.id ? { ...c, vivo: false } : c
      )
      setCharacters(charsRef.current)
      setTurnOrder(prev => prev.filter(id => id !== alvo.id))
      addLog(`💀 ${alvo.nome} foi derrotado!`)

      setAnimTimer(() => {
        if (verificarVitoria()) return
        finalizarTurno()
      }, 300)
    } else {
      // FIX 2: Volta ao estado livre com atacou=true
      setTurnoAcoes(prev => ({ ...prev, atacou: true }))
      setSubPhase('free')
      setHighlightedCells([])
      setAttackCells([])
      setRangeCells([])
    }
  }

  function usarItem(tipo) {
    if (!currentChar || animating) return
    const key = tipo === 'hp' ? 'pocaoHP' : 'pocaoMP'
    const qty = currentChar.inventario?.[key] || 0
    if (qty <= 0) return

    setCharacters(prev =>
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
    addLog(`💊 ${currentChar.nome} usou Poção ${tipo === 'hp' ? 'HP' : 'MP'}! (+5)`)
    finalizarTurno()
  }

  function verificarVitoria() {
    // FIX 2: Usa refs para garantir dados atualizados
    const chars = charsRef.current
    const pVivos = chars.filter(c => c.vivo && c.time === 'jogador')
    const iVivos = chars.filter(c => c.vivo && c.time === 'ia')
    if (pVivos.length === 0) { setWinner('ia'); setPhase('resultado'); addLog('🏆 IA venceu a partida!'); return true }
    if (iVivos.length === 0) { setWinner('jogador'); setPhase('resultado'); addLog('🏆 Jogador venceu a partida!'); return true }
    return false
  }

  function finalizarTurno() {
    if (verificarVitoria()) return

    setSubPhase(null)

    // FIX 5: usar refs para garantir valores atuais
    const order = orderRef.current
    const turnIdx = turnRef.current
    const nextIdx = (turnIdx + 1) % order.length
    const nextId = order[nextIdx]
    const chars = charsRef.current
    const nextChar = chars.find(c => c.id === nextId)

    setCurrentTurn(nextIdx)

    if (nextChar?.time === 'ia') {
      setPhase('enemy_turn')
      setTimeout(() => executarIA(nextChar), 1000)
    } else if (nextChar) {
      setPhase(null)
      setTurnoAcoes({ moveu: false, atacou: false })
      setSubPhase('free')
      setHighlightedCells([])
      setAttackCells([])
      setRangeCells([])
    }
  }

  // ── IA ─────────────────────────────────────────────
  function executarIA(iaChar) {
    setIaThinking(true)
    addLog(`🤖 Turno da IA: ${iaChar.nome}`)

    // Fase Movimento (delay 1s)
    setAnimTimer(() => {
      const charsAgora = charsRef.current
      const iaAtual = charsAgora.find(c => c.id === iaChar.id)
      if (!iaAtual || !iaAtual.vivo) {
        setIaThinking(false)
        finalizarTurno()
        return
      }
      addLog(`  ${iaChar.nome} — Fase: Movimento`)

      const inimigos = charsAgora.filter(c => c.vivo && c.time === 'jogador')

      // Mostrar opções de movimento disponíveis da IA por 1 segundo
      const movIA = getCasasMovimento(iaAtual.agi, agiUmPraUm)
      const moveCells = getCelulasAlcance(
        iaAtual.posicao.row, iaAtual.posicao.col,
        movIA,
        cols, rows, obstaculos
      )
      setHighlightedCells(moveCells)

      const dec = decidirAcaoIA(iaAtual, inimigos, charsAgora, obstaculos, cols, rows, itensChaoAtual, agiUmPraUm)

      setAnimTimer(() => {
        setHighlightedCells([])

        if (dec.tipo === 'andar') {
          const destino = { row: dec.detalhes.row, col: dec.detalhes.col }
          // Destacar célula escolhida
          setAttackCells([destino])

          // Animar movimento célula a célula
          const origem = iaAtual.posicao
          const ocupadasIA = new Set(
            charsAgora
              .filter(c => c.vivo && c.id !== iaChar.id)
              .map(c => `${c.posicao.row}_${c.posicao.col}`)
          )
          const caminho = encontrarCaminho(
            origem.row, origem.col, destino.row, destino.col,
            cols, rows, obstaculos, ocupadasIA
          )
          const steps = caminho ? caminho.slice(1) : [destino]

          let stepIdx = 0
          function avancarPassoIA() {
            if (stepIdx >= steps.length) {
              setAttackCells([])
              dec.logs.forEach(l => addLog(`  ${l}`))
              // Após animação, vai para fase de ação
              setAnimTimer(acaoIA, 300)
              return
            }
            const passo = steps[stepIdx]
            setCharacters(prev =>
              prev.map(c => c.id === iaChar.id ? { ...c, posicao: { row: passo.row, col: passo.col } } : c)
            )
            stepIdx++
            setAnimTimer(avancarPassoIA, 150)
          }
          setAnimTimer(avancarPassoIA, 400)
        } else {
          addLog(`  ${iaChar.nome} não se moveu.`)
          setAnimTimer(acaoIA, 1000)
        }
      }, 1800)
    }, 1500)

    function acaoIA() {
      const charsAgora2 = charsRef.current
      const iaAtual2 = charsAgora2.find(c => c.id === iaChar.id)
      if (!iaAtual2 || !iaAtual2.vivo) {
        setIaThinking(false)
        finalizarTurno()
        return
      }
      addLog(`  ${iaChar.nome} — Fase: Ação`)

      const inimigos2 = charsAgora2.filter(c => c.vivo && c.time === 'jogador')
      const dec2 = decidirAcaoIA(iaAtual2, inimigos2, charsAgora2, obstaculos, cols, rows, itensChaoAtual, agiUmPraUm)

      if (dec2.tipo === 'atacar') {
        const alvo = dec2.detalhes.alvo
        const res = dec2.detalhes.resultado
        const atacante = iaAtual2

        // FIX 3: IA mostra range visual antes de atacar
        const alcanceMaxIA = atacante.tipoAtaque === 'melee' ? 1 : atacante.pdf
        const rangeCellsIA = getCelulasAtaque(
          atacante.posicao.row, atacante.posicao.col,
          atacante.tipoAtaque, cols, rows,
          alcanceMaxIA, obstaculos
        )
        // Mostra range completo (amarelo) por 800ms
        setRangeCells(rangeCellsIA)
        setAttackCells([])

        const callbackFinal = () => {
          setProjectilePos(null)
          setProjectilePath([])
          if (res.criticoDefensivo) {
            addLog(`  🛡️ ${t('prototype.arena_testbed.log_blocked')}`)
            adicionarFloatTexto(atacante.id, 'BLOQUEIO!', '#4488ff', atacante.posicao?.row, atacante.posicao?.col)
          } else {
            const danoFinal = Math.max(1, res.dano || 1)
            aplicarDano(alvo.id, danoFinal, atacante)
            addLog(`  💥 ${alvo.nome} ${t('prototype.arena_testbed.log_receives_damage', { dano: danoFinal })}`)
          }
          const hpAtual = charsRef.current.find(c => c.id === alvo.id)?.hp ?? 0
          if (hpAtual <= 0) {
            charsRef.current = charsRef.current.map(c =>
              c.id === alvo.id ? { ...c, vivo: false } : c
            )
            setCharacters(charsRef.current)
            setTurnOrder(prev => prev.filter(id => id !== alvo.id))
            addLog(`💀 ${alvo.nome} foi derrotado!`)
            setAnimTimer(() => {
              if (verificarVitoria()) return
              finalizarTurnoIA()
            }, 300)
          } else {
            finalizarTurnoIA()
          }
        }

        // Range visual: 1200ms amarelo → 700ms alvo → ataque
        setAnimTimer(() => {
          setRangeCells([])
          setAttackCells([{ row: alvo.posicao.row, col: alvo.posicao.col }])

          setAnimTimer(() => {
            setRangeCells([])
            setAttackCells([])
            addLog(`  ${atacante.nome} ataca ${alvo.nome}!`)
            dec2.logs.forEach(l => addLog(`  ${l}`))

            if (atacante.tipoAtaque === 'melee') {
              animarAtaqueMelee(atacante, alvo, res, callbackFinal)
            } else {
              animarAtaqueProjetil(atacante, alvo, res, callbackFinal)
            }
          }, 700)
        }, 1200)
      } else {
        dec2.logs.forEach(l => addLog(`  ${l}`))
        setAnimTimer(finalizarTurnoIA, 500)
      }
    }

    function finalizarTurnoIA() {
      setProjectilePos(null)
      setProjectilePath([])
      setIaThinking(false)
      addLog(`  ✅ ${iaChar.nome} finalizou o turno.`)

      if (verificarVitoria()) return

      const order3 = orderRef.current
      const turnIdx3 = turnRef.current
      const nextIdx3 = (turnIdx3 + 1) % order3.length
      const nextId3 = order3[nextIdx3]
      const chars3 = charsRef.current
      const nextChar3 = chars3.find(c => c.id === nextId3)

      setCurrentTurn(nextIdx3)

      if (nextChar3?.time === 'ia') {
        setPhase('enemy_turn')
        setAnimTimer(() => executarIA(nextChar3), 1800)
      } else if (nextChar3) {
        setPhase(null)
        setTurnoAcoes({ moveu: false, atacou: false })
        setSubPhase('free')
        setHighlightedCells([])
        setAttackCells([])
        setRangeCells([])
      }
    }
  }

  function addLog(text) {
    setBattleLog(prev => [...prev, { text, time: Date.now() }])
  }

  // ── Render ─────────────────────────────────────────
  if (phase === 'prepare') {
    return (
      <div className="atb-phase-loading">
        <p>{t('prototype.arena_testbed.preparing_battle')}</p>
      </div>
    )
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
    <div className="atb-root">
      {jokenpoNeeded && (
        <JokenpoModal
          player1Name={jokenpoNeeded[0]?.nome || '?'}
          player2Name={jokenpoNeeded[1]?.nome || '?'}
          onResult={handleJokenpoResult}
        />
      )}

      {/* ── Status bar (fake, igual ao PP) ─────────── */}
      <div className="atb-status-bar">
        <span className="atb-status-time">
          {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="atb-status-icons">
          <span>📶</span><span>🔋</span>
        </div>
      </div>

      {/* ── Top Bar ────────────────────────────────── */}
      <div className="atb-top-bar">
        <button className="atb-top-back" onClick={onBackToPhase1}>←</button>
        <div className="atb-top-info">
          <span className="atb-top-turn">
            {currentChar
              ? `${t('prototype.arena_testbed.turn_of')} ${currentChar.nome}`
              : t('prototype.arena_testbed.preparing_battle')}
            {!iaThinking && isPlayerTurn && subPhase && (
              <span className="atb-top-subphase"> — {subPhaseLabel}</span>
            )}
            {iaThinking && ` (${t('prototype.arena_testbed.ia_thinking_short')})`}
          </span>
        </div>
        <button className="atb-top-log-btn" onClick={() => setLogDrawerOpen(true)} title={t('prototype.arena_testbed.log_btn')}>
          📋
        </button>
      </div>

      {/* ── Canvas Pixi ────────────────────────────── */}
      <div className="atb-canvas-wrap" ref={canvasContainerRef}>
        <div ref={pixiContainerRef} className="atb-pixi-container" />
      </div>

      {/* ── HUD — Chips de personagens ─────────────── */}
      <div className="atb-hud">
        {characters.filter(c => c.vivo).map(ch => {
          const isActive = ch.id === currentChar?.id
          return (
            <div
              key={ch.id}
              className={`atb-hud-chip ${isActive ? 'atb-hud-chip--active' : ''}`}
              onClick={() => setCharModal(ch)}
            >
              <div className={`atb-hud-dot ${ch.time}`} />
              <div className="atb-hud-info">
                <div className="atb-hud-name">{ch.nome}</div>
                <div className="atb-hud-bars">
                  <div className="atb-hud-bar-row">
                    <div className="atb-hud-bar-track">
                      <div className="atb-hud-bar-fill hp" style={{ width: `${(ch.hp / ch.hpMax) * 100}%` }} />
                    </div>
                  </div>
                  <div className="atb-hud-bar-row">
                    <div className="atb-hud-bar-track">
                      <div className="atb-hud-bar-fill mp" style={{ width: `${(ch.mp / ch.mpMax) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Bottom Nav — Ações ─────────────────────── */}
      <div className="atb-bottom-nav">
        {isPlayerTurn && !iaThinking ? (
          <>
            {/* Fase livre: escolha de ação */}
            {subPhase === 'free' && (
              <>
                <button
                  className="atb-action-btn"
                  disabled={turnoAcoes.moveu}
                  onClick={iniciarMovimento}
                >
                  👟 {t('prototype.arena_testbed.btn_move')}
                </button>
                <button
                  className="atb-action-btn atb-action-btn--attack"
                  disabled={turnoAcoes.atacou}
                  onClick={() => { setSubPhaseStep('escolher_acao'); setSubPhase('acao'); }}
                >
                  ⚔️ {t('prototype.arena_testbed.btn_attack')}
                </button>
                {currentChar?.inventario?.pocaoHP > 0 && (
                  <button className="atb-action-btn atb-action-btn--item" onClick={() => usarItem('hp')}>
                    ❤️ {currentChar.inventario.pocaoHP}
                  </button>
                )}
                {currentChar?.inventario?.pocaoMP > 0 && (
                  <button className="atb-action-btn atb-action-btn--item" onClick={() => usarItem('mp')}>
                    💙 {currentChar.inventario.pocaoMP}
                  </button>
                )}
                <button className="atb-action-btn atb-action-btn--end" onClick={finalizarTurno}>
                  ⏭️
                </button>
              </>
            )}

            {/* Fase movimento: stepper com confirmação */}
            {subPhase === 'movimento' && (
              <>
                {!pendingMove ? (
                  <>
                    <span className="atb-phase-hint">{t('prototype.arena_testbed.move_hint', { moves: remainingMove })}</span>
                    <button className="atb-action-btn atb-action-btn--cancel" onClick={cancelarAcao}>
                      ❌ {t('prototype.arena_testbed.btn_cancel')}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="atb-action-btn atb-action-btn--confirm" onClick={confirmarMovimento}>
                      ✅ {t('prototype.arena_testbed.btn_confirm_move')}
                    </button>
                    <button className="atb-action-btn atb-action-btn--cancel" onClick={() => setPendingMove(null)}>
                      ❌ {t('prototype.arena_testbed.btn_cancel')}
                    </button>
                  </>
                )}
              </>
            )}

            {/* Fase ação: escolher ação */}
            {subPhase === 'acao' && subPhaseStep === 'escolher_acao' && (
              <>
                <button className="atb-action-btn atb-action-btn--attack" onClick={() => escolherAcao('common_attack')}>
                  ⚔️ {t('prototype.arena_testbed.action_common_attack')}
                </button>
                <button className="atb-action-btn atb-action-btn--skip" onClick={pularAcao}>
                  ⏭️ {t('prototype.arena_testbed.skip_action')}
                </button>
              </>
            )}

            {/* Fase ação: escolher alvo */}
            {subPhase === 'acao' && subPhaseStep === 'escolher_alvo' && (
              <>
                <span className="atb-phase-hint">{t('prototype.arena_testbed.choose_target_hint')}</span>
                <button className="atb-action-btn atb-action-btn--cancel" onClick={cancelarAcao}>
                  ❌ {t('prototype.arena_testbed.btn_cancel')}
                </button>
              </>
            )}
          </>
        ) : (
          <div className="atb-ia-thinking-row">
            <span className="atb-ia-dots">{t('prototype.arena_testbed.ia_thinking_short')}</span>
          </div>
        )}
      </div>

      {/* ── Log Drawer ─────────────────────────────── */}
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

      {/* ── Character Detail Modal ──────────────────── */}
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
                <span className="atb-modal-stat-label hp">HP</span>
                <div className="atb-modal-bar-track">
                  <div className="atb-modal-bar-fill hp" style={{ width: `${(charModal.hp / charModal.hpMax) * 100}%` }} />
                </div>
                <span className="atb-modal-stat-val">{Math.ceil(charModal.hp)}/{charModal.hpMax}</span>
              </div>
              <div className="atb-modal-stat">
                <span className="atb-modal-stat-label mp">MP</span>
                <div className="atb-modal-bar-track">
                  <div className="atb-modal-bar-fill mp" style={{ width: `${(charModal.mp / charModal.mpMax) * 100}%` }} />
                </div>
                <span className="atb-modal-stat-val">{Math.ceil(charModal.mp)}/{charModal.mpMax}</span>
              </div>
              <div className="atb-modal-attr-row">
                <span>FOR: {charModal.forca}</span>
                <span>AGI: {charModal.agi}</span>
                <span>DEX: {charModal.dex}</span>
              </div>
              <div className="atb-modal-attr-row">
                <span>PDF: {charModal.pdf}</span>
                <span>RES: {charModal.res}</span>
                <span>ARM: {charModal.arm}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
