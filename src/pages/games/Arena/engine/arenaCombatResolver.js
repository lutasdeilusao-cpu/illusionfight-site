import { normalizeArenaLoadout } from '../data/arenaLoadout.js'

export function buildArenaModifiers(combatant = {}) {
  const loadout = normalizeArenaLoadout(combatant)
  return loadout.combat_path ? [`path:${loadout.combat_path}`] : []
}

export function resolveArenaInitiative({ combatant, roll }) {
  const ability = Number(combatant.attributes?.H) || 0
  return { value: ability + roll, roll, breakdown: `H ${ability} + 🎲 ${roll}` }
}

export function resolveArenaAction({ attacker, defender, action, rolls, activeModifiers = {} }) {
  const attack = Number(attacker.attributes?.A) || 0
  const attackAbility = Math.floor((Number(attacker.attributes?.H) || 0) / 2)
  const defense = Number(defender.attributes?.D) || 0
  const defenseAbility = Math.floor((Number(defender.attributes?.H) || 0) / 2)
  const fa = Math.max(0, attack + attackAbility + rolls.fa)
  const fd = Math.max(0, defense + defenseAbility + rolls.fd)

  return {
    action, mode: 'attack', fa, fd, damage: Math.max(0, fa - fd), counterDamage: 0,
    rolls: { ...rolls }, pmCost: 0,
    attackerStatuses: [...(attacker.statuses || [])],
    defenderStatuses: [...(defender.statuses || [])],
    modifiers: activeModifiers, effects: [], skipped: false,
  }
}
