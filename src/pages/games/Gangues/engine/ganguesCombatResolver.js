import { applyGanguesAttackerEffect, applyGanguesDefenderEffect, buildGanguesEffectsList } from './ganguesSpecialEffects.js'

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
  return { path: null, applied: false, amount: 0 }
}

function resolveDefenderBonus(defenderPath, attackerPath, bonusRoll) {
  return { path: null, applied: false, amount: 0 }
}

// O dado de ataque é um d3 (1-3). Tirar o valor máximo (3) é crítico: soma +2 na rolagem
// do ataque (então um 3 crítico vale 5 no cálculo de FA). Só o ataque critica, não a defesa.
export const ATTACK_DIE_SIDES = 3
export const CRITICAL_BONUS = 2

// Sem piso de dano — defesa bem investida pode anular o golpe (dano 0). Isaias
// removeu o mínimo garantido de 1 depois de jogar bastante: com bandos grandes,
// aquele "sempre acerta pelo menos 1" deixava todo hit relevante, sem chance de
// defesa de verdade zerar o golpe. FA/FD continuam calculados igual; só o clamp
// final mudou de Math.max(1, ...) pra Math.max(0, ...).
//
// `activeSpecialId`: id do poder ativo equipado que o atacante escolheu usar nesta ação (ou
// null pra ataque normal). Efeitos passivos equipados de ambos os lados aplicam sempre. Ver
// engine/ganguesSpecialEffects.js pros valores e docs/Games/Gangues/GANGUES_PROGRESSAO_RASCUNHO.md
// pro design original (com as simplificações feitas pra caber no modelo de 1 ação por turno).
export function resolveGanguesAction({ attacker, defender, action, rolls, activeSpecialId = null }) {
  const attack = Number(attacker.attributes?.A) || 0
  const agility = Math.floor((Number(attacker.attributes?.H) || 0) / 2)
  const defense = Number(defender.attributes?.D) || 0

  const attackerBonus = resolveAttackerBonus(attacker.combat_path, rolls.attackerBonus)
  const defenderBonus = resolveDefenderBonus(defender.combat_path, attacker.combat_path, rolls.defenderBonus)

  const critical = rolls.fa === ATTACK_DIE_SIDES
  const attackRollValue = rolls.fa + (critical ? CRITICAL_BONUS : 0)

  const attackerEffects = buildGanguesEffectsList(attacker, activeSpecialId)
  const defenderEffects = buildGanguesEffectsList(defender, null)
  const ctx = { attacker, target: defender, faMod: 0, fdMod: 0, ignoreDefPct: 0, targetDefenseReduction: 0, pmCost: 0, pvCostPct: 0, selfShieldSet: 0, chargeGain: 0, chargeSpent: 0 }
  for (const item of attackerEffects) applyGanguesAttackerEffect(item, ctx)
  for (const item of defenderEffects) applyGanguesDefenderEffect(item, ctx)

  const effectiveDefense = Math.max(0, Math.round(defense * (1 - ctx.ignoreDefPct / 100)) - ctx.targetDefenseReduction)

  const fa = attack + agility + attackRollValue + (attackerBonus.applied ? attackerBonus.amount : 0) + ctx.faMod
  const fd = effectiveDefense + rolls.fd + (defenderBonus.applied ? defenderBonus.amount : 0) + ctx.fdMod
  let damage = Math.max(0, fa - fd)

  const incomingShield = defender.specialState?.shield || 0
  let shieldConsumed = 0
  if (incomingShield > 0) { shieldConsumed = Math.min(incomingShield, damage); damage = Math.max(0, damage - incomingShield) }

  const pvCost = ctx.pvCostPct ? Math.max(1, Math.ceil((attacker.pv || 0) * ctx.pvCostPct / 100)) : 0

  const attackerSpecialState = {
    ...(attacker.specialState || {}),
    charge: ctx.chargeSpent ? 0 : (attacker.specialState?.charge || 0),
    shield: ctx.selfShieldSet || (attacker.specialState?.shield || 0),
  }
  const defenderSpecialState = {
    ...(defender.specialState || {}),
    charge: (defender.specialState?.charge || 0) + ctx.chargeGain,
    shield: incomingShield > 0 ? 0 : (defender.specialState?.shield || 0),
    totalPvLost: (defender.specialState?.totalPvLost || 0) + damage,
  }

  return {
    action, mode: 'attack', fa, fd, damage, pmCost: ctx.pmCost, pvCost,
    rolls: { ...rolls }, attackerBonus, defenderBonus, critical, criticalBonus: critical ? CRITICAL_BONUS : 0,
    attackerStatuses: [...(attacker.statuses || [])],
    defenderStatuses: [...(defender.statuses || [])],
    activeSpecialId: attackerEffects.find(item => item.kind === 'active')?.id || null,
    ignoreDefPct: ctx.ignoreDefPct, shieldConsumed,
    attackerSpecialState, defenderSpecialState,
  }
}
