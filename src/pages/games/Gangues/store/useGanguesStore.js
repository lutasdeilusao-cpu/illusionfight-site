import { create } from 'zustand'
import { supabase } from '../../../../lib/supabase'
import { addGanguesAp, defaultGanguesProgression, getGanguesRosterLimit, normalizeGanguesLoadout } from '../data/ganguesLoadout.js'

const LEGACY_PATH_STORAGE = { atacante: 'brutamontes', defensor: 'duelista', mistico: 'canalizador' }
const LEGACY_STYLE_PATH = { brutamontes: 'atacante', duelista: 'defensor', canalizador: 'mistico' }

/**
 * Retorna o limite máximo de fichas de personagem por tier.
 */
export function limiteFichasPorTier(tier) {
  return getGanguesRosterLimit(tier)
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
  attributes: { A: 0, H: 0, R: 0, D: 0, progression: defaultGanguesProgression() },
  elemental: 'neutro',
  combat_path: null,
  loadout_version: 2,
  xp_total: 0,
  enemies_unlocked: ['treinamento'],
})

export const useGanguesStore = create((set, get) => ({
  sheet: defaultSheet(),
  roster: [],
  activeParty: [],
  match: { playerTeam: [], enemyTeam: [], enemy: null, enemy_id: null, score: 0, status: 'idle', battleReport: null },
  _userId: null,
  // Qual ficha está aberta na tela dedicada de progressão (fase 'progression').
  progressionTargetId: null,
  setProgressionTarget: (id) => set({ progressionTargetId: id }),

  newSheet: () => set({ sheet: defaultSheet() }),

  updateSheet: (partial) => set(state => ({ sheet: { ...state.sheet, ...partial } })),

  loadSheet: (data) => {
    const normalized = normalizeGanguesLoadout(data)
    set({ sheet: { ...defaultSheet(), ...data, ...normalized }, match: { enemy_id: null, score: 0, status: 'idle' } })
  },

  setUserId: (id) => set({ _userId: id }),

  setRoster: (roster) => set(state => {
    const ids = new Set(roster.map(item => item.id))
    return { roster, activeParty: state.activeParty.filter(item => ids.has(item.id)) }
  }),

  setActiveParty: (activeParty) => set({ activeParty }),
  addLocalSheet: (sheet) => {
    const saved = { ...sheet, id: sheet.id || `local-${Date.now()}` }
    set(state => ({ sheet: saved, roster: [...state.roster, saved] }))
    return saved
  },

  startMatch: (enemy, enemyTeam = [enemy]) => {
    const playerTeam = get().activeParty
    set({ match: { playerTeam, enemyTeam, enemy, enemy_id: enemy.id, score: 0, status: 'fighting', battleReport: null } })
  },

  setBattleReport: (battleReport) => set(state => ({ match: { ...state.match, battleReport } })),

  setEnemyCatalog: (_enemyCatalog) => set({ _enemyCatalog }),

  endMatch: (result) => set(state => {
    const newScore = result === 'victory' ? state.match.score + 1 : state.match.score
    return { match: { ...state.match, score: newScore, status: result === 'victory' ? 'victory' : 'defeat' } }
  }),

  // Atualiza sheet, roster e activeParty juntos — senão o XP ganho na vitória fica preso
  // na ficha solta e o painel de progressão do lobby (que lê de activeParty) nunca reflete o ganho.
  gainAp: (amount) => set(state => {
    const { progression, earnedXp } = addGanguesAp(state.sheet, amount)
    const attributes = { ...state.sheet.attributes, progression }
    const xp_total = (state.sheet.xp_total || 0) + earnedXp
    const sheetId = state.sheet.id
    return {
      sheet: { ...state.sheet, attributes, xp_total },
      roster: state.roster.map(member => member.id === sheetId ? { ...member, attributes, xp_total } : member),
      activeParty: state.activeParty.map(member => member.id === sheetId ? { ...member, attributes, xp_total } : member),
    }
  }),

  updateRosterSheet: (sheetId, partial) => set(state => {
    const roster = state.roster.map(member => member.id === sheetId ? { ...member, ...partial } : member)
    const sheet = state.sheet.id === sheetId ? { ...state.sheet, ...partial } : state.sheet
    return { roster, activeParty: state.activeParty.map(member => member.id === sheetId ? { ...member, ...partial } : member), sheet }
  }),

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
      const legacyPayload = {
        ...payload,
        combat_style: LEGACY_PATH_STORAGE[s.combat_path],
        weapon: 'none',
        advantages: [],
        disadvantages: [],
        perks: [],
        specializations: [],
      }
      delete legacyPayload.combat_path
      const fallback = s.id
        ? await supabase.from('character_sheets').update(legacyPayload).eq('id', s.id).select('id').maybeSingle()
        : await supabase.from('character_sheets').insert(legacyPayload).select('id').maybeSingle()
      data = fallback.data
      error = fallback.error
    }
    if (error) { console.error('[GANGUES] Falha ao salvar ficha:', error.message); return null }
    if (!s.id && data) {
      if (data) set(state => ({ sheet: { ...state.sheet, id: data.id } }))
    }
    const saved = { ...get().sheet, id: s.id || data?.id }
    set(state => ({ roster: [...state.roster.filter(item => item.id !== saved.id), saved], activeParty: state.activeParty.map(item => item.id === saved.id ? saved : item) }))
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
    if (error) console.error('[GANGUES] Falha ao carregar fichas:', error.message)
    const roster = Array.isArray(data) ? data.map(item => ({ ...item, ...normalizeGanguesLoadout(item) })) : []
    set({ roster })
    return roster
  },

  deleteSheet: async (sheetId) => {
    if (!sheetId) return false
    if (get()._userId && !String(sheetId).startsWith('local-')) {
      const { error } = await supabase.from('character_sheets').delete().eq('id', sheetId)
      if (error) { console.error('[GANGUES] Falha ao excluir ficha:', error.message); return false }
    }
    set(state => ({
      roster: state.roster.filter(item => item.id !== sheetId),
      activeParty: state.activeParty.filter(item => item.id !== sheetId),
      sheet: state.sheet.id === sheetId ? defaultSheet() : state.sheet,
    }))
    return true
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

  reset: () => set({ sheet: defaultSheet(), roster: [], activeParty: [], match: { playerTeam: [], enemyTeam: [], enemy: null, enemy_id: null, score: 0, status: 'idle', battleReport: null } }),
}))
