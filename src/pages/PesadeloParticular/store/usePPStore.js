import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'

const PP_STORE_VERSION = '1.3.0'

const DEFAULT_STATE = {
  reputacao: 0,
  casosResolvidos: [],
  pistasColetadas: {},   // { caso_id: [pista_id, ...] }
  acusacoesErradas: {},  // { caso_id: count }
  nivel: 1,              // sobe a cada caso resolvido, afeta batalhas
  carregado: false,
  saveExists: false,
  _slot: null,           // slot atual (1, 2, 3)
  _userId: null,
}

export const usePPStore = create((set, get) => ({
  ...DEFAULT_STATE,

  // ── CARREGAR TODOS OS SLOTS ──
  async loadAllSlots(userId) {
    if (!userId) return [null, null, null]
    try {
      const { data } = await supabase
        .from('pesadelo_saves')
        .select('*')
        .eq('user_id', userId)
        .order('slot')
      const slots = [null, null, null]
      if (data) {
        data.forEach(s => {
          slots[s.slot - 1] = {
            reputacao: s.reputacao || 0,
            casosResolvidos: s.casos_resolvidos || [],
            pistasColetadas: s.pistas_coletadas || {},
            acusacoesErradas: s.acusacoes_erradas || {},
            nivel: Math.max(1, (s.casos_resolvidos?.length || 0)),
            casoAtual: s.caso_atual || null,
          }
        })
      }
      return slots
    } catch (e) {
      console.error('[PP] erro ao carregar slots:', e)
      return [null, null, null]
    }
  },

  // ── CARREGAR SLOT ESPECÍFICO ──
  async loadSlot(userId, slot) {
    if (!userId) { set({ carregado: true, saveExists: false }); return }
    try {
      const { data } = await supabase
        .from('pesadelo_saves')
        .select('*')
        .eq('user_id', userId)
        .eq('slot', slot)
        .single()
      if (data) {
        set({
          reputacao: data.reputacao || 0,
          casosResolvidos: data.casos_resolvidos || [],
          pistasColetadas: data.pistas_coletadas || {},
          acusacoesErradas: data.acusacoes_erradas || {},
          nivel: Math.max(1, (data.casos_resolvidos?.length || 0)),
          carregado: true,
          saveExists: true,
          _slot: slot,
          _userId: userId,
        })
        console.log('[PP] slot', slot, 'carregado | nivel:', Math.max(1, (data.casos_resolvidos?.length || 0)))
      } else {
        set({ ...DEFAULT_STATE, carregado: true, saveExists: false, _slot: slot, _userId: userId })
      }
    } catch (e) {
      console.error('[PP] erro ao carregar slot:', e)
      set({ ...DEFAULT_STATE, carregado: true, saveExists: false, _slot: slot, _userId: userId })
    }
  },

  // ── SALVAR SLOT ──
  async saveSlot(userId, slot) {
    if (!userId || !slot) return
    const { reputacao, casosResolvidos, pistasColetadas, acusacoesErradas, nivel } = get()
    try {
      await supabase.from('pesadelo_saves').upsert({
        user_id: userId,
        slot,
        reputacao,
        casos_resolvidos: casosResolvidos,
        pistas_coletadas: pistasColetadas,
        acusacoes_erradas: acusacoesErradas,
        caso_atual: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,slot' })
      set({ saveExists: true, _slot: slot, _userId: userId })
      console.log('[PP] slot', slot, 'persistido')
    } catch (e) {
      console.error('[PP] erro ao salvar slot:', e)
    }
  },

  // ── DELETAR SLOT ──
  async deleteSlot(userId, slot) {
    if (!userId || !slot) return
    try {
      await supabase.from('pesadelo_saves').delete()
        .eq('user_id', userId)
        .eq('slot', slot)
      console.log('[PP] slot', slot, 'deletado')
    } catch (e) {
      console.error('[PP] erro ao deletar slot:', e)
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
    setTimeout(() => {
      const s = get()
      if (s._userId && s._slot) s.saveSlot(s._userId, s._slot)
    }, 300)
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
    setTimeout(() => {
      const s = get()
      if (s._userId && s._slot) s.saveSlot(s._userId, s._slot)
    }, 300)
  },

  // ── ACUSAÇÃO ERRADA ──
  registrarAcusacaoErrada(casoId, userId) {
    set(state => ({
      acusacoesErradas: {
        ...state.acusacoesErradas,
        [casoId]: (state.acusacoesErradas[casoId] || 0) + 1,
      }
    }))
    setTimeout(() => {
      const s = get()
      if (s._userId && s._slot) s.saveSlot(s._userId, s._slot)
    }, 300)
  },

  resetStore() { set({ ...DEFAULT_STATE, carregado: true, saveExists: false }) },

  // ── RESET SAVE (DELETAR SLOT ATUAL) ──
  async resetSave(userId) {
    const slot = get()._slot
    set({ ...DEFAULT_STATE, carregado: true, saveExists: false, _slot: slot, _userId: userId })
    if (userId && slot) {
      try {
        await supabase.from('pesadelo_saves').delete().eq('user_id', userId).eq('slot', slot)
        console.log('[PP] slot', slot, 'deletado do Supabase')
      } catch (e) {
        console.error('[PP] erro ao deletar slot:', e)
      }
    }
  },
}))