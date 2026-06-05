// Efeitos de magias e armadilhas — funções puras que retornam alterações de estado
export function applySpellEffect(state, card, caster = 'PLAYER') {
  const playerLP = caster === 'PLAYER' ? state.playerLP : state.aiLP
  const aiLP = caster === 'PLAYER' ? state.aiLP : state.playerLP
  const updates = {}
  let log = ''

  switch (card.effect) {
    case 'HEAL': {
      const newLP = (caster === 'PLAYER' ? playerLP : aiLP) + card.effectValue
      if (caster === 'PLAYER') updates.playerLP = newLP
      else updates.aiLP = newLP
      log = `${caster === 'PLAYER' ? 'Você' : 'IA'} usou ${card.name}. +${card.effectValue} LP.`
      break
    }
    case 'BURN': {
      const targetLP = caster === 'PLAYER' ? aiLP : playerLP
      const newTargetLP = Math.max(0, targetLP - card.effectValue)
      if (caster === 'PLAYER') updates.aiLP = newTargetLP
      else updates.playerLP = newTargetLP
      log = `${caster === 'PLAYER' ? 'Você' : 'IA'} usou ${card.name}. ${card.effectValue} de dano!`
      break
    }
    case 'ATK_BOOST': {
      const monsterZones = caster === 'PLAYER' ? state.playerMonsterZones : state.aiMonsterZones
      const monster = monsterZones.find(m => m)
      if (monster) {
        updates.tempBuffs = [...state.tempBuffs, { cardId: monster.id, atkBonus: card.effectValue, expiresOnTurn: state.turnNumber + 1 }]
        log = `${card.name}: ${monster.name} ganha +${card.effectValue} ATK.`
      } else {
        log = `${card.name} ativado, mas não há monstro para buffar.`
      }
      break
    }
    case 'DRAW': {
      const deckKey = caster === 'PLAYER' ? 'playerDeck' : 'aiDeck'
      const handKey = caster === 'PLAYER' ? 'playerHand' : 'aiHand'
      const deck = [...state[deckKey]]
      const hand = [...state[handKey]]
      for (let i = 0; i < card.effectValue && deck.length > 0; i++) {
        hand.push(deck.pop())
      }
      updates[deckKey] = deck
      updates[handKey] = hand
      log = `${caster === 'PLAYER' ? 'Você' : 'IA'} usou ${card.name}. +${card.effectValue} cartas.`
      break
    }
    case 'DESTROY_MONSTER': {
      const enemyZonesKey = caster === 'PLAYER' ? 'aiMonsterZones' : 'playerMonsterZones'
      const enemyGraveKey = caster === 'PLAYER' ? 'aiGraveyard' : 'playerGraveyard'
      const zones = [...state[enemyZonesKey]]
      const idx = zones.findIndex(m => m)
      if (idx >= 0) {
        const destroyed = zones[idx]
        zones[idx] = null
        updates[enemyZonesKey] = zones
        updates[enemyGraveKey] = [...state[enemyGraveKey], destroyed]
        log = `${card.name}: ${destroyed.name} foi destruído!`
      } else {
        log = `${card.name} ativado, mas não há monstros inimigos.`
      }
      break
    }
    case 'NEGATE_ATTACK':
      log = `${card.name}: ataque negado!`
      break
    case 'DESTROY_ATTACKER': {
      const attZonesKey = caster === 'PLAYER' ? 'aiMonsterZones' : 'playerMonsterZones'
      const attGraveKey = caster === 'PLAYER' ? 'aiGraveyard' : 'playerGraveyard'
      const zones = [...state[attZonesKey]]
      const idx = zones.findIndex(m => m && m.position === 'ATK')
      if (idx >= 0) {
        const destroyed = zones[idx]
        zones[idx] = null
        updates[attZonesKey] = zones
        updates[attGraveKey] = [...state[attGraveKey], destroyed]
        log = `${card.name}: ${destroyed.name} foi destruído ao atacar!`
      }
      break
    }
    case 'REDUCE_ATK': {
      const enemyZonesKey = caster === 'PLAYER' ? 'aiMonsterZones' : 'playerMonsterZones'
      const zones = state[enemyZonesKey]
      const target = zones.find(m => m)
      if (target) {
        updates.tempBuffs = [...state.tempBuffs, { cardId: target.id, atkBonus: -card.effectValue, expiresOnTurn: state.turnNumber + 1 }]
        log = `${card.name}: ${target.name} perde ${card.effectValue} ATK.`
      }
      break
    }
    default:
      log = `${card.name} foi ativado.`
  }

  return { updates, log }
}
