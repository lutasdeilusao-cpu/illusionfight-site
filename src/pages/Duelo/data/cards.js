// LDI DUELO — 60 cartas do MVP
// Deck padrão: 30 monstros | 15 magias | 15 armadilhas

const CARDS = [

  // ══════════════════════════════════════════════
  // MONSTROS (30 cartas)
  // Nível 1: 4 cartas | Nível 2: 8 | Nível 3: 8 | Nível 4: 6 | Nível 5: 3 | Nível 6: 1
  // ══════════════════════════════════════════════

  // — Nível 1 —
  { id_num: 01, id: 'candidato_sdr_a',       name: 'Candidato SDR',             type: 'MONSTER', level: 1, atk: 500,  def: 400,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Aspirante ao ranking. Estreante.' },
  { id_num: 02, id: 'candidato_sdr_b',       name: 'Candidato SDR',             type: 'MONSTER', level: 1, atk: 500,  def: 400,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Aspirante ao ranking. Estreante.' },
  { id_num: 03, id: 'duelista_bairro_a',     name: 'Duelista de Bairro',        type: 'MONSTER', level: 1, atk: 700,  def: 200,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Campeão do beco. Rua, não arena.' },
  { id_num: 04, id: 'duelista_bairro_b',     name: 'Duelista de Bairro',        type: 'MONSTER', level: 1, atk: 700,  def: 200,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Campeão do beco. Rua, não arena.' },

  // — Nível 2 —
  { id_num: 05, id: 'patrulheiro_a',         name: 'Patrulheiro Yohualticit',   type: 'MONSTER', level: 2, atk: 900,  def: 600,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Yohu emprega milhares. Este é um deles.' },
  { id_num: 06, id: 'patrulheiro_b',         name: 'Patrulheiro Yohualticit',   type: 'MONSTER', level: 2, atk: 900,  def: 600,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Yohu emprega milhares. Este é um deles.' },
  { id_num: 07, id: 'guerreiro_prim_a',      name: 'Guerreiro Primordial',      type: 'MONSTER', level: 2, atk: 1100, def: 800,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Lutador que sente o elemental.' },
  { id_num: 08, id: 'guerreiro_prim_b',      name: 'Guerreiro Primordial',      type: 'MONSTER', level: 2, atk: 1100, def: 800,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Lutador que sente o elemental.' },
  { id_num: 09, id: 'recruta_a',             name: 'Recruta da Elite Academy',  type: 'MONSTER', level: 2, atk: 1000, def: 1000, effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Primeiro ano. Última chance.' },
  { id_num: 10, id: 'recruta_b',             name: 'Recruta da Elite Academy',  type: 'MONSTER', level: 2, atk: 1000, def: 1000, effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Primeiro ano. Última chance.' },
  { id_num: 11, id: 'garota_marelia_a',      name: 'Garota de Marelia',         type: 'MONSTER', level: 2, atk: 850,  def: 950,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Cresceu vendo a arena pelo vidro. Agora está dentro.' },
  { id_num: 12, id: 'garota_marelia_b',      name: 'Garota de Marelia',         type: 'MONSTER', level: 2, atk: 850,  def: 950,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Cresceu vendo a arena pelo vidro. Agora está dentro.' },

  // — Nível 3 —
  { id_num: 13, id: 'lancer_sdr_a',          name: 'Lancer do SDR',             type: 'MONSTER', level: 3, atk: 1400, def: 900,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Alcançou top 5000. Não é pouco.' },
  { id_num: 14, id: 'lancer_sdr_b',          name: 'Lancer do SDR',             type: 'MONSTER', level: 3, atk: 1400, def: 900,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Alcançou top 5000. Não é pouco.' },
  { id_num: 15, id: 'sentinela_yohu_a',      name: 'Sentinela Yohualticit',     type: 'MONSTER', level: 3, atk: 1200, def: 1300, effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Guarda a fronteira entre o físico e o virtual.' },
  { id_num: 16, id: 'sentinela_yohu_b',      name: 'Sentinela Yohualticit',     type: 'MONSTER', level: 3, atk: 1200, def: 1300, effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Guarda a fronteira entre o físico e o virtual.' },
  { id_num: 17, id: 'corredor_azuma_a',      name: 'Corredor de Azuma',         type: 'MONSTER', level: 3, atk: 1500, def: 700,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Velocidade antes de força. Escola de Azuma.' },
  { id_num: 18, id: 'corredor_azuma_b',      name: 'Corredor de Azuma',         type: 'MONSTER', level: 3, atk: 1500, def: 700,  effect: 'NONE', effectValue: 0, rarity: 'common', description: 'Velocidade antes de força. Escola de Azuma.' },
  { id_num: 19, id: 'tanque_davoss_a',       name: 'Tanque de Davoss',          type: 'MONSTER', level: 3, atk: 1100, def: 1500, effect: 'NONE', effectValue: 0, rarity: 'common', description: 'A ilha de Kronos cria guerreiros que não caem.' },
  { id_num: 20, id: 'tanque_davoss_b',       name: 'Tanque de Davoss',          type: 'MONSTER', level: 3, atk: 1100, def: 1500, effect: 'NONE', effectValue: 0, rarity: 'common', description: 'A ilha de Kronos cria guerreiros que não caem.' },

  // — Nível 4 (1 tributo) —
  { id_num: 21, id: 'kim_xama',              name: 'Kim — Modo Xamã',           type: 'MONSTER', level: 4, atk: 2000, def: 1500, effect: 'NONE', effectValue: 0, rarity: 'rare',   description: 'O Sangue Primordial desperta.' },
  { id_num: 22, id: 'jack_san_tien',         name: 'Jack — San Tien Kwan',      type: 'MONSTER', level: 4, atk: 1800, def: 1600, effect: 'NONE', effectValue: 0, rarity: 'rare',   description: 'O bastão gira e o mundo desacelera.' },
  { id_num: 23, id: 'nina_angel',            name: 'Nina — Angel Blade',        type: 'MONSTER', level: 4, atk: 2100, def: 1200, effect: 'NONE', effectValue: 0, rarity: 'rare',   description: 'A katana que não perdoa.' },
  { id_num: 24, id: 'kaeda_sdr',             name: 'Kaeda',                     type: 'MONSTER', level: 4, atk: 1900, def: 1400, effect: 'NONE', effectValue: 0, rarity: 'rare',   description: 'Top 300 no SDR. Cada movimento calculado.' },
  { id_num: 25, id: 'shuntaro',              name: 'Shuntaro',                  type: 'MONSTER', level: 4, atk: 1700, def: 1700, effect: 'NONE', effectValue: 0, rarity: 'rare',   description: 'Ranking 998. Equilíbrio perfeito entre ataque e defesa.' },
  { id_num: 26, id: 'ghostpulse',            name: 'GhostPulse',                type: 'MONSTER', level: 4, atk: 2000, def: 1100, effect: 'NONE', effectValue: 0, rarity: 'rare',   description: 'Você não vê de onde o golpe vem.' },

  // — Nível 5 (1 tributo) —
  { id_num: 27, id: 'voidhunter_x',          name: 'VoidHunter_X',              type: 'MONSTER', level: 5, atk: 2800, def: 2000, effect: 'NONE', effectValue: 0, rarity: 'ultra',  description: 'Armadura near-black. Braços longos demais.' },
  { id_num: 28, id: 'stormbyte_91',          name: 'StormByte_91',              type: 'MONSTER', level: 5, atk: 2600, def: 1800, effect: 'NONE', effectValue: 0, rarity: 'ultra',  description: 'Hacker de elite. Sombra no sistema.' },
  { id_num: 29, id: 'ironveil',              name: 'IronVeil',                  type: 'MONSTER', level: 5, atk: 2300, def: 2400, effect: 'NONE', effectValue: 0, rarity: 'ultra',  description: 'O tanque do SDR. Derrubá-lo custa caro.' },

  // — Nível 6 (2 tributos) —
  { id_num: 30, id: 'mestre_viran',          name: 'Mestre Viran',              type: 'MONSTER', level: 6, atk: 3200, def: 2800, effect: 'NONE', effectValue: 0, rarity: 'ultra',  description: 'O Dojô não cai. O mestre não perde.' },


  // ══════════════════════════════════════════════
  // MAGIAS (15 cartas)
  // ══════════════════════════════════════════════

  { id_num: 31, id: 'cura_xamanica_a',       name: 'Cura Xamânica',             type: 'SPELL', effect: 'HEAL',            effectValue: 800,  rarity: 'common', description: 'O pajé sopra a fumaça. Você respira melhor.' },
  { id_num: 32, id: 'cura_xamanica_b',       name: 'Cura Xamânica',             type: 'SPELL', effect: 'HEAL',            effectValue: 800,  rarity: 'common', description: 'O pajé sopra a fumaça. Você respira melhor.' },
  { id_num: 33, id: 'cura_xamanica_c',       name: 'Cura Xamânica',             type: 'SPELL', effect: 'HEAL',            effectValue: 800,  rarity: 'common', description: 'O pajé sopra a fumaça. Você respira melhor.' },
  { id_num: 34, id: 'pulso_prim_a',          name: 'Pulso Primordial',          type: 'SPELL', effect: 'BURN',            effectValue: 600,  rarity: 'common', description: 'Onda de energia pura. Direto na barra de vida.' },
  { id_num: 35, id: 'pulso_prim_b',          name: 'Pulso Primordial',          type: 'SPELL', effect: 'BURN',            effectValue: 600,  rarity: 'common', description: 'Onda de energia pura. Direto na barra de vida.' },
  { id_num: 36, id: 'pulso_prim_c',          name: 'Pulso Primordial',          type: 'SPELL', effect: 'BURN',            effectValue: 600,  rarity: 'common', description: 'Onda de energia pura. Direto na barra de vida.' },
  { id_num: 37, id: 'adrenalina_sdr_a',      name: 'Adrenalina SDR',            type: 'SPELL', effect: 'ATK_BOOST',       effectValue: 500,  rarity: 'common', description: '+500 ATK até o fim do turno.' },
  { id_num: 38, id: 'adrenalina_sdr_b',      name: 'Adrenalina SDR',            type: 'SPELL', effect: 'ATK_BOOST',       effectValue: 500,  rarity: 'common', description: '+500 ATK até o fim do turno.' },
  { id_num: 39, id: 'adrenalina_sdr_c',      name: 'Adrenalina SDR',            type: 'SPELL', effect: 'ATK_BOOST',       effectValue: 500,  rarity: 'common', description: '+500 ATK até o fim do turno.' },
  { id_num: 40, id: 'frequencia_yohu_a',     name: 'Frequência da Yohualticit', type: 'SPELL', effect: 'DRAW',            effectValue: 2,    rarity: 'rare',   description: 'Os dados do SBI se reorganizam. Você entende.' },
  { id_num: 41, id: 'frequencia_yohu_b',     name: 'Frequência da Yohualticit', type: 'SPELL', effect: 'DRAW',            effectValue: 2,    rarity: 'rare',   description: 'Os dados do SBI se reorganizam. Você entende.' },
  { id_num: 42, id: 'fragmento_poder_a',     name: 'Fragmento de Poder',        type: 'SPELL', effect: 'DESTROY_MONSTER', effectValue: 0,    rarity: 'rare',   description: 'A ficha. O avatar. Desaparece.' },
  { id_num: 43, id: 'fragmento_poder_b',     name: 'Fragmento de Poder',        type: 'SPELL', effect: 'DESTROY_MONSTER', effectValue: 0,    rarity: 'rare',   description: 'A ficha. O avatar. Desaparece.' },
  { id_num: 44, id: 'sinal_primordial',      name: 'Sinal Primordial',          type: 'SPELL', effect: 'BURN',            effectValue: 1000, rarity: 'rare',   description: 'Quando o sangue fala, o adversário sente.' },
  { id_num: 45, id: 'recarga_sbi',           name: 'Recarga do SBI',            type: 'SPELL', effect: 'HEAL',            effectValue: 1500, rarity: 'rare',   description: 'O capacete reinicia. Os sinais se estabilizam.' },


  // ══════════════════════════════════════════════
  // ARMADILHAS (15 cartas)
  // ══════════════════════════════════════════════

  { id_num: 46, id: 'contragolpe_a',         name: 'Contragolpe LDI',           type: 'TRAP', effect: 'NEGATE_ATTACK',    effectValue: 0,    rarity: 'common', description: 'A arena pisca. O golpe não chega.' },
  { id_num: 47, id: 'contragolpe_b',         name: 'Contragolpe LDI',           type: 'TRAP', effect: 'NEGATE_ATTACK',    effectValue: 0,    rarity: 'common', description: 'A arena pisca. O golpe não chega.' },
  { id_num: 48, id: 'contragolpe_c',         name: 'Contragolpe LDI',           type: 'TRAP', effect: 'NEGATE_ATTACK',    effectValue: 0,    rarity: 'common', description: 'A arena pisca. O golpe não chega.' },
  { id_num: 49, id: 'emboscada_xama_a',      name: 'Emboscada Xamânica',        type: 'TRAP', effect: 'DESTROY_ATTACKER', effectValue: 0,    rarity: 'rare',   description: 'O atacante se vê no meio de um círculo de fogo.' },
  { id_num: 50, id: 'emboscada_xama_b',      name: 'Emboscada Xamânica',        type: 'TRAP', effect: 'DESTROY_ATTACKER', effectValue: 0,    rarity: 'rare',   description: 'O atacante se vê no meio de um círculo de fogo.' },
  { id_num: 51, id: 'barreira_prim_a',       name: 'Barreira Primordial',       type: 'TRAP', effect: 'BURN',             effectValue: 500,  rarity: 'common', description: 'Reflexo do sangue ancestral. Dói em quem vê.' },
  { id_num: 52, id: 'barreira_prim_b',       name: 'Barreira Primordial',       type: 'TRAP', effect: 'BURN',             effectValue: 500,  rarity: 'common', description: 'Reflexo do sangue ancestral. Dói em quem vê.' },
  { id_num: 53, id: 'barreira_prim_c',       name: 'Barreira Primordial',       type: 'TRAP', effect: 'BURN',             effectValue: 500,  rarity: 'common', description: 'Reflexo do sangue ancestral. Dói em quem vê.' },
  { id_num: 54, id: 'reflexo_sbi_a',         name: 'Reflexo do SBI',            type: 'TRAP', effect: 'REDUCE_ATK',       effectValue: 700,  rarity: 'common', description: 'O capacete buga. O inimigo perde força.' },
  { id_num: 55, id: 'reflexo_sbi_b',         name: 'Reflexo do SBI',            type: 'TRAP', effect: 'REDUCE_ATK',       effectValue: 700,  rarity: 'common', description: 'O capacete buga. O inimigo perde força.' },
  { id_num: 56, id: 'reflexo_sbi_c',         name: 'Reflexo do SBI',            type: 'TRAP', effect: 'REDUCE_ATK',       effectValue: 700,  rarity: 'common', description: 'O capacete buga. O inimigo perde força.' },
  { id_num: 57, id: 'colapso_frequencia_a',  name: 'Colapso de Frequência',     type: 'TRAP', effect: 'REDUCE_ATK',       effectValue: 1000, rarity: 'rare',   description: 'A frequência cai. O monstro perde a sincronia.' },
  { id_num: 58, id: 'colapso_frequencia_b',  name: 'Colapso de Frequência',     type: 'TRAP', effect: 'REDUCE_ATK',       effectValue: 1000, rarity: 'rare',   description: 'A frequência cai. O monstro perde a sincronia.' },
  { id_num: 59, id: 'golpe_do_paje',         name: 'Golpe do Pajé',             type: 'TRAP', effect: 'DESTROY_ATTACKER', effectValue: 0,    rarity: 'rare',   description: 'Yawanari não precisa de arena pra acertar.' },
  { id_num: 60, id: 'contraonda_xakaxi',     name: 'Contraonda Xakaxi',         type: 'TRAP', effect: 'NEGATE_ATTACK',    effectValue: 0,    rarity: 'rare',   description: 'O sangue dos ancestrais protege. Desta vez.' },

]

export default CARDS