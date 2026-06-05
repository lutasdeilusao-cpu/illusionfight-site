const JACK_VERSION = '4.0.14'
console.log(`[JACK] versão carregada: ${JACK_VERSION}`)

import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'
import { ITENS } from '../data/itens'
import { MONOLOGUES } from '../data/monologues'
import { FLAGS } from '../data/flags'

// Cache local — NUNCA fonte de verdade, só acelera leitura
function cacheLocal(state) {
  try {
    if (!state._slot) return
    localStorage.setItem(`jack_cache_${state._slot}`, JSON.stringify({
      cervejas: state.cervejas, cervejasPorSegundo: state.cervejasPorSegundo, cervejasTotais: state.cervejasTotais,
      fragmentos: state.fragmentos, notas: state.notas, fase: state.fase, flags: state.flags,
      hpAtual: state.hpAtual, hpMax: state.hpMax, nivel: state.nivel, xp: state.xp,
      inventario: state.inventario, equipado: state.equipado,
      dungeonsCompletas: state.dungeonsCompletas, tempoJogo: state.tempoJogo, titleDone: state.titleDone,
      cidadeAtual: state.cidadeAtual, periodo: state.periodo,
      medidorPrimordial: state.medidorPrimordial, aliadoAtual: state.aliadoAtual,
      casoAtivo: state.casoAtivo, pistasColetadas: state.pistasColetadas,
      suspeitos: state.suspeitos, locaisVisitados: state.locaisVisitados,
      acusacoesErradas: state.acusacoesErradas, casosResolvidos: state.casosResolvidos,
    }))
  } catch (_) {}
}

function cacheLoad(slot) {
  try {
    const raw = localStorage.getItem(`jack_cache_${slot}`)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return null
}

const defaultState = {
  cervejas: 0, cervejasPorSegundo: 1, cervejasTotais: 0,
  fragmentos: 0, notas: 0,
  hpAtual: 20, hpMax: 20, nivel: 1, xp: 0,
  fase: 'intro', flags: {}, dungeonsCompletas: [],
  inventario: [], equipado: { arma: null, armadura: null, acessorio: null },
  tempoJogo: 0, titleDone: false, monologoAtual: null,
  cidadeAtual: 'marelia', periodo: 'DIA',
  medidorPrimordial: 0, aliadoAtual: null,
  casoAtivo: null, pistasColetadas: [], suspeitos: [],
  locaisVisitados: [], acusacoesErradas: 0, casosResolvidos: [],
  _userId: null, _slot: null, _savePending: false, _resultCard: null,
  _retornoInvestigacao: false, _localPendente: null, _casoPreview: null,
}

let saveTimeout = null
function debouncedSave() {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    const state = useJackStore.getState()
    if (state._userId) state.saveToCloud(state._userId)
  }, 2000)
}

export const useJackStore = create((set, get) => {
  return {
    ...defaultState,

    // === AUTO-SAVE TRIGGERS ===
    _autoSave: () => {
      const state = get()
      if (state._userId) cacheLocal(state)
      debouncedSave()
    },

    tick: () => set(state => ({
      cervejas: state.cervejas + state.cervejasPorSegundo,
      cervejasTotais: state.cervejasTotais + state.cervejasPorSegundo,
      tempoJogo: state.tempoJogo + 1,
    })),

    regenHp: () => set(state => {
      if (state.hpAtual >= state.hpMax || state.fase?.startsWith('dungeon')) return state
      return { hpAtual: Math.min(state.hpMax, state.hpAtual + 1) }
    }),

    ganharCervejas: (qtd) => set(state => ({ cervejas: state.cervejas + qtd, cervejasTotais: state.cervejasTotais + qtd })),
    ganharFragmentos: (qtd) => set(state => ({ fragmentos: state.fragmentos + qtd })),
    setHpAtual: (hp) => set(state => ({ hpAtual: Math.min(state.hpMax, Math.max(0, hp)) })),
    gastar: (qtd) => set(state => ({ cervejas: Math.max(0, state.cervejas - qtd) })),
    gastarNotas: (qtd) => set(state => ({ notas: Math.max(0, state.notas - qtd) })),
    gastarFragmentos: (qtd) => set(state => ({ fragmentos: Math.max(0, state.fragmentos - qtd) })),
    setFlag: (flag) => {
      set(state => ({ flags: { ...state.flags, [flag]: true } }))
      get()._autoSave()
    },
    setFase: (fase) => {
      set({ fase })
      get()._autoSave()
    },
    showResultCard: (data) => set({ _resultCard: data }),
    hideResultCard: () => set({ _resultCard: null }),
    setMonologo: (text) => set({ monologoAtual: text }),
    limparMonologo: () => set({ monologoAtual: null }),
    setTitleDone: () => set({ titleDone: true }),
    setCidade: (cid) => set({ cidadeAtual: cid }),

    alternarPeriodo: () => set(state => ({
      periodo: state.periodo === 'DIA' ? 'NOITE' : 'DIA',
      monologoAtual: state.periodo === 'DIA' ? MONOLOGUES.dia_anoitece : MONOLOGUES.noite_amanhece,
    })),

    setAliado: (aliado) => set({ aliadoAtual: aliado }),
    limparAliado: () => set({ aliadoAtual: null }),
    incrementarMedidor: () => set(state => {
      const novo = Math.min(10, state.medidorPrimordial + 1)
      return { medidorPrimordial: novo }
    }),
    zerarMedidor: () => set({ medidorPrimordial: 0 }),

    // === Investigação ===
    iniciarCaso: (casoId, suspeitosIniciais) => {
      set({
        casoAtivo: casoId,
        pistasColetadas: [],
        suspeitos: suspeitosIniciais.map(s => ({ ...s, status: 'ativo' })),
        locaisVisitados: [],
        acusacoesErradas: 0,
        fase: 'dossier',
      })
      get()._autoSave()
    },

    coletarPista: (pistaId) => {
      set(state => ({ pistasColetadas: [...state.pistasColetadas, pistaId] }))
      get()._autoSave()
    },

    visitarLocal: (localId) => set(state => ({
      locaisVisitados: [...state.locaisVisitados, localId],
    })),

    eliminarSuspeito: (suspeitoId) => set(state => ({
      suspeitos: state.suspeitos.map(s =>
        s.id === suspeitoId ? { ...s, status: 'eliminado' } : s
      ),
    })),

    acusar: (suspeitoId) => {
      set(state => ({
        suspeitos: state.suspeitos.map(s =>
          s.id === suspeitoId ? { ...s, status: 'acusado' } : s
        ),
      }))
      get()._autoSave()
      return get()
    },

    acusacaoErrada: () => set(state => ({
      acusacoesErradas: state.acusacoesErradas + 1,
      cervejas: Math.max(0, state.cervejas - 50),
      monologoAtual: 'errei. típico. pelo menos não cobrei adiantado.',
    })),

    resolverCaso: (flagResolucao) => {
      set(state => ({
        casosResolvidos: [...state.casosResolvidos, state.casoAtivo],
        flags: { ...state.flags, [flagResolucao]: true },
        casoAtivo: null, pistasColetadas: [], suspeitos: [],
        locaisVisitados: [], acusacoesErradas: 0,
      }))
      get()._autoSave()
    },

    ganharCapangas: (qtd) => { get().ganharCervejas(qtd) },
    comprarBengala: () => { get().comprarItem('bengala_steampunk') },

    comprarItem: (itemId) => {
      const item = ITENS[itemId]
      if (!item) return
      const state = get()
      let pode = false
      if (item.moeda === 'nota') pode = state.notas >= item.preco
      else if (item.moeda === 'fragmento') pode = state.fragmentos >= item.preco
      else pode = state.cervejas >= item.preco
      if (!pode) return
      set(state => {
        let novoState = {}
        if (item.moeda === 'nota') novoState.notas = state.notas - item.preco
        else if (item.moeda === 'fragmento') novoState.fragmentos = state.fragmentos - item.preco
        else novoState.cervejas = state.cervejas - item.preco
        if (item.cura) novoState.hpAtual = Math.min(state.hpMax, state.hpAtual + item.cura)
        if (item.capPerSeg) novoState.cervejasPorSegundo = state.cervejasPorSegundo + item.capPerSeg
        if (item.hpMaxBonus) { novoState.hpMax = state.hpMax + item.hpMaxBonus; novoState.hpAtual = state.hpAtual + item.hpMaxBonus }
        if (item.dano || item.slot) {
          const slot = item.slot || 'arma'
          const eq = { ...state.equipado[slot], id: item.id, nome: item.nome, dano: (item.dano || 0) }
          if (item.reducaoDano) eq.reducaoDano = item.reducaoDano
          novoState.equipado = { ...state.equipado, [slot]: eq }
        }
        if (item.danoBonus) {
          const arma = state.equipado.arma
          novoState.equipado = { ...state.equipado, arma: { ...arma, dano: (arma?.dano || 0) + item.danoBonus } }
        }
        if (item.id === 'bengala_steampunk') {
          novoState.flags = { ...state.flags, TEM_BENGALA: true }
          novoState.fase = 'vila'
          novoState.monologoAtual = MONOLOGUES.compra_bengala
        }
        if (item.desbloqueiaFlag) novoState.flags = { ...state.flags, [item.desbloqueiaFlag]: true }
        if (!item.slot && !item.danoBonus) novoState.inventario = [...state.inventario, { id: item.id, nome: item.nome }]
        if (item.id === 'ultimo_cigarro') novoState.monologoAtual = MONOLOGUES.ultimo_cigarro
        return novoState
      })
      get()._autoSave()
    },

    equiparPorId: (itemId) => {
      const item = ITENS[itemId]
      if (!item?.slot) return
      set(state => {
        const atual = state.equipado[item.slot]
        const inventario = state.inventario.filter(i => i.id !== itemId)
        if (atual) inventario.push({ id: atual.id, nome: atual.nome })
        return {
          equipado: { ...state.equipado, [item.slot]: { id: item.id, nome: item.nome, dano: item.dano || 0, reducaoDano: item.reducaoDano || 0 } },
          inventario,
        }
      })
      get()._autoSave()
    },

    aplicarUpgrade: (itemId) => {
      const item = ITENS[itemId]
      if (!item || !item.danoBonus) return
      set(state => ({
        equipado: { ...state.equipado, arma: { ...state.equipado.arma, dano: (state.equipado.arma?.dano || 0) + item.danoBonus } },
        inventario: state.inventario.filter(i => i.id !== itemId),
        monologoAtual: `${item.nome} aplicado. dano +${item.danoBonus}.`,
      }))
      get()._autoSave()
    },

    usarItem: (itemId) => {
      const item = ITENS[itemId]
      if (!item) return
      set(state => {
        if (item.cura) {
          return {
            hpAtual: Math.min(state.hpMax, state.hpAtual + item.cura),
            inventario: state.inventario.filter(i => i.id !== itemId),
            monologoAtual: `${item.nome} usado. +${item.cura} HP.`,
          }
        }
        return state
      })
    },

    completarDungeon: (dungeonId, dropCap, dropNotas, dropFrag) => {
      set(state => {
        const jaCompleta = state.dungeonsCompletas.includes(dungeonId)
        const cervejasGanhas = jaCompleta ? Math.floor(dropCap / 2) : dropCap
        const novasCompletas = jaCompleta ? state.dungeonsCompletas : [...state.dungeonsCompletas, dungeonId]
        const flagMap = {
          onibus: 'NOTAS_LIBERADO', rua: 'NINA_LIBERADO', anexo: 'ANEXO_COMPLETO',
          porto_velho: 'PORTO_COMPLETO', doca_abandonada: 'DOCA_COMPLETA', torre_kronos: 'KRONOS_VIU',
          rua_branca: 'RUA_BRANCA_COMPLETA', porto_seco: 'PORTO_SECO_COMPLETO', ilha_privada: 'KRONOS_DERROTADO',
          risca_faca_interior: 'RISCA_FACA_VITORIA',
        }
        const xpGanho = Math.max(1, Math.floor(dropCap / 8))
        const xpNova = state.xp + xpGanho
        const xpNeeded = state.nivel * 15
        let nivelNovo = state.nivel
        let xpFinal = xpNova
        if (xpNova >= xpNeeded) {
          nivelNovo = state.nivel + 1
          xpFinal = xpNova - xpNeeded
        }
        return {
          cervejas: state.cervejas + cervejasGanhas, notas: state.notas + (dropNotas || 0), fragmentos: state.fragmentos + (dropFrag || 0),
          dungeonsCompletas: novasCompletas,
          flags: { ...state.flags, [flagMap[dungeonId]]: true },
          medidorPrimordial: Math.min(10, state.medidorPrimordial + 1),
          monologoAtual: xpNova >= xpNeeded ? `nível ${nivelNovo}!` : MONOLOGUES.dungeon1_vitoria || '',
          aliadoAtual: null,
          nivel: nivelNovo, xp: xpFinal,
        }
      })
      get()._autoSave()
    },

    ganharXp: (quantidade) => {
      set(state => {
        const xpNova = state.xp + quantidade
        const xpNeeded = state.nivel * 15
        if (xpNova >= xpNeeded) {
          return {
            xp: xpNova - xpNeeded,
            nivel: state.nivel + 1,
            monologoAtual: `nível ${state.nivel + 1}!`,
          }
        }
        return { xp: xpNova }
      })
      get()._autoSave()
    },

    // === SUPABASE: source of truth ===
    saveToCloud: async (userId) => {
      const uid = userId || get()._userId
      if (!uid) return
      const state = get()
      const payload = {
        user_id: uid, slot_num: state._slot || 1,
        cervejas: state.cervejas, cervejas_por_segundo: state.cervejasPorSegundo,
        cervejas_totais: state.cervejasTotais, fragmentos: state.fragmentos, notas: state.notas,
        fase: state.fase, flags: state.flags,
        hp_atual: state.hpAtual, hp_max: state.hpMax,
        nivel: state.nivel, xp: state.xp,
        inventario: state.inventario, equipado: state.equipado,
        dungeons_completas: state.dungeonsCompletas,
        tempo_jogo: state.tempoJogo, title_done: state.titleDone,
        cidade_atual: state.cidadeAtual, periodo: state.periodo,
        medidor_primordial: state.medidorPrimordial,
        caso_ativo: state.casoAtivo, pistas_coletadas: state.pistasColetadas,
        suspeitos: state.suspeitos, locais_visitados: state.locaisVisitados,
        acusacoes_erradas: state.acusacoesErradas, casos_resolvidos: state.casosResolvidos,
        updated_at: new Date().toISOString(),
        version: JACK_VERSION,
      }
      const { error } = await supabase
        .from('jack_saves')
        .upsert(payload, { onConflict: 'user_id,slot_num' })
      if (error) console.error('[JACK] saveToCloud error:', error)
      cacheLocal(state)
    },

    loadFromCloud: async (userId, slotNum = 1) => {
      if (!userId) return null
      // Tenta Supabase primeiro
      const { data, error } = await supabase
        .from('jack_saves')
        .select('*')
        .eq('user_id', userId)
        .eq('slot_num', slotNum)
        .maybeSingle()
      if (!error && data) {
        cacheLocal({ ...data, _slot: slotNum })
        return data
      }
      // Fallback: cache local
      return cacheLoad(slotNum)
    },

    // Carrega todos os slots do usuário (para o MainMenu)
    loadAllSlots: async (userId) => {
      if (!userId) return [null, null, null]
      const slots = [null, null, null]
      try {
        const { data } = await supabase
          .from('jack_saves')
          .select('*')
          .eq('user_id', userId)
          .in('slot_num', [1, 2, 3])
        if (data) {
          data.forEach(row => {
            const idx = (row.slot_num || 1) - 1
            if (idx >= 0 && idx < 3) slots[idx] = row
          })
        }
      } catch (_) {}
      // Fallback: cache local
      for (let i = 1; i <= 3; i++) {
        if (!slots[i - 1]) slots[i - 1] = cacheLoad(i)
      }
      return slots
    },

    deleteSlot: async (userId, slotNum) => {
      // Deleta do Supabase
      if (userId) {
        await supabase.from('jack_saves').delete().eq('user_id', userId).eq('slot_num', slotNum)
      }
      // Limpa cache local
      localStorage.removeItem(`jack_cache_${slotNum}`)
      localStorage.removeItem(`jack_beer_slot_${slotNum}`)
    },

    persistNow: () => {
      const state = get()
      if (state._userId) state.saveToCloud(state._userId)
      else cacheLocal(state)
    },

    reset: () => {
      const slot = get()._slot
      if (slot) localStorage.removeItem(`jack_cache_${slot}`)
      set({ ...defaultState, _slot: slot, _userId: get()._userId })
    },
  }
})

// Auto-save periódico (cache local) e Supabase a cada 30s
setInterval(() => {
  const state = useJackStore.getState()
  if (state._userId && state._slot) {
    state.saveToCloud(state._userId)
  }
}, 30000)
