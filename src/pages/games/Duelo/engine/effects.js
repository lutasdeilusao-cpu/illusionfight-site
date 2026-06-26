// Efeitos de magias e armadilhas — CAMPO DE BATALHA
// Funções puras que retornam alterações de estado + log

export function applySpellEffect(state, card, caster = 'PLAYER', target = null) {
  const playerLP = state.playerLP
  const aiLP = state.aiLP
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
      const winner = updates.playerLP <= 0 ? 'AI' : updates.aiLP <= 0 ? 'PLAYER' : null
      if (winner) { updates.winner = winner; updates.gamePhase = 'OVER' }
      log = `${caster === 'PLAYER' ? 'Você' : 'IA'} usou ${card.name}. ${card.effectValue} de dano direto!`
      break
    }
    case 'SWAP_ATK_DEF': {
      // Aplicado via tempBuffs com flag swap
      log = `${card.name} ativado.`
      break
    }
    case 'PUSH': {
      // Empurra monstro inimigo N casas para trás
      // target = { row, col, owner } — resolvido no store
      log = `${card.name} ativado.`
      break
    }
    case 'TELEPORT': {
      // Move aliado para qualquer casa vazia
      log = `${card.name} ativado.`
      break
    }
    case 'ATK_BOOST': {
      // target = { id_num } do monstro no grid
      const id = target?.id_num
      if (id) {
        updates.tempBuffs = [...(state.tempBuffs || []), { cardId: id, atkBonus: card.effectValue, expiresOnTurn: state.turnNumber + card.duracao }]
        log = `${card.name}: +${card.effectValue} ATK.`
      } else {
        log = `${card.name} ativado, mas não há alvo.`
      }
      break
    }
    case 'DEF_BOOST': {
      const id = target?.id_num
      if (id) {
        updates.tempBuffs = [...(state.tempBuffs || []), { cardId: id, defBonus: card.effectValue, expiresOnTurn: state.turnNumber + card.duracao }]
        log = `${card.name}: +${card.effectValue} DEF.`
      } else {
        log = `${card.name} ativado, mas não há alvo.`
      }
      break
    }
    case 'MOV_BOOST': {
      const id = target?.id_num
      if (id) {
        updates.tempBuffs = [...(state.tempBuffs || []), { cardId: id, movBonus: card.effectValue, expiresOnTurn: state.turnNumber + card.duracao }]
        log = `${card.name}: +${card.effectValue} MOV.`
      } else {
        log = `${card.name} ativado, mas não há alvo.`
      }
      break
    }
    case 'RNG_BOOST': {
      const id = target?.id_num
      if (id) {
        updates.tempBuffs = [...(state.tempBuffs || []), { cardId: id, rngBonus: card.effectValue, expiresOnTurn: state.turnNumber + card.duracao }]
        log = `${card.name}: +${card.effectValue} RNG.`
      } else {
        log = `${card.name} ativado, mas não há alvo.`
      }
      break
    }
    case 'ATK_REDUCE': {
      const id = target?.id_num
      if (id) {
        updates.tempBuffs = [...(state.tempBuffs || []), { cardId: id, atkBonus: -card.effectValue, expiresOnTurn: state.turnNumber + card.duracao }]
        log = `${card.name}: -${card.effectValue} ATK.`
      } else {
        log = `${card.name} ativado, mas não há alvo.`
      }
      break
    }
    case 'DESTROY': {
      // Destruição Total — resolve no store com target
      log = `${card.name}: destruição total ativada!`
      break
    }
    default:
      log = `${card.name} foi ativado.`
  }

  return { updates, log }
}

// Aplica efeito de armadilha quando monstro pisa na casa
export function applyTrapEffect(state, trap, monsterOwner) {
  const updates = {}
  let log = ''

  const targetIsPlayer = monsterOwner === 'PLAYER'
  const dmgTo = targetIsPlayer ? 'playerLP' : 'aiLP'

  switch (trap.effect) {
    case 'SKIP_TURN':
      log = `${trap.name}! Monstro perderá o próximo turno.`
      break
    case 'DAMAGE': {
      const cur = state[dmgTo]
      updates[dmgTo] = Math.max(0, cur - trap.effectValue)
      log = `${trap.name}! ${trap.effectValue} de dano ao dono!`
      break
    }
    case 'MOV_ZERO':
      log = `${trap.name}! MOV reduzido a 0 por ${trap.duracao} turnos.`
      break
    case 'THORNS': {
      const cur = state[dmgTo]
      updates[dmgTo] = Math.max(0, cur - trap.effectValue)
      log = `${trap.name}! ${trap.effectValue} de dano ao dono!`
      break
    }
    case 'ATK_DRAIN':
      log = `${trap.name}! -${trap.effectValue} ATK permanente.`
      break
    case 'POISON':
      log = `${trap.name}! ${trap.effectValue} de dano por turno por ${trap.duracao} turnos.`
      break
    default:
      log = `${trap.name} foi ativada!`
  }

  return { updates, log }
}
