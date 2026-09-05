import catalog from '../../../../../ldi_gangues_30_personagens_v1.json'

export const GANGUES_CHARACTER_CATALOG = Object.freeze(catalog.characters)
export const GANGUES_CHARACTER_BY_ID = new Map(GANGUES_CHARACTER_CATALOG.map(character => [character.id, character]))
export const GANGUES_INITIAL_CHARACTER_IDS = Object.freeze([...catalog.unlock_plan.wave_1_initial])
export const GANGUES_FIRST_CAMPAIGN_CHARACTER_IDS = Object.freeze([...catalog.unlock_plan.wave_1_initial, ...catalog.unlock_plan.wave_2_first_clear])
export const GANGUES_SECOND_CLEAR_CHARACTER_IDS = Object.freeze([...catalog.unlock_plan.wave_3_second_clear])
export const GANGUES_EVENT_CHARACTER_IDS = Object.freeze([...catalog.unlock_plan.event_only])
export const GANGUES_LEVEL_CAP = catalog.meta.level_cap
export const GANGUES_AP_PER_XP = catalog.meta.ap_per_xp

export function getGanguesCharacter(characterTemplateId) {
  return GANGUES_CHARACTER_BY_ID.get(Number(characterTemplateId)) || null
}

export function getGanguesLevelFromXp(xpTotal = 0) {
  const xp = Math.max(0, Number(xpTotal) || 0)
  let level = 1
  for (const [candidate, required] of Object.entries(catalog.meta.xp_total_required_by_level)) {
    if (xp >= required) level = Number(candidate)
  }
  return Math.min(GANGUES_LEVEL_CAP, level)
}

export function getGanguesTemplateLevel(characterTemplateId, xpTotal = 0) {
  const character = getGanguesCharacter(characterTemplateId)
  if (!character) return null
  const level = getGanguesLevelFromXp(xpTotal)
  return character.levels.find(item => item.level === level) || character.levels[0]
}

export function getGanguesUnlockedSpecials(characterTemplateId, xpTotal = 0) {
  const character = getGanguesCharacter(characterTemplateId)
  if (!character) return []
  const level = getGanguesLevelFromXp(xpTotal)
  return character.signature_specials.slice(0, Math.floor(Math.max(0, level - 1) / 2))
}

export function hydrateGanguesTemplateSheet(sheet = {}) {
  const character = getGanguesCharacter(sheet.character_template_id)
  if (!character) return sheet
  const xpTotal = Math.max(0, Number(sheet.xp_total) || 0)
  const level = getGanguesLevelFromXp(xpTotal)
  const levelData = getGanguesTemplateLevel(character.id, xpTotal)
  const unlocked = getGanguesUnlockedSpecials(character.id, xpTotal)
  const progression = {
    ap: Math.max(0, Number(sheet.attributes?.progression?.ap) || 0),
    xp_unspent: 0,
    special_path: character.special_path,
    special_path_unlocked: true,
    special_levels: Object.fromEntries(unlocked.map(special => [special.id, 1])),
    selected_specials: unlocked.filter(special => special.kind === 'active').slice(-2).map(special => special.id),
  }
  return {
    ...sheet,
    sheet_name: character.name,
    character_type: 'template',
    character_template_id: character.id,
    combat_path: character.combat_path,
    level,
    attributes: { ...levelData.stats, progression, character_type: 'template', character_template_id: character.id },
    elemental: 'neutro',
    loadout_version: 3,
  }
}

export function createGanguesTemplateSheet(characterTemplateId) {
  const character = getGanguesCharacter(characterTemplateId)
  if (!character) return null
  return hydrateGanguesTemplateSheet({
    id: null,
    character_type: 'template',
    character_template_id: character.id,
    xp_total: 0,
    attributes: { progression: { ap: 0 } },
    enemies_unlocked: ['treinamento'],
  })
}

export function getGanguesAvailableCharacterIds({ campaignClears = 0, storyProgress = {}, rep = 0, eventCharacterIds = [] } = {}) {
  const available = new Set(GANGUES_INITIAL_CHARACTER_IDS)
  const dominated = Object.values(storyProgress || {}).filter(value => value?.chefe).length
  const firstCampaignPool = catalog.unlock_plan.wave_2_first_clear
  firstCampaignPool.slice(0, Math.min(firstCampaignPool.length, dominated + (rep >= 50 ? 1 : 0))).forEach(id => available.add(id))
  if (campaignClears >= 1) GANGUES_FIRST_CAMPAIGN_CHARACTER_IDS.forEach(id => available.add(id))
  if (campaignClears >= 2) GANGUES_SECOND_CLEAR_CHARACTER_IDS.forEach(id => available.add(id))
  eventCharacterIds.filter(id => GANGUES_EVENT_CHARACTER_IDS.includes(Number(id))).forEach(id => available.add(Number(id)))
  return [...available]
}

export function getGanguesNextLevel(characterTemplateId, xpTotal = 0) {
  const character = getGanguesCharacter(characterTemplateId)
  const level = getGanguesLevelFromXp(xpTotal)
  return character?.levels.find(item => item.level === level + 1) || null
}
