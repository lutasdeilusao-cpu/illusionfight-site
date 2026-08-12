export const GANGUES_PATHS = ['atacante', 'defensor', 'mistico']
export const GANGUES_CREATION_POINTS = 5
export const GANGUES_ATTRIBUTE_MAX = 5
export const GANGUES_AP_PER_XP = 10
export const GANGUES_ATTRIBUTE_XP_COSTS = { 5: 3, 6: 5, 7: 7, 8: 9, 9: 12 }
export const GANGUES_SPECIAL_COSTS = { 0: 1, 1: 2, 2: 3 }
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

export const GANGUES_ATTACKER_SPECIALS = GANGUES_SPECIAL_PATHS.atacante[0].specials

export function defaultGanguesProgression() {
  return { ap: 0, xp_unspent: 0, special_path: null, special_levels: {}, selected_specials: [] }
}

export function getGanguesProgression(sheet = {}) {
  const source = sheet.attributes?.progression || sheet.progression || {}
  const specialLevels = Object.fromEntries(Object.entries(source.special_levels || {}).map(([id, level]) => [id, Math.max(0, Math.min(3, Number(level) || 0))]))
  const combatPath = sheet.combat_path || null
  const selectedPath = getGanguesSpecialPath(combatPath, source.special_path)?.id || null
  const selected = Array.isArray(source.selected_specials) ? source.selected_specials.filter(id => specialLevels[id] > 0 && isGanguesSpecialAllowed(combatPath, selectedPath, id)).slice(0, 2) : []
  return { ...defaultGanguesProgression(), ...source, ap: Math.max(0, Number(source.ap) || 0), xp_unspent: Math.max(0, Number(source.xp_unspent) || 0), special_path: selectedPath, special_levels: specialLevels, selected_specials: selected }
}

export function selectGanguesSpecialPath(sheet, specialPath) {
  const progression = getGanguesProgression(sheet)
  const nextPath = getGanguesSpecialPath(sheet.combat_path, specialPath)
  if (!nextPath) return null
  return { attributes: { ...sheet.attributes, progression: { ...progression, special_path: nextPath.id, selected_specials: progression.selected_specials.filter(id => nextPath.specials.some(item => item.id === id)) } } }
}

export function addGanguesAp(sheet, amount) {
  const progression = getGanguesProgression(sheet)
  const ap = progression.ap + Math.max(0, Number(amount) || 0)
  const earnedXp = Math.floor(ap / GANGUES_AP_PER_XP)
  return { progression: { ...progression, ap: ap % GANGUES_AP_PER_XP, xp_unspent: progression.xp_unspent + earnedXp }, earnedXp }
}

export function upgradeGanguesAttribute(sheet, attribute) {
  const current = Number(sheet.attributes?.[attribute]) || 0
  const cost = GANGUES_ATTRIBUTE_XP_COSTS[current]
  const progression = getGanguesProgression(sheet)
  if (!cost || progression.xp_unspent < cost) return null
  return { attributes: { ...sheet.attributes, [attribute]: current + 1, progression: { ...progression, xp_unspent: progression.xp_unspent - cost } } }
}

export function upgradeGanguesSpecial(sheet, specialId) {
  const progression = getGanguesProgression(sheet)
  if (!isGanguesSpecialAllowed(sheet.combat_path, progression.special_path, specialId)) return null
  const level = progression.special_levels[specialId] || 0
  const cost = GANGUES_SPECIAL_COSTS[level]
  if (!cost || progression.xp_unspent < cost) return null
  return { attributes: { ...sheet.attributes, progression: { ...progression, xp_unspent: progression.xp_unspent - cost, special_levels: { ...progression.special_levels, [specialId]: level + 1 } } } }
}

export function toggleGanguesSpecial(sheet, specialId) {
  const progression = getGanguesProgression(sheet)
  if (!progression.special_levels[specialId] || !isGanguesSpecialAllowed(sheet.combat_path, progression.special_path, specialId)) return null
  const selected = progression.selected_specials.includes(specialId)
    ? progression.selected_specials.filter(id => id !== specialId)
    : progression.selected_specials.length < 2 ? [...progression.selected_specials, specialId] : progression.selected_specials
  return { attributes: { ...sheet.attributes, progression: { ...progression, selected_specials: selected } } }
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
    attributes: { ...Object.fromEntries(['A', 'H', 'R', 'D'].map(attr => [attr, Math.max(0, Number(source[attr]) || 0)])), progression: getGanguesProgression({ combat_path: combatPath, attributes: source, progression: sheet.progression }) },
    loadout_version: 2,
  }
}
import { GANGUES_SPECIAL_PATHS, getGanguesSpecialPath, isGanguesSpecialAllowed } from './ganguesSpecials.js'
