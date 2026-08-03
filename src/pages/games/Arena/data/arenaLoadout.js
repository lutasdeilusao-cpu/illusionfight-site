export const ARENA_PATHS = ['atacante', 'defensor', 'mistico']
export const ARENA_CREATION_POINTS = 5
export const ARENA_ATTRIBUTE_MAX = 5
export const ARENA_INITIAL_PARTY_SIZE = 2
export const ARENA_MAX_PARTY_SIZE = 5
export const ARENA_MULTIPLAYER_SIZES = [2, 3, 4]
export const ARENA_ROSTER_LIMITS = { free: 3, elite: 5, primordial: 7 }

export function getArenaRosterLimit(tier) {
  return ARENA_ROSTER_LIMITS[tier] || ARENA_ROSTER_LIMITS.free
}

export function hasArenaMultiplayer(tier) {
  return tier === 'elite' || tier === 'primordial'
}

// O caminho não distribui atributos: todos os personagens começam com 5 pontos livres.
export const ARENA_PATH_PRESETS = {
  atacante: { A: 0, H: 0, R: 0, D: 0 },
  defensor: { A: 0, H: 0, R: 0, D: 0 },
  mistico: { A: 0, H: 0, R: 0, D: 0 },
}

export const ARENA_RESOURCE_RATES = {
  atacante: { pvPerR: 3, pmPerR: 3 },
  defensor: { pvPerR: 4, pmPerR: 2 },
  mistico: { pvPerR: 2, pmPerR: 4 },
}

export function getArenaResources(combatPath, resistance = 0) {
  const rate = ARENA_RESOURCE_RATES[combatPath] || { pvPerR: 0, pmPerR: 0 }
  const safeResistance = Math.max(0, Number(resistance) || 0)
  return {
    pvMax: safeResistance * rate.pvPerR,
    pmMax: safeResistance * rate.pmPerR,
    ...rate,
  }
}

export function normalizeArenaLoadout(sheet = {}) {
  const combatPath = ARENA_PATHS.includes(sheet.combat_path) ? sheet.combat_path : null
  const source = sheet.attributes || {}

  return {
    combat_path: combatPath,
    attributes: Object.fromEntries(['A', 'H', 'R', 'D'].map(attr => [attr, Math.max(0, Number(source[attr]) || 0)])),
    loadout_version: 2,
  }
}
