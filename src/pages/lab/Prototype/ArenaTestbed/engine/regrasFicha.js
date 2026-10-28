const MAX_FICHAS = 9
// Tamanho máximo dos times: até 4 do lado do jogador e até 10 inimigos (grupo grande é de inimigo fraco).
export const MAX_TIME_JOGADOR = 4
export const MAX_TIME_INIMIGO = 10
const MAX_PERSONAGENS_BATALHA = MAX_TIME_JOGADOR
export const CORES_DISPONIVEIS = ['#00ff88', '#4488ff', '#ffcc00', '#ff5ad1']
export const NOMES_DISPONIVEIS = ['Jogador 1', 'Jogador 2', 'Jogador 3', 'Jogador 4']

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
