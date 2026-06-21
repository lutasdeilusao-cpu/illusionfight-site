import { acaoSanguinaria } from './personalidades/sanguinaria'
import { acaoFujona } from './personalidades/fujona'
import { acaoPersistente } from './personalidades/persistente'

export const PERSONALIDADES = {
  sanguinaria: { nome: 'Sanguinária', fn: acaoSanguinaria },
  fujona: { nome: 'Fujona', fn: acaoFujona },
  persistente: { nome: 'Persistente', fn: acaoPersistente },
}

/**
 * Seleciona a personalidade ativa e executa a ação.
 *
 * Para testar uma personalidade específica, mude o valor de `ATIVA` abaixo:
 *   'sanguinaria' | 'fujona' | 'persistente'
 * e comente a linha que importa a função antiga em Phase6Combat.jsx,
 * importando esta no lugar.
 */
const ATIVA = 'sanguinaria'

export function executarPersonalidade(personagem, inimigos, todosPersonagens, obstaculos, cols, rows, itensChao) {
  const pers = PERSONALIDADES[ATIVA]
  if (!pers) {
    throw new Error(`Personalidade "${ATIVA}" não encontrada.`)
  }
  return pers.fn(personagem, inimigos, todosPersonagens, obstaculos, cols, rows, itensChao)
}
