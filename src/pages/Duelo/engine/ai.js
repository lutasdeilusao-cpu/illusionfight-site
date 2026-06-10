// IA — CAMPO DE BATALHA v2.0
// Lógica de decisão por prioridade no grid 5×5
// Três fases: DESCER → MOVIMENTO → ATAQUE

import { getMoveRange, getAttackRange, manhattan, GRID_ROWS, GRID_COLS, isAiTerritory } from './gameState'
import { applySpellEffect } from './effects'

function getAiMonsters(grid) {
  const list = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (grid[r][c].monster && grid[r][c].monster.owner === 'AI') {
        list.push({ row: r, col: c, card: grid[r][c].monster })
      }
    }
  }
  return list
}

function getPlayerMonsters(grid) {
  const list = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (grid[r][c].monster && grid[r][c].monster.owner === 'PLAYER') {
        list.push({ row: r, col: c, card: grid[r][c].monster })
      }
    }
  }
  return list
}

function getEffectiveAtk(card, buffs) {
  const buff = buffs?.find(b => b.cardId === card.id_num)
  return (card.atk || 0) + (buff?.atkBonus || 0)
}

function getEffectiveDef(card, buffs) {
  const buff = buffs?.find(b => b.cardId === card.id_num)
  return (card.def || 0) + (buff?.defBonus || 0)
}

function getEffectiveMov(card, buffs) {
  const buff = buffs?.find(b => b.cardId === card.id_num)
  return Math.max(0, (card.mov || 0) + (buff?.movBonus || 0))
}

function getEffectiveRng(card, buffs) {
  const buff = buffs?.find(b => b.cardId === card.id_num)
  return Math.max(1, (card.rng || 0) + (buff?.rngBonus || 0))
}

// Sacrifício: quantos monstros sacrificar por estrelas
function aiSacrificiosNecessarios(estrelas) {
  if (estrelas <= 3) return 0
  if (estrelas === 4) return 1
  if (estrelas === 5) return 2
  return 3 // 6★
}

// Conta monstros da IA no grid
function countAiMonsters(grid) {
  let count = 0
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++)
      if (grid[r][c]?.monster?.owner === 'AI') count++
  return count
}

// Sacrifica N monstros da IA no grid (remove os primeiros encontrados)
function sacrificeAiMonsters(grid, qtd) {
  const newGrid = grid.map(r => r.map(c => ({ ...c })))
  let removed = 0
  for (let r = 0; r < GRID_ROWS && removed < qtd; r++) {
    for (let c = 0; c < GRID_COLS && removed < qtd; c++) {
      if (newGrid[r][c]?.monster?.owner === 'AI') {
        newGrid[r][c] = { ...newGrid[r][c], monster: null }
        removed++
      }
    }
  }
  return newGrid
}

// Encontra posição para invocar — prioriza fileira da frente (row 2 para AI no 8x8)
function findSummonPosition(grid, isAi) {
  // Pode invocar em QUALQUER célula vazia do tabuleiro
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!grid[r][c].monster) return { row: r, col: c }
    }
  }
  return null
}

// Encontra posição para armadilha em QUALQUER célula do tabuleiro
function findTrapPosition(grid) {
  const candidates = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!grid[r][c].monster && !grid[r][c].trap) candidates.push({ row: r, col: c })
    }
  }
  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

// ── FASE 1: DESCER (IA coloca cartas no tabuleiro) ──
export function aiDescerFase(state) {
  let grid = state.grid.map(row => row.map(cell => ({ ...cell })))
  let newHand = [...state.aiHand]
  let newGraveyard = [...state.aiGraveyard]
  let newBuffs = [...(state.tempBuffs || [])]
  let playerLP = state.playerLP
  let aiLP = state.aiLP
  let battleLog = [...state.battleLog]

  // 1a. Coloca monstros (prioridade alta) — RESPEITANDO REGRAS DE SACRIFÍCIO
  const monsters = newHand.filter(c => c.type === 'MONSTER').sort((a, b) => b.atk - a.atk)
  const existingMonsters = getAiMonsters(grid).length
  const maxOnField = 3
  const slotsLeft = maxOnField - existingMonsters
  let currentGrid = grid

  if (slotsLeft > 0) {
    // Primeiro turno: IA só desce 1 monstro
    const maxSlots = state.isFirstTurn ? Math.min(1, slotsLeft) : slotsLeft
    let placed = 0
    for (const card of monsters) {
      if (placed >= maxSlots) break

      const sacrificios = aiSacrificiosNecessarios(card.estrelas || 1)
      const aiMonstrosNoCampo = countAiMonsters(currentGrid)

      if (sacrificios > 0 && aiMonstrosNoCampo < sacrificios) {
        // Não pode invocar — pula essa carta e tenta próxima de menor custo
        battleLog.push(`⏭️ IA não pode invocar ${card.name} (${card.estrelas}★ — precisa de ${sacrificios} sacrifício(s), tem ${aiMonstrosNoCampo} monstro(s)).`)
        continue
      }

      // Se precisa sacrificar, remove monstros do campo primeiro
      if (sacrificios > 0) {
        currentGrid = sacrificeAiMonsters(currentGrid, sacrificios)
        battleLog.push(`🔥 IA sacrificou ${sacrificios} monstro(s) para invocar ${card.name}.`)
      }

      const pos = findSummonPosition(currentGrid, true)
      if (!pos) break
      currentGrid[pos.row][pos.col] = { monster: { ...card, owner: 'AI' }, trap: currentGrid[pos.row][pos.col]?.trap || null }
      newHand = newHand.filter(c => c.id_num !== card.id_num)
      battleLog.push(`🃏 IA desceu ${card.name} (${card.atk}/${card.def}) em [${pos.row},${pos.col}].`)
      placed++
    }
    // Atualiza grid com as modificações
    grid = currentGrid
  }

  // 1b. Coloca armadilhas (se houver espaços) — com duração em turnos
  const traps = newHand.filter(c => c.type === 'TRAP')
  for (const trap of traps) {
    const pos = findTrapPosition(grid)
    if (!pos) break
    const duracaoPadrao = 3
    grid[pos.row][pos.col] = { ...grid[pos.row][pos.col], trap: {
      ...trap, revealed: false, owner: 'AI',
      turnoAtivacao: state.turnNumber,
      duracaoTurnos: duracaoPadrao,
      turnosRestantes: duracaoPadrao,
    } }
    newHand = newHand.filter(c => c.id_num !== trap.id_num)
    battleLog.push(`🕳️ IA armou ${trap.name} em [${pos.row},${pos.col}].`)
  }

  // 1c. Usa magias (HEAL se LP baixo, BURN se possível)
  const spells = newHand.filter(c => c.type === 'SPELL')
  for (const spell of spells) {
    if (spell.effect === 'BURN' && playerLP <= spell.effectValue) {
      playerLP = 0
      newHand = newHand.filter(c => c.id_num !== spell.id_num)
      newGraveyard.push(spell)
      battleLog.push(`🔥 IA usou ${spell.name}! ${spell.effectValue} de dano direto!`)
      return {
        playerLP, aiLP, grid, aiHand: newHand, aiGraveyard: newGraveyard,
        tempBuffs: newBuffs, battleLog,
        monstersThatMoved: state.monstersThatMoved,
        monstersThatAttacked: state.monstersThatAttacked,
        gamePhase: 'OVER', winner: 'AI',
      }
    }
    if (spell.effect === 'HEAL' && aiLP <= 500) {
      aiLP = Math.min(1000, aiLP + (spell.effectValue || 300))
      newHand = newHand.filter(c => c.id_num !== spell.id_num)
      newGraveyard.push(spell)
      battleLog.push(`💚 IA usou ${spell.name}! +${spell.effectValue || 300} LP.`)
    }
  }

  return {
    playerLP, aiLP, grid, aiHand: newHand, aiGraveyard: newGraveyard,
    tempBuffs: newBuffs, battleLog,
    monstersThatMoved: state.monstersThatMoved,
    monstersThatAttacked: state.monstersThatAttacked,
  }
}

// ── FASE 2: MOVIMENTO (IA move monstros) ──
export function aiMovimentoFase(state) {
  const grid = state.grid.map(row => row.map(cell => ({ ...cell })))
  let battleLog = [...state.battleLog]
  let monstersThatMoved = [...state.monstersThatMoved]
  let newBuffs = [...(state.tempBuffs || [])]

  const aiMonsters = getAiMonsters(grid)
  const playerMonsters = getPlayerMonsters(grid)

  for (const m of aiMonsters) {
    const alreadyMoved = monstersThatMoved.some(mt => mt.id === m.card.id_num)
    const alreadyAttacked = state.monstersThatAttacked.some(mt => mt.id === m.card.id_num)
    if (alreadyMoved || alreadyAttacked) continue

    const effMov = getEffectiveMov(m.card, newBuffs)
    const effRng = getEffectiveRng(m.card, newBuffs)
    if (effMov <= 0) continue

    // Verifica se já pode atacar da posição atual
    const attackRange = getAttackRange(grid, m.row, m.col, effRng, 'AI')
    const canAttackNow = playerMonsters.some(pm => attackRange.some(c => c.row === pm.row && c.col === pm.col))
    if (canAttackNow) continue // não precisa mover

    // Tenta se mover para mais perto do inimigo
    const moveRange = getMoveRange(grid, m.row, m.col, effMov, 'AI')
    let bestMove = null
    let bestDist = Infinity

    for (const pm of playerMonsters) {
      for (const mv of moveRange) {
        const dist = manhattan(mv.row, mv.col, pm.row, pm.col)
        if (dist < bestDist) {
          bestDist = dist
          bestMove = mv
        }
      }
    }

    if (bestMove) {
      // Verifica armadilha no destino
      const trapAtDest = grid[bestMove.row][bestMove.col].trap
      grid[bestMove.row][bestMove.col] = { monster: m.card, trap: grid[bestMove.row][bestMove.col]?.trap || null }
      grid[m.row][m.col] = { monster: null, trap: grid[m.row][m.col]?.trap || null }
      monstersThatMoved.push({ id: m.card.id_num })
      battleLog.push(`IA moveu ${m.card.name} de [${m.row},${m.col}] para [${bestMove.row},${bestMove.col}].`)

      if (trapAtDest) {
        battleLog.push(`⚠️ ${m.card.name} ativou uma armadilha!`)
        // Aplica dano da armadilha
        if (trapAtDest.effect === 'DAMAGE' || trapAtDest.effect === 'THORNS') {
          const dmg = trapAtDest.effectValue || 0
          // Trap afeta dono do monstro (AI)
          // (simplificado)
        }
        // Remove armadilha
        grid[bestMove.row][bestMove.col] = { ...grid[bestMove.row][bestMove.col], trap: null }
      }
    }
  }

  return {
    grid, battleLog, monstersThatMoved, tempBuffs: newBuffs,
  }
}

// ── FASE 3: ATAQUE (IA ataca com monstros) ──
export function aiAtaqueFase(state) {
  const grid = state.grid.map(row => row.map(cell => ({ ...cell })))
  let playerLP = state.playerLP
  let aiLP = state.aiLP
  let newGraveyard = [...state.aiGraveyard]
  let battleLog = [...state.battleLog]
  let monstersThatAttacked = [...state.monstersThatAttacked]
  let newBuffs = [...(state.tempBuffs || [])]

  const aiMonsters = getAiMonsters(grid)
  const playerMonsters = getPlayerMonsters(grid)

  for (const m of aiMonsters) {
    const alreadyAttacked = monstersThatAttacked.some(mt => mt.id === m.card.id_num)
    if (alreadyAttacked) continue

    const effAtk = getEffectiveAtk(m.card, newBuffs)
    const effDef = getEffectiveDef(m.card, newBuffs)
    const effRng = getEffectiveRng(m.card, newBuffs)

    const attackRange = getAttackRange(grid, m.row, m.col, effRng, 'AI')
    let bestTarget = null
    let bestScore = -Infinity

    for (const t of playerMonsters) {
      const inRange = attackRange.some(c => c.row === t.row && c.col === t.col)
      if (!inRange) continue
      const tDef = getEffectiveDef(t.card, newBuffs)
      if (effAtk > tDef) {
        const score = t.card.atk
        if (score > bestScore) { bestScore = score; bestTarget = t }
      }
    }

    if (!bestTarget) continue // sem alvo no RNG

    const tDef = getEffectiveDef(bestTarget.card, newBuffs)

    if (effAtk > tDef) {
      const diff = effAtk - tDef
      playerLP = Math.max(0, playerLP - diff)
      newGraveyard.push(bestTarget.card)
      grid[bestTarget.row][bestTarget.col] = { monster: null, trap: grid[bestTarget.row][bestTarget.col]?.trap || null }
      battleLog.push(`💥 ${m.card.name} (${effAtk}) destruiu ${bestTarget.card.name} (${tDef})! ${diff} de dano!`)
    } else if (effAtk < tDef) {
      const diff = tDef - effAtk
      aiLP = Math.max(0, aiLP - diff)
      newGraveyard.push(m.card)
      grid[m.row][m.col] = { monster: null, trap: grid[m.row][m.col]?.trap || null }
      battleLog.push(`💥 ${m.card.name} (${effAtk}) foi destruído por ${bestTarget.card.name} (${tDef})! ${diff} de dano!`)
    } else {
      battleLog.push(`⚔️ ${m.card.name} vs ${bestTarget.card.name}: empate!`)
    }
    monstersThatAttacked.push({ id: m.card.id_num })

    // Verifica vitória
    if (playerLP <= 0) {
      return {
        grid, playerLP, aiLP, aiGraveyard: newGraveyard,
        tempBuffs: newBuffs, battleLog, monstersThatAttacked,
        gamePhase: 'OVER', winner: 'AI',
      }
    }
  }

  return {
    grid, playerLP, aiLP, aiGraveyard: newGraveyard,
    tempBuffs: newBuffs, battleLog, monstersThatAttacked,
  }
}
