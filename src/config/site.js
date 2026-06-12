export const SITE_CONFIG = {
  TRIAL_MODE: true,
  SITE_NAME: "Illusion Fight",
  SITE_NAME_PT: "Lutas de Ilusão",
  DOMAIN: "illusionfight.com",
}

/** Verifica se um capítulo do livro está disponível com base na data de publicação */
export function estaDisponivel(capitulo) {
  if (!capitulo || !capitulo.data_publicacao) return false
  const hoje = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return capitulo.data_publicacao <= hoje
}
