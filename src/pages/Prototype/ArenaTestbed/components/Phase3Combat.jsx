import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import useHexCanvas from '../engine/useHexCanvas'
import {
  resolverAtaque, resolverContraAtaque, rolarD6, calcularFD,
  getCasasMovimento, getChanceAcerto,
} from '../engine/combat'
import { getCelulasAlcance, getCelulasAtaque, distanciaHex, encontrarCaminho, getHexLine } from '../engine/hexUtils'
import { decidirAcaoIA } from '../engine/ai'
import { drawBoard, initCanvasLoop } from '../engine/drawBoard'
import {
  buildOrderFromCharacters, confirmarOrdemInterna,
  iniciarProximoJokenpoCruzado, handleJokenpoResultCruzado,
} from '../engine/turnOrder'
import JokenpoModal from './JokenpoModal'
import OrderingModal from './OrderingModal'
import CharInfoModal from './CharInfoModal'
import BattleLogDrawer from './BattleLogDrawer'
import ActionControls from './ActionControls'
import CombatHUD from './CombatHUD'
import './Phase3Combat.css'

const SQRT3 = Math.sqrt(3)

export default function Phase3Combat({ boardState, onBackToPhase1 }) {
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
  const [orderingPhase, setOrderingPhase] = useState(null)
  const [playerTeamOrder, setPlayerTeamOrder] = useState([])
  const [crossTieQueue, setCrossTieQueue] = useState([])
  const [currentCrossTie, setCurrentCrossTie] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [d6Result, setD6Result] = useState(null)
  const [itensChaoAtual, setItensChaoAtual] = useState(itensChao || {})
  const [iaThinking, setIaThinking] = useState(false)
  const [turnoAcoes, setTurnoAcoes] = useState({ moveu: false, atacou: false })
  const [actionPanel, setActionPanel] = useState(false)
  const [turnAnnouncement, setTurnAnnouncement] = useState(null)
  const [announcementClass, setAnnouncementClass] = useState('')

  const [logDrawerOpen, setLogDrawerOpen] = useState(false)
  const [charModal, setCharModal] = useState(null)
  const [pendingMove, setPendingMove] = useState(null)

  const [destinoEscolhido, setDestinoEscolhido] = useState(null)
  const [caminhoEscolhido, setCaminhoEscolhido] = useState([])

  const [movementPath, setMovementPath] = useState(null)
  const [attackAnim, setAttackAnim] = useState(null)
  const [damageFlash, setDamageFlash] = useState({})
  const [projectilePos, setProjectilePos] = useState(null)
  const [balloons, setBalloons] = useState([])
  const [shaking, setShaking] = useState(false)
  const [flashDmg, setFlashDmg] = useState(false)
  const animatingRef = useRef(false)
  const animTimersRef = useRef([])
  const announceTimerRef = useRef(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const executarAtaqueRef = useRef(null)
  const moverPersonagemRef = useRef(null)
  const winnerRef = useRef(null)
  const iaThinkingRef = useRef(false)
  const tileImgRef = useRef(null)
  const [tileLoaded, setTileLoaded] = useState(false)
  const sortedGlobalRef = useRef([])
  const crossTieQueueRef = useRef([])
  const crossTieResultsRef = useRef([])

  const [remainingMove, setRemainingMove] = useState(0)

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

  const charsRef = useRef(characters)
  const turnRef = useRef(currentTurn)
  const orderRef = useRef(turnOrder)
  useEffect(() => { charsRef.current = characters }, [characters])
  useEffect(() => { turnRef.current = currentTurn }, [currentTurn])
  useEffect(() => { orderRef.current = turnOrder }, [turnOrder])

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
    const alive = characters.filter(c => c.vivo)
    const { ordemParcial, empatesInternosJogador, empatesCruzados } = buildOrderFromCharacters(alive)
    sortedGlobalRef.current = ordemParcial

    setTimeout(() => {
      const timeJogador = ordemParcial.filter(c => c.time === 'jogador')
      setPlayerTeamOrder(timeJogador)

      if (empatesInternosJogador.length > 0 || empatesCruzados.length > 0) {
        setOrderingPhase('player_internal')
        setCrossTieQueue(empatesCruzados)
      } else {
        const order = ordemParcial.map(c => c.id)
        setTurnOrder(order)
        startPlayerTurn(order, 0)
      }
    }, 0)
  }, [])

  function handleJokenpoResult(winnerName) {
    if (orderingPhase === 'jokenpo_cross') {
      const { newResults } = handleJokenpoResultCruzado(winnerName, currentCrossTie, crossTieResultsRef.current)
      crossTieResultsRef.current = newResults
      setJokenpoNeeded(null)
      setCurrentCrossTie(null)
      iniciarProximoJokenpoCruzadoWrapper(currentCrossTie.remainingQueue, sortedGlobalRef.current)
    }
  }

  function confirmarOrdemInternaWrapper() {
    const result = confirmarOrdemInterna(
      sortedGlobalRef.current, playerTeamOrder,
      crossTieQueue, crossTieResultsRef.current,
    )

    if (result.result === 'done') {
      sortedGlobalRef.current = result.ordem
      setOrderingPhase(null)
      const order = result.ordem.map(c => c.id)
      setTurnOrder(order)
      startPlayerTurn(order, 0)
    } else {
      sortedGlobalRef.current = result.ordem
      setOrderingPhase('jokenpo_cross')
      iniciarProximoJokenpoCruzadoWrapper(result.queue, result.ordem)
    }
  }

  function iniciarProximoJokenpoCruzadoWrapper(queue, ordemAtual) {
    const result = iniciarProximoJokenpoCruzado(queue, ordemAtual, crossTieResultsRef.current)
    if (result.result === 'done') {
      sortedGlobalRef.current = result.ordem
      setOrderingPhase(null)
      const order = result.ordem.map(c => c.id)
      setTurnOrder(order)
      startPlayerTurn(order, 0)
    } else {
      setCurrentCrossTie({
        playerChar: result.playerChar,
        iaChar: result.iaChar,
        grupoAgi: result.grupoAgi,
        remainingQueue: result.remainingQueue,
      })
      setJokenpoNeeded([result.playerChar, result.iaChar])
    }
  }

  function logEstadoTurno(origem, orderLocal, idxLocal) {
    const chars = charsRef.current
    const ativo = chars.find(c => c.id === orderLocal[idxLocal])
    console.log(
      `[TURNO:${origem}] ativo=${ativo?.nome}(${ativo?.time})` +
      ` | vivos: ${chars.filter(c => c.vivo).map(c => `${c.nome}(hp=${c.hp})`).join(', ')}` +
      ` | order=[${orderLocal.join(',')}] idx=${idxLocal}`
    )
  }

  function startPlayerTurn(order, startIndex) {
    setTurnOrder(order)
    setCurrentTurn(startIndex)
    const firstChar = characters.find(c => c.id === order[startIndex])
    if (firstChar?.time === 'ia') {
      setPhase('enemy_turn')
      anunciar(t('prototype.arena_testbed.announce_ia_turn'), 1500, 'ia')
      setTimeout(() => executarIA(firstChar), 1000)
    } else if (firstChar) {
      logEstadoTurno('startPlayerTurn', order, startIndex)
      setPhase(null)
      setTurnoAcoes({ moveu: false, atacou: false })
      setSubPhase('free')
      setHighlightedCells([])
      setAttackCells([])
      setRangeCells([])
      anunciar(t('prototype.arena_testbed.announce_player_turn'))
      setTimeout(() => {
        anunciar(t('prototype.arena_testbed.free_hint'), 2500)
      }, 2200)
    }
  }

  const currentChar = useMemo(() => {
    if (turnOrder.length === 0) return null
    return characters.find(c => c.id === turnOrder[currentTurn])
  }, [characters, turnOrder, currentTurn])

  const isPlayerTurn = currentChar?.time === 'jogador'

  const subPhaseLabel = useMemo(() => {
    if (!subPhase) return ''
    if (subPhase === 'free') return t('prototype.arena_testbed.free_turn_hint')
    if (subPhase === 'movimento') return t('prototype.arena_testbed.subphase_move')
    return t('prototype.arena_testbed.subphase_action')
  }, [subPhase, t])

  const doDraw = useCallback(() => {
    drawBoard({
      ctx: canvasRef.current?.getContext('2d'),
      canvas: canvasRef.current,
      sizeRef, padRef, hexCenter, drawHex, pixelToHex,
      rows, cols, obstaculos, itensChaoAtual, characters, currentChar,
      highlightedCells, attackCells, rangeCells, projectilePath, projectilePos,
      caminhoEscolhido, destinoEscolhido, damageFlash, trailRef, angleRef,
      tileImgRef,
    })
  }, [characters, obstaculos, itensChaoAtual, cols, rows, highlightedCells,
      attackCells, rangeCells, currentChar, damageFlash, projectilePos,
      projectilePath, caminhoEscolhido, destinoEscolhido, tileLoaded])

  useEffect(() => {
    function loop() {
      angleRef.current = (angleRef.current || 0) + 0.018
      trailRef.current = trailRef.current
        .map(t => ({ ...t, alpha: t.alpha - 0.07 }))
        .filter(t => t.alpha > 0)
      doDraw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [doDraw, calcVersion])

  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas || animatingRef.current || !isPlayerTurn || iaThinkingRef.current || winnerRef.current) return
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
      if (clickedOwnToken && !actionPanel) { setActionPanel(true); return }
      if (actionPanel) { setActionPanel(false); return }
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
        setDestinoEscolhido({ row, col })
        setCaminhoEscolhido(cam ? cam.slice(1) : [{ row, col }])
        setPendingMove({ row, col })
      }
    } else if (subPhase === 'acao') {
      if (subPhaseStep === 'escolher_alvo' && attackCells.some(c => c.row === row && c.col === col)) {
        const target = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)
        if (target) executarAtaqueRef.current?.(target)
      }
    }
  }, [
    isPlayerTurn, iaThinking, cols, rows, subPhase, subPhaseStep,
    currentChar, actionPanel, highlightedCells, attackCells, characters, obstaculos,
  ])

  const handleTouch = useCallback((e) => {
    if (e.cancelable) e.preventDefault()
    const touch = e.changedTouches[0]
    handleCanvasClick({ clientX: touch.clientX, clientY: touch.clientY })
  }, [handleCanvasClick])

  function moverPersonagem(row, col) {
    if (!currentChar || animating) return
    clearAnimTimers()
    setDestinoEscolhido(null)
    setCaminhoEscolhido([])
    const origem = currentChar.posicao
    const ocupadas = new Set(
      characters.filter(c => c.vivo && c.id !== currentChar.id).map(c => `${c.posicao.row}_${c.posicao.col}`)
    )
    const caminho = encontrarCaminho(origem.row, origem.col, row, col, cols, rows, obstaculos, ocupadas)
    if (!caminho || caminho.length < 2) {
      setCharacters(prev => prev.map(c => c.id === currentChar.id ? { ...c, posicao: { row, col } } : c))
      setHighlightedCells([]); setRemainingMove(0)
      aposMovimento(row, col); return
    }
    const steps = caminho.slice(1)
    animatingRef.current = true; setAnimating(true); setHighlightedCells([])
    let stepIdx = 0
    function avancarPasso() {
      if (stepIdx >= steps.length) { animatingRef.current = false; setAnimating(false); setRemainingMove(0); aposMovimento(row, col); return }
      const passo = steps[stepIdx]
      trailRef.current = [...trailRef.current, { row: passo.row, col: passo.col, alpha: 1.0 }]
      setCharacters(prev => prev.map(c => c.id === currentChar.id ? { ...c, posicao: { row: passo.row, col: passo.col } } : c))
      stepIdx++; setAnimTimer(avancarPasso, 150)
    }
    setAnimTimer(avancarPasso, 50)
  }
  moverPersonagemRef.current = moverPersonagem

  function aposMovimento(row, col) {
    if (!currentChar) return
    addLog(`[${currentChar.nome}] Moveu para (${row}, ${col})`)
    const key = `${row}_${col}`
    if (itensChaoAtual[key]) {
      const item = itensChaoAtual[key]
      setCharacters(prev => prev.map(c =>
        c.id === currentChar.id ? {
          ...c, inventario: { ...c.inventario, [item.tipo === 'hp' ? 'pocaoHP' : 'pocaoMP']: (c.inventario?.[item.tipo === 'hp' ? 'pocaoHP' : 'pocaoMP'] || 0) + 1 },
        } : c
      ))
      setItensChaoAtual(prev => { const n = { ...prev }; delete n[key]; return n })
      addLog(`[${currentChar.nome}] Coletou Poção ${item.tipo === 'hp' ? 'HP' : 'MP'} do chão!`)
    }
    setTurnoAcoes(prev => ({ ...prev, moveu: true }))
    setSubPhase('free'); setHighlightedCells([]); setActionPanel(false)
  }

  function iniciarMovimento() {
    if (!currentChar || animating || turnoAcoes.moveu) return
    setActionPanel(false)
    anunciar(t('prototype.arena_testbed.announce_move'), 1200)
    const mov = getCasasMovimento(currentChar.agi, agiUmPraUm)
    const moveCells = getCelulasAlcance(currentChar.posicao.row, currentChar.posicao.col, mov, cols, rows, obstaculos)
      .filter(c => {
        const occupied = characters.some(ch => ch.vivo && ch.id !== currentChar.id && ch.posicao?.row === c.row && ch.posicao?.col === c.col)
        const hasObstacle = obstaculos[`${c.row}_${c.col}`]?.tipo === 1
        return !occupied && !hasObstacle
      })
    setHighlightedCells(moveCells); setAttackCells([]); setRemainingMove(mov); setSubPhase('movimento')
  }

  function cancelarAcao() {
    setHighlightedCells([]); setAttackCells([]); setRangeCells([])
    setSubPhaseStep(null); setPendingMove(null)
    setDestinoEscolhido(null); setCaminhoEscolhido([])
    setSubPhase('free'); setActionPanel(false)
  }

  function confirmarMovimento() {
    if (!pendingMove) return
    moverPersonagemRef.current?.(pendingMove.row, pendingMove.col)
    setPendingMove(null)
  }

  function escolherAcao(tipoAcao) {
    if (!currentChar || animating) return
    anunciar(t('prototype.arena_testbed.announce_attack'), 1200)
    addLog(`[${currentChar.nome}] Escolheu: ${tipoAcao}`)
    const alcanceMax = currentChar.tipoAtaque === 'melee' ? 1 : currentChar.pdf
    const atkCells = getCelulasAtaque(currentChar.posicao.row, currentChar.posicao.col, currentChar.tipoAtaque, cols, rows, alcanceMax, obstaculos)
    setRangeCells(atkCells)
    setAttackCells(atkCells.filter(c => characters.some(ch => ch.vivo && ch.time !== currentChar.time && ch.posicao?.row === c.row && ch.posicao?.col === c.col)))
    setHighlightedCells([]); setSubPhaseStep('escolher_alvo'); setSubPhase('acao')
  }

  // ── Animation & combat functions (non-extracted) ──

  function adicionarBalao(alvoId, texto, tipo, row, col) {
    const canvas = canvasRef.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const sz = sizeRef.current
    const center = hexCenter(row, col, padRef.current.x, padRef.current.y, sz)
    const scaleX = rect.width / canvas.width; const scaleY = rect.height / canvas.height
    const containerRect = canvasContainerRef.current?.getBoundingClientRect()
    const balaoX = center.x * scaleX + rect.left - (containerRect?.left ?? 0)
    const balaoY = center.y * scaleY + rect.top - (containerRect?.top ?? 0) - sz * 0.8
    const key = Date.now() + Math.random()
    setBalloons(prev => [...prev, { id: key, x: balaoX, y: balaoY, texto, tipo, key }])
    setTimeout(() => setBalloons(prev => prev.filter(b => b.key !== key)), 1300)
  }

  function aplicarDano(alvoId, dano, donoDoAtaque) {
    if (dano <= 0) return
    const alvo = charsRef.current.find(c => c.id === alvoId); if (!alvo) return
    const novoHp = Math.max(0, alvo.hp - dano)
    charsRef.current = charsRef.current.map(c => c.id === alvoId ? { ...c, hp: novoHp } : c)
    setCharacters(prev => prev.map(c => c.id === alvoId ? { ...c, hp: novoHp } : c))
    adicionarBalao(alvoId, `-${dano}`, 'damage', alvo.posicao?.row, alvo.posicao?.col)
    setShaking(true); setTimeout(() => setShaking(false), 500)
    setFlashDmg(true); setTimeout(() => setFlashDmg(false), 400)
    let count = 0
    function fazerFlash() {
      if (count >= 6) { setDamageFlash(prev => { const n = { ...prev }; delete n[alvoId]; return n }); return }
      setDamageFlash(prev => ({ ...prev, [alvoId]: count++ }))
      setTimeout(fazerFlash, 120)
    }
    fazerFlash()
  }

  function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
    const origem = atacante.posicao; const destino = alvo.posicao
    const dirRow = destino.row - origem.row; const dirCol = destino.col - origem.col
    const meioRow = Math.round(origem.row + dirRow * 0.7); const meioCol = Math.round(origem.col + dirCol * 0.7)
    setCharacters(prev => prev.map(c => c.id === atacante.id ? { ...c, posicao: { row: meioRow, col: meioCol } } : c))
    setAnimTimer(() => {
      setCharacters(prev => prev.map(c => c.id === atacante.id ? { ...c, posicao: origem } : c))
      setAnimTimer(() => { if (onFinalizar) onFinalizar(); else aposAnimacaoAtaque(atacante, alvo, resultado) }, 200)
    }, 300)
  }

  function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
    const origem = atacante.posicao; const destino = alvo.posicao
    const steps = getHexLine(origem.row, origem.col, destino.row, destino.col)
    setProjectilePath(steps)
    let stepIdx = 0
    function avancarProjetil() {
      if (stepIdx >= steps.length) { setProjectilePos(null); setProjectilePath([]); if (onFinalizar) onFinalizar(); else aposAnimacaoAtaque(atacante, alvo, resultado); return }
      setProjectilePos({ row: steps[stepIdx].row, col: steps[stepIdx].col })
      setProjectilePath(prev => prev.filter((_, i) => i > 0))
      stepIdx++; setAnimTimer(avancarProjetil, 320)
    }
    avancarProjetil()
  }

  function aposAnimacaoAtaque(atacante, alvo, resultado) {
    setProjectilePos(null); clearAnimTimers()
    if (resultado.criticoDefensivo) {
      addLog(`  🛡️ ${t('prototype.arena_testbed.log_blocked')}`)
      adicionarBalao(alvo.id, 'CRÍTICO DEF!', 'block', alvo.posicao?.row, alvo.posicao?.col)
    } else {
      const danoFinal = Math.max(1, resultado.dano || 1)
      aplicarDano(alvo.id, danoFinal, atacante)
      addLog(`  💥 ${alvo.nome} recebeu ${danoFinal} de dano!`)
    }
    if (resultado.criticoDefensivo) {
      adicionarFloatTexto(alvo.id, t('prototype.arena_testbed.float_blocked'), '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
    }
    if (resultado.criticoDefensivo) {
      setAnimTimer(() => {
        const contra = resolverContraAtaque(alvo, atacante, resultado.fa / 2)
        contra.logs.forEach(l => addLog(`  ↺ ${l}`))
        if (contra.dano > 0) {
          aplicarDano(atacante.id, contra.dano, alvo)
          adicionarFloatTexto(atacante.id, t('prototype.arena_testbed.float_contra'), '#ff8800', atacante.posicao?.row, atacante.posicao?.col)
          addLog(`  ${atacante.nome} recebe ${contra.dano} de dano do contra-ataque!`)
        }
        if (resultado.ataqueExtra) setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa), 600)
        else setAnimTimer(() => {
          const hpAtacante = charsRef.current.find(c => c.id === atacante.id)?.hp ?? 0
          if (hpAtacante <= 0) {
            charsRef.current = charsRef.current.map(c => c.id === atacante.id ? { ...c, vivo: false } : c)
            setCharacters(charsRef.current)
            setTurnOrder(prev => prev.filter(id => id !== atacante.id))
            addLog(`💀 ${atacante.nome} foi derrotado pelo contra-ataque!`)
            setAnimating(false); animatingRef.current = false
            if (!verificarVitoria()) finalizarTurno()
          } else finalizarAposAtaque(alvo, resultado)
        }, 400)
      }, 500)
    } else {
      if (resultado.ataqueExtra) setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa), 600)
      else setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
    }
  }

  function adicionarFloatTexto(charId, texto, cor, row, col) {
    let tipo = 'block'
    if (cor === '#ffcc00') tipo = 'extra'
    else if (cor === '#ff8800') tipo = 'contra'
    else if (cor === '#4488ff') tipo = 'block'
    adicionarBalao(charId, texto, tipo, row, col)
  }

  function executarAtaque(target) {
    if (!currentChar || animating) return
    clearAnimTimers(); animatingRef.current = true; setAnimating(true); setAttackCells([])
    const d6Val = rolarD6(); setD6Result(d6Val)
    const dist = distanciaHex(currentChar.posicao, target.posicao)
    const resultado = resolverAtaque(currentChar, target, Math.ceil(dist))
    addLog(`⚔️ ${currentChar.nome} ataca ${target.nome}!`)
    resultado.logs.forEach(l => addLog(`  ${l}`))
    if (currentChar.tipoAtaque === 'melee') animarAtaqueMelee(currentChar, target, resultado)
    else animarAtaqueProjetil(currentChar, target, resultado)
  }
  executarAtaqueRef.current = executarAtaque

  function handleAtaqueExtra(atacante, alvo, faBase) {
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
      finalizarAposAtaque(alvo, { dano: 0 })
    } else {
      const danoExtra = Math.max(1, Math.round(faExtra - fd))
      addLog(`  💥 Dano extra: ${danoExtra}`); aplicarDano(alvo.id, danoExtra, atacante)
      finalizarAposAtaque(alvo, { dano: danoExtra })
    }
  }

  function finalizarAposAtaque(alvo, resultado) {
    setAnimating(false); animatingRef.current = false; setD6Result(null); clearAnimTimers()
    if (winnerRef.current) return
    const hpAtual = charsRef.current.find(c => c.id === alvo.id)?.hp ?? 0
    if (hpAtual <= 0) {
      charsRef.current = charsRef.current.map(c => c.id === alvo.id ? { ...c, vivo: false } : c)
      setCharacters(charsRef.current)
      setTurnOrder(prev => prev.filter(id => id !== alvo.id))
      addLog(`💀 ${alvo.nome} foi derrotado!`)
      setAnimTimer(() => {
        if (verificarVitoria()) return
        setTurnoAcoes(prev => ({ ...prev, atacou: true }))
        setSubPhase('free'); setHighlightedCells([]); setAttackCells([]); setRangeCells([])
        anunciar(t('prototype.arena_testbed.announce_player_turn'))
      }, 300)
    } else {
      setTurnoAcoes(prev => ({ ...prev, atacou: true }))
      setSubPhase('free'); setHighlightedCells([]); setAttackCells([]); setRangeCells([])
      anunciar(t('prototype.arena_testbed.announce_player_turn'))
    }
  }

  function usarItem(tipo) {
    if (!currentChar || animating) return
    const key = tipo === 'hp' ? 'pocaoHP' : 'pocaoMP'
    const qty = currentChar.inventario?.[key] || 0
    if (qty <= 0) return
    setCharacters(prev => prev.map(c => {
      if (c.id !== currentChar.id) return c
      const newQty = (c.inventario?.[key] || 0) - 1
      const max = tipo === 'hp' ? c.hpMax : c.mpMax
      const newVal = Math.min(max, (tipo === 'hp' ? c.hp : c.mp) + 5)
      return { ...c, [tipo === 'hp' ? 'hp' : 'mp']: newVal, inventario: { ...c.inventario, [key]: newQty } }
    }))
    addLog(`💊 ${currentChar.nome} usou Poção ${tipo === 'hp' ? 'HP' : 'MP'}! (+5)`)
    finalizarTurno()
  }

  function verificarVitoria() {
    const chars = charsRef.current
    const pVivos = chars.filter(c => c.vivo && c.time === 'jogador')
    const iVivos = chars.filter(c => c.vivo && c.time === 'ia')
    if (pVivos.length === 0) {
      winnerRef.current = 'ia'; setWinner('ia'); setPhase('resultado')
      anunciar(t('prototype.arena_testbed.announce_defeat'), 3000, 'ia')
      addLog('🏆 IA venceu a partida!'); return true
    }
    if (iVivos.length === 0) {
      winnerRef.current = 'jogador'; setWinner('jogador'); setPhase('resultado')
      anunciar(t('prototype.arena_testbed.announce_victory'), 3000, 'vitoria')
      addLog('🏆 Jogador venceu a partida!'); return true
    }
    return false
  }

  function finalizarTurno() {
    setHighlightedCells([]); setAttackCells([]); setRangeCells([]); setSubPhaseStep(null)
    setPendingMove(null); setDestinoEscolhido(null); setCaminhoEscolhido([]); setActionPanel(false)
    animatingRef.current = false; setAnimating(false)
    if (verificarVitoria()) return
    setSubPhase(null)
    const order = orderRef.current; const turnIdx = turnRef.current
    const nextIdx = (turnIdx + 1) % order.length
    const nextId = order[nextIdx]; const nextChar = charsRef.current.find(c => c.id === nextId)
    setCurrentTurn(nextIdx)
    if (nextChar?.time === 'ia') {
      setPhase('enemy_turn')
      anunciar(t('prototype.arena_testbed.announce_ia_turn'), 1500, 'ia')
      setTimeout(() => executarIA(nextChar), 1000)
    } else if (nextChar) {
      logEstadoTurno('finalizarTurno', order, nextIdx)
      setPhase(null); setTurnoAcoes({ moveu: false, atacou: false }); setSubPhase('free')
      setHighlightedCells([]); setAttackCells([]); setRangeCells([])
      anunciar(t('prototype.arena_testbed.announce_player_turn'))
      setTimeout(() => anunciar(t('prototype.arena_testbed.free_hint'), 2500), 2200)
    }
  }

  function executarIA(iaChar) {
    setIaThinking(true); iaThinkingRef.current = true
    addLog(`🤖 Turno da IA: ${iaChar.nome}`)
    setAnimTimer(() => {
      const charsAgora = charsRef.current
      const iaAtual = charsAgora.find(c => c.id === iaChar.id)
      if (!iaAtual || !iaAtual.vivo) { iaThinkingRef.current = false; setIaThinking(false); finalizarTurno(); return }
      addLog(`  ${iaChar.nome} — Fase: Movimento`)
      const inimigos = charsAgora.filter(c => c.vivo && c.time === 'jogador')
      const movIA = getCasasMovimento(iaAtual.agi, agiUmPraUm)
      const moveCells = getCelulasAlcance(iaAtual.posicao.row, iaAtual.posicao.col, movIA, cols, rows, obstaculos)
      setHighlightedCells(moveCells)
      const dec = decidirAcaoIA(iaAtual, inimigos, charsAgora, obstaculos, cols, rows, itensChaoAtual)
      setAnimTimer(() => {
        setHighlightedCells([])
        if (dec.tipo === 'andar') {
          const destino = { row: dec.detalhes.row, col: dec.detalhes.col }
          setAttackCells([destino])
          const origem = iaAtual.posicao
          const ocupadasIA = new Set(charsAgora.filter(c => c.vivo && c.id !== iaChar.id).map(c => `${c.posicao.row}_${c.posicao.col}`))
          const caminho = encontrarCaminho(origem.row, origem.col, destino.row, destino.col, cols, rows, obstaculos, ocupadasIA)
          const steps = caminho ? caminho.slice(1) : [destino]
          let stepIdx = 0
          function avancarPassoIA() {
            if (stepIdx >= steps.length) { setAttackCells([]); dec.logs.forEach(l => addLog(`  ${l}`)); setAnimTimer(acaoIA, 300); return }
            const passo = steps[stepIdx]
            trailRef.current = [...trailRef.current, { row: passo.row, col: passo.col, alpha: 1.0 }]
            setCharacters(prev => prev.map(c => c.id === iaChar.id ? { ...c, posicao: { row: passo.row, col: passo.col } } : c))
            stepIdx++; setAnimTimer(avancarPassoIA, 150)
          }
          setAnimTimer(avancarPassoIA, 400)
        } else { addLog(`  ${iaChar.nome} não se moveu.`); setAnimTimer(acaoIA, 1000) }
      }, 1800)
    }, 1500)

    function acaoIA() {
      const charsAgora2 = charsRef.current; const iaAtual2 = charsAgora2.find(c => c.id === iaChar.id)
      if (!iaAtual2 || !iaAtual2.vivo) { iaThinkingRef.current = false; setIaThinking(false); finalizarTurno(); return }
      addLog(`  ${iaChar.nome} — Fase: Ação`)
      const inimigos2 = charsAgora2.filter(c => c.vivo && c.time === 'jogador')
      const dec2 = decidirAcaoIA(iaAtual2, inimigos2, charsAgora2, obstaculos, cols, rows, itensChaoAtual)
      if (dec2.tipo === 'atacar') {
        const alvo = dec2.detalhes.alvo; const res = dec2.detalhes.resultado; const isMiss = dec2.detalhes.miss === true
        const atacante = iaAtual2
        const alcanceMaxIA = atacante.tipoAtaque === 'melee' ? 1 : atacante.pdf
        const rangeCellsIA = getCelulasAtaque(atacante.posicao.row, atacante.posicao.col, atacante.tipoAtaque, cols, rows, alcanceMaxIA, obstaculos)
        setRangeCells(rangeCellsIA); setAttackCells([])
        const callbackFinal = () => {
          if (winnerRef.current) { finalizarTurnoIA(); return }
          setProjectilePos(null); setProjectilePath([])
          if (isMiss) { adicionarBalao(alvo.id, 'MISS!', 'miss', alvo.posicao?.row, alvo.posicao?.col); finalizarTurnoIA(); return }
          if (res.criticoDefensivo) {
            addLog(`  🛡️ ${t('prototype.arena_testbed.log_blocked')}`)
            adicionarFloatTexto(atacante.id, t('prototype.arena_testbed.float_blocked'), '#4488ff', atacante.posicao?.row, atacante.posicao?.col)
            adicionarBalao(atacante.id, 'CRÍTICO DEF!', 'block', atacante.posicao?.row, atacante.posicao?.col)
          } else {
            const danoFinal = Math.max(1, res.dano || 1); aplicarDano(alvo.id, danoFinal, atacante)
            addLog(`  💥 ${alvo.nome} recebeu ${danoFinal} de dano!`)
          }
          const hpAtual = charsRef.current.find(c => c.id === alvo.id)?.hp ?? 0
          if (hpAtual <= 0) {
            charsRef.current = charsRef.current.map(c => c.id === alvo.id ? { ...c, vivo: false } : c)
            setCharacters(charsRef.current); setTurnOrder(prev => prev.filter(id => id !== alvo.id))
            addLog(`💀 ${alvo.nome} foi derrotado!`)
            setAnimTimer(() => { if (!verificarVitoria()) finalizarTurnoIA() }, 300)
          } else finalizarTurnoIA()
        }
        setAnimTimer(() => {
          setRangeCells([]); setAttackCells([{ row: alvo.posicao.row, col: alvo.posicao.col }])
          setAnimTimer(() => {
            setRangeCells([]); setAttackCells([])
            addLog(`  ${atacante.nome} ataca ${alvo.nome}!`); dec2.logs.forEach(l => addLog(`  ${l}`))
            if (atacante.tipoAtaque === 'melee') animarAtaqueMelee(atacante, alvo, res, callbackFinal)
            else animarAtaqueProjetil(atacante, alvo, res, callbackFinal)
          }, 700)
        }, 1200)
      } else { dec2.logs.forEach(l => addLog(`  ${l}`)); setAnimTimer(finalizarTurnoIA, 500) }
    }

    function finalizarTurnoIA() {
      setProjectilePos(null); setProjectilePath([])
      addLog(`  ✅ ${iaChar.nome} finalizou o turno.`)
      if (verificarVitoria()) { iaThinkingRef.current = false; setIaThinking(false); return }
      const order3 = orderRef.current; const turnIdx3 = turnRef.current
      const nextIdx3 = (turnIdx3 + 1) % order3.length
      const nextChar3 = charsRef.current.find(c => c.id === order3[nextIdx3])
      setCurrentTurn(nextIdx3)
      if (nextChar3?.time === 'ia') { setPhase('enemy_turn'); setAnimTimer(() => executarIA(nextChar3), 1800) }
      else if (nextChar3) {
        logEstadoTurno('finalizarTurnoIA', order3, nextIdx3)
        setPhase(null); setTurnoAcoes({ moveu: false, atacou: false }); setSubPhase('free')
        setHighlightedCells([]); setAttackCells([]); setRangeCells([])
        iaThinkingRef.current = false; setIaThinking(false)
        anunciar(t('prototype.arena_testbed.announce_player_turn'))
        setTimeout(() => anunciar(t('prototype.arena_testbed.free_hint'), 2500), 2200)
      } else { iaThinkingRef.current = false; setIaThinking(false) }
    }
  }

  function addLog(text) { setBattleLog(prev => [...prev, { text, time: Date.now() }]) }

  if (phase === 'resultado' && winner) {
    return (
      <div className="atb-result">
        <div className="atb-result-card">
          <h2>{winner === 'jogador' ? t('prototype.arena_testbed.victory_player') : t('prototype.arena_testbed.victory_ia')}</h2>
          <p className="atb-result-sub">{t('prototype.arena_testbed.match_over')}</p>
          <button className="atb-btn atb-btn-primary" onClick={onBackToPhase1}>{t('prototype.arena_testbed.play_again')}</button>
        </div>
      </div>
    )
  }

  return (
    <>
      {orderingPhase === 'player_internal' && (
        <OrderingModal
          playerTeamOrder={playerTeamOrder}
          setPlayerTeamOrder={setPlayerTeamOrder}
          onConfirm={confirmarOrdemInternaWrapper}
        />
      )}

      <div className={`atb-root ${shaking ? 'atb-shake' : ''}`}>
        {flashDmg && <div className="atb-flash-overlay" />}

        {jokenpoNeeded && (
          <JokenpoModal
            player1Name={jokenpoNeeded[0]?.nome || '?'}
            player2Name={jokenpoNeeded[1]?.nome || '?'}
            onResult={handleJokenpoResult}
          />
        )}

        {turnAnnouncement && (
          <div className="atb-announcement-overlay">
            <div className={`atb-announcement-text ${announcementClass}`}>{turnAnnouncement}</div>
          </div>
        )}

        <ActionControls
          actionPanel={actionPanel}
          subPhase={subPhase}
          subPhaseStep={subPhaseStep}
          isPlayerTurn={isPlayerTurn}
          iaThinking={iaThinking}
          currentChar={currentChar}
          turnoAcoes={turnoAcoes}
          pendingMove={pendingMove}
          onAction={(type) => {
            setActionPanel(false)
            if (type === 'move') iniciarMovimento()
            else if (type === 'attack') escolherAcao('common_attack')
          }}
          onMove={() => {}}
          onAttack={() => escolherAcao('common_attack')}
          onUseItem={usarItem}
          onConfirmMove={confirmarMovimento}
          onCancel={cancelarAcao}
          onSkipMove={() => {
            if (!currentChar) return
            addLog(`[${currentChar.nome}] Pulou a fase de movimento.`)
            setHighlightedCells([]); setAttackCells([]); setRangeCells([])
            setSubPhaseStep('escolher_acao'); setSubPhase('acao'); setPhase(null)
          }}
          onSkipAction={() => {
            if (!currentChar) return
            addLog(`[${currentChar.nome}] Pulou a fase de ação.`)
            setAttackCells([]); setRangeCells([]); setSubPhaseStep(null); finalizarTurno()
          }}
          onEndTurn={finalizarTurno}
        />

        <div className="atb-top-bar">
          <button className="atb-top-back" onClick={onBackToPhase1}>←</button>
          <div className="atb-top-info">
            <span className={`atb-top-turn ${currentChar?.time === 'ia' ? 'enemy' : 'player'}`}>
              {currentChar ? `${t('prototype.arena_testbed.turn_of')} ${currentChar.nome}` : t('prototype.arena_testbed.preparing_battle')}
              {isPlayerTurn && subPhase && <span className="atb-top-subphase"> · {subPhaseLabel}</span>}
              {iaThinking && ` · ${t('prototype.arena_testbed.ia_thinking_short')}`}
            </span>
          </div>
          <button className="atb-top-log-btn" onClick={() => setLogDrawerOpen(true)}>≡</button>
        </div>

        <div className="atb-canvas-wrap" ref={canvasContainerRef}>
          <canvas ref={canvasRef} className="atb-canvas" onClick={handleCanvasClick} onTouchEnd={handleTouch} />
          <div className="atb-balloon-container">
            {balloons.map(b => (
              <div key={b.key} className={`atb-balloon atb-balloon--${b.tipo}`} style={{ '--x': `${b.x}px`, '--y': `${b.y}px` }}>
                {b.texto}
              </div>
            ))}
          </div>
        </div>

        <CombatHUD characters={characters} currentChar={currentChar} onCharClick={(ch) => setCharModal(ch)} />

        <BattleLogDrawer
          open={logDrawerOpen}
          battleLog={battleLog}
          onClose={() => setLogDrawerOpen(false)}
        />

        <CharInfoModal char={charModal} onClose={() => setCharModal(null)} />
      </div>
    </>
  )
}