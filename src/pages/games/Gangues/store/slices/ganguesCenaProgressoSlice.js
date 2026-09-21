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
    // dentro do galpão.
    salvarPosicaoCena: (cenaId, posicao) => {
      if (!cenaId || !Number.isFinite(posicao?.x) || !Number.isFinite(posicao?.y)) return
      set(state => {
        const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
        return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, posicao: { x: Math.round(posicao.x), y: Math.round(posicao.y), local: posicao.local || null } } } }
      })
      get()._persistCena()
    },

    // "O bicho" — encontro persistente pós-muro (21/09/2026, ver
    // criarBichoPoi/posicaoBicho em engine/ganguesCenaMotor.js). Chamado
    // toda vez que uma luta COM ELE se resolve (vitória ou derrota) —
    // reposiciona mais perto do jogador, nunca em cima dele.
    ativarBicho: (cenaId, pos, distancia) => {
      set(state => {
        const atual = state.cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false }
        return { cenaProgresso: { ...state.cenaProgresso, [cenaId]: { ...atual, bicho: { ativo: true, x: pos.x, y: pos.y, distancia } } } }
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
