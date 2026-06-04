const JACK_VERSION = '2.0.0'
console.log(`[JACK] versão carregada: ${JACK_VERSION}`)

import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'
import { ITENS } from '../data/itens'
import { MONOLOGUES } from '../data/monologues'
import { FLAGS } from '../data/flags'

const STORAGE_KEY = 'jack_beer_save_v2'

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data.fase?.startsWith('dungeon_') || data.fase === 'dungeon_select' || data.fase?.startsWith('interior_')) {
        data.fase = 'vila'
      }
      return data
    }
  } catch (_) {}
  try {
    const raw = localStorage.getItem('jack_candy_save')
    if (raw) {
      const data = JSON.parse(raw)
      localStorage.removeItem('jack_candy_save')
      if (data.fase?.startsWith('dungeon_') || data.fase === 'dungeon_select' || data.fase?.startsWith('interior_')) {
        data.fase = 'vila'
      }
      data.cervejas = data.capangas ?? 0
      data.cervejasTotais = data.capangasTotais ?? 0
      data.cervejasPorSegundo = data.capangasPorSegundo ?? 1
      data.fragmentos = 0
      data.medidorPrimordial = 0
      data.periodo = 'DIA'
      data.cidadeAtual = 'marelia'
      data.aliadoAtual = null
      return data
    }
  } catch (_) {}
  return null
}

function persistLocal(state) {
  try {
    const faseSave = state.fase.startsWith('dungeon_') || state.fase === 'dungeon_select' || state.fase.startsWith('interior_') ? 'vila' : state.fase
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      cervejas: state.cervejas, cervejasPorSegundo: state.cervejasPorSegundo, cervejasTotais: state.cervejasTotais,
      fragmentos: state.fragmentos, notas: state.notas,
      fase: faseSave, flags: state.flags,
      hpAtual: state.hpAtual, hpMax: state.hpMax,
      nivel: state.nivel, xp: state.xp,
      inventario: state.inventario, equipado: state.equipado,
      dungeonsCompletas: state.dungeonsCompletas,
      tempoJogo: state.tempoJogo, titleDone: state.titleDone,
      cidadeAtual: state.cidadeAtual, periodo: state.periodo,
      medidorPrimordial: state.medidorPrimordial,
      aliadoAtual: state.aliadoAtual,
    }))
  } catch (_) {}
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
  _userId: null,
}

export const useJackStore = create((set, get) => {
  const saved = loadLocal()
  return {
    ...defaultState, ...(saved || {}),

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
    setFlag: (flag) => set(state => ({ flags: { ...state.flags, [flag]: true } })),
    setFase: (fase) => set({ fase }),
    setMonologo: (text) => set({ monologoAtual: text }),
    limparMonologo: () => set({ monologoAtual: null }),
    setTitleDone: () => set({ titleDone: true }),
    setCidade: (cid) => set({ cidadeAtual: cid }),

    // Dia / Noite
    alternarPeriodo: () => set(state => ({
      periodo: state.periodo === 'DIA' ? 'NOITE' : 'DIA',
      monologoAtual: state.periodo === 'DIA' ? MONOLOGUES.dia_anoitece : MONOLOGUES.noite_amanhece,
    })),

    // Aliado
    setAliado: (aliado) => set({ aliadoAtual: aliado }),
    limparAliado: () => set({ aliadoAtual: null }),

    // Primordial
    incrementarMedidor: () => set(state => {
      const novo = Math.min(10, state.medidorPrimordial + 1)
      return { medidorPrimordial: novo }
    }),
    zerarMedidor: () => set({ medidorPrimordial: 0 }),

    // Compat: wrapper para dungeon (renomeado internamente)
    ganharCapangas: (qtd) => {
      get().ganharCervejas(qtd)
    },

    comprarBengala: () => {
      get().comprarItem('bengala_steampunk')
    },

    comprarItem: (itemId) => {
      const item = ITENS[itemId]
      if (!item) return
      const state = get()
      let preco = item.preco
      let pode = false
      if (item.moeda === 'nota') pode = state.notas >= preco
      else if (item.moeda === 'fragmento') pode = state.fragmentos >= preco
      else pode = state.cervejas >= preco
      if (!pode) return

      set(state => {
        let novoState = {}
        if (item.moeda === 'nota') novoState.notas = state.notas - preco
        else if (item.moeda === 'fragmento') novoState.fragmentos = state.fragmentos - preco
        else novoState.cervejas = state.cervejas - preco

        if (item.cura) {
          novoState.hpAtual = Math.min(state.hpMax, state.hpAtual + item.cura)
        }
        if (item.capPerSeg) novoState.cervejasPorSegundo = state.cervejasPorSegundo + item.capPerSeg
        if (item.hpMaxBonus) {
          novoState.hpMax = state.hpMax + item.hpMaxBonus
          novoState.hpAtual = state.hpAtual + item.hpMaxBonus
        }
        if (item.dano || item.slot) {
          const slot = item.slot || 'arma'
          const eq = { ...state.equipado[slot], id: item.id, nome: item.nome, dano: (item.dano || 0) }
          if (item.reducaoDano) eq.reducaoDano = item.reducaoDano
          novoState.equipado = { ...state.equipado, [slot]: eq }
        }
        if (item.danoBonus) {
          const arma = state.equipado.arma
          novoState.equipado = {
            ...state.equipado,
            arma: { ...arma, dano: (arma?.dano || 0) + item.danoBonus },
          }
        }
        if (item.id === 'bengala_steampunk') {
          novoState.flags = { ...state.flags, TEM_BENGALA: true }
          novoState.fase = 'vila'
          novoState.monologoAtual = MONOLOGUES.compra_bengala
        }
        if (item.desbloqueiaFlag) {
          novoState.flags = { ...state.flags, [item.desbloqueiaFlag]: true }
        }
        // Consumíveis e upgrades sem slot: não vão pro inventário
        if (!item.slot && !item.danoBonus) {
          novoState.inventario = [...state.inventario, { id: item.id, nome: item.nome }]
        }
        // item.ultimo_cigarro: monólogo especial
        if (item.id === 'ultimo_cigarro') {
          novoState.monologoAtual = MONOLOGUES.ultimo_cigarro
        }
        return novoState
      })
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
    },

    aplicarUpgrade: (itemId) => {
      const item = ITENS[itemId]
      if (!item || !item.danoBonus) return
      set(state => ({
        equipado: {
          ...state.equipado,
          arma: { ...state.equipado.arma, dano: (state.equipado.arma?.dano || 0) + item.danoBonus },
        },
        inventario: state.inventario.filter(i => i.id !== itemId),
        monologoAtual: `${item.nome} aplicado. dano +${item.danoBonus}.`,
      }))
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
          onibus: 'NOTAS_LIBERADO',
          rua: 'NINA_LIBERADO',
          anexo: 'ANEXO_COMPLETO',
          porto_velho: 'PORTO_COMPLETO',
          doca_abandonada: 'DOCA_COMPLETA',
          torre_kronos: 'KRONOS_VIU',
          rua_branca: 'RUA_BRANCA_COMPLETA',
          porto_seco: 'PORTO_SECO_COMPLETO',
          ilha_privada: 'KRONOS_DERROTADO',
          risca_faca_interior: 'RISCA_FACA_VITORIA',
        }
        const novoMedidor = Math.min(10, state.medidorPrimordial + 1)
        return {
          cervejas: state.cervejas + cervejasGanhas,
          notas: state.notas + (dropNotas || 0),
          fragmentos: state.fragmentos + (dropFrag || 0),
          dungeonsCompletas: novasCompletas,
          flags: { ...state.flags, [flagMap[dungeonId]]: true },
          medidorPrimordial: novoMedidor,
          monologoAtual: MONOLOGUES.dungeon1_vitoria || '',
          aliadoAtual: null,
        }
      })
    },

    // Cloud Save
    saveToCloud: async (userId) => {
      const uid = userId || get()._userId
      if (!uid) return
      const state = get()
      const payload = {
        user_id: uid, cervejas: state.cervejas, cervejas_por_segundo: state.cervejasPorSegundo,
        cervejas_totais: state.cervejasTotais, fragmentos: state.fragmentos, notas: state.notas,
        fase: state.fase, flags: state.flags,
        hp_atual: state.hpAtual, hp_max: state.hpMax,
        nivel: state.nivel, xp: state.xp,
        inventario: state.inventario, equipado: state.equipado,
        dungeons_completas: state.dungeonsCompletas,
        tempo_jogo: state.tempoJogo, title_done: state.titleDone,
        cidade_atual: state.cidadeAtual, periodo: state.periodo,
        medidor_primordial: state.medidorPrimordial,
        version: JACK_VERSION,
      }
      const { data } = await supabase.from('jack_saves').select('id').eq('user_id', uid).maybeSingle()
      if (data?.id) await supabase.from('jack_saves').update(payload).eq('id', data.id)
      else await supabase.from('jack_saves').insert({ ...payload, user_id: uid })
    },

    loadFromCloud: async (userId) => {
      if (!userId) return false
      const { data } = await supabase.from('jack_saves').select('*').eq('user_id', userId).maybeSingle()
      if (data) {
        set({
          cervejas: data.cervejas ?? 0, cervejasPorSegundo: data.cervejas_por_segundo ?? 1,
          cervejasTotais: data.cervejas_totais ?? 0, fragmentos: data.fragmentos ?? 0,
          notas: data.notas ?? 0,
          fase: data.fase ?? 'intro', flags: data.flags ?? {},
          hpAtual: data.hp_atual ?? 20, hpMax: data.hp_max ?? 20,
          nivel: data.nivel ?? 1, xp: data.xp ?? 0,
          inventario: data.inventario ?? [], equipado: data.equipado ?? { arma: null, armadura: null, acessorio: null },
          dungeonsCompletas: data.dungeons_completas ?? [],
          tempoJogo: data.tempo_jogo ?? 0, titleDone: data.title_done ?? false,
          cidadeAtual: data.cidade_atual ?? 'marelia', periodo: data.periodo ?? 'DIA',
          medidorPrimordial: data.medidor_primordial ?? 0,
          _userId: userId,
        })
        return true
      }
      return false
    },

    reset: () => {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('jack_candy_save')
      set({ ...defaultState })
    },
    persistNow: () => persistLocal(get()),
  }
})

setInterval(() => {
  const state = useJackStore.getState()
  if (state.fase) persistLocal(state)
}, 30000)
