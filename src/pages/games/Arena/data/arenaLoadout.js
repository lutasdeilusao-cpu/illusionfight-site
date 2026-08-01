export const ARENA_STYLES = ['brutamontes', 'duelista', 'canalizador']
export const ARENA_TECHNIQUES = ['bloqueio', 'esquiva', 'furia', 'regeneracao', 'mira_letal', 'contra_ataque']
export const ARENA_WEAKNESSES = ['lento', 'franzino', 'sedento', 'sensivel']

export const STYLE_WEAPONS = {
  brutamontes: { weapon: 'punhos', weaponBonus: 0, preferredMode: 'fists' },
  duelista: { weapon: 'arma_duelista', weaponBonus: 2, preferredMode: 'armed' },
  canalizador: { weapon: 'foco_arcano', weaponBonus: 0, preferredMode: 'power' },
}

export function inferArenaStyle(attributes = {}) {
  if ((attributes.PdF || 0) >= Math.max(attributes.F || 0, attributes.H || 0)) return 'canalizador'
  if ((attributes.H || 0) >= (attributes.F || 0)) return 'duelista'
  return 'brutamontes'
}

export function normalizeArenaLoadout(sheet = {}) {
  const combatStyle = ARENA_STYLES.includes(sheet.combat_style)
    ? sheet.combat_style
    : inferArenaStyle(sheet.attributes)
  const techniqueIds = Array.isArray(sheet.technique_ids)
    ? sheet.technique_ids.filter(id => ARENA_TECHNIQUES.includes(id)).slice(0, 2)
    : []
  const weaknessId = ARENA_WEAKNESSES.includes(sheet.weakness_id) ? sheet.weakness_id : null

  return {
    combat_style: combatStyle,
    technique_ids: techniqueIds,
    weakness_id: weaknessId,
    loadout_version: Number(sheet.loadout_version) || 1,
    weapon: STYLE_WEAPONS[combatStyle].weapon,
  }
}
