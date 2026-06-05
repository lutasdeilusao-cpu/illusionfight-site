/**
 * ARENA TÁTICA — Zustand Store v2.0.0
 * Jogo novo e independente — não mexe no LDI Arena original
 */

import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'

const XP_TABLE = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000, 9500]

function calcNivel(xp) {
  for (let i = XP_TABLE.length - 1; i >= 0; i--) if (xp >= XP_TABLE[i]) return i + 1
  return 1
}

const INIT = {
  personagem: null, nome: '', classe: null, elemental: null,
  pronome: 'ele', cor_secundaria: '#888', time: [],
  atributos: { forca: 8, velocidade: 8, resistencia: 8, energia: 8, precisao: 8, tenacidade: 8 },
  pontos_livres: 48, sdr: 0, xp: 0, nivel: 1,
  vitorias: 0, derrotas: 0, streak: 0,
  batalha: null, fase: 'intro',
  timesSalvos: [], slotsTime: 3, carregado: false, userId: null,
}

export const useArenaTaticaStore = create((set, get) => ({
  ...INIT,
  setUserId: (id) => set({ userId: id, carregado: true }),
  setFase: (f) => set({ fase: f }),
  setPersonagem: (d) => set((s) => ({ ...s, ...d, personagem: d.nome || s.nome })),
  setClasse: (c) => set({ classe: c }),
  setElemental: (e) => set({ elemental: e }),
  setNome: (n) => set({ nome: n }),
  setPronome: (p) => set({ pronome: p }),
  setCorSecundaria: (c) => set({ cor_secundaria: c }),
  setAtributo: (a, v) => set((s) => {
    const d = v - s.atributos[a]
    if (s.pontos_livres - d < 0) return s
    return { atributos: { ...s.atributos, [a]: Math.max(1, Math.min(20, v)) }, pontos_livres: s.pontos_livres - d }
  }),
  addToTeam: (m) => set((s) => ({ time: s.time.length < 3 ? [...s.time, m] : s.time })),
  removeFromTeam: (id) => set((s) => ({ time: s.time.filter((m) => m.id !== id) })),

  iniciarBatalha: (inimigos) => set((s) => {
    const p = {
      id: 'player', nome: s.nome || 'Briguento',
      classe: s.classe, elemental: s.elemental, nivel: s.nivel,
      atributos: s.atributos,
      hp: 30 + s.atributos.resistencia * 3, hpMax: 30 + s.atributos.resistencia * 3,
      energia: 10 + s.atributos.energia, energiaMax: 10 + s.atributos.energia,
      x: 0, y: 5,
    }
    return {
      batalha: { turno: 1, fase: 'player', aliados: [p, ...s.time], inimigos, rodada_evento: 1, eventosAtivos: [], eventoAtual: null, log: [] },
      fase: 'pre',
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
      user_id: userId, personagem: s.personagem, nome: s.nome, classe: s.classe,
      elemental: s.elemental, atributos: s.atributos, pontos_livres: s.pontos_livres,
      sdr: s.sdr, xp: s.xp, nivel: s.nivel, vitorias: s.vitorias, derrotas: s.derrotas, timesSalvos: s.timesSalvos,
    }, { onConflict: 'user_id' })
  },

  loadSave: async (userId) => {
    if (!userId) { set({ carregado: true }); return }
    const { data } = await supabase.from('arena_tatica_saves').select('*').eq('user_id', userId).single()
    if (data) set({
      personagem: data.personagem, nome: data.nome || '', classe: data.classe, elemental: data.elemental,
      atributos: data.atributos || INIT.atributos, pontos_livres: data.pontos_livres ?? 48,
      sdr: data.sdr || 0, xp: data.xp || 0, nivel: data.nivel || 1,
      vitorias: data.vitorias || 0, derrotas: data.derrotas || 0, timesSalvos: data.timesSalvos || [], carregado: true,
    })
    else set({ carregado: true })
  },
  resetStore: () => set(INIT),
}))

export function getXpProximoNivel(xp) {
  const n = calcNivel(xp); return n >= XP_TABLE.length ? 0 : XP_TABLE[n] - XP_TABLE[n - 1]
}
