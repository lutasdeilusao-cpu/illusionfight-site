import { draw } from './deck'

// Draw Phase: compra 1 carta
export function executeDrawPhase(state, isPlayer) {
  const deck = isPlayer ? state.playerDeck : state.aiDeck
  const hand = isPlayer ? state.playerHand : state.aiHand
  const deckKey = isPlayer ? 'playerDeck' : 'aiDeck'
  const handKey = isPlayer ? 'playerHand' : 'aiHand'

  if (deck.length === 0) {
    const loser = isPlayer ? 'PLAYER' : 'AI'
    const msg = isPlayer ? 'Você ficou sem cartas! Derrota por deck out.' : 'IA ficou sem cartas! Vitória!'
    return {
      [deckKey]: deck,
      [handKey]: hand,
      gamePhase: 'OVER',
      winner: loser === 'PLAYER' ? 'AI' : 'PLAYER',
      battleLog: [...state.battleLog, msg],
    }
  }

  const newDeck = [...deck]
  const card = newDeck.pop()
  const newHand = [...hand, card]
  const msg = isPlayer ? `Você comprou: ${card.name}` : 'IA comprou 1 carta'

  return {
    [deckKey]: newDeck,
    [handKey]: newHand,
    gamePhase: 'MAIN',
    hasNormalSummonedThisTurn: false,
    attackedThisTurn: [],
    battleLog: [...state.battleLog, msg],
    currentTurn: isPlayer ? state.currentTurn : state.currentTurn,
  }
}

// End Phase: limpa buffs, troca turno
export function executeEndPhase(state) {
  const nextTurn = state.currentTurn === 'PLAYER' ? 'AI' : 'PLAYER'
  const nextTurnNum = nextTurn === 'PLAYER' ? state.turnNumber + 1 : state.turnNumber
  const newBuffs = state.tempBuffs.filter(b => b.expiresOnTurn > state.turnNumber)
  const msg = state.currentTurn === 'PLAYER' ? 'Fim do seu turno.' : 'IA encerrou o turno.'

  return {
    gamePhase: 'DRAW',
    currentTurn: nextTurn,
    turnNumber: nextTurnNum,
    tempBuffs: newBuffs,
    hasNormalSummonedThisTurn: false,
    attackedThisTurn: [],
    battleLog: [...state.battleLog, msg],
  }
}
