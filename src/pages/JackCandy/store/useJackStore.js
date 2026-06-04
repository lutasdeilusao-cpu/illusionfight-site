const JACK_VERSION = '1.4.2'
console.log(`[JACK] versão carregada: ${JACK_VERSION}`)

import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'
import { ITENS } from '../data/itens'
import { MONOLOGUES } from '../data/monologues'

const STORAGE_KEY = 'jack_candy_save'

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data.fase?.startsWith('dungeon_') || data.fase === 'dungeon_select' || data.fase?.startsWith('interior_')) {
        data.fase = 'vila'
      }
      const temNoInventario = data.inventario?.find?.(i => i.id === 'bengala_steampunk')
      const temNoEquipado = data.equipado?.arma?.id === 'bengala_steampunk'
      if (data.flags?.TEM_BENGALA && !temNoInventario && !temNoEquipado) {
        data.flags.TEM_BENGALA = false
        data.fase = 'intro'
      }
      return data
    }
  } catch (_) {}
  return null
}

function persistLocal(state) {
  try {
    const faseSave = state.fase.startsWith('dungeon_') || state.fase === 'dungeon_select' || state.fase.startsWith('interior_') ? 'vila' : state.fase
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      capangas: state.capangas, capangasTotais: state.capangasTotais,
      notas: state.notas, fase: faseSave, flags: state.flags,
      hpAtual: state.hpAtual, hpMax: state.hpMax,
      nivel: state.nivel, xp: state.xp,
      inventario: state.inventario, equipado: state.equipado,
      dungeonsCompletas: state.dungeonsCompletas,
      tempoJogo: state.tempoJogo, titleDone: state.titleDone,
    }))
  } catch (_) {}
}

const defaultState = {
  capangas: 0, capangasPorSegundo: 1, capangasTotais: 0, notas: 0,
  hpAtual: 20, hpMax: 20, nivel: 1, xp: 0,
  fase: 'intro', flags: {}, dungeonsCompletas: [],
  inventario: [], equipado: { arma: null, armadura: null, acessorio: null },
  tempoJogo: 0, titleDone: false, monologoAtual: null,
  _userId: null,
}

export const useJackStore = create((set, get) => {
  const saved = loadLocal()
  return {
    ...defaultState, ...(saved || {}),

    tick: () => set(state => ({
      capangas: state.capangas + state.capangasPorSegundo,
      capangasTotais: state.capangasTotais + state.capangasPorSegundo,
      tempoJogo: state.tempoJogo + 1,
    })),

    regenHp: () => set(state => {
      if (state.hpAtual >= state.hpMax || state.fase?.startsWith('dungeon')) return state
      return { hpAtual: Math.min(state.hpMax, state.hpAtual + 1) }
    }),

    ganharCapangas: (qtd) => set(state => ({ capangas: state.capangas + qtd, capangasTotais: state.capangasTotais + qtd })),
    setHpAtual: (hp) => set(state => ({ hpAtual: Math.min(state.hpMax, Math.max(0, hp)) })),
    gastar: (qtd) => set(state => ({ capangas: Math.max(0, state.capangas - qtd) })),
    gastarNotas: (qtd) => set(state => ({ notas: Math.max(0, state.notas - qtd) })),
    setFlag: (flag) => set(state => ({ flags: { ...state.flags, [flag]: true } })),
    setFase: (fase) => set({ fase }),
    setMonologo: (text) => set({ monologoAtual: text }),
    limparMonologo: () => set({ monologoAtual: null }),
    setTitleDone: () => set({ titleDone: true }),

    comprarBengala: () => {
      console.log('[JACK] comprarBengala chamado. capangas:', get().capangas, 'TEM_BENGALA:', get().flags.TEM_BENGALA)
      get().comprarItem('bengala_steampunk')
    },

    comprarItem: (itemId) => {
      console.log('[JACK] comprarItem chamado:', itemId, 'capangas:', get().capangas, 'TEM_BENGALA:', get().flags.TEM_BENGALA)
      const item = ITENS[itemId]
      if (!item) return
      const state = get()
      const moeda = item.moeda === 'nota' ? state.notas : state.capangas
      if (moeda < item.preco) return
      set(state => {
        let novoState = {}
        if (item.moeda === 'nota') novoState.notas = state.notas - item.preco
        else novoState.capangas = state.capangas - item.preco
        if (item.cura) {
          novoState.hpAtual = Math.min(state.hpMax, state.hpAtual + item.cura)
        }
        if (item.capPerSeg) novoState.capangasPorSegundo = state.capangasPorSegundo + item.capPerSeg
        if (item.hpMaxBonus) novoState.hpMax = state.hpMax + item.hpMaxBonus
        if (item.dano || item.slot) {
          const slot = item.slot || 'arma'
          novoState.equipado = { ...state.equipado, [slot]: { id: item.id, nome: item.nome, dano: item.dano || 0 } }
          if (item.danoBonus) novoState.equipado[slot] = { ...novoState.equipado[slot], dano: (state.equipado[slot]?.dano || 0) + item.danoBonus }
        }
        if (item.id === 'bengala_steampunk') {
          novoState.flags = { ...state.flags, TEM_BENGALA: true }
          novoState.fase = 'vila'
          novoState.monologoAtual = MONOLOGUES.compra_bengala
        }
        if (item.id.startsWith('upgrade_bengala') && item.danoBonus) {
          novoState.equipado = {
            ...state.equipado,
            arma: { ...state.equipado.arma, dano: (state.equipado.arma?.dano || 0) + item.danoBonus },
          }
        }
        // Só adiciona ao inventário itens SEM slot (ex: consumíveis, upgrades)
        if (!item.slot) {
          novoState.inventario = [...state.inventario.filter(i => i.id !== itemId), { id: item.id, nome: item.nome }]
        }
        return novoState
      })
    },

    equiparPorId: (itemId) => {
      const item = ITENS[itemId]
      if (!item?.slot) return
      set(state => ({
        equipado: { ...state.equipado, [item.slot]: { id: item.id, nome: item.nome, dano: item.dano || 0 } },
        inventario: state.inventario.filter(i => i.id !== itemId),
      }))
    },

    usarItem: (itemId) => {
      const item = ITENS[itemId]
      if (!item) return
      set(state => {
        if (item.cura) {
          return {
            hpAtual: Math.min(state.hpMax, state.hpAtual + item.cura),
            inventario: state.inventario.filter(i => i.id !== itemId),
            monologoAtual: `você usou ${item.nome}. +${item.cura} HP.`,
          }
        }
        return state
      })
    },

    completarDungeon: (dungeonId, dropCap, dropNotas) => {
      set(state => {
        if (state.dungeonsCompletas.includes(dungeonId)) {
          return { capangas: state.capangas + Math.floor(dropCap / 2) }
        }
        const novasCompletas = [...state.dungeonsCompletas, dungeonId]
        const flagMap = {
          onibus: 'NOTAS_LIBERADO',
          rua: 'NINA_LIBERADO',
        }
        return {
          capangas: state.capangas + dropCap,
          notas: state.notas + (dropNotas || 0),
          dungeonsCompletas: novasCompletas,
          flags: { ...state.flags, [flagMap[dungeonId]]: true },
          monologoAtual: MONOLOGUES.dungeon1_vitoria || '',
        }
      })
    },

    // Cloud Save
    saveToCloud: async (userId) => {
      const uid = userId || get()._userId
      if (!uid) return
      const state = get()
      const payload = {
        user_id: uid, capangas: state.capangas, capangas_por_segundo: state.capangasPorSegundo,
        capangas_totais: state.capangasTotais, notas: state.notas,
        fase: state.fase, flags: state.flags,
        hp_atual: state.hpAtual, hp_max: state.hpMax,
        nivel: state.nivel, xp: state.xp,
        inventario: state.inventario, equipado: state.equipado,
        dungeons_completas: state.dungeonsCompletas,
        tempo_jogo: state.tempoJogo, title_done: state.titleDone,
        version: JACK_VERSION,
      }
      const { data } = await supabase.from('jack_saves').select('id').eq('user_id', uid).maybeSingle()
      if (data?.id) await supabase.from('jack_saves').update(payload).eq('id', data.id)
      else await supabase.from('jack_saves').insert({ ...payload, user_id: uid })
    },

    loadFromCloud: async (userId) => {
      if (!userId) return false
      const { data } = await supabase.from('jack_saves').select('*').eq('user_id', userId).maybeSingle()
      if (data) {
        set({
          capangas: data.capangas ?? 0, capangasPorSegundo: data.capangas_por_segundo ?? 1,
          capangasTotais: data.capangas_totais ?? 0, notas: data.notas ?? 0,
          fase: data.fase ?? 'intro', flags: data.flags ?? {},
          hpAtual: data.hp_atual ?? 20, hpMax: data.hp_max ?? 20,
          nivel: data.nivel ?? 1, xp: data.xp ?? 0,
          inventario: data.inventario ?? [], equipado: data.equipado ?? { arma: null, armadura: null, acessorio: null },
          dungeonsCompletas: data.dungeons_completas ?? [],
          tempoJogo: data.tempo_jogo ?? 0, titleDone: data.title_done ?? false,
          _userId: userId,
        })
        return true
      }
      return false
    },

    reset: () => set({ ...defaultState }),
    persistNow: () => persistLocal(get()),
  }
})

setInterval(() => {
  const state = useJackStore.getState()
  if (state.fase) persistLocal(state)
}, 30000)
