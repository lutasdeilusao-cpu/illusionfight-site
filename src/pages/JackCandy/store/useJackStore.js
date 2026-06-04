const JACK_VERSION = '0.1.0'
console.log(`[JACK] versão carregada: ${JACK_VERSION}`)

import { create } from 'zustand'

const STORAGE_KEY = 'jack_candy_save'

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return null
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      balas: state.balas,
      balasTotais: state.balasTotais,
      notas: state.notas,
      inventario: state.inventario,
      flags: state.flags,
      fase: state.fase,
      titleDone: state.titleDone,
      pajéApareceu: state.pajéApareceu,
      mostraBarraca: state.mostraBarraca,
    }))
  } catch (_) {}
}

const defaultState = {
  balas: 0,
  balasTotais: 0,
  notas: 0,
  inventario: [],
  flags: {},
  fase: 'inicio',
  titleDone: false,
  pajéApareceu: false,
  mostraBarraca: false,
  monologoAtual: null,
}

export const useJackStore = create((set, get) => {
  const saved = loadSave()
  return {
    ...defaultState,
    ...(saved || {}),

    tick: () => {
      set(state => {
        const novaState = {
          balas: state.balas + 1,
          balasTotais: state.balasTotais + 1,
        }
        if (novaState.balasTotais > 0 && novaState.balasTotais % 500 === 0) {
          novaState.monologoAtual = 'as balas continuavam chegando. como sempre. como todo dia.'
        }
        return novaState
      })
    },

    guardar: () => {
      set(state => {
        const msg = `você guardou as balas. ${state.balas} balas seguras no bolso.`
        return { monologoAtual: msg }
      })
    },

    rolarNoChao: () => {
      set(state => {
        const total = state.balas
        const msg = `você jogou ${total} balas no chão. foram longe.`
        return { balas: 0, monologoAtual: msg }
      })
    },

    comprarBengala: () => {
      set(state => {
        if (state.balas < 100) return state
        if (state.flags.TEM_BENGALA) return state
        return {
          balas: state.balas - 100,
          inventario: [...state.inventario, { id: 'bengala_steampunk', nome: 'Bengala Steampunk', desc: 'bengala de madeira com engrenagens douradas. parece pesada. parece certa.', icone: '⚙' }],
          flags: { ...state.flags, TEM_BENGALA: true },
          monologoAtual: 'no sonho eu sempre soube que ia precisar de algo pra bater. só não sabia que ia ser uma bengala.',
          mostraBarraca: false,
        }
      })
    },

    fecharBarraca: () => set({ mostraBarraca: false }),
    abrirBarraca: () => set({ mostraBarraca: true }),

    setTitleDone: () => set({ titleDone: true }),

    limparMonologo: () => set({ monologoAtual: null }),

    reset: () => set({ ...defaultState }),

    persistNow: () => { persist(get()) },
  }
})

// Auto-save a cada 30s
setInterval(() => {
  const state = useJackStore.getState()
  if (state.fase) persist(state)
}, 30000)
