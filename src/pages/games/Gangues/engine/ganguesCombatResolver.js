import { normalizeGanguesLoadout } from '../data/ganguesLoadout.js'

export function buildGanguesModifiers(combatant = {}) {
  const loadout = normalizeGanguesLoadout(combatant)
  return loadout.combat_path ? [`path:${loadout.combat_path}`] : []
}

// Dano mínimo garantido de 1: com um único d6 do lado do atacante, a defesa reduz
// mas não consegue mais anular o ataque, evitando as rodadas de "dano zero" que
// arrastavam o combate por dezenas de turnos no modelo anterior (fa vs fd com 2 dados).
export function resolveGanguesAction({ attacker, defender, action, rolls, activeModifiers = {} }) {
  const attack = Number(attacker.attributes?.A) || 0
  const agility = Math.floor((Number(attacker.attributes?.H) || 0) / 2)
  const defense = Number(defender.attributes?.D) || 0
  const fa = attack + agility + rolls.fa
  const fd = defense
  const damage = Math.max(1, fa - fd)

  return {
    action, mode: 'attack', fa, fd, damage, counterDamage: 0,
    rolls: { ...rolls }, pmCost: 0,
    attackerStatuses: [...(attacker.statuses || [])],
    defenderStatuses: [...(defender.statuses || [])],
    modifiers: activeModifiers, effects: [], skipped: false,
  }
}
