export const SITE_CONFIG = {
  TRIAL_MODE: true,
  SITE_NAME: "Illusion Fight",
  SITE_NAME_PT: "Lutas de Ilusão",
  DOMAIN: "illusionfight.com",
}

import { isReleased, resolveAccessLevel } from '../lib/releaseAccess'
import { BETA_CONTOS_PUBLICO, antesDoFechamento } from './trial'
import { creatorAtivo } from '../lib/creator'

/** Verifica se um item (capítulo/episódio) está disponível com base na data de publicação.
 *  Admins sempre veem disponível (isAdmin = true). Item marcado `creator: true`
 *  no dado abre pra quem tem a tag de creator ativa. */
export function estaDisponivel(item, isAdmin = false, auth = {}) {
  if (isAdmin) return true
  if (item?.creator && creatorAtivo(auth.perfil)) return true
  return isReleased(item, resolveAccessLevel(auth.user, auth.perfil))
}

/** Liberação dos Contos de Ilusão. Durante a beta (BETA_CONTOS_PUBLICO) e
 *  até o fechamento de 1º de novembro, todos os capítulos ficam abertos, com
 *  ou sem conta. Depois, cai na regra normal de data. */
export function contoLiberado(item, isAdmin = false, auth = {}) {
  if (BETA_CONTOS_PUBLICO && antesDoFechamento()) return true
  return estaDisponivel(item, isAdmin, auth)
}
