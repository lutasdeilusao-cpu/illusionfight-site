export const SITE_CONFIG = {
  TRIAL_MODE: true,
  SITE_NAME: "Illusion Fight",
  SITE_NAME_PT: "Lutas de Ilusão",
  DOMAIN: "illusionfight.com",
}

/** Verifica se um item (capítulo/episódio) está disponível com base na data de publicação.
 *  Admins sempre veem disponível (isAdmin = true). */
export function estaDisponivel(item, isAdmin = false) {
  if (isAdmin) return true
  if (!item || !item.data_publicacao) return false
  const hoje = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return item.data_publicacao <= hoje
}
