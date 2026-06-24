import { execute as hit         } from './defenseAnim1Hit'
import { execute as block       } from './defenseAnim2Block'
import { execute as magicShield } from './defenseAnim3MagicShield'

export const DefenseAnimId = {
  HIT:          1,
  BLOCK:        2,
  MAGIC_SHIELD: 3,
}

const REGISTRY = {
  [DefenseAnimId.HIT]:          hit,
  [DefenseAnimId.BLOCK]:        block,
  [DefenseAnimId.MAGIC_SHIELD]: magicShield,
}

export function getDefenseAnimation(id) {
  return REGISTRY[id] || REGISTRY[DefenseAnimId.HIT]
}
