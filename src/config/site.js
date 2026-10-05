export const SITE_CONFIG = {
  TRIAL_MODE: true,
  SITE_NAME: "Illusion Fight",
  SITE_NAME_PT: "Lutas de Ilusão",
  DOMAIN: "illusionfight.com",
}

import { isReleased, resolveAccessLevel } from '../lib/releaseAccess'
import { BETA_CONTOS_PUBLICO } from './trial'
import { creatorAtivo } from '../lib/creator'

/** Verifica se um item (capítulo/episódio) está disponível com base na data de publicação.
 *  Admins sempre veem disponível (isAdmin = true). Item marcado `creator: true`
 *  no dado abre pra quem tem a tag de creator ativa. */
export function estaDisponivel(item, isAdmin = false, auth = {}) {
  if (isAdmin) return true
  if (item?.creator && creatorAtivo(auth.perfil)) return true
  return isReleased(item, resolveAccessLevel(auth.user, auth.perfil))
}

/** Liberação dos Contos de Ilusão. Durante a fase de feedback (flag
 *  BETA_CONTOS_PUBLICO), todos os capítulos ficam abertos, com ou sem
 *  conta. Fora da beta, cai na regra normal de data. */
export function contoLiberado(item, isAdmin = false, auth = {}) {
  if (BETA_CONTOS_PUBLICO) return true
  return estaDisponivel(item, isAdmin, auth)
}
