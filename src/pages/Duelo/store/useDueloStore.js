import { create } from 'zustand'
import { createInitialState, createEmptyGrid, getMoveRange, getAttackRange, GRID_ROWS, GRID_COLS } from '../engine/gameState'
import { applySpellEffect, applyTrapEffect } from '../engine/effects'

export const useDueloStore = create((set, get) => ({
  ...createInitialState(),

  // ── Ações utilitárias ──
  setState: (partial) => set(typeof partial === 'function' ? partial : partial),
  resetGame: () => set(createInitialState()),

  // ── Compra ──
  drawCard: () => {
    const state = get()
    const isPlayer = state.currentTurn === 'PLAYER'
    const deckKey = isPlayer ? 'playerDeck' : 'aiDeck'
    const handKey = isPlayer ? 'playerHand' : 'aiHand'
    const deck = state[deckKey]
    if (deck.length === 0) {
      set({ winner: isPlayer ? 'AI' : 'PLAYER', gamePhase: 'OVER',
        battleLog: [...state.battleLog, isPlayer ? 'Você ficou sem cartas!' : 'IA ficou sem cartas!'] })
      return
    }
    const newDeck = [...deck]
    const card = newDeck.pop()
    const newHand = [...state[handKey], card]
    set({
      [deckKey]: newDeck,
      [handKey]: newHand,
      gamePhase: 'INVOCAR',
      hasSummonedThisTurn: false,
      hasPlayedMagicThisTurn: false,
      monstersThatMoved: [],
      monstersThatAttacked: [],
      selectedMonster: null,
      moveCells: [],
      attackCells: [],
      battleLog: [...state.battleLog, isPlayer ? `Você comprou: ${card.name}` : 'IA comprou 1 carta'],
    })
  },

  // ── Fase de Preparação ──
  startPreparation: () => {
    const state = get()
    // Posiciona monstros iniciais automaticamente para o jogador (3 primeiros da mão)
    const grid = state.grid.map(row => row.map(cell => ({ ...cell })))
    let hand = [...state.playerHand]
    const monsters = hand.filter(c => c.type === 'MONSTER').slice(0, 3)
    const logs = []
    let placed = 0
    for (const card of monsters) {
      const row = 4 - placed // row 4, 3, 2...
      if (row < 2) break
      const col = 2 // centro
      if (!grid[row][col].monster) {
        grid[row][col] = { monster: { ...card, owner: 'PLAYER' }, trap: grid[row][col].trap }
        hand = hand.filter(c => c.id_num !== card.id_num)
        placed++
        logs.push(`Você posicionou ${card.name} (${card.atk}/${card.def}) na fileira ${row}.`)
      }
    }
    set({
      grid, playerHand: hand,
      preparationPhase: true,
      battleLog: [...state.battleLog, ...logs, 'Agora coloque suas armadilhas nas fileiras 3-4.'],
    })
  },

  // Posiciona armadilha na preparação
  placeTrapPrep: (row, col) => {
    const state = get()
    if (!state.preparationPhase) return
    const traps = state.playerHand.filter(c => c.type === 'TRAP')
    if (traps.length === 0) return
    if (row < 3 || row > 4) return // só nas próprias fileiras
    const grid = state.grid.map(r => r.map(c => ({ ...c })))
    if (grid[row][col].trap || grid[row][col].monster) return
    const trap = traps[0]
    grid[row][col] = { ...grid[row][col], trap: { ...trap, revealed: false } }
    const newHand = state.playerHand.filter(c => c.id_num !== trap.id_num)
    set({
      grid,
      playerHand: newHand,
      battleLog: [...state.battleLog, `Armadilha ${trap.name} colocada em [${row},${col}].`],
    })
  },

  // Finaliza preparação
  finishPreparation: () => {
    const state = get()
    set({
      preparationPhase: false,
      gamePhase: 'COMPRA',
      battleLog: [...state.battleLog, '⚔ Preparação concluída! Batalha iniciada!'],
    })
  },

  // ── Selecionar monstro no grid ──
  selectMonster: (row, col) => {
    const state = get()
    const cell = state.grid[row]?.[col]
    if (!cell?.monster) {
      set({ selectedMonster: null, moveCells: [], attackCells: [] })
      return
    }
    const card = cell.monster
    const buff = state.tempBuffs.find(b => b.cardId === card.id_num)
    const effMov = Math.max(0, (card.mov || 0) + (buff?.movBonus || 0))
    const effRng = Math.max(1, (card.rng || 0) + (buff?.rngBonus || 0))

    const moveCells = getMoveRange(state.grid, row, col, effMov, card.owner)
    const attackCells = getAttackRange(state.grid, row, col, effRng, card.owner)

    set({ selectedMonster: { row, col }, moveCells, attackCells })
  },

  clearSelection: () => set({ selectedMonster: null, moveCells: [], attackCells: [] }),

  // ── Mover monstro ──
  moveMonster: (toRow, toCol) => {
    const state = get()
    const sel = state.selectedMonster
    if (!sel) return
    const fromRow = sel.row, fromCol = sel.col
    const cell = state.grid[fromRow][fromCol]
    if (!cell.monster) return
    // Verifica se está nas casas de MOV
    const canMove = state.moveCells.some(c => c.row === toRow && c.col === toCol)
    if (!canMove) return
    // Verifica se já moveu
    const alreadyMoved = state.monstersThatMoved.some(m => m.row === fromRow && m.col === fromCol)
    if (alreadyMoved) return
    // Verifica se já atacou
    const alreadyAttacked = state.monstersThatAttacked.some(m => m.row === fromRow && m.col === fromCol)
    if (alreadyAttacked) return

    const grid = state.grid.map(r => r.map(c => ({ ...c })))
    const monster = grid[fromRow][fromCol].monster
    grid[toRow][toCol] = { ...grid[toRow][toCol], monster }
    grid[fromRow][fromCol] = { ...grid[fromRow][fromCol], monster: null }

    set({
      grid,
      monstersThatMoved: [...state.monstersThatMoved, { row: fromRow, col: fromCol }],
      selectedMonster: { row: toRow, col: toCol },
      moveCells: [],
      attackCells: [],
      battleLog: [...state.battleLog, `Você moveu ${monster.name} de [${fromRow},${fromCol}] para [${toRow},${toCol}].`],
    })
  },

  // ── Atacar ──
  attackMonster: (targetRow, targetCol) => {
    const state = get()
    const sel = state.selectedMonster
    if (!sel) return
    const fromRow = sel.row, fromCol = sel.col
    const cell = state.grid[fromRow][fromCol]
    if (!cell?.monster) return

    const attacker = cell.monster
    const owner = attacker.owner

    // Verifica se pode atacar (no RNG)
    const canAttack = state.attackCells.some(c => c.row === targetRow && c.col === targetCol)
    if (!canAttack) return

    // Verifica se já atacou
    const alreadyAttacked = state.monstersThatAttacked.some(m => m.row === fromRow && m.col === fromCol)
    if (alreadyAttacked) return

    const targetCell = state.grid[targetRow]?.[targetCol]
    if (!targetCell?.monster) return
    if (targetCell.monster.owner === owner) return // não ataca próprio aliado

    const defender = targetCell.monster

    // Buffs
    const aBuff = state.tempBuffs.find(b => b.cardId === attacker.id_num)
    const dBuff = state.tempBuffs.find(b => b.cardId === defender.id_num)
    const effAtk = (attacker.atk || 0) + (aBuff?.atkBonus || 0)
    const effDef = (defender.def || 0) + (dBuff?.defBonus || 0)

    const isPlayerAtk = owner === 'PLAYER'
    let playerLP = state.playerLP
    let aiLP = state.aiLP
    const grid = state.grid.map(r => r.map(c => ({ ...c })))
    let log = ''
    let newGraveyard = [...state.playerGraveyard]

    if (effAtk > effDef) {
      const diff = effAtk - effDef
      if (isPlayerAtk) aiLP = Math.max(0, aiLP - diff)
      else playerLP = Math.max(0, playerLP - diff)
      newGraveyard.push(defender)
      grid[targetRow][targetCol] = { monster: null, trap: grid[targetRow][targetCol]?.trap || null }
      log = `💥 ${attacker.name} (${effAtk}) destruiu ${defender.name} (${effDef})! ${diff} de dano.`
    } else if (effAtk < effDef) {
      const diff = effDef - effAtk
      if (isPlayerAtk) playerLP = Math.max(0, playerLP - diff)
      else aiLP = Math.max(0, aiLP - diff)
      newGraveyard.push(attacker)
      grid[fromRow][fromCol] = { monster: null, trap: grid[fromRow][fromCol]?.trap || null }
      log = `💥 ${attacker.name} (${effAtk}) foi destruído por ${defender.name} (${effDef})! ${diff} de dano.`
    } else {
      log = `⚔️ ${attacker.name} (${effAtk}) vs ${defender.name} (${effDef}): empate!`
    }

    const winner = playerLP <= 0 ? 'AI' : aiLP <= 0 ? 'PLAYER' : null

    set({
      grid,
      playerLP, aiLP,
      monstersThatAttacked: [...state.monstersThatAttacked, { row: fromRow, col: fromCol }],
      selectedMonster: null,
      moveCells: [],
      attackCells: [],
      battleLog: [...state.battleLog, log],
      ...(winner ? { winner, gamePhase: 'OVER' } : {}),
    })
  },

  // ── Invocar monstro da mão para o grid ──
  summonMonster: (cardId, row, col) => {
    const state = get()
    const isPlayer = state.currentTurn === 'PLAYER'
    if (isPlayer && state.gamePhase !== 'INVOCAR') return
    if (state.hasSummonedThisTurn) return

    const handKey = isPlayer ? 'playerHand' : 'aiHand'
    const hand = state[handKey]
    const card = hand.find(c => c.id_num === cardId)
    if (!card || card.type !== 'MONSTER') return

    // Verifica se a casa está no próprio território (rows 3-4 player, 0-1 AI)
    if (isPlayer && (row < 3 || row > 4)) return
    if (!isPlayer && (row > 1)) return

    const grid = state.grid.map(r => r.map(c => ({ ...c })))
    if (grid[row][col].monster) return

    grid[row][col] = { ...grid[row][col], monster: { ...card, owner: isPlayer ? 'PLAYER' : 'AI' } }
    const newHand = hand.filter(c => c.id_num !== cardId)

    set({
      grid,
      [handKey]: newHand,
      hasSummonedThisTurn: true,
      battleLog: [...state.battleLog, `${isPlayer ? 'Você' : 'IA'} invocou ${card.name} em [${row},${col}].`],
    })
  },

  // ── Usar magia ──
  useSpell: (cardId, targetRow, targetCol) => {
    const state = get()
    const isPlayer = state.currentTurn === 'PLAYER'
    if (isPlayer && state.gamePhase !== 'MAGIA') return
    if (state.hasPlayedMagicThisTurn) return

    const handKey = isPlayer ? 'playerHand' : 'aiHand'
    const hand = state[handKey]
    const card = hand.find(c => c.id_num === cardId)
    if (!card || card.type !== 'SPELL') return

    // Aplica efeito
    const targetCard = state.grid[targetRow]?.[targetCol]?.monster || null
    const result = applySpellEffect(state, card, isPlayer ? 'PLAYER' : 'AI', targetCard)

    const grid = state.grid.map(r => r.map(c => ({ ...c })))
    const newHand = hand.filter(c => c.id_num !== cardId)
    const newGraveyard = [...(isPlayer ? state.playerGraveyard : state.aiGraveyard), card]
    const playerLP = result.updates.playerLP ?? state.playerLP
    const aiLP = result.updates.aiLP ?? state.aiLP

    set({
      [handKey]: newHand,
      [isPlayer ? 'playerGraveyard' : 'aiGraveyard']: newGraveyard,
      tempBuffs: result.updates.tempBuffs || state.tempBuffs,
      playerLP,
      aiLP,
      hasPlayedMagicThisTurn: true,
      gamePhase: result.updates.gamePhase || 'ACAO',
      winner: result.updates.winner || state.winner,
      battleLog: [...state.battleLog, result.log],
    })
  },

  // ── Avançar fase ──
  nextPhase: () => {
    const state = get()
    const isPlayer = state.currentTurn === 'PLAYER'
    const phases = ['COMPRA', 'INVOCAR', 'ACAO', 'MAGIA', 'FIM']
    const currentIdx = phases.indexOf(state.gamePhase)
    if (currentIdx < 0 || currentIdx >= phases.length - 1) return
    set({
      gamePhase: phases[currentIdx + 1],
      battleLog: [...state.battleLog, `${isPlayer ? 'Você' : 'IA'} avançou para fase ${phases[currentIdx + 1]}.`],
    })
  },

  // ── Pular para fase específica ──
  setGamePhase: (phase) => set({ gamePhase: phase }),

  // ── End Phase ──
  endTurn: () => {
    const state = get()
    const nextTurn = state.currentTurn === 'PLAYER' ? 'AI' : 'PLAYER'
    const nextTurnNum = nextTurn === 'PLAYER' ? state.turnNumber + 1 : state.turnNumber
    const newBuffs = (state.tempBuffs || []).filter(b => (b.expiresOnTurn || 99) > state.turnNumber)
    const newEffects = (state.effects || []).filter(e => (e.expiresOnTurn || 99) > state.turnNumber)

    // Aplica dano de veneno (effeito POISON)
    let playerLP = state.playerLP
    let aiLP = state.aiLP
    // (simplificado — veneno seria aplicado via effects)

    set({
      gamePhase: 'COMPRA',
      currentTurn: nextTurn,
      turnNumber: nextTurnNum,
      tempBuffs: newBuffs,
      effects: newEffects,
      hasSummonedThisTurn: false,
      hasPlayedMagicThisTurn: false,
      monstersThatMoved: [],
      monstersThatAttacked: [],
      selectedMonster: null,
      moveCells: [],
      attackCells: [],
      battleLog: [...state.battleLog, `${state.currentTurn === 'PLAYER' ? 'Fim do seu turno.' : 'IA encerrou o turno.'}`],
    })
  },

  // ── Ações da IA ──
  setAiState: (updates) => set(updates),
}))
