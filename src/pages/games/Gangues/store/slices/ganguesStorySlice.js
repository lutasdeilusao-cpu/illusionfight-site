// Slice: nome da gangue, progresso de história/território, dificuldade, a
// Torre (grind), e os resets globais. Extraído de store/useGanguesStore.js
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
import { carregarProgressoHistoria } from '../ganguesStoryProgress.js'
import { defaultSheet } from './ganguesSheetSlice.js'

export default function createGanguesStorySlice(set, get) {
  return {
    // ── Nome da gangue ──
    // É o que reverbera na história (falas dos inimigos, % de domínio, fim).
    gangName: '',
    setGangName: (nome) => {
      const limpo = String(nome || '').replace(/\s+/g, ' ').trim().slice(0, 28)
      set({ gangName: limpo })
      get()._persistStory()
    },

    // ── Modo história ──
    // Progresso salvo em Supabase (tabela `gangues_saves`, uma linha por
    // SAVE — ver `_saveId`/`selecionarSave`) quando logado; guest joga só em
    // memória e perde tudo ao sair — igual à ficha de personagem (ver `addLocalSheet`).
    // storyProgress: { [territorioId]: { pontos: [noId...], chefe: bool } }
    storyProgress: {},
    // Nó em que o jogador entrou: { territorioId, noId, enemyId, isChefe }
    storyTarget: null,
    setStoryTarget: (target) => set({ storyTarget: target }),

    loadStoryProgress: async (saveId) => {
      if (!saveId) return
      const progresso = await carregarProgressoHistoria(saveId)
      if (progresso) set(progresso)
    },

    marcarNoDominado: (territorioId, noId, isChefe) => {
      set(state => {
        const atual = state.storyProgress[territorioId] || { pontos: [], chefe: false }
        const prox = isChefe
          ? { ...atual, chefe: true }
          : { ...atual, pontos: atual.pontos.includes(noId) ? atual.pontos : [...atual.pontos, noId] }
        return { storyProgress: { ...state.storyProgress, [territorioId]: prox } }
      })
      get()._persistStory()
    },

    // Reaproveitamento entre territórios: falar com um informante num bairro
    // já dominado libera algo em outro (ver `precisaInformante` em
    // ganguesTerritorios.js). Guardado dentro do próprio storyProgress (chave
    // reservada __flags) pra não precisar de coluna nova no Supabase — é o
    // mesmo JSONB que já existe.
    marcarInformante: (chave) => {
      set(state => ({ storyProgress: { ...state.storyProgress, __flags: { ...(state.storyProgress.__flags || {}), [chave]: true } } }))
      get()._persistStory()
    },

    // ── Líder da gangue (pedido do Isaias, set/2026) ──────
    // O 1º personagem recrutado vira líder automaticamente (ver GanguesCreate.jsx
    // no fim do recrutamento inicial) — mas o jogador pode trocar depois. Guardado
    // em storyProgress.__lider (mesmo JSONB, mesmo padrão de __dificuldade/__torre)
    // em vez de depender da ORDEM do array `roster`: o roster recarregado da nuvem
    // vem ordenado por created_at (mais novo primeiro), então "roster[0] = líder"
    // quebraria silenciosamente pra quem já tem gangue formada antes desse recurso
    // existir. Serve pra: a cabeça dele flutuar na navegação da cena (GanguesCena),
    // e — visão futura, ainda não implementada — poder virar prioridade de defesa
    // de aliado tanque e mote de desafio "líder contra líder" em territórios futuros.
    getLiderId: () => {
      const guardado = get().storyProgress.__lider
      const roster = get().roster
      if (guardado && roster.some(m => m.id === guardado)) return guardado
      // Sem líder definido ainda (save antigo, ou gangue recém-criada antes do
      // primeiro recrutamento fechar) — cai no primeiro do elenco.
      return roster[0]?.id ?? null
    },
    getLider: () => {
      const id = get().getLiderId()
      return get().roster.find(m => m.id === id) || null
    },
    definirLider: (sheetId) => {
      if (!get().roster.some(m => m.id === sheetId)) return
      set(state => ({ storyProgress: { ...state.storyProgress, __lider: sheetId } }))
      get()._persistStory()
    },

    // ── Dificuldade do modo história (escolha do jogador) ──────────
    // 'facil' | 'medio' | 'dificil'. Guardada em storyProgress.__dificuldade
    // (mesmo JSONB, sem coluna nova). Afeta o orçamento de TODO bando
    // (gerarBando* em ganguesEncontros.js). NO FÁCIL o túnel/muro NÃO abre —
    // o Carvão não se rebaixa a encarar pivete (ver GanguesCena).
    dificuldadeJogo: () => get().storyProgress.__dificuldade || 'medio',
    setDificuldadeJogo: (modo) => {
      if (!['facil', 'medio', 'dificil'].includes(modo)) return
      set(state => ({ storyProgress: { ...state.storyProgress, __dificuldade: modo } }))
      get()._persistStory()
    },

    // ── Modo Batalha: a Torre (grind de AP pra L→99) ──
    // `torre` = a subida ATIVA (só em memória — some ao sair). O recorde de andar
    // por território fica em storyProgress.__torre (mesmo padrão de __flags).
    torre: null,
    torreIniciar: ({ territorioId, folga }) => set({ torre: { territorioId, folga, andar: 1 } }),
    torreAvancar: () => set(state => ({ torre: state.torre ? { ...state.torre, andar: state.torre.andar + 1 } : null })),
    torreEncerrar: () => {
      const t = get().torre
      if (t) {
        const rec = get().storyProgress.__torre || {}
        if ((rec[t.territorioId] || 0) < t.andar) {
          set(state => ({ storyProgress: { ...state.storyProgress, __torre: { ...rec, [t.territorioId]: t.andar } } }))
          get()._persistStory()
        }
      }
      set({ torre: null })
    },

    resetStory: () => {
      set({ storyProgress: {}, storyTarget: null, torre: null, grana: 0, rep: 0, cenaProgresso: {}, inventario: {}, equipamentos: [] })
      get()._persistStory()
    },

    // 1ª luta da conta mais fácil de propósito (metade dos pontos, 1 corpo só)
    // — ver suavizarPrimeiraLuta em ganguesEncontros.js. Marcado assim que a
    // 1ª luta COMEÇA (não espera o resultado): é uma cortesia de entrada,
    // vale só uma vez, ganhando ou perdendo.
    marcarPrimeiraLutaFeita: () => {
      if (get().storyProgress.__primeiraLutaFeita) return
      set(state => ({ storyProgress: { ...state.storyProgress, __primeiraLutaFeita: true } }))
      get()._persistStory()
    },

    campaignClears: 0,
    eventCharacterIds: [],
    completeCampaign: () => {
      set(state => ({ campaignClears: state.campaignClears + 1 }))
      get()._persistStory()
    },

    reset: () => set({ sheet: defaultSheet(), roster: [], activeParty: [], match: { playerTeam: [], enemyTeam: [], enemy: null, enemy_id: null, score: 0, status: 'idle', battleReport: null } }),
  }
}
