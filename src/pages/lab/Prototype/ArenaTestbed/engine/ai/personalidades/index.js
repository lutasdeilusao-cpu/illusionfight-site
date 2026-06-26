import { acaoSanguinaria } from './sanguinaria'
import { acaoFujona } from './fujona'
import { acaoPersistente } from './persistente'

export const PERSONALIDADES_IA = [
  { id: 'sanguinaria', chaveI18n: 'ia_personalidade_sanguinaria', chaveI18nDescricao: 'ia_personalidade_sanguinaria_desc', fn: acaoSanguinaria },
  { id: 'fujona', chaveI18n: 'ia_personalidade_fujona', chaveI18nDescricao: 'ia_personalidade_fujona_desc', fn: acaoFujona },
  { id: 'persistente', chaveI18n: 'ia_personalidade_persistente', chaveI18nDescricao: 'ia_personalidade_persistente_desc', fn: acaoPersistente },
]

export function getPersonalidadePorId(id) {
  return PERSONALIDADES_IA.find(p => p.id === id)
}
