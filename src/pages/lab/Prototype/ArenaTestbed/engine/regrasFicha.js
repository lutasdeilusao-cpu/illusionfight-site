const MAX_FICHAS = 9
const MAX_PERSONAGENS_BATALHA = 3
const CORES_DISPONIVEIS = ['#00ff88', '#4488ff', '#ffcc00']
const NOMES_DISPONIVEIS = ['Kim', 'Jack', 'Nina']

export function podeSalvarNovaFicha(fichasExistentes) {
  if (fichasExistentes.length >= MAX_FICHAS) {
    return { permitido: false, motivo: `fichaStorage.max_fichas (${MAX_FICHAS})` }
  }
  return { permitido: true }
}

export function podeAdicionarPersonagemABatalha(personagensJaSelecionados) {
  if (personagensJaSelecionados.length >= MAX_PERSONAGENS_BATALHA) {
    return { permitido: false, motivo: `fichaStorage.max_personagens (${MAX_PERSONAGENS_BATALHA})` }
  }
  return { permitido: true }
}

export function corDisponivel(corEscolhida, personagensJaPersonalizados) {
  return !personagensJaPersonalizados.some(p => p.aparencia?.cor === corEscolhida)
}

export function nomeDisponivel(nomeEscolhido, personagensJaPersonalizados) {
  return !personagensJaPersonalizados.some(p => p.aparencia?.nome === nomeEscolhido)
}

export function getCoresDisponiveis(personagensJaPersonalizados) {
  return CORES_DISPONIVEIS.filter(c => corDisponivel(c, personagensJaPersonalizados))
}

export function getNomesDisponiveis(personagensJaPersonalizados) {
  return NOMES_DISPONIVEIS.filter(n => nomeDisponivel(n, personagensJaPersonalizados))
}
