import { normalizeArenaLoadout } from '../data/arenaLoadout.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const has = (modifiers, id) => modifiers.includes(id)

export function buildArenaModifiers(combatant = {}, context = {}) {
  const loadout = normalizeArenaLoadout(combatant)
  const modifiers = [
    `path:${loadout.combat_path}`,
  ]
  if (combatant.elemental) modifiers.push(`element:${combatant.elemental}`)
  if (context.aiModifier) modifiers.push(context.aiModifier)
  if ((combatant.statuses || []).includes('aimed')) modifiers.push('status:aimed')
  if ((combatant.statuses || []).includes('charged')) modifiers.push('status:charged')
  return modifiers
}

export function resolveArenaInitiative({ combatant, roll, modifiers = [] }) {
  let value = (combatant.attributes?.H || 0) + roll
  return { value, roll, breakdown: `H ${combatant.attributes?.H || 0} + 🎲 ${roll}` }
}

export function resolveArenaAction({ attacker, defender, action, rolls, activeModifiers = {} }) {
  const attackerMods = activeModifiers.attacker || buildArenaModifiers(attacker)
  const defenderMods = activeModifiers.defender || buildArenaModifiers(defender)
  const attackerStatuses = [...(attacker.statuses || [])]
  const defenderStatuses = [...(defender.statuses || [])]
  const mode = action.mode || 'fists'
  const result = {
    action, mode, fa: 0, fd: 0, damage: 0, counterDamage: 0,
    rolls: { ...rolls },
    attackerHeal: 0, defenderHeal: 0, pmCost: action.powerCost || 0,
    attackerStatuses, defenderStatuses, skipped: false, effects: [],
  }

  if (action.type === 'charge') {
    if (!attackerStatuses.includes('charged')) attackerStatuses.push('charged')
    result.skipped = true
    result.effects.push('thunder_charge')
    return result
  }

  const a = attacker.attributes || {}
  const d = defender.attributes || {}
  // Sem tabuleiro, alcance não cria uma decisão: A representa qualquer ataque.
  let faBase = (a.A || 0) + (a.H || 0)
  let fdBase = (d.D || 0) + (d.H || 0)

  // pré-FA
  if (has(attackerMods, 'status:aimed')) { faBase += 3; result.effects.push('mira_letal_hit'); attackerStatuses.splice(attackerStatuses.indexOf('aimed'), 1) }
  if (has(attackerMods, 'ai:training_soft')) faBase -= 1
  if (has(attackerMods, 'ai:kaeda_momentum')) { faBase += 2; result.effects.push('kaeda_momentum') }

  // pré-FD

  result.fa = Math.max(0, faBase + rolls.fa)
  result.fd = Math.max(0, fdBase + rolls.fd)
  result.damage = Math.max(0, result.fa - result.fd)

  // pós-dano
  if (mode === 'power' && attacker.elemental && attacker.elemental !== 'neutro' && result.damage > 0) { result.damage += 1; result.effects.push('elemental') }
  if (has(attackerMods, 'status:charged')) { result.damage += 4; result.effects.push('thunder_discharge'); attackerStatuses.splice(attackerStatuses.indexOf('charged'), 1) }

  result.damage = clamp(result.damage + (action.damageBonus || 0), 0, 999)
  return result
}

export function resolveArenaRoundClose({ combatant, pv, pvMax, modifiers = buildArenaModifiers(combatant) }) {
  return { pv: Math.min(pv, pvMax), heal: 0, effects: [], modifiers }
}

export function chooseArenaEnemyAction(enemy, aiState = {}) {
  if (enemy.id === 'treinamento') return { type: 'attack', mode: 'fists', aiModifier: 'ai:training_soft' }
  if (enemy.id === 'kaeda') return { type: 'attack', mode: 'armed', aiModifier: aiState.lastAttackHit ? 'ai:kaeda_momentum' : null }
  if (enemy.id === 'thunderbolt') {
    return aiState.charged
      ? { type: 'attack', mode: 'power' }
      : { type: 'charge', mode: 'power' }
  }
  return { type: 'attack', mode: enemy.preferred_mode || 'fists' }
}
