const TAMA_VERSION = '1.0.0'
console.log(`[TAMA] versão carregada: ${TAMA_VERSION}`)

import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'

const DECAY = { fome: 6, higiene: 3, energia: 4, humor: 2 }
const CRITICO_EM_HORAS = 24
const DIAS_PARA_PERFEITO = 7

function calcDecaimento(state, horas) {
  if (state.status !== 'vivo' && state.status !== 'critico') return state
  if (horas <= 0) return state

  const indepMult = state.personalidade === 'INDEPENDENTE' ? 0.8 : 1
  const carenteHumor = state.personalidade === 'CARENTE' ? 1.2 : 1

  const novaFome = Math.max(0, state.fome - Math.floor(DECAY.fome * horas * indepMult))
  const novaHigiene = Math.max(0, state.higiene - Math.floor(DECAY.higiene * horas * indepMult))
  const novaEnergia = Math.max(0, state.energia - Math.floor(DECAY.energia * horas * indepMult))

  let novoHumor = Math.max(0, state.humor - Math.floor(DECAY.humor * horas * indepMult * carenteHumor))
  if (state.personalidade === 'FOFO' && state._ultimoLogin) {
    const horasSemDono = (Date.now() - state._ultimoLogin) / (1000 * 60 * 60)
    if (horasSemDono < 12) novoHumor = Math.max(20, novoHumor)
  }

  const emCritico = novaFome <= 0 || novaHigiene <= 0 || novaEnergia <= 0 || novoHumor <= 0
  const jaEraCritico = state.status === 'critico'
  const criticoDesde = jaEraCritico ? state._criticoDesde : emCritico ? Date.now() : null
  const horasCritico = criticoDesde ? (Date.now() - criticoDesde) / (1000 * 60 * 60) : 0

  if (emCritico && horasCritico >= CRITICO_EM_HORAS) {
    return {
      fome: novaFome, higiene: novaHigiene, energia: novaEnergia, humor: novoHumor,
      status: 'morto', _criticoDesde: criticoDesde, _ultimoUpdate: Date.now(),
      fase: 'luto', cooldownAte: Date.now() + 24 * 60 * 60 * 1000,
    }
  }

  return {
    fome: novaFome, higiene: novaHigiene, energia: novaEnergia, humor: novoHumor,
    status: emCritico ? 'critico' : 'vivo',
    _criticoDesde: criticoDesde,
    _ultimoUpdate: Date.now(),
  }
}

const defaultState = {
  criaturaId: null, nomeCustom: '', personalidade: null,
  fase: 'ovo', estagio: 0,
  fome: 100, higiene: 100, energia: 100, humor: 100,
  ultimaAlimentacao: null, ultimaHigiene: null, ultimoPasseio: null, ultimaBrincadeira: null,
  diasCuidadoStreak: 0, diasPerfeitoStreak: 0,
  nascidoEm: null, status: null,
  cooldownAte: null,
  _ultimoUpdate: Date.now(), _criticoDesde: null, _ultimoLogin: Date.now(),
  _userId: null, _slot: 1,
}

function cacheLocal(state) {
  try {
    const key = `tama_save_${state._slot || 1}`
    localStorage.setItem(key, JSON.stringify(state))
  } catch { /* quota */ }
}

function cacheLoad(slot = 1) {
  try {
    const raw = localStorage.getItem(`tama_save_${slot}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export const useTamagoshiStore = create((set, get) => ({
  ...defaultState,

  setFase: (fase) => set({ fase }),

  eclodir: () => set({ fase: 'selecao' }),

  escolherCriatura: (criaturaId) => {
    const { CRIATURAS } = require('../data/criaturas')
    const c = CRIATURAS.find(x => x.id === criaturaId)
    if (!c) return
    set({
      criaturaId, personalidade: c.tipo, nomeCustom: c.nome,
      fase: 'criatura', estagio: 1,
      fome: 100, higiene: 100, energia: 100, humor: 100,
      nascidoEm: Date.now(),
      status: 'vivo',
      _ultimoUpdate: Date.now(), _ultimoLogin: Date.now(),
    })
    get()._autoSave()
  },

  setNomeCustom: (nome) => set({ nomeCustom: nome }),

  alimentar: () => set(state => {
    if (state.status !== 'vivo' && state.status !== 'critico') return state
    const novaFome = Math.min(100, (state.fome || 0) + 30)
    const status = (novaFome > 0 && state.higiene > 0 && state.energia > 0 && state.humor > 0) ? 'vivo' : state.status
    return {
      fome: novaFome, ultimaAlimentacao: Date.now(),
      _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
      status,
    }
  }),

  banhar: () => set(state => {
    if (state.status !== 'vivo' && state.status !== 'critico') return state
    const novaHigiene = Math.min(100, (state.higiene || 0) + 40)
    const status = (state.fome > 0 && novaHigiene > 0 && state.energia > 0 && state.humor > 0) ? 'vivo' : state.status
    return {
      higiene: novaHigiene, ultimaHigiene: Date.now(),
      _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
      status,
    }
  }),

  passear: (localId) => set(state => {
    if (state.status !== 'vivo' && state.status !== 'critico') return state
    const bonus = 25
    let novaEnergia = Math.min(100, (state.energia || 0) + bonus)
    const status = (state.fome > 0 && state.higiene > 0 && novaEnergia > 0 && state.humor > 0) ? 'vivo' : state.status
    return {
      energia: novaEnergia, ultimoPasseio: Date.now(),
      _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
      status, fase: 'criatura',
    }
  }),

  brincar: () => set(state => {
    if (state.status !== 'vivo' && state.status !== 'critico') return state
    const novoHumor = Math.min(100, (state.humor || 0) + 35)
    const status = (state.fome > 0 && state.higiene > 0 && state.energia > 0 && novoHumor > 0) ? 'vivo' : state.status
    return {
      humor: novoHumor, ultimaBrincadeira: Date.now(),
      _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
      status, fase: 'criatura',
    }
  }),

  calcularDecaimento: () => {
    set(state => {
      if (!state.criaturaId || (state.status !== 'vivo' && state.status !== 'critico')) return state
      const horas = (Date.now() - state._ultimoUpdate) / (1000 * 60 * 60)
      return calcDecaimento(state, horas)
    })
  },

  tick: () => {
    set(state => {
      if (!state.criaturaId || (state.status !== 'vivo' && state.status !== 'critico')) return state
      return calcDecaimento(state, 1 / 360)
    })
  },

  saveToCloud: async (userId) => {
    const uid = userId || get()._userId
    if (!uid) return
    const state = get()
    const payload = {
      user_id: uid, slot: state._slot || 1,
      criatura_id: state.criaturaId, nome_custom: state.nomeCustom,
      personalidade: state.personalidade, fase: state.fase, estagio: state.estagio,
      fome: state.fome, higiene: state.higiene, energia: state.energia, humor: state.humor,
      ultima_alimentacao: state.ultimaAlimentacao ? new Date(state.ultimaAlimentacao).toISOString() : null,
      ultima_higiene: state.ultimaHigiene ? new Date(state.ultimaHigiene).toISOString() : null,
      ultimo_passeio: state.ultimoPasseio ? new Date(state.ultimoPasseio).toISOString() : null,
      ultima_brincadeira: state.ultimaBrincadeira ? new Date(state.ultimaBrincadeira).toISOString() : null,
      dias_cuidado_streak: state.diasCuidadoStreak, dias_perfeito_streak: state.diasPerfeitoStreak,
      nascido_em: state.nascidoEm ? new Date(state.nascidoEm).toISOString() : null,
      status: state.status, cooldown_ate: state.cooldownAte ? new Date(state.cooldownAte).toISOString() : null,
      updated_at: new Date().toISOString(), version: TAMA_VERSION,
    }
    const { error } = await supabase.from('tamagoshi_saves').upsert(payload, { onConflict: 'user_id,slot' })
    if (error) console.error('[TAMA] save error:', error)
    cacheLocal(state)
  },

  loadFromCloud: async (userId, slot = 1) => {
    if (!userId) {
      const local = cacheLoad(slot)
      if (local) { set({ ...local, _userId: null, _slot: slot }); return local }
      return null
    }
    const { data, error } = await supabase
      .from('tamagoshi_saves')
      .select('*')
      .eq('user_id', userId)
      .eq('slot', slot)
      .maybeSingle()
    if (!error && data) {
      const mapped = {
        criaturaId: data.criatura_id, nomeCustom: data.nome_custom,
        personalidade: data.personalidade, fase: data.fase, estagio: data.estagio || 0,
        fome: data.fome ?? 100, higiene: data.higiene ?? 100, energia: data.energia ?? 100, humor: data.humor ?? 100,
        ultimaAlimentacao: data.ultima_alimentacao ? new Date(data.ultima_alimentacao).getTime() : null,
        ultimaHigiene: data.ultima_higiene ? new Date(data.ultima_higiene).getTime() : null,
        ultimoPasseio: data.ultimo_passeio ? new Date(data.ultimo_passeio).getTime() : null,
        ultimaBrincadeira: data.ultima_brincadeira ? new Date(data.ultima_brincadeira).getTime() : null,
        diasCuidadoStreak: data.dias_cuidado_streak || 0,
        diasPerfeitoStreak: data.dias_perfeito_streak || 0,
        nascidoEm: data.nascido_em ? new Date(data.nascido_em).getTime() : null,
        status: data.status, cooldownAte: data.cooldown_ate ? new Date(data.cooldown_ate).getTime() : null,
        _ultimoUpdate: Date.now(), _userId: userId, _slot: slot,
      }
      set(mapped)
      get().calcularDecaimento()
      cacheLocal(get())
      return mapped
    }
    const local = cacheLoad(slot)
    if (local) { set({ ...local, _userId: userId, _slot: slot }); return local }
    return null
  },

  reset: () => set({ ...defaultState, _ultimoUpdate: Date.now(), _ultimoLogin: Date.now() }),
}))

setInterval(() => {
  const state = useTamagoshiStore.getState()
  if (state._userId && state.criaturaId) {
    useTamagoshiStore.getState().saveToCloud()
  }
}, 30000)
