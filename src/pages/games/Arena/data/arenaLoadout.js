export const ARENA_PATHS = ['atacante', 'defensor', 'mistico']

// Cinco pontos iniciais distribuídos automaticamente. O jogador escolhe somente o caminho.
export const ARENA_PATH_PRESETS = {
  atacante: { A: 3, H: 1, R: 1, D: 0 },
  defensor: { A: 1, H: 0, R: 2, D: 2 },
  mistico: { A: 2, H: 1, R: 1, D: 1 },
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
  const preset = combatPath ? ARENA_PATH_PRESETS[combatPath] : { A: 0, H: 0, R: 0, D: 0 }

  return {
    combat_path: combatPath,
    attributes: { ...preset },
    loadout_version: 2,
  }
}
