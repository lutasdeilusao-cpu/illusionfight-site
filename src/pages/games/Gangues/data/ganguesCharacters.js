import catalog from '../../../../../ldi_gangues_30_personagens_v1.json'
import { normalizeGanguesEquipment } from './ganguesEquip.js'

export const GANGUES_CHARACTER_CATALOG = Object.freeze(catalog.characters)
export const GANGUES_CHARACTER_BY_ID = new Map(GANGUES_CHARACTER_CATALOG.map(character => [character.id, character]))
export const GANGUES_INITIAL_CHARACTER_IDS = Object.freeze([...catalog.unlock_plan.wave_1_initial])
export const GANGUES_FIRST_CAMPAIGN_CHARACTER_IDS = Object.freeze([...catalog.unlock_plan.wave_1_initial, ...catalog.unlock_plan.wave_2_first_clear])
export const GANGUES_SECOND_CLEAR_CHARACTER_IDS = Object.freeze([...catalog.unlock_plan.wave_3_second_clear])
export const GANGUES_EVENT_CHARACTER_IDS = Object.freeze([...catalog.unlock_plan.event_only])
// `catalog.meta.level_cap` (10) é "até onde o catálogo foi DESENHADO" — os 10
// níveis autorais carregam títulos + unlock de special. O teto REAL do jogo é
// 99: acima de 10 os níveis são procedurais (nivelSintetico), só stat, estilo
// Ragnarok. Nível 99 numa ficha da gangue é o que libera o multiplayer online
// (ver ganguesTemMultiplayer em ganguesLoadout.js / GanguesModes).
export const GANGUES_LEVEL_CAP = 99
export const GANGUES_AP_PER_XP = catalog.meta.ap_per_xp

// Taxas PV/PM por ponto de R, por caminho — MESMOS números de
// GANGUES_RESOURCE_RATES (ganguesLoadout.js). Duplicados de propósito: aquele
// módulo já importa `getGanguesLevelFromXp` daqui, então importar de volta
// fecharia um ciclo. São 3 pares, o custo de duplicar é zero.
const RES_RATE = { atacante: { pv: 3, pm: 3 }, defensor: { pv: 4, pm: 2 }, mistico: { pv: 2, pm: 4 } }

/** Nível sintético (11–99): continua o padrão dos níveis 2/4/6/8/10 do catálogo
 *  — +1 num atributo a cada nível PAR, ciclando `growth_order`. PV/PM derivam de
 *  R pela taxa do caminho, igual à ficha do jogador. */
function nivelSintetico(character, level) {
  const base = character.levels[character.levels.length - 1] // L10 autoral
  const stats = { ...base.stats }
  const order = character.growth_order?.length ? character.growth_order : ['A', 'R', 'A', 'D', 'A']
  for (let lvl = base.level + 1; lvl <= level; lvl++) {
    if (lvl % 2 === 0) {
      const attr = order[(lvl / 2 - 1) % order.length]
      stats[attr] = (stats[attr] || 0) + 1
    }
  }
  const rate = RES_RATE[character.combat_path] || { pv: 0, pm: 0 }
  return {
    level,
    xp_total_required: base.xp_total_required + (level - base.level),
    stats,
    resources: { pv_max: stats.R * rate.pv, pm_max: stats.R * rate.pm },
    events: [],
  }
}

export function getGanguesCharacter(characterTemplateId) {
  return GANGUES_CHARACTER_BY_ID.get(Number(characterTemplateId)) || null
}

// 1 ponto de XP = 1 nível, sempre — é essa a regra (custo de AP por XP já
// cresce a cada nível: 10/15/20/25/30..., ver ganguesApCostForLevel em
// ganguesLoadout.js). A tabela `xp_total_required_by_level` do catálogo
// (0,1,3,5,8,11...) era CUMULATIVA e crescente — exigia várias conversões
// de AP→XP pra subir 1 único nível a partir do nível 2 em diante, mesmo já
// tendo enchido a barra de PA inteira. Resultado: o jogador enchia a barra,
// via ela zerar, e não subia de nível — "só passa o primeiro nível" era
// literal, porque só o nível 1→2 dessa tabela precisava de exatamente 1 XP.
export function getGanguesLevelFromXp(xpTotal = 0) {
  const xp = Math.max(0, Number(xpTotal) || 0)
  return Math.min(GANGUES_LEVEL_CAP, 1 + Math.floor(xp))
}

export function getGanguesTemplateLevel(characterTemplateId, xpTotal = 0) {
  const character = getGanguesCharacter(characterTemplateId)
  if (!character) return null
  const level = getGanguesLevelFromXp(xpTotal)
  return character.levels.find(item => item.level === level)
    || (level > character.levels.length ? nivelSintetico(character, level) : character.levels[0])
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
    // pv_atual/pm_atual: ver comentário em normalizeGanguesLoadout (ganguesLoadout.js) —
    // precisa ser copiado manualmente porque esta função também reconstrói
    // `attributes` do zero a cada hidratação.
    // equipment: ver comentário em normalizeGanguesLoadout — copiado manualmente
    // porque esta função também reconstrói `attributes` do zero a cada hidratação.
    attributes: { ...levelData.stats, progression, character_type: 'template', character_template_id: character.id, pv_atual: sheet.attributes?.pv_atual, pm_atual: sheet.attributes?.pm_atual, equipment: normalizeGanguesEquipment(sheet.attributes?.equipment) },
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
  if (!character) return null
  const level = getGanguesLevelFromXp(xpTotal)
  if (level >= GANGUES_LEVEL_CAP) return null
  return character.levels.find(item => item.level === level + 1)
    || (level + 1 > character.levels.length ? nivelSintetico(character, level + 1) : null)
}
