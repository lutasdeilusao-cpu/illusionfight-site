import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'

const PP_STORE_VERSION = '1.2.0'

const DEFAULT_STATE = {
  reputacao: 0,
  casosResolvidos: [],
  pistasColetadas: {},   // { caso_id: [pista_id, ...] }
  acusacoesErradas: {},  // { caso_id: count }
  nivel: 1,              // sobe a cada caso resolvido, afeta batalhas
  carregado: false,
}

export const usePPStore = create((set, get) => ({
  ...DEFAULT_STATE,

  // ── LOAD ──
  async loadSave(userId) {
    if (!userId) { set({ carregado: true }); return }
    try {
      const { data } = await supabase
        .from('pp_saves')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (data) {
        set({
          reputacao: data.reputacao || 0,
          casosResolvidos: data.casos_resolvidos || [],
          pistasColetadas: data.pistas_coletadas || {},
          acusacoesErradas: data.acusacoes_erradas || {},
          nivel: Math.max(1, (data.casos_resolvidos?.length || 0)),
          carregado: true,
        })
        console.log('[PP] save carregado | nivel:', Math.max(1, (data.casos_resolvidos?.length || 0)))
      } else {
        set({ carregado: true })
      }
    } catch (e) {
      console.error('[PP] erro ao carregar save:', e)
      set({ carregado: true })
    }
  },

  // ── SAVE ──
  async persistSave(userId) {
    if (!userId) return
    const { reputacao, casosResolvidos, pistasColetadas, acusacoesErradas } = get()
    try {
      await supabase.from('pp_saves').upsert({
        user_id: userId,
        reputacao,
        casos_resolvidos: casosResolvidos,
        pistas_coletadas: pistasColetadas,
        acusacoes_erradas: acusacoesErradas,
      }, { onConflict: 'user_id' })
      console.log('[PP] save persistido')
    } catch (e) {
      console.error('[PP] erro ao salvar:', e)
    }
  },

  // ── PISTA ──
  coletarPista(casoId, pistaId, userId) {
    set(state => {
      const existentes = state.pistasColetadas[casoId] || []
      if (existentes.includes(pistaId)) return state
      const novo = { ...state.pistasColetadas, [casoId]: [...existentes, pistaId] }
      return { pistasColetadas: novo }
    })
    setTimeout(() => get().persistSave(userId), 300)
  },

  // ── RESOLVER CASO ──
  resolverCaso(casoId, reputacaoGanho, userId) {
    set(state => {
      if (state.casosResolvidos.includes(casoId)) return state
      const novosCasos = [...state.casosResolvidos, casoId]
      return {
        casosResolvidos: novosCasos,
        reputacao: state.reputacao + reputacaoGanho,
        nivel: novosCasos.length,
      }
    })
    setTimeout(() => get().persistSave(userId), 300)
  },

  // ── ACUSAÇÃO ERRADA ──
  registrarAcusacaoErrada(casoId, userId) {
    set(state => ({
      acusacoesErradas: {
        ...state.acusacoesErradas,
        [casoId]: (state.acusacoesErradas[casoId] || 0) + 1,
      }
    }))
    setTimeout(() => get().persistSave(userId), 300)
  },

  resetStore() { set({ ...DEFAULT_STATE, carregado: true }) },

  // ── RESET SAVE ──
  async resetSave(userId) {
    set({ ...DEFAULT_STATE, carregado: true })
    if (userId) {
      try {
        await supabase.from('pp_saves').delete().eq('user_id', userId)
        console.log('[PP] save deletado do Supabase')
      } catch (e) {
        console.error('[PP] erro ao deletar save:', e)
      }
    }
  },
}))