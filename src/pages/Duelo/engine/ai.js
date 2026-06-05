// IA Greedy — toma a melhor decisão imediata em cada fase

// Main Phase
export function aiMainPhase(state) {
  const hand = state.aiHand
  const monsters = state.aiMonsterZones
  const spells = state.aiSpellZones
  const { aiLP, playerLP } = state

  // 1. Invocar monstro de maior ATK
  const playableMonsters = hand
    .filter(c => c.type === 'MONSTER')
    .sort((a, b) => b.atk - a.atk)

  if (state.hasNormalSummonedThisTurn) return null

  for (const card of playableMonsters) {
    const freeZone = monsters.findIndex(m => !m)
    if (freeZone < 0) continue

    // Tributo
    if (card.level >= 4) {
      const needed = card.level >= 6 ? 2 : 1
      const available = monsters.filter(m => m)
      if (available.length >= needed) {
        // Sacrifica os disponíveis
        let sacrificed = 0
        const newZones = [...monsters]
        const newGrave = [...state.aiGraveyard]
        for (let i = 0; i < newZones.length && sacrificed < needed; i++) {
          if (newZones[i]) { newGrave.push(newZones[i]); newZones[i] = null; sacrificed++ }
        }
        const free = newZones.findIndex(m => !m)
        newZones[free] = { ...card, position: 'ATK', placedOnTurn: state.turnNumber }
        const newHand = hand.filter(c => c.id_num !== card.id_num)
        const log = `IA invocou ${card.name} com ${needed} tributo(s).`
        return {
          aiMonsterZones: newZones,
          aiGraveyard: newGrave,
          aiHand: newHand,
          hasNormalSummonedThisTurn: true,
          summonTurn: { ...state.summonTurn, [card.id_num]: state.turnNumber },
          battleLog: [...state.battleLog, log],
        }
      }
      continue
    }

    // Invocação normal
    const newZones = [...monsters]
    newZones[freeZone] = { ...card, position: 'ATK', placedOnTurn: state.turnNumber }
    const newHand = hand.filter(c => c.id_num !== card.id_num)
    const log = `IA invocou ${card.name} (${card.atk}/${card.def}).`
    return {
      aiMonsterZones: newZones,
      aiHand: newHand,
      hasNormalSummonedThisTurn: true,
      summonTurn: { ...state.summonTurn, [card.id_num]: state.turnNumber },
      battleLog: [...state.battleLog, log],
    }
  }

  // 2. Ativar magias
  const spells2 = hand.filter(c => c.type === 'SPELL')
  if (spells2.length > 0) {
    const burnSpell = spells2.find(c => c.effect === 'BURN' && playerLP <= c.effectValue)
    if (burnSpell) {
      const newHand = hand.filter(c => c.id_num !== burnSpell.id_num)
      const newLP = Math.max(0, playerLP - burnSpell.effectValue)
      const winner = newLP <= 0 ? 'AI' : null
      return {
        aiHand: newHand,
        aiGraveyard: [...state.aiGraveyard, burnSpell],
        playerLP: newLP,
        battleLog: [...state.battleLog, `IA usou ${burnSpell.name}. ${burnSpell.effectValue} de dano!`],
        ...(winner ? { winner, gamePhase: 'OVER' } : {}),
      }
    }
    // Usa heal se LP baixo
    const healSpell = spells2.find(c => c.effect === 'HEAL' && aiLP < 4000)
    if (healSpell) {
      const newHand = hand.filter(c => c.id_num !== healSpell.id_num)
      return {
        aiHand: newHand,
        aiGraveyard: [...state.aiGraveyard, healSpell],
        aiLP: aiLP + healSpell.effectValue,
        battleLog: [...state.battleLog, `IA usou ${healSpell.name}. +${healSpell.effectValue} LP.`],
      }
    }
  }

  // 3. Colocar armadilhas face-down
  const traps = hand.filter(c => c.type === 'TRAP')
  const freeSpell = spells.findIndex(s => !s)
  if (traps.length > 0 && freeSpell >= 0) {
    const trap = traps[0]
    const newSpells = [...spells]
    newSpells[freeSpell] = { ...trap, faceDown: true, placedOnTurn: state.turnNumber }
    const newHand = hand.filter(c => c.id_num !== trap.id_num)
    return {
      aiSpellZones: newSpells,
      aiHand: newHand,
      battleLog: [...state.battleLog, `IA colocou uma carta face-down.`],
    }
  }

  return null // nada para fazer
}

// Battle Phase
export function aiBattlePhase(state) {
  const monsters = state.aiMonsterZones
  const playerMonsters = state.playerMonsterZones
  const playerHasMonsters = playerMonsters.some(m => m)

  for (let aiIdx = 0; aiIdx < monsters.length; aiIdx++) {
    const m = monsters[aiIdx]
    if (!m || m.type !== 'MONSTER' || m.position !== 'ATK') continue
    if (state.attackedThisTurn.includes(m.id_num)) continue
    // Summoning sickness
    if ((state.summonTurn[m.id_num] || 0) >= state.turnNumber) continue

    const attAtk = m.atk + (state.tempBuffs.find(b => b.cardId === m.id_num)?.atkBonus || 0)

    if (!playerHasMonsters) {
      // Ataque direto
      return { attackerIdx: aiIdx, targetIdx: -1, isDirect: true, atk: attAtk }
    }

    // Procura alvo que pode destruir sem morrer
    for (let pIdx = 0; pIdx < playerMonsters.length; pIdx++) {
      const target = playerMonsters[pIdx]
      if (!target) continue
      const targetVal = target.position === 'ATK' ? target.atk : target.def
      if (attAtk > targetVal) {
        return { attackerIdx: aiIdx, targetIdx: pIdx, atk: attAtk }
      }
    }
  }

  return null // não ataca (IA não se suicida)
}
