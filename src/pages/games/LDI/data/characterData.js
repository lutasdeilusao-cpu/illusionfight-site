export const ATTR_TOOLTIPS = {
  F: 'Potência (F): Dano em combate corpo a corpo. Essencial no modo Mãos Livres e Armado. Quanto maior, mais PV você tira por ataque.',
  H: 'Agilidade (H): Velocidade e iniciativa. Essencial para agir primeiro e esquivar. Favorece o modo Armado e aumenta sua FD.',
  R: 'Resistência (R): Seu HP máximo (PV = R × 5). Vital em qualquer modo. Sem resistência, você não dura até o final.',
  A: 'Proteção (A): Redução de dano e defesa. Favorece o modo Mãos Livres. Aumenta sua FD e resistência a dano.',
  PdF: 'Poder Elemental (PdF): Dano elemental e PM máximo (PM = PdF × 4). Essencial no modo Poder. Libera ataques elementais.',
}

export const ADVANTAGES = [
  { id: 'reflexos_rapidos', name: 'Reflexos Rápidos', cost: 2, desc: 'Sua reação é mais rápida que a média do LDI. Você ganha +1 em rolagens de iniciativa e pode agir primeiro mesmo contra oponentes mais velozes.' },
  { id: 'corpo_adaptado', name: 'Corpo Adaptado', cost: 2, desc: 'Seu corpo já se acostumou com os rigores do LDI. Reduza todo dano físico recebido em 1 ponto.' },
  { id: 'sangue_frio', name: 'Sangue Frio', cost: 3, desc: 'Situações extremas não te abalam. Você ignora penalidades por estado crítico de PV e não sofre medo em combate.' },
  { id: 'sintonia_elemental', name: 'Sintonia Elemental', cost: 3, desc: 'Sua conexão com o elemento é natural. Seus ataques de Poder custam 1 PM a menos.' },
  { id: 'mestre_arma', name: 'Mestre de Arma', cost: 2, desc: 'Com sua arma preferida, você é letal. +1 de dano com sua arma atual.' },
  { id: 'leitura_combate', name: 'Leitura de Combate', cost: 2, desc: 'Você antecipa os movimentos do inimigo. +1 em FD contra o primeiro ataque de cada turno.' },
  { id: 'regeneracao_rapida', name: 'Regeneração Rápida', cost: 3, desc: 'Seu corpo se recupera mais rápido dentro do LDI. Recupere 1 PV por turno de combate.' },
  { id: 'foco_mental', name: 'Foco Mental', cost: 2, desc: 'Sua concentração é uma arma. +1 em FA no modo Poder.' },
]

export const DISADVANTAGES = [
  { id: 'corpo_fragil', name: 'Corpo Frágil', gain: 2, desc: 'Seu corpo não se adapta bem ao LDI. Seu PV máximo é reduzido em 2.' },
  { id: 'medo_arena', name: 'Medo da Arena', gain: 2, desc: 'A arena te intimida. Você sofre -1 em FA no primeiro turno de cada combate.' },
  { id: 'impulsivo', name: 'Impulsivo', gain: 2, desc: 'Você age antes de pensar. Toda fuga em combate tem chance de falhar (rolagem 1-3 em d6 falha).' },
  { id: 'sobrecarga_sensorial', name: 'Sobrecarga Sensorial', gain: 3, desc: 'O LDI sobrecarrega seus sentidos. Você perde 1 PM no início de cada combate.' },
  { id: 'desconfiado', name: 'Desconfiado', gain: 1, desc: 'Você confia em poucos. Algumas escolhas de diálogo podem não estar disponíveis.' },
  { id: 'dreno_energetico', name: 'Dreno Energético', gain: 2, desc: 'O sistema drena sua energia. Você recupera 1 PM a menos por dia.' },
  { id: 'ataduras_frageis', name: 'Ataduras Frágeis', gain: 2, desc: 'Seus equipamentos de cura são ineficientes. Cura recebida é reduzida em 1.' },
  { id: 'marca_visivel', name: 'Marca Visível', gain: 1, desc: 'Você tem uma marca digital única que inimigos reconhecem. Alguns inimigos serão mais agressivos.' },
]

export const PERKS = [
  { id: 'pericia_katana', name: 'Perícia: Katana', cost: 1, desc: 'Você sabe usar katanas com maestria. Requer Katana equipada. +1 FA no modo Armado com katana.' },
  { id: 'pericia_laminas', name: 'Perícia: Lâminas Gêmeas', cost: 1, desc: 'Você domina o uso de duas lâminas. Requer Lâminas Gêmeas. +1 no dano total.' },
  { id: 'pericia_corrente', name: 'Perícia: Lâmina de Corrente', cost: 1, desc: 'Você manuseia a corrente com habilidade. Requer Lâmina de Corrente. +1 FD quando usando corrente.' },
  { id: 'esquiva_agil', name: 'Esquiva Ágil', cost: 1, desc: 'Você possui reflexos treinados. +1 FD se sua H for maior que a do inimigo.' },
  { id: 'golpe_pesado', name: 'Golpe Pesado', cost: 2, desc: 'Seus golpes carregam força bruta. +2 de dano em crítico (FA - FD ≥ 5).' },
  { id: 'postura_defensiva', name: 'Postura Defensiva', cost: 1, desc: 'Você sabe se proteger. +2 FD, mas -1 FA neste turno.' },
  { id: 'ataque_preciso', name: 'Ataque Preciso', cost: 1, desc: 'Você mira com calma. Se escolher não atacar em um turno, +2 FA no próximo.' },
  { id: 'canalizacao', name: 'Canalização', cost: 2, desc: 'Você canaliza poder elemental com eficiência. Seus ataques no modo Poder ignoram 2 pontos de FD.' },
]

export const SPECIALIZATIONS = [
  { id: 'espec_combate', name: 'Combate Total', desc: 'Especializado em combate direto. Ganhe +1 FA e +1 FD em combate, mas -1 em testes furtivos.' },
  { id: 'espec_tecnico', name: 'Técnico de Arena', desc: 'Você entende os sistemas do LDI. Reduza o custo de ações especiais em 1 PM.' },
  { id: 'espec_furtivo', name: 'Sombra Digital', desc: 'Você se move nas bordas do sistema. Ações furtivas têm vantagem e você pode fugir de combates sem penalidade.' },
  { id: 'espec_suporte', name: 'Suporte Tático', desc: 'Você apoia aliados (se houver). +1 PV de cura em descansos e pode compartilhar PM com aliados.' },
  { id: 'espec_elemental', name: 'Elemental Puro', desc: 'Sua conexão elemental é máxima. No modo Poder, você pode gastar 2 PM extras para dobrar o dano elemental.' },
]
