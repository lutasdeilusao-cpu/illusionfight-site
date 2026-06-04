const LDI_VERSION = '1.0.48'
console.log(`[LDI] versão carregada: ${LDI_VERSION}`)

import { create } from 'zustand'
import { loadScene, filterChoices, getSceneFromCache } from '../engine/scenes'
import { setFlag, hasFlag } from '../engine/flags'
import { useCombatStore } from './useCombatStore'
import { saveSheet, saveGameSave, loadFullSheet, loadActiveSave } from '../hooks/useLDIStorage'
import enemiesData from '../data/enemies/enemies.json'

const XP_THRESHOLDS = [100]

const defaultSheet = () => ({
  id: null,
  sheet_name: '',
  attributes: { F: 0, H: 0, R: 0, A: 0, PdF: 0 },
  advantages: [],
  disadvantages: [],
  perks: [],
  specializations: [],
  special_skills: [],
  weapon: '',
  elemental: '',
  xp_total: 0,
})

const defaultSave = () => ({
  id: null,
  sheet_id: null,
  arc: 1,
  current_scene_id: '1.1',
  day_in_game: 1,
  credits: 0,
  pv_current: 1,
  pm_current: 1,
  clues_collected: [],
  flags: {},
  inventory: [],
  status: 'active',
  level_up_available: false,
})

function applySheetEffect(sheet, effect) {
  if (!effect) return sheet
  const attr = { ...sheet.attributes }
  for (const [key, val] of Object.entries(effect)) {
    if (key in attr) attr[key] = (attr[key] || 0) + val
  }
  return { ...sheet, attributes: attr }
}

export const useGameStore = create((set, get) => ({
  save: defaultSave(),
  sheet: defaultSheet(),
  currentScene: null,
  choices: [],
  sceneNav: 0,

  newSheet: () => {
    set({ sheet: defaultSheet(), save: { ...defaultSave(), pv_current: 1, pm_current: 1 } })
  },

  updateSheet: (partial) => {
    set(state => ({ sheet: { ...state.sheet, ...partial } }))
  },

  updateSave: (partial) => {
    set(state => {
      const newSave = { ...state.save, ...partial }
      return { save: newSave }
    })
  },

  applySceneEffect: (effect) => {
    set(state => {
      const sheet = applySheetEffect(state.sheet, effect)
      return { sheet }
    })
  },

  setScene: async (sceneId) => {
    if (!sceneId) {
      console.error('[LDI] setScene chamado sem sceneId')
      return
    }

    console.log('[LDI] Navegando para cena:', sceneId)
    console.log('[LDI] setScene executando, sceneId:', sceneId, 'cena atual:', get().currentScene?.id)

    if (sceneId.startsWith('combat_')) {
      const currentSceneId = get().currentScene?.id || '1.3'
      set(state => ({ save: { ...state.save, post_combat_scene: currentSceneId } }))
      const enemyId = sceneId.replace('combat_', '')
      const enemy = enemiesData.find(e => e.id === enemyId)
      if (enemy) {
        const sheet = get().sheet
        useCombatStore.getState().startCombat(enemy, sheet)
      } else {
        console.error('[LDI] Inimigo não encontrado:', enemyId)
      }
      return
    }

    if (sceneId === 'end_act1') {
      set(state => {
        const updatedSave = { ...state.save, status: 'ended_victory' }
        return { save: updatedSave, currentScene: null, choices: [] }
      })
      return
    }

    const scene = await loadScene(sceneId)
    if (!scene) {
      console.error('[LDI] Falha ao carregar cena, mantendo cena atual')
      return
    }

    console.log('[LDI] Cena carregada:', scene.title)

    set(state => {
      const sheet = state.sheet
      const flags = state.save.flags
      const credits = state.save.credits
      const filtered = filterChoices(scene.choices || [], sheet, flags, credits)
      return { currentScene: scene, choices: filtered, sceneNav: state.sceneNav + 1 }
    })
  },

  makeChoice: async (choice) => {
    console.log('[LDI] makeChoice executando, choice.next_scene:', choice.next_scene, 'choice.id:', choice.id)
    const state = get()

    const newFlags = (choice.flags_set || []).reduce((acc, f) => {
      acc[f] = true
      return acc
    }, { ...state.save.flags })

    const updatedSave = {
      ...state.save,
      flags: newFlags,
    }

    if (choice.sheet_effect) {
      const updatedSheet = applySheetEffect(state.sheet, choice.sheet_effect)
      set({ sheet: updatedSheet })
    }

    set({ save: updatedSave })

    if (choice.next_scene) {
      await get().setScene(choice.next_scene)
    }
  },

  addClue: (clue) => {
    set(state => ({
      save: {
        ...state.save,
        clues_collected: [...(state.save.clues_collected || []), clue],
      },
    }))
  },

  setFlag: (key) => {
    set(state => ({
      save: {
        ...state.save,
        flags: setFlag(state.save.flags, key),
      },
    }))
  },

  hasFlag: (key) => {
    return hasFlag(get().save.flags, key)
  },

  spendCredits: (amount) => {
    set(state => ({
      save: { ...state.save, credits: Math.max(0, state.save.credits - amount) },
    }))
  },

  gainCredits: (amount) => {
    set(state => ({
      save: { ...state.save, credits: state.save.credits + amount },
    }))
  },

  gainXp: (amount) => {
    const state = get()
    const oldXp = state.sheet.xp_total || 0
    const newXp = oldXp + amount
    const crossed = XP_THRESHOLDS.some(t => oldXp < t && newXp >= t)
    set({
      sheet: { ...state.sheet, xp_total: newXp },
      save: crossed ? { ...state.save, level_up_available: true } : state.save,
    })
  },

  clearLevelUp: () => {
    set(state => ({ save: { ...state.save, level_up_available: false } }))
  },

  loadSave: (saveData, sheetData) => {
    set({
      save: { ...defaultSave(), ...saveData },
      sheet: { ...defaultSheet(), ...sheetData },
    })
  },

  resetGame: () => {
    set({
      save: defaultSave(),
      sheet: defaultSheet(),
      currentScene: null,
      choices: [],
    })
  },

  saveToCloud: async (userId) => {
    if (!userId) return
    const state = get()
    if (!state.sheet.id) {
      const sheetId = await saveSheet(userId, state.sheet)
      if (sheetId) {
        set(state => ({ sheet: { ...state.sheet, id: sheetId } }))
      }
    } else {
      await saveSheet(userId, state.sheet)
    }
    const currentSave = get().save
    const savePayload = {
      ...currentSave,
      sheet_id: get().sheet.id,
      post_combat_scene: currentSave.post_combat_scene || null,
      id: currentSave.id || undefined,
    }
    const saveId = await saveGameSave(userId, savePayload)
    if (saveId) {
      set(state => ({ save: { ...state.save, id: saveId } }))
    }
  },

  loadFromCloud: async (userId, sheetId) => {
    if (!userId || !sheetId) return false
    const sheetData = await loadFullSheet(sheetId)
    const saveData = await loadActiveSave(sheetId)
    console.log('[LOAD] sheetData:', sheetData?.sheet_name, 'saveData:', saveData?.status, saveData?.current_scene_id)
    if (sheetData) {
      set({
        sheet: { ...defaultSheet(), ...sheetData },
        save: { ...defaultSave(), ...(saveData || {}) },
      })
      return true
    }
    return false
  },
}))
