// Slice: progresso de POI/farm/posição dentro da cena navegável. Extraído de
// store/useGanguesStore.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
export default function createGanguesCenaProgressoSlice(set, get) {
  return {
    // Trava o "retrato" de pontos de uma treta repetível na primeira vez que o
    // jogador entra nela — as próximas vezes usam sempre esse mesmo número em
    // vez de recalcular contra o time atual, senão o bando cresceria junto com
    // a gangue e nunca ficaria fácil de farmar de propósito (ver
    // `gerarBandoInimigo` em data/ganguesEncontros.js). Devolve o retrato
    // efetivo (o que já existia, se já tinha sido travado, ou o novo).
    travarPontosFarm: (cenaId, poiId, pontos) => {
      const atual = get().cenaProgresso[cenaId]
      const jaTravado = atual?.pontosFarm?.[poiId]
      if (jaTravado) return jaTravado
      set(state => {
        const base = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
        return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...base, pontosFarm: { ...(base.pontosFarm || {}), [poiId]: pontos } } } }
      })
      get()._persistCena()
      return pontos
    },

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
    // dentro do galpão.
    salvarPosicaoCena: (cenaId, posicao) => {
      if (!cenaId || !Number.isFinite(posicao?.x) || !Number.isFinite(posicao?.y)) return
      set(state => {
        const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
        return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, posicao: { x: Math.round(posicao.x), y: Math.round(posicao.y), local: posicao.local || null } } } }
      })
      get()._persistCena()
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
