/**
 * ARENA TÁTICS — Zustand Store v2.1.0
 * Jogo novo e independente — não mexe no LDI Arena original
 */

import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'
import { construirPersonagem, getInimigosPadrao } from '../data/roster'

const XP_TABLE = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000, 9500]

function calcNivel(xp) {
  for (let i = XP_TABLE.length - 1; i >= 0; i--) if (xp >= XP_TABLE[i]) return i + 1
  return 1
}

const INIT = {
  sdr: 0, xp: 0, nivel: 1,
  vitorias: 0, derrotas: 0, streak: 0,
  batalha: null, fase: 'intro',
  carregado: false, userId: null,
  personagensIds: [], // [id1, id2] — IDs do roster salvos no Supabase
}

export const useArenaTaticsStore = create((set, get) => ({
  ...INIT,
  setUserId: (id) => set({ userId: id, carregado: true }),
  setFase: (f) => set({ fase: f }),
  setPersonagensIds: (ids) => set({ personagensIds: ids }),

  /**
   * Inicia batalha com múltiplos aliados do roster + 4 inimigos padrão
   */
  iniciarBatalha: (aliadosRoster) => set((s) => {
    // Posiciona aliados no lado esquerdo (colunas 0-2)
    const aliados = aliadosRoster.map((rosterId, i) => {
      return construirPersonagem(rosterId, 1 + (i % 2), 3 + i * 4, 'aliado')
    }).filter(Boolean)

    // 4 inimigos padrão
    const inimigos = getInimigosPadrao()

    // Gera obstáculos
    const todos = [...aliados, ...inimigos]
    const ocupadas = new Set(todos.map(t => `${t.x},${t.y}`))
    const obstrucoes = []
    const numObs = 4 + Math.floor(Math.random() * 3)
    let tentativas = 0
    while (obstrucoes.length < numObs && tentativas < 300) {
      tentativas++
      const x = 1 + Math.floor(Math.random() * 6)
      const y = 1 + Math.floor(Math.random() * 14)
      const key = `${x},${y}`
      if (ocupadas.has(key)) continue
      const perto = obstrucoes.some(o => Math.abs(o.x - x) + Math.abs(o.y - y) < 3)
      if (!perto) {
        ocupadas.add(key)
        obstrucoes.push({ x, y })
      }
    }
    return {
      batalha: {
        turno: 1, fase: 'player',
        aliados, inimigos, obstrucoes,
        rodada_evento: 1, eventosAtivos: [], eventoAtual: null, log: [],
      },
      fase: 'combate',
    }
  }),

  iniciarCombate: () => set((s) => ({ fase: 'combate', batalha: s.batalha ? { ...s.batalha, fase: 'player' } : null })),
  executarAcao: (a) => set((s) => s.batalha ? { batalha: { ...s.batalha, log: [...s.batalha.log, a] } } : s),
  avancarTurno: () => set((s) => s.batalha ? { batalha: { ...s.batalha, turno: s.batalha.turno + 1, fase: 'player' } } : s),
  setTurnoFase: (f) => set((s) => ({ batalha: s.batalha ? { ...s.batalha, fase: f } : null })),

  registrarVitoria: (g) => set((s) => {
    const x = s.xp + g; const n = calcNivel(x)
    return { sdr: s.sdr + g, xp: x, nivel: n, vitorias: s.vitorias + 1, streak: s.streak + 1, fase: 'vitoria', batalha: null }
  }),
  registrarDerrota: () => set((s) => ({ derrotas: s.derrotas + 1, streak: 0, fase: 'derrota', batalha: null })),

  saveToCloud: async (userId) => {
    if (!userId) return; const s = get()
    await supabase.from('arena_tatica_saves').upsert({
      user_id: userId, personagens_ids: s.personagensIds,
      sdr: s.sdr, xp: s.xp, nivel: s.nivel, vitorias: s.vitorias, derrotas: s.derrotas,
    }, { onConflict: 'user_id' })
  },

  loadSave: async (userId) => {
    if (!userId) { set({ carregado: true }); return }
    const { data } = await supabase.from('arena_tatica_saves').select('*').eq('user_id', userId).single()
    if (data) set({
      personagensIds: data.personagens_ids || [],
      sdr: data.sdr || 0, xp: data.xp || 0, nivel: data.nivel || 1,
      vitorias: data.vitorias || 0, derrotas: data.derrotas || 0, carregado: true,
    })
    else set({ carregado: true })
  },
  resetStore: () => set(INIT),
}))

export function getXpProximoNivel(xp) {
  const n = calcNivel(xp); return n >= XP_TABLE.length ? 0 : XP_TABLE[n] - XP_TABLE[n - 1]
}
