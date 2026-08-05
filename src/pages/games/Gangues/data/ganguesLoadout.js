export const GANGUES_PATHS = ['atacante', 'defensor', 'mistico']
export const GANGUES_CREATION_POINTS = 5
export const GANGUES_ATTRIBUTE_MAX = 5
export const GANGUES_INITIAL_PARTY_SIZE = 2
export const GANGUES_MAX_PARTY_SIZE = 5
export const GANGUES_ROSTER_LIMITS = { free: 3, elite: 5, primordial: 7 }

// Slots extras de gangue destravam com XP acumulado no roster; começa em 2 e sobe até o teto de 5.
export const GANGUES_PARTY_SIZE_THRESHOLDS = [
  { size: 2, xp: 0 },
  { size: 3, xp: 50 },
  { size: 4, xp: 150 },
  { size: 5, xp: 300 },
]

export function getGanguesPartySizeLimit(totalXp = 0) {
  let limit = GANGUES_INITIAL_PARTY_SIZE
  for (const step of GANGUES_PARTY_SIZE_THRESHOLDS) {
    if (totalXp >= step.xp) limit = step.size
  }
  return Math.min(GANGUES_MAX_PARTY_SIZE, limit)
}

export function getGanguesRosterLimit(tier) {
  return GANGUES_ROSTER_LIMITS[tier] || GANGUES_ROSTER_LIMITS.free
}

export const GANGUES_RESOURCE_RATES = {
  atacante: { pvPerR: 3, pmPerR: 3 },
  defensor: { pvPerR: 4, pmPerR: 2 },
  mistico: { pvPerR: 2, pmPerR: 4 },
}

export function getGanguesResources(combatPath, resistance = 0) {
  const rate = GANGUES_RESOURCE_RATES[combatPath] || { pvPerR: 0, pmPerR: 0 }
  const safeResistance = Math.max(0, Number(resistance) || 0)
  return {
    pvMax: safeResistance * rate.pvPerR,
    pmMax: safeResistance * rate.pmPerR,
    ...rate,
  }
}

export function normalizeGanguesLoadout(sheet = {}) {
  const combatPath = GANGUES_PATHS.includes(sheet.combat_path) ? sheet.combat_path : null
  const source = sheet.attributes || {}

  return {
    combat_path: combatPath,
    attributes: Object.fromEntries(['A', 'H', 'R', 'D'].map(attr => [attr, Math.max(0, Number(source[attr]) || 0)])),
    loadout_version: 2,
  }
}
