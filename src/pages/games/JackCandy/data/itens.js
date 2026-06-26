// Todos os itens do jogo — Arcos I, II, III
// Pronto para i18n: cada item tem nome, desc, moeda

export const ITENS = {
  // === ARCO I - MARELIA - Pajé ===
  bengala_steampunk: {
    id: 'bengala_steampunk', nome: 'Bengala Steampunk', preco: 100, moeda: 'cerveja',
    desc: 'bengala de madeira com engrenagens douradas.', dano: 2, slot: 'arma',
  },
  sapatos_couro: {
    id: 'sapatos_couro', nome: 'Sapatos de Couro', preco: 200, moeda: 'cerveja',
    desc: 'gastos. firmes. fazem menos barulho.', capPerSeg: 1, slot: 'acessorio',
  },
  relogio_bolso: {
    id: 'relogio_bolso', nome: 'Relógio de Bolso', preco: 300, moeda: 'cerveja',
    desc: 'prata. parado há muito tempo.', combatSpeed: 1, slot: 'acessorio',
  },

  // === ARCO I - MARELIA - Kim (Boteco do Jazz) ===
  cachaca: {
    id: 'cachaca', nome: 'Cachaça', preco: 15, moeda: 'cerveja',
    desc: 'copo sujo. queima descendo. cura 5 HP.', cura: 5,
  },
  paleto_noir: {
    id: 'paleto_noir', nome: 'Paletó Noir', preco: 350, moeda: 'cerveja',
    desc: 'escuro como a noite. +1 dano, +5 Moral max.', dano: 1, hpMaxBonus: 5, slot: 'armadura',
  },
  gravata_vermelha: {
    id: 'gravata_vermelha', nome: 'Gravata Vermelha', preco: 180, moeda: 'cerveja',
    desc: 'seda. manchada de vinho. +2 cervejas/s.', capPerSeg: 2, slot: 'acessorio',
  },
  upgrade_bengala_1: {
    id: 'upgrade_bengala_1', nome: 'Upgrade Bengala +1', preco: 100, moeda: 'cerveja',
    desc: 'reforça a bengala. +1 dano.', danoBonus: 1,
  },
  upgrade_bengala_2: {
    id: 'upgrade_bengala_2', nome: 'Upgrade Bengala +2', preco: 250, moeda: 'cerveja',
    desc: 'bengala mais pesada. +1 dano.', danoBonus: 1,
  },
  energetico: {
    id: 'energetico', nome: 'Energético', preco: 30, moeda: 'cerveja',
    desc: 'lata amassada. cura 10 HP.', cura: 10,
  },

  // === ARCO I - MARELIA - Osvaldo (Oficina) ===
  armadura_couro: {
    id: 'armadura_couro', nome: 'Armadura de Couro', preco: 400, moeda: 'cerveja',
    desc: 'proteção contra facadas. +10 Moral max.', hpMaxBonus: 10, slot: 'armadura',
    desbloqueiaFlag: 'CORTICO_LIBERADO',
  },
  bengala_encantada: {
    id: 'bengala_encantada', nome: 'Bengala Encantada', preco: 500, moeda: 'nota',
    desc: 'fios de cobre. pulsando. dano +4.', dano: 4, slot: 'arma',
  },

  // === ARCO I - MARELIA - Lara (Risca a Faca) ===
  colete_reforcado: {
    id: 'colete_reforcado', nome: 'Colete Reforçado', preco: 600, moeda: 'cerveja',
    desc: 'reduz dano recebido em 1. discreto.', reducaoDano: 1, slot: 'armadura',
  },
  canivete: {
    id: 'canivete', nome: 'Canivete', preco: 400, moeda: 'nota',
    desc: 'lâmina curta. rápida. dano +3.', dano: 3, slot: 'arma',
  },
  cigarro_marelia: {
    id: 'cigarro_marelia', nome: 'Cigarro de Marelia', preco: 50, moeda: 'nota',
    desc: 'cigarro avulso. cura 15 HP.', cura: 15,
  },

  // === ARCO II - AURANIS - Karim ===
  protetor_costelas: {
    id: 'protetor_costelas', nome: 'Protetor de Costelas', preco: 800, moeda: 'cerveja',
    desc: 'acolchoado. +15 Moral max.', hpMaxBonus: 15, slot: 'armadura',
  },
  luvas_pesadas: {
    id: 'luvas_pesadas', nome: 'Luvas Pesadas', preco: 500, moeda: 'cerveja',
    desc: 'couro com ferro nas juntas. dano +3.', dano: 3, slot: 'arma',
  },
  kit_medico: {
    id: 'kit_medico', nome: 'Kit Médico', preco: 80, moeda: 'cerveja',
    desc: 'ataduras e antisséptico. cura 25 HP.', cura: 25,
  },

  // === ARCO II - AURANIS - Operativo (Mercado Negro) ===
  casaco_kevlar: {
    id: 'casaco_kevlar', nome: 'Casaco de Kevlar', preco: 15, moeda: 'fragmento',
    desc: '+20 Moral max. reduz dano em 2.', hpMaxBonus: 20, reducaoDano: 2, slot: 'armadura',
  },
  bengala_choque: {
    id: 'bengala_choque', nome: 'Bengala de Choque', preco: 20, moeda: 'fragmento',
    desc: 'eletricidade correndo no metal. dano +5.', dano: 5, slot: 'arma',
  },
  antidoto: {
    id: 'antidoto', nome: 'Antídoto', preco: 10, moeda: 'fragmento',
    desc: 'líquido verde. cura 30 HP.', cura: 30,
  },

  // === ARCO III - KARNAZAR - Tira (loja secreta) ===
  trench_coat: {
    id: 'trench_coat', nome: 'Trench Coat Noir', preco: 40, moeda: 'fragmento',
    desc: 'pesado. faz você parecer maior. dano +3, Moral +20.', dano: 3, hpMaxBonus: 20, slot: 'armadura',
  },
  bengala_avo: {
    id: 'bengala_avo', nome: 'Bengala do Avô', preco: 60, moeda: 'fragmento',
    desc: 'pertenceu a alguém antes de você. dano +8.', dano: 8, slot: 'arma',
  },
  ultimo_cigarro: {
    id: 'ultimo_cigarro', nome: 'Último Cigarro', preco: 25, moeda: 'fragmento',
    desc: 'o último. cura Moral total.', cura: 9999, unico: true,
  },
}
