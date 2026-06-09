import { TAMA_VERSION } from '../../../config/version'
console.log(`[TAMA] versão carregada: ${TAMA_VERSION}`)

import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'
import { calcularFase, BADGES, DIX_POR_ACAO, DIX_LOGIN_DIARIO, TEXTOS_PARTIDA, DIX_BOAS_VINDAS } from '../data/moedas'
import { CRIATURAS } from '../data/criaturas'
import { useNotificationStore } from '../../../store/notificationStore'

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
      fase: 'luto', cooldownAte: Date.now() + 24 * 60 * 60 * 1000,
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
    const key = `tama_save_${state._slot || 1}`
    localStorage.setItem(key, JSON.stringify(state))
  } catch { /* quota */ }
}

function cacheLoad(slot = 1) {
  try {
    const raw = localStorage.getItem(`tama_save_${slot}`)
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
  },

  restaurarSaude: () => {
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      const novaSaude = Math.min(100, (state.saude || 0) + 50)
      const status = (state.fome > 0 && state.higiene > 0 && state.energia > 0 && state.humor > 0 && novaSaude > 0) ? 'vivo' : state.status
      return {
        saude: novaSaude,
        _criticoDesde: status === 'vivo' ? null : state._criticoDesde,
        status,
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

  saveToCloud: (userId) => {
    const state = get()
    cacheLocal(state)
    // ── Sistema timestamp-only: não salvamos mais status individuais no Supabase ──
  },

  loadFromCloud: async (userId, slot = 1) => {
    const local = cacheLoad(slot)
    if (local) {
      set({ ...local, _isAdmin: get()._isAdmin, adminFastMode: get().adminFastMode, _userId: userId, _slot: slot })
      get().calcularDecaimento()
      get().getSaldoDix(userId)
      const faseAtual = calcularFase(local.nascidoEm)
      if (faseAtual === 'partida' && local.status !== 'partida') {
        set({ fase: 'partida' })
      }
      return local
    }
    return null
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
    cacheLocal(get())
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
    cacheLocal(get())
  },

  consumirItem: async (itemId) => {
    const inv = { ...(get().inventario || {}) }
    if (!inv[itemId] || inv[itemId] <= 0) throw new Error('item não disponível no inventário')
    inv[itemId]--
    if (inv[itemId] <= 0) delete inv[itemId]
    set({ inventario: inv })
    cacheLocal(get())
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

  verificarBadge: (userId, fase) => {
    // Badges desativadas — sistema timestamp-only
    const badge = BADGES[fase]
    return badge || null
  },

  executarPartida: () => {
    set({
      status: 'partida', fase: 'partida', fome: 0, higiene: 0, energia: 0, humor: 0, saude: 0,
    })
    cacheLocal(get())
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

  proporTroca: () => {
    throw new Error('sistema de trocas desativado — modo timestamp-only')
  },

  confirmarTroca: () => {
    throw new Error('sistema de trocas desativado — modo timestamp-only')
  },
}))
