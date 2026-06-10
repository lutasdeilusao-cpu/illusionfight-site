import { create } from 'zustand'
import { createInitialState, createEmptyGrid, getMoveRange, getAttackRange, GRID_ROWS, GRID_COLS } from '../engine/gameState'
import { applySpellEffect, applyTrapEffect } from '../engine/effects'

// Quantos sacrifícios necessários por estrelas
function sacrificiosNecessarios(estrelas) {
  if (estrelas <= 3) return 0
  if (estrelas === 4) return 1
  if (estrelas === 5) return 2
  return 3 // 6★
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
        // Mostra AVISO — não tem monstros suficientes
        set({
          selectedHandCard: card,
          showSacrificeWarning: true,
          confirmPlace: false,
          waitingForGridTarget: null,
        })
        return
      }

      // Se tem monstros demais (>=3) ou precisa sacrificar
      if (sac > 0) {
        // Precisa sacrificar → mostra AVISO primeiro (modal 1)
        set({
          selectedHandCard: card,
          showSacrificeWarning: true,
          confirmPlace: false,
          waitingForGridTarget: null,
        })
      } else if (meusMonstros >= 3) {
        // Limite de 3 atingido → também mostra aviso de sacrifício
        set({
          selectedHandCard: card,
          showSacrificeWarning: true,
          confirmPlace: false,
          waitingForGridTarget: null,
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
      // Magia que precisa de alvo monstro (buff/debuff) → mostra confirmação primeiro
      const precisaAlvo = ['ATK_BOOST', 'DEF_BOOST', 'MOV_BOOST', 'RNG_BOOST', 'ATK_REDUCE', 'SWAP_ATK_DEF', 'PARALYZE', 'DESTROY', 'DUPLICATE', 'TELEPORT', 'PUSH']
      if (precisaAlvo.includes(card.effect)) {
        // Buff → aliado, Debuff → inimigo
        const isBuff = ['ATK_BOOST', 'DEF_BOOST', 'MOV_BOOST', 'RNG_BOOST', 'DUPLICATE', 'TELEPORT'].includes(card.effect)
        set({
          selectedHandCard: card,
          showSpellConfirm: true,
          spellBuffTarget: isBuff ? 'PLAYER' : 'AI',
          confirmPlace: false,
          waitingForGridTarget: null,
        })
      } else {
        // Magia sem alvo (BURN, HEAL) → modo seleção normal
        set({
          selectedHandCard: card,
          waitingForGridTarget: 'spell',
          confirmPlace: false,
        })
      }
    }
  },

  // ── Confirmar aviso de sacrifício (entra em modo seleção) ──
  // ── Confirmar uso de magia com alvo (entra em modo seleção) ──
  confirmSpellUse: () => {
    const state = get()
    if (!state.showSpellConfirm || !state.selectedHandCard) return
    const isBuff = ['ATK_BOOST', 'DEF_BOOST', 'MOV_BOOST', 'RNG_BOOST', 'DUPLICATE', 'TELEPORT'].includes(state.selectedHandCard.effect)
    const targetOwner = isBuff ? 'PLAYER' : 'AI'
    const targetLabel = isBuff ? 'aliado' : 'inimigo'
    set({
      showSpellConfirm: false,
      waitingForGridTarget: 'spell',
      spellTargetOwner: targetOwner,
      battleLog: [...state.battleLog, `✨ Clique em um monstro ${targetLabel} para aplicar ${state.selectedHandCard.name}.`],
    })
  },

  // ── Cancelar uso de magia ──
  cancelSpellUse: () => {
    set({
      showSpellConfirm: false,
      selectedHandCard: null,
      waitingForGridTarget: null,
      spellTargetOwner: null,
    })
  },

  confirmSacrificeWarning: () => {
    const state = get()
    if (!state.showSacrificeWarning || !state.selectedHandCard) return
    set({
      showSacrificeWarning: false,
      waitingForGridTarget: 'sacrifice',
      sacrificeTargets: [],
      battleLog: [...state.battleLog, `⚠️ Clique em monstros aliados para sacrificar (${sacrificiosNecessarios(state.selectedHandCard.estrelas || 1)} necessário(s))`],
    })
  },

  // ── Cancelar aviso de sacrifício ──
  cancelSacrificeWarning: () => {
    set({
      selectedHandCard: null,
      showSacrificeWarning: false,
      waitingForGridTarget: null,
      confirmPlace: false,
    })
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
      showSacrificeWarning: false,
      sacrificeTargets: [],
      confirmSacrifice: false,
      sacrificePending: 0,
      fieldCardInfo: null,
      showTrapActivation: false,
      trapActivationTarget: null,
      showSpellConfirm: false,
      spellBuffTarget: null,
      spellTargetOwner: null,
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
      // Coloca armadilha com duração em turnos
      if (grid[row][col].trap || grid[row][col].monster) return
      const duracaoPadrao = 3 // turnos padrão para armadilhas no campo
      grid[row][col] = { ...grid[row][col], trap: {
        ...card, revealed: false, owner: 'PLAYER',
        turnoAtivacao: state.turnNumber,
        duracaoTurnos: duracaoPadrao,
        turnosRestantes: duracaoPadrao,
      } }
      const newHand = hand.filter(c => c.id_num !== card.id_num)
      set({
        grid,
        playerHand: newHand,
        selectedHandCard: null,
        waitingForGridTarget: null,
        pendingPlacement: null,
        spellTargetOwner: null,
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
        spellTargetOwner: null,
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

  // ── Confirmar execução do sacrifício (remove monstros e invoca o novo) ──
  confirmSacrificeExecution: () => {
    const state = get()
    const card = state.selectedHandCard
    const targets = state.sacrificeTargets
    if (!card || targets.length === 0) return

    const grid = state.grid.map(r => r.map(c => ({ ...c })))
    const hand = state.playerHand

    // Remove os monstros sacrificados do grid
    let nomesSacrificados = []
    for (const t of targets) {
      nomesSacrificados.push(grid[t.row][t.col]?.monster?.name || 'desconhecido')
      grid[t.row][t.col] = { ...grid[t.row][t.col], monster: null }
    }

    // Remove a carta da mão
    const newHand = hand.filter(c => c.id_num !== card.id_num)

    // Agora deixa o player ESCOLHER onde colocar o monstro
    set({
      grid,
      playerHand: newHand,
      // selectedHandCard continua sendo o card (para placeCardOnGrid usar)
      waitingForGridTarget: 'monster',
      sacrificeTargets: [],
      confirmSacrifice: false,
      sacrificePending: 0,
      battleLog: [...state.battleLog, `🔥 Sacrificou ${nomesSacrificados.join(', ')}. Agora escolha onde invocar ${card.name}!`],
    })
  },

  // ── Cancelar execução do sacrifício (volta ao modo seleção) ──
  cancelSacrificeExecution: () => {
    set({
      confirmSacrifice: false,
      sacrificeTargets: [],
      battleLog: [...get().battleLog, `↩️ Sacrifício cancelado. Selecione novos monstros.`],
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
      // Colocar monstro em QUALQUER célula vazia do tabuleiro
      if (grid[row][col].monster) return
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

      // Verifica se já foi selecionado para sacrifício
      const alreadySelected = state.sacrificeTargets.some(t => t.row === row && t.col === col)
      if (alreadySelected) {
        // Remove da seleção (desselecionar)
        const newTargets = state.sacrificeTargets.filter(t => !(t.row === row && t.col === col))
        set({
          sacrificeTargets: newTargets,
          battleLog: [...state.battleLog, `↩️ ${targetMonster.name} removido dos sacrifícios.`],
        })
        return
      }

      const sac = sacrificiosNecessarios(card.estrelas || 1)
      const currentTargets = [...state.sacrificeTargets, { row, col, card: targetMonster }]

      if (currentTargets.length >= sac) {
        // Sacrifícios suficientes selecionados → modal de confirmação final
        set({
          sacrificeTargets: currentTargets,
          confirmSacrifice: true,
          battleLog: [...state.battleLog, `✅ ${targetMonster.name} selecionado. Confirme o sacrifício.`],
        })
      } else {
        // Ainda precisa de mais
        const restantes = sac - currentTargets.length
        set({
          sacrificeTargets: currentTargets,
          battleLog: [...state.battleLog, `✅ ${targetMonster.name} selecionado. Mais ${restantes} sacrifício(s) necessário(s).`],
        })
      }
    } else if (state.waitingForGridTarget === 'trap') {
      // Armadilha em QUALQUER célula do tabuleiro — mostra modal de confirmação
      if (grid[row][col].trap || grid[row][col].monster) return
      set({
        pendingPlacement: { row, col, type: 'trap', card },
      })
    } else if (state.waitingForGridTarget === 'spell') {
      // Magia — valida alvo baseado no tipo (buff/debuff)
      const targetCard = grid[row]?.[col]?.monster || null

      // Se tem spellTargetOwner definido, valida dono do alvo
      if (state.spellTargetOwner && targetCard) {
        if (targetCard.owner !== state.spellTargetOwner) {
          set({
            battleLog: [...state.battleLog, `❌ Alvo inválido! Esta magia só afeta monstros ${state.spellTargetOwner === 'PLAYER' ? 'aliados' : 'inimigos'}.`],
          })
          return
        }
      }

      // Se não tem target e a magia precisa de alvo, avisa
      if (!targetCard && state.spellTargetOwner) {
        set({
          battleLog: [...state.battleLog, `❌ Selecione um monstro ${state.spellTargetOwner === 'PLAYER' ? 'aliado' : 'inimigo'} no campo!`],
        })
        return
      }

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

    // ── Decrementa duração das armadilhas e remove as expiradas ──
    const newGrid = state.grid.map(r => r.map(c => {
      if (c.trap && c.trap.turnosRestantes !== undefined) {
        const novosTurnos = c.trap.turnosRestantes - 1
        if (novosTurnos <= 0) {
          return { ...c, trap: null } // remove armadilha expirada
        }
        return { ...c, trap: { ...c.trap, turnosRestantes: novosTurnos } }
      }
      return c
    }))
    const trapsRemoved = newGrid.some((r, ri) =>
      r.some((c, ci) => state.grid[ri][ci].trap && !c.trap)
    )

    // Prepara saque para o próximo turno
    set({
      turnPhase: 'DESCER',
      currentTurn: nextTurn,
      turnNumber: nextTurnNum,
      tempBuffs: newBuffs,
      effects: newEffects,
      fieldEffects: newFieldEffects,
      grid: newGrid,
      monstersThatMoved: [],
      monstersThatAttacked: [],
      selectedMonster: null,
      moveCells: [],
      attackCells: [],
      selectedHandCard: null,
      waitingForGridTarget: null,
      confirmPlace: false,
      pendingPlacement: null,
      sacrificeTargets: [],
      confirmSacrifice: false,
      showSacrificeWarning: false,
      sacrificePending: 0,
      battleLog: [
        ...state.battleLog,
        ...(trapsRemoved ? ['⏳ Armadilha(s) expiraram e foram removidas do campo.'] : []),
        `${state.currentTurn === 'PLAYER' ? '🤖 Turno da IA...' : '🎯 Sua vez!'}`,
      ],
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
      sacrificeTargets: [],
      confirmSacrifice: false,
      showSacrificeWarning: false,
      sacrificePending: 0,
      showSpellConfirm: false,
      spellBuffTarget: null,
      spellTargetOwner: null,
      battleLog: [...state.battleLog, '🤖 Turno da IA...'],
    })
  },

  // ── Informação de carta no campo ──
  showFieldCardInfo: (data) => set({ fieldCardInfo: data }),

  closeFieldCardInfo: () => set({ fieldCardInfo: null }),

  // ── Ativação de armadilha (quando inimigo está na área) ──
  setTrapActivationTarget: (data) => {
    // Encontra qual armadilha cobre essa célula
    const state = get()
    let trapData = null
    for (let rr = 0; rr < GRID_ROWS; rr++) {
      for (let cc = 0; cc < GRID_COLS; cc++) {
        const t = state.grid[rr][cc]?.trap
        if (t && t.owner === 'PLAYER' && !t.revealed && t.area) {
          const dist = manhattan(rr, cc, data.row, data.col)
          if (dist > 0 && dist <= t.area) {
            trapData = { trapRow: rr, trapCol: cc, trapCard: t }
            break
          }
        }
      }
      if (trapData) break
    }
    if (!trapData) return
    set({
      trapActivationTarget: { ...data, ...trapData },
      showTrapActivation: true,
    })
  },

  confirmTrapActivation: () => {
    const state = get()
    const tat = state.trapActivationTarget
    if (!tat) return

    // Ativa a armadilha no inimigo
    const targetCell = state.grid[tat.row]?.[tat.col]
    if (!targetCell?.monster) {
      set({ showTrapActivation: false, trapActivationTarget: null })
      return
    }

    // Aplica efeito da armadilha
    const result = applyTrapEffect(state, tat.trapCard, 'AI')

    const grid = state.grid.map(r => r.map(c => ({ ...c })))
    let playerLP = state.playerLP
    let aiLP = state.aiLP
    if (result.updates.playerLP !== undefined) playerLP = result.updates.playerLP
    if (result.updates.aiLP !== undefined) aiLP = result.updates.aiLP

    // Remove a armadilha (usou)
    grid[tat.trapRow][tat.trapCol] = { ...grid[tat.trapRow][tat.trapCol], trap: null }

    set({
      grid,
      playerLP,
      aiLP,
      showTrapActivation: false,
      trapActivationTarget: null,
      battleLog: [...state.battleLog, `⚡ Armadilha ${tat.trapCard.name} ativada em [${tat.row},${tat.col}]! ${result.log}`],
    })
  },

  cancelTrapActivation: () => {
    set({
      showTrapActivation: false,
      trapActivationTarget: null,
      battleLog: [...get().battleLog, `⏭️ Armadilha não ativada.`],
    })
  },

  // ── Anúncio de fase ──
  setPhaseAnnouncement: (data) => set({ phaseAnnouncement: data }),

  clearPhaseAnnouncement: () => set({ phaseAnnouncement: null }),

  // ── Ações da IA ──
  setAiState: (updates) => set(updates),
}))
