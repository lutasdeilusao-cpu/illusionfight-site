// LDI DUELO — 30 cartas do MVP
// Deck padrão para humano e IA (mesmo baralho)

const CARDS = [
  // ═══════════════ MONSTROS (18 cartas) ═══════════════
  { id: 'candidato_sdr_a',        name: 'Candidato SDR',            type: 'MONSTER', level: 1, atk: 500,  def: 400,  effect: 'NONE', effectValue: 0,    rarity: 'common', description: 'Aspirante ao ranking. Estreante.' },
  { id: 'candidato_sdr_b',        name: 'Candidato SDR',            type: 'MONSTER', level: 1, atk: 500,  def: 400,  effect: 'NONE', effectValue: 0,    rarity: 'common', description: 'Aspirante ao ranking. Estreante.' },
  { id: 'duelista_bairro_a',      name: 'Duelista de Bairro',       type: 'MONSTER', level: 1, atk: 700,  def: 200,  effect: 'NONE', effectValue: 0,    rarity: 'common', description: 'Campeão do beco. Rua, não arena.' },
  { id: 'duelista_bairro_b',      name: 'Duelista de Bairro',       type: 'MONSTER', level: 1, atk: 700,  def: 200,  effect: 'NONE', effectValue: 0,    rarity: 'common', description: 'Campeão do beco. Rua, não arena.' },
  { id: 'patrulheiro_a',          name: 'Patrulheiro Yohualticit',  type: 'MONSTER', level: 2, atk: 900,  def: 600,  effect: 'NONE', effectValue: 0,    rarity: 'common', description: 'Yohu emprega milhares. Este é um deles.' },
  { id: 'patrulheiro_b',          name: 'Patrulheiro Yohualticit',  type: 'MONSTER', level: 2, atk: 900,  def: 600,  effect: 'NONE', effectValue: 0,    rarity: 'common', description: 'Yohu emprega milhares. Este é um deles.' },
  { id: 'guerreiro_prim_a',       name: 'Guerreiro Primordial',     type: 'MONSTER', level: 2, atk: 1100, def: 800,  effect: 'NONE', effectValue: 0,    rarity: 'common', description: 'Lutador que sente o elemental.' },
  { id: 'guerreiro_prim_b',       name: 'Guerreiro Primordial',     type: 'MONSTER', level: 2, atk: 1100, def: 800,  effect: 'NONE', effectValue: 0,    rarity: 'common', description: 'Lutador que sente o elemental.' },
  { id: 'recruta_a',              name: 'Recruta da Elite Academy', type: 'MONSTER', level: 2, atk: 1000, def: 1000, effect: 'NONE', effectValue: 0,    rarity: 'common', description: 'Primeiro ano. Última chance.' },
  { id: 'recruta_b',              name: 'Recruta da Elite Academy', type: 'MONSTER', level: 2, atk: 1000, def: 1000, effect: 'NONE', effectValue: 0,    rarity: 'common', description: 'Primeiro ano. Última chance.' },
  { id: 'lancer_sdr_a',           name: 'Lancer do SDR',            type: 'MONSTER', level: 3, atk: 1400, def: 900,  effect: 'NONE', effectValue: 0,    rarity: 'common', description: 'Alcançou top 5000. Não é pouco.' },
  { id: 'lancer_sdr_b',           name: 'Lancer do SDR',            type: 'MONSTER', level: 3, atk: 1400, def: 900,  effect: 'NONE', effectValue: 0,    rarity: 'common', description: 'Alcançou top 5000. Não é pouco.' },

  { id: 'kim_xama',               name: 'Kim — Modo Xamã',          type: 'MONSTER', level: 4, atk: 2000, def: 1500, effect: 'NONE', effectValue: 0,    rarity: 'rare',   description: 'O Sangue Primordial desperta.' },
  { id: 'jack_san_tien',          name: 'Jack — San Tien Kwan',     type: 'MONSTER', level: 4, atk: 1800, def: 1600, effect: 'NONE', effectValue: 0,    rarity: 'rare',   description: 'O bastão gira e o mundo desacelera.' },
  { id: 'nina_angel',             name: 'Nina — Angel Blade',       type: 'MONSTER', level: 4, atk: 2100, def: 1200, effect: 'NONE', effectValue: 0,    rarity: 'rare',   description: 'A katana que não perdoa.' },

  { id: 'voidhunter_x',           name: 'VoidHunter_X',             type: 'MONSTER', level: 5, atk: 2800, def: 2000, effect: 'NONE', effectValue: 0,    rarity: 'ultra',  description: 'Armadura near-black. Braços longos demais.' },
  { id: 'stormbyte_91',           name: 'StormByte_91',             type: 'MONSTER', level: 5, atk: 2600, def: 1800, effect: 'NONE', effectValue: 0,    rarity: 'ultra',  description: 'Hacker de elite. Sombra no sistema.' },
  { id: 'mestre_viran',           name: 'Mestre Viran',             type: 'MONSTER', level: 6, atk: 3200, def: 2800, effect: 'NONE', effectValue: 0,    rarity: 'ultra',  description: 'O Dojô não cai. O mestre não perde.' },

  // ═══════════════ MAGIAS (7 cartas) ═══════════════
  { id: 'cura_xamanica_a',        name: 'Cura Xamânica',           type: 'SPELL', effect: 'HEAL',             effectValue: 800,  rarity: 'common', description: 'O pajé sopra a fumaça. Você respira melhor.' },
  { id: 'cura_xamanica_b',        name: 'Cura Xamânica',           type: 'SPELL', effect: 'HEAL',             effectValue: 800,  rarity: 'common', description: 'O pajé sopra a fumaça. Você respira melhor.' },
  { id: 'pulso_prim_a',           name: 'Pulso Primordial',        type: 'SPELL', effect: 'BURN',             effectValue: 600,  rarity: 'common', description: 'Onda de energia pura. Direto na barra de vida.' },
  { id: 'pulso_prim_b',           name: 'Pulso Primordial',        type: 'SPELL', effect: 'BURN',             effectValue: 600,  rarity: 'common', description: 'Onda de energia pura. Direto na barra de vida.' },
  { id: 'adrenalina_sdr',         name: 'Adrenalina SDR',          type: 'SPELL', effect: 'ATK_BOOST',        effectValue: 500,  rarity: 'common', description: '+500 ATK até o fim do turno.' },
  { id: 'frequencia_yohu',        name: 'Frequência da Yohualticit', type: 'SPELL', effect: 'DRAW',           effectValue: 2,    rarity: 'rare',   description: 'Os dados do SBI se reorganizam. Você entende.' },
  { id: 'fragmento_poder',        name: 'Fragmento de Poder',      type: 'SPELL', effect: 'DESTROY_MONSTER',  effectValue: 0,    rarity: 'rare',   description: 'A ficha. O avatar. Desaparece.' },

  // ═══════════════ ARMADILHAS (5 cartas) ═══════════════
  { id: 'contragolpe_a',          name: 'Contragolpe LDI',         type: 'TRAP',  effect: 'NEGATE_ATTACK',    effectValue: 0,    rarity: 'common', description: 'A arena pisca. O golpe não chega.' },
  { id: 'contragolpe_b',          name: 'Contragolpe LDI',         type: 'TRAP',  effect: 'NEGATE_ATTACK',    effectValue: 0,    rarity: 'common', description: 'A arena pisca. O golpe não chega.' },
  { id: 'emboscada_xama',         name: 'Emboscada Xamânica',      type: 'TRAP',  effect: 'DESTROY_ATTACKER', effectValue: 0,    rarity: 'rare',   description: 'O atacante se vê no meio de um círculo de fogo.' },
  { id: 'barreira_prim',          name: 'Barreira Primordial',     type: 'TRAP',  effect: 'BURN',             effectValue: 500,  rarity: 'common', description: 'Reflexo do sangue ancestral. Dói em quem vê.' },
  { id: 'reflexo_sbi',            name: 'Reflexo do SBI',          type: 'TRAP',  effect: 'REDUCE_ATK',       effectValue: 700,  rarity: 'common', description: 'O capacete buga. O inimigo perde força.' },
]

export default CARDS
