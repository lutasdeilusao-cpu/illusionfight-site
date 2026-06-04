import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'

const DEFAULT_STATE = {
  reputacao: 0,
  casosResolvidos: [],
  pistasColetadas: {},
  acusacoesErradas: {},
  nivel: 1,
  carregado: false,
}

export const usePPStore = create((set, get) => ({
  ...DEFAULT_STATE,

  async loadSave(userId) {
    if (!userId) { set({ carregado: true }); return }
    try {
      const { data } = await supabase.from('pp_saves').select('*').eq('user_id', userId).single()
      if (data) {
        set({
          reputacao: data.reputacao || 0,
          casosResolvidos: data.casos_resolvidos || [],
          pistasColetadas: data.pistas_coletadas || {},
          acusacoesErradas: data.acusacoes_erradas || {},
          nivel: Math.max(1, (data.casos_resolvidos?.length || 0)),
          carregado: true,
        })
      } else {
        set({ carregado: true })
      }
    } catch (e) {
      set({ carregado: true })
    }
  },

  async persistSave(userId) {
    if (!userId) return
    const { reputacao, casosResolvidos, pistasColetadas, acusacoesErradas } = get()
    try {
      await supabase.from('pp_saves').upsert({ user_id: userId, reputacao, casos_resolvidos: casosResolvidos, pistas_coletadas: pistasColetadas, acusacoes_erradas: acusacoesErradas }, { onConflict: 'user_id' })
    } catch (e) {}
  },

  coletarPista(casoId, pistaId, userId) {
    set(state => {
      const existentes = state.pistasColetadas[casoId] || []
      if (existentes.includes(pistaId)) return state
      return { pistasColetadas: { ...state.pistasColetadas, [casoId]: [...existentes, pistaId] } }
    })
    setTimeout(() => get().persistSave(userId), 300)
  },

  resolverCaso(casoId, reputacaoGanho, userId) {
    set(state => {
      if (state.casosResolvidos.includes(casoId)) return state
      const novosCasos = [...state.casosResolvidos, casoId]
      return { casosResolvidos: novosCasos, reputacao: state.reputacao + reputacaoGanho, nivel: novosCasos.length }
    })
    setTimeout(() => get().persistSave(userId), 300)
  },

  registrarAcusacaoErrada(casoId, userId) {
    set(state => ({ acusacoesErradas: { ...state.acusacoesErradas, [casoId]: (state.acusacoesErradas[casoId] || 0) + 1 } }))
    setTimeout(() => get().persistSave(userId), 300)
  },

  resetStore() { set({ ...DEFAULT_STATE, carregado: true }) },
}))
