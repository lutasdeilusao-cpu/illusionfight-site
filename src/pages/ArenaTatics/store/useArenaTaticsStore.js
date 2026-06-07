/**
 * ARENA TÁTICS — Zustand Store v2.1.0
 * Jogo novo e independente — não mexe no LDI Arena original
 */

import { create } from 'zustand'
import { supabase } from '../../../lib/supabase'
import { construirPersonagem, getInimigosPadrao, ROSTER } from '../data/roster'
import { construirPersonagemNivelado } from '../data/levelProgression'
import { sortearCartaInicial1, sortearCartaInicial2, sortearProximaCarta, poolCompleto } from '../data/cardPool'
import { getNomeClasse } from '../data/classTree'

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
  personagensIds: [], // IDs salvos no Supabase
  maxSlots: 2, // Slots iniciais, desbloqueia até 8
  personagensDesbloqueados: [], // IDs disponíveis para o jogador
  equipamentoMap: {}, // { [rosterId]: { arma: {...}, armadura: {...}, acessorio: {...} } }
  cartasObtidas: [], // array de ids das cartas que o jogador tem
  cartasOrdem: [], // array com ordem de recebimento
  evolucoesMap: {}, // { rosterId: { nivel40: 'muralha', nivel70: 'bastiao' } }
}

export const useArenaTaticsStore = create((set, get) => ({
  ...INIT,
  setUserId: (id) => set({ userId: id, carregado: true }),
  setFase: (f) => set({ fase: f }),
  setPersonagensIds: (ids) => set({ personagensIds: ids }),
  setMaxSlots: (n) => set({ maxSlots: Math.min(8, Math.max(2, n)) }),
  desbloquearPersonagem: (id) => set(s => ({
    personagensDesbloqueados: s.personagensDesbloqueados.includes(id)
      ? s.personagensDesbloqueados : [...s.personagensDesbloqueados, id]
  })),
  setEquipamentoMap: (m) => set({ equipamentoMap: m }),

  /**
   * Inicia batalha com múltiplos aliados do roster + 4 inimigos padrão
   */
  iniciarBatalha: (aliadosRoster) => set((s) => {
    // Aplica equipamento do mapa aos personagens
    const applyEquip = (rosterId, p) => {
      const eq = s.equipamentoMap[rosterId]
      if (!eq) return p
      return { ...p, equipamento: { ...p.equipamento, ...eq } }
    }
    // Máximo 3 aliados, posicionados no lado esquerdo — nível 99
    const posicoes = [[1, 3], [2, 7], [1, 11]]
    const aliados = aliadosRoster.slice(0, 3).map((rosterId, i) => {
      const entry = ROSTER.find(r => r.id === rosterId)
      if (!entry) return null
      const p = construirPersonagemNivelado(entry, 99, posicoes[i][0], posicoes[i][1], 'aliado')
      return p ? applyEquip(rosterId, p) : null
    }).filter(Boolean)

    // 4 inimigos padrão — nível 99
    const inimigos = getInimigosPadrao(99)

    // Gera obstáculos
    const todos = [...aliados, ...inimigos]
    const ocupadas = new Set(todos.map(t => `${t.x},${t.y}`))
    const obstrucoes = []
    const numObs = 8 + Math.floor(Math.random() * 5)
    let tentativas = 0
    while (obstrucoes.length < numObs && tentativas < 300) {
      tentativas++
      const x = 1 + Math.floor(Math.random() * 14)
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

  /**
   * Atualiza um personagem no estado da batalha (HP, energia, status, etc.)
   * Garante que o Zustand detecte a mudança e re-renderize a UI.
   */
  atualizarPersonagem: (lado, id, updates) => set((s) => {
    if (!s.batalha) return s
    const key = lado === 'aliados' ? 'aliados' : 'inimigos'
    return {
      batalha: {
        ...s.batalha,
        [key]: s.batalha[key].map(p =>
          p.id === id ? { ...p, ...updates } : p
        ),
      },
    }
  }),

  registrarVitoria: (g) => set((s) => {
    const x = s.xp + g; const n = calcNivel(x)
    return { sdr: s.sdr + g, xp: x, nivel: n, vitorias: s.vitorias + 1, streak: s.streak + 1, fase: 'vitoria', batalha: null }
  }),
  registrarDerrota: () => set((s) => ({ derrotas: s.derrotas + 1, streak: 0, fase: 'derrota', batalha: null })),

  // ── Sistema de Cartas ──

  /**
   * Inicializa o pool: sorteia as 2 cartas iniciais e salva no Supabase
   */
  inicializarPool: async () => {
    const s = get()
    if (s.cartasObtidas.length > 0) return // já inicializado

    const carta1 = sortearCartaInicial1([])
    const cartasApos1 = carta1 ? [carta1.id] : []
    const carta2 = sortearCartaInicial2(cartasApos1)

    const cartas = []
    const ordem = []
    if (carta1) { cartas.push(carta1.id); ordem.push(carta1.id) }
    if (carta2) { cartas.push(carta2.id); ordem.push(carta2.id) }

    // Preenche evolucoesMap automaticamente
    const evoMap = {}
    cartas.forEach(id => {
      const p = ROSTER.find(r => r.id === id)
      if (p?.caminhoEvolutivo) evoMap[id] = { ...p.caminhoEvolutivo }
    })

    set({ cartasObtidas: cartas, cartasOrdem: ordem, evolucoesMap: evoMap })
    await get().saveToCloud(s.userId)
  },

  /**
   * Ganha uma carta ao vencer um andar — sorteia do pool restante
   */
  ganharCarta: async (andar) => {
    const s = get()
    if (poolCompleto(s.cartasObtidas)) return null

    const carta = sortearProximaCarta(s.cartasObtidas)
    if (!carta) return null

    const novasCartas = [...s.cartasObtidas, carta.id]
    const novaOrdem = [...s.cartasOrdem, carta.id]
    const novoEvoMap = { ...s.evolucoesMap }
    if (carta.caminhoEvolutivo) {
      novoEvoMap[carta.id] = { ...carta.caminhoEvolutivo }
    }

    set({
      cartasObtidas: novasCartas,
      cartasOrdem: novaOrdem,
      evolucoesMap: novoEvoMap,
    })
    await get().saveToCloud(s.userId)
    return carta
  },

  /**
   * Aplica evolução pré-definida ao atingir nível 40 ou 70
   * @param {number} rosterId
   * @param {number} nivel
   */
  evoluirPersonagem: (rosterId, nivel) => {
    const s = get()
    const entry = ROSTER.find(r => r.id === rosterId)
    if (!entry?.caminhoEvolutivo) return null

    const evoMap = { ...s.evolucoesMap }
    if (!evoMap[rosterId]) evoMap[rosterId] = { ...entry.caminhoEvolutivo }

    const nomeClasse = getNomeClasse(entry.classe, nivel, evoMap[rosterId])
    set({ evolucoesMap: evoMap })
    return nomeClasse
  },

  saveToCloud: async (userId) => {
    if (!userId) return; const s = get()
    await supabase.from('arena_tatica_saves').upsert({
      user_id: userId, personagens_ids: s.personagensIds,
      sdr: s.sdr, xp: s.xp, nivel: s.nivel, vitorias: s.vitorias, derrotas: s.derrotas,
      max_slots: s.maxSlots, personagens_desbloqueados: s.personagensDesbloqueados,
      equipamento_map: s.equipamentoMap,
      cartas_obtidas: s.cartasObtidas,
      cartas_ordem: s.cartasOrdem,
      evolucoes_map: s.evolucoesMap,
    }, { onConflict: 'user_id' })
  },

  loadSave: async (userId) => {
    if (!userId) { set({ carregado: true }); return }
    const { data } = await supabase.from('arena_tatica_saves').select('*').eq('user_id', userId).single()
    if (data) set({
      personagensIds: data.personagens_ids || [],
      sdr: data.sdr || 0, xp: data.xp || 0, nivel: data.nivel || 1,
      vitorias: data.vitorias || 0, derrotas: data.derrotas || 0, carregado: true,
      maxSlots: data.max_slots || 2,
      personagensDesbloqueados: data.personagens_desbloqueados || [],
      equipamentoMap: data.equipamento_map || {},
      cartasObtidas: data.cartas_obtidas || [],
      cartasOrdem: data.cartas_ordem || [],
      evolucoesMap: data.evolucoes_map || {},
    })
    else set({ carregado: true })
  },
  resetStore: () => set(INIT),
}))

export function getXpProximoNivel(xp) {
  const n = calcNivel(xp); return n >= XP_TABLE.length ? 0 : XP_TABLE[n] - XP_TABLE[n - 1]
}
