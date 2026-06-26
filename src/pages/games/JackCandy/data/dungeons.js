// Todas as dungeons — Arcos I, II, III
// Pronto para i18n: cada dungeon tem nome, desc

export const DUNGEONS = {
  // === ARCO I — MARELIA ===
  anexo: {
    id: 'anexo', nome: 'O Anexo', desc: 'o anexo dos fundos. no sonho era sempre o mesmo mas os rostos mudavam.',
    emoji: '🏚️', inimigos: 3, inimigoHp: 3, inimigoDmg: 1,
    dropCap: 30, dropNotas: 0,
    desbloqueiaFlag: 'ANEXO_COMPLETO',
    tutorial: true,
  },
  onibus: {
    id: 'onibus', nome: 'O Ônibus', desc: 'um ônibus abandonado. dentro, avatares sem rosto.',
    emoji: '🚌', inimigos: 5, inimigoHp: 4, inimigoDmg: 1,
    dropCap: 80, dropNotas: 0,
    desbloqueiaFlag: 'NOTAS_LIBERADO',
    proximaDungeon: 'rua',
  },
  onibus_noturno: {
    id: 'onibus_noturno', nome: 'Ônibus Noturno', desc: 'o mesmo ônibus. mas a rota nunca termina.',
    emoji: '🚌', infinito: true,
    dropCap: 30,
    requerFlag: 'NOTAS_LIBERADO',
    escalaComNivel: true,
  },
  rua: {
    id: 'rua', nome: 'A Rua de Marelia', desc: 'a rua que não termina. os passos ecoam.',
    emoji: '🏚️', inimigos: 8, inimigoHp: 6, inimigoDmg: 2,
    boss: { nome: 'Cobrador Fantasma', hp: 20, dmg: 3 },
    dropCap: 150, dropNotas: 5,
    desbloqueiaFlag: 'NINA_LIBERADO',
    requerDungeon: 'onibus',
  },
  risca_faca_interior: {
    id: 'risca_faca_interior', nome: 'Risca a Faca (Interior)', desc: 'o clube por dentro. música alta. gente demais.',
    emoji: '💃', inimigos: 10, inimigoHp: 7, inimigoDmg: 2,
    boss: { nome: 'Segurança Veterano', hp: 25, dmg: 4 },
    dropCap: 200, dropNotas: 10,
    desbloqueiaFlag: 'RISCA_FACA_VITORIA',
    requerFlag: 'RISCA_FACA_LIBERADO',
    mecanica: 'stealth',
  },

  // === ARCO II — AURANIS ===
  porto_velho: {
    id: 'porto_velho', nome: 'Porto Velho', desc: 'contêineres enferrujados. o cheiro do mar apodreceu.',
    emoji: '⚓', inimigos: 10, inimigoHp: 8, inimigoDmg: 3,
    boss: { nome: 'Doceiro', hp: 30, dmg: 5 },
    dropCap: 200, dropNotas: 0, dropFragmentos: 10,
    desbloqueiaFlag: 'PORTO_COMPLETO',
  },
  doca_abandonada: {
    id: 'doca_abandonada', nome: 'Doca Abandonada', desc: 'madeira podre. a água não reflete.',
    emoji: '🌑', inimigos: 12, inimigoHp: 10, inimigoDmg: 3,
    dropCap: 250, dropNotas: 0, dropFragmentos: 15,
    desbloqueiaFlag: 'DOCA_COMPLETA',
    requerFlag: 'KARIM_CONFIA',
    noturna: true,
  },
  torre_kronos: {
    id: 'torre_kronos', nome: 'Torre Kronos', desc: 'a torre não tinha fim visível. no sonho as torres nunca têm.',
    emoji: '🗼', mecanica: 'fuga',
    rounds: 15, danoPorFalha: 5,
    dropCap: 500, desbloqueiaFlag: 'KRONOS_VIU',
    requerFlag: 'DOCA_COMPLETA',
  },

  // === ARCO III — KARNAZAR ===
  rua_branca: {
    id: 'rua_branca', nome: 'Rua Branca', desc: 'neve suja. pegadas que vão e voltam sozinhas.',
    emoji: '🌨️', inimigos: 15, inimigoHp: 12, inimigoDmg: 4,
    boss: { nome: 'Cobrador do Norte', hp: 40, dmg: 6 },
    dropCap: 400, dropNotas: 0, dropFragmentos: 20,
    desbloqueiaFlag: 'RUA_BRANCA_COMPLETA',
  },
  porto_seco: {
    id: 'porto_seco', nome: 'Porto Seco', desc: 'navios encalhados na terra. o seco é pior que o molhado.',
    emoji: '🏚️', inimigos: 18, inimigoHp: 15, inimigoDmg: 5,
    boss: { nome: 'Capitão Sem Nome', hp: 50, dmg: 7 },
    dropCap: 500, dropNotas: 0, dropFragmentos: 30,
    desbloqueiaFlag: 'PORTO_SECO_COMPLETO',
    requerFlag: 'VIRAN_APROVOU',
  },
  ilha_privada: {
    id: 'ilha_privada', nome: 'Ilha Privada', desc: 'o fim do sonho. ou o começo de outra coisa.',
    emoji: '🏝️', estagios: 2,
    estagio1: { inimigos: 20, inimigoHp: 18, inimigoDmg: 6 },
    estagio2: {
      boss: { nome: 'Kronos', hp: 100, dmg: 8, mecanica: 'fase', fases: [0, 25, 50, 75], bonusDmgPorFase: 2 },
    },
    dropCap: 2000, dropFragmentos: 100,
    desbloqueiaFlag: 'KRONOS_DERROTADO',
    requerFlag: 'ILHA_PRIVADA_LIBERADA',
  },
}
