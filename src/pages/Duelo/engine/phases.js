import { draw } from './deck'

// Draw Phase: compra 1 carta
export function executeDrawPhase(state, isPlayer) {
  const deck = isPlayer ? state.playerDeck : state.aiDeck
  const hand = isPlayer ? state.playerHand : state.aiHand
  const deckKey = isPlayer ? 'playerDeck' : 'aiDeck'
  const handKey = isPlayer ? 'playerHand' : 'aiHand'

  if (deck.length === 0) {
    const msg = isPlayer ? 'Você ficou sem cartas! Derrota por deck out.' : 'IA ficou sem cartas! Vitória!'
    return {
      [deckKey]: deck,
      [handKey]: hand,
      gamePhase: 'OVER',
      winner: isPlayer ? 'AI' : 'PLAYER',
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
    gamePhase: 'INVOCAR',
    hasSummonedThisTurn: false,
    hasPlayedMagicThisTurn: false,
    monstersThatMoved: [],
    monstersThatAttacked: [],
    battleLog: [...state.battleLog, msg],
  }
}

// End Phase: limpa buffs/efeitos, troca turno
export function executeEndPhase(state) {
  const nextTurn = state.currentTurn === 'PLAYER' ? 'AI' : 'PLAYER'
  const nextTurnNum = nextTurn === 'PLAYER' ? state.turnNumber + 1 : state.turnNumber
  const newBuffs = state.tempBuffs.filter(b => (b.expiresOnTurn || 99) > state.turnNumber)
  const newEffects = (state.effects || []).filter(e => (e.expiresOnTurn || 99) > state.turnNumber)
  const msg = state.currentTurn === 'PLAYER' ? 'Fim do seu turno.' : 'IA encerrou o turno.'

  return {
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
    battleLog: [...state.battleLog, msg],
  }
}
