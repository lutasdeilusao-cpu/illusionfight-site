// phases.js — fases do Duelo Campo de Batalha v2.0
// As fases agora são gerenciadas pelo store principal (DESCER → MOVIMENTO → ATAQUE)
// Este arquivo mantém funções auxiliares de limpeza de estado entre turnos

import { GRID_ROWS, GRID_COLS } from './gameState'

// Conta monstros de um dono no grid
export function countMonstersOnField(grid, owner) {
  let count = 0
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (grid[r][c]?.monster?.owner === owner) count++
    }
  }
  return count
}

// Verifica condição de vitória: jogador sem monstros e sem cartas na mão para invocar
export function checkVictoryCondition(state) {
  const playerMonsters = countMonstersOnField(state.grid, 'PLAYER')
  const aiMonsters = countMonstersOnField(state.grid, 'AI')

  // Player sem monstros e sem cartas monstro na mão
  if (playerMonsters === 0 && !state.playerHand.some(c => c.type === 'MONSTER') && state.playerDeck.length === 0) {
    return { winner: 'AI', reason: 'Você não tem mais monstros para invocar!' }
  }

  // IA sem monstros e sem cartas monstro na mão
  if (aiMonsters === 0 && !state.aiHand.some(c => c.type === 'MONSTER') && state.aiDeck.length === 0) {
    return { winner: 'PLAYER', reason: 'IA não tem mais monstros para invocar!' }
  }

  return null
}
