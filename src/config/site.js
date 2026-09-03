export const SITE_CONFIG = {
  TRIAL_MODE: true,
  SITE_NAME: "Illusion Fight",
  SITE_NAME_PT: "Lutas de Ilusão",
  DOMAIN: "illusionfight.com",
}

import { isReleased, resolveAccessLevel } from '../lib/releaseAccess'

/** Verifica se um item (capítulo/episódio) está disponível com base na data de publicação.
 *  Admins sempre veem disponível (isAdmin = true). */
export function estaDisponivel(item, isAdmin = false, auth = {}) {
  if (isAdmin) return true
  return isReleased(item, resolveAccessLevel(auth.user, auth.perfil))
}
