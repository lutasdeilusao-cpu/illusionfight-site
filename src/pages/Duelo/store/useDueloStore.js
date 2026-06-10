import { create } from 'zustand'
import { createInitialState, createEmptyGrid, getMoveRange, getAttackRange, GRID_ROWS, GRID_COLS, isPlayerTerritory, isAiTerritory } from '../engine/gameState'
import { applySpellEffect, applyTrapEffect } from '../engine/effects'

// Quantos sacrifícios necessários por estrelas
function sacrificiosNecessarios(estrelas) {
  if (estrelas <= 3) return 0
  if (estrelas === 4) return 1
  return 2 // 5★
}

// Conta quantos monstros um jogador tem no grid
function countMonsters(grid, owner) {
  let count = 0
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++)
      if (grid[r][c]?.monster?.owner === owner) count++
  return count
}

// Sacrifica N monstros do jogador no grid (remove os primeiros encontrados)
function sacrificeMonsters(grid, owner, qtd) {
  const newGrid = grid.map(r => r.map(c => ({ ...c })))
  let removed = 0
  for (let r = 0; r < GRID_ROWS && removed < qtd; r++) {
    for (let c = 0; c < GRID_COLS && removed < qtd; c++) {
      if (newGrid[r][c]?.monster?.owner === owner) {
        newGrid[r][c] = { ...newGrid[r][c], monster: null }
        removed++
      }
    }
  }
  return newGrid
}

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

  // ── Sacar 1 carta do deck (início de turno) ──
  drawCard: () => {
    const state = get()
    const isPlayer = state.currentTurn === 'PLAYER'
    const deckKey = isPlayer ? 'playerDeck' : 'aiDeck'
    const handKey = isPlayer ? 'playerHand' : 'aiHand'
    const deck = state[deckKey]
    if (deck.length === 0) {
      set({
        winner: isPlayer ? 'AI' : 'PLAYER',
        gamePhase: 'OVER',
        battleLog: [...state.battleLog, isPlayer ? '❌ Você ficou sem cartas!' : '❌ IA ficou sem cartas!'],
      })
      return null
    }
    const newDeck = [...deck]
    const card = newDeck.pop()
    const newHand = [...state[handKey], card]
    set({
      [deckKey]: newDeck,
      [handKey]: newHand,
      battleLog: [...state.battleLog, isPlayer ? `🃏 Você comprou ${card.name}` : '🃏 IA comprou 1 carta'],
    })
    return card
  },

  // ── Selecionar carta da mão na fase DESCER ──
  selectHandCard: (card) => {
    const state = get()
    if (!card || state.gamePhase !== 'PLAYING' || state.turnPhase !== 'DESCER') return
    if (state.currentTurn !== 'PLAYER') return

    if (card.type === 'MONSTER') {
      // Calcula se precisa de sacrifício
      const meusMonstros = countMonsters(state.grid, 'PLAYER')
      const sac = sacrificiosNecessarios(card.estrelas || 1)

      // No primeiro turno, só pode descer 1 monstro
      if (state.isFirstTurn && meusMonstros >= 1) {
        set({
          battleLog: [...state.battleLog, `❌ Primeiro turno: só pode descer 1 monstro.`],
          selectedHandCard: null,
          waitingForGridTarget: null,
          confirmPlace: false,
        })
        return
      }

      if (sac > 0 && meusMonstros < sac) {
        set({
          battleLog: [...state.battleLog, `❌ ${card.name} (${card.estrelas}★) precisa de ${sac} sacrifício(s), mas você só tem ${meusMonstros} monstro(s).`],
          selectedHandCard: null,
          waitingForGridTarget: null,
          confirmPlace: false,
        })
        return
      }

      // Se tem monstros demais (>=3) ou precisa sacrificar
      if (sac > 0) {
        // Precisa sacrificar → abre modal de seleção de sacrifício
        set({
          selectedHandCard: card,
          waitingForGridTarget: 'sacrifice',
          confirmPlace: false,
        })
      } else if (meusMonstros >= 3) {
        // Limite de 3 atingido → perguntar qual sacrificar
        set({
          selectedHandCard: card,
          waitingForGridTarget: 'sacrifice',
          confirmPlace: false,
        })
      } else {
        // Mostra confirmação "Descer no tabuleiro?"
        set({
          selectedHandCard: card,
          confirmPlace: true,
          waitingForGridTarget: null,
        })
      }
    } else if (card.type === 'TRAP') {
      // Armadilha pode ser colocada em QUALQUER célula do tabuleiro
      set({
        selectedHandCard: card,
        waitingForGridTarget: 'trap',
        confirmPlace: false,
      })
    } else if (card.type === 'SPELL') {
      // Mostra range de células afetadas pela magia
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
      pendingPlacement: null,
    })
  },

  // ── Confirmar colocação de armadilha/magia (modal de confirmação) ──
  confirmPendingPlacement: () => {
    const state = get()
    const pp = state.pendingPlacement
    if (!pp) return
    const { row, col, type, card, targetCard } = pp

    const grid = state.grid.map(r => r.map(c => ({ ...c })))
    const hand = state.playerHand
    const handKey = 'playerHand'

    if (type === 'trap') {
      // Coloca armadilha
      if (grid[row][col].trap || grid[row][col].monster) return
      grid[row][col] = { ...grid[row][col], trap: { ...card, revealed: false, owner: 'PLAYER' } }
      const newHand = hand.filter(c => c.id_num !== card.id_num)
      set({
        grid,
        playerHand: newHand,
        selectedHandCard: null,
        waitingForGridTarget: null,
        pendingPlacement: null,
        battleLog: [...state.battleLog, `🕳️ Armadilha ${card.name} armada em [${row},${col}].`],
      })
    } else if (type === 'spell') {
      // Usa magia
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
        pendingPlacement: null,
        winner: result.updates.winner || state.winner,
        ...(result.updates.gamePhase === 'OVER' ? { gamePhase: 'OVER' } : {}),
        battleLog: [...state.battleLog, result.log],
      }
      // Se tem duração >0 e alvo, adiciona como efeito persistente no grid
      if (card.duracao > 0 && targetCard) {
        updates.fieldEffects = [...(state.fieldEffects || []), {
          row, col,
          cardName: card.name,
          effect: card.effect,
          remainingTurns: card.duracao,
          owner: 'PLAYER',
          targetId: targetCard.id_num,
        }]
      }
      set(updates)
    }
  },

  // ── Cancelar colocação de armadilha/magia (volta ao estado de seleção) ──
  cancelPendingPlacement: () => {
    const state = get()
    const pp = state.pendingPlacement
    if (!pp) return
    // Volta ao estado anterior: mantém selectedHandCard e waitingForGridTarget
    set({
      pendingPlacement: null,
      // selectedHandCard e waitingForGridTarget permanecem — usuário pode clicar em outra célula
    })
  },

  // ── Colocar/confirmar carta no grid (Fase DESCER) ──
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
      // Colocar monstro no território do jogador
      if (grid[row][col].monster) return
      if (!isPlayerTerritory(row)) return
      grid[row][col] = { ...grid[row][col], monster: { ...card, owner: 'PLAYER' } }
      const newHand = hand.filter(c => c.id_num !== card.id_num)
      set({
        grid,
        playerHand: newHand,
        selectedHandCard: null,
        waitingForGridTarget: null,
        battleLog: [...state.battleLog, `🃏 Você desceu ${card.name} em [${row},${col}].`],
      })
    } else if (state.waitingForGridTarget === 'sacrifice') {
      // Clicou em um monstro para sacrificar
      const targetMonster = grid[row][col]?.monster
      if (!targetMonster || targetMonster.owner !== 'PLAYER') return
      const sac = sacrificiosNecessarios(card.estrelas || 1)
      const meusMonstros = countMonsters(grid, 'PLAYER')
      const precisoSacrificar = Math.max(sac, (meusMonstros >= 3 ? 1 : 0))
      
      // Remove o monstro clicado do grid
      grid[row][col] = { ...grid[row][col], monster: null }
      
      // Se ainda precisa de mais sacrifícios, continua no modo sacrifice
      const monstersLeft = countMonsters(grid, 'PLAYER')
      const sacrificados = 1
      const restantes = precisoSacrificar - sacrificados
      
      if (restantes > 0) {
        set({
          grid,
          sacrificePending: restantes,
          battleLog: [...state.battleLog, `Sacrificou ${targetMonster.name}. Mais ${restantes} sacrifício(s) necessário(s).`],
        })
      } else {
        // Sacrifícios concluídos — coloca o monstro
        // Encontra célula vazia no território do player para colocar
        let placed = false
        for (let r = 5; r <= 7 && !placed; r++) {
          for (let c = 0; c < GRID_COLS && !placed; c++) {
            if (!grid[r][c].monster) {
              grid[r][c] = { ...grid[r][c], monster: { ...card, owner: 'PLAYER' } }
              placed = true
            }
          }
        }
        const newHand = hand.filter(c => c.id_num !== card.id_num)
        set({
          grid,
          playerHand: newHand,
          selectedHandCard: null,
          waitingForGridTarget: null,
          sacrificePending: 0,
          battleLog: [...state.battleLog, `Sacrificou ${targetMonster.name}. Inovou ${card.name} (${card.estrelas}★) no campo.`],
        })
      }
    } else if (state.waitingForGridTarget === 'trap') {
      // Armadilha em QUALQUER célula do tabuleiro — mostra modal de confirmação
      if (grid[row][col].trap || grid[row][col].monster) return
      set({
        pendingPlacement: { row, col, type: 'trap', card },
      })
    } else if (state.waitingForGridTarget === 'spell') {
      // Magia — mostra modal de confirmação
      const targetCard = grid[row]?.[col]?.monster || null
      set({
        pendingPlacement: { row, col, type: 'spell', card, targetCard },
      })
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

  // ── Fim do turno (limpeza + saque) ──
  endTurn: () => {
    const state = get()
    const nextTurn = state.currentTurn === 'PLAYER' ? 'AI' : 'PLAYER'
    const nextTurnNum = nextTurn === 'PLAYER' ? state.turnNumber + 1 : state.turnNumber
    const newBuffs = (state.tempBuffs || []).filter(b => (b.expiresOnTurn || 99) > state.turnNumber)
    const newEffects = (state.effects || []).filter(e => (e.expiresOnTurn || 99) > state.turnNumber)
    // Decrementa fieldEffects
    const newFieldEffects = (state.fieldEffects || []).map(fe => ({
      ...fe,
      remainingTurns: fe.remainingTurns - 1,
    })).filter(fe => fe.remainingTurns > 0)

    // Prepara saque para o próximo turno
    set({
      turnPhase: 'DESCER',
      currentTurn: nextTurn,
      turnNumber: nextTurnNum,
      tempBuffs: newBuffs,
      effects: newEffects,
      fieldEffects: newFieldEffects,
      monstersThatMoved: [],
      monstersThatAttacked: [],
      selectedMonster: null,
      moveCells: [],
      attackCells: [],
      selectedHandCard: null,
      waitingForGridTarget: null,
      confirmPlace: false,
      pendingPlacement: null,
      battleLog: [...state.battleLog, `${state.currentTurn === 'PLAYER' ? '🤖 Turno da IA...' : '🎯 Sua vez!'}`],
      // Primeira rodada terminou — libera MOVIMENTO para as próximas
      ...(state.isFirstTurn ? { isFirstTurn: false } : {}),
    })

    // Saca carta para o jogador do próximo turno
    setTimeout(() => {
      const s = get()
      if (s.currentTurn === nextTurn && s.gamePhase === 'PLAYING') {
        get().drawCard()
      }
    }, 300)
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
      pendingPlacement: null,
      battleLog: [...state.battleLog, '🤖 Turno da IA...'],
    })
  },

  // ── Ações da IA ──
  setAiState: (updates) => set(updates),
}))
