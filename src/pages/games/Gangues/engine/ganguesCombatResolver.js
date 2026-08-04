import { normalizeGanguesLoadout } from '../data/ganguesLoadout.js'

export function buildGanguesModifiers(combatant = {}) {
  const loadout = normalizeGanguesLoadout(combatant)
  return loadout.combat_path ? [`path:${loadout.combat_path}`] : []
}

export function resolveGanguesInitiative({ combatant, roll }) {
  const ability = Number(combatant.attributes?.H) || 0
  return { ability, die: roll, total: ability + roll }
}

/**
 * Bônus de caminho — regra combinada com Isaias em 2026-08-04:
 * - Atacante: +1 no ataque, por sorte (50%, mostrado no log se caiu ou não).
 * - Defensor: +1 na defesa, por sorte (50%), mesma lógica do lado defensivo.
 * - Místico: todo ataque dele é mágico neste sistema (não há escolha de modo físico/mágico
 *   separada), então o +1 de ataque é garantido sempre que ele ataca. Na defesa, só ganha
 *   +1 quando o atacante também é místico (mágica contra mágica); contra ataque físico não
 *   recebe bônus de defesa nenhum.
 */
function resolveAttackerBonus(attackerPath, bonusRoll) {
  if (attackerPath === 'atacante') return { path: 'atacante', applied: !!bonusRoll, amount: 1 }
  if (attackerPath === 'mistico') return { path: 'mistico', applied: true, amount: 1 }
  return { path: null, applied: false, amount: 0 }
}

function resolveDefenderBonus(defenderPath, attackerPath, bonusRoll) {
  if (defenderPath === 'defensor') return { path: 'defensor', applied: !!bonusRoll, amount: 1 }
  if (defenderPath === 'mistico' && attackerPath === 'mistico') return { path: 'mistico', applied: true, amount: 1 }
  return { path: null, applied: false, amount: 0 }
}

// Dano mínimo garantido de 1: mesmo com defesa agora rolando d3 também, um golpe nunca
// é totalmente anulado — evita as rodadas de "dano zero" que arrastavam o combate.
export function resolveGanguesAction({ attacker, defender, action, rolls, activeModifiers = {} }) {
  const attack = Number(attacker.attributes?.A) || 0
  const agility = Math.floor((Number(attacker.attributes?.H) || 0) / 2)
  const defense = Number(defender.attributes?.D) || 0

  const attackerBonus = resolveAttackerBonus(attacker.combat_path, rolls.attackerBonus)
  const defenderBonus = resolveDefenderBonus(defender.combat_path, attacker.combat_path, rolls.defenderBonus)

  const fa = attack + agility + rolls.fa + (attackerBonus.applied ? attackerBonus.amount : 0)
  const fd = defense + rolls.fd + (defenderBonus.applied ? defenderBonus.amount : 0)
  const damage = Math.max(1, fa - fd)

  return {
    action, mode: 'attack', fa, fd, damage, counterDamage: 0,
    rolls: { ...rolls }, attackerBonus, defenderBonus, pmCost: 0,
    attackerStatuses: [...(attacker.statuses || [])],
    defenderStatuses: [...(defender.statuses || [])],
    modifiers: activeModifiers, effects: [], skipped: false,
  }
}
