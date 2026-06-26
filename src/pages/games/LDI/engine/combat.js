import { rollD6 } from './dice'

export function calcFA(mode, sheet, weaponBonus = 0) {
  const { F, H, PdF } = sheet.attributes
  const roll = rollD6()
  switch (mode) {
    case 'fists':
      return { value: F + H + roll, roll, breakdown: `F ${F} + H ${H} + 🎲 ${roll}` }
    case 'armed':
      return { value: H + weaponBonus + roll, roll, breakdown: `H ${H} + Arma ${weaponBonus} + 🎲 ${roll}` }
    case 'power':
      return { value: PdF + H + roll, roll, breakdown: `PdF ${PdF} + H ${H} + 🎲 ${roll}` }
    default:
      return { value: H + roll, roll, breakdown: `H ${H} + 🎲 ${roll}` }
  }
}

export function calcFD(sheet, hasHability = true) {
  const { A, H } = sheet.attributes
  const roll = rollD6()
  const value = hasHability ? A + H + roll : A + roll
  const breakdown = hasHability
    ? `A ${A} + H ${H} + 🎲 ${roll}`
    : `A ${A} + 🎲 ${roll} (sem H)`
  return { value, roll, breakdown }
}

export function calcDamage(fa, fd) {
  return Math.max(0, fa - fd)
}

export function applyStatus(character, status) {
  const statuses = [...(character.statuses || [])]
  const existing = statuses.findIndex(s => s.id === status.id)
  if (existing >= 0) {
    statuses[existing] = { ...statuses[existing], ...status }
  } else {
    statuses.push({ ...status, duration: status.duration ?? 1 })
  }
  return { ...character, statuses }
}

export function tickStatuses(character) {
  const statuses = (character.statuses || [])
    .map(s => ({ ...s, duration: s.duration - 1 }))
    .filter(s => s.duration > 0)
  return { ...character, statuses }
}

export function deathTest() {
  const roll = rollD6()
  if (roll <= 2) return 'weak'
  if (roll <= 4) return 'unconscious'
  if (roll === 5) return 'nearDeath'
  return 'eliminated'
}

export function calcInitiative(sheet) {
  return sheet.attributes.H + rollD6()
}
