const TAMA_VERSION = '1.4.1'
console.log(`[TAMA] versão carregada: ${TAMA_VERSION}`)

import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'
import { calcularFase, BADGES, DIX_POR_ACAO, DIX_LOGIN_DIARIO, TEXTOS_PARTIDA, DIX_BOAS_VINDAS } from '../data/moedas'
import { CRIATURAS } from '../data/criaturas'

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
  adminFastMode: false,
  _isAdmin: false,
  inventario: {},
  flags: {},
  _dixSaldo: 0,
  _ultimoLoginDix: null,
  _faseAtual: null,
}

function cacheLocal(state) {
  try {
    const key = `tama_save_${state._slot || 1}`
    const ts = new Date().toISOString().slice(11, 19)
    console.log(`[TAMA:CACHE] ${ts} slot=${state._slot || 1} fase=${state.fase} status=${state.status} criatura=${state.criaturaId}`)
    localStorage.setItem(key, JSON.stringify(state))
  } catch { /* quota */ }
}

function cacheLoad(slot = 1) {
  try {
    const raw = localStorage.getItem(`tama_save_${slot}`)
    if (raw) {
      const ts = new Date().toISOString().slice(11, 19)
      const parsed = JSON.parse(raw)
      console.log(`[TAMA:CACHE] ${ts} LOADED slot=${slot} fase=${parsed.fase} status=${parsed.status} criatura=${parsed.criaturaId}`)
      return parsed
    }
    return null
  } catch { return null }
}

export const useTamagoshiStore = create((set, get) => ({
  ...defaultState,

  setFase: (fase) => {
    set({ fase })
    get().saveToCloud(get()._userId)
  },

  setAdmin: (val) => set({ _isAdmin: val }),

  eclodir: () => {
    set({ fase: 'selecao' })
    get().saveToCloud(get()._userId)
  },

  escolherCriatura: (criaturaId) => {
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
    get().saveToCloud(get()._userId)
  },

  setNomeCustom: (nome) => set({ nomeCustom: nome }),

  alimentar: () => {
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      const novaFome = Math.min(100, (state.fome || 0) + 30)
      const status = (novaFome > 0 && state.higiene > 0 && state.energia > 0 && state.humor > 0) ? 'vivo' : state.status
      return {
        fome: novaFome, ultimaAlimentacao: Date.now(),
        _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
        status,
      }
    })
    get().saveToCloud(get()._userId)
  },

  banhar: () => {
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      const novaHigiene = Math.min(100, (state.higiene || 0) + 40)
      const status = (state.fome > 0 && novaHigiene > 0 && state.energia > 0 && state.humor > 0) ? 'vivo' : state.status
      return {
        higiene: novaHigiene, ultimaHigiene: Date.now(),
        _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
        status,
      }
    })
    get().saveToCloud(get()._userId)
  },

  passear: (localId) => {
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      const bonus = 25
      let novaEnergia = Math.min(100, (state.energia || 0) + bonus)
      const status = (state.fome > 0 && state.higiene > 0 && novaEnergia > 0 && state.humor > 0) ? 'vivo' : state.status
      return {
        energia: novaEnergia, ultimoPasseio: Date.now(),
        _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
        status, fase: 'criatura',
      }
    })
    get().saveToCloud(get()._userId)
  },

  brincar: () => {
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      const novoHumor = Math.min(100, (state.humor || 0) + 35)
      const status = (state.fome > 0 && state.higiene > 0 && state.energia > 0 && novoHumor > 0) ? 'vivo' : state.status
      return {
        humor: novoHumor, ultimaBrincadeira: Date.now(),
        _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
        status, fase: 'criatura',
      }
    })
    get().saveToCloud(get()._userId)
  },

  calcularDecaimento: () => {
    set(state => {
      if (!state.criaturaId || (state.status !== 'vivo' && state.status !== 'critico')) return state
      const horas = (Date.now() - state._ultimoUpdate) / (1000 * 60 * 60)
      const mult = state.adminFastMode ? 100 : 1
      return calcDecaimento(state, horas * mult)
    })
    cacheLocal(get())
  },

  tick: () => {
    set(state => {
      if (!state.criaturaId || (state.status !== 'vivo' && state.status !== 'critico')) return state
      const horas = (Date.now() - state._ultimoUpdate) / (1000 * 60 * 60)
      const mult = state.adminFastMode ? 100 : 1
      return calcDecaimento(state, horas * mult)
    })
    cacheLocal(get())
  },

  saveToCloud: async (userId) => {
    const state = get()
    const uid = userId || state._userId
    const ts = new Date().toISOString().slice(11, 19)
    console.log(`[TAMA:SAVE] ${ts} uid=${uid ? uid.slice(0,8) : 'null'} fase=${state.fase} criatura=${state.criaturaId} status=${state.status}`)
    cacheLocal(state)
    if (!uid) return
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
      inventario: state.inventario || {},
      flags: state.flags || {},
    }
    const { error } = await supabase.from('tamagoshi_saves').upsert(payload, { onConflict: 'user_id,slot' })
    if (error) console.error('[TAMA] save error:', error)
  },

  loadFromCloud: async (userId, slot = 1) => {
    const ts = new Date().toISOString().slice(11, 19)
    if (!userId) {
      const local = cacheLoad(slot)
      if (local) {
        console.log(`[TAMA:LOAD] ${ts} from localStorage slot=${slot} fase=${local.fase} criatura=${local.criaturaId}`)
        set({ ...local, _isAdmin: get()._isAdmin, adminFastMode: get().adminFastMode, _userId: null, _slot: slot }); return local
      }
      console.log(`[TAMA:LOAD] ${ts} no user + no cache → ovo`)
      return null
    }
    console.log(`[TAMA:LOAD] ${ts} fetching Supabase for user=${userId.slice(0,8)} slot=${slot}`)
    const { data, error } = await supabase
      .from('tamagoshi_saves')
      .select('*')
      .eq('user_id', userId)
      .eq('slot', slot)
      .maybeSingle()
    if (!error && data) {
      console.log(`[TAMA:LOAD] ${ts} Supabase found fase=${data.fase} criatura=${data.criatura_id}`)
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
        inventario: data.inventario || {},
        flags: data.flags || {},
        _ultimoUpdate: Date.now(), _userId: userId, _slot: slot,
      }
      set(mapped)
      get().calcularDecaimento()
      get().getSaldoDix(userId)
      const faseAtual = calcularFase(mapped.nascidoEm)
      if (faseAtual === 'partida' && mapped.status !== 'partida') {
        set({ fase: 'partida' })
      } else if (faseAtual !== 'ovo' && faseAtual !== mapped._faseAtual) {
        get().verificarBadge(userId, faseAtual)
        set({ _faseAtual: faseAtual })
      }
      cacheLocal(get())
      return mapped
    }
    if (error) console.error(`[TAMA:LOAD] ${ts} Supabase error:`, error.message)
    console.log(`[TAMA:LOAD] ${ts} Supabase no data, trying localStorage`)
    const local = cacheLoad(slot)
    if (local) {
      console.log(`[TAMA:LOAD] ${ts} localStorage fallback OK fase=${local.fase} criatura=${local.criaturaId}`)
      set({ ...local, _isAdmin: get()._isAdmin, adminFastMode: get().adminFastMode, _userId: userId, _slot: slot })
      if (userId) {
        get().getSaldoDix(userId)
        get().saveToCloud(userId)
      }
      return local
    }
    console.log(`[TAMA:LOAD] ${ts} nothing found → ovo`)
    return null
  },

  reset: () => set({ ...defaultState, _ultimoUpdate: Date.now(), _ultimoLogin: Date.now() }),

  trocarCriatura: (criaturaId) => {
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
    get().saveToCloud(get()._userId)
  },

  toggleAdminFastMode: () => set(state => ({ adminFastMode: !state.adminFastMode })),

  // === DIX SYSTEM ===

  getSaldoDix: async (userId) => {
    const uid = userId || get()._userId
    if (!uid) return 0
    if (get()._isAdmin) { set({ _dixSaldo: Infinity }); return Infinity }
    const { data } = await supabase.from('dix_wallet').select('saldo').eq('user_id', uid).maybeSingle()
    const saldo = data?.saldo ?? 0
    set({ _dixSaldo: saldo })
    return saldo
  },

  darDixBoasVindas: async (userId, tier) => {
    const uid = userId || get()._userId
    if (!uid || get()._isAdmin) return 0
    const { data } = await supabase.from('dix_wallet').select('saldo').eq('user_id', uid).maybeSingle()
    if (data?.saldo > 0) return 0
    const bonus = DIX_BOAS_VINDAS[tier] || DIX_BOAS_VINDAS.free
    await get().ganharDix(uid, bonus, 'boas-vindas tamagoshi')
    return bonus
  },

  ganharDix: async (userId, valor, motivo) => {
    const uid = userId || get()._userId
    if (!uid || get()._isAdmin) return
    const atual = await get().getSaldoDix(uid)
    const novo = atual + valor
    const { error } = await supabase.from('dix_wallet').upsert(
      { user_id: uid, saldo: novo, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    if (error) { console.error('[DIX] ganhar error:', error); return }
    await supabase.from('dix_historico').insert({ user_id: uid, valor, motivo })
    set({ _dixSaldo: novo })
  },

  gastarDix: async (userId, valor, motivo) => {
    const uid = userId || get()._userId
    if (!uid) throw new Error('usuário não autenticado')
    if (get()._isAdmin) return
    const atual = await get().getSaldoDix(uid)
    if (atual < valor) throw new Error('DIX insuficiente')
    const novo = atual - valor
    const { error } = await supabase.from('dix_wallet').upsert(
      { user_id: uid, saldo: novo, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    if (error) { console.error('[DIX] gastar error:', error); throw new Error('erro ao gastar DIX') }
    await supabase.from('dix_historico').insert({ user_id: uid, valor: -valor, motivo })
    set({ _dixSaldo: novo })
  },

  coletarDixDiario: async (userId) => {
    const uid = userId || get()._userId
    if (!uid) return false
    const flags = get().flags || {}
    const hoje = new Date().toDateString()
    if (flags._dixHoje === hoje) return false
    await get().ganharDix(uid, DIX_LOGIN_DIARIO, 'login diário')
    const novasFlags = { ...get().flags, _dixHoje: hoje }
    set({ _ultimoLoginDix: Date.now(), flags: novasFlags })
    await supabase.from('tamagoshi_saves').update({ flags: novasFlags })
      .eq('user_id', uid).eq('slot', get()._slot || 1)
    return true
  },

  // === INVENTORY ===

  comprarItem: async (userId, itemId, preco) => {
    const uid = userId || get()._userId
    if (!uid) throw new Error('usuário não autenticado')
    await get().gastarDix(uid, preco, `compra: ${itemId}`)
    const inv = { ...(get().inventario || {}) }
    inv[itemId] = (inv[itemId] || 0) + 1
    set({ inventario: inv })
    await supabase.from('tamagoshi_saves').update({ inventario: inv })
      .eq('user_id', uid).eq('slot', get()._slot || 1)
  },

  consumirItem: async (itemId) => {
    const inv = { ...(get().inventario || {}) }
    if (!inv[itemId] || inv[itemId] <= 0) throw new Error('item não disponível no inventário')
    inv[itemId]--
    if (inv[itemId] <= 0) delete inv[itemId]
    set({ inventario: inv })
    const uid = get()._userId
    if (uid) {
      await supabase.from('tamagoshi_saves').update({ inventario: inv })
        .eq('user_id', uid).eq('slot', get()._slot || 1)
    }
  },

  // === LIFECYCLE ===

  verificarFase: () => {
    const state = get()
    if (!state.nascidoEm) return 'ovo'
    const fase = calcularFase(state.nascidoEm)
    if (fase === 'partida') {
      set({ fase: 'partida' })
    }
    return fase
  },

  verificarBadge: async (userId, fase) => {
    const uid = userId || get()._userId
    if (!uid) return
    const badge = BADGES[fase]
    if (!badge) return
    const { data: existente } = await supabase.from('tamagoshi_badges')
      .select('id').eq('user_id', uid).eq('badge_id', badge.id).maybeSingle()
    if (existente) return
    await supabase.from('tamagoshi_badges').insert({
      user_id: uid, criatura_id: get().criaturaId, badge_id: badge.id,
    })
    return badge
  },

  executarPartida: async (userId) => {
    const uid = userId || get()._userId
    if (!uid) return
    const state = get()
    const { data: badges } = await supabase.from('tamagoshi_badges')
      .select('badge_id').eq('user_id', uid).eq('criatura_id', state.criaturaId)
    const badgeIds = (badges || []).map(b => b.badge_id)
    await supabase.from('tamagoshi_fama').insert({
      user_id: uid, criatura_id: state.criaturaId,
      nome_custom: state.nomeCustom, fase_final: 'anciao',
      badges: badgeIds,
    })
    const badge = BADGES.partida
    const { data: existente } = await supabase.from('tamagoshi_badges')
      .select('id').eq('user_id', uid).eq('badge_id', badge.id).maybeSingle()
    if (!existente) {
      await supabase.from('tamagoshi_badges').insert({
        user_id: uid, criatura_id: state.criaturaId, badge_id: badge.id,
      })
    }
    set({
      status: 'partida', fase: 'partida', fome: 0, higiene: 0, energia: 0, humor: 0,
    })
    await supabase.from('tamagoshi_saves').update({
      status: 'partida', fome: 0, higiene: 0, energia: 0, humor: 0,
    }).eq('user_id', uid).eq('slot', state._slot || 1)
  },

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
  if (state.criaturaId) {
    useTamagoshiStore.getState().saveToCloud()
  }
}, 30000)
