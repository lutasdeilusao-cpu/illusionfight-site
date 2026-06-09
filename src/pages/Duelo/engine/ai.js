// IA — CAMPO DE BATALHA
// Lógica de decisão por prioridade no grid 5×5

import { getMoveRange, getAttackRange, manhattan, GRID_ROWS, GRID_COLS } from './gameState'

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

// Encontra posição para invocar — prioriza fileira da frente (row 1 para AI)
function findSummonPosition(grid, isAi) {
  const rows = isAi ? [1, 0] : [3, 4] // AI: row 1 (frente) depois row 0
  for (const r of rows) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!grid[r][c].monster) return { row: r, col: c }
    }
  }
  return null
}

// Fase de Preparação da IA — posiciona monstros iniciais
export function aiPreparationPhase(state) {
  const hand = state.aiHand
  const grid = state.grid.map(row => row.map(cell => ({ ...cell })))
  let newHand = [...hand]
  const monsters = hand.filter(c => c.type === 'MONSTER').sort((a, b) => b.atk - a.atk)
  const logs = []

  // Posiciona até 3 monstros
  let placed = 0
  for (const card of monsters) {
    if (placed >= 3) break
    const pos = findSummonPosition(grid, true)
    if (!pos) break
    grid[pos.row][pos.col] = { monster: { ...card, owner: 'AI' }, trap: grid[pos.row][pos.col].trap }
    newHand = newHand.filter(c => c.id_num !== card.id_num)
    placed++
    logs.push(`IA posicionou ${card.name} (${card.atk}/${card.def}) em [${pos.row},${pos.col}].`)
  }

  // Posiciona armadilhas nas duas fileiras (rows 0-1)
  const traps = newHand.filter(c => c.type === 'TRAP')
  let trapPlaced = 0
  for (const trap of traps) {
    if (trapPlaced >= 3) break
    // Escolhe casa aleatória vazia (sem monstro e sem armadilha) nas rows 0-1
    const candidates = []
    for (let r = 0; r <= 1; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (!grid[r][c].monster && !grid[r][c].trap) candidates.push({ row: r, col: c })
      }
    }
    if (candidates.length === 0) break
    const pos = candidates[Math.floor(Math.random() * candidates.length)]
    grid[pos.row][pos.col] = { ...grid[pos.row][pos.col], trap: { ...trap, revealed: false } }
    newHand = newHand.filter(c => c.id_num !== trap.id_num)
    trapPlaced++
    logs.push(`IA armou ${trap.name} em [${pos.row},${pos.col}].`)
  }

  return { grid, aiHand: newHand, battleLog: [...state.battleLog, ...logs] }
}

// Turno completo da IA (executado em sequência)
export function aiTurn(state) {
  const actions = []
  const grid = state.grid.map(row => row.map(cell => ({ ...cell })))
  let newHand = [...state.aiHand]
  let newGraveyard = [...state.aiGraveyard]
  let newBuffs = [...(state.tempBuffs || [])]
  let playerLP = state.playerLP
  let aiLP = state.aiLP
  let battleLog = [...state.battleLog]
  let monstersThatMoved = [...(state.monstersThatMoved || [])]
  let monstersThatAttacked = [...(state.monstersThatAttacked || [])]
  let hasSummonedThisTurn = state.hasSummonedThisTurn
  let hasPlayedMagicThisTurn = state.hasPlayedMagicThisTurn

  // 1. INVOCAR — se ainda não invocou neste turno
  if (!hasSummonedThisTurn) {
    const summonable = newHand.filter(c => c.type === 'MONSTER').sort((a, b) => b.atk - a.atk)
    for (const card of summonable) {
      const pos = findSummonPosition(grid, true)
      if (!pos) break
      grid[pos.row][pos.col] = { monster: { ...card, owner: 'AI' }, trap: grid[pos.row][pos.col]?.trap || null }
      newHand = newHand.filter(c => c.id_num !== card.id_num)
      hasSummonedThisTurn = true
      battleLog.push(`IA invocou ${card.name} (${card.atk}/${card.def}) em [${pos.row},${pos.col}].`)
      break
    }
  }

  // 2. MOVIMENTO + ATAQUE para cada monstro
  const aiMonsters = getAiMonsters(grid)
  for (const m of aiMonsters) {
    const alreadyMoved = monstersThatMoved.some(mt => mt.row === m.row && mt.col === m.col)
    const alreadyAttacked = monstersThatAttacked.some(mt => mt.row === m.row && mt.col === m.col)

    if (alreadyAttacked) continue

    const effAtk = getEffectiveAtk(m.card, newBuffs)
    const effDef = getEffectiveDef(m.card, newBuffs)
    const effMov = getEffectiveMov(m.card, newBuffs)
    const effRng = getEffectiveRng(m.card, newBuffs)

    const playerMonsters = getPlayerMonsters(grid)

    // Procura alvo no RNG
    const attackRange = getAttackRange(grid, m.row, m.col, effRng, 'AI')
    let bestTarget = null
    let bestScore = -Infinity

    for (const t of playerMonsters) {
      const inRange = attackRange.some(c => c.row === t.row && c.col === t.col)
      if (!inRange) continue
      const tDef = getEffectiveDef(t.card, newBuffs)
      if (effAtk > tDef) {
        const score = t.card.atk // prioriza matar monstros fortes
        if (score > bestScore) { bestScore = score; bestTarget = t }
      }
    }

    if (bestTarget) {
      // Ataca!
      const tDef = getEffectiveDef(bestTarget.card, newBuffs)
      if (effAtk > tDef) {
        const diff = effAtk - tDef
        const defIsPlayer = bestTarget.card.owner === 'PLAYER'
        if (defIsPlayer) playerLP = Math.max(0, playerLP - diff)
        else aiLP = Math.max(0, aiLP - diff)
        // Destrói defensor
        newGraveyard.push(bestTarget.card)
        grid[bestTarget.row][bestTarget.col] = { monster: null, trap: grid[bestTarget.row][bestTarget.col]?.trap || null }
        battleLog.push(`💥 ${m.card.name} (${effAtk}) destruiu ${bestTarget.card.name} (${tDef})! ${diff} de dano.`)
      } else if (effAtk < tDef) {
        // Atacante morre
        const diff = tDef - effAtk
        aiLP = Math.max(0, aiLP - diff)
        newGraveyard.push(m.card)
        grid[m.row][m.col] = { monster: null, trap: grid[m.row][m.col]?.trap || null }
        battleLog.push(`💥 ${m.card.name} (${effAtk}) foi destruído por ${bestTarget.card.name} (${tDef})! ${diff} de dano.`)
      } else {
        battleLog.push(`⚔️ ${m.card.name} vs ${bestTarget.card.name}: empate!`)
      }
      monstersThatAttacked.push({ row: m.row, col: m.col })
      continue
    }

    // Sem alvo no RNG — tenta se mover em direção ao inimigo mais próximo
    if (!alreadyMoved && effMov > 0) {
      const moveRange = getMoveRange(grid, m.row, m.col, effMov, 'AI')
      let bestMove = null
      let bestDist = Infinity

      for (const pm of playerMonsters) {
        for (const mv of moveRange) {
          const dist = manhattan(mv.row, mv.col, pm.row, pm.col)
          if (dist < bestDist) {
            // Verifica se da nova posição consegue atacar
            const newRange = getAttackRange(grid, mv.row, mv.col, effRng, 'AI')
            const canAttack = newRange.some(c => c.row === pm.row && c.col === pm.col)
            if (canAttack || dist < bestDist) {
              bestDist = dist
              bestMove = mv
            }
          }
        }
      }

      if (bestMove) {
        grid[bestMove.row][bestMove.col] = { monster: m.card, trap: grid[bestMove.row][bestMove.col]?.trap || null }
        grid[m.row][m.col] = { monster: null, trap: grid[m.row][m.col]?.trap || null }
        monstersThatMoved.push({ row: m.row, col: m.col })
        battleLog.push(`IA moveu ${m.card.name} de [${m.row},${m.col}] para [${bestMove.row},${bestMove.col}].`)
      }
    }
  }

  // 3. MAGIA — tenta usar burn ou heal
  if (!hasPlayedMagicThisTurn) {
    const spells = newHand.filter(c => c.type === 'SPELL')
    // Burn spell que mata
    const killSpell = spells.find(c => c.effect === 'BURN' && playerLP <= c.effectValue)
    if (killSpell) {
      playerLP = 0
      newHand = newHand.filter(c => c.id_num !== killSpell.id_num)
      newGraveyard.push(killSpell)
      battleLog.push(`🔥 IA usou ${killSpell.name}! ${killSpell.effectValue} de dano direto!`)
      return {
        playerLP, aiLP, grid, aiHand: newHand, aiGraveyard: newGraveyard,
        tempBuffs: newBuffs, battleLog, monstersThatMoved, monstersThatAttacked,
        hasSummonedThisTurn, hasPlayedMagicThisTurn: true,
        winner: 'AI', gamePhase: 'OVER',
      }
    }
    // Heal se LP baixo
    const healSpell = spells.find(c => c.effect === 'HEAL' && aiLP <= 500)
    if (healSpell) {
      aiLP = Math.min(1000, aiLP + healSpell.effectValue)
      newHand = newHand.filter(c => c.id_num !== healSpell.id_num)
      newGraveyard.push(healSpell)
      hasPlayedMagicThisTurn = true
      battleLog.push(`💚 IA usou ${healSpell.name}! +${healSpell.effectValue} LP.`)
    }
  }

  return {
    playerLP, aiLP, grid, aiHand: newHand, aiGraveyard: newGraveyard,
    tempBuffs: newBuffs, battleLog, monstersThatMoved, monstersThatAttacked,
    hasSummonedThisTurn, hasPlayedMagicThisTurn,
  }
}
