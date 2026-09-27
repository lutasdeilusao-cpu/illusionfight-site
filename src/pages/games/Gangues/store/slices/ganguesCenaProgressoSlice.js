import { estadoInicialAleatorio, ALEATORIO_INTERVALO_S } from '../../engine/ganguesEncontroAleatorio.js'
// Slice: progresso de POI/farm/posição dentro da cena navegável. Extraído de
// store/useGanguesStore.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
export default function createGanguesCenaProgressoSlice(set, get) {
  return {
    revelarPoi: (cenaId, ...poiIds) => {
      set(state => {
        const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
        const revelados = { ...atual.revelados }
        poiIds.flat().forEach(id => { if (id) revelados[id] = true })
        return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, revelados } } }
      })
      get()._persistCena()
    },

    marcarPoiResolvido: (cenaId, poiId, revela = []) => {
      set(state => {
        const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
        const revelados = { ...atual.revelados }
        ;[].concat(revela).forEach(id => { if (id) revelados[id] = true })
        return {
          cenaProgresso: {
            ...state.cenaProgresso,
            [cenaId]: { ...atual, resolvidos: { ...atual.resolvidos, [poiId]: true }, revelados },
          },
        }
      })
      get()._persistCena()
    },

    marcarBossCena: (cenaId) => {
      set(state => {
        const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
        return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, boss: true } } }
      })
      get()._persistCena()
    },

    // posicao: { x, y, local? } — `local` guarda em qual prédio/cômodo o jogador
    // estava (null = rua), pra reentrar na cena exatamente onde parou, mesmo
    // dentro do galpão. `adversario` = id do POI da luta que está começando
    // (só gravado na entrada de uma treta; qualquer outro salvamento limpa) —
    // a briga automática da cena ignora esse cara na volta até descolar
    // (hooks/useGanguesBrigaAutomatica.js), senão entraria em loop.
    salvarPosicaoCena: (cenaId, posicao) => {
      if (!cenaId || !Number.isFinite(posicao?.x) || !Number.isFinite(posicao?.y)) return
      set(state => {
        const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
        return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, posicao: { x: Math.round(posicao.x), y: Math.round(posicao.y), local: posicao.local || null, adversario: posicao.adversario || null } } } }
      })
      get()._persistCena()
    },

    // ── Encontro aleatório (26/09/2026, ver engine/ganguesEncontroAleatorio.js) ──
    // Estado em storyProgress.__aleatorio (vai no save da gangue, igual
    // __birosca/__album): { tempo, proxima, contador, ultimo, ativo }.
    aleatorioEstado: () => get().storyProgress.__aleatorio || estadoInicialAleatorio(),
    salvarAleatorio: (patch, persistir = true) => {
      set(state => ({ storyProgress: { ...state.storyProgress, __aleatorio: { ...(state.storyProgress.__aleatorio || estadoInicialAleatorio()), ...patch } } }))
      if (persistir) get()._persistStory()
    },
    // A luta com o perseguidor acabou (vitória OU derrota): some do mapa e o
    // próximo fica pra daqui a ALEATORIO_INTERVALO_S de jogo.
    finalizarEncontroAleatorio: () => {
      const e = get().aleatorioEstado()
      get().salvarAleatorio({ ativo: null, proxima: (e.tempo || 0) + ALEATORIO_INTERVALO_S })
    },

    // Dominar o território a partir da cena: marca todos os pontos + o chefe,
    // pra estadoTerritorio() reconhecer 'dominado' e a próxima região abrir.
    dominarTerritorioViaCena: (territorioId, pontoIds = []) => {
      set(state => {
        const atual = state.storyProgress[territorioId] || { pontos: [], chefe: false }
        const pontos = Array.from(new Set([...(atual.pontos || []), ...pontoIds]))
        return { storyProgress: { ...state.storyProgress, [territorioId]: { pontos, chefe: true } } }
      })
      get()._persistStory()
    },
  }
}
