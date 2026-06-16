import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import {
  resolverAtaque, resolverContraAtaque, rolarD6,
  getCasasMovimento, getChanceAcerto,
} from '../engine/combat'
import { getCelulasAlcance, getCelulasAtaque, distanciaHex, encontrarCaminho, getHexLine } from '../engine/hexUtils'
import { decidirAcaoIA } from '../engine/ai'
import JokenpoModal from './JokenpoModal'
import './Phase3Combat.css'

const HEX_SIZE = 30
const SQRT3 = Math.sqrt(3)

function hexCorner(center, size, i) {
  const angle = (Math.PI / 180) * (60 * i - 30)
  return {
    x: center.x + size * Math.cos(angle),
    y: center.y + size * Math.sin(angle),
  }
}

function drawHex(ctx, center, size, fill, stroke, lineWidth = 1.5) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const p = hexCorner(center, size, i)
    if (i === 0) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  }
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

function hexCenter(row, col, padX, padY, size) {
  const w = size * SQRT3
  const h = size * 1.5
  const offsetX = row % 2 === 0 ? 0 : w / 2
  return {
    x: padX + col * w + offsetX,
    y: padY + row * h,
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

/** Nomes das subfases do turno do jogador */
const SUB_PHASES = ['movimento', 'ataque', 'item']

export default function Phase3Combat({ boardState, onBackToPhase1 }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)

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
  // prepare | resultado | enemy_turn
  // subPhase controla as 3 fases do turno do jogador: movimento | ataque | item
  const [subPhase, setSubPhase] = useState(null)
  const [highlightedCells, setHighlightedCells] = useState([])
  const [attackCells, setAttackCells] = useState([])
  const [rangeCells, setRangeCells] = useState([]) // FIX 2: all cells in range (yellow)
  const [subPhaseStep, setSubPhaseStep] = useState(null) // FIX 2: 'escolher_acao' | 'escolher_alvo'
  const [projectilePath, setProjectilePath] = useState([]) // FIX 3: projectile trail cells
  const [battleLog, setBattleLog] = useState([])
  const [winner, setWinner] = useState(null)
  const [jokenpoNeeded, setJokenpoNeeded] = useState(null)
  const [pendingJokenpo, setPendingJokenpo] = useState([])
  const [animating, setAnimating] = useState(false)
  const [d6Result, setD6Result] = useState(null)
  const [itensChaoAtual, setItensChaoAtual] = useState(itensChao || {})
  const [iaThinking, setIaThinking] = useState(false)

  // ── Animation state ─────────────────────────────
  const [movementPath, setMovementPath] = useState(null) // { charId, steps: [{row,col}], current: 0 }
  const [attackAnim, setAttackAnim] = useState(null) // { type, attackerId, targetId, phase, progress }
  const [damageFloats, setDamageFloats] = useState([]) // [{ charId, damage, row, col, key }]
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
    if (ties.length > 0) {
      // Need jokenpo for ties - start with first tie group
      setPendingJokenpo(ties)
      setJokenpoNeeded(ties[0])
    } else {
      setTurnOrder(sorted.map(ch => ch.id))
      startPlayerTurn(sorted.map(ch => ch.id), 0)
    }
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
      enterSubPhase('movimento', firstChar)
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
    return subPhase === 'movimento'
      ? t('prototype.arena_testbed.subphase_move')
      : t('prototype.arena_testbed.subphase_action')
  }, [subPhase, t])

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = HEX_SIZE * SQRT3
    const h = HEX_SIZE * 1.5
    const padX = HEX_SIZE * SQRT3
    const padY = HEX_SIZE * 1.5

    const canvasW = cols * w + w / 2 + padX * 2
    const canvasH = rows * h + h / 3 + padY * 2

    canvas.width = canvasW
    canvas.height = canvasH
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const hlSet = new Set(highlightedCells.map(c => `${c.row}_${c.col}`))
    const atkSet = new Set(attackCells.map(c => `${c.row}_${c.col}`))
    const rangeSet = new Set(rangeCells.map(c => `${c.row}_${c.col}`))
    const projPathSet = new Set(projectilePath.map(c => `${c.row}_${c.col}`))

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const center = hexCenter(row, col, padX, padY, HEX_SIZE)
        const key = `${row}_${col}`
        const obs = obstaculos[key]
        const ch = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)

        let fill = '#1a1a22'
        let stroke = '#2e2e3a'

        if (obs) {
          const colors = { 1: '#555', 2: '#1a1a2e', 3: '#8b4513', 4: '#6b5b3e' }
          fill = colors[obs.tipo] || '#555'
          stroke = '#444'
        } else if (itensChaoAtual[key]) {
          fill = itensChaoAtual[key].tipo === 'hp' ? '#1b3a1b' : '#1a2a4a'
          stroke = itensChaoAtual[key].tipo === 'hp' ? '#4caf50' : '#42a5f5'
        }

        if (atkSet.has(key)) {
          fill = '#3a1a1a'
          stroke = '#e74c3c'
        } else if (rangeSet.has(key)) {
          fill = '#3a3a1a'
          stroke = '#f0c040'
        } else if (hlSet.has(key)) {
          fill = '#2a3a2a'
          stroke = '#4caf50'
        }

        drawHex(ctx, center, HEX_SIZE, fill, stroke)

        if (ch) {
          const flashOn = damageFlash[ch.id] !== undefined && damageFlash[ch.id] % 2 === 0
          const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, HEX_SIZE * 0.65)
          if (flashOn) {
            gradient.addColorStop(0, '#ff2222')
            gradient.addColorStop(1, '#991111')
          } else if (ch.time === 'jogador') {
            gradient.addColorStop(0, '#2e7d32')
            gradient.addColorStop(1, '#1b4d1b')
          } else {
            gradient.addColorStop(0, '#c0392b')
            gradient.addColorStop(1, '#7b1a1a')
          }
          ctx.beginPath()
          ctx.arc(center.x, center.y, HEX_SIZE * 0.55, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
          ctx.strokeStyle = ch.id === currentChar?.id ? '#c9a84c' : (ch.time === 'jogador' ? '#4caf50' : '#e74c3c')
          ctx.lineWidth = ch.id === currentChar?.id ? 3 : 2
          ctx.stroke()

          ctx.fillStyle = '#fff'
          ctx.font = `bold ${HEX_SIZE * 0.35}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(ch.nome.charAt(0).toUpperCase(), center.x, center.y - 2)

          const barW = HEX_SIZE * 0.9
          const barH = 4
          const barX = center.x - barW / 2
          const barY = center.y + HEX_SIZE * 0.45
          ctx.fillStyle = '#333'
          ctx.fillRect(barX, barY, barW, barH)
          const hpPct = ch.hp / ch.hpMax
          ctx.fillStyle = hpPct > 0.5 ? '#4caf50' : hpPct > 0.25 ? '#ff9800' : '#f44336'
          ctx.fillRect(barX, barY, barW * hpPct, barH)
        }

        // FIX 4: Floating numbers/text (dano, bloqueio, extra, contra)
        const floaters = damageFloats.filter(f => f.row === row && f.col === col)
        for (const fl of floaters) {
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowBlur = 8
          if (fl.texto) {
            ctx.fillStyle = fl.cor || '#ffffff'
            ctx.font = `bold ${HEX_SIZE * 0.5}px sans-serif`
            ctx.shadowColor = fl.cor ? fl.cor.replace(')', ',0.6)').replace('rgb', 'rgba') : 'rgba(255,255,255,0.5)'
            ctx.fillText(fl.texto, center.x, center.y - HEX_SIZE * 0.8)
          } else {
            ctx.fillStyle = '#ff3333'
            ctx.font = `bold ${HEX_SIZE * 0.55}px sans-serif`
            ctx.shadowColor = 'rgba(255,0,0,0.6)'
            ctx.fillText(`-${fl.damage}`, center.x, center.y - HEX_SIZE * 0.8)
          }
          ctx.shadowBlur = 0
        }

        // FIX 3: Rastro do projétil — células do caminho com borda amarela fraca
        if (projPathSet.has(key) && !projectilePos?.row === row && !projectilePos?.col === col) {
          drawHex(ctx, center, HEX_SIZE, fill, 'rgba(255, 200, 0, 0.3)', 2)
        }

        // Projétil
        if (projectilePos && projectilePos.row === row && projectilePos.col === col) {
          ctx.beginPath()
          ctx.arc(center.x, center.y, HEX_SIZE * 0.25, 0, Math.PI * 2)
          ctx.fillStyle = '#ffcc00'
          ctx.fill()
          ctx.strokeStyle = '#ff8800'
          ctx.lineWidth = 2
          ctx.stroke()
          // Brilho
          ctx.beginPath()
          ctx.arc(center.x, center.y, HEX_SIZE * 0.35, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,200,0,0.2)'
          ctx.fill()
        }
      }
    }

    // Obstacle icons
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const center = hexCenter(row, col, padX, padY, HEX_SIZE)
        const key = `${row}_${col}`
        const obs = obstaculos[key]
        const item = itensChaoAtual[key]
        const ch = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)

        if (obs && !ch) {
          ctx.fillStyle = '#fff'
          ctx.font = '18px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const icons = { 1: '🧱', 2: '🕳️', 3: '🪤', 4: '📦' }
          ctx.fillText(icons[obs.tipo] || '?', center.x, center.y)
        } else if (item && !ch && !obs) {
          ctx.fillStyle = '#fff'
          ctx.font = '16px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(item.tipo === 'hp' ? '❤️' : '💙', center.x, center.y)
        } else if (!obs && !ch && !item) {
          ctx.fillStyle = '#3a3a4a'
          ctx.font = '9px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(`${row},${col}`, center.x, center.y + HEX_SIZE * 0.15)
        }
      }
    }
  }, [characters, obstaculos, itensChaoAtual, cols, rows, highlightedCells, attackCells, rangeCells, currentChar, damageFlash, damageFloats, projectilePos, projectilePath])

  useEffect(() => { draw() }, [draw])

  // Handle canvas click
  function handleCanvasClick(e) {
    const canvas = canvasRef.current
    if (!canvas || animating || animatingRef.current || !isPlayerTurn || iaThinking) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const w = HEX_SIZE * SQRT3
    const h = HEX_SIZE * 1.5
    const padX = HEX_SIZE * SQRT3
    const padY = HEX_SIZE * 1.5
    const hex = pixelToHex(mx, my, cols, rows, padX, padY, HEX_SIZE)
    if (!hex) return

    const { row, col } = hex

    if (subPhase === 'movimento') {
      if (highlightedCells.some(c => c.row === row && c.col === col)) {
        moverPersonagem(row, col)
      }
    } else if (subPhase === 'acao') {
      if (subPhaseStep === 'escolher_alvo' && attackCells.some(c => c.row === row && c.col === col)) {
        const target = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)
        if (target) executarAtaque(target)
      }
    }
  }

  function moverPersonagem(row, col) {
    if (!currentChar || animating) return
    clearAnimTimers()

    // 1. Encontra o caminho célula a célula
    const origem = currentChar.posicao
    const caminho = encontrarCaminho(
      origem.row, origem.col, row, col,
      cols, rows, obstaculos
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

    // FIX 3: Passa char com posição atualizada para fase de ação
    enterSubPhase('acao', charAtualizado)
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
    // Aplica dano
    setCharacters(prev =>
      prev.map(c =>
        c.id === alvoId ? { ...c, hp: Math.max(0, c.hp - dano) } : c
      )
    )

    if (dano <= 0) return

    // FIX 6: Damage flash + floating number
    const alvo = characters.find(c => c.id === alvoId)
    if (!alvo) return

    // Floating damage number
    const floatKey = Date.now() + Math.random()
    setDamageFloats(prev => [...prev, { charId: alvoId, damage: dano, row: alvo.posicao?.row, col: alvo.posicao?.col, key: floatKey }])
    setAnimTimer(() => {
      setDamageFloats(prev => prev.filter(f => f.key !== floatKey))
    }, 1200)

    // Flash vermelho (3 pulsações)
    const fazerFlash = (count) => {
      if (count >= 6) { // 3 ciclos de on/off
        setDamageFlash(prev => { const n = { ...prev }; delete n[alvoId]; return n })
        return
      }
      setDamageFlash(prev => ({ ...prev, [alvoId]: count }))
      setAnimTimer(() => fazerFlash(count + 1), 120)
    }
    fazerFlash(0)
  }

  function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
    const origem = atacante.posicao
    const destino = alvo.posicao

    // Fase 1: Desliza 70% em direção ao alvo
    const dirRow = destino.row - origem.row
    const dirCol = destino.col - origem.col
    const meioRow = Math.round(origem.row + dirRow * 0.7)
    const meioCol = Math.round(origem.col + dirCol * 0.7)

    setCharacters(prev =>
      prev.map(c =>
        c.id === atacante.id ? { ...c, posicao: { row: meioRow, col: meioCol } } : c
      )
    )

    // Fase 2: Pausa (impacto)
    setAnimTimer(() => {
      // Fase 3: Retorna à origem
      setCharacters(prev =>
        prev.map(c =>
          c.id === atacante.id ? { ...c, posicao: origem } : c
        )
      )

      // Fase 4: Aplica dano + feedback
      setAnimTimer(() => {
        if (onFinalizar) onFinalizar()
        else aposAnimacaoAtaque(atacante, alvo, resultado)
      }, 200)
    }, 300)
  }

  function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
    const origem = atacante.posicao
    const destino = alvo.posicao

    // FIX 3: Projétil com rastro — todas as células acendem, depois apagam conforme avança
    const steps = getHexLine(origem.row, origem.col, destino.row, destino.col)
    setProjectilePath(steps)

    let stepIdx = 0
    function avancarProjetil() {
      if (stepIdx >= steps.length) {
        setProjectilePos(null)
        setProjectilePath([])
        if (onFinalizar) onFinalizar()
        else aposAnimacaoAtaque(atacante, alvo, resultado)
        return
      }
      setProjectilePos({ row: steps[stepIdx].row, col: steps[stepIdx].col })
      // Remove células já percorridas do rastro
      setProjectilePath(prev => prev.filter((_, i) => i > 0))
      stepIdx++
      setAnimTimer(avancarProjetil, 180)
    }
    avancarProjetil()
  }

  function aposAnimacaoAtaque(atacante, alvo, resultado) {
    setProjectilePos(null)
    clearAnimTimers()

    if (resultado.dano > 0) {
      aplicarDano(alvo.id, resultado.dano, atacante)
      addLog(`  💥 ${alvo.nome} recebe ${resultado.dano} de dano!`)
    } else {
      addLog(`  🛡️ Nenhum dano causado!`)
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

  // FIX 4: Adiciona float de texto (bloqueio, extra, contra)
  function adicionarFloatTexto(charId, texto, cor, row, col) {
    const floatKey = Date.now() + Math.random()
    setDamageFloats(prev => [...prev, { charId, texto, cor, row, col, key: floatKey }])
    setAnimTimer(() => {
      setDamageFloats(prev => prev.filter(f => f.key !== floatKey))
    }, 1400)
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
      finalizarTurno()
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
      enterSubPhase('movimento', nextChar)
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
          const caminho = encontrarCaminho(
            origem.row, origem.col, destino.row, destino.col,
            cols, rows, obstaculos
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
      }, 1000)
    }, 1000)

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

        addLog(`  ${atacante.nome} ataca ${alvo.nome}!`)
        dec2.logs.forEach(l => addLog(`  ${l}`))

        const callbackFinal = () => {
          setProjectilePos(null)
          setProjectilePath([])
          if (res.dano > 0) {
            aplicarDano(alvo.id, res.dano, atacante)
            addLog(`  💥 ${alvo.nome} recebe ${res.dano} de dano!`)
            // FIX 4: Feedback visual na IA também
            if (res.criticoDefensivo) {
              adicionarFloatTexto(atacante.id, 'BLOQUEIO!', '#4488ff', atacante.posicao?.row, atacante.posicao?.col)
            }
          }
          // FIX 1+5: Atualiza ref manualmente antes de verificar vitória
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

        if (atacante.tipoAtaque === 'melee') {
          animarAtaqueMelee(atacante, alvo, res, callbackFinal)
        } else {
          animarAtaqueProjetil(atacante, alvo, res, callbackFinal)
        }
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
        setAnimTimer(() => executarIA(nextChar3), 1200)
      } else if (nextChar3) {
        enterSubPhase('movimento', nextChar3)
      }
    }
  }

  function addLog(text) {
    setBattleLog(prev => [...prev, { text, time: Date.now() }])
  }

  // ── Render ─────────────────────────────────────────
  if (phase === 'prepare') {
    return (
      <div className="tab-combat-phase-loading">
        <p>{t('prototype.arena_testbed.preparing_battle')}</p>
      </div>
    )
  }

  if (phase === 'resultado' && winner) {
    return (
      <div className="tab-combat-result">
        <div className="tab-combat-result-card">
          <h2>{winner === 'jogador'
            ? t('prototype.arena_testbed.victory_player')
            : t('prototype.arena_testbed.victory_ia')}
          </h2>
          <p className="tab-combat-result-sub">{t('prototype.arena_testbed.match_over')}</p>
          <button className="tab-btn tab-btn-primary" onClick={onBackToPhase1}>
            {t('prototype.arena_testbed.play_again')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="tab-combat">
      {jokenpoNeeded && (
        <JokenpoModal
          player1Name={jokenpoNeeded[0]?.nome || '?'}
          player2Name={jokenpoNeeded[1]?.nome || '?'}
          onResult={handleJokenpoResult}
        />
      )}

      <div className="tab-combat-header">
        <div className="tab-combat-header-left">
          <h3>{t('prototype.arena_testbed.phase3_title')}</h3>
        </div>
        <div className="tab-combat-turn-info">
          {currentChar && (
            <span className={`tab-combat-turn-char ${currentChar.time}`}>
              {t('prototype.arena_testbed.turn_of')} {currentChar.nome}
              {!iaThinking && isPlayerTurn && subPhase && (
                <span className="tab-combat-subphase-badge">
                  {' — '}{t('prototype.arena_testbed.phase_label')}: {subPhaseLabel}
                </span>
              )}
              {iaThinking && ` (${t('prototype.arena_testbed.thinking')})`}
            </span>
          )}
        </div>
      </div>

      <div className="tab-combat-body">
        <div className="tab-combat-board">
          <canvas ref={canvasRef} className="tab-combat-canvas" onClick={handleCanvasClick} />
        </div>

        <div className="tab-combat-side">
          {/* Status dos personagens */}
          <div className="tab-combat-status">
            <h4>{t('prototype.arena_testbed.characters')}</h4>
            {characters.filter(c => c.vivo).map(ch => (
              <div key={ch.id} className={`tab-combat-char-card ${ch.id === currentChar?.id ? 'active' : ''}`}>
                <div className="tab-combat-char-name">
                  <span className={`tab-combat-team-dot ${ch.time}`} /> {ch.nome}
                </div>
                <div className="tab-combat-char-bars">
                  <div className="tab-combat-bar-row">
                    <span className="tab-combat-bar-label hp">HP</span>
                    <div className="tab-combat-bar-track">
                      <div className="tab-combat-bar-fill hp" style={{ width: `${(ch.hp / ch.hpMax) * 100}%` }} />
                    </div>
                    <span className="tab-combat-bar-val">{Math.ceil(ch.hp)}/{ch.hpMax}</span>
                  </div>
                  <div className="tab-combat-bar-row">
                    <span className="tab-combat-bar-label mp">MP</span>
                    <div className="tab-combat-bar-track">
                      <div className="tab-combat-bar-fill mp" style={{ width: `${(ch.mp / ch.mpMax) * 100}%` }} />
                    </div>
                    <span className="tab-combat-bar-val">{Math.ceil(ch.mp)}/{ch.mpMax}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Controles do jogador ────────────────── */}
          {isPlayerTurn && !iaThinking && (
            <div className="tab-combat-controls">
              {subPhase === 'movimento' && (
                <>
                  <p className="tab-combat-phase-title">
                    🔵 {t('prototype.arena_testbed.subphase_move')}
                  </p>
                  <p className="tab-combat-hint">
                    {t('prototype.arena_testbed.move_hint', { moves: remainingMove })}
                  </p>
                  <button className="tab-btn tab-btn-secondary" onClick={pularMovimento}>
                    ⏭️ {t('prototype.arena_testbed.skip_move')}
                  </button>
                </>
              )}

              {subPhase === 'acao' && subPhaseStep === 'escolher_acao' && (
                <>
                  <p className="tab-combat-phase-title">
                    🔴 {t('prototype.arena_testbed.subphase_action')}
                  </p>
                  <p className="tab-combat-hint">
                    {t('prototype.arena_testbed.choose_action_hint')}
                  </p>
                  <div className="tab-combat-action-btns">
                    <button
                      className="tab-btn tab-btn-primary"
                      onClick={() => escolherAcao('common_attack')}
                    >
                      ⚔️ {t('prototype.arena_testbed.action_common_attack')}
                      <span className="tab-combat-action-desc">
                        {t('prototype.arena_testbed.action_common_attack_desc')}
                      </span>
                    </button>
                    {currentChar?.inventario?.pocaoHP > 0 && (
                      <button className="tab-btn tab-btn-secondary" onClick={() => usarItem('hp')}>
                        ❤️ {t('prototype.arena_testbed.use_hp_potion')} ({currentChar.inventario.pocaoHP})
                      </button>
                    )}
                    {currentChar?.inventario?.pocaoMP > 0 && (
                      <button className="tab-btn tab-btn-secondary" onClick={() => usarItem('mp')}>
                        💙 {t('prototype.arena_testbed.use_mp_potion')} ({currentChar.inventario.pocaoMP})
                      </button>
                    )}
                  </div>
                  <button className="tab-btn tab-btn-gold" onClick={pularAcao}>
                    ⏭️ {t('prototype.arena_testbed.skip_action')}
                  </button>
                </>
              )}

              {subPhase === 'acao' && subPhaseStep === 'escolher_alvo' && (
                <>
                  <p className="tab-combat-phase-title">
                    🔴 {t('prototype.arena_testbed.subphase_action')}
                  </p>
                  <p className="tab-combat-hint">
                    {t('prototype.arena_testbed.choose_target_hint')}
                  </p>
                  <div className="tab-combat-action-btns">
                    {currentChar?.inventario?.pocaoHP > 0 && (
                      <button className="tab-btn tab-btn-secondary" onClick={() => usarItem('hp')}>
                        ❤️ {t('prototype.arena_testbed.use_hp_potion')} ({currentChar.inventario.pocaoHP})
                      </button>
                    )}
                    {currentChar?.inventario?.pocaoMP > 0 && (
                      <button className="tab-btn tab-btn-secondary" onClick={() => usarItem('mp')}>
                        💙 {t('prototype.arena_testbed.use_mp_potion')} ({currentChar.inventario.pocaoMP})
                      </button>
                    )}
                  </div>
                  <button className="tab-btn tab-btn-gold" onClick={() => { setSubPhaseStep('escolher_acao'); setRangeCells([]); setAttackCells([]); }}>
                    🔙 {t('prototype.arena_testbed.back')}
                  </button>
                </>
              )}
            </div>
          )}

          {iaThinking && (
            <div className="tab-combat-ia-thinking">
              <span className="tab-combat-ia-dots">{t('prototype.arena_testbed.ia_thinking')}</span>
            </div>
          )}

          {/* Log */}
          <div className="tab-combat-log">
            <h4>{t('prototype.arena_testbed.battle_log')}</h4>
            <div className="tab-combat-log-list">
              {battleLog.slice(-30).map((entry, i) => (
                <p key={i} className="tab-combat-log-entry">{entry.text}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
