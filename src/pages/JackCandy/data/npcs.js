// Todos os NPCs do jogo — Arcos I, II, III
// Pronto para i18n: cada NPC tem nome, saudacao, interior

export const NPCS = {
  // === ARCO I — MARELIA ===
  paje: {
    id: 'paje', nome: 'Pajé',
    saudacao: '"cheguei pra divar. o que vai ser?"',
    interior: 'Barraca do Pajé',
    itens: ['bengala_steampunk', 'sapatos_couro', 'relogio_bolso'],
  },
  kim: {
    id: 'kim', nome: 'Kim',
    saudacao: '"sobreviveu. parabéns. quer uma cerveja?"',
    saudacao_noite: '"última rodada. o que vai ser?"',
    interior: 'Boteco do Jazz',
    itens: ['cachaca', 'paleto_noir', 'gravata_vermelha', 'upgrade_bengala_1', 'upgrade_bengala_2', 'energetico'],
    requerFlag: 'KIM_LIBERADO',
    aliado: { custo: 20, efeito: 'reduz dano recebido em 1', moeda: 'nota' },
  },
  nina: {
    id: 'nina', nome: 'Nina',
    saudacao: '"casos em andamento. volte mais tarde."',
    interior: 'Delegacia',
    itens: [],
    requerFlag: 'NINA_LIBERADO',
    missoes: [
      { id: 'informante', nome: 'O Informante', flag: 'INFORMANTE_ID', disponivel: true },
    ],
    aliado: { custo: 15, efeito: 'aumenta drop de notas em 50%', moeda: 'nota' },
  },
  osvaldo: {
    id: 'osvaldo', nome: 'Osvaldo',
    saudacao: '"pode deixar comigo."',
    interior: 'Oficina',
    itens: ['armadura_couro', 'bengala_encantada'],
    requerFlag: 'OSVALDO_LIBERADO',
    missao_investigacao: 'osvaldo_desapareceu',
  },
  lara: {
    id: 'lara', nome: 'Lara',
    saudacao: '"você sobreviveu à rua. isso é suficiente pra entrar."',
    saudacao_dia: '"fechado. volte quando escurecer."',
    interior: 'Risca a Faca',
    itens: ['colete_reforcado', 'canivete', 'cigarro_marelia'],
    requerFlag: 'RISCA_FACA_LIBERADO',
  },

  // === ARCO II — AURANIS ===
  karim: {
    id: 'karim', nome: 'Karim',
    saudacao: '"vi o vídeo. todo mundo viu. tem coisas piores pela frente."',
    interior: 'Pensão da Rua 7',
    itens: ['protetor_costelas', 'luvas_pesadas', 'kit_medico'],
    missoes: [
      { id: 'favor_karim', nome: 'O Favor de Karim', flag: 'KARIM_CONFIA', disponivel: true },
    ],
  },
  operativo: {
    id: 'operativo', nome: 'Operativo',
    saudacao: '"informação custa. você tem o quê."',
    interior: 'Mercado Negro',
    itens: ['casaco_kevlar', 'bengala_choque', 'antidoto'],
    moeda: 'fragmento',
  },

  // === ARCO III — KARNAZAR ===
  viran: {
    id: 'viran', nome: 'Viran',
    saudacao: '"você chegou longe. isso ou é talento ou é teimosia. nos dois casos, senta."',
    saudacao_1: '"primeira sessão completa. o corpo aprende antes da mente."',
    saudacao_2: '"segunda sessão. você tá mais rápido. ou eu tô mais velho."',
    saudacao_3: '"última lição. depois dessa você não precisa mais de mim."',
    interior: 'Dojô de Viran',
    itens: [],
    missoes: [
      { id: 'viran_1', nome: 'Primeira Sessão', flag: 'VIRAN_1', desc: 'Complete Rua Branca com HP > 50%' },
      { id: 'viran_2', nome: 'Segunda Sessão', flag: 'VIRAN_2', desc: 'Complete Porto Seco' },
      { id: 'viran_3', nome: 'Última Lição', flag: 'VIRAN_APROVOU', desc: 'Visite O Escuro' },
    ],
  },
  tira: {
    id: 'tira', nome: 'Tira',
    saudacao: '"eu analisei cada frame. cada frame. você sabe o que eu encontrei."',
    interior: 'Observatório',
    itens: [],
    loja_secreta: ['trench_coat', 'bengala_avo', 'ultimo_cigarro'],
    requerFlagLoja: 'TIRA_CONFIA',
    missoes: [
      { id: 'arquivo', nome: 'O Arquivo', flag: 'TIRA_CONFIA', disponivel: true },
    ],
  },
  shuntaro: {
    id: 'shuntaro', nome: 'Shuntaro',
    saudacao: '"ele veio de longe pra isso."',
    interior: null,
    itens: [],
    aliado: { custo: 30, efeito: 'aumenta dano em 2 por round', moeda: 'nota', requerFlag: 'KRONOS_VIU' },
  },
}
