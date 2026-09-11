// Slice: ficha/roster CRUD — newSheet/loadSheet/recrutar/deletar, e o time de
// batalha (roster/activeParty). Extraído de store/useGanguesStore.js
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
import { supabase } from '../../../../../lib/supabase'
import { defaultGanguesProgression, normalizeGanguesLoadout, getGanguesRosterLimit } from '../../data/ganguesLoadout.js'
import { createGanguesTemplateSheet, hydrateGanguesTemplateSheet } from '../../data/ganguesCharacters.js'

/** Retorna o limite máximo de fichas de personagem por tier. */
export function limiteFichasPorTier(tier) {
  return getGanguesRosterLimit(tier)
}

/** Verifica se o usuário pode criar uma nova ficha dado o total atual. */
export function podeCriarFicha(perfil, totalFichas) {
  const limite = limiteFichasPorTier(perfil?.tier)
  return totalFichas < limite
}

export const defaultSheet = () => ({
  id: null,
  sheet_name: '',
  attributes: { A: 0, H: 0, R: 0, D: 0, progression: defaultGanguesProgression() },
  elemental: 'neutro',
  combat_path: null,
  loadout_version: 2,
  xp_total: 0,
  character_type: 'legacy',
  character_template_id: null,
})

export default function createGanguesSheetSlice(set, get) {
  return {
    sheet: defaultSheet(),
    roster: [],
    activeParty: [],
    _userId: null,

    // Qual ficha está aberta na tela dedicada de progressão (fase 'progression').
    progressionTargetId: null,
    setProgressionTarget: (id) => set({ progressionTargetId: id }),

    // Quando a vitória empurra o jogador pra Progressão pra gastar AP parado,
    // guarda aqui o que ele faria em seguida (continuar território, voltar pro
    // mapa etc.) — o botão "voltar" da Progressão executa isso em vez de ir
    // sempre pro lobby, retomando o fluxo pós-vitória de onde ele parou.
    posVitoriaAcao: null,
    setPosVitoriaAcao: (fn) => set({ posVitoriaAcao: fn }),

    newSheet: () => set({ sheet: defaultSheet() }),

    loadSheet: (data) => {
      const templateId = data?.character_template_id || data?.attributes?.character_template_id
      const source = templateId ? { ...data, character_type: 'template', character_template_id: Number(templateId) } : data
      const normalized = source?.character_type === 'template' ? hydrateGanguesTemplateSheet(source) : { ...source, ...normalizeGanguesLoadout(source) }
      set({ sheet: { ...defaultSheet(), ...normalized }, match: { enemy_id: null, score: 0, status: 'idle' } })
    },

    setUserId: (id) => set({ _userId: id }),

    setRoster: (roster) => set(state => {
      const ids = new Set(roster.map(item => item.id))
      return { roster, activeParty: state.activeParty.filter(item => ids.has(item.id)) }
    }),

    setActiveParty: (activeParty) => set({ activeParty }),
    addLocalSheet: (sheet) => {
      const saved = { ...sheet, id: sheet.id || `local-${sheet.character_template_id || 'legacy'}-${Date.now()}` }
      set(state => ({ sheet: saved, roster: [...state.roster, saved] }))
      return saved
    },

    recruitTemplate: async (characterTemplateId, userId, xpTotal = 0) => {
      const templateSheet = createGanguesTemplateSheet(characterTemplateId, xpTotal)
      if (!templateSheet || get().roster.some(item => item.character_template_id === templateSheet.character_template_id)) return null
      set({ sheet: templateSheet })
      return (userId || get()._userId) ? get().saveToCloud(userId) : get().addLocalSheet(templateSheet)
    },

    deleteSheet: async (sheetId) => {
      if (!sheetId) return false
      if (get()._userId && !String(sheetId).startsWith('local-')) {
        const { error } = await supabase.from('gangues_fichas').delete().eq('id', sheetId)
        if (error) { console.error('[GANGUES] Falha ao excluir ficha:', error.message); return false }
      }
      set(state => ({
        roster: state.roster.filter(item => item.id !== sheetId),
        activeParty: state.activeParty.filter(item => item.id !== sheetId),
        sheet: state.sheet.id === sheetId ? defaultSheet() : state.sheet,
      }))
      return true
    },
  }
}
