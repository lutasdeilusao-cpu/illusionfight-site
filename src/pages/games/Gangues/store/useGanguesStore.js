import { create } from 'zustand'
import { supabase } from '../../../../lib/supabase'
import { addGanguesAp, defaultGanguesProgression, getGanguesRosterLimit, normalizeGanguesLoadout } from '../data/ganguesLoadout.js'
import { carregarProgressoHistoria, salvarProgressoHistoria } from './ganguesStoryProgress.js'

// Debounce dos writes de progresso do modo história: várias ações batem em sequência
// (marcar POI + fôlego + grana + rep) e não faz sentido um upsert por campo.
let storySaveTimer = null

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

  // Quando a vitória empurra o jogador pra Progressão pra gastar AP parado,
  // guarda aqui o que ele faria em seguida (continuar território, voltar pro
  // mapa etc.) — o botão "voltar" da Progressão executa isso em vez de ir
  // sempre pro lobby, retomando o fluxo pós-vitória de onde ele parou.
  posVitoriaAcao: null,
  setPosVitoriaAcao: (fn) => set({ posVitoriaAcao: fn }),

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

  // playerTeamOverride: usado pelo modo história pra levar só um recorte do
  // elenco pra batalha (teto de 3), sem mexer no activeParty "de verdade"
  // que o resto da UI (lobby, Arena) enxerga.
  startMatch: (enemy, enemyTeam = [enemy], playerTeamOverride = null) => {
    const playerTeam = playerTeamOverride || get().activeParty
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
  // Retorna earnedXp pra quem chamou saber se rendeu ponto novo pra gastar (aviso de level up).
  gainAp: (amount) => {
    const { progression, earnedXp } = addGanguesAp(get().sheet, amount)
    set(state => {
      const attributes = { ...state.sheet.attributes, progression }
      const xp_total = (state.sheet.xp_total || 0) + earnedXp
      const sheetId = state.sheet.id
      return {
        sheet: { ...state.sheet, attributes, xp_total },
        roster: state.roster.map(member => member.id === sheetId ? { ...member, attributes, xp_total } : member),
        activeParty: state.activeParty.map(member => member.id === sheetId ? { ...member, attributes, xp_total } : member),
      }
    })
    return earnedXp
  },

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

  // ── Nome da gangue ──
  // É o que reverbera na história (falas dos inimigos, % de domínio, fim).
  gangName: '',
  setGangName: (nome) => {
    const limpo = String(nome || '').replace(/\s+/g, ' ').trim().slice(0, 28)
    set({ gangName: limpo })
    get()._persistStory()
  },

  // ── Modo história ──
  // Progresso salvo em Supabase (tabela `gangues_story_progress`, uma linha por
  // usuário) quando logado; guest joga só em memória e perde tudo ao sair —
  // igual à ficha de personagem (ver `addLocalSheet`).
  // storyProgress: { [territorioId]: { pontos: [noId...], chefe: bool } }
  storyProgress: {},
  // Nó em que o jogador entrou: { territorioId, noId, enemyId, isChefe }
  storyTarget: null,
  setStoryTarget: (target) => set({ storyTarget: target }),

  loadStoryProgress: async (userId) => {
    if (!userId) return
    const progresso = await carregarProgressoHistoria(userId)
    if (progresso) set(progresso)
  },

  marcarNoDominado: (territorioId, noId, isChefe) => {
    set(state => {
      const atual = state.storyProgress[territorioId] || { pontos: [], chefe: false }
      const prox = isChefe
        ? { ...atual, chefe: true }
        : { ...atual, pontos: atual.pontos.includes(noId) ? atual.pontos : [...atual.pontos, noId] }
      return { storyProgress: { ...state.storyProgress, [territorioId]: prox } }
    })
    get()._persistStory()
  },

  resetStory: () => {
    set({ storyProgress: {}, storyTarget: null, grana: 0, rep: 0, cenaProgresso: {} })
    get()._persistStory()
  },

  // ── Modo história: a CENA (bairro navegável) ──
  // Economia leve + progresso por cena.
  // cenaProgresso: { [cenaId]: { resolvidos: {poiId:true}, revelados: {poiId:true}, boss: bool, folego: 0..100 } }
  grana: 0,
  rep: 0,
  cenaProgresso: {},

  // Escreve no Supabase com debounce — várias ações do modo história disparam
  // essa persistência em sequência (marcar POI + fôlego + grana + rep) e não
  // faz sentido um upsert por campo. Guest (sem `_userId`) não salva nada,
  // igual à ficha: o banner já avisa que o progresso não fica.
  _persistStory: () => {
    const uid = get()._userId
    if (!uid) return
    clearTimeout(storySaveTimer)
    storySaveTimer = setTimeout(() => {
      const { gangName, storyProgress, cenaProgresso, grana, rep } = get()
      salvarProgressoHistoria(uid, { gangName, storyProgress, cenaProgresso, grana, rep })
    }, 800)
  },

  _persistCena: () => get()._persistStory(),

  _cena: (cenaId) => get().cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 },

  ganharGrana: (n) => { set(state => ({ grana: Math.max(0, state.grana + (n || 0)) })); get()._persistCena() },
  ganharRep: (n) => { set(state => ({ rep: Math.max(0, state.rep + (n || 0)) })); get()._persistCena() },
  gastarGrana: (n) => {
    if (get().grana < n) return false
    set(state => ({ grana: state.grana - n }))
    get()._persistCena()
    return true
  },

  revelarPoi: (cenaId, ...poiIds) => {
    set(state => {
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 }
      const revelados = { ...atual.revelados }
      poiIds.flat().forEach(id => { if (id) revelados[id] = true })
      return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, revelados } } }
    })
    get()._persistCena()
  },

  marcarPoiResolvido: (cenaId, poiId, revela = []) => {
    set(state => {
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 }
      const revelados = { ...atual.revelados }
      ;[].concat(revela).forEach(id => { if (id) revelados[id] = true })
      return {
        cenaProgresso: {
          ...state.cenaProgresso,
          [cenaId]: { ...atual, resolvidos: { ...atual.resolvidos, [poiId]: true }, revelados },
        },
      }
    })
    get()._persistCena()
  },

  marcarBossCena: (cenaId) => {
    set(state => {
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 }
      return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, boss: true } } }
    })
    get()._persistCena()
  },

  // Fôlego da gangue: cai nas tretas/paradas falhadas, cura na birosca,
  // volta ao cheio ao dominar / sair do bairro.
  ajustarFolego: (cenaId, delta) => {
    set(state => {
      const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false, folego: 100 }
      const folego = Math.max(0, Math.min(100, (atual.folego ?? 100) + delta))
      return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, folego } } }
    })
    get()._persistCena()
  },

  restaurarFolego: (cenaId) => get().ajustarFolego(cenaId, 100),

  // Dominar o território a partir da cena: marca todos os pontos + o chefe,
  // pra estadoTerritorio() reconhecer 'dominado' e a próxima região abrir.
  dominarTerritorioViaCena: (territorioId, pontoIds = []) => {
    set(state => {
      const atual = state.storyProgress[territorioId] || { pontos: [], chefe: false }
      const pontos = Array.from(new Set([...(atual.pontos || []), ...pontoIds]))
      return { storyProgress: { ...state.storyProgress, [territorioId]: { pontos, chefe: true } } }
    })
    get()._persistStory()
  },

  reset: () => set({ sheet: defaultSheet(), roster: [], activeParty: [], match: { playerTeam: [], enemyTeam: [], enemy: null, enemy_id: null, score: 0, status: 'idle', battleReport: null } }),

  resetCena: () => {
    set({ grana: 0, rep: 0, cenaProgresso: {} })
    get()._persistStory()
  },
}))
