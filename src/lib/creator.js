/** Programa Creator: a tag mora no perfil (is_creator + creator_ate).
 *  Sem data de validade, vale sem prazo. */
export function creatorAtivo(perfil, hoje = new Date().toISOString().slice(0, 10)) {
  if (perfil?.is_creator !== true) return false
  return !perfil.creator_ate || perfil.creator_ate >= hoje
}

/** Dias que faltam pro acesso acabar (null = sem prazo). */
export function diasDeCreator(perfil, hoje = new Date()) {
  if (!perfil?.creator_ate) return null
  const fim = new Date(`${perfil.creator_ate}T23:59:59`)
  return Math.max(0, Math.ceil((fim - hoje) / 86400000))
}
