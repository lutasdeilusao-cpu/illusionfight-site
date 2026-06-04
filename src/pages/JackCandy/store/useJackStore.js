const JACK_VERSION = '1.0.0'
console.log(`[JACK] versão carregada: ${JACK_VERSION}`)

import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'

const STORAGE_KEY = 'jack_candy_save'

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return null
}

function persistLocal(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      capangas: state.capangas, capangasTotais: state.capangasTotais,
      notas: state.notas, fase: state.fase, flags: state.flags,
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
  let saved = loadLocal()
  // Migration: TEM_BENGALA sem bengala no inventário → reset
  if (saved?.flags?.TEM_BENGALA && !saved?.inventario?.find?.(i => i.id === 'bengala_steampunk')) {
    saved = { ...saved, flags: { ...saved.flags, TEM_BENGALA: false }, fase: 'intro' }
  }
  return {
    ...defaultState, ...(saved || {}),

    tick: () => {
      set(state => {
        const cap = state.capangas + state.capangasPorSegundo
        const tot = state.capangasTotais + state.capangasPorSegundo
        return { capangas: cap, capangasTotais: tot, tempoJogo: state.tempoJogo + 1 }
      })
    },

    regenHp: () => {
      set(state => {
        if (state.hpAtual >= state.hpMax) return state
        return { hpAtual: Math.min(state.hpMax, state.hpAtual + 1) }
      })
    },

    gastar: (qtd) => set(state => ({ capangas: Math.max(0, state.capangas - qtd) })),
    gastarNotas: (qtd) => set(state => ({ notas: Math.max(0, state.notas - qtd) })),
    setFlag: (flag) => set(state => ({ flags: { ...state.flags, [flag]: true } })),
    setFase: (fase) => set({ fase }),

    addInventario: (item) => set(state => ({ inventario: [...state.inventario, item] })),
    equiparItem: (slot, item) => set(state => ({ equipado: { ...state.equipado, [slot]: item } })),
    setTitleDone: () => set({ titleDone: true }),
    limparMonologo: () => set({ monologoAtual: null }),

    comprarBengala: () => {
      const state = get()
      if (state.capangas < 100 || state.flags.TEM_BENGALA) return
      set({
        capangas: state.capangas - 100,
        fase: 'vila',
        flags: { ...state.flags, TEM_BENGALA: true },
        inventario: [...state.inventario, { id: 'bengala_steampunk', nome: 'Bengala Steampunk', icone: '⚙', slot: 'arma' }],
        equipado: { ...state.equipado, arma: { id: 'bengala_steampunk', nome: 'Bengala Steampunk', dano: 1 } },
        monologoAtual: 'no sonho eu sempre soube que ia precisar de algo pra bater.',
      })
    },

    guardar: () => set(state => ({ monologoAtual: `você empilhou os capangas. ${state.capangas} corpos no chão.` })),
    jogarFora: () => set(state => ({ capangas: 0, monologoAtual: `você jogou ${state.capangas} capangas pela janela. foram longe.` })),

    // === Cloud Save ===

    saveToCloud: async (userId) => {
      const uid = userId || get()._userId
      if (!uid) return
      const state = get()
      const payload = {
        user_id: userId,
        capangas: state.capangas, capangas_totais: state.capangasTotais,
        notas: state.notas, fase: state.fase, flags: state.flags,
        hp_atual: state.hpAtual, hp_max: state.hpMax,
        nivel: state.nivel, xp: state.xp,
        inventario: state.inventario, equipado: state.equipado,
        dungeons_completas: state.dungeonsCompletas,
        tempo_jogo: state.tempoJogo, title_done: state.titleDone,
        version: JACK_VERSION,
      }
      const { data } = await supabase.from('jack_saves').select('id').eq('user_id', uid).maybeSingle()
      if (data?.id) {
        await supabase.from('jack_saves').update(payload).eq('id', data.id)
      } else {
        await supabase.from('jack_saves').insert({ ...payload, user_id: uid })
      }
    },

    loadFromCloud: async (userId) => {
      if (!userId) return false
      const { data } = await supabase.from('jack_saves').select('*').eq('user_id', userId).maybeSingle()
      if (data) {
        set({
          capangas: data.capangas ?? 0, capangasTotais: data.capangas_totais ?? 0,
          notas: data.notas ?? 0, fase: data.fase ?? 'intro', flags: data.flags ?? {},
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

// Auto-save local a cada 30s
setInterval(() => {
  const state = useJackStore.getState()
  if (state.fase) persistLocal(state)
}, 30000)
