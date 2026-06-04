import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'

const defaultSheet = () => ({
  id: null,
  sheet_name: '',
  attributes: { F: 0, H: 0, R: 0, A: 0, PdF: 0 },
  advantages: [],
  disadvantages: [],
  perks: [],
  specializations: [],
  weapon: '',
  elemental: '',
  xp_total: 0,
  attribute_points_gained: 0,
})

export const useArenaStore = create((set, get) => ({
  sheet: defaultSheet(),
  match: { enemy: null, enemy_id: null, pv_current: 0, pm_current: 0, score: 0, status: 'idle' },
  points_available: 5,
  temp_attributes: { F: 0, H: 0, R: 0, A: 0, PdF: 0 },
  level_up_active: false,
  _userId: null,

  newSheet: () => set({ sheet: defaultSheet(), match: { enemy: null, enemy_id: null, pv_current: 0, pm_current: 0, score: 0, status: 'idle' }, points_available: 5, temp_attributes: { F: 0, H: 0, R: 0, A: 0, PdF: 0 }, level_up_active: false }),

  updateSheet: (partial) => set(state => ({ sheet: { ...state.sheet, ...partial } })),

  loadSheet: (data) => {
    const pv = Math.max(1, (data.attributes?.R || 0) * 5)
    const pm = Math.max(2, (data.attributes?.PdF || 0) * 5)
    set({ sheet: { ...defaultSheet(), ...data }, match: { enemy_id: null, pv_current: pv, pm_current: pm, score: 0, status: 'idle' } })
  },

  setUserId: (id) => set({ _userId: id }),

  startMatch: (enemy) => {
    const s = get().sheet
    const pv = Math.max(1, (s.attributes?.R || 0) * 5)
    const pm = Math.max(2, (s.attributes?.PdF || 0) * 5)
    set({ match: { enemy: { ...enemy, pv_current: enemy.pv_max }, enemy_id: enemy.id, pv_current: pv, pm_current: pm, score: 0, status: 'fighting' } })
  },

  setMatchPV: (pv) => set(state => ({ match: { ...state.match, pv_current: Math.max(0, pv) } })),
  setMatchPM: (pm) => set(state => ({ match: { ...state.match, pm_current: Math.max(0, pm) } })),

  endMatch: (result) => set(state => {
    const newScore = result === 'victory' ? state.match.score + 1 : state.match.score
    return { match: { ...state.match, score: newScore, status: result === 'victory' ? 'victory' : 'defeat' } }
  }),

  gainXp: (amount) => set(state => {
    const newXp = (state.sheet.xp_total || 0) + amount
    const pointsGained = state.sheet.attribute_points_gained || 0
    const cost = 10 + pointsGained * 2
    if (newXp >= cost) {
      return { sheet: { ...state.sheet, xp_total: newXp, attribute_points_gained: pointsGained + 1 }, level_up_active: true, temp_attributes: { ...state.sheet.attributes } }
    }
    return { sheet: { ...state.sheet, xp_total: newXp } }
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
    if (!uid) return
    const s = get().sheet
    const payload = { user_id: uid, sheet_name: s.sheet_name, attributes: s.attributes, advantages: s.advantages, disadvantages: s.disadvantages, perks: s.perks, specializations: s.specializations, weapon: s.weapon, elemental: s.elemental, xp_total: s.xp_total }
    if (s.id) await supabase.from('character_sheets').update(payload).eq('id', s.id)
    else {
      const { data } = await supabase.from('character_sheets').insert(payload).select('id').single()
      if (data) set(state => ({ sheet: { ...state.sheet, id: data.id } }))
    }
  },

  loadSheets: async (userId) => {
    if (!userId) return []
    const { data } = await supabase.from('character_sheets').select('id, sheet_name, attributes, weapon, elemental, xp_total, advantages, disadvantages, perks, specializations').eq('user_id', userId).order('created_at', { ascending: false })
    return Array.isArray(data) ? data : []
  },

  deleteSheet: async (sheetId) => {
    await supabase.from('character_sheets').delete().eq('id', sheetId)
  },

  reset: () => set({ sheet: defaultSheet(), match: { enemy: null, enemy_id: null, pv_current: 0, pm_current: 0, score: 0, status: 'idle' } }),
}))
