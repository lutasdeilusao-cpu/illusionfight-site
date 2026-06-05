import CARDS from '../data/cards'
import { createShuffledDeck, drawMultiple } from './deck'

// Cria estado inicial completo para nova partida
export function createInitialState() {
  const playerDeck = createShuffledDeck(CARDS)
  const aiDeck = createShuffledDeck(CARDS)

  const playerHand = drawMultiple(playerDeck, 5)
  const aiHand = drawMultiple(aiDeck, 5)

  return {
    playerLP: 8000,
    aiLP: 8000,
    playerDeck,
    aiDeck,
    playerHand,
    aiHand,
    playerGraveyard: [],
    aiGraveyard: [],
    playerMonsterZones: [null, null, null, null, null],
    playerSpellZones: [null, null, null, null, null],
    aiMonsterZones: [null, null, null, null, null],
    aiSpellZones: [null, null, null, null, null],
    currentTurn: 'PLAYER',
    turnNumber: 1,
    hasNormalSummonedThisTurn: false,
    attackedThisTurn: [],
    gamePhase: 'MAIN', // DRAW | MAIN | BATTLE | END | OVER
    focusedCard: null,
    selectedCard: null,
    selectedSlot: null,
    awaitingTribute: false,
    tributeFor: null,
    pendingTrap: null,
    battleLog: ['⚔ DUELO INICIADO', 'Você começa. Boa sorte.'],
    winner: null,
    tempBuffs: [],
    summonTurn: {}, // { cardId: turnNumber } — quando cada monstro foi invocado
  }
}
