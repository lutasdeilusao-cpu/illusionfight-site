// LDI DUELO — CAMPO DE BATALHA v2.0
// 60 cartas: 30 monstros | 15 magias | 15 armadilhas
// Atributos conforme GDD v1.0 — Campo de Batalha

const CARDS = [
  // ═══ MONSTROS (30) ═══
  { id_num: 1,  name: 'Candidato SDR',             type: 'MONSTER', atk: 500,  def: 400,  mov: 3, rng: 1, desc: 'Aspirante ao ranking. Estreante.' },
  { id_num: 2,  name: 'Candidato SDR',             type: 'MONSTER', atk: 500,  def: 400,  mov: 3, rng: 1, desc: 'Aspirante ao ranking. Estreante.' },
  { id_num: 3,  name: 'Duelista de Bairro',        type: 'MONSTER', atk: 700,  def: 200,  mov: 4, rng: 1, desc: 'Campeão do beco. Rua, não arena.' },
  { id_num: 4,  name: 'Duelista de Bairro',        type: 'MONSTER', atk: 700,  def: 200,  mov: 4, rng: 1, desc: 'Campeão do beco. Rua, não arena.' },
  { id_num: 5,  name: 'Patrulheiro Yohualticit',   type: 'MONSTER', atk: 900,  def: 600,  mov: 3, rng: 2, desc: 'Yohu emprega milhares. Este é um deles.' },
  { id_num: 6,  name: 'Patrulheiro Yohualticit',   type: 'MONSTER', atk: 900,  def: 600,  mov: 3, rng: 2, desc: 'Yohu emprega milhares. Este é um deles.' },
  { id_num: 7,  name: 'Guerreiro Primordial',      type: 'MONSTER', atk: 1100, def: 800,  mov: 3, rng: 1, desc: 'Lutador que sente o elemental.' },
  { id_num: 8,  name: 'Guerreiro Primordial',      type: 'MONSTER', atk: 1100, def: 800,  mov: 3, rng: 1, desc: 'Lutador que sente o elemental.' },
  { id_num: 9,  name: 'Recruta da Elite Academy',  type: 'MONSTER', atk: 1000, def: 1000, mov: 2, rng: 1, desc: 'Primeiro ano. Última chance.' },
  { id_num: 10, name: 'Recruta da Elite Academy',  type: 'MONSTER', atk: 1000, def: 1000, mov: 2, rng: 1, desc: 'Primeiro ano. Última chance.' },
  { id_num: 11, name: 'Garota de Marelia',         type: 'MONSTER', atk: 850,  def: 950,  mov: 3, rng: 2, desc: 'Cresceu vendo a arena pelo vidro. Agora está dentro.' },
  { id_num: 12, name: 'Garota de Marelia',         type: 'MONSTER', atk: 850,  def: 950,  mov: 3, rng: 2, desc: 'Cresceu vendo a arena pelo vidro. Agora está dentro.' },
  { id_num: 13, name: 'Lancer do SDR',             type: 'MONSTER', atk: 1400, def: 900,  mov: 2, rng: 3, desc: 'Alcançou top 5000. Não é pouco.' },
  { id_num: 14, name: 'Lancer do SDR',             type: 'MONSTER', atk: 1400, def: 900,  mov: 2, rng: 3, desc: 'Alcançou top 5000. Não é pouco.' },
  { id_num: 15, name: 'Sentinela Yohualticit',     type: 'MONSTER', atk: 1200, def: 1300, mov: 2, rng: 2, desc: 'Guarda a fronteira entre o físico e o virtual.' },
  { id_num: 16, name: 'Sentinela Yohualticit',     type: 'MONSTER', atk: 1200, def: 1300, mov: 2, rng: 2, desc: 'Guarda a fronteira entre o físico e o virtual.' },
  { id_num: 17, name: 'Corredor de Azuma',         type: 'MONSTER', atk: 1500, def: 700,  mov: 4, rng: 1, desc: 'Velocidade antes de força. Escola de Azuma.' },
  { id_num: 18, name: 'Corredor de Azuma',         type: 'MONSTER', atk: 1500, def: 700,  mov: 4, rng: 1, desc: 'Velocidade antes de força. Escola de Azuma.' },
  { id_num: 19, name: 'Tanque de Davoss',          type: 'MONSTER', atk: 1100, def: 1500, mov: 1, rng: 1, desc: 'A ilha de Kronos cria guerreiros que não caem.' },
  { id_num: 20, name: 'Tanque de Davoss',          type: 'MONSTER', atk: 1100, def: 1500, mov: 1, rng: 1, desc: 'A ilha de Kronos cria guerreiros que não caem.' },
  { id_num: 21, name: 'Kim — Modo Xamã',           type: 'MONSTER', atk: 2000, def: 1500, mov: 2, rng: 3, desc: 'O Sangue Primordial desperta.' },
  { id_num: 22, name: 'Jack — San Tien Kwan',      type: 'MONSTER', atk: 1800, def: 1600, mov: 3, rng: 2, desc: 'O bastão gira e o mundo desacelera.' },
  { id_num: 23, name: 'Nina — Angel Blade',        type: 'MONSTER', atk: 2100, def: 1200, mov: 3, rng: 1, desc: 'A katana que não perdoa.' },
  { id_num: 24, name: 'Kaeda',                     type: 'MONSTER', atk: 1900, def: 1400, mov: 2, rng: 2, desc: 'Top 300 no SDR. Cada movimento calculado.' },
  { id_num: 25, name: 'Shuntaro',                  type: 'MONSTER', atk: 1700, def: 1700, mov: 2, rng: 2, desc: 'Ranking 998. Equilíbrio perfeito.' },
  { id_num: 26, name: 'GhostPulse',                type: 'MONSTER', atk: 2000, def: 1100, mov: 4, rng: 2, desc: 'Você não vê de onde o golpe vem.' },
  { id_num: 27, name: 'VoidHunter_X',              type: 'MONSTER', atk: 2800, def: 2000, mov: 2, rng: 1, desc: 'Armadura near-black. Braços longos demais.' },
  { id_num: 28, name: 'StormByte_91',              type: 'MONSTER', atk: 2600, def: 1800, mov: 3, rng: 2, desc: 'Hacker de elite. Sombra no sistema.' },
  { id_num: 29, name: 'IronVeil',                  type: 'MONSTER', atk: 2300, def: 2400, mov: 1, rng: 2, desc: 'O tanque do SDR. Derrubá-lo custa caro.' },
  { id_num: 30, name: 'Mestre Viran',              type: 'MONSTER', atk: 3200, def: 2800, mov: 2, rng: 1, desc: 'O Dojô não cai. O mestre não perde.' },

  // ═══ MAGIAS (15) ═══
  { id_num: 31, name: 'Inversão Total',        type: 'SPELL', effect: 'SWAP_ATK_DEF', effectValue: 0,   duracao: 2,   desc: 'Troca ATK e DEF de monstro alvo por 2 turnos.' },
  { id_num: 32, name: 'Recuo Forçado',         type: 'SPELL', effect: 'PUSH',          effectValue: 3,   duracao: 0,   desc: 'Empurra monstro inimigo 3 casas para trás.' },
  { id_num: 33, name: 'Teletransporte',        type: 'SPELL', effect: 'TELEPORT',      effectValue: 0,   duracao: 0,   desc: 'Move monstro aliado para qualquer casa vazia.' },
  { id_num: 34, name: 'Campo de Força',        type: 'SPELL', effect: 'BARRIER',       effectValue: 3,   duracao: 3,   desc: 'Barreira em linha de 3 casas intransponível.' },
  { id_num: 35, name: 'Amplificação',          type: 'SPELL', effect: 'ATK_BOOST',     effectValue: 800, duracao: 2,   desc: '+800 ATK em monstro aliado por 2 turnos.' },
  { id_num: 36, name: 'Armadura Sagrada',      type: 'SPELL', effect: 'DEF_BOOST',     effectValue: 1000,duracao: 2,   desc: '+1000 DEF em monstro aliado por 2 turnos.' },
  { id_num: 37, name: 'Raio Devastador',       type: 'SPELL', effect: 'BURN',          effectValue: 500, duracao: 0,   desc: '500 de dano direto nos pontos de vida inimigos.' },
  { id_num: 38, name: 'Duplicata',             type: 'SPELL', effect: 'DUPLICATE',     effectValue: 50,  duracao: 2,   desc: 'Cópia com ATK/DEF 50% de monstro aliado por 2 turnos.' },
  { id_num: 39, name: 'Paralisia',             type: 'SPELL', effect: 'PARALYZE',      effectValue: 0,   duracao: 2,   desc: 'MOV de monstro inimigo reduzido a 0 por 2 turnos.' },
  { id_num: 40, name: 'Névoa de Guerra',       type: 'SPELL', effect: 'FOG',           effectValue: 0,   duracao: 1,   desc: 'Oculta posição de todos os aliados por 1 turno.' },
  { id_num: 41, name: 'Dreno de Poder',        type: 'SPELL', effect: 'ATK_REDUCE',    effectValue: 700, duracao: 2,   desc: '-700 ATK em monstro inimigo por 2 turnos.' },
  { id_num: 42, name: 'Cura Emergencial',      type: 'SPELL', effect: 'HEAL',          effectValue: 300, duracao: 0,   desc: 'Restaura 300 pontos de vida.' },
  { id_num: 43, name: 'Velocidade Máxima',     type: 'SPELL', effect: 'MOV_BOOST',     effectValue: 2,   duracao: 2,   desc: '+2 MOV em monstro aliado por 2 turnos.' },
  { id_num: 44, name: 'Mira Precisa',          type: 'SPELL', effect: 'RNG_BOOST',     effectValue: 2,   duracao: 2,   desc: '+2 RNG em monstro aliado por 2 turnos.' },
  { id_num: 45, name: 'Destruição Total',      type: 'SPELL', effect: 'DESTROY',       effectValue: 0,   duracao: 0,   desc: 'Destrói qualquer monstro no campo. Uso único.' },

  // ═══ ARMADILHAS (15) ═══
  { id_num: 46, name: 'Buraco Sem Fundo',   type: 'TRAP', effect: 'SKIP_TURN',  area: 3,  gatilho: 'STEP',     effectValue: 0,   duracao: 0, desc: 'Monstro que pisar perde o turno completo.' },
  { id_num: 47, name: 'Campo Minado',       type: 'TRAP', effect: 'DAMAGE',     area: 1,  gatilho: 'STEP',     effectValue: 400, duracao: 0, desc: '400 de dano direto ao dono do monstro.' },
  { id_num: 48, name: 'Rede de Aço',        type: 'TRAP', effect: 'MOV_ZERO',   area: 2,  gatilho: 'STEP',     effectValue: 0,   duracao: 2, desc: 'MOV reduzido a 0 por 2 turnos.' },
  { id_num: 49, name: 'Espelho Mágico',     type: 'TRAP', effect: 'REFLECT',    area: 1,  gatilho: 'ATTACK',   effectValue: 0,   duracao: 1, desc: 'Reflete dano de volta ao atacante (1 turno).' },
  { id_num: 50, name: 'Alarme Sonoro',      type: 'TRAP', effect: 'REVEAL',     area: 4,  gatilho: 'STEP',     effectValue: 0,   duracao: 1, desc: 'Revela todos monstros inimigos por 1 turno.' },
  { id_num: 51, name: 'Inversão Oculta',    type: 'TRAP', effect: 'SWAP_STATS', area: 1,  gatilho: 'STEP',     effectValue: 0,   duracao: 2, desc: 'Troca ATK e DEF do monstro por 2 turnos.' },
  { id_num: 52, name: 'Labirinto',          type: 'TRAP', effect: 'TELEPORT',   area: 3,  gatilho: 'STEP',     effectValue: 0,   duracao: 0, desc: 'Move o monstro para casa aleatória do tabuleiro.' },
  { id_num: 53, name: 'Veneno Lento',       type: 'TRAP', effect: 'POISON',     area: 2,  gatilho: 'STEP',     effectValue: 200, duracao: 3, desc: '200 de dano por turno por 3 turnos.' },
  { id_num: 54, name: 'Âncora de Ferro',    type: 'TRAP', effect: 'IMMOBILE',   area: 1,  gatilho: 'STEP',     effectValue: 0,   duracao: 3, desc: 'Imobiliza o monstro por 3 turnos.' },
  { id_num: 55, name: 'Ilusão',             type: 'TRAP', effect: 'BETRAY',     area: 2,  gatilho: 'STEP',     effectValue: 0,   duracao: 1, desc: 'Monstro ataca aliado mais próximo no próximo turno.' },
  { id_num: 56, name: 'Redemoinho',         type: 'TRAP', effect: 'PUSH_RANDOM',area: 3,  gatilho: 'STEP',     effectValue: 2,   duracao: 0, desc: 'Empurra o monstro 2 casas em direção aleatória.' },
  { id_num: 57, name: 'Absorção',           type: 'TRAP', effect: 'ATK_DRAIN',  area: 1,  gatilho: 'STEP',     effectValue: 500, duracao: 0, desc: '-500 ATK permanente no monstro.' },
  { id_num: 58, name: 'Espinhos',           type: 'TRAP', effect: 'THORNS',     area: 2,  gatilho: 'STEP',     effectValue: 300, duracao: 0, desc: '300 de dano ao dono do monstro.' },
  { id_num: 59, name: 'Troca de Lugar',     type: 'TRAP', effect: 'SWAP_POS',   area: 1,  gatilho: 'STEP',     effectValue: 0,   duracao: 0, desc: 'Troca posição com o aliado mais próximo.' },
  { id_num: 60, name: 'Colapso',            type: 'TRAP', effect: 'COLLAPSE',   area: 4,  gatilho: 'ADJACENT', effectValue: 0, duracao: 0, desc: 'Destrói o monstro com menor ATK na área.' },
]

export function getCardByNum(num) {
  return CARDS.find(c => c.id_num === num) || null
}

export default CARDS
