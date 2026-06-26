import { execute as standardPlus } from './attackAnim1StandardPlus'
import { execute as rageDash     } from './attackAnim2RageDash'
import { execute as energyPunch  } from './attackAnim3EnergyPunch'
import { execute as straightShot } from './rangeAnim1StraightShot'
import { execute as burstFire    } from './rangeAnim2BurstFire'
import { execute as spiritGun    } from './rangeAnim3SpiritGun'

/**
 * AttackAnimId — enum de IDs de animação de ataque melee.
 * Ao adicionar nova animação:
 *   1. Criar attackAnimN[Name].js com export function execute(...)
 *   2. Importar aqui
 *   3. Adicionar entrada no enum
 *   4. Registrar no REGISTRY
 */
export const AttackAnimId = {
  STANDARD_PLUS: 1,
  RAGE_DASH:     2,
  ENERGY_PUNCH:  3,
}

const REGISTRY = {
  [AttackAnimId.STANDARD_PLUS]: standardPlus,
  [AttackAnimId.RAGE_DASH]:     rageDash,
  [AttackAnimId.ENERGY_PUNCH]:  energyPunch,
}

export function getAttackAnimation(id) {
  return REGISTRY[id] || REGISTRY[AttackAnimId.STANDARD_PLUS]
}

export const RangeAnimId = {
  STRAIGHT_SHOT: 1,
  BURST_FIRE:    2,
  SPIRIT_GUN:    3,
}

const RANGE_REGISTRY = {
  [RangeAnimId.STRAIGHT_SHOT]: straightShot,
  [RangeAnimId.BURST_FIRE]:    burstFire,
  [RangeAnimId.SPIRIT_GUN]:    spiritGun,
}

export function getRangeAnimation(id) {
  return RANGE_REGISTRY[id] || RANGE_REGISTRY[RangeAnimId.STRAIGHT_SHOT]
}
