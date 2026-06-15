import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import {
  resolverAtaque, resolverContraAtaque, rolarD6,
  getCasasMovimento, getChanceAcerto,
} from '../engine/combat'
import { getCelulasAlcance, getCelulasAtaque, distanciaHex } from '../engine/hexUtils'
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

export default function Phase3Combat({ boardState, onBackToPhase1 }) {
  const { t } = useLanguage()
  const canvasRef = useRef(null)

  const { boardChars, obstaculos, itensChao, cols, rows } = boardState

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
  const [phase, setPhase] = useState('prepare') // prepare | movement | action | enemy_turn | resultado
  const [highlightedCells, setHighlightedCells] = useState([])
  const [attackCells, setAttackCells] = useState([])
  const [battleLog, setBattleLog] = useState([])
  const [winner, setWinner] = useState(null)
  const [jokenpoNeeded, setJokenpoNeeded] = useState(null)
  const [pendingJokenpo, setPendingJokenpo] = useState([])
  const [animating, setAnimating] = useState(false)
  const [d6Result, setD6Result] = useState(null)
  const [itensChaoAtual, setItensChaoAtual] = useState(itensChao || {})
  const [iaThinking, setIaThinking] = useState(false)

  // Remaining movement for current char
  const [remainingMove, setRemainingMove] = useState(0)
  const [hasActed, setHasActed] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)

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
      setPhase('movement')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleJokenpoResult(winnerName) {
    const tieGroup = jokenpoNeeded
    const remaining = pendingJokenpo.slice(1)
    setPendingJokenpo(remaining)

    // Reorder the tie group: winner first, then random
    const sorted = [...tieGroup]
    if (winnerName) {
      const winner = sorted.find(c => c.nome === winnerName)
      const rest = sorted.filter(c => c.nome !== winnerName)
      // Winner first, rest in random order
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]]
      }
      const reordered = [winner, ...rest]
      // Update positions in tie group
      setTurnOrder(prev => {
        const currentOrder = characters.filter(c => c.vivo).sort((a, b) => b.agi - a.agi)
        // Replace the tied positions
        return currentOrder.map(ch => ch.id)
      })
    }

    setJokenpoNeeded(null)

    if (remaining.length > 0) {
      // Next tie group
      setTimeout(() => setJokenpoNeeded(remaining[0]), 500)
    } else {
      // All ties resolved, build final order
      const alive = characters.filter(c => c.vivo)
      const sorted = [...alive].sort((a, b) => b.agi - a.agi)
      setTurnOrder(sorted.map(ch => ch.id))
      setPhase('movement')
    }
  }

  const currentChar = useMemo(() => {
    if (turnOrder.length === 0) return null
    return characters.find(c => c.id === turnOrder[currentTurn])
  }, [characters, turnOrder, currentTurn])

  const isPlayerTurn = currentChar?.time === 'jogador'

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
        } else if (hlSet.has(key)) {
          fill = '#2a3a2a'
          stroke = '#4caf50'
        }

        drawHex(ctx, center, HEX_SIZE, fill, stroke)

        // Character
        if (ch) {
          const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, HEX_SIZE * 0.65)
          if (ch.time === 'jogador') {
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

          // HP bar
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
      }
    }
  }, [characters, obstaculos, itensChaoAtual, cols, rows, highlightedCells, attackCells, currentChar])

  useEffect(() => { draw() }, [draw])

  // Handle canvas click
  function handleCanvasClick(e) {
    const canvas = canvasRef.current
    if (!canvas || animating || !isPlayerTurn || iaThinking) return
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

    if (phase === 'movement') {
      // Move if cell is highlighted
      if (highlightedCells.some(c => c.row === row && c.col === col)) {
        moveCharacter(row, col)
      }
    } else if (phase === 'action') {
      // Attack if cell is in attack range
      if (attackCells.some(c => c.row === row && c.col === col)) {
        const target = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)
        if (target) {
          executeAttack(target)
        }
      } else if (highlightedCells.some(c => c.row === row && c.col === col)) {
        moveCharacter(row, col)
      }
    }
  }

  function moveCharacter(row, col) {
    if (!currentChar || hasActed) return
    setCharacters(prev =>
      prev.map(c =>
        c.id === currentChar.id
          ? { ...c, posicao: { row, col } }
          : c
      )
    )
    addLog(`[${currentChar.nome}]({${currentChar.time === 'jogador' ? 'JOGADOR' : 'IA'}}) Moveu para (${row}, ${col})`)
    setHasMoved(true)
    setHighlightedCells([])
    setRemainingMove(0)

    // Check for item on ground
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
      setItensChaoAtual(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      addLog(`[${currentChar.nome}] Coletou Poção ${item.tipo === 'hp' ? 'HP' : 'MP'} do chão!`)
    }

    if (!hasActed) {
      setPhase('action')
    } else {
      finishTurn()
    }
  }

  function executeAttack(target) {
    if (!currentChar || animating) return
    setAnimating(true)
    setAttackCells([])

    // Roll d6 for attacker
    const d6Val = rolarD6()
    setD6Result(d6Val)

    const dist = distanciaHex(currentChar.posicao, target.posicao)
    const resultado = resolverAtaque(currentChar, target, Math.ceil(dist))

    addLog(`⚔️ ${currentChar.nome} ataca ${target.nome}!`)
    resultado.logs.forEach(l => addLog(`  ${l}`))

    if (resultado.criticoDefensivo) {
      // Contra-ataque
      setTimeout(() => {
        const contra = resolverContraAtaque(target, currentChar, resultado.fa / 2)
        contra.logs.forEach(l => addLog(`  ↺ ${l}`))
        if (contra.dano > 0) {
          setCharacters(prev =>
            prev.map(c =>
              c.id === currentChar.id
                ? { ...c, hp: Math.max(0, c.hp - contra.dano) }
                : c
            )
          )
          addLog(`  ${currentChar.nome} recebe ${contra.dano} de dano do contra-ataque!`)
        }

        // Ataque extra
        if (resultado.ataqueExtra) {
          handleAtaqueExtra(currentChar, target, resultado.fa)
        } else {
          finishAfterAttack(target, resultado)
        }
      }, 800)
    } else {
      // Apply damage
      if (resultado.dano > 0) {
        setCharacters(prev =>
          prev.map(c =>
            c.id === target.id
              ? { ...c, hp: Math.max(0, c.hp - resultado.dano) }
              : c
          )
        )
        addLog(`  💥 ${target.nome} recebe ${resultado.dano} de dano!`)
      } else {
        addLog(`  🛡️ Nenhum dano causado!`)
      }

      // Ataque extra
      if (resultado.ataqueExtra) {
        setTimeout(() => handleAtaqueExtra(currentChar, target, resultado.fa), 800)
      } else {
        setTimeout(() => finishAfterAttack(target, resultado), 500)
      }
    }
  }

  function handleAtaqueExtra(atacante, alvo, faBase) {
    const faExtra = Math.round((faBase / 2) * 10) / 10
    addLog(`⚡ ATAQUE EXTRA! FA = ${faExtra}`)

    const d6Atk = rolarD6()
    // Simplified extra attack
    const danoExtra = Math.max(1, Math.round(faExtra - (alvo.arm + alvo.agi * 0.25)))
    if (danoExtra > 0) {
      setCharacters(prev =>
        prev.map(c =>
          c.id === alvo.id
            ? { ...c, hp: Math.max(0, c.hp - danoExtra) }
            : c
        )
      )
      addLog(`  💥 Dano extra: ${danoExtra}`)
    }
    finishAfterAttack(alvo, { dano: danoExtra })
  }

  function finishAfterAttack(target, resultado) {
    setAnimating(false)
    setD6Result(null)
    setHasActed(true)

    // Check if target died
    const updatedTarget = characters.find(c => c.id === target.id)
    if (updatedTarget && updatedTarget.hp <= 0) {
      setCharacters(prev =>
        prev.map(c => c.id === target.id ? { ...c, vivo: false } : c)
      )
      addLog(`💀 ${target.nome} foi derrotado!`)
    }

    finishTurn()
  }

  function useItem(tipo) {
    if (!currentChar || animating || hasActed) return
    const key = tipo === 'hp' ? 'pocaoHP' : 'pocaoMP'
    const qty = currentChar.inventario?.[key] || 0
    if (qty <= 0) return

    setCharacters(prev =>
      prev.map(c => {
        if (c.id !== currentChar.id) return c
        const newQty = (c.inventario?.[key] || 0) - 1
        const bonus = tipo === 'hp' ? 5 : 5
        const max = tipo === 'hp' ? c.hpMax : c.mpMax
        const newVal = Math.min(max, (tipo === 'hp' ? c.hp : c.mp) + bonus)
        return {
          ...c,
          [tipo === 'hp' ? 'hp' : 'mp']: newVal,
          inventario: { ...c.inventario, [key]: newQty },
        }
      })
    )
    addLog(`💊 ${currentChar.nome} usou Poção ${tipo === 'hp' ? 'HP' : 'MP'}! (+5)`)
    setHasActed(true)
    finishTurn()
  }

  function finishTurn() {
    // Check win condition
    const playerAlive = characters.filter(c => c.vivo && c.time === 'jogador')
    const iaAlive = characters.filter(c => c.vivo && c.time === 'ia')

    if (playerAlive.length === 0) {
      setWinner('ia')
      setPhase('resultado')
      addLog('🏆 IA venceu a partida!')
      return
    }
    if (iaAlive.length === 0) {
      setWinner('jogador')
      setPhase('resultado')
      addLog('🏆 Jogador venceu a partida!')
      return
    }

    // Next turn
    const nextTurn = (currentTurn + 1) % turnOrder.length
    setCurrentTurn(nextTurn)
    setHasActed(false)
    setHasMoved(false)

    const nextChar = characters.find(c => c.id === turnOrder[nextTurn])
    if (nextChar?.time === 'ia') {
      setPhase('enemy_turn')
      setTimeout(() => executeIA(nextChar), 1000)
    } else {
      startMovementPhase(nextChar)
    }
  }

  function startMovementPhase(char) {
    if (!char) return
    const moveCells = getCelulasAlcance(
      char.posicao.row, char.posicao.col,
      getCasasMovimento(char.agi),
      cols, rows, obstaculos
    )
    // Filter out cells occupied by other characters
    const freeCells = moveCells.filter(c => {
      const occupied = characters.some(ch =>
        ch.vivo && ch.id !== char.id && ch.posicao?.row === c.row && ch.posicao?.col === c.col
      )
      const hasObstacle = obstaculos[`${c.row}_${c.col}`]?.tipo === 1
      return !occupied && !hasObstacle
    })
    setHighlightedCells(freeCells)
    setRemainingMove(getCasasMovimento(char.agi))
    setPhase('movement')
  }

  // IA execution
  function executeIA(iaChar) {
    setIaThinking(true)
    addLog(`🤖 Turno da IA: ${iaChar.nome}`)

    // Phase 1: Movement (with delay)
    setTimeout(() => {
      addLog(`  ${iaChar.nome} está pensando... (Fase de Movimento)`)
      const playerChars = characters.filter(c => c.vivo && c.time === 'jogador')
      const iaChars = characters.filter(c => c.vivo && c.time === 'ia')

      const decisao = decidirAcaoIA(
        iaChar, playerChars, characters, obstaculos, cols, rows, itensChaoAtual
      )

      if (decisao.tipo === 'andar') {
        setCharacters(prev =>
          prev.map(c =>
            c.id === iaChar.id
              ? { ...c, posicao: { row: decisao.detalhes.row, col: decisao.detalhes.col } }
              : c
          )
        )
        decisao.logs.forEach(l => addLog(`  ${l}`))
      }

      // Phase 2: Action (with more delay)
      setTimeout(() => {
        addLog(`  ${iaChar.nome} está decidindo ação... (Fase de Ação)`)

        const decisao2 = decidirAcaoIA(
          characters.find(c => c.id === iaChar.id) || iaChar,
          characters.filter(c => c.vivo && c.time === 'jogador'),
          characters, obstaculos, cols, rows, itensChaoAtual
        )

        if (decisao2.tipo === 'atacar') {
          const target = decisao2.detalhes.alvo
          const resultado = decisao2.detalhes.resultado

          if (resultado.dano > 0) {
            setCharacters(prev =>
              prev.map(c =>
                c.id === target.id
                  ? { ...c, hp: Math.max(0, c.hp - resultado.dano) }
                  : c
              )
            )
          }

          decisao2.logs.forEach(l => addLog(`  ${l}`))

          // Check for death
          const updatedTarget = characters.find(c => c.id === target.id)
          if (updatedTarget && target.hp - resultado.dano <= 0) {
            setTimeout(() => {
              setCharacters(prev =>
                prev.map(c => c.id === target.id ? { ...c, vivo: false } : c)
              )
              addLog(`💀 ${target.nome} foi derrotado!`)
            }, 300)
          }
        } else {
          decisao2.logs.forEach(l => addLog(`  ${l}`))
        }

        // Finalizar turno da IA
        setTimeout(() => {
          setIaThinking(false)
          addLog(`  ✅ ${iaChar.nome} finalizou o turno.`)

          // Check win condition
          const pAlive = characters.filter(c => c.vivo && c.time === 'jogador')
          const iAlive = characters.filter(c => c.vivo && c.time === 'ia')

          if (pAlive.length === 0) {
            setWinner('ia')
            setPhase('resultado')
            addLog('🏆 IA venceu a partida!')
            return
          }
          if (iAlive.length === 0) {
            setWinner('jogador')
            setPhase('resultado')
            addLog('🏆 Jogador venceu a partida!')
            return
          }

          const nextTurn = (currentTurn + 1) % turnOrder.length
          setCurrentTurn(nextTurn)
          setHasActed(false)
          setHasMoved(false)

          const nextChar = characters.find(c => c.id === turnOrder[nextTurn])
          if (nextChar?.time === 'ia') {
            setPhase('enemy_turn')
            setTimeout(() => executeIA(nextChar), 1200)
          } else if (nextChar) {
            startMovementPhase(nextChar)
          }
        }, 800)
      }, 1200)
    }, 800)
  }

  function addLog(text) {
    setBattleLog(prev => [...prev, { text, time: Date.now() }])
  }

  // Start action phase (when player clicks "Ação" button)
  function startActionPhase() {
    if (!currentChar) return
    const atkCells = getCelulasAtaque(
      currentChar.posicao.row, currentChar.posicao.col,
      currentChar.tipoAtaque, cols, rows,
      currentChar.tipoAtaque === 'melee' ? 1 : 4
    )
    // Filter only cells with enemies
    const enemyCells = atkCells.filter(c => {
      return characters.some(ch => ch.vivo && ch.time !== currentChar.time && ch.posicao?.row === c.row && ch.posicao?.col === c.col)
    })
    setAttackCells(enemyCells)
    setHighlightedCells([])
    setPhase('action')
  }

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
          <p className="tab-combat-result-sub">
            {t('prototype.arena_testbed.match_over')}
          </p>
          <button
            className="tab-btn tab-btn-primary"
            onClick={onBackToPhase1}
          >
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
        <h3>{t('prototype.arena_testbed.phase3_title')}</h3>
        <div className="tab-combat-turn-info">
          {currentChar && (
            <span className={`tab-combat-turn-char ${currentChar.time}`}>
              {t('prototype.arena_testbed.turn_of')} {currentChar.nome}
              {iaThinking && ` (${t('prototype.arena_testbed.thinking')})`}
            </span>
          )}
        </div>
      </div>

      <div className="tab-combat-body">
        {/* Canvas board */}
        <div className="tab-combat-board">
          <canvas
            ref={canvasRef}
            className="tab-combat-canvas"
            onClick={handleCanvasClick}
          />
        </div>

        {/* Side panel */}
        <div className="tab-combat-side">
          {/* Character status */}
          <div className="tab-combat-status">
            <h4>{t('prototype.arena_testbed.characters')}</h4>
            {characters.filter(c => c.vivo).map(ch => (
              <div
                key={ch.id}
                className={`tab-combat-char-card ${ch.id === currentChar?.id ? 'active' : ''} ${!ch.vivo ? 'dead' : ''}`}
              >
                <div className="tab-combat-char-name">
                  <span className={`tab-combat-team-dot ${ch.time}`} />
                  {ch.nome}
                </div>
                <div className="tab-combat-char-bars">
                  <div className="tab-combat-bar-row">
                    <span className="tab-combat-bar-label hp">HP</span>
                    <div className="tab-combat-bar-track">
                      <div
                        className="tab-combat-bar-fill hp"
                        style={{ width: `${(ch.hp / ch.hpMax) * 100}%` }}
                      />
                    </div>
                    <span className="tab-combat-bar-val">{Math.ceil(ch.hp)}/{ch.hpMax}</span>
                  </div>
                  <div className="tab-combat-bar-row">
                    <span className="tab-combat-bar-label mp">MP</span>
                    <div className="tab-combat-bar-track">
                      <div
                        className="tab-combat-bar-fill mp"
                        style={{ width: `${(ch.mp / ch.mpMax) * 100}%` }}
                      />
                    </div>
                    <span className="tab-combat-bar-val">{Math.ceil(ch.mp)}/{ch.mpMax}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Combat controls */}
          {isPlayerTurn && !iaThinking && (
            <div className="tab-combat-controls">
              {phase === 'movement' && !hasActed && (
                <>
                  <p className="tab-combat-hint">
                    {t('prototype.arena_testbed.move_hint', { moves: remainingMove })}
                  </p>
                  <button
                    className="tab-btn tab-btn-secondary"
                    onClick={startActionPhase}
                    disabled={hasActed}
                  >
                    {t('prototype.arena_testbed.action_phase')} ⚔️
                  </button>
                </>
              )}
              {phase === 'action' && !hasActed && (
                <>
                  <p className="tab-combat-hint">
                    {hasMoved
                      ? t('prototype.arena_testbed.action_or_move_hint')
                      : t('prototype.arena_testbed.attack_hint')}
                  </p>
                  <div className="tab-combat-action-btns">
                    <button
                      className="tab-btn tab-btn-primary"
                      onClick={() => {
                        if (attackCells.length > 0) {
                          // Attack via clicking canvas
                        }
                      }}
                      disabled={attackCells.length === 0}
                    >
                      {t('prototype.arena_testbed.attack_btn')}
                      {currentChar?.tipoAtaque === 'melee'
                        ? ` (${t('prototype.arena_testbed.melee_short')})`
                        : ` (${t('prototype.arena_testbed.distance_short')})`
                      }
                    </button>
                    {currentChar?.inventario?.pocaoHP > 0 && (
                      <button
                        className="tab-btn tab-btn-secondary"
                        onClick={() => useItem('hp')}
                      >
                        ❤️ {t('prototype.arena_testbed.use_hp_potion')} ({currentChar.inventario.pocaoHP})
                      </button>
                    )}
                    {currentChar?.inventario?.pocaoMP > 0 && (
                      <button
                        className="tab-btn tab-btn-secondary"
                        onClick={() => useItem('mp')}
                      >
                        💙 {t('prototype.arena_testbed.use_mp_potion')} ({currentChar.inventario.pocaoMP})
                      </button>
                    )}
                  </div>
                  <button
                    className="tab-btn tab-btn-gold"
                    onClick={finishTurn}
                  >
                    {t('prototype.arena_testbed.end_turn')}
                  </button>
                </>
              )}
              {hasActed && (
                <button
                  className="tab-btn tab-btn-gold"
                  onClick={finishTurn}
                >
                  {t('prototype.arena_testbed.end_turn')}
                </button>
              )}
            </div>
          )}

          {iaThinking && (
            <div className="tab-combat-ia-thinking">
              <span className="tab-combat-ia-dots">
                {t('prototype.arena_testbed.ia_thinking')}
              </span>
            </div>
          )}

          {/* Battle Log */}
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
