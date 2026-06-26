import { TAMA_VERSION } from '../../../../config/version'
console.log(`[TAMA] versao carregada: ${TAMA_VERSION}`)

import { create } from 'zustand'
import { supabase } from '../../../../lib/supabase'
import { registrarPontuacaoTamaRanking } from '../../../../hooks/useLeaderboardDB'
import { calcularFase, BADGES, DIX_LOGIN_DIARIO, DIX_BOAS_VINDAS } from '../data/moedas'
import { CRIATURAS } from '../data/criaturas'
import { useNotificationStore } from '../../../../store/notificationStore'

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

// --- Taxas de decaimento por dia da semana ---
// Cada dia foca em uma barra (decai mais rapido); fim de semana = 2 aleatorias
const BASE_DECAY = { fome: 0.6, higiene: 0.5, energia: 0.6, humor: 0.4, saude: 0.4 }
const FOCUSED_EXTRA = 2.0

const BARRA_PARA_CAMPO = {
  fome: 'ultima_alimentacao',
  higiene: 'ultima_higiene',
  energia: 'ultimo_passeio',
  humor: 'ultima_brincadeira',
  saude: 'ultima_saude',
}

function getFocusedBars() {
  const day = new Date().getDay()
  const schedule = {
    0: null, 1: ['fome'], 2: ['higiene'], 3: ['energia'],
    4: ['humor'], 5: ['saude'], 6: null,
  }
  const bars = schedule[day]
  if (bars === null) {
    const all = ['fome', 'higiene', 'energia', 'humor', 'saude']
    const shuffled = [...all].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 2)
  }
  return bars
}

function getTaxa(barra, personalidade) {
  const focusedBars = getFocusedBars()
  const indepMult = personalidade === 'INDEPENDENTE' ? 0.8 : 1
  const carenteHumor = personalidade === 'CARENTE' && barra === 'humor' ? 1.2 : 1
  const isFocused = focusedBars.includes(barra)
  const base = isFocused ? BASE_DECAY[barra] + FOCUSED_EXTRA : BASE_DECAY[barra]
  return base * indepMult * carenteHumor
}

// Calcula o valor atual de uma barra a partir do timestamp da ultima acao
function calcBarra(barra, save, personalidade) {
  const campo = BARRA_PARA_CAMPO[barra]
  const ancora = save[campo] || save.nascido_em
  if (!ancora) return 100
  const horas = (Date.now() - new Date(ancora).getTime()) / 3600000
  const taxa = getTaxa(barra, personalidade)
  return Math.max(0, Math.min(100, 100 - Math.floor(taxa * horas)))
}

// Calcula todas as barras + status (vivo/critico/morto) a partir do save
function calcEstado(save, personalidade) {
  if (!save || !save.criatura_id) return null
  if (save.status === 'morto' || save.status === 'partida') {
    return {
      fome: 0, higiene: 0, energia: 0, humor: 0, saude: 0,
      status: save.status,
    }
  }

  const barras = {
    fome: calcBarra('fome', save, personalidade),
    higiene: calcBarra('higiene', save, personalidade),
    energia: calcBarra('energia', save, personalidade),
    humor: calcBarra('humor', save, personalidade),
    saude: calcBarra('saude', save, personalidade),
  }

  // FOFO: humor nao cai abaixo de 20 se o dono logou nas ultimas 12h
  if (personalidade === 'FOFO' && save.updated_at) {
    const horasSemDono = (Date.now() - new Date(save.updated_at).getTime()) / 3600000
    if (horasSemDono < 12) barras.humor = Math.max(20, barras.humor)
  }

  const todasZeradas = Object.values(barras).every(v => v <= 0)

  if (todasZeradas) {
    // --- Calculo retroativo: quando a ultima barra zerou ---
    let momentoZeroMax = 0
    for (const barra of Object.keys(BARRA_PARA_CAMPO)) {
      const campo = BARRA_PARA_CAMPO[barra]
      const ancora = save[campo] || save.nascido_em
      if (!ancora) continue
      const taxa = getTaxa(barra, personalidade)
      if (taxa <= 0) continue
      const ancoraMs = new Date(ancora).getTime()
      const horasParaZerar = 100 / taxa
      const momentoZero = ancoraMs + horasParaZerar * 3600000
      if (momentoZero > momentoZeroMax) momentoZeroMax = momentoZero
    }

    const horasEmCritico = momentoZeroMax > 0 ? (Date.now() - momentoZeroMax) / 3600000 : 0

    if (horasEmCritico >= 24) {
      return { ...barras, status: 'morto' }
    }
    return { ...barras, status: 'critico' }
  }

  return { ...barras, status: 'vivo' }
}

const defaultState = {
  slotAtivo: 1, slots: [],
  criaturaId: null, nomeCustom: '', personalidade: null,
  fase: 'ovo', estagio: 0,
  fome: 100, higiene: 100, energia: 100, humor: 100, saude: 100,
  ultimaAlimentacao: null, ultimaHigiene: null, ultimoPasseio: null,
  ultimaBrincadeira: null, ultimaSaude: null,
  nascidoEm: null, status: null,
  cooldownAte: null,
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
    return raw ? JSON.parse(raw) : null
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
    set({ flags })
    cacheLocal(get())
    const uid = get()._userId
    if (uid && get().criaturaId) {
      supabase.from('tamagoshi_saves').update({
        flags,
        updated_at: new Date().toISOString(),
      }).eq('user_id', uid).eq('slot', get()._slot || 1).then(({ error }) => {
        if (error) console.error('[TAMA] setFlags error:', error)
      })
    }
  },

  eclodir: () => {
    set({ fase: 'selecao' })
    cacheLocal(get())
  },

  // criaturaId e SEMPRE number (CRIATURAS_BASE.id)
  escolherCriatura: (criaturaId) => {
    const id = Number(criaturaId)
    const c = CRIATURAS.find(x => x.id === id)
    if (!c) return
    const agora = Date.now()
    set({
      criaturaId: id, personalidade: c.tipo, nomeCustom: c.nome,
      fase: 'criatura', estagio: 1,
      fome: 100, higiene: 100, energia: 100, humor: 100, saude: 100,
      nascidoEm: agora,
      ultimaAlimentacao: agora, ultimaHigiene: agora, ultimoPasseio: agora,
      ultimaBrincadeira: agora, ultimaSaude: agora,
      status: 'vivo',
    })
    get().saveToCloud(get()._userId)
  },

  setNomeCustom: () => {
    // Nomes sao fixos por criatura - nao ha customizacao de nome.
    console.warn('[TAMA] setNomeCustom chamado mas nome nao e customizavel')
  },

  // --- Acoes de cuidado ---

  alimentar: () => {
    const uid = get()._userId
    const agora = Date.now()
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      return { ultimaAlimentacao: agora, fome: 100 }
    })
    get().recalcular()
    get().saveToCloud(uid)
    if (uid && !get()._isAdmin) registrarPontuacaoTamaRanking(uid, PONTOS_TAMA.alimentar)
  },

  banhar: () => {
    const uid = get()._userId
    const agora = Date.now()
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      return { ultimaHigiene: agora, higiene: 100 }
    })
    get().recalcular()
    get().saveToCloud(uid)
    if (uid && !get()._isAdmin) registrarPontuacaoTamaRanking(uid, PONTOS_TAMA.banhar)
  },

  passear: () => {
    const uid = get()._userId
    const agora = Date.now()
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      return { ultimoPasseio: agora, energia: 100, fase: 'criatura' }
    })
    get().recalcular()
    get().saveToCloud(uid)
    if (uid && !get()._isAdmin) registrarPontuacaoTamaRanking(uid, PONTOS_TAMA.passear)
  },

  brincar: () => {
    const uid = get()._userId
    const agora = Date.now()
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      return { ultimaBrincadeira: agora, humor: 100, fase: 'criatura' }
    })
    get().recalcular()
    get().saveToCloud(uid)
    if (uid && !get()._isAdmin) registrarPontuacaoTamaRanking(uid, PONTOS_TAMA.brincar)
  },

  restaurarSaude: () => {
    const uid = get()._userId
    const agora = Date.now()
    set(state => {
      if (state.status !== 'vivo' && state.status !== 'critico') return state
      return { ultimaSaude: agora, saude: 100 }
    })
    get().recalcular()
    get().saveToCloud(uid)
    if (uid && !get()._isAdmin) registrarPontuacaoTamaRanking(uid, PONTOS_TAMA.saude)
  },

  // --- Recalculo (substitui calcularDecaimento + tick) ---
  // Recalcula barras + status a partir dos timestamps de acao.
  // Stateless: sempre confia nos timestamps, ignora qualquer
  // estado de barra anterior em memoria/localStorage.
  recalcular: () => {
    const state = get()
    if (!state.criaturaId) return

    const save = {
      criatura_id: state.criaturaId,
      status: state.status,
      ultima_alimentacao: state.ultimaAlimentacao ? new Date(state.ultimaAlimentacao).toISOString() : null,
      ultima_higiene: state.ultimaHigiene ? new Date(state.ultimaHigiene).toISOString() : null,
      ultimo_passeio: state.ultimoPasseio ? new Date(state.ultimoPasseio).toISOString() : null,
      ultima_brincadeira: state.ultimaBrincadeira ? new Date(state.ultimaBrincadeira).toISOString() : null,
      ultima_saude: state.ultimaSaude ? new Date(state.ultimaSaude).toISOString() : null,
      nascido_em: state.nascidoEm ? new Date(state.nascidoEm).toISOString() : null,
      updated_at: state._ultimoLogin ? new Date(state._ultimoLogin).toISOString() : null,
    }

    const novo = calcEstado(save, state.personalidade)
    if (!novo) return

    const statusAnterior = state.status
    let extra = {}
    if (novo.status === 'morto' && statusAnterior !== 'morto') {
      extra = { fase: 'luto', cooldownAte: Date.now() + 180 * 24 * 60 * 60 * 1000 }
    }

    set({ ...novo, ...extra })

    // Notificacoes (apenas se mudou de vivo->critico ou barras baixas)
    if (novo.status === 'critico' && statusAnterior === 'vivo') {
      try {
        const nome = CRIATURAS.find(c => c.id === state.criaturaId)?.nome || '???'
        const locale = (() => { try { return localStorage.getItem('ldi-locale') || 'pt' } catch { return 'pt' } })()
        const CRIT_TEXTS = {
          pt: '{nome} estÃ¡ em estado CRÃTICO! âš ï¸',
          en: '{nome} is in critical condition! âš ï¸',
          es: 'Â¡{nome} estÃ¡ en estado CRÃTICO! âš ï¸',
        }
        const critMsg = (CRIT_TEXTS[locale] || CRIT_TEXTS.pt).replace('{nome}', nome)
        useNotificationStore.getState().push(critMsg, 'ver tamagoshi', '/games/tamagoshi')
        if ('Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(sw => {
            sw.showNotification('ðŸ‰ Tamagoshi LDI', {
              body: critMsg,
              icon: '/favicon.svg', badge: '/favicon.svg',
              tag: 'tamagoshi', renotify: true,
              data: { url: '/games/tamagoshi' },
            })
          }).catch(() => {})
        }
      } catch { /* notif unavailable */ }
    }

    cacheLocal(get())
  },

  saveToCloud: async (userId) => {
    const state = get()
    const uid = userId || state._userId
    cacheLocal(state)
    if (!uid || !state.criaturaId) return

    const payload = {
      user_id: uid, slot: state._slot || 1,
      hibernando: false,
      criatura_id: state.criaturaId,
      fase: state.fase, estagio: state.estagio || 0,
      status: state.status,
      ultima_alimentacao: state.ultimaAlimentacao ? new Date(state.ultimaAlimentacao).toISOString() : null,
      ultima_higiene: state.ultimaHigiene ? new Date(state.ultimaHigiene).toISOString() : null,
      ultimo_passeio: state.ultimoPasseio ? new Date(state.ultimoPasseio).toISOString() : null,
      ultima_brincadeira: state.ultimaBrincadeira ? new Date(state.ultimaBrincadeira).toISOString() : null,
      ultima_saude: state.ultimaSaude ? new Date(state.ultimaSaude).toISOString() : null,
      nascido_em: state.nascidoEm ? new Date(state.nascidoEm).toISOString() : null,
      cooldown_ate: state.cooldownAte ? new Date(state.cooldownAte).toISOString() : null,
      updated_at: new Date().toISOString(),
      inventario: state.inventario || {},
      flags: state.flags || {},
    }
    const { error } = await supabase.from('tamagoshi_saves').upsert(payload, { onConflict: 'user_id,slot' })
    if (error) console.error('[TAMA] save error:', error)
  },

  loadFromCloud: async (userId, slot = 1) => {
    if (!userId) { get().reset(); return null }

    const { data, error } = await supabase
      .from('tamagoshi_saves')
      .select('*')
      .eq('user_id', userId)
      .eq('hibernando', false)
      .eq('slot', slot)
      .maybeSingle()

    if (error) console.error('[TAMA] Supabase error:', error.message)

    if (!data || !data.criatura_id) {
      get().reset()
      set({ _userId: userId, _slot: slot, flags: {} })
      return null
    }

    const criatura = CRIATURAS.find(c => c.id === data.criatura_id)

    const mapped = {
      criaturaId: data.criatura_id,
      nomeCustom: criatura?.nome || `#${data.criatura_id}`,
      personalidade: criatura?.tipo || null,
      fase: data.fase, estagio: data.estagio || 0,
      ultimaAlimentacao: data.ultima_alimentacao ? new Date(data.ultima_alimentacao).getTime() : null,
      ultimaHigiene: data.ultima_higiene ? new Date(data.ultima_higiene).getTime() : null,
      ultimoPasseio: data.ultimo_passeio ? new Date(data.ultimo_passeio).getTime() : null,
      ultimaBrincadeira: data.ultima_brincadeira ? new Date(data.ultima_brincadeira).getTime() : null,
      ultimaSaude: data.ultima_saude ? new Date(data.ultima_saude).getTime() : null,
      nascidoEm: data.nascido_em ? new Date(data.nascido_em).getTime() : null,
      status: data.status,
      cooldownAte: data.cooldown_ate ? new Date(data.cooldown_ate).getTime() : null,
      inventario: data.inventario || {},
      flags: data.flags || {},
      _userId: userId, _slot: slot,
      _ultimoLogin: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
    }

    set(mapped)
    get().recalcular()
    get().getSaldoDix(userId)

    const faseAtual = calcularFase(mapped.nascidoEm)
    if (faseAtual === 'partida' && mapped.status !== 'partida') {
      set({ fase: 'partida' })
    }

    cacheLocal(get())
    return mapped
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
    const ativo = slots.find(s => s.hibernando === false)
    if (ativo) set({ slotAtivo: ativo.slot })
    else if (slots.length > 0) set({ slotAtivo: slots[0].slot })
  },

  alternarSlot: async (slotIndex) => {
    const state = get()
    const slotAtual = state.slotAtivo
    if (slotAtual === slotIndex) return
    await supabase.from('tamagoshi_saves').update({ hibernando: true }).eq('user_id', state._userId).eq('slot', slotAtual)
    await supabase.from('tamagoshi_saves').update({ hibernando: false }).eq('user_id', state._userId).eq('slot', slotIndex)
    set({ slotAtivo: slotIndex })
    await get().loadFromCloud(state._userId, slotIndex)
    await get().carregarSlots(state._userId)
  },

  reset: () => set({ ...defaultState }),

  // criaturaId e SEMPRE number
  trocarCriatura: (criaturaId) => {
    const id = Number(criaturaId)
    const c = CRIATURAS.find(x => x.id === id)
    if (!c) return
    const agora = Date.now()
    set({
      criaturaId: id, personalidade: c.tipo, nomeCustom: c.nome,
      fase: 'criatura', estagio: 1,
      fome: 100, higiene: 100, energia: 100, humor: 100, saude: 100,
      nascidoEm: agora,
      ultimaAlimentacao: agora, ultimaHigiene: agora, ultimoPasseio: agora,
      ultimaBrincadeira: agora, ultimaSaude: agora,
      status: 'vivo',
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
    if (!uid) throw new Error('usuario nao autenticado')
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
    await get().ganharDix(uid, DIX_LOGIN_DIARIO, 'login diario')
    const novasFlags = { ...get().flags, _dixHoje: hoje }
    set({ _ultimoLoginDix: Date.now(), flags: novasFlags })
    get().saveToCloud(uid)
    if (!get()._isAdmin) registrarPontuacaoTamaRanking(uid, PONTOS_TAMA.login, true)
    return true
  },

  // === INVENTORY ===

  comprarItem: async (userId, itemId, preco) => {
    const uid = userId || get()._userId
    if (!uid) throw new Error('usuario nao autenticado')
    await get().gastarDix(uid, preco, `compra: ${itemId}`)
    const inv = { ...(get().inventario || {}) }
    inv[itemId] = (inv[itemId] || 0) + 1
    set({ inventario: inv })
    get().saveToCloud(uid)
  },

  consumirItem: async (itemId) => {
    const inv = { ...(get().inventario || {}) }
    if (!inv[itemId] || inv[itemId] <= 0) throw new Error('item nao disponivel no inventario')
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
      if (fase) {
        const descricao = `tama_fase_${fase}`
        const { data: existente } = await supabase.from('perfil_eventos')
          .select('id').eq('user_id', state._userId).eq('tipo', 'tama_fase').eq('descricao', descricao).limit(1)
        if (!existente || existente.length === 0) {
          await supabase.from('perfil_eventos').insert({
            user_id: state._userId, tipo: 'tama_fase', descricao, valor: 1,
          })
          console.log(`[Eventos] registrado: tama_fase -- ${descricao}`)
        }
      }
      set({ _faseAtual: fase })
    }
    if (fase === 'partida') set({ fase: 'partida' })
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
      fase_final: 'anciao',
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
    set({ status: 'partida', fase: 'partida', fome: 0, higiene: 0, energia: 0, humor: 0, saude: 0 })
    get().saveToCloud(uid)
    cacheLocal(get())
    if (!get()._isAdmin) registrarPontuacaoTamaRanking(uid, PONTOS_TAMA.partida, true)
  },

  // === TRADE SYSTEM ===

  gerarKeyTroca: () => crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase(),

  verificarPermissaoTroca: (tama, tier) => {
    const agora = new Date()
    const ultimaTroca = tama.ultima_troca ? new Date(tama.ultima_troca) : null

    if (tier === 'free' || !tier) {
      if (ultimaTroca) {
        const diasDesde = (agora - ultimaTroca) / 86400000
        if (diasDesde < 90) {
          const restam = Math.ceil(90 - diasDesde)
          const err = new Error('FREE_COOLDOWN')
          err.params = { dias: restam }
          throw err
        }
      }
    }

    if (tier === 'elite') {
      if (ultimaTroca) {
        const mesUltima = `${ultimaTroca.getMonth()}-${ultimaTroca.getFullYear()}`
        const mesAgora = `${agora.getMonth()}-${agora.getFullYear()}`
        if (mesUltima === mesAgora) throw new Error('ELITE_MES_USED')
      }
    }

    if (tier === 'primordial') {
      if (ultimaTroca) {
        const diasDesde = (agora - ultimaTroca) / 86400000
        if (diasDesde < 15) {
          const restam = Math.ceil(15 - diasDesde)
          const err = new Error('PRIMORDIAL_COOLDOWN')
          err.params = { dias: restam }
          throw err
        }
      }
      const mesUltima = ultimaTroca ? `${ultimaTroca.getMonth()}-${ultimaTroca.getFullYear()}` : null
      const mesAgora = `${agora.getMonth()}-${agora.getFullYear()}`
      if (mesUltima === mesAgora && (tama.trocas_no_mes || 0) >= 2) {
        throw new Error('PRIMORDIAL_MES_USED')
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
    if (err || !tama) throw new Error('TAMA_NAO_ENCONTRADO')
    if (tama.status !== 'vivo') throw new Error('TAMA_PRECISA_VIVO')

    const key = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()

    const { error: insertErr } = await supabase.from('tamagoshi_trocas').insert({
      key,
      user_id_a: userId,
      slot_a: slotA,
      criatura_id_a: tama.criatura_id,
      status: 'pendente',
      expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    if (insertErr) throw new Error('ERRO_CRIAR_PEDIDO')
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
    if (err || !troca) throw new Error('KEY_INVALIDA_EXPIRADA')
    if (troca.user_id_a === userId) throw new Error('TROCAR_CONSIGO_MESMO')

    const [tamaA, tamaB] = await Promise.all([
      supabase.from('tamagoshi_saves').select('*').eq('user_id', troca.user_id_a).eq('slot', troca.slot_a).maybeSingle(),
      supabase.from('tamagoshi_saves').select('*').eq('user_id', userId).eq('slot', slotB).maybeSingle(),
    ])
    if (!tamaA.data || !tamaB.data) throw new Error('TAMA_NAO_ENCONTRADO')
    if (tamaA.data.status !== 'vivo' || tamaB.data.status !== 'vivo') throw new Error('AMBOS_PRECISAM_VIVOS')

    const { data: perfilA } = await supabase.from('profiles').select('role').eq('id', troca.user_id_a).maybeSingle()
    const tierA = perfilA?.role || 'free'

    const isMesmoMes = (a, b) => a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
    const calcularNovoContador = (tama, agora) => {
      const ult = tama.ultima_troca ? new Date(tama.ultima_troca) : null
      if (!ult || !isMesmoMes(ult, agora)) return 1
      return (tama.trocas_no_mes || 0) + 1
    }

    const agora = new Date()
    try { get().verificarPermissaoTroca(tamaA.data, tierA) } catch (e) { const err = new Error('DONO_A_ERRO'); err.inner = e; err.innerParams = e.params; throw err }
    try { get().verificarPermissaoTroca(tamaB.data, tierB) } catch (e) { const err = new Error('VOCE_ERRO'); err.inner = e; err.innerParams = e.params; throw err }

    const resetFields = {
      fase: 'criatura', estagio: 1, status: 'vivo',
      nascido_em: agora.toISOString(),
      ultima_alimentacao: agora.toISOString(),
      ultima_higiene: agora.toISOString(),
      ultimo_passeio: agora.toISOString(),
      ultima_brincadeira: agora.toISOString(),
      ultima_saude: agora.toISOString(),
      ultima_troca: agora.toISOString(),
    }

    await supabase.from('tamagoshi_saves').update({
      criatura_id: tamaB.data.criatura_id,
      ...resetFields,
      trocas_no_mes: calcularNovoContador(tamaA.data, agora),
    }).eq('user_id', troca.user_id_a).eq('slot', troca.slot_a)

    await supabase.from('tamagoshi_saves').update({
      criatura_id: tamaA.data.criatura_id,
      ...resetFields,
      trocas_no_mes: calcularNovoContador(tamaB.data, agora),
    }).eq('user_id', userId).eq('slot', slotB)

    await supabase.from('tamagoshi_trocas').update({
      status: 'confirmado',
      user_id_b: userId,
      slot_b: slotB,
      confirmado_em: agora.toISOString(),
    }).eq('key', key)

    return { criaturaId: tamaA.data.criatura_id }
  },
}))
