import CARDS from '../data/cards'
import { createShuffledDeck, drawMultiple } from './deck'

// Grid 5×5 — 25 casas
// Linhas 0-1: território AI
// Linha 2: neutro
// Linhas 3-4: território Player
export const GRID_ROWS = 5
export const GRID_COLS = 5

export function createEmptyGrid() {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => ({ monster: null, trap: null }))
  )
}

// Conta alcance Manhattan entre duas posições
export function manhattan(r1, c1, r2, c2) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2)
}

// Retorna casas dentro do MOV de uma posição (até `mov` passos Manhattan)
export function getMoveRange(grid, row, col, mov, owner) {
  const cells = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const dist = manhattan(row, col, r, c)
      if (dist > 0 && dist <= mov && !grid[r][c].monster) {
        cells.push({ row: r, col: c })
      }
    }
  }
  return cells
}

// Retorna casas dentro do RNG — depende do valor de RNG:
// RNG 1: adjacente (8 direções)
// RNG 2-3: linha reta 4 direções cardinais
// RNG 4+: todas as direções em linha reta
export function getAttackRange(grid, row, col, rng, owner) {
  const cells = []
  if (rng <= 0) return cells

  if (rng === 1) {
    // 8 direções adjacentes
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const r = row + dr, c = col + dc
        if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
          cells.push({ row: r, col: c })
        }
      }
    }
  } else if (rng <= 3) {
    // 4 direções cardinais em linha reta até RNG
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
    for (const [dr, dc] of dirs) {
      for (let d = 1; d <= rng; d++) {
        const r = row + dr * d, c = col + dc * d
        if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) break
        cells.push({ row: r, col: c })
      }
    }
  } else {
    // Todas as direções (8) em linha reta até RNG
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        for (let d = 1; d <= rng; d++) {
          const r = row + dr * d, c = col + dc * d
          if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) break
          cells.push({ row: r, col: c })
        }
      }
    }
  }
  return cells
}

// Cria estado inicial completo para nova partida
export function createInitialState() {
  const playerDeck = createShuffledDeck(CARDS)
  const aiDeck = createShuffledDeck(CARDS)

  const playerHand = drawMultiple(playerDeck, 5)
  const aiHand = drawMultiple(aiDeck, 5)

  return {
    playerLP: 1000,
    aiLP: 1000,
    playerDeck,
    aiDeck,
    playerHand,
    aiHand,
    playerGraveyard: [],
    aiGraveyard: [],
    // Grid 5×5
    grid: createEmptyGrid(),
    // Controle de seleção
    selectedMonster: null,   // { row, col }
    moveCells: [],           // casas destacadas para MOV
    attackCells: [],         // casas destacadas para RNG
    // Fases: PREPARATION | COMPRA | INVOCAR | ACAO | MAGIA | FIM | OVER
    gamePhase: 'PREPARATION',
    currentTurn: 'PLAYER',
    turnNumber: 1,
    // Controle de ações por turno
    monstersThatMoved: [],   // [{ row, col }] — monstros que já se moveram neste turno
    monstersThatAttacked: [], // [{ row, col }] — monstros que já atacaram neste turno
    hasSummonedThisTurn: false,
    hasPlayedMagicThisTurn: false,
    // Estado de interação
    selectedHandCard: null,  // carta da mão selecionada para invocar
    battleLog: ['⚔ DUELO — CAMPO DE BATALHA INICIADO', 'Prepare seu campo!'],
    winner: null,
    tempBuffs: [], // { cardId, atkBonus, defBonus, movBonus, rngBonus, expiresOnTurn, type }
    effects: [],   // efeitos temporários no grid { row, col, effect, duration, owner }
    // Fase de preparação
    preparationPhase: true,
    placedMonsters: 0,
    maxStartMonsters: 3,
  }
}
