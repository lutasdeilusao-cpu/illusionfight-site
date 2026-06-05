// LDI DUELO — 60 cartas do MVP (identificador único: id_num)
// Deck padrão: 30 monstros | 15 magias | 15 armadilhas

const CARDS = [
  // — Nível 1 —
  { id_num: 1,  name: 'Candidato SDR',             type: 'MONSTER', level: 1, atk: 500,  def: 400,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Aspirante ao ranking. Estreante.' },
  { id_num: 2,  name: 'Candidato SDR',             type: 'MONSTER', level: 1, atk: 500,  def: 400,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Aspirante ao ranking. Estreante.' },
  { id_num: 3,  name: 'Duelista de Bairro',        type: 'MONSTER', level: 1, atk: 700,  def: 200,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Campeão do beco. Rua, não arena.' },
  { id_num: 4,  name: 'Duelista de Bairro',        type: 'MONSTER', level: 1, atk: 700,  def: 200,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Campeão do beco. Rua, não arena.' },
  // — Nível 2 —
  { id_num: 5,  name: 'Patrulheiro Yohualticit',   type: 'MONSTER', level: 2, atk: 900,  def: 600,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Yohu emprega milhares. Este é um deles.' },
  { id_num: 6,  name: 'Patrulheiro Yohualticit',   type: 'MONSTER', level: 2, atk: 900,  def: 600,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Yohu emprega milhares. Este é um deles.' },
  { id_num: 7,  name: 'Guerreiro Primordial',      type: 'MONSTER', level: 2, atk: 1100, def: 800,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Lutador que sente o elemental.' },
  { id_num: 8,  name: 'Guerreiro Primordial',      type: 'MONSTER', level: 2, atk: 1100, def: 800,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Lutador que sente o elemental.' },
  { id_num: 9,  name: 'Recruta da Elite Academy',  type: 'MONSTER', level: 2, atk: 1000, def: 1000, effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Primeiro ano. Última chance.' },
  { id_num: 10, name: 'Recruta da Elite Academy',  type: 'MONSTER', level: 2, atk: 1000, def: 1000, effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Primeiro ano. Última chance.' },
  { id_num: 11, name: 'Garota de Marelia',         type: 'MONSTER', level: 2, atk: 850,  def: 950,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Cresceu vendo a arena pelo vidro. Agora está dentro.' },
  { id_num: 12, name: 'Garota de Marelia',         type: 'MONSTER', level: 2, atk: 850,  def: 950,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Cresceu vendo a arena pelo vidro. Agora está dentro.' },
  // — Nível 3 —
  { id_num: 13, name: 'Lancer do SDR',             type: 'MONSTER', level: 3, atk: 1400, def: 900,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Alcançou top 5000. Não é pouco.' },
  { id_num: 14, name: 'Lancer do SDR',             type: 'MONSTER', level: 3, atk: 1400, def: 900,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Alcançou top 5000. Não é pouco.' },
  { id_num: 15, name: 'Sentinela Yohualticit',     type: 'MONSTER', level: 3, atk: 1200, def: 1300, effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Guarda a fronteira entre o físico e o virtual.' },
  { id_num: 16, name: 'Sentinela Yohualticit',     type: 'MONSTER', level: 3, atk: 1200, def: 1300, effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Guarda a fronteira entre o físico e o virtual.' },
  { id_num: 17, name: 'Corredor de Azuma',         type: 'MONSTER', level: 3, atk: 1500, def: 700,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Velocidade antes de força. Escola de Azuma.' },
  { id_num: 18, name: 'Corredor de Azuma',         type: 'MONSTER', level: 3, atk: 1500, def: 700,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Velocidade antes de força. Escola de Azuma.' },
  { id_num: 19, name: 'Tanque de Davoss',          type: 'MONSTER', level: 3, atk: 1100, def: 1500, effect: 'NONE', effectValue: 0, rarity: 'common', description: 'A ilha de Kronos cria guerreiros que não caem.' },
  { id_num: 20, name: 'Tanque de Davoss',          type: 'MONSTER', level: 3, atk: 1100, def: 1500, effect: 'NONE', effectValue: 0, rarity: 'common', description: 'A ilha de Kronos cria guerreiros que não caem.' },
  // — Nível 4 (1 tributo) —
  { id_num: 21, name: 'Kim — Modo Xamã',           type: 'MONSTER', level: 4, atk: 2000, def: 1500, effect: 'NONE', effectValue: 0, rarity: 'rare', description: 'O Sangue Primordial desperta.' },
  { id_num: 22, name: 'Jack — San Tien Kwan',      type: 'MONSTER', level: 4, atk: 1800, def: 1600, effect: 'NONE', effectValue: 0, rarity: 'rare', description: 'O bastão gira e o mundo desacelera.' },
  { id_num: 23, name: 'Nina — Angel Blade',        type: 'MONSTER', level: 4, atk: 2100, def: 1200, effect: 'NONE', effectValue: 0, rarity: 'rare', description: 'A katana que não perdoa.' },
  { id_num: 24, name: 'Kaeda',                     type: 'MONSTER', level: 4, atk: 1900, def: 1400, effect: 'NONE', effectValue: 0, rarity: 'rare', description: 'Top 300 no SDR. Cada movimento calculado.' },
  { id_num: 25, name: 'Shuntaro',                  type: 'MONSTER', level: 4, atk: 1700, def: 1700, effect: 'NONE', effectValue: 0, rarity: 'rare', description: 'Ranking 998. Equilíbrio perfeito entre ataque e defesa.' },
  { id_num: 26, name: 'GhostPulse',                type: 'MONSTER', level: 4, atk: 2000, def: 1100, effect: 'NONE', effectValue: 0, rarity: 'rare', description: 'Você não vê de onde o golpe vem.' },
  // — Nível 5 (1 tributo) —
  { id_num: 27, name: 'VoidHunter_X',              type: 'MONSTER', level: 5, atk: 2800, def: 2000, effect: 'NONE', effectValue: 0, rarity: 'ultra', description: 'Armadura near-black. Braços longos demais.' },
  { id_num: 28, name: 'StormByte_91',              type: 'MONSTER', level: 5, atk: 2600, def: 1800, effect: 'NONE', effectValue: 0, rarity: 'ultra', description: 'Hacker de elite. Sombra no sistema.' },
  { id_num: 29, name: 'IronVeil',                  type: 'MONSTER', level: 5, atk: 2300, def: 2400, effect: 'NONE', effectValue: 0, rarity: 'ultra', description: 'O tanque do SDR. Derrubá-lo custa caro.' },
  // — Nível 6 (2 tributos) —
  { id_num: 30, name: 'Mestre Viran',              type: 'MONSTER', level: 6, atk: 3200, def: 2800, effect: 'NONE', effectValue: 0, rarity: 'ultra', description: 'O Dojô não cai. O mestre não perde.' },
  // ═══ MAGIAS (15) ═══
  { id_num: 31, name: 'Cura Xamânica',             type: 'SPELL', effect: 'HEAL',            effectValue: 800,  rarity: 'common', description: 'O pajé sopra a fumaça. Você respira melhor.' },
  { id_num: 32, name: 'Cura Xamânica',             type: 'SPELL', effect: 'HEAL',            effectValue: 800,  rarity: 'common', description: 'O pajé sopra a fumaça. Você respira melhor.' },
  { id_num: 33, name: 'Cura Xamânica',             type: 'SPELL', effect: 'HEAL',            effectValue: 800,  rarity: 'common', description: 'O pajé sopra a fumaça. Você respira melhor.' },
  { id_num: 34, name: 'Pulso Primordial',          type: 'SPELL', effect: 'BURN',            effectValue: 600,  rarity: 'common', description: 'Onda de energia pura. Direto na barra de vida.' },
  { id_num: 35, name: 'Pulso Primordial',          type: 'SPELL', effect: 'BURN',            effectValue: 600,  rarity: 'common', description: 'Onda de energia pura. Direto na barra de vida.' },
  { id_num: 36, name: 'Pulso Primordial',          type: 'SPELL', effect: 'BURN',            effectValue: 600,  rarity: 'common', description: 'Onda de energia pura. Direto na barra de vida.' },
  { id_num: 37, name: 'Adrenalina SDR',            type: 'SPELL', effect: 'ATK_BOOST',       effectValue: 500,  rarity: 'common', description: '+500 ATK até o fim do turno.' },
  { id_num: 38, name: 'Adrenalina SDR',            type: 'SPELL', effect: 'ATK_BOOST',       effectValue: 500,  rarity: 'common', description: '+500 ATK até o fim do turno.' },
  { id_num: 39, name: 'Adrenalina SDR',            type: 'SPELL', effect: 'ATK_BOOST',       effectValue: 500,  rarity: 'common', description: '+500 ATK até o fim do turno.' },
  { id_num: 40, name: 'Frequência da Yohualticit', type: 'SPELL', effect: 'DRAW',            effectValue: 2,    rarity: 'rare', description: 'Os dados do SBI se reorganizam. Você entende.' },
  { id_num: 41, name: 'Frequência da Yohualticit', type: 'SPELL', effect: 'DRAW',            effectValue: 2,    rarity: 'rare', description: 'Os dados do SBI se reorganizam. Você entende.' },
  { id_num: 42, name: 'Fragmento de Poder',        type: 'SPELL', effect: 'DESTROY_MONSTER', effectValue: 0,    rarity: 'rare', description: 'A ficha. O avatar. Desaparece.' },
  { id_num: 43, name: 'Fragmento de Poder',        type: 'SPELL', effect: 'DESTROY_MONSTER', effectValue: 0,    rarity: 'rare', description: 'A ficha. O avatar. Desaparece.' },
  { id_num: 44, name: 'Sinal Primordial',          type: 'SPELL', effect: 'BURN',            effectValue: 1000, rarity: 'rare', description: 'Quando o sangue fala, o adversário sente.' },
  { id_num: 45, name: 'Recarga do SBI',            type: 'SPELL', effect: 'HEAL',            effectValue: 1500, rarity: 'rare', description: 'O capacete reinicia. Os sinais se estabilizam.' },
  // ═══ ARMADILHAS (15) ═══
  { id_num: 46, name: 'Contragolpe LDI',           type: 'TRAP', effect: 'NEGATE_ATTACK',    effectValue: 0,   rarity: 'common', description: 'A arena pisca. O golpe não chega.' },
  { id_num: 47, name: 'Contragolpe LDI',           type: 'TRAP', effect: 'NEGATE_ATTACK',    effectValue: 0,   rarity: 'common', description: 'A arena pisca. O golpe não chega.' },
  { id_num: 48, name: 'Contragolpe LDI',           type: 'TRAP', effect: 'NEGATE_ATTACK',    effectValue: 0,   rarity: 'common', description: 'A arena pisca. O golpe não chega.' },
  { id_num: 49, name: 'Emboscada Xamânica',        type: 'TRAP', effect: 'DESTROY_ATTACKER', effectValue: 0,   rarity: 'rare', description: 'O atacante se vê no meio de um círculo de fogo.' },
  { id_num: 50, name: 'Emboscada Xamânica',        type: 'TRAP', effect: 'DESTROY_ATTACKER', effectValue: 0,   rarity: 'rare', description: 'O atacante se vê no meio de um círculo de fogo.' },
  { id_num: 51, name: 'Barreira Primordial',       type: 'TRAP', effect: 'BURN',             effectValue: 500, rarity: 'common', description: 'Reflexo do sangue ancestral. Dói em quem vê.' },
  { id_num: 52, name: 'Barreira Primordial',       type: 'TRAP', effect: 'BURN',             effectValue: 500, rarity: 'common', description: 'Reflexo do sangue ancestral. Dói em quem vê.' },
  { id_num: 53, name: 'Barreira Primordial',       type: 'TRAP', effect: 'BURN',             effectValue: 500, rarity: 'common', description: 'Reflexo do sangue ancestral. Dói em quem vê.' },
  { id_num: 54, name: 'Reflexo do SBI',            type: 'TRAP', effect: 'REDUCE_ATK',       effectValue: 700, rarity: 'common', description: 'O capacete buga. O inimigo perde força.' },
  { id_num: 55, name: 'Reflexo do SBI',            type: 'TRAP', effect: 'REDUCE_ATK',       effectValue: 700, rarity: 'common', description: 'O capacete buga. O inimigo perde força.' },
  { id_num: 56, name: 'Reflexo do SBI',            type: 'TRAP', effect: 'REDUCE_ATK',       effectValue: 700, rarity: 'common', description: 'O capacete buga. O inimigo perde força.' },
  { id_num: 57, name: 'Colapso de Frequência',     type: 'TRAP', effect: 'REDUCE_ATK',       effectValue: 1000, rarity: 'rare', description: 'A frequência cai. O monstro perde a sincronia.' },
  { id_num: 58, name: 'Colapso de Frequência',     type: 'TRAP', effect: 'REDUCE_ATK',       effectValue: 1000, rarity: 'rare', description: 'A frequência cai. O monstro perde a sincronia.' },
  { id_num: 59, name: 'Golpe do Pajé',             type: 'TRAP', effect: 'DESTROY_ATTACKER', effectValue: 0,   rarity: 'rare', description: 'Yawanari não precisa de arena pra acertar.' },
  { id_num: 60, name: 'Contraonda Xakaxi',         type: 'TRAP', effect: 'NEGATE_ATTACK',    effectValue: 0,   rarity: 'rare', description: 'O sangue dos ancestrais protege. Desta vez.' },
]

export function getCardByNum(num) {
  return CARDS.find(c => c.id_num === num) || null
}

export default CARDS
