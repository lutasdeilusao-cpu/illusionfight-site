export const TELEFONEMA_PADRAO = {
  jack_abertura: {
    pt: "Alô? Alô? Quem é?",
    en: "Hello? Hello? Who is it?",
    es: "¿Hola? ¿Hola? ¿Quién es?",
  },
  suspeito: {
    pt: "Você nunca irá me pegar. Pode desistir.",
    en: "You'll never catch me. Give up.",
    es: "Nunca me atraparás. Ríndete.",
  },
  jack_fechamento: {
    pt: "odeio receber ligação",
    en: "I hate getting calls",
    es: "odio recibir llamadas",
  },
}

const TELEFONEMA_POR_CASO = {
  // Futuras variações por caso podem ser adicionadas aqui
}

export function getTelefonema(casoId) {
  return TELEFONEMA_POR_CASO[casoId] || TELEFONEMA_PADRAO
}
