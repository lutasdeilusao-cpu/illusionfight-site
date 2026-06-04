import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'

const defaultState = () => ({
  reputacao: 0,
  casosResolvidos: [],
  pistasColetadas: [],
  cadernoSuspeitas: [],
  acusacoesErradas: 0,
  hp: 30,
  hpMax: 30,
  dormindoAte: 0,
  fase: 'mapa',
  casoAtivo: null,
  casoDados: null,
  _userId: null,
})

export const usePPStore = create((set, get) => ({
  ...defaultState(),

  setUserId: (id) => set({ _userId: id }),

  danoHP: (valor) => set(state => {
    const novoHp = Math.max(0, state.hp - valor)
    if (novoHp <= 0) {
      return {
        hp: 0,
        fase: 'dormindo',
        dormindoAte: Date.now() + 5 * 60 * 1000,
      }
    }
    return { hp: novoHp }
  }),

  acordar: () => set({ hp: 30, fase: 'mapa', dormindoAte: 0 }),

  iniciarCaso: (caso) => set({
    fase: 'abertura',
    casoAtivo: caso.id,
    casoDados: {
      ...caso,
      locaisInvestidos: [],
      pistasCaso: [],
      suspeitosAtivos: caso.suspeitos.map(s => ({ ...s, status: 'ativo' })),
      acusacoesErradas: 0,
    },
  }),

  setFase: (fase) => set({ fase }),

  visitarLocal: (localId) => set(state => {
    if (!state.casoDados) return state
    return { casoDados: { ...state.casoDados, locaisInvestidos: [...state.casoDados.locaisInvestidos, localId] } }
  }),

  coletarPista: (pistaId, tipo) => set(state => {
    const next = { ...state }
    if (next.casoDados && !next.casoDados.pistasCaso.includes(pistaId)) {
      next.casoDados = { ...next.casoDados, pistasCaso: [...next.casoDados.pistasCaso, pistaId] }
    }
    if (!next.pistasColetadas.includes(pistaId)) {
      next.pistasColetadas = [...next.pistasColetadas, pistaId]
    }
    if (tipo === 'fio' && !next.cadernoSuspeitas.includes(pistaId)) {
      next.cadernoSuspeitas = [...next.cadernoSuspeitas, pistaId]
    }
    return next
  }),

  acusar: (suspeitoId) => set(state => {
    if (!state.casoDados) return state
    const suspeitosAtivos = state.casoDados.suspeitosAtivos.map(s =>
      s.id === suspeitoId ? { ...s, status: 'acusado' } : s
    )
    return { casoDados: { ...state.casoDados, suspeitosAtivos } }
  }),

  acusacaoErrada: () => set(state => {
    const acErradas = (state.casoDados?.acusacoesErradas || 0) + 1
    return {
      acusacoesErradas: state.acusacoesErradas + 1,
      casoDados: state.casoDados ? { ...state.casoDados, acusacoesErradas: acErradas } : state.casoDados,
    }
  }),

  resolverCaso: (casoId) => set(state => {
    if (state.casosResolvidos.includes(casoId)) return state
    return { casosResolvidos: [...state.casosResolvidos, casoId] }
  }),

  ganharReputacao: (valor) => set(state => ({
    reputacao: Math.max(0, state.reputacao + valor),
  })),

  saveToCloud: async (userId) => {
    const uid = userId || get()._userId
    if (!uid) return
    const s = get()
    await supabase.from('pp_saves').upsert({
      user_id: uid,
      reputacao: s.reputacao,
      casos_resolvidos: s.casosResolvidos,
      pistas_coletadas: s.pistasColetadas,
      caderno_suspeitas: s.cadernoSuspeitas,
      acusacoes_erradas: s.acusacoesErradas,
      hp: s.hp,
      dormindo_ate: s.dormindoAte,
      fase: s.hp <= 0 ? 'dormindo' : s.fase,
      caso_ativo: s.casoAtivo,
    }, { onConflict: 'user_id' })
  },

  loadFromCloud: async (userId) => {
    if (!userId) return null
    const { data } = await supabase.from('pp_saves').select('*').eq('user_id', userId).maybeSingle()
    if (!data) return null
    const dormindoAte = data.dormindo_ate || 0
    const acordou = dormindoAte > 0 && Date.now() >= dormindoAte
    set({
      reputacao: data.reputacao || 0,
      casosResolvidos: data.casos_resolvidos || [],
      pistasColetadas: data.pistas_coletadas || [],
      cadernoSuspeitas: data.caderno_suspeitas || [],
      acusacoesErradas: data.acusacoes_erradas || 0,
      hp: acordou ? 30 : (data.hp || 30),
      dormindoAte: acordou ? 0 : dormindoAte,
      fase: acordou ? 'mapa' : (data.hp <= 0 ? 'dormindo' : 'mapa'),
      casoAtivo: null,
      casoDados: null,
    })
    return data
  },

  reset: () => set({ ...defaultState() }),
}))
