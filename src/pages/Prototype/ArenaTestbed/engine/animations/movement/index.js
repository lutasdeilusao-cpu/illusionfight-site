import { execute as standard  } from './moveAnim1Standard'
import { execute as teleport  } from './moveAnim2Teleport'
import { execute as slingshot } from './moveAnim3Slingshot'

export const MOVEMENT_ANIMATIONS = {
  1: standard,
  2: teleport,
  3: slingshot,
}

export function getMovementAnimation(id) {
  return MOVEMENT_ANIMATIONS[id] || MOVEMENT_ANIMATIONS[1]
}
