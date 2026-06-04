// Centraliza todas as flags do jogo
// Pronto para i18n: chave = nome da flag, valor = descrição (pt-br padrão)

export const FLAGS = {
  // Arco I - Marelia
  TEM_BENGALA: 'comprou a bengala steampunk do Pajé',
  JA_VIU_VILA: 'já viu o monólogo de entrada na vila',
  KIM_LIBERADO: 'Kim está disponível no Boteco do Jazz',
  NINA_LIBERADO: 'completou a dungeon Rua de Marelia',
  OSVALDO_LIBERADO: 'Osvaldo está disponível na Oficina',
  NOTAS_LIBERADO: 'completou a dungeon Ônibus',
  ANEXO_COMPLETO: 'completou a dungeon tutorial Anexo',
  RISCA_FACA_LIBERADO: 'Risca a Faca está disponível',
  CORTICO_LIBERADO: 'Cortiço está disponível',
  TEM_ABRIGO: 'pagou o Cortiço e ganhou +5 HP max permanente',
  TERMINAL_OUVIU: 'ouviu a Analista no Terminal 3 vezes',
  TERMINAL_OUVIDAS: 'contador de visitas ao Terminal (1-3)',
  ESCADARIA_VISITADA: 'encontrou a Escadaria secreta',

  // Arco II - Auranis
  AURANIS_LIBERADO: 'Auranis está disponível',
  PORTO_COMPLETO: 'completou a dungeon Porto Velho',
  KARIM_CONFIA: 'completou a missão de Karim',
  DOCA_COMPLETA: 'completou a dungeon Doca Abandonada',
  KRONOS_VIU: 'encontrou Kronos na Torre',
  RISCA_FACA_VITORIA: 'completou Risca a Faca Interior',
  BOTECO_JAZZ_VISITADO: 'já visitou o Boteco do Jazz',

  // Arco III - Karnazar
  KARNAZAR_LIBERADO: 'Karnazar está disponível',
  VIRAN_1: 'completou Primeira Sessão de Viran',
  VIRAN_2: 'completou Segunda Sessão de Viran',
  VIRAN_APROVOU: 'Viran aprovou o treinamento completo',
  RUA_BRANCA_COMPLETA: 'completou a dungeon Rua Branca',
  PORTO_SECO_COMPLETO: 'completou a dungeon Porto Seco',
  ESCURO_VISITADO: 'visitou O Escuro e encontrou o Pajé sério',
  TIRA_CONFIA: 'Tira confia em você após O Arquivo',
  ILHA_PRIVADA_LIBERADA: 'Ilha Privada está disponível',
  KRONOS_DERROTADO: 'derrotou Kronos na Ilha Privada',

  // Missões de investigação
  OSVALDO_ENCONTRADO: 'encontrou Osvaldo na investigação',
  INFORMANTE_ID: 'descobriu a identidade do informante',
  ORIGEM_CONHECIDA: 'descobriu a origem do poder do Jack',

  // Sistema
  PERIODO: 'DIA ou NOITE',
  JA_VIU_FRAGMENTOS: 'já obteve o primeiro fragmento',

  // Aliados
  ALIADO_KIM_USADO: 'já chamou Kim como aliado',
  ALIADO_NINA_USADO: 'já chamou Nina como aliada',
  ALIADO_SHUNTARO_USADO: 'já chamou Shuntaro como aliado',
}

export function isFlagActive(flags, flagName) {
  return !!flags[flagName]
}
