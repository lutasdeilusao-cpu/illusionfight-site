import { create } from 'zustand'
import { createInitialState, createEmptyGrid, getMoveRange, getAttackRange, GRID_ROWS, GRID_COLS, isPlayerTerritory, isAiTerritory } from '../engine/gameState'
import { applySpellEffect, applyTrapEffect } from '../engine/effects'

export const useDueloStore = create((set, get) => ({
  ...createInitialState(),

  // ── Ações utilitárias ──
  setState: (partial) => set(typeof partial === 'function' ? partial : partial),
  resetGame: () => set(createInitialState()),

  // ── Coin Toss ──
  doCoinToss: () => {
    const result = Math.random() < 0.5 ? 'PLAYER' : 'AI'
    set({
      coinResult: result,
      currentTurn: result,
      isFirstPlayer: result === 'PLAYER',
      isFirstTurn: true,
      gamePhase: 'COIN_TOSS',
      battleLog: [...get().battleLog, `🪙 Sorteio da moeda: ${result === 'PLAYER' ? 'Você' : 'IA'} começa!`],
    })
  },

  // ── Transição para animação de saque (após 2.5s) ──
  coinTossComplete: () => {
    set({ gamePhase: 'DRAW_ANIMATION' })
  },

  // ── Animação de saque concluída → começa o jogo ──
  drawAnimationComplete: () => {
    set({
      gamePhase: 'PLAYING',
      turnPhase: 'DESCER',
      battleLog: [...get().battleLog, '🃏 Mão completa! Escolha uma carta para descer.'],
    })
  },

  // ── Avançar animação de saque ──
  advanceDrawAnim: () => {
    const state = get()
    const idx = state.drawAnimIndex + 1
    if (idx >= 5) {
      // Animação completa — começa o jogo
      set({
        drawAnimIndex: idx,
        gamePhase: 'PLAYING',
        turnPhase: 'DESCER',
        selectedHandCard: null,
        waitingForGridTarget: null,
        confirmPlace: false,
        battleLog: [...state.battleLog, '🃏 Mão completa! Escolha uma carta para descer.'],
      })
    } else {
      set({ drawAnimIndex: idx })
    }
  },

  // ── Selecionar carta da mão na fase DESCER ──
  selectHandCard: (card) => {
    const state = get()
    if (!card || state.gamePhase !== 'PLAYING' || state.turnPhase !== 'DESCER') return
    if (state.currentTurn !== 'PLAYER') return

    if (card.type === 'MONSTER') {
      // Mostra confirmação "Descer no tabuleiro?"
      set({
        selectedHandCard: card,
        confirmPlace: true,
        waitingForGridTarget: null,
      })
    } else if (card.type === 'TRAP') {
      // Vai direto para posicionamento (oculta)
      set({
        selectedHandCard: card,
        waitingForGridTarget: 'trap',
        confirmPlace: false,
      })
    } else if (card.type === 'SPELL') {
      // Precisa de alvo no grid
      set({
        selectedHandCard: card,
        waitingForGridTarget: 'spell',
        confirmPlace: false,
      })
    }
  },

  // ── Confirmar "Descer no tabuleiro?" ──
  confirmDescer: () => {
    const state = get()
    if (!state.confirmPlace || !state.selectedHandCard) return
    set({
      confirmPlace: false,
      waitingForGridTarget: 'monster',
    })
  },

  // ── Cancelar seleção de carta ──
  cancelSelection: () => {
    set({
      selectedHandCard: null,
      waitingForGridTarget: null,
      confirmPlace: false,
    })
  },

  // ── Colocar carta no grid (Fase DESCER) ──
  placeCardOnGrid: (row, col) => {
    const state = get()
    const isPlayer = state.currentTurn === 'PLAYER'
    if (!isPlayer || state.turnPhase !== 'DESCER') return
    const card = state.selectedHandCard
    if (!card || !state.waitingForGridTarget) return

    const grid = state.grid.map(r => r.map(c => ({ ...c })))
    const handKey = 'playerHand'
    const hand = state[handKey]

    if (state.waitingForGridTarget === 'monster') {
      // Colocar monstro
      if (grid[row][col].monster) return
      if (!isPlayerTerritory(row)) return // só no próprio território
      grid[row][col] = { ...grid[row][col], monster: { ...card, owner: 'PLAYER' } }
      const newHand = hand.filter(c => c.id_num !== card.id_num)
      set({
        grid,
        playerHand: newHand,
        selectedHandCard: null,
        waitingForGridTarget: null,
        battleLog: [...state.battleLog, `🃏 Você desceu ${card.name} em [${row},${col}].`],
      })
    } else if (state.waitingForGridTarget === 'trap') {
      // Colocar armadilha (oculta ao inimigo)
      if (grid[row][col].trap || grid[row][col].monster) return
      if (!isPlayerTerritory(row)) return
      grid[row][col] = { ...grid[row][col], trap: { ...card, revealed: false } }
      const newHand = hand.filter(c => c.id_num !== card.id_num)
      set({
        grid,
        playerHand: newHand,
        selectedHandCard: null,
        waitingForGridTarget: null,
        battleLog: [...state.battleLog, `🕳️ Armadilha ${card.name} armada em [${row},${col}].`],
      })
    } else if (state.waitingForGridTarget === 'spell') {
      // Usar magia — verifica alvo válido
      const targetCard = grid[row]?.[col]?.monster || null
      if (!targetCard) {
        // Magias sem alvo (HEAL, BURN) — pode usar sem monstro alvo
        const result = applySpellEffect(state, card, 'PLAYER', null)
        const newHand = hand.filter(c => c.id_num !== card.id_num)
        const newGraveyard = [...state.playerGraveyard, card]
        set({
          playerHand: newHand,
          playerGraveyard: newGraveyard,
          tempBuffs: result.updates.tempBuffs || state.tempBuffs,
          playerLP: result.updates.playerLP ?? state.playerLP,
          aiLP: result.updates.aiLP ?? state.aiLP,
          selectedHandCard: null,
          waitingForGridTarget: null,
          winner: result.updates.winner || state.winner,
          ...(result.updates.gamePhase === 'OVER' ? { gamePhase: 'OVER' } : {}),
          battleLog: [...state.battleLog, result.log],
        })
        return
      }
      // Tem alvo — aplica nele
      const result = applySpellEffect(state, card, 'PLAYER', targetCard)
      const newHand = hand.filter(c => c.id_num !== card.id_num)
      const newGraveyard = [...state.playerGraveyard, card]
      const updates = {
        playerHand: newHand,
        playerGraveyard: newGraveyard,
        tempBuffs: result.updates.tempBuffs || state.tempBuffs,
        playerLP: result.updates.playerLP ?? state.playerLP,
        aiLP: result.updates.aiLP ?? state.aiLP,
        selectedHandCard: null,
        waitingForGridTarget: null,
        winner: result.updates.winner || state.winner,
        ...(result.updates.gamePhase === 'OVER' ? { gamePhase: 'OVER' } : {}),
        battleLog: [...state.battleLog, result.log],
      }
      set(updates)
    }
  },

  // ── Avançar para PRÓXIMA FASE (DESCER → MOVIMENTO → ATAQUE → DESCER) ──
  nextTurnPhase: () => {
    const state = get()
    if (state.gamePhase !== 'PLAYING' || state.currentTurn !== 'PLAYER') return

    if (state.turnPhase === 'DESCER') {
      // NÃO existe MOVIMENTO na primeira rodada para quem começa
      if (state.isFirstTurn && state.coinResult === 'PLAYER') {
        set({
          turnPhase: 'ATAQUE',
          selectedMonster: null,
          moveCells: [],
          attackCells: [],
          battleLog: [...state.battleLog, '▶ FASE 3 — ATAQUE (sem movimento na primeira rodada)'],
        })
      } else {
        set({
          turnPhase: 'MOVIMENTO',
          selectedMonster: null,
          moveCells: [],
          attackCells: [],
          battleLog: [...state.battleLog, '▶ FASE 2 — MOVIMENTO'],
        })
      }
    } else if (state.turnPhase === 'MOVIMENTO') {
      set({
        turnPhase: 'ATAQUE',
        selectedMonster: null,
        moveCells: [],
        attackCells: [],
        battleLog: [...state.battleLog, '▶ FASE 3 — ATAQUE'],
      })
    } else if (state.turnPhase === 'ATAQUE') {
      // Fim do turno do player — passar para IA
      set({
        selectedMonster: null,
        moveCells: [],
        attackCells: [],
        battleLog: [...state.battleLog, '⏹️ Fim do seu turno.'],
      })
      // endTurn do player será chamado externamente
      // A IA tomará controle
    }
  },

  // ── Fim do turno (limpeza) ──
  endTurn: () => {
    const state = get()
    const nextTurn = state.currentTurn === 'PLAYER' ? 'AI' : 'PLAYER'
    const nextTurnNum = nextTurn === 'PLAYER' ? state.turnNumber + 1 : state.turnNumber
    const newBuffs = (state.tempBuffs || []).filter(b => (b.expiresOnTurn || 99) > state.turnNumber)
    const newEffects = (state.effects || []).filter(e => (e.expiresOnTurn || 99) > state.turnNumber)

    set({
      turnPhase: 'DESCER',
      currentTurn: nextTurn,
      turnNumber: nextTurnNum,
      tempBuffs: newBuffs,
      effects: newEffects,
      monstersThatMoved: [],
      monstersThatAttacked: [],
      selectedMonster: null,
      moveCells: [],
      attackCells: [],
      selectedHandCard: null,
      waitingForGridTarget: null,
      confirmPlace: false,
      battleLog: [...state.battleLog, `${state.currentTurn === 'PLAYER' ? '🤖 Turno da IA...' : '🎯 Sua vez!'}`],
      // Primeira rodada terminou — libera MOVIMENTO para as próximas
      ...(state.isFirstTurn ? { isFirstTurn: false } : {}),
    })
  },

  // ── Selecionar monstro no grid (para MOVIMENTO ou ATAQUE) ──
  selectMonster: (row, col) => {
    const state = get()
    const cell = state.grid[row]?.[col]
    if (!cell?.monster) {
      set({ selectedMonster: null, moveCells: [], attackCells: [] })
      return
    }
    const isPlayer = state.currentTurn === 'PLAYER'
    if (cell.monster.owner !== (isPlayer ? 'PLAYER' : 'AI')) return

    const card = cell.monster
    const buff = state.tempBuffs.find(b => b.cardId === card.id_num)
    const effMov = Math.max(0, (card.mov || 0) + (buff?.movBonus || 0))
    const effRng = Math.max(1, (card.rng || 0) + (buff?.rngBonus || 0))

    // Na fase MOVIMENTO: monstro que já atacou não pode mover
    const alreadyAttacked = state.monstersThatAttacked.some(m => m.id === card.id_num)
    // Na fase ATAQUE: monstro que já atacou não pode atacar de novo
    const turnPhase = state.turnPhase

    let moveCells = []
    let attackCells = []

    if (turnPhase === 'MOVIMENTO' && !alreadyAttacked) {
      const alreadyMoved = state.monstersThatMoved.some(m => m.id === card.id_num)
      if (!alreadyMoved) {
        moveCells = getMoveRange(state.grid, row, col, effMov, card.owner)
      }
    }

    if (turnPhase === 'ATAQUE') {
      attackCells = getAttackRange(state.grid, row, col, effRng, card.owner)
    }

    set({ selectedMonster: { row, col }, moveCells, attackCells })
  },

  clearSelection: () => set({ selectedMonster: null, moveCells: [], attackCells: [] }),

  // ── Mover monstro (Fase MOVIMENTO) ──
  moveMonster: (toRow, toCol) => {
    const state = get()
    const sel = state.selectedMonster
    if (!sel) return
    const fromRow = sel.row, fromCol = sel.col
    const cell = state.grid[fromRow][fromCol]
    if (!cell.monster) return

    const canMove = state.moveCells.some(c => c.row === toRow && c.col === toCol)
    if (!canMove) return

    const monsterId = cell.monster.id_num
    const alreadyMoved = state.monstersThatMoved.some(m => m.id === monsterId)
    if (alreadyMoved) return
    const alreadyAttacked = state.monstersThatAttacked.some(m => m.id === monsterId)
    if (alreadyAttacked) return

    const grid = state.grid.map(r => r.map(c => ({ ...c })))
    const monster = grid[fromRow][fromCol].monster
    grid[toRow][toCol] = { ...grid[toRow][toCol], monster }
    grid[fromRow][fromCol] = { ...grid[fromRow][fromCol], monster: null }

    // Verifica armadilha no destino
    const trapAtDest = grid[toRow][toCol].trap
    let logMsg = `Você moveu ${monster.name} de [${fromRow},${fromCol}] para [${toRow},${toCol}].`
    let battleLog = [...state.battleLog, logMsg]

    if (trapAtDest) {
      const result = applyTrapEffect(state, trapAtDest, 'PLAYER')
      if (result.updates.playerLP !== undefined || result.updates.aiLP !== undefined) {
        set({
          playerLP: result.updates.playerLP ?? state.playerLP,
          aiLP: result.updates.aiLP ?? state.aiLP,
        })
      }
      battleLog = [...battleLog, result.log]
      // Remove armadilha após ativação
      grid[toRow][toCol] = { ...grid[toRow][toCol], trap: null }
    }

    set({
      grid,
      monstersThatMoved: [...state.monstersThatMoved, { id: monsterId }],
      selectedMonster: { row: toRow, col: toCol },
      moveCells: [],
      attackCells: [],
      battleLog,
    })
  },

  // ── Atacar (Fase ATAQUE) ──
  attackMonster: (targetRow, targetCol) => {
    const state = get()
    const sel = state.selectedMonster
    if (!sel) return
    const fromRow = sel.row, fromCol = sel.col
    const cell = state.grid[fromRow][fromCol]
    if (!cell?.monster) return

    const attacker = cell.monster
    const owner = attacker.owner

    const canAttack = state.attackCells.some(c => c.row === targetRow && c.col === targetCol)
    if (!canAttack) return

    const monsterId = attacker.id_num
    const alreadyAttacked = state.monstersThatAttacked.some(m => m.id === monsterId)
    if (alreadyAttacked) return

    const targetCell = state.grid[targetRow]?.[targetCol]
    if (!targetCell?.monster) return
    if (targetCell.monster.owner === owner) return

    const defender = targetCell.monster

    const aBuff = state.tempBuffs.find(b => b.cardId === attacker.id_num)
    const dBuff = state.tempBuffs.find(b => b.cardId === defender.id_num)
    const effAtk = (attacker.atk || 0) + (aBuff?.atkBonus || 0)
    const effDef = (defender.def || 0) + (dBuff?.defBonus || 0)

    const isPlayerAtk = owner === 'PLAYER'
    let playerLP = state.playerLP
    let aiLP = state.aiLP
    const grid = state.grid.map(r => r.map(c => ({ ...c })))
    let log = ''
    let graveyardKey = isPlayerAtk ? 'playerGraveyard' : 'aiGraveyard'
    let newGraveyard = [...state[graveyardKey]]

    if (effAtk > effDef) {
      const diff = effAtk - effDef
      if (isPlayerAtk) aiLP = Math.max(0, aiLP - diff)
      else playerLP = Math.max(0, playerLP - diff)
      newGraveyard.push(defender)
      grid[targetRow][targetCol] = { monster: null, trap: grid[targetRow][targetCol]?.trap || null }
      log = `💥 ${attacker.name} (${effAtk}) destruiu ${defender.name} (${effDef})! ${diff} de dano!`
    } else if (effAtk < effDef) {
      const diff = effDef - effAtk
      if (isPlayerAtk) playerLP = Math.max(0, playerLP - diff)
      else aiLP = Math.max(0, aiLP - diff)
      newGraveyard.push(attacker)
      grid[fromRow][fromCol] = { monster: null, trap: grid[fromRow][fromCol]?.trap || null }
      log = `💥 ${attacker.name} (${effAtk}) foi destruído por ${defender.name} (${effDef})! ${diff} de dano!`
    } else {
      log = `⚔️ ${attacker.name} (${effAtk}) vs ${defender.name} (${effDef}): empate!`
    }

    const winner = playerLP <= 0 ? 'AI' : aiLP <= 0 ? 'PLAYER' : null

    set({
      grid,
      playerLP, aiLP,
      [graveyardKey]: newGraveyard,
      monstersThatAttacked: [...state.monstersThatAttacked, { id: monsterId }],
      selectedMonster: null,
      moveCells: [],
      attackCells: [],
      battleLog: [...state.battleLog, log],
      ...(winner ? { winner, gamePhase: 'OVER' } : {}),
    })
  },

  // ── Avançar para fim de turno após ATAQUE do player ──
  playerEndTurn: () => {
    const state = get()
    set({
      turnPhase: 'DESCER',
      currentTurn: 'AI',
      monstersThatMoved: [],
      monstersThatAttacked: [],
      selectedMonster: null,
      moveCells: [],
      attackCells: [],
      selectedHandCard: null,
      waitingForGridTarget: null,
      confirmPlace: false,
      battleLog: [...state.battleLog, '🤖 Turno da IA...'],
    })
  },

  // ── Ações da IA ──
  setAiState: (updates) => set(updates),
}))
