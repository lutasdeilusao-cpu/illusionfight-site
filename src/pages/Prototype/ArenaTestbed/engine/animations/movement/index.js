import { execute as standard  } from './moveAnim1Standard'
import { execute as teleport  } from './moveAnim2Teleport'
import { execute as slingshot } from './moveAnim3Slingshot'

/**
 * MovementAnimId — enum de IDs de animação de movimento.
 * Ao adicionar nova animação:
 *   1. Criar moveAnimN[Name].js com export function execute(...)
 *   2. Importar aqui
 *   3. Adicionar entrada no enum
 *   4. Registrar no REGISTRY
 */
export const MovementAnimId = {
  STANDARD:  1,
  TELEPORT:  2,
  SLINGSHOT: 3,
}

const REGISTRY = {
  [MovementAnimId.STANDARD]:  standard,
  [MovementAnimId.TELEPORT]:  teleport,
  [MovementAnimId.SLINGSHOT]: slingshot,
}

export function getMovementAnimation(id) {
  return REGISTRY[id] || REGISTRY[MovementAnimId.STANDARD]
}
