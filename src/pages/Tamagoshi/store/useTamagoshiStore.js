import { TAMA_VERSION } from '../../../config/version'
console.log(`[TAMA] versão carregada: ${TAMA_VERSION}`)

import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'
import { registrarPontuacaoTamaRanking } from '../../../hooks/useLeaderboardDB'
import { calcularFase, BADGES, DIX_POR_ACAO, DIX_LOGIN_DIARIO, TEXTOS_PARTIDA, DIX_BOAS_VINDAS } from '../data/moedas'
import { CRIATURAS } from '../data/criaturas'
import { useNotificationStore } from '../../../store/notificationStore'

const PONTOS_TAMA = {
  login: 5,
  alimentar: 2,
  banhar: 2,
  passear: 2,
  brincar: 2,
  saude: 2,
  fase: 20,
  partida: 100,
}

// ── Novo sistema de decaimento por dia da semana ──
// Cada dia da semana, uma barra específica cai mais rápido
// Fim de semana: duas barras aleatórias
const BASE_DECAY = { fome: 0.6, higiene: 0.5, energia: 0.6, humor: 0.4, saude: 0.4 }
const FOCUSED_EXTRA = 2.0 // extra/h para a(s) barra(s) do dia → total ~2.5/h → ~60 em 24h → cai de 100 para 40 (<50 ✓)

function getFocusedBars() {
  const day = new Date().getDay() // 0=Dom, 1=Seg... 6=Sáb
  const schedule = {
    0: null, // Domingo: aleatório
    1: ['fome'],     // Segunda: dia de alimentar
    2: ['higiene'],  // Terça: dia de banho
    3: ['energia'],  // Quarta: dia de passear
    4: ['humor'],    // Quinta: dia de brincar
    5: ['saude'],    // Sexta: dia de saúde
    6: null,         // Sábado: aleatório
  }
  const bars = schedule[day]
  if (bars === null) {
    // Fim de semana: 2 barras aleatórias diferentes
    const all = ['fome', 'higiene', 'energia', 'humor', 'saude']
    const shuffled = [...all].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 2)
  }
  return bars
}

function calcDecaimento(state, horas) {
  if (state.status !== 'vivo' && state.status !== 'critico') return state
  if (horas <= 0) return state

  const focusedBars = getFocusedBars()
  const indepMult = state.personalidade === 'INDEPENDENTE' ? 0.8 : 1
  const carenteHumor = state.personalidade === 'CARENTE' ? 1.2 : 1

  function decayBar(nome, base, extraMult = 1) {
    const isFocused = focusedBars.includes(nome)
    const totalRate = (isFocused ? BASE_DECAY[nome] + FOCUSED_EXTRA : BASE_DECAY[nome]) * indepMult * extraMult
    return Math.max(0, base - Math.floor(totalRate * horas))
  }

  const novaFome = decayBar('fome', state.fome)
  const novaHigiene = decayBar('higiene', state.higiene)
  const novaEnergia = decayBar('energia', state.energia)

  let novoHumor = decayBar('humor', state.humor, carenteHumor)
  if (state.personalidade === 'FOFO' && state._ultimoLogin) {
    const horasSemDono = (Date.now() - state._ultimoLogin) / (1000 * 60 * 60)
    if (horasSemDono < 12) novoHumor = Math.max(20, novoHumor)
  }

  const novaSaude = decayBar('saude', state.saude)

  const emCritico = novaFome <= 0 || novaHigiene <= 0 || novaEnergia <= 0 || novoHumor <= 0 || novaSaude <= 0
  const jaEraCritico = state.status === 'critico'
  const criticoDesde = jaEraCritico ? state._criticoDesde : emCritico ? Date.now() : null
  const horasCritico = criticoDesde ? (Date.now() - criticoDesde) / (1000 * 60 * 60) : 0
  const CRITICO_EM_HORAS = 24

  if (emCritico && horasCritico >= CRITICO_EM_HORAS) {
    return {
      fome: novaFome, higiene: novaHigiene, energia: novaEnergia, humor: novoHumor, saude: novaSaude,
      status: 'morto', _criticoDesde: criticoDesde, _ultimoUpdate: Date.now(),
      fase: 'luto', cooldownAte: Date.now() + 180 * 24 * 60 * 60 * 1000,
    }
  }

  return {
    fome: novaFome, higiene: novaHigiene, energia: novaEnergia, humor: novoHumor, saude: novaSaude,
    status: emCritico ? 'critico' : 'vivo',
    _criticoDesde: criticoDesde,
    _ultimoUpdate: Date.now(),
  }
}

const defaultState = {
  slotAtivo: 1, slots: [],
  criaturaId: null, nomeCustom: '', personalidade: null,
  fase: 'ovo', estagio: 0,
  fome: 100, higiene: 100, energia: 100, humor: 100, saude: 100,
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
    const uid = state._userId || 'anon'
    const key = `tama_save_${uid}_${state._slot || 1}`
    localStorage.setItem(key, JSON.stringify(state))
  } catch { /* quota */ }
}

function cacheLoad(userId, slot = 1) {
  try {
    if (!userId) return null
    const key = `tama_save_${userId}_${slot}`
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
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

  setFlags: (flags) => {
    const state = get()
    set({ flags })
    // Flags salvos apenas em localStorage — saveToCloud persiste no Supabase
    // junto com os dados da criatura (criatura_id é NOT NULL).
    cacheLocal(get())
  },

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
      fome: 100, higiene: 100, energia: 100, humor: 100, saude: 100,
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
      const status = (novaFome > 0 && state.higiene > 0 && state.energia > 0 && state.humor > 0 && state.saude > 0) ? 'vivo' : state.status
      return {
        fome: novaFome, ultimaAlimentacao: Date.now(),
        _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
        status,
      }
    })
    get().saveToCloud(get()._userId)
    if (get()._userId && !get()._isAdmin) registrarPontuacaoTamaRanking(get()._userId, PONTOS_TAMA.alimentar)
  },

  banhar: () => {
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      const novaHigiene = Math.min(100, (state.higiene || 0) + 40)
      const status = (state.fome > 0 && novaHigiene > 0 && state.energia > 0 && state.humor > 0 && state.saude > 0) ? 'vivo' : state.status
      return {
        higiene: novaHigiene, ultimaHigiene: Date.now(),
        _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
        status,
      }
    })
    get().saveToCloud(get()._userId)
    if (get()._userId && !get()._isAdmin) registrarPontuacaoTamaRanking(get()._userId, PONTOS_TAMA.banhar)
  },

  passear: (localId) => {
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      const bonus = 25
      let novaEnergia = Math.min(100, (state.energia || 0) + bonus)
      const status = (state.fome > 0 && state.higiene > 0 && novaEnergia > 0 && state.humor > 0 && state.saude > 0) ? 'vivo' : state.status
      return {
        energia: novaEnergia, ultimoPasseio: Date.now(),
        _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
        status, fase: 'criatura',
      }
    })
    get().saveToCloud(get()._userId)
    if (get()._userId && !get()._isAdmin) registrarPontuacaoTamaRanking(get()._userId, PONTOS_TAMA.passear)
  },

  brincar: () => {
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      const novoHumor = Math.min(100, (state.humor || 0) + 35)
      const status = (state.fome > 0 && state.higiene > 0 && state.energia > 0 && novoHumor > 0 && state.saude > 0) ? 'vivo' : state.status
      return {
        humor: novoHumor, ultimaBrincadeira: Date.now(),
        _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
        status, fase: 'criatura',
      }
    })
    get().saveToCloud(get()._userId)
    if (get()._userId && !get()._isAdmin) registrarPontuacaoTamaRanking(get()._userId, PONTOS_TAMA.brincar)
  },

  restaurarSaude: () => {
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      const novaSaude = Math.min(100, (state.saude || 0) + 25)
      const status = (state.fome > 0 && state.higiene > 0 && state.energia > 0 && state.humor > 0 && novaSaude > 0) ? 'vivo' : state.status
      return {
        saude: novaSaude,
        _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
        status,
      }
    })
    get().saveToCloud(get()._userId)
    if (get()._userId && !get()._isAdmin) registrarPontuacaoTamaRanking(get()._userId, PONTOS_TAMA.saude)
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
    const stateAtual = get()
    if (!stateAtual.criaturaId || (stateAtual.status !== 'vivo' && stateAtual.status !== 'critico')) return
    const horas = (Date.now() - stateAtual._ultimoUpdate) / (1000 * 60 * 60)
    const mult = stateAtual.adminFastMode ? 100 : 1

    set(state => {
      const novo = calcDecaimento(state, horas * mult)

      // Notificar quando barras ficam baixas
      const nome = state.nomeCustom || 'Kroniki'
      const limiar = 50
      const notifs = []
      if (state.fome >= limiar && novo.fome < limiar) notifs.push({ bar: 'fome', msg: `${nome} está com fome! 🍖` })
      if (state.higiene >= limiar && novo.higiene < limiar) notifs.push({ bar: 'higiene', msg: `${nome} precisa de um banho! 🧼` })
      if (state.energia >= limiar && novo.energia < limiar) notifs.push({ bar: 'energia', msg: `${nome} quer passear! ⚡` })
      if (state.humor >= limiar && novo.humor < limiar) notifs.push({ bar: 'humor', msg: `${nome} está entediado! 🎭` })
      if (state.saude >= limiar && novo.saude < limiar) notifs.push({ bar: 'saude', msg: `${nome} não está se sentindo bem! ❤️` })
      if (novo.status === 'critico' && state.status !== 'critico') notifs.push({ bar: 'critico', msg: `${nome} está em estado CRÍTICO! ⚠️` })

      if (notifs.length > 0) {
        // Notificação no site (LDINotification)
        try {
          const notifStore = useNotificationStore.getState()
          notifs.forEach(n => {
            notifStore.push(n.msg, 'ver tamagoshi', '/games/tamagoshi')
          })
        } catch (e) { /* notif store not available */ }

        // Notificação browser (Push API)
        try {
          if ('Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
            const n = notifs[0]
            navigator.serviceWorker.ready.then(sw => {
              sw.showNotification('🐉 Tamagoshi LDI', {
                body: n.msg,
                icon: '/favicon.svg',
                badge: '/favicon.svg',
                tag: 'tamagoshi',
                renotify: true,
                data: { url: '/games/tamagoshi' },
              })
            }).catch(() => {})
          }
        } catch (e) { /* sw notif failed */ }
      }

      return novo
    })
    cacheLocal(get())
  },

  saveToCloud: async (userId) => {
    const state = get()
    const uid = userId || state._userId
    cacheLocal(state)
    if (!uid) return
    // Só persiste no Supabase se tiver criatura_id (coluna NOT NULL)
    if (!state.criaturaId) return
    // Salva apenas METADADOS no Supabase — status bars são calculados via timestamp
    const payload = {
      user_id: uid, slot: state._slot || 1,
      hibernando: false,
      criatura_id: state.criaturaId, fase: state.fase, estagio: state.estagio || 0,
      ultima_alimentacao: state.ultimaAlimentacao ? new Date(state.ultimaAlimentacao).toISOString() : null,
      ultima_higiene: state.ultimaHigiene ? new Date(state.ultimaHigiene).toISOString() : null,
      ultimo_passeio: state.ultimoPasseio ? new Date(state.ultimoPasseio).toISOString() : null,
      ultima_brincadeira: state.ultimaBrincadeira ? new Date(state.ultimaBrincadeira).toISOString() : null,
      nascido_em: state.nascidoEm ? new Date(state.nascidoEm).toISOString() : null,
      status: state.status, cooldown_ate: state.cooldownAte ? new Date(state.cooldownAte).toISOString() : null,
      updated_at: new Date().toISOString(),
      inventario: state.inventario || {},
      flags: state.flags || {},
    }
    const { error } = await supabase.from('tamagoshi_saves').upsert(payload, { onConflict: 'user_id,slot' })
    if (error) console.error('[TAMA] save error:', error)
  },

  loadFromCloud: async (userId, slot = 1) => {
    // 1. Carrega do localStorage ESPECÍFICO deste usuário
    let localState = cacheLoad(userId, slot)

    if (!userId) {
      get().reset()
      return null
    }

    // 2. Carrega metadados do Supabase (criatura_id, nome, timestamps, etc.)
    const { data, error } = await supabase
      .from('tamagoshi_saves')
      .select('*')
      .eq('user_id', userId)
      .eq('hibernando', false)
      .eq('slot', slot)
      .maybeSingle()

    if (!error && data) {
      // 🛡️ SEGURANÇA: Se tem criatura_id mas NÃO aceitou o termo,
      //      auto-corrige os flags em vez de deletar (o termo foi aceito antes).
      const temCriatura = !!data.criatura_id
      const termoAceito = data.flags?.termo_aceito === true
      if (temCriatura && !termoAceito) {
        console.warn('[TAMA] dados corrompidos detectados (criatura sem termo aceito) — auto-corrigindo flags')
        data.flags = { ...(data.flags || {}), termo_aceito: true }
        await supabase.from('tamagoshi_saves').update({ flags: data.flags }).eq('user_id', userId).eq('slot', slot)
      }

      // 3. MERGE: localStorage tem as barras reais, Supabase tem os metadados
      const mapped = {
        // Metadados do Supabase (sempre atualizados)
        criaturaId: data.criatura_id,
        // Nome e personalidade reconstruídos do array CRIATURAS (não salvos no Supabase)
        nomeCustom: CRIATURAS.find(x => x.id === data.criatura_id)?.nome || data.criatura_id,
        personalidade: CRIATURAS.find(x => x.id === data.criatura_id)?.tipo || null,
        fase: data.fase, estagio: data.estagio || 0,
        ultimaAlimentacao: data.ultima_alimentacao ? new Date(data.ultima_alimentacao).getTime() : null,
        ultimaHigiene: data.ultima_higiene ? new Date(data.ultima_higiene).getTime() : null,
        ultimoPasseio: data.ultimo_passeio ? new Date(data.ultimo_passeio).getTime() : null,
        ultimaBrincadeira: data.ultima_brincadeira ? new Date(data.ultima_brincadeira).getTime() : null,
        nascidoEm: data.nascido_em ? new Date(data.nascido_em).getTime() : null,
        status: data.status, cooldownAte: data.cooldown_ate ? new Date(data.cooldown_ate).getTime() : null,
        inventario: data.inventario || {},
        flags: data.flags || {},
        _userId: userId, _slot: slot,
        // Barras do localStorage (mais recentes) ou 100 se não existir
        fome: localState?.fome ?? 100,
        higiene: localState?.higiene ?? 100,
        energia: localState?.energia ?? 100,
        humor: localState?.humor ?? 100,
        saude: localState?.saude ?? 100,
        // _ultimoUpdate real do localStorage, ou agora se não existir
        _ultimoUpdate: localState?._ultimoUpdate ?? Date.now(),
      }
      set(mapped)
      // 4. Aplica decaimento baseado no tempo desde _ultimoUpdate real
      get().calcularDecaimento()
      get().getSaldoDix(userId)
      const faseAtual = calcularFase(mapped.nascidoEm)
      if (faseAtual === 'partida' && mapped.status !== 'partida') {
        set({ fase: 'partida' })
      }
      cacheLocal(get())
      return mapped
    }
    if (error) console.error('[TAMA] Supabase error:', error.message)

    // 5. Sem dados no Supabase para este usuário
    //    Se tiver dados no localStorage com criatura, usar como fallback
    //    (auth pode não ter restaurado a sessão a tempo)
    if (localState && localState.criaturaId) {
      set({ ...localState, _userId: userId, _slot: slot })
      cacheLocal(get())
      return localState
    }
    //    Senão, reset para estado padrão
    //    NUNCA carregar localStorage de outro usuário!
    get().reset()
    set({ _userId: userId, _slot: slot, flags: localState?.flags ?? {} })
    return null
  },

  carregarSlots: async (userId) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('tamagoshi_saves')
      .select('*')
      .eq('user_id', userId)
      .order('slot', { ascending: true })
    if (error) { console.error('[TAMA] carregarSlots error:', error); return }
    const slots = data || []
    set({ slots })
    // Slot ativo = não hibernando; se todos hibernando, mantém o de menor número
    const ativo = slots.find(s => s.hibernando === false)
    if (ativo) {
      set({ slotAtivo: ativo.slot })
    } else if (slots.length > 0) {
      set({ slotAtivo: slots[0].slot })
    }
  },

  alternarSlot: async (slotIndex) => {
    const state = get()
    const slotAtual = state.slotAtivo
    if (slotAtual === slotIndex) return
    // Hibernar slot atual
    await supabase.from('tamagoshi_saves').update({ hibernando: true }).eq('user_id', state._userId).eq('slot', slotAtual)
    // Ativar slot destino
    await supabase.from('tamagoshi_saves').update({ hibernando: false }).eq('user_id', state._userId).eq('slot', slotIndex)
    set({ slotAtivo: slotIndex })
    // Recarregar save do slot destino
    await get().loadFromCloud(state._userId, slotIndex)
    // Recarregar lista de slots
    await get().carregarSlots(state._userId)
  },

  reset: () => set({ ...defaultState, _ultimoUpdate: Date.now(), _ultimoLogin: Date.now() }),

  trocarCriatura: (criaturaId) => {
    const c = CRIATURAS.find(x => x.id === criaturaId)
    if (!c) return
    set({
      criaturaId, personalidade: c.tipo, nomeCustom: c.nome,
      fase: 'criatura', estagio: 1,
      fome: 100, higiene: 100, energia: 100, humor: 100, saude: 100,
      nascidoEm: Date.now(),
      status: 'vivo',
      _ultimoUpdate: Date.now(), _ultimoLogin: Date.now(),
    })
    get().saveToCloud(get()._userId)
  },

  // ── Lazy evaluation: aplica decaimento baseado em horas desde última sessão ──
  aplicarDecaimento: (horasPassadas) => {
    const state = get()
    if (!state.criaturaId || (state.status !== 'vivo' && state.status !== 'critico')) return
    if (horasPassadas <= 0) return
    console.log(`[TAMA] aplicando decaimento de ${horasPassadas.toFixed(1)}h`)
    const novo = calcDecaimento(state, horasPassadas)
    set({ ...novo, _ultimoUpdate: Date.now() })
    get().saveToCloud(get()._userId)
    cacheLocal(get())
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
    get().saveToCloud(uid) // flags salvas no Supabase via saveToCloud
    if (!get()._isAdmin) registrarPontuacaoTamaRanking(uid, PONTOS_TAMA.login, true)
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
    get().saveToCloud(uid) // inventario salvo no Supabase via saveToCloud
  },

  consumirItem: async (itemId) => {
    const inv = { ...(get().inventario || {}) }
    if (!inv[itemId] || inv[itemId] <= 0) throw new Error('item não disponível no inventário')
    inv[itemId]--
    if (inv[itemId] <= 0) delete inv[itemId]
    set({ inventario: inv })
    get().saveToCloud(get()._userId)
  },

  // === LIFECYCLE ===

  verificarFase: async () => {
    const state = get()
    if (!state.nascidoEm) return 'ovo'
    const fase = calcularFase(state.nascidoEm)
    if (fase !== state._faseAtual && state._userId) {
      // Registrar evento de evolução de fase (exceto 'ovo' inicial)
      const faseLabel = { filhote: 'Filhote', jovem: 'Jovem', adulto: 'Adulto', veterano: 'Veterano', anciao: 'Ancião', partida: 'Partida' }
      if (faseLabel[fase]) {
        const { data: existente } = await supabase.from('perfil_eventos')
          .select('id').eq('user_id', state._userId).eq('tipo', 'tama_fase').eq('descricao', `Tamagoshi evoluiu para ${faseLabel[fase]}`).limit(1)
        if (!existente || existente.length === 0) {
          await supabase.from('perfil_eventos').insert({
            user_id: state._userId, tipo: 'tama_fase', descricao: `Tamagoshi evoluiu para ${faseLabel[fase]}`, valor: 1,
          })
          console.log(`[Eventos] registrado: tama_fase — Tamagoshi evoluiu para ${faseLabel[fase]}`)
        }
      }
      set({ _faseAtual: fase })
    }
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
    if (!get()._isAdmin) registrarPontuacaoTamaRanking(uid, PONTOS_TAMA.fase, true)
    return badge
  },

  executarPartida: async (userId) => {
    const uid = userId || get()._userId
    if (!uid) return
    const state = get()
    const { data: badges } = await supabase.from('tamagoshi_badges')
      .select('badge_id').eq('user_id', uid).eq('criatura_id', state.criaturaId)
    const badgeIds = (badges || []).map(b => b.badge_id)
    const diasVividos = state.nascidoEm ? Math.floor((Date.now() - state.nascidoEm) / 86400000) : 0
    await supabase.from('tamagoshi_fama').insert({
      user_id: uid, criatura_id: state.criaturaId,
      nome_custom: state.nomeCustom, fase_final: 'anciao',
      badges: badgeIds, dias_vividos: diasVividos, motivo: 'partida',
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
      status: 'partida', fase: 'partida', fome: 0, higiene: 0, energia: 0, humor: 0, saude: 0,
    })
    get().saveToCloud(uid)
    cacheLocal(get())
    if (!get()._isAdmin) registrarPontuacaoTamaRanking(uid, PONTOS_TAMA.partida, true)
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
      nascido_em: agora.toISOString(),
      ultima_alimentacao: null, ultima_higiene: null, ultimo_passeio: null, ultima_brincadeira: null,
      status: 'vivo',
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
