import { execute as standard } from './attackAnim1Standard'

/**
 * AttackAnimId — enum de IDs de animação de ataque.
 * Ao adicionar nova animação:
 *   1. Criar attackAnimN[Name].js com export function execute(...)
 *   2. Importar aqui
 *   3. Adicionar entrada no enum
 *   4. Registrar no REGISTRY
 */
export const AttackAnimId = {
  STANDARD: 1,
  POWER:    2,
  CHARGE:   3,
}

const REGISTRY = {
  [AttackAnimId.STANDARD]: standard,
  [AttackAnimId.POWER]:    standard,
  [AttackAnimId.CHARGE]:   standard,
}

export function getAttackAnimation(id) {
  return REGISTRY[id] || REGISTRY[AttackAnimId.STANDARD]
}
