import { create } from 'zustand'
import { supabase } from '../../../../lib/supabase'
import { getArenaProgression } from '../utils/arenaProgression'
import { getArenaResources, getArenaRosterLimit, normalizeArenaLoadout } from '../data/arenaLoadout.js'

const LEGACY_PATH_STORAGE = { atacante: 'brutamontes', defensor: 'duelista', mistico: 'canalizador' }
const LEGACY_STYLE_PATH = { brutamontes: 'atacante', duelista: 'defensor', canalizador: 'mistico' }

/**
 * Retorna o limite máximo de fichas de personagem por tier.
 */
export function limiteFichasPorTier(tier) {
  return getArenaRosterLimit(tier)
}

/**
 * Verifica se o usuário pode criar uma nova ficha dado o total atual.
 */
export function podeCriarFicha(perfil, totalFichas) {
  const limite = limiteFichasPorTier(perfil?.tier)
  return totalFichas < limite
}

const defaultSheet = () => ({
  id: null,
  sheet_name: '',
  attributes: { A: 0, H: 0, R: 0, D: 0 },
  elemental: 'neutro',
  combat_path: null,
  loadout_version: 2,
  xp_total: 0,
  attribute_points_gained: 0,
  enemies_unlocked: ['treinamento'],
})

export const useArenaStore = create((set, get) => ({
  sheet: defaultSheet(),
  roster: [],
  activeParty: [],
  match: { playerTeam: [], enemyTeam: [], enemy: null, enemy_id: null, score: 0, status: 'idle' },
  points_available: 0,
  temp_attributes: { A: 0, H: 0, R: 0, D: 0 },
  level_up_active: false,
  _userId: null,

  newSheet: () => set({ sheet: defaultSheet(), points_available: 0, temp_attributes: { A: 0, H: 0, R: 0, D: 0 }, level_up_active: false }),

  updateSheet: (partial) => set(state => ({ sheet: { ...state.sheet, ...partial } })),

  loadSheet: (data) => {
    const normalized = normalizeArenaLoadout(data)
    const resources = getArenaResources(normalized.combat_path, normalized.attributes.R)
    set({ sheet: { ...defaultSheet(), ...data, ...normalized }, match: { enemy_id: null, pv_current: resources.pvMax, pm_current: resources.pmMax, score: 0, status: 'idle' } })
  },

  setUserId: (id) => set({ _userId: id }),

  setRoster: (roster) => set(state => {
    const ids = new Set(roster.map(item => item.id))
    return { roster, activeParty: state.activeParty.filter(item => ids.has(item.id)).slice(0, 2) }
  }),

  setActiveParty: (activeParty) => set({ activeParty: activeParty.slice(0, 2) }),
  addLocalSheet: (sheet) => {
    const saved = { ...sheet, id: sheet.id || `local-${Date.now()}` }
    set(state => ({ sheet: saved, roster: [...state.roster, saved] }))
    return saved
  },

  startMatch: (enemy, enemyPool = []) => {
    const playerTeam = get().activeParty
    const allEnemies = enemyPool.length ? enemyPool : get()._enemyCatalog || []
    const ally = allEnemies.find(item => item.id !== enemy.id) || enemy
    set({ match: { playerTeam, enemyTeam: [enemy, ally], enemy, enemy_id: enemy.id, score: 0, status: 'fighting' } })
  },

  setEnemyCatalog: (_enemyCatalog) => set({ _enemyCatalog }),

  setMatchPV: (pv) => set(state => ({ match: { ...state.match, pv_current: Math.max(0, pv) } })),
  setMatchPM: (pm) => set(state => ({ match: { ...state.match, pm_current: Math.max(0, pm) } })),

  endMatch: (result) => set(state => {
    const newScore = result === 'victory' ? state.match.score + 1 : state.match.score
    return { match: { ...state.match, score: newScore, status: result === 'victory' ? 'victory' : 'defeat' } }
  }),

  gainXp: (amount) => set(state => {
    const newXp = (state.sheet.xp_total || 0) + amount
    const progression = getArenaProgression(newXp)
    return {
      sheet: {
        ...state.sheet,
        xp_total: newXp,
        attribute_points_gained: progression.completedLevels,
      },
      level_up_active: false,
    }
  }),

  incrementTempAttr: (attr) => set(state => {
    if (state.temp_attributes[attr] >= 5) return state
    return { temp_attributes: { ...state.temp_attributes, [attr]: state.temp_attributes[attr] + 1 }, points_available: Math.max(0, state.points_available - 1) }
  }),

  decrementTempAttr: (attr) => set(state => {
    if (state.temp_attributes[attr] <= (state.sheet.attributes[attr] || 0)) return state
    return { temp_attributes: { ...state.temp_attributes, [attr]: state.temp_attributes[attr] - 1 }, points_available: state.points_available + 1 }
  }),

  confirmLevelUp: () => set(state => ({
    sheet: { ...state.sheet, attributes: { ...state.temp_attributes }, level_up_active: false },
    level_up_active: false,
  })),

  clearLevelUp: () => set({ level_up_active: false }),

  spendPoints: (pts) => set(state => ({ points_available: Math.max(0, state.points_available - pts) })),
  gainPoints: (pts) => set(state => ({ points_available: state.points_available + pts })),

  saveToCloud: async (userId) => {
    const uid = userId || get()._userId
    if (!uid) return null
    const s = get().sheet
    const payload = { user_id: uid, sheet_name: s.sheet_name, attributes: s.attributes, elemental: s.elemental, combat_path: s.combat_path, loadout_version: s.loadout_version, xp_total: s.xp_total, enemies_unlocked: s.enemies_unlocked }
    const request = s.id
      ? supabase.from('character_sheets').update(payload).eq('id', s.id).select('id').maybeSingle()
      : supabase.from('character_sheets').insert(payload).select('id').maybeSingle()
    let { data, error } = await request

    // Compatibilidade curta até a migration 025 ser aplicada no Supabase oficial.
    if (error && /combat_path/i.test(error.message || '')) {
      const legacyPayload = { ...payload, combat_style: LEGACY_PATH_STORAGE[s.combat_path] }
      delete legacyPayload.combat_path
      const fallback = s.id
        ? await supabase.from('character_sheets').update(legacyPayload).eq('id', s.id).select('id').maybeSingle()
        : await supabase.from('character_sheets').insert(legacyPayload).select('id').maybeSingle()
      data = fallback.data
      error = fallback.error
    }
    if (error) { console.error('[ARENA] Falha ao salvar ficha:', error.message); return null }
    if (!s.id && data) {
      if (data) set(state => ({ sheet: { ...state.sheet, id: data.id } }))
    }
    const saved = { ...get().sheet, id: s.id || data?.id }
    set(state => ({ roster: [...state.roster.filter(item => item.id !== saved.id), saved] }))
    return saved
  },

  loadSheets: async (userId) => {
    if (!userId) return []
    let { data, error } = await supabase.from('character_sheets').select('id, sheet_name, attributes, elemental, combat_path, loadout_version, xp_total, enemies_unlocked').eq('user_id', userId).order('created_at', { ascending: false })
    if (error && /combat_path/i.test(error.message || '')) {
      const legacy = await supabase.from('character_sheets').select('id, sheet_name, attributes, elemental, combat_style, loadout_version, xp_total, enemies_unlocked').eq('user_id', userId).order('created_at', { ascending: false })
      data = (legacy.data || []).map(item => ({ ...item, combat_path: LEGACY_STYLE_PATH[item.combat_style] || null }))
      error = legacy.error
    }
    if (error) console.error('[ARENA] Falha ao carregar fichas:', error.message)
    const roster = Array.isArray(data) ? data.map(item => ({ ...item, ...normalizeArenaLoadout(item) })) : []
    set({ roster })
    return roster
  },

  deleteSheet: async (sheetId) => {
    await supabase.from('character_sheets').delete().eq('id', sheetId)
  },

  unlockNextEnemy: (defeatedEnemyId) => set(state => {
    const ENEMY_ORDER = ['treinamento', 'kaeda', 'thunderbolt', 'stormbyte', 'viran', 'campeao', 'kronos', 'primordial_jack']
    const current = state.sheet.enemies_unlocked || ['treinamento']
    const idx = ENEMY_ORDER.indexOf(defeatedEnemyId)
    if (idx === -1 || idx >= ENEMY_ORDER.length - 1) return state
    const nextId = ENEMY_ORDER[idx + 1]
    if (current.includes(nextId)) return state
    return { sheet: { ...state.sheet, enemies_unlocked: [...current, nextId] } }
  }),

  reset: () => set({ sheet: defaultSheet(), roster: [], activeParty: [], match: { playerTeam: [], enemyTeam: [], enemy: null, enemy_id: null, score: 0, status: 'idle' } }),
}))
