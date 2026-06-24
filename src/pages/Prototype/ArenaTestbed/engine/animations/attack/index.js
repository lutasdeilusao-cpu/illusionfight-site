import { execute as standardPlus } from './attackAnim1StandardPlus'
import { execute as rageDash     } from './attackAnim2RageDash'
import { execute as energyPunch  } from './attackAnim3EnergyPunch'

/**
 * AttackAnimId — enum de IDs de animação de ataque.
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
