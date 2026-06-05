const TAMA_VERSION = '1.1.1'
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
      const horas = (Date.now() - state._ultimoUpdate) / (1000 * 60 * 60)
      return calcDecaimento(state, horas)
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

  // === TRADE SYSTEM ===

  gerarKeyTroca: () => {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  },

  verificarPermissaoTroca: (tama, tier) => {
    const agora = new Date()
    const ultimaTroca = tama.ultima_troca ? new Date(tama.ultima_troca) : null

    if (tier === 'free' || !tier) {
      if (ultimaTroca) {
        const diasDesde = (agora - ultimaTroca) / (1000 * 60 * 60 * 24)
        if (diasDesde < 90) {
          const restam = Math.ceil(90 - diasDesde)
          throw new Error(`conta free só pode trocar a cada 3 meses. faltam ${restam} dias.`)
        }
      }
    }

    if (tier === 'elite') {
      if (ultimaTroca) {
        const mesUltima = `${ultimaTroca.getMonth()}-${ultimaTroca.getFullYear()}`
        const mesAgora = `${agora.getMonth()}-${agora.getFullYear()}`
        if (mesUltima === mesAgora) {
          throw new Error('conta elite já usou a troca deste mês.')
        }
      }
    }

    if (tier === 'primordial') {
      if (ultimaTroca) {
        const diasDesde = (agora - ultimaTroca) / (1000 * 60 * 60 * 24)
        if (diasDesde < 15) {
          const restam = Math.ceil(15 - diasDesde)
          throw new Error(`primordial precisa esperar 15 dias entre trocas. faltam ${restam} dias.`)
        }
      }
      const mesUltima = ultimaTroca ? `${ultimaTroca.getMonth()}-${ultimaTroca.getFullYear()}` : null
      const mesAgora = `${agora.getMonth()}-${agora.getFullYear()}`
      if (mesUltima === mesAgora && (tama.trocas_no_mes || 0) >= 2) {
        throw new Error('primordial já usou as 2 trocas deste mês.')
      }
    }
  },

  proporTroca: async (userId, slotA) => {
    const { data: tama, error: err } = await supabase
      .from('tamagoshi_saves')
      .select('*')
      .eq('user_id', userId)
      .eq('slot', slotA)
      .maybeSingle()
    if (err || !tama) throw new Error('tamagoshi não encontrado')
    if (tama.status !== 'vivo') throw new Error('só pode trocar tamagoshi vivo')

    const key = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()

    const { error: insertErr } = await supabase.from('tamagoshi_trocas').insert({
      key,
      user_id_a: userId,
      slot_a: slotA,
      criatura_id_a: tama.criatura_id,
      status: 'pendente',
      expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    if (insertErr) throw new Error('erro ao criar pedido de troca')
    return key
  },

  confirmarTroca: async (key, userId, slotB, tierB) => {
    const { data: troca, error: err } = await supabase
      .from('tamagoshi_trocas')
      .select('*')
      .eq('key', key)
      .eq('status', 'pendente')
      .gte('expira_em', new Date().toISOString())
      .maybeSingle()
    if (err || !troca) throw new Error('key inválida ou expirada')
    if (troca.user_id_a === userId) throw new Error('não pode trocar consigo mesmo')

    const [tamaA, tamaB] = await Promise.all([
      supabase.from('tamagoshi_saves').select('*').eq('user_id', troca.user_id_a).eq('slot', troca.slot_a).maybeSingle(),
      supabase.from('tamagoshi_saves').select('*').eq('user_id', userId).eq('slot', slotB).maybeSingle(),
    ])
    if (!tamaA.data || !tamaB.data) throw new Error('tamagoshi não encontrado')
    if (tamaA.data.status !== 'vivo' || tamaB.data.status !== 'vivo') throw new Error('ambos precisam estar vivos para trocar')

    const { data: perfilA } = await supabase.from('profiles').select('role').eq('id', troca.user_id_a).maybeSingle()
    const tierA = perfilA?.role || 'free'

    const isMesmoMes = (a, b) => a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()

    const calcularNovoContador = (tama, agora) => {
      const ult = tama.ultima_troca ? new Date(tama.ultima_troca) : null
      if (!ult || !isMesmoMes(ult, agora)) return 1
      return (tama.trocas_no_mes || 0) + 1
    }

    const agora = new Date()
    try { get().verificarPermissaoTroca(tamaA.data, tierA) } catch (e) { throw new Error(`dono A: ${e.message}`) }
    try { get().verificarPermissaoTroca(tamaB.data, tierB) } catch (e) { throw new Error(`você: ${e.message}`) }

    const resetFields = {
      fase: 'ovo', fome: 100, higiene: 100, energia: 100, humor: 100,
      dias_cuidado_streak: 0, dias_perfeito_streak: 0,
      nascido_em: agora.toISOString(),
      ultima_alimentacao: null, ultima_higiene: null, ultimo_passeio: null, ultima_brincadeira: null,
      status: 'vivo', flags: '{}',
      nome_custom: null,
      ultima_troca: agora.toISOString(),
      trocas_no_mes: calcularNovoContador(tamaB.data, agora),
    }
    const resetFieldsA = {
      ...resetFields,
      trocas_no_mes: calcularNovoContador(tamaA.data, agora),
    }

    await supabase.from('tamagoshi_saves').update({
      criatura_id: tamaB.data.criatura_id,
      personalidade: tamaB.data.personalidade,
      ...resetFieldsA,
    }).eq('user_id', troca.user_id_a).eq('slot', troca.slot_a)

    await supabase.from('tamagoshi_saves').update({
      criatura_id: tamaA.data.criatura_id,
      personalidade: tamaA.data.personalidade,
      ...resetFields,
    }).eq('user_id', userId).eq('slot', slotB)

    await supabase.from('tamagoshi_trocas').update({
      status: 'confirmado',
      user_id_b: userId,
      slot_b: slotB,
      confirmado_em: agora.toISOString(),
    }).eq('key', key)

    return { criaturaId: tamaA.data.criatura_id, personalidade: tamaA.data.personalidade }
  },
}))

setInterval(() => {
  const state = useTamagoshiStore.getState()
  if (state._userId && state.criaturaId) {
    useTamagoshiStore.getState().saveToCloud()
  }
}, 30000)
