// ─── SRGRM game-logic.js ──────────────────────────────────────────────────
// Extração fiel de rpg_3v3-3-4-1.html (linhas 604-3516)
// ZERO alterações de lógica — apenas encapsulamento para React

// â”€â”€â”€ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ATTRS = [
  { id: 'for', name: 'Fortitude',    type: 'Ativo',   hint: 'Ataques pesados' },
  { id: 'dex', name: 'Destreza',     type: 'Ativo',   hint: 'Ataques precisos' },
  { id: 'int', name: 'InteligÃªncia', type: 'Ativo',   hint: 'Magias e tÃ¡tica' },
  { id: 'agi', name: 'Agilidade',    type: 'Passivo', hint: 'Defende vs Destreza' },
  { id: 'res', name: 'ResistÃªncia',  type: 'Passivo', hint: 'Defende vs Fortitude' },
  { id: 'det', name: 'DeterminaÃ§Ã£o', type: 'Passivo', hint: 'Defende vs InteligÃªncia' },
];

// Armas: atributo bÃ¡sico usado no teste, atributo de batalha que rivaliza com armadura
const WEAPONS = [
  // Espada: 1d6+1 / 1d10+2 / 1d20+3 â€” Ãºnica arma com bÃ´nus fixo de dano
  { id: 'espada',          name: 'Espada Longa',            level: 1, dice: 6,  atkAttr: 'for', dmgStat: 'potencia',   dmgDiceSides: 6,  dmgBonus: 1, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'espada_bastarda', name: 'Espada Bastarda',         level: 2, dice: 10, atkAttr: 'for', dmgStat: 'potencia',   dmgDiceSides: 10, dmgBonus: 2, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'espada_mae',      name: 'Espada-MÃ£e',              level: 3, dice: 20, atkAttr: 'for', dmgStat: 'potencia',   dmgDiceSides: 20, dmgBonus: 3, potencia: 0, letalidade: 0, malicia: 0 },

  // Adaga: 1d6 / 1d10 / 1d15 â€” sem bÃ´nus fixo
  { id: 'adaga',           name: 'Adaga',                   level: 1, dice: 6,  atkAttr: 'dex', dmgStat: 'letalidade', dmgDiceSides: 6,  dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'adaga_curva',     name: 'Adaga Curva',              level: 2, dice: 10, atkAttr: 'dex', dmgStat: 'letalidade', dmgDiceSides: 10, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'adaga_sombria',   name: 'Adaga Sombria',            level: 3, dice: 15, atkAttr: 'dex', dmgStat: 'letalidade', dmgDiceSides: 15, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0 },

  // Cajado: 1d6 / 1d10 / 1d20 â€” dano de magia usa MalÃ­cia em dado tambÃ©m
  { id: 'cajado',          name: 'Cajado',                  level: 1, dice: 6,  atkAttr: 'int', dmgStat: 'malicia',    dmgDiceSides: 6,  dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'cajado_avancado', name: 'Cajado AvanÃ§ado',         level: 2, dice: 10, atkAttr: 'int', dmgStat: 'malicia',    dmgDiceSides: 10, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'cajado_arcano',   name: 'Cajado Arcano',           level: 3, dice: 20, atkAttr: 'int', dmgStat: 'malicia',    dmgDiceSides: 20, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0 },

  // Espada e Escudo: 1d6 / 1d10 / 1d15 â€” testa Destreza, dano por PotÃªncia
  { id: 'espada_escudo',   name: 'Espada e Escudo',          level: 1, dice: 6,  atkAttr: 'dex', dmgStat: 'potencia',   dmgDiceSides: 6,  dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0, shieldRegen: true },
  { id: 'espada_broquel',  name: 'Espada e Broquel ReforÃ§ado', level: 2, dice: 10, atkAttr: 'dex', dmgStat: 'potencia', dmgDiceSides: 10, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0, shieldRegen: true },
  { id: 'espada_egide',    name: 'Espada e Ã‰gide',           level: 3, dice: 15, atkAttr: 'dex', dmgStat: 'potencia',   dmgDiceSides: 15, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0, shieldRegen: true },

  // Arco: 1d4 / 1d7 / 1d15 â€” dano por flecha (potencia/letalidade/malicia conforme flecha)
  { id: 'arco',            name: 'Arco Curto',              level: 1, dice: 6,  atkAttr: 'dex', dmgStat: 'letalidade', dmgDiceSides: 4,  dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0, arrowBased: true },
  { id: 'arco_longo',      name: 'Arco Longo',              level: 2, dice: 10, atkAttr: 'dex', dmgStat: 'letalidade', dmgDiceSides: 7,  dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0, arrowBased: true },
  { id: 'arco_ancestral',  name: 'Arco Ancestral',          level: 3, dice: 20, atkAttr: 'dex', dmgStat: 'letalidade', dmgDiceSides: 15, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0, arrowBased: true },

  // MÃ£os Livres: fÃ³rmula prÃ³pria (HP%), sem tiers ainda
  { id: 'maos_livres',     name: 'MÃ£os Livres',             level: 1, dice: 6,  atkAttr: 'for', dmgStat: 'potencia',   potencia: 0, letalidade: 0, malicia: 0, unarmed: true },
];

// Armaduras: atributos de defesa rivalizam com arma
// potencia vs protecao / letalidade vs evasiva / malicia vs barreira
const ARMORS = [
  // Cota de Malha â†’ Armadura de Placas â†’ Armadura Pesada
  // Passiva: rolar o valor mÃ¡ximo do dado de defesa concede +1 de defesa sÃ³ naquele cÃ¡lculo (nÃ£o acumula).
  { id: 'armadura',        name: 'Cota de Malha',              level: 1, dice: 6,  protecaoDice: 6,  evasivaDice: 3,  barreiraDice: 0,  armorPassive: 'plate' },
  { id: 'armadura_placas', name: 'Armadura de Placas',         level: 2, dice: 10, protecaoDice: 10, evasivaDice: 4,  barreiraDice: 2,  armorPassive: 'plate' },
  { id: 'armadura_pesada', name: 'Armadura Pesada',            level: 3, dice: 20, protecaoDice: 20, evasivaDice: 7,  barreiraDice: 4,  armorPassive: 'plate' },

  // Roupa de Couro â†’ CouraÃ§a de Couro â†’ CouraÃ§a de Couro Cravejado
  // Passiva: rolar o valor mÃ¡ximo do dado de defesa causa 1 de dano fixo ao atacante (nÃ£o se aplica a magia).
  { id: 'couto',           name: 'Roupa de Couro',             level: 1, dice: 6,  protecaoDice: 3,  evasivaDice: 6,  barreiraDice: 0,  armorPassive: 'leather' },
  { id: 'couro_couraca',   name: 'CouraÃ§a de Couro',           level: 2, dice: 10, protecaoDice: 4,  evasivaDice: 10, barreiraDice: 4,  armorPassive: 'leather' },
  { id: 'couro_cravejado', name: 'CouraÃ§a de Couro Cravejado', level: 3, dice: 20, protecaoDice: 5,  evasivaDice: 20, barreiraDice: 6,  armorPassive: 'leather' },

  // TÃºnica â†’ TÃºnica MÃ­stica â†’ Robe
  // Passiva: absorÃ§Ã£o de emergÃªncia (ver applyDamage) â€” sem gatilho de dado mÃ¡ximo.
  { id: 'tunica',          name: 'TÃºnica',                     level: 1, dice: 6,  protecaoDice: 0,  evasivaDice: 3,  barreiraDice: 6,  armorPassive: 'tunic' },
  { id: 'tunica_mistica',  name: 'TÃºnica MÃ­stica',              level: 2, dice: 10, protecaoDice: 3,  evasivaDice: 4,  barreiraDice: 10, armorPassive: 'tunic' },
  { id: 'robe',            name: 'Robe',                       level: 3, dice: 20, protecaoDice: 5,  evasivaDice: 6,  barreiraDice: 20, armorPassive: 'tunic' },
];

// Rola o dado de defesa do stat relevante (protecao/evasiva/barreira) e detecta rolagem mÃ¡xima.
// Retorna { value, isMax } â€” value Ã© sÃ³ a rolagem (a passiva +1 de Cota de Malha Ã© aplicada pelo chamador).
function rollArmorDefense(armor, defStat) {
  const sides = armor[defStat + 'Dice'];
  if (!sides || sides <= 0) return { value: 0, isMax: false };
  const roll = rollDice(sides);
  return { value: roll, isMax: roll === sides };
}

// Mapa: atributo de batalha da arma â†’ atributo de batalha da armadura
const DMG_VS_DEF = { potencia: 'protecao', letalidade: 'evasiva', malicia: 'barreira' };

// Mapa: atributo de ataque (bÃ¡sico) â†’ atributo de defesa (bÃ¡sico) do oponente
const ATK_VS_DEF_ATTR = { for: 'res', dex: 'agi', int: 'det' };

// BÃ´nus derivados: cada 2 pontos de Destreza = +1 ataque; cada 2 pontos de Agilidade = +1 defesa
function atkBonus(entity)  { return Math.floor(entity.attrs.dex / 2); }
function defBonus(entity)  { return Math.floor(entity.attrs.agi / 2); }
function isCajadoWeapon(weapon) { return ['cajado', 'cajado_avancado', 'cajado_arcano'].includes(weapon.id); }
function isShieldWeapon(weapon) { return ['espada_escudo', 'espada_broquel', 'espada_egide'].includes(weapon.id); }
function isDaggerWeapon(weapon) { return ['adaga', 'adaga_curva', 'adaga_sombria'].includes(weapon.id); }
function isSwordWeapon(weapon)  { return ['espada', 'espada_bastarda', 'espada_mae'].includes(weapon.id); }
function isBowWeapon(weapon)    { return ['arco', 'arco_longo', 'arco_ancestral'].includes(weapon.id); }
// Identifica a famÃ­lia exata de uma arma (para restringir troca de equipamento de aliados).
// Diferente de dmgStat, que Ã© compartilhado entre Espada e Espada e Escudo (ambas 'potencia').
function weaponFamily(weapon) {
  if (isCajadoWeapon(weapon)) return 'cajado';
  if (isShieldWeapon(weapon)) return 'espada_escudo';
  if (isDaggerWeapon(weapon)) return 'adaga';
  if (isSwordWeapon(weapon))  return 'espada';
  if (isBowWeapon(weapon))    return 'arco';
  if (weapon.unarmed) return 'maos_livres';
  return weapon.id;
}

// â”€â”€â”€ ITENS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PoÃ§Ãµes / ManÃ¡s: cura por dado. Curativos: removem efeitos. CafÃ© Forte: revive.
const ITEMS_CONSUMABLE = [
  { id:'pocao_p',   name:'PoÃ§Ã£o Pequena', type:'heal_hp', dice:10,  desc:'Cura 1d10 de HP' },
  { id:'pocao_m',   name:'PoÃ§Ã£o MÃ©dia',   type:'heal_hp', dice:20,  desc:'Cura 1d20 de HP' },
  { id:'pocao_g',   name:'PoÃ§Ã£o Grande',  type:'heal_hp', dice:100, desc:'Cura 1d100 de HP' },
  { id:'mana_p',    name:'ManÃ¡ Pequena',  type:'heal_mp', dice:10,  desc:'Cura 1d10 de MP' },
  { id:'mana_m',    name:'ManÃ¡ MÃ©dia',    type:'heal_mp', dice:20,  desc:'Cura 1d20 de MP' },
  { id:'mana_g',    name:'ManÃ¡ Grande',   type:'heal_mp', dice:100, desc:'Cura 1d100 de MP' },
  { id:'ataduras',  name:'Ataduras',      type:'cure', removes:['bleed'],    desc:'Remove Sangramento' },
  { id:'antidoto',  name:'AntÃ­doto',      type:'cure', removes:['poison'],   desc:'Remove Envenenamento' },
  { id:'camomila',  name:'Camomila',      type:'cure', removes:['paralyze'], desc:'Remove Paralisia' },
  { id:'xarope',    name:'Xarope',        type:'cure', removes:['disease_light','disease_medium','disease_severe'], desc:'Remove DoenÃ§a' },
  { id:'cafe_forte',name:'CafÃ© Forte',    type:'revive', desc:'Revive aliado derrotado com 1 HP' },
];

// Flechas: definem o atributo de dano usado pelo Arco (PotÃªncia/Letalidade/MalÃ­cia)
// e, nas variantes de efeito, uma chance de aplicar um efeito (sempre testado como Letalidade)
const ARROWS = [
  { id:'flecha_pesada',    name:'Flechas Pesadas',           dmgStat:'potencia',   desc:'Ataque com PotÃªncia' },
  { id:'flecha_afiada',    name:'Flechas Afiadas',            dmgStat:'letalidade', desc:'Ataque com Letalidade' },
  { id:'flecha_corrompida',name:'Flechas Corrompidas',        dmgStat:'malicia',    desc:'Ataque com MalÃ­cia' },
  { id:'flecha_venenosa',  name:'Flechas Afiadas Envenenadas', dmgStat:'letalidade', desc:'Letalidade â€” pode causar Envenenamento', effect:'poison' },
  { id:'flecha_paralisante',name:'Flechas Afiadas Paralizantes',dmgStat:'letalidade', desc:'Letalidade â€” pode causar Paralisia', effect:'paralyze' },
  { id:'flecha_lacerante', name:'Flechas Afiadas Lacerantes',  dmgStat:'letalidade', desc:'Letalidade â€” pode causar Sangramento', effect:'bleed' },
];
// Ordem de preferÃªncia padrÃ£o quando o jogador ataca sem escolher flecha
const ARROW_DEFAULT_ORDER = ['flecha_pesada','flecha_afiada','flecha_corrompida','flecha_venenosa','flecha_paralisante','flecha_lacerante'];

// Estoque inicial de cada item (vazio em jogo real â€” usado agora para testes de sistema)
const STARTING_INVENTORY = {
  pocao_p: 5, pocao_m: 5, pocao_g: 5,
  mana_p: 5, mana_m: 5, mana_g: 5,
  ataduras: 5, antidoto: 5, camomila: 5, xarope: 5,
  cafe_forte: 5,
  flecha_pesada: 50, flecha_afiada: 50, flecha_corrompida: 50,
  flecha_venenosa: 10, flecha_paralisante: 10, flecha_lacerante: 10,
};

function makeInventory() {
  return { ...STARTING_INVENTORY };
}

function getItemDef(id) {
  return ITEMS_CONSUMABLE.find(i => i.id === id) || ARROWS.find(a => a.id === id);
}

// â”€â”€â”€ ALLY & ENEMY TEMPLATES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ALLY_TEMPLATES = [
  { id:'brunhilda', name:'Brunhilda', role:'Guerreira',  attrs:{for:3,dex:1,int:0,agi:1,res:2,det:1}, weapon: WEAPONS.find(w=>w.id==='espada'),        armor: ARMORS.find(a=>a.id==='armadura') },
  { id:'finn',      name:'Finn',      role:'Ladino',     attrs:{for:1,dex:3,int:0,agi:3,res:1,det:0}, weapon: WEAPONS.find(w=>w.id==='adaga'),         armor: ARMORS.find(a=>a.id==='couto') },
  { id:'elowen',    name:'Elowen',    role:'Maga',       attrs:{for:0,dex:1,int:3,agi:1,res:0,det:3}, weapon: WEAPONS.find(w=>w.id==='cajado'),        armor: ARMORS.find(a=>a.id==='tunica') },
  { id:'boran',     name:'Boran',     role:'Defensor',   attrs:{for:2,dex:1,int:0,agi:0,res:3,det:2}, weapon: WEAPONS.find(w=>w.id==='espada_escudo'), armor: ARMORS.find(a=>a.id==='armadura') },
  { id:'sylvara',   name:'Sylvara',   role:'Arqueira',   attrs:{for:0,dex:3,int:0,agi:3,res:1,det:1}, weapon: WEAPONS.find(w=>w.id==='arco'),          armor: ARMORS.find(a=>a.id==='couto') },
  { id:'kael',      name:'Kael',      role:'Monge',      attrs:{for:3,dex:0,int:0,agi:1,res:3,det:1}, weapon: WEAPONS.find(w=>w.id==='maos_livres'),   armor: ARMORS.find(a=>a.id==='couto') },
];

const ENEMY_TEMPLATES = [
  { name:'Soldado Renegado',  attrs:{for:2,dex:1,int:0,agi:1,res:2,det:0}, weapon: WEAPONS.find(w=>w.id==='espada'), armor: ARMORS[0] },
  { name:'MercenÃ¡rio Errante',attrs:{for:1,dex:2,int:0,agi:2,res:1,det:0}, weapon: WEAPONS.find(w=>w.id==='adaga'),  armor: ARMORS[1] },
  { name:'Cultista Sombrio',  attrs:{for:0,dex:1,int:2,agi:1,res:0,det:2}, weapon: WEAPONS.find(w=>w.id==='cajado'), armor: ARMORS[2] },
  { name:'Bandido Veloz',     attrs:{for:1,dex:3,int:0,agi:2,res:0,det:0}, weapon: WEAPONS.find(w=>w.id==='adaga'),  armor: ARMORS[1] },
  { name:'Bruto das Cavernas',attrs:{for:3,dex:0,int:0,agi:0,res:3,det:0}, weapon: WEAPONS.find(w=>w.id==='espada'), armor: ARMORS[0] },
];

// Cria um combatente completo a partir de um template
function makeCombatant(template, side, id, isPlayerControlled) {
  const maxHP = calcHP(template.attrs.res, template.attrs.for);
  const maxMP = calcMP(template.attrs.det, template.attrs.int);
  return {
    id,
    name: template.name,
    role: template.role || null,
    side, // 'player' ou 'enemy'
    isPlayerControlled: !!isPlayerControlled,
    attrs: { ...template.attrs },
    weapon: template.weapon,
    armor: template.armor,
    maxHP, hp: maxHP,
    maxMP, mp: maxMP,
    effects: [],
    buffs: [],
    alive: true,
    paralyzedRoundRolled: false,
    paralyzedThisRound: false,
    inventory: isPlayerControlled ? makeInventory() : null,
    preferredArrow: null, // Ãºltima flecha escolhida manualmente pelo arqueiro
    disease: null, // { stage: 'light'|'medium'|'severe', roundsSick: 0 }
    xp: { for:0, dex:0, int:0, agi:0, res:0, det:0 },
    testedAttrs: new Set(), // atributos testados durante a batalha atual
    comboStage: 1, // estÃ¡gio atual do combo de MÃ£os Livres
    protecting: null, // id do aliado protegido (Cobertura)
  };
}

function markTested(entity, attrId) {
  if (entity && entity.testedAttrs) entity.testedAttrs.add(attrId);
}

// â”€â”€â”€ MAGIC DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Veneno e Paralisia: 3 tiers por nÃ­vel de Cajado. Cada tier reduz a ResistÃªncia testada do alvo
// (resAtkMod) e aumenta custo/duraÃ§Ã£o/potÃªncia. poisonPct = % HP perdido por turno.
const POISON_TIERS = [
  { id:'poison_minor',    name:'Envenenamento Menor',    cost:2,  defAttr:'res', resMod:0,  pct:0.10, turns:3, minWeaponLevel:1, cls:'effect-poison' },
  { id:'poison_moderate', name:'Envenenamento Moderado', cost:5,  defAttr:'res', resMod:-1, pct:0.10, turns:4, minWeaponLevel:2, cls:'effect-poison' },
  { id:'poison_major',    name:'Envenenamento Maior',    cost:10, defAttr:'res', resMod:-2, pct:0.20, turns:5, minWeaponLevel:3, cls:'effect-poison' },
];
const PARALYZE_TIERS = [
  { id:'paralyze_minor',    name:'Paralisia Menor',    cost:2,  defAttr:'res', resMod:0,  chance:0.40, turns:3, minWeaponLevel:1, cls:'effect-paralyze' },
  { id:'paralyze_moderate', name:'Paralisia Moderada', cost:5,  defAttr:'res', resMod:-1, chance:0.50, turns:3, minWeaponLevel:2, cls:'effect-paralyze' },
  { id:'paralyze_major',    name:'Paralisia Maior',    cost:10, defAttr:'res', resMod:-2, chance:0.60, turns:3, minWeaponLevel:3, cls:'effect-paralyze' },
];
// Desmaio: efeito Ãºnico, exige Cajado Nv2+. O teste de DeterminaÃ§Ã£o do alvo Ã© reduzido por
// floor((Int+Det do mago)/5) â€” escala com os atributos do conjurador, sem tiers fixos.
const FAINT_EFFECT = { id:'faint', name:'Desmaio', cost:7, defAttr:'det', desc:'Perde turno+rec', cls:'effect-faint', minWeaponLevel:2 };

// Debuffs de atributo (Fragilidade/NegligÃªncia/ImperÃ­cia/ImprudÃªncia): 3 tiers cada,
// testados pela DeterminaÃ§Ã£o do alvo. attrMod = penalidade fixa em testes de atributo;
// diceMod = dado rolado a cada consulta em combate (atk/def equipamento ou atk_attr/def_attr).
const STAT_DEBUFF_TIERS = {
  fragile: [
    { id:'fragile_minor',    name:'Fragilidade Menor',    cost:2, defAttr:'det', type:'def_attr', attrMod:-1, minWeaponLevel:1, cls:'effect-fragile' },
    { id:'fragile_moderate', name:'Fragilidade Moderada', cost:5, defAttr:'det', type:'def_attr', attrMod:-2, minWeaponLevel:2, cls:'effect-fragile' },
    { id:'fragile_major',    name:'Fragilidade Maior',    cost:7, defAttr:'det', type:'def_attr', attrMod:-3, minWeaponLevel:3, cls:'effect-fragile' },
  ],
  neglect: [
    { id:'neglect_minor',    name:'NegligÃªncia Menor',    cost:2, defAttr:'det', type:'def', diceMod:4,  minWeaponLevel:1, cls:'effect-fragile' },
    { id:'neglect_moderate', name:'NegligÃªncia Moderada', cost:5, defAttr:'det', type:'def', diceMod:6,  minWeaponLevel:2, cls:'effect-fragile' },
    { id:'neglect_major',    name:'NegligÃªncia Maior',    cost:7, defAttr:'det', type:'def', diceMod:10, minWeaponLevel:3, cls:'effect-fragile' },
  ],
  imperit: [
    { id:'imperit_minor',    name:'ImperÃ­cia Menor',      cost:2, defAttr:'det', type:'atk', diceMod:4,  minWeaponLevel:1, cls:'effect-fragile' },
    { id:'imperit_moderate', name:'ImperÃ­cia Moderada',   cost:5, defAttr:'det', type:'atk', diceMod:6,  minWeaponLevel:2, cls:'effect-fragile' },
    { id:'imperit_major',    name:'ImperÃ­cia Maior',      cost:7, defAttr:'det', type:'atk', diceMod:10, minWeaponLevel:3, cls:'effect-fragile' },
  ],
  imprud: [
    { id:'imprud_minor',    name:'ImprudÃªncia Menor',    cost:2, defAttr:'det', type:'atk_attr', attrMod:-1, minWeaponLevel:1, cls:'effect-fragile' },
    { id:'imprud_moderate', name:'ImprudÃªncia Moderada', cost:5, defAttr:'det', type:'atk_attr', attrMod:-2, minWeaponLevel:2, cls:'effect-fragile' },
    { id:'imprud_major',    name:'ImprudÃªncia Maior',    cost:7, defAttr:'det', type:'atk_attr', attrMod:-3, minWeaponLevel:3, cls:'effect-fragile' },
  ],
};
const EFFECTS_ENEMY = [
  ...STAT_DEBUFF_TIERS.fragile,
  ...STAT_DEBUFF_TIERS.neglect,
  ...STAT_DEBUFF_TIERS.imperit,
  ...STAT_DEBUFF_TIERS.imprud,
];
// Sangramento: efeito fÃ­sico, nÃ£o-mÃ¡gico. Causado por Flecha Lacerante e habilidade Apunhalar (Adaga).
// Acumula atÃ© 3 stacks (10% / 15% / 20% HP por turno); cada nova aplicaÃ§Ã£o reseta a duraÃ§Ã£o para 3 turnos.
const BLEED_EFFECT = { id:'bleed', name:'Sangramento', defAttr:'res', cls:'effect-bleed' };
const BLEED_STACK_PCT = [0.10, 0.15, 0.20];
// Buffs de atributo (Blindagem/Preparo/Habilidade/Cautela): 3 tiers cada, sem teste â€”
// aplicados diretamente pelo conjurador no aliado. Mesma estrutura de attrMod/diceMod dos debuffs.
const STAT_BUFF_TIERS = {
  blind: [
    { id:'blind_minor',    name:'Blindagem Menor',    cost:2, type:'def_attr', attrMod:1, minWeaponLevel:1, cls:'effect-regen' },
    { id:'blind_moderate', name:'Blindagem Moderada', cost:5, type:'def_attr', attrMod:2, minWeaponLevel:2, cls:'effect-regen' },
    { id:'blind_major',    name:'Blindagem Maior',    cost:7, type:'def_attr', attrMod:3, minWeaponLevel:3, cls:'effect-regen' },
  ],
  prepare: [
    { id:'prepare_minor',    name:'Preparo Menor',    cost:2, type:'def', diceMod:4,  minWeaponLevel:1, cls:'effect-regen' },
    { id:'prepare_moderate', name:'Preparo Moderado', cost:5, type:'def', diceMod:6,  minWeaponLevel:2, cls:'effect-regen' },
    { id:'prepare_major',    name:'Preparo Maior',    cost:7, type:'def', diceMod:10, minWeaponLevel:3, cls:'effect-regen' },
  ],
  skill: [
    { id:'skill_minor',    name:'Habilidade Menor',    cost:2, type:'atk', diceMod:4,  minWeaponLevel:1, cls:'effect-regen' },
    { id:'skill_moderate', name:'Habilidade Moderada', cost:5, type:'atk', diceMod:6,  minWeaponLevel:2, cls:'effect-regen' },
    { id:'skill_major',    name:'Habilidade Maior',    cost:7, type:'atk', diceMod:10, minWeaponLevel:3, cls:'effect-regen' },
  ],
  caution: [
    { id:'caution_minor',    name:'Cautela Menor',    cost:2, type:'atk_attr', attrMod:1, minWeaponLevel:1, cls:'effect-regen' },
    { id:'caution_moderate', name:'Cautela Moderada', cost:5, type:'atk_attr', attrMod:2, minWeaponLevel:2, cls:'effect-regen' },
    { id:'caution_major',    name:'Cautela Maior',    cost:7, type:'atk_attr', attrMod:3, minWeaponLevel:3, cls:'effect-regen' },
  ],
};
const EFFECTS_ALLY = [
  { id:'regen',   name:'RegeneraÃ§Ã£o', cost:2,  desc:'+10% HP/turno',  cls:'effect-regen' },
  { id:'detox',   name:'Detox',       cost:2,  desc:'Limpa efeitos',  cls:'effect-regen' },
  ...STAT_BUFF_TIERS.blind,
  ...STAT_BUFF_TIERS.prepare,
  ...STAT_BUFF_TIERS.skill,
  ...STAT_BUFF_TIERS.caution,
  { id:'revive',  name:'Reviver',     cost:10, desc:'Revive com 1 HP', cls:'effect-regen' },
];

// Fila de magia do jogador
let magicQueue = { damageTier: null, effect: null, supports: [], revive: false, area: null };
// area: null | 'two' (3 MP, 2 alvos) | 'all' (5 MP, todos) â€” usado apenas por Efeito/Suporte
// damageTier: 'dano' | 'dano_preciso' | 'dano_maior' | null
// supports: array de objetos EFFECTS_ALLY â€” mÃ¡x 1 (Nv1), 2 (Nv2), 3 (Nv3) via SÃ­ntese passiva

// SÃ­ntese passiva: quantos componentes o cajado do ator permite combinar
function synthesisLimit(actor) {
  if (!actor || !actor.weapon) return 1;
  if (actor.weapon.id === 'cajado_arcano') return 3;
  if (actor.weapon.id === 'cajado_avancado') return 2;
  return 1; // Cajado Nv1 â€” sem SÃ­ntese
}

function mpCostQueue(actor) {
  actor = actor || currentActor;
  if (magicQueue.revive) return 10; // Reviver Ã© sempre independente, custo fixo
  let cost = 0;
  if (magicQueue.damageTier && actor) {
    const tier = DAMAGE_TIERS.find(t => t.id === magicQueue.damageTier);
    if (tier) cost += damageSpellCost(actor, tier);
  }
  if (magicQueue.area === 'two') cost += 1;
  else if (magicQueue.area === 'all') cost += 2;
  if (magicQueue.effect) cost += magicQueue.effect.cost;
  magicQueue.supports.forEach(sup => { cost += sup.cost; });
  return cost;
}

let magicPanelOpen = true;

function toggleMagicPanel() {
  magicPanelOpen = !magicPanelOpen;
  const body = document.getElementById('magic-panel-body');
  const icon = document.getElementById('magic-toggle-icon');
  if (body) body.style.display = magicPanelOpen ? '' : 'none';
  if (icon) icon.textContent = magicPanelOpen ? 'â–¾' : 'â–¸';
}

function clearMagicQueue() {
  magicQueue = { damageTier: null, effect: null, supports: [], revive: false, area: null };
  renderMagicPanel();
}



let player = {};
let enemy = {};
let battleActive = false;

// â”€â”€â”€ CREATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let creation = { for:0, dex:0, int:0, agi:0, res:0, det:0 };
let selectedWeapon = WEAPONS[0];
let selectedArmor  = ARMORS[0];
let selectedAllies = [ALLY_TEMPLATES[0], ALLY_TEMPLATES[1]];
const MAX_PTS = 8;
const MAX_PER = 3;

function getPointsLeft() {
  return MAX_PTS - Object.values(creation).reduce((a,b) => a+b, 0);
}

function renderCreation() {
  const builder = document.getElementById('attr-builder');
  builder.innerHTML = '';
  ATTRS.forEach(a => {
    const row = document.createElement('div');
    row.className = 'attr-row';
    const left = getPointsLeft();
    row.innerHTML = `
      <div class="attr-name">
        ${a.name}
        <div class="attr-type">${a.type} â€” ${a.hint}</div>
      </div>
      <div class="attr-controls">
        <button class="btn-small" onclick="changeAttr('${a.id}',-1)" ${creation[a.id]<=0?'disabled':''}>âˆ’</button>
        <div class="attr-val">${creation[a.id]}</div>
        <button class="btn-small" onclick="changeAttr('${a.id}',1)" ${(left<=0||creation[a.id]>=MAX_PER)?'disabled':''}>+</button>
      </div>
    `;
    builder.appendChild(row);
  });

  // Weapon selector
  const ws = document.getElementById('weapon-selector');
  if (ws) {
    ws.innerHTML = '';
    WEAPONS.forEach(w => {
      const btn = document.createElement('button');
      btn.className = 'btn ' + (selectedWeapon.id === w.id ? 'btn-gold' : 'btn-secondary');
      btn.style.fontSize = '0.85rem';
      const dmgLabel = w.unarmed ? '(For+Res)Ã·2 + 1d4 (1d6 se Forâ‰¥10 e Resâ‰¥10)' : `1d${w.dmgDiceSides}${w.dmgBonus ? '+'+w.dmgBonus : ''} ${w.dmgStat}`;
      btn.innerHTML = `${w.name}<br><small style="font-style:italic;color:var(--muted);">${dmgLabel}</small>`;
      btn.onclick = () => { selectedWeapon = w; renderCreation(); };
      ws.appendChild(btn);
    });
  }

  // Armor selector
  const as = document.getElementById('armor-selector');
  if (as) {
    as.innerHTML = '';
    ARMORS.forEach(ar => {
      const btn = document.createElement('button');
      btn.className = 'btn ' + (selectedArmor.id === ar.id ? 'btn-gold' : 'btn-secondary');
      btn.style.fontSize = '0.85rem';
      const protLabel = ar.protecaoDice ? `1d${ar.protecaoDice}` : 'â€”';
      const evaLabel  = ar.evasivaDice  ? `1d${ar.evasivaDice}`  : 'â€”';
      const barLabel  = ar.barreiraDice ? `1d${ar.barreiraDice}` : 'â€”';
      btn.innerHTML = `${ar.name}<br><small style="font-style:italic;color:var(--muted);">Prot ${protLabel} | Eva ${evaLabel} | Bar ${barLabel}</small>`;
      btn.onclick = () => { selectedArmor = ar; renderCreation(); };
      as.appendChild(btn);
    });
  }

  // Ally selector
  const als = document.getElementById('ally-selector');
  if (als) {
    als.innerHTML = '';
    ALLY_TEMPLATES.forEach(a => {
      const selected = selectedAllies.some(x => x.id === a.id);
      const btn = document.createElement('button');
      btn.className = 'btn ' + (selected ? 'btn-gold' : 'btn-secondary');
      btn.style.textAlign = 'left';
      btn.style.fontSize = '0.85rem';
      const attrSummary = ATTRS.map(at => `${at.name.slice(0,3)} ${a.attrs[at.id]}`).join(' Â· ');
      btn.innerHTML = `<strong>${a.name}</strong> â€” ${a.role}<br><small style="font-style:italic;color:var(--muted);">${attrSummary} | ${a.weapon.name} Â· ${a.armor.name}</small>`;
      btn.onclick = () => toggleAlly(a);
      als.appendChild(btn);
    });
  }

  document.getElementById('pts-left').textContent = getPointsLeft();

  const hp = calcHP(creation.res, creation.for);
  const mp = calcMP(creation.det, creation.int);
  document.getElementById('preview-hp').textContent = hp;
  document.getElementById('preview-mp').textContent = mp;
  document.getElementById('preview-class').textContent = suggestClass();
  document.getElementById('btn-confirm').disabled = getPointsLeft() > 0;
}

function changeAttr(id, delta) {
  const next = creation[id] + delta;
  if (next < 0 || next > MAX_PER) return;
  if (delta > 0 && getPointsLeft() <= 0) return;
  creation[id] = next;
  renderCreation();
}

function toggleAlly(template) {
  const idx = selectedAllies.findIndex(a => a.id === template.id);
  if (idx >= 0) {
    if (selectedAllies.length > 1) selectedAllies.splice(idx, 1);
  } else {
    if (selectedAllies.length < 2) {
      selectedAllies.push(template);
    } else {
      selectedAllies[1] = template; // substitui o segundo
    }
  }
  renderCreation();
}

function calcHP(res, fort) {
  const base = res === 0 ? 5 : 10;
  const scale = res === 0 ? 5 : 10;
  const pairs = Math.floor(res / 2);
  return base + pairs * scale + fort;
}

function calcMP(det, intel) {
  const base = det === 0 ? 5 : 10;
  const scale = det === 0 ? 5 : 10;
  const pairs = Math.floor(det / 2);
  return base + pairs * scale + intel;
}

function suggestClass() {
  const { for: f, dex, int: i, res, agi, det } = creation;
  if (i >= 2 && det >= 2) return 'Mago';
  if (dex >= 2 && agi >= 2) return 'Ladino';
  if (f >= 2 && res >= 2) return 'Guerreiro';
  if (f >= 2 || res >= 2) return 'Guerreiro';
  if (dex >= 2 || agi >= 2) return 'Ladino';
  if (i >= 2 || det >= 2) return 'Mago';
  return 'HÃ­brido';
}

let combatants = []; // todos os combatentes da batalha atual (6: player+2 aliados+3 inimigos)

function pickRandomEnemies(n) {
  const pool = [...ENEMY_TEMPLATES];
  const chosen = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    chosen.push(pool[idx]);
    pool.splice(idx, 1);
    if (pool.length === 0) pool.push(...ENEMY_TEMPLATES); // recicla se faltar
  }
  return chosen;
}

function confirmCreation() {
  const maxHP = calcHP(creation.res, creation.for);
  const maxMP = calcMP(creation.det, creation.int);
  player = {
    id: 'player',
    name: 'Aventureiro',
    side: 'player',
    isPlayerControlled: true,
    attrs: { ...creation },
    xp: { for:0, dex:0, int:0, agi:0, res:0, det:0 },
    maxHP, hp: maxHP,
    maxMP, mp: maxMP,
    weapon: selectedWeapon,
    armor:  selectedArmor,
    effects: [], buffs: [],
    alive: true,
    paralyzedRoundRolled: false, paralyzedThisRound: false,
    inventory: makeInventory(),
    preferredArrow: null,
    disease: null,
    testedAttrs: new Set(),
    comboStage: 1,
    protecting: null,
  };

  const ally1 = makeCombatant(selectedAllies[0], 'player', 'ally1', true);
  const ally2 = makeCombatant(selectedAllies[1], 'player', 'ally2', true);

  const enemyTemplates = pickRandomEnemies(3);
  const enemy1 = makeCombatant(enemyTemplates[0], 'enemy', 'enemy1', false);
  const enemy2 = makeCombatant(enemyTemplates[1], 'enemy', 'enemy2', false);
  const enemy3 = makeCombatant(enemyTemplates[2], 'enemy', 'enemy3', false);

  combatants = [player, ally1, ally2, enemy1, enemy2, enemy3];

  buildMainScreen();
  showScreen('screen-main');
}

function alivePlayerSide() { return combatants.filter(c => c.side === 'player' && c.alive); }
function aliveEnemySide()  { return combatants.filter(c => c.side === 'enemy'  && c.alive); }
function getCombatant(id)  { return combatants.find(c => c.id === id); }

// â”€â”€â”€ MAIN SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildMainScreen() {
  renderSheet();
  renderTestButtons();
  // initBattle Ã© chamado ao confirmar personagem, apÃ³s montar combatants[]
  setTimeout(initBattle, 200);
}

function showTab(id) {
  ['tab-sheet','tab-tests','tab-battle'].forEach(t => {
    document.getElementById(t).style.display = t === id ? '' : 'none';
  });
  document.querySelectorAll('.nav-tab').forEach((btn, i) => {
    btn.classList.toggle('active', ['tab-sheet','tab-tests','tab-battle'][i] === id);
  });
}

// â”€â”€â”€ SHEET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderSheet() {
  const grid = document.getElementById('sheet-attrs');
  grid.innerHTML = '';
  ATTRS.forEach(a => {
    const val = player.attrs[a.id];
    const xp = player.xp[a.id];
    const xpPct = Math.min((xp / xpNeeded(val)) * 100, 100);
    grid.innerHTML += `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:10px 12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:.95rem;">${a.name}</span>
          <span style="font-family:'Cinzel',serif;font-size:1.3rem;color:var(--gold);">${val}</span>
        </div>
        <div class="xp-row">
          <div class="xp-bar"><div class="xp-fill" style="width:${xpPct}%"></div></div>
          <div class="xp-label">${xp}/${xpNeeded(val)} xp</div>
        </div>
      </div>
    `;
  });

  const bars = document.getElementById('sheet-bars');
  bars.innerHTML = `
    <div class="stat-bar-row">
      <div class="stat-bar-label" style="color:var(--hp-light)">HP</div>
      <div class="bar-track"><div class="bar-fill bar-hp ${player.hp/player.maxHP < 0.3 ? 'low':''}" style="width:${(player.hp/player.maxHP)*100}%"></div></div>
      <div class="stat-val">${player.hp} / ${player.maxHP}</div>
    </div>
    <div class="stat-bar-row">
      <div class="stat-bar-label" style="color:var(--mp-light)">MP</div>
      <div class="bar-track"><div class="bar-fill bar-mp" style="width:${(player.mp/player.maxMP)*100}%"></div></div>
      <div class="stat-val">${player.mp} / ${player.maxMP}</div>
    </div>
  `;
}

// â”€â”€â”€ TESTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function xpNeeded(attrVal) {
  if (attrVal <= 3)  return 10;
  if (attrVal <= 7)  return 20;
  if (attrVal <= 11) return 30;
  if (attrVal <= 17) return 40;
  return 50;
}

function renderTestButtons() {
  const grid = document.getElementById('test-buttons');
  grid.innerHTML = '';
  ATTRS.forEach(a => {
    const btn = document.createElement('div');
    btn.className = 'test-attr-btn';
    const val = player.attrs[a.id];
    btn.innerHTML = `
      <div class="t-name">${a.name}</div>
      <div class="t-val">${val}</div>
      <div class="t-hint">${a.hint}</div>
    `;
    btn.onclick = () => runTest(a);
    grid.appendChild(btn);
  });
}

function runTest(attr) {
  const val = player.attrs[attr.id];
  const success = successCheck(val);

  let cls, verdict, detail;
  if (success) {
    cls = 'roll-success'; verdict = 'âœ¦ Sucesso âœ¦';
    detail = `${attr.name} â€” +1 XP`;
    giveXP(attr.id, 1);
  } else {
    cls = 'roll-fail'; verdict = 'âœ¦ Falha âœ¦';
    detail = `${attr.name} â€” +2 XP`;
    giveXP(attr.id, 2);
  }

  const res = document.getElementById('test-result');
  res.style.display = '';
  res.innerHTML = `
    <div class="roll-verdict ${cls}" style="font-size:1.8rem; margin-bottom:8px;">${verdict}</div>
    <div class="roll-detail">${detail}</div>
  `;
  renderSheet();
  renderTestButtons();
}

// â”€â”€â”€ BATTLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function applyDamage(entity, dmg, skipCobertura = false) {
  // Cobertura (Espada e Escudo): divide 50% do dano com o protetor antes de aplicar
  if (!skipCobertura && dmg > 0) {
    const protector = combatants.find(c => c.alive && c.protecting === entity.id);
    if (protector && protector.id !== entity.id) {
      const half1 = Math.ceil(dmg / 2);
      const half2 = Math.floor(dmg / 2);
      logEntry(`ðŸ›¡ ${protector.name} cobre ${entity.name} e divide o dano!`, 'log-info');
      applyDamage(protector, half1, true);
      applyDamage(entity, half2, true);
      return;
    }
  }

  // TÃºnica: absorÃ§Ã£o de emergÃªncia â€” ativa se Int>=2, Det>=3, HP<10
  if (entity.armor && entity.armor.armorPassive === 'tunic' &&
      entity.attrs.int >= 2 && entity.attrs.det >= 3 &&
      entity.hp < 10 && entity.mp > 0) {
    const absorbed = Math.max(1, Math.ceil(dmg * 0.10));
    const mpCost   = absorbed;
    if (entity.mp >= mpCost) {
      entity.mp -= mpCost;
      dmg = Math.max(0, dmg - absorbed);
      logEntry(`ðŸ”® TÃºnica de ${entity.name} absorve ${absorbed} de dano! (âˆ’${mpCost} MP)`, 'log-info');
    }
  }

  entity.hp = Math.max(0, entity.hp - dmg);
  // Atordoamento cancela ao receber qualquer dano
  if (entity.effects) {
    const hadStun = entity.effects.some(e => e.id === 'stun');
    entity.effects = entity.effects.filter(e => e.id !== 'stun');
    if (hadStun) logEntry(`${entity.name} se recupera do atordoamento!`, 'log-info');
  }
  if (entity.hp === 0 && entity.alive) {
    entity.alive = false;
    logEntry(`ðŸ’€ ${entity.name} foi derrotado!`, entity.side === 'enemy' ? 'log-victory' : 'log-defeat');
  }
}

function initBattle() {
  battleActive = true;
  currentActor = null;
  pendingAction = null;
  globalRoundCount = 0;
  clearLog();
  logEntry('âš” Uma nova batalha comeÃ§a!', 'log-info');
  logEntry(`Seu grupo: ${combatants[0].name}, ${combatants[1].name}, ${combatants[2].name}`, 'log-sys');
  logEntry(`Oponentes: ${combatants[3].name}, ${combatants[4].name}, ${combatants[5].name}`, 'log-sys');
  document.getElementById('battle-end').style.display = 'none';
  hideTargetSelector();
  runPlagueTest();
  startRound();
}

// Plague Test: 50% de chance no inÃ­cio de cada batalha de um personagem aleatÃ³rio do lado
// do jogador contrair DoenÃ§a (sem teste de resistÃªncia). Se jÃ¡ houver alguÃ©m doente do lado
// do jogador (persistiu de uma batalha anterior), o teste nÃ£o roda.
function runPlagueTest() {
  const playerSide = combatants.filter(c => c.side === 'player');
  const alreadySick = playerSide.some(c => c.disease);
  if (alreadySick) return;
  if (Math.random() >= 0.5) return;
  const victim = playerSide[Math.floor(Math.random() * playerSide.length)];
  logEntry(`â˜£ Plague Test: ${victim.name} contraiu uma doenÃ§a antes mesmo da batalha comeÃ§ar!`, 'log-info');
  applyDisease(victim, 'light');
}

function renderBattle() {
  const display = document.getElementById('combatants-display');
  display.innerHTML = '';
  combatants.forEach(c => {
    const effMaxHP = getEffectiveMaxHP(c);
    const pct = Math.max(0, (c.hp / effMaxHP) * 100);
    const isCurrent = currentActor && currentActor.id === c.id;
    const cardClass = c.side === 'player' ? 'player-card' : 'enemy-card';
    const card = document.createElement('div');
    card.className = `combatant-card ${cardClass}`;
    card.style.opacity = c.alive ? '1' : '0.4';
    if (isCurrent) card.style.boxShadow = '0 0 0 2px var(--gold)';

    let badges = '';
    (c.effects||[]).forEach(e => {
      const ef = [...EFFECTS_ENEMY, ...EFFECTS_ALLY].find(x=>x.id===e.id);
      let cls = e.cls || ef?.cls || 'effect-fragile';
      let nm  = e.name || ef?.name || e.id;
      if (e.id === 'bleed') { cls = 'effect-bleed'; nm = 'Sangramento'; }
      if (e.id === 'stun')  { cls = 'effect-paralyze'; nm = 'Atordoamento'; }
      badges += `<span class="effect-badge ${cls}">${nm} (${e.turnsLeft})</span>`;
    });
    (c.buffs||[]).forEach(b => {
      badges += `<span class="effect-badge effect-regen">${b.name} (${b.turnsLeft})</span>`;
    });
    if (c.defending) badges += `<span class="effect-badge effect-regen">Defendendo</span>`;
    if (c.disease) {
      const dLabel = {light:'DoenÃ§a Leve',medium:'DoenÃ§a MÃ©dia',severe:'DoenÃ§a Grave'}[c.disease.stage];
      badges += `<span class="effect-badge effect-disease">${dLabel}</span>`;
    }

    const arrowLabel = c.weapon.arrowBased ? ` Â· ${getActiveArrowName(c)}` : '';

    card.innerHTML = `
      <div class="combatant-name">${c.name}${c.role?` <span style="color:var(--muted);font-size:.7rem;">(${c.role})</span>`:''}${!c.alive?' â˜ ':''}</div>
      <div style="font-size:.7rem;color:var(--muted);text-align:center;margin-bottom:4px;">${c.weapon.name}${arrowLabel} Â· ${c.armor.name}</div>
      <div class="stat-bars">
        <div class="stat-bar-row">
          <div class="stat-bar-label" style="color:var(--hp-light);font-size:.7rem;">HP</div>
          <div class="bar-track"><div class="bar-fill bar-hp ${pct<30?'low':''}" style="width:${pct}%"></div></div>
          <div class="stat-val" style="font-size:.75rem;">${c.hp}/${effMaxHP}${effMaxHP!==c.maxHP?`<span style="color:var(--dmg);font-size:.65rem;"> (${c.maxHP})</span>`:''}</div>
        </div>
        ${c.maxMP>0?`<div class="stat-bar-row">
          <div class="stat-bar-label" style="color:var(--mp-light);font-size:.7rem;">MP</div>
          <div class="bar-track"><div class="bar-fill bar-mp" style="width:${(c.mp/c.maxMP)*100}%"></div></div>
          <div class="stat-val" style="font-size:.75rem;">${c.mp}/${c.maxMP}</div>
        </div>`:''}
      </div>
      ${badges ? `<div style="margin-top:4px;">${badges}</div>` : ''}
    `;
    display.appendChild(card);
  });

  const ti = document.getElementById('turn-indicator');
  ti.innerHTML = currentActor
    ? `<span style="font-family:'Cinzel',serif; color:var(--gold);">Vez de: ${currentActor.name}</span>`
    : `<span style="font-family:'Cinzel',serif; color:var(--gold);">...</span>`;

  const actionPanel = document.getElementById('action-panel');
  const grid = document.getElementById('attack-buttons');
  const defendBtn = document.getElementById('btn-defend');

  if (!currentActor || !currentActor.isPlayerControlled) {
    actionPanel.style.display = 'none';
    ['skill-panel','swap-panel','inventory-panel'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    return;
  }
  actionPanel.style.display = '';
  const actorLabel = document.getElementById('action-actor-name');
  if (actorLabel) actorLabel.textContent = currentActor ? currentActor.name : '';

  // Magia agora Ã© parte do skill-panel â€” controlada por renderSkillPanel()

  if (pendingAction) {
    grid.innerHTML = '';
    defendBtn.disabled = true;
    return;
  }

  grid.innerHTML = '';
  const actor = currentActor;
  const w = actor.weapon;
  const atkVal = actor.attrs[w.atkAttr];
  const btn = document.createElement('button');
  btn.className = 'btn-attack';
  btn.style.gridColumn = 'span 3';
  btn.innerHTML = `Atacar com ${w.name} <span class="attr-hint">Teste: ${ATTRS.find(a=>a.id===w.atkAttr).name} (${atkVal})</span>`;
  btn.onclick = () => startTargeting('attack');
  grid.appendChild(btn);

  defendBtn.disabled = false;
}

// â”€â”€â”€ ALVO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function startTargeting(type) {
  pendingAction = type;
  areaTargetsPicked = [];
  const selector = document.getElementById('target-selector');
  const btnsDiv = document.getElementById('target-buttons');
  const label = document.getElementById('target-selector-label');
  btnsDiv.innerHTML = '';

  let targets;
  if (type === 'magic_revive') {
    targets = combatants.filter(c => c.side === 'player' && !c.alive);
  } else if (type === 'magic_support' || type === 'magic_heal') {
    targets = alivePlayerSide();
  } else if (type === 'magic_area_two') {
    // pool depende do tipo de magia (ofensiva â†’ inimigos, cura/suporte â†’ aliados)
    const isHeal = magicQueue.supports.length > 0;
    targets = isHeal ? alivePlayerSide() : aliveEnemySide();
  } else if (type === 'skill_cobertura') {
    targets = alivePlayerSide().filter(c => c.id !== currentActor.id);
  } else if (type.startsWith('heal_spell_')) {
    targets = alivePlayerSide();
  } else {
    targets = aliveEnemySide();
  }

  if (type === 'magic_area_two') {
    if (label) label.textContent = 'Escolha 2 alvos (0/2):';
    renderAreaTwoButtons(targets, btnsDiv, label);
  } else {
    if (label) label.textContent = 'Escolha o alvo:';
    targets.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.textAlign = 'left';
      btn.style.fontSize = '0.85rem';
      btn.innerHTML = `${t.name} <span style="color:var(--muted);">(HP ${t.hp}/${t.maxHP})</span>`;
      btn.onclick = () => resolveTargetedAction(t);
      btnsDiv.appendChild(btn);
    });
  }

  selector.style.display = '';
  document.getElementById('attack-buttons').style.display = 'none';
  document.getElementById('btn-defend').disabled = true;
}

function renderAreaTwoButtons(targets, btnsDiv, label) {
  btnsDiv.innerHTML = '';
  targets.forEach(t => {
    const picked = areaTargetsPicked.includes(t);
    const btn = document.createElement('button');
    btn.className = 'btn ' + (picked ? 'btn-gold' : 'btn-secondary');
    btn.style.textAlign = 'left';
    btn.style.fontSize = '0.85rem';
    btn.id = 'area-btn-' + t.id;
    btn.innerHTML = `${picked ? 'âœ¦ ' : ''}${t.name} <span style="color:var(--muted);">(HP ${t.hp}/${t.maxHP})</span>`;
    btn.onclick = () => toggleAreaTarget(t, targets, label);
    btnsDiv.appendChild(btn);
  });

  // BotÃ£o confirmar â€” sÃ³ aparece com 2 selecionados
  const confirmBtn = document.createElement('button');
  confirmBtn.id = 'area-confirm-btn';
  confirmBtn.className = 'btn btn-primary';
  confirmBtn.style.marginTop = '8px';
  confirmBtn.style.fontSize = '0.85rem';
  confirmBtn.style.display = areaTargetsPicked.length === 2 ? '' : 'none';
  confirmBtn.textContent = 'Confirmar alvos';
  confirmBtn.onclick = () => resolveAreaTwo();
  btnsDiv.appendChild(confirmBtn);
}

function toggleAreaTarget(target, targets, label) {
  const idx = areaTargetsPicked.indexOf(target);
  if (idx >= 0) {
    areaTargetsPicked.splice(idx, 1);
  } else if (areaTargetsPicked.length < 2) {
    areaTargetsPicked.push(target);
  }
  const btnsDiv = document.getElementById('target-buttons');
  if (label) label.textContent = `Escolha 2 alvos (${areaTargetsPicked.length}/2):`;
  renderAreaTwoButtons(targets, btnsDiv, label);
}

function resolveAreaTwo() {
  const actor = currentActor;
  hideTargetSelector();
  pendingAction = null;
  const isSupport = magicQueue.supports.length > 0;
  const type = isSupport ? 'support' : 'offense';
  castMagicArea(actor, type, areaTargetsPicked);
  areaTargetsPicked = [];
}

function cancelTargeting() {
  pendingAction = null;
  hideTargetSelector();
  renderBattle();
}

function hideTargetSelector() {
  const sel = document.getElementById('target-selector');
  const grid = document.getElementById('attack-buttons');
  if (sel) sel.style.display = 'none';
  if (grid) grid.style.display = '';
}

function resolveTargetedAction(target) {
  const actor = currentActor;
  const action = pendingAction;
  hideTargetSelector();
  pendingAction = null;

  if (action === 'attack') {
    resolveAttack(actor, target);
    renderBattle(); renderSheet();
    endTurn();
  } else if (action === 'magic_revive') {
    // Reviver â€” sem teste. Exige Intâ‰¥3 e Detâ‰¥5. Custa 10 MP fixo.
    const cost = 10;
    if (actor.attrs.int < 3 || actor.attrs.det < 5) {
      logEntry(`${actor.name} nÃ£o atende aos requisitos para Reviver (Int 3+, Det 5+).`, 'log-miss');
      clearMagicQueue(); renderBattle(); renderMagicPanel(); return;
    }
    if (cost > actor.mp) {
      logEntry(`MP insuficiente! NecessÃ¡rio: ${cost}, disponÃ­vel: ${actor.mp}.`, 'log-miss');
      clearMagicQueue(); renderBattle(); renderMagicPanel(); return;
    }
    actor.mp -= cost;
    markTested(actor, 'int');
    markTested(actor, 'det');
    logDivider();
    const diceRoll = rollDice(actor.attrs.det);
    const intBonus = Math.floor(actor.attrs.int / 2);
    const reviveHp = Math.min(target.maxHP, diceRoll + intBonus);
    target.alive = true;
    target.hp = reviveHp;
    target.effects = [];
    target.buffs = [];
    target.paralyzedRoundRolled = false;
    target.paralyzedThisRound = false;
    logEntry(`âœ¦ ${actor.name} revive ${target.name}! (Custo: ${cost} MP) â€” 1d${actor.attrs.det} â†’ ${diceRoll} + ${intBonus} (IntÃ·2)`, 'log-info');
    logEntry(`âœ¦ ${target.name} voltou ao combate com ${reviveHp} HP!`, 'log-victory');
    clearMagicQueue();
    renderBattle(); renderSheet(); renderMagicPanel();
    endTurn();
  } else if (action === 'magic_offensive' || action === 'magic_support') {
    castMagicResolved(actor, target);
  } else if (action === 'skill_apunhalar') {
    resolveApunhalar(actor, target);
  } else if (action === 'skill_bravura') {
    resolveBravura(actor, target);
  } else if (action === 'skill_cobertura') {
    setCobertura(actor, target);
  } else if (action.startsWith('skill_combo_')) {
    resolveComboAttack(actor, target, action);
  } else if (action.startsWith('heal_spell_')) {
    resolveHealSpell(actor, target, action.replace('heal_spell_', ''));
  }
}

function rollDice(sides) { return Math.floor(Math.random() * sides) + 1; }

function calcRawDmg(attacker, defender) {
  const w = attacker.weapon;
  const skillBonus = attacker.skillDmgBonus || 0;

  // MÃ£os Livres: (For+Res)/2 + dado (1d4 base; 1d6 se For>=10 E Res>=10)
  if (w.unarmed) {
    const base = Math.floor((attacker.attrs.for + attacker.attrs.res) / 2);
    const diceSides = (attacker.attrs.for >= 10 && attacker.attrs.res >= 10) ? 6 : 4;
    return base + rollDice(diceSides) + skillBonus;
  }

  // Arco: delega para funÃ§Ã£o com suporte a flechas
  if (w.arrowBased) return calcRawDmgWithArrow(attacker, defender) + skillBonus;

  const dmgStat = w.dmgStat;
  const defStat = DMG_VS_DEF[dmgStat];

  // Dano da arma agora Ã© uma rolagem de dado + bÃ´nus fixo (Espada e Escudo usa o dado de PotÃªncia)
  let atkBase = rollDice(w.dmgDiceSides) + (w.dmgBonus || 0);
  // Defensiva (Espada e Escudo): converte 1 PotÃªncia em 1 ProteÃ§Ã£o prÃ³pria â€” reduz o prÃ³prio dano
  const hasDefensiva = (attacker.buffs || []).some(b => b.id === 'defensiva');
  if (hasDefensiva && (isShieldWeapon(w) || dmgStat === 'potencia')) atkBase = Math.max(0, atkBase - 1);

  let defRoll = rollArmorDefense(defender.armor, defStat);
  let defBase = defRoll.value;
  const defHasDefensiva = (defender.buffs || []).some(b => b.id === 'defensiva');
  if (defHasDefensiva && defStat === 'protecao') defBase += 1;

  // Passiva de Cota de Malha/Armadura de Placas/Pesada: rolagem mÃ¡xima concede +1 de defesa (sÃ³ neste cÃ¡lculo)
  if (defRoll.isMax && defender.armor.armorPassive === 'plate') {
    defBase += 1;
    logEntry(`ðŸ›¡ ${defender.name}: defesa mÃ¡xima na ${defender.armor.name}! (+1)`, 'log-sys');
  }
  // Passiva de Roupa de Couro/CouraÃ§a: rolagem mÃ¡xima causa 1 de dano de retaliaÃ§Ã£o (nÃ£o se aplica a magia)
  if (defRoll.isMax && defender.armor.armorPassive === 'leather' && !attacker.actedWithMagic) {
    applyDamage(attacker, 1);
    logEntry(`ðŸ—¡ ${defender.name}: defesa mÃ¡xima na ${defender.armor.name}! ${attacker.name} sofre 1 de dano de retaliaÃ§Ã£o!`, 'log-dmg');
  }

  const atkMod  = getEffectMod(attacker, 'atk');
  const defMod  = getEffectMod(defender, 'def');
  const atkFinal = atkBase + atkMod;
  const defFinal = defBase + defMod;
  return atkFinal + atkBonus(attacker) - defFinal - defBonus(defender) + skillBonus;
}

function resolveAttack(attacker, defender) {
  attacker.lastAttackHit = false;
  const w = attacker.weapon;

  // Arco: resolve flecha ativa, podendo usar MÃ£os Livres se sem estoque
  let activeArrow = null;
  let effectiveWeapon = w;
  if (w.arrowBased) {
    activeArrow = getActiveArrow(attacker);
    if (!activeArrow) {
      // Sem flechas â€” usa MÃ£os Livres
      logEntry(`${attacker.name} sem flechas â€” usa MÃ£os Livres!`, 'log-info');
      effectiveWeapon = WEAPONS.find(x => x.unarmed);
    }
  }

  const atkAttrId = effectiveWeapon.atkAttr;
  const defAttrId = ATK_VS_DEF_ATTR[atkAttrId];
  markTested(attacker, atkAttrId);
  markTested(defender, defAttrId);
  const atkAttr = Math.max(1, attacker.attrs[atkAttrId] + getEffectMod(attacker, 'atk_attr') + getAttrTestMod(attacker, 'atk_attr'));
  const defAttr = Math.max(1, defender.attrs[defAttrId] + getAttrTestMod(defender, 'def_attr'));
  const rawDmg  = w.arrowBased && activeArrow
    ? calcRawDmgWithArrow(attacker, defender, activeArrow)
    : calcRawDmg(attacker, defender);

  const defFainted   = hasEffect(defender, 'faint');
  const defParalyzed = defFainted ? false : rollParalysisRound(defender);

  const weaponLabel = w.arrowBased
    ? (activeArrow ? `${w.name} (${activeArrow.name})` : 'MÃ£os Livres')
    : w.name;
  logEntry(`${attacker.name} ataca ${defender.name} com ${weaponLabel} (d${effectiveWeapon.dice})`, 'log-sys');

  // Consome a flecha ANTES de resolver o ataque
  if (w.arrowBased && activeArrow && attacker.inventory) {
    attacker.inventory[activeArrow.id] = Math.max(0, (attacker.inventory[activeArrow.id] || 0) - 1);
    // Se a flecha preferida acabou, limpa a preferÃªncia
    if (attacker.preferredArrow === activeArrow.id && attacker.inventory[activeArrow.id] === 0) {
      attacker.preferredArrow = null;
    }
  }

  // â”€â”€ Desmaiado: sem defesa, sem contraataque â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (defFainted) {
    const aRoll = rollDice(effectiveWeapon.dice);
    const aHit  = aRoll !== effectiveWeapon.dice && aRoll <= atkAttr;
    logEntry(`${attacker.name} rola ${aRoll} vs ${ATTRS.find(a=>a.id===atkAttrId).name} ${atkAttr}`, 'log-sys');
    logEntry(`${defender.name} estÃ¡ desmaiado â€” sem defesa e sem contraataque!`, 'log-info');
    if (!aHit) {
      logEntry(`${attacker.name} errou mesmo com ${defender.name} desmaiado!`, 'log-miss');
      return;
    }
    // Dano sem armadura = rawDmg + defesa da armadura (neutralizamos a subtraÃ§Ã£o), dividido por 2
    attacker.lastAttackHit = true;
    const explosiveFull = Math.max(1, rawDmg + atkBonus(attacker));
    const explosiveDmg  = Math.max(1, Math.floor(explosiveFull / 2));
    applyDamage(defender, explosiveDmg);
    logEntry(`ðŸ’¥ Golpe em ${defender.name} desmaiado! ${explosiveDmg} de dano (sem defesa, metade)!`, 'log-dmg');
    defender.effects = defender.effects.filter(e => e.id !== 'faint');
    logEntry(`${defender.name} acorda do desmaio!`, 'log-info');
    if (activeArrow?.effect) rollArrowEffect(attacker, defender, activeArrow);
    return;
  }

  // â”€â”€ Defensor conjurou magia neste turno â€” sem contraataque, sem frenÃ©tico â”€â”€
  if (defender.actedWithMagic) {
    const aRoll = rollDice(effectiveWeapon.dice);
    const aHit  = aRoll !== effectiveWeapon.dice && aRoll <= atkAttr;
    logEntry(`${attacker.name} rola ${aRoll} vs ${ATTRS.find(a=>a.id===atkAttrId).name} ${atkAttr}`, 'log-sys');
    logEntry(`${defender.name} conjurou magia â€” sem defesa nem contraataque!`, 'log-info');
    if (!aHit) {
      logEntry(`${attacker.name} errou!`, 'log-miss');
    } else {
      attacker.lastAttackHit = true;
      const dmg = Math.max(1, rawDmg);
      applyDamage(defender, dmg);
      logEntry(`${defender.name} sofre ${dmg} de dano!`, 'log-dmg');
      if (activeArrow?.effect) rollArrowEffect(attacker, defender, activeArrow);
    }
    return;
  }

  // â”€â”€ Combate normal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const FRANTIC_LINES = [
    'Os dois entram em um combate frenÃ©tico!',
    'LÃ¢minas se cruzam sem parar â€” nenhum cede terreno!',
    'O combate se torna caÃ³tico â€” cada golpe Ã© bloqueado!',
    'Uma troca furiosa de ataques â€” nenhum consegue vantagem!',
    'O duelo acelera â€” os movimentos se tornam impossÃ­veis de acompanhar!',
  ];

  let aRoll, dRoll, aHit, dPass;
  let clashCount = 0;
  const MAX_CLASHES = 5;
  // Cobertura: quem estÃ¡ protegendo alguÃ©m sempre perde o frenÃ©tico no clash decisivo
  const attackerIsProtector = combatants.some(c => c.id === attacker.id && c.protecting);
  const defenderIsProtector = combatants.some(c => c.id === defender.id && c.protecting);

  do {
    aRoll = rollDice(effectiveWeapon.dice);
    dRoll = defParalyzed ? null : rollDice(defender.weapon.dice);

    aHit  = aRoll !== effectiveWeapon.dice && aRoll <= atkAttr;
    dPass = !defParalyzed && dRoll !== defender.weapon.dice && dRoll <= defAttr;

    // Bravura: garante sucesso no ataque e resolve frenÃ©tico a favor do atacante
    if (attacker.guaranteedHit) { aHit = true; dPass = false; }

    // Falha automÃ¡tica do atacante â€” sai do loop imediatamente
    if (aRoll === effectiveWeapon.dice) {
      logEntry(`âœ¦ Falha automÃ¡tica de ${attacker.name}! (rolou ${aRoll})`, 'log-miss');
      if (dPass) {
        const cRaw = calcRawDmg(defender, attacker);
        const adagaFull = defender.weapon.id === 'adaga' && defender.attrs.agi > attacker.attrs.agi;
        const cDmg = adagaFull ? Math.max(1, cRaw) : Math.max(1, Math.floor(cRaw / 2));
        const cLabel = adagaFull ? 'dano cheio (adaga mais rÃ¡pida)' : 'metade';
        logEntry(`${defender.name} contraataca! Dano: ${cDmg} (${cLabel}).`, 'log-dmg');
        applyDamage(attacker, cDmg);
      }
      return;
    }

    if (aHit && dPass) {
      clashCount++;
      // Log resumido: uma linha por clash com ambos os rolls
      const clashLabel = clashCount < MAX_CLASHES
        ? (FRANTIC_LINES[clashCount - 1] || 'O combate continua frenÃ©tico!')
        : FRANTIC_LINES[4];
      logEntry(`[${clashCount}/${MAX_CLASHES}] ${clashLabel} (atk ${aRoll} vs ${atkAttr} / def ${dRoll} vs ${defAttr})`, 'log-info');

      if (clashCount >= MAX_CLASHES) {
        // Sorteio final: quem rolar mais alto no dado decide
        const tieAtkRoll = rollDice(effectiveWeapon.dice);
        const tieDefRoll = rollDice(defender.weapon.dice);
        logEntry(`Sorteio decisivo! ${attacker.name} rola ${tieAtkRoll} vs ${defender.name} rola ${tieDefRoll}`, 'log-sys');
        // Cobertura: protetor sempre perde o frenÃ©tico
        const forceAttackerLoses = attackerIsProtector;
        const forceDefenderLoses = defenderIsProtector && !forceAttackerLoses;
        if (forceAttackerLoses) {
          logEntry(`${attacker.name} estÃ¡ protegendo um aliado e cede terreno!`, 'log-info');
        } else if (forceDefenderLoses) {
          logEntry(`${defender.name} estÃ¡ protegendo um aliado e cede terreno!`, 'log-info');
        }
        if ((tieAtkRoll >= tieDefRoll && !forceAttackerLoses) || forceDefenderLoses) {
          attacker.lastAttackHit = true;
          logEntry(`${attacker.name} rompe a defesa de ${defender.name} por um fio!`, 'log-hit');
          const shieldFull = isShieldWeapon(attacker.weapon);
          const halfDmg = shieldFull ? Math.max(1, rawDmg) : Math.max(1, Math.floor(rawDmg / 2));
          applyDamage(defender, halfDmg);
          logEntry(`${defender.name} sofre ${halfDmg} de dano${shieldFull ? ' (escudo mantÃ©m dano cheio)' : ' (metade por desgaste)'}!`, 'log-dmg');
        } else {
          logEntry(`${defender.name} resiste e ${attacker.name} recua exausto!`, 'log-miss');
          const halfDmg = Math.max(1, Math.floor(calcRawDmg(defender, attacker) / 2));
          applyDamage(attacker, halfDmg);
          logEntry(`${attacker.name} sofre ${halfDmg} de dano (recuo)!`, 'log-dmg');
        }
        return;
      }
    } else {
      // Resultado diferente â€” log dos rolls antes de sair do loop
      if (!defParalyzed) {
        logEntry(`${attacker.name} rola ${aRoll} vs ${atkAttr} / ${defender.name} rola ${dRoll} vs ${defAttr}`, 'log-sys');
      } else {
        logEntry(`${attacker.name} rola ${aRoll} vs ${atkAttr} / ${defender.name} paralisado`, 'log-sys');
      }
    }

  } while (aHit && dPass);

  // â”€â”€ ResoluÃ§Ã£o final (saiu do loop com resultado diferente) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!aHit && dPass) {
    logEntry(`${attacker.name} falhou â€” ${defender.name} contraataca!`, 'log-miss');
    const cRaw2 = calcRawDmg(defender, attacker);
    const adagaFull2 = defender.weapon.id === 'adaga' && defender.attrs.agi > attacker.attrs.agi;
    const cDmg2 = adagaFull2 ? Math.max(1, cRaw2) : Math.max(1, Math.floor(cRaw2 / 2));
    const cLabel2 = adagaFull2 ? 'dano cheio (adaga mais rÃ¡pida)' : 'metade';
    logEntry(`Contraataque: ${cDmg2} de dano em ${attacker.name} (${cLabel2})!`, 'log-dmg');
    applyDamage(attacker, cDmg2);
    return;
  }

  if (!aHit && !dPass) {
    logEntry(`Ambos falharam â€” nada acontece.`, 'log-miss');
    return;
  }

  // aHit && !dPass â€” dano cheio, mÃ­nimo 1
  attacker.lastAttackHit = true;
  const finalDmg = Math.max(1, rawDmg);
  applyDamage(defender, finalDmg);
  logEntry(`${defender.name} sofre ${finalDmg} de dano!`, 'log-dmg');
  rollStun(attacker, defender);

  // Efeito de flecha especial (se ataque acertou e causou dano â‰¥0, mesmo que 0)
  if (activeArrow?.effect) {
    rollArrowEffect(attacker, defender, activeArrow);
  }
}

function applyCounterAttack(attackerEntity, attackerWeapon, defenderEntity, defenderArmor, defenderName, isPlayer) {
  // mantido para compatibilidade mas resolveAttack substitui nos combates 3v3
  const cw = attackerWeapon;
  const dmgStat = cw.dmgStat;
  const defStat = DMG_VS_DEF[dmgStat];
  const bonus = atkBonus(attackerEntity);
  const defBon = defBonus(defenderEntity);
  const dmg = cw[dmgStat] + bonus - defenderArmor[defStat] - defBon;
  if (dmg <= 0) logEntry(`âœ¦ Contraataque absorvido! Dano: 0.`, 'log-miss');
  else {
    logEntry(`âœ¦ Contraataque! Dano: ${dmg}.`, 'log-dmg');
    if (isPlayer) player.hp = Math.max(0, player.hp - dmg);
    else defenderEntity.hp = Math.max(0, defenderEntity.hp - dmg);
  }
}

function renderMagicPanel() {
  if (!document.getElementById('mp-display')) return;
  const actor = currentActor || player;
  const cost = mpCostQueue(actor);
  const mpLeft = actor.mp - cost;
  document.getElementById('mp-display').textContent = `MP de ${actor.name}: ${actor.mp} / ${actor.maxMP} â€” Custo fila: ${cost} (restarÃ¡ ${Math.max(0,mpLeft)})`;

  // BotÃµes de dano adicional
  const dmgDiv = document.getElementById('dmg-magic-btns');
  if (dmgDiv) {
    dmgDiv.innerHTML = '';
    DAMAGE_TIERS.forEach(tier => {
      const available = damageSpellAvailable(actor, tier);
      const cost = available ? damageSpellCost(actor, tier) : 0;
      const btn = document.createElement('button');
      btn.className = 'btn-magic' + (magicQueue.damageTier === tier.id ? ' selected' : '');
      btn.disabled = !battleActive || !available;
      const reqLabel = available ? '' : ` Â· requer Int ${tier.minInt}+${tier.minDet ? ', Det '+tier.minDet+'+' : ''}, Cajado Nv${tier.minWeaponLevel}+`;
      btn.innerHTML = `${tier.name}<span class="magic-cost">${available ? cost + ' MP' : ''}${reqLabel}</span>`;
      btn.onclick = () => { magicQueue.damageTier = magicQueue.damageTier === tier.id ? null : tier.id; renderMagicPanel(); };
      dmgDiv.appendChild(btn);
    });
  }

  // BotÃµes de cura
  const healDiv = document.getElementById('heal-magic-btns');
  if (healDiv) {
    healDiv.innerHTML = '';
    HEAL_TIERS.forEach(tier => {
      const available = healSpellAvailable(actor, tier);
      const btn = document.createElement('button');
      btn.className = 'btn-magic';
      btn.style.borderColor = 'var(--hp)';
      btn.style.color = 'var(--hp-light)';
      btn.disabled = !battleActive || !available || actor.mp < tier.cost;
      const reqLabel = available ? '' : ` Â· requer Int ${tier.minInt}+ e Cajado Nv${tier.minWeaponLevel}+`;
      btn.innerHTML = `${tier.name}<span class="magic-cost">${tier.cost} MP Â· d${tier.dice}${reqLabel}</span>`;
      btn.onclick = () => startTargeting('heal_spell_' + tier.id);
      healDiv.appendChild(btn);
    });
  }

  // Efeitos em inimigos â€” Veneno e Paralisia em tiers (gate por nÃ­vel de Cajado), Desmaio (Nv2+), debuffs de stat
  const effDiv = document.getElementById('effect-magic-btns');
  if (effDiv) {
    effDiv.innerHTML = '';
    const blockedBySynthesis = !!magicQueue.damageTier && synthesisLimit(actor) < 2;
    const wLevel = actor.weapon.level;
    const allEffects = [
      ...POISON_TIERS.filter(t => t.minWeaponLevel <= wLevel),
      ...PARALYZE_TIERS.filter(t => t.minWeaponLevel <= wLevel),
      ...(wLevel >= FAINT_EFFECT.minWeaponLevel ? [FAINT_EFFECT] : []),
      ...EFFECTS_ENEMY.filter(t => t.minWeaponLevel <= wLevel),
    ];
    allEffects.forEach(ef => {
      const btn = document.createElement('button');
      btn.className = 'btn-magic' + (magicQueue.effect?.id === ef.id ? ' selected' : '');
      btn.disabled = !battleActive || !(currentActor && currentActor.isPlayerControlled) || blockedBySynthesis;
      const blockLabel = blockedBySynthesis ? ' Â· requer Cajado Nv2+ p/ combinar com Dano' : '';
      const desc = ef.desc || (ef.id.startsWith('poison') ? `-${Math.round(ef.pct*100)}% HP/turno, ${ef.turns}t` :
                   ef.id.startsWith('paralyze') ? `${Math.round(ef.chance*100)}% perde turno, ${ef.turns}t` :
                   (typeof ef.attrMod === 'number' && typeof ef.diceMod === 'number') ? `${ef.attrMod} teste / -1d${ef.diceMod} combate` :
                   typeof ef.attrMod === 'number' ? `${ef.attrMod} no teste` :
                   typeof ef.diceMod === 'number' ? `-1d${ef.diceMod} no combate` : '');
      btn.innerHTML = `${ef.name}<span class="magic-cost">${ef.cost} MP Â· ${desc}${blockLabel}</span>`;
      btn.onclick = () => { magicQueue.effect = magicQueue.effect?.id === ef.id ? null : ef; renderMagicPanel(); };
      effDiv.appendChild(btn);
    });
  }

  // Suporte em aliados (exceto Reviver que tem botÃ£o prÃ³prio) â€” multi-seleÃ§Ã£o via SÃ­ntese passiva
  const supDiv = document.getElementById('support-magic-btns');
  if (supDiv) {
    supDiv.innerHTML = '';
    const limit = synthesisLimit(actor);
    const wLevel = actor.weapon.level;
    EFFECTS_ALLY.filter(ef => ef.id !== 'revive' && (!ef.minWeaponLevel || ef.minWeaponLevel <= wLevel)).forEach(ef => {
      const selected = magicQueue.supports.some(s => s.id === ef.id);
      const atLimit = magicQueue.supports.length >= limit && !selected;
      const btn = document.createElement('button');
      btn.className = 'btn-magic' + (selected ? ' selected' : '');
      btn.disabled = !battleActive || atLimit;
      const limitLabel = limit > 1 ? ` Â· atÃ© ${limit} combinados` : '';
      const desc = ef.desc ||
                   ((typeof ef.attrMod === 'number' && typeof ef.diceMod === 'number') ? `+${ef.attrMod} teste / +1d${ef.diceMod} combate` :
                   typeof ef.attrMod === 'number' ? `+${ef.attrMod} no teste` :
                   typeof ef.diceMod === 'number' ? `+1d${ef.diceMod} no combate` : '');
      btn.innerHTML = `${ef.name}<span class="magic-cost">${ef.cost} MP Â· ${desc}${limitLabel}</span>`;
      btn.onclick = () => {
        if (selected) {
          magicQueue.supports = magicQueue.supports.filter(s => s.id !== ef.id);
        } else if (magicQueue.supports.length < limit) {
          magicQueue.supports.push(ef);
        }
        renderMagicPanel();
      };
      supDiv.appendChild(btn);
    });
  }

  // Reviver â€” sÃ³ aparece se houver aliados derrotados
  const reviveDiv = document.getElementById('revive-magic-btn');
  if (reviveDiv) {
    reviveDiv.innerHTML = '';
    const deadAllies = combatants.filter(c => c.side === 'player' && !c.alive);
    if (deadAllies.length > 0) {
      const available = actor.attrs.int >= 3 && actor.attrs.det >= 5;
      const btn = document.createElement('button');
      btn.className = 'btn-magic' + (magicQueue.revive ? ' selected' : '');
      btn.style.gridColumn = 'span 3';
      btn.disabled = !battleActive || !available;
      const reqLabel = available ? '' : ' Â· requer Int 3+ e Det 5+';
      btn.innerHTML = `Reviver<span class="magic-cost">10 MP Â· 1d${actor.attrs.det||0} + IntÃ·2 HP${reqLabel}</span>`;
      btn.onclick = () => { magicQueue.revive = !magicQueue.revive; renderMagicPanel(); };
      reviveDiv.appendChild(btn);
    } else {
      reviveDiv.innerHTML = '<span style="color:var(--muted);font-size:.8rem;font-style:italic;">Nenhum aliado derrotado</span>';
    }
  }

  // Ãrea â€” 2 alvos exige Cajado Nv2+, Todos exige Cajado Nv3+
  const areaDiv = document.getElementById('area-magic-btns');
  if (areaDiv) {
    areaDiv.innerHTML = '';
    [
      { id: 'two', label: '2 alvos', cost: 1, minLevel: 2 },
      { id: 'all', label: 'Todos',   cost: 2, minLevel: 3 },
    ].forEach(opt => {
      const available = actor.weapon.level >= opt.minLevel;
      const btn = document.createElement('button');
      btn.className = 'btn-magic' + (magicQueue.area === opt.id ? ' selected' : '');
      btn.disabled = !battleActive || !available;
      const reqLabel = available ? '' : ` Â· requer Cajado Nv${opt.minLevel}+`;
      btn.innerHTML = `${opt.label}<span class="magic-cost">${opt.cost} MP${reqLabel}</span>`;
      btn.onclick = () => { magicQueue.area = magicQueue.area === opt.id ? null : opt.id; renderMagicPanel(); };
      areaDiv.appendChild(btn);
    });
  }

  // Fila atual
  const queueDiv = document.getElementById('magic-queue-display');
  if (queueDiv) {
    let parts = [];
    if (magicQueue.damageTier) {
      const tier = DAMAGE_TIERS.find(t => t.id === magicQueue.damageTier);
      if (tier) parts.push(`<span class="effect-badge effect-poison">${tier.name}</span>`);
    }
    if (magicQueue.area) parts.push(`<span class="effect-badge effect-paralyze">Ãrea: ${magicQueue.area === 'two' ? '2 alvos' : 'todos'}</span>`);
    if (magicQueue.effect) parts.push(`<span class="effect-badge ${magicQueue.effect.cls}">${magicQueue.effect.name}</span>`);
    magicQueue.supports.forEach(sup => parts.push(`<span class="effect-badge effect-regen">${sup.name}</span>`));
    if (magicQueue.revive) parts.push(`<span class="effect-badge effect-regen">Reviver (10 MP)</span>`);
    queueDiv.innerHTML = parts.length ? `Fila: ${parts.join(' + ')}` : '<span style="color:var(--muted);font-size:.85rem;">Nenhuma magia selecionada</span>';
  }

  const castBtn = document.getElementById('btn-cast');
  const isPlayerTurn = currentActor && currentActor.isPlayerControlled;
  const queueEmpty = !magicQueue.damageTier && !magicQueue.effect && magicQueue.supports.length === 0 && !magicQueue.area && !magicQueue.revive;
  if (castBtn) castBtn.disabled = !battleActive || !isPlayerTurn || queueEmpty;
}

// â”€â”€â”€ TURN ENGINE (3v3) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let turnOrder = [];
let turnIndex = 0;
let currentActor = null;
let pendingAction = null; // 'attack' | 'magic'
let areaTargetsPicked = []; // alvos escolhidos para Ã¡rea 'two'

function startRound() {
  if (!battleActive) return;
  globalRoundCount++;
  combatants.forEach(c => { c.paralyzedRoundRolled = false; c.paralyzedThisRound = false; });
  // ProgressÃ£o de doenÃ§a a cada 10 rodadas
  if (globalRoundCount % 10 === 0) {
    processDiseaseProgression();
    renderBattle();
    if (checkBattleEnd()) return;
  }
  turnOrder = combatants
    .filter(c => c.alive)
    .map(c => ({ c, init: c.attrs.agi + Math.random() * 2 }))
    .sort((a,b) => b.init - a.init)
    .map(x => x.c);
  turnIndex = 0;
  logDivider();
  logEntry(`â€” Nova rodada â€” Ordem: ${turnOrder.map(c=>c.name).join(' â†’ ')}`, 'log-info');
  processTurn();
}

function processTurn() {
  if (!battleActive) return;

  if (checkBattleEnd()) return;

  if (turnIndex >= turnOrder.length) {
    combatants.forEach(c => { if (c.alive) processEffects(c, c.name); });
    if (checkBattleEnd()) return;
    setTimeout(startRound, 600);
    return;
  }

  const actor = turnOrder[turnIndex];
  if (!actor.alive) { turnIndex++; processTurn(); return; }

  currentActor = actor;
  actor.actedWithMagic = false;
  processWeaponPassives(actor);

  if (rollParalysisRound(actor)) {
    logEntry(`âš¡ ${actor.name} estÃ¡ paralisado e perde o turno!`, 'log-info');
    actor.comboStage = 1;
    turnIndex++;
    renderBattle();
    setTimeout(processTurn, 500);
    return;
  }

  if (hasEffect(actor, 'faint')) {
    const heal = Math.max(1, Math.floor(actor.maxHP * 0.05));
    actor.hp = Math.min(actor.maxHP, actor.hp + heal);
    actor.effects = actor.effects.filter(e => e.id !== 'faint');
    logEntry(`ðŸ’¤ ${actor.name} estÃ¡ desmaiado, perde o turno e recupera ${heal} HP!`, 'log-info');
    actor.comboStage = 1;
    turnIndex++;
    renderBattle();
    setTimeout(processTurn, 500);
    return;
  }

  if (hasEffect(actor, 'stun')) {
    // Atordoado: sem magia (bloqueado em castMagic), 25% ataca aliado
    actor.effects = actor.effects.filter(e => e.id !== 'stun');
    logEntry(`âš¡ ${actor.name} estÃ¡ atordoado!`, 'log-info');
    // LÃ³gica de desvio de alvo aplicada na IA e no turno do jogador via flag
    actor.stunThisTurn = true;
  }

  if (actor.side === 'enemy') {
    setBattleButtons(false);
    renderBattle();
    setTimeout(() => { aiAct(actor); }, 700);
  } else {
    renderBattle();
    renderMagicPanel();
    renderSkillPanel();
    setBattleButtons(true);
  }
}

function endTurn() {
  if (currentActor) {
    currentActor.stunThisTurn = false;
    // Quebra o combo de MÃ£os Livres se a aÃ§Ã£o do turno nÃ£o foi continuar o combo
    if (currentActor.comboStage > 1 && !currentActor.comboActionTaken) {
      currentActor.comboStage = 1;
    }
    currentActor.comboActionTaken = false;
  }
  turnIndex++;
  currentActor = null;
  pendingAction = null;
  hideTargetSelector();
  clearMagicQueue();
  setTimeout(processTurn, 600);
}

function checkBattleEnd() {
  if (!battleActive) return true;
  if (aliveEnemySide().length === 0) { endBattle(true); return true; }
  if (alivePlayerSide().length === 0) { endBattle(false); return true; }
  return false;
}

function applyEffect(effect, target, targetEntity, turns) {
  if (!targetEntity.effects) targetEntity.effects = [];
  targetEntity.effects = targetEntity.effects.filter(e => e.id !== effect.id);
  targetEntity.effects.push({ ...effect, turnsLeft: turns });
  logEntry(`âœ¦ ${effect.name} aplicado por ${turns} turnos!`, 'log-info');
}

function applySupport(support, targetEntity, turns) {
  if (!targetEntity.buffs) targetEntity.buffs = [];
  targetEntity.buffs = targetEntity.buffs.filter(b => b.id !== support.id);
  targetEntity.buffs.push({ ...support, turnsLeft: turns });
  logEntry(`âœ¦ ${support.name} aplicado por ${turns} turnos!`, 'log-info');
}

// Aplica uma pilha de suportes (Regen/Detox/Blindagem/etc) num Ãºnico lance.
// Cada um exige seu prÃ³prio teste de InteligÃªncia. Usado pela SÃ­ntese passiva (Cajado Nv2/3).
function resolveSupportStack(actor, target, supports, turns) {
  supports.forEach(sup => {
    const supRoll = rollDice(actor.weapon.dice);
    const supHit  = supRoll !== actor.weapon.dice && supRoll <= actor.attrs.int;
    logEntry(`${actor.name} testa InteligÃªncia para ${sup.name}: rola ${supRoll} vs ${actor.attrs.int}`, 'log-sys');
    if (!supHit) { logEntry(`${sup.name} falhou${supRoll === actor.weapon.dice ? ' (falha auto)' : ''}! MP gastos.`, 'log-miss'); return; }
    if (sup.id === 'detox') { target.effects = target.effects.filter(e => !e.id.startsWith('poison') && !e.id.startsWith('paralyze') && e.id !== 'faint'); logEntry(`âœ¦ Detox em ${target.name}! (veneno, paralisia e desmaio removidos)`, 'log-victory'); }
    else if (sup.id === 'regen') applyEffect({ ...sup, id: 'regen' }, target, target, turns);
    else { applySupport(sup, target, turns); }
  });
}

function processEffects(entity, entityName) {
  // Efeitos
  if (entity.effects && entity.effects.length > 0) {
    entity.effects = entity.effects.filter(ef => {
      if (ef.id.startsWith('poison')) {
        const pct = ef.pct || 0.10;
        const dmg = Math.max(1, Math.floor(entity.maxHP * pct));
        entity.hp = Math.max(0, entity.hp - dmg);
        logEntry(`â˜  ${entityName} sofre ${dmg} de veneno. (${ef.turnsLeft-1} turnos restantes)`, 'log-dmg');
        if (entity.hp === 0 && entity.alive) { entity.alive = false; logEntry(`ðŸ’€ ${entityName} foi derrotado pelo veneno!`, entity.side === 'enemy' ? 'log-victory' : 'log-defeat'); }
      }
      if (ef.id === 'bleed') {
        const stack = ef.stack || 1;
        const pct = BLEED_STACK_PCT[Math.min(stack, 3) - 1];
        const dmg = Math.max(1, Math.floor(entity.maxHP * pct));
        entity.hp = Math.max(0, entity.hp - dmg);
        logEntry(`ðŸ©¸ ${entityName} sofre ${dmg} de sangramento (stack ${stack}). (${ef.turnsLeft-1} turnos restantes)`, 'log-dmg');
        if (entity.hp === 0 && entity.alive) { entity.alive = false; logEntry(`ðŸ’€ ${entityName} foi derrotado pelo sangramento!`, entity.side === 'enemy' ? 'log-victory' : 'log-defeat'); }
      }
      if (ef.id === 'regen') {
        const heal = Math.max(1, Math.floor(entity.maxHP * 0.1));
        entity.hp = Math.min(entity.maxHP, entity.hp + heal);
        logEntry(`âœ¦ ${entityName} regenera ${heal} HP. (${ef.turnsLeft-1} turnos restantes)`, 'log-victory');
      }
      // faint: lÃ³gica de turno perdido fica em processTurn(); aqui sÃ³ decrementa
      ef.turnsLeft--;
      return ef.turnsLeft > 0;
    });
  }
  // Buffs: decrementar turnsLeft e remover expirados
  if (entity.buffs && entity.buffs.length > 0) {
    entity.buffs = entity.buffs.filter(b => {
      b.turnsLeft--;
      if (b.turnsLeft <= 0) logEntry(`${entityName}: efeito ${b.name} expirou.`, 'log-sys');
      return b.turnsLeft > 0;
    });
  }
}

function hasEffect(entity, id) {
  return entity.effects?.some(e => e.id === id) || false;
}

function hasAnyParalyze(entity) {
  return entity.effects?.some(e => e.id.startsWith('paralyze')) || false;
}

// Rola UMA VEZ por rodada se a entidade estÃ¡ paralisada nesta rodada.
// Resultado Ã© cacheado atÃ© endRound() ser chamado.
function rollParalysisRound(entity) {
  if (!hasAnyParalyze(entity)) {
    entity.paralyzedThisRound = false;
    entity.paralyzedRoundRolled = false;
    return false;
  }
  if (!entity.paralyzedRoundRolled) {
    const ef = entity.effects.find(e => e.id.startsWith('paralyze'));
    const chance = ef?.chance || 0.40;
    entity.paralyzedThisRound = Math.random() < chance;
    entity.paralyzedRoundRolled = true;
    if (entity.paralyzedThisRound) {
      logEntry(`âš¡ ${entity.name} estÃ¡ paralisado nesta rodada! (${Math.round(chance*100)}%)`, 'log-info');
    }
  }
  return entity.paralyzedThisRound;
}

// endRound: processado pelo processTurn no 3v3, mantido como alias
function endRound() {
  combatants.forEach(c => {
    if (c.alive) processEffects(c, c.name);
    c.paralyzedRoundRolled = false;
    c.paralyzedThisRound = false;
  });
}

// Modificador aditivo para combate (atk/def equipamento, atk_attr/def_attr) â€” rola o dado
// Modificador de dado para cÃ¡lculo de dano â€” afeta tipos 'atk', 'atk_attr' (ImperÃ­cia, Preparo, Habilidade)
// e 'def' (NegligÃªncia). Tipo 'def_attr' (Fragilidade, Blindagem, Cautela, ImprudÃªncia) sÃ³ atua via getAttrTestMod.
function getEffectMod(entity, type) {
  if (type === 'def_attr') return 0;
  let mod = 0;
  if (entity.buffs) entity.buffs.forEach(b => {
    if (b.type === type && typeof b.diceMod === 'number') mod += rollDice(b.diceMod);
  });
  if (entity.effects) entity.effects.forEach(ef => {
    if (ef.type === type && typeof ef.diceMod === 'number') mod -= rollDice(ef.diceMod);
  });
  return mod;
}

// Modificador fixo para testes de atributo (rolagem de dado vs atributo).
// Cobre todos os tipos â€” incluindo 'def' e 'def_attr' que nÃ£o passam por getEffectMod.
function getAttrTestMod(entity, type) {
  let mod = 0;
  if (entity.buffs) entity.buffs.forEach(b => {
    if (b.type === type && typeof b.attrMod === 'number') mod += b.attrMod;
  });
  if (entity.effects) entity.effects.forEach(ef => {
    if (ef.type === type && typeof ef.attrMod === 'number') mod += ef.attrMod;
  });
  return mod;
}

// â”€â”€â”€ TROCA DE EQUIPAMENTO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openSwapPanel() {
  if (!currentActor) return;
  const actor = currentActor;
  const isAdventurer = actor.id === 'player';

  const swapPanel = document.getElementById('swap-panel');
  const wBtns = document.getElementById('swap-weapon-buttons');
  const aBtns = document.getElementById('swap-armor-buttons');
  wBtns.innerHTML = '';
  aBtns.innerHTML = '';

  // Armas disponÃ­veis
  const availableWeapons = isAdventurer
    ? WEAPONS
    : WEAPONS.filter(w => weaponFamily(w) === weaponFamily(actor.weapon) || w.unarmed);

  availableWeapons.forEach(w => {
    const current = actor.weapon.id === w.id;
    const btn = document.createElement('button');
    btn.className = 'btn ' + (current ? 'btn-gold' : 'btn-secondary');
    btn.style.fontSize = '0.8rem';
    btn.innerHTML = `${w.name}${current ? ' âœ¦' : ''}`;
    btn.disabled = current;
    btn.onclick = () => { swapWeapon(actor, w); closeSwapPanel(); };
    wBtns.appendChild(btn);
  });

  // Armaduras disponÃ­veis (todas para aventureiro, mesma para aliados)
  const availableArmors = isAdventurer
    ? ARMORS
    : [actor.armor]; // aliados mantÃªm armadura

  availableArmors.forEach(ar => {
    const current = actor.armor.id === ar.id;
    const btn = document.createElement('button');
    btn.className = 'btn ' + (current ? 'btn-gold' : 'btn-secondary');
    btn.style.fontSize = '0.8rem';
    btn.innerHTML = `${ar.name}${current ? ' âœ¦' : ''}`;
    btn.disabled = current;
    btn.onclick = () => { swapArmor(actor, ar); closeSwapPanel(); };
    aBtns.appendChild(btn);
  });

  swapPanel.style.display = '';
  document.getElementById('action-panel').style.display = 'none';
  document.getElementById('skill-panel').style.display = 'none';
  document.getElementById('inventory-panel').style.display = 'none';
}

function closeSwapPanel() {
  document.getElementById('swap-panel').style.display = 'none';
  document.getElementById('action-panel').style.display = '';
  renderSkillPanel();
}

function swapWeapon(actor, newWeapon) {
  if (actor.weapon.id === newWeapon.id) return;
  logDivider();
  logEntry(`${actor.name} troca ${actor.weapon.name} por ${newWeapon.name}. (turno consumido)`, 'log-info');
  actor.weapon = newWeapon;
  actor.shieldRegenCounter = 0; // reset contador do escudo
  clearMagicQueue();
  renderBattle(); renderSheet(); renderMagicPanel(); renderSkillPanel();
  endTurn();
}

function swapArmor(actor, newArmor) {
  if (actor.armor.id === newArmor.id) return;
  logDivider();
  logEntry(`${actor.name} troca ${actor.armor.name} por ${newArmor.name}. (turno consumido)`, 'log-info');
  actor.armor = newArmor;
  renderBattle(); renderSheet();
  endTurn();
}

// â”€â”€â”€ PAINEL DE HABILIDADES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderSkillPanel() {
  const panel = document.getElementById('skill-panel');
  const label = document.getElementById('skill-panel-weapon');
  if (!panel || !currentActor) return;
  const actor = currentActor;
  label.textContent = actor.weapon.name;
  panel.style.display = '';

  const isCajado  = isCajadoWeapon(actor.weapon);
  const isArco    = !!actor.weapon.arrowBased;

  // Cajado: mostra painel de magia, oculta placeholder e flechas
  const cajadoPanel = document.getElementById('cajado-magic-panel');
  const skillBtns   = document.getElementById('skill-buttons');
  const arrowPanel  = document.getElementById('arrow-panel');

  if (isCajado) {
    cajadoPanel.style.display = '';
    skillBtns.style.display   = 'none';
    arrowPanel.style.display  = 'none';
    renderMagicPanel();
    return;
  }

  cajadoPanel.style.display = 'none';
  skillBtns.style.display   = '';

  // Arco: mostra painel de flechas
  if (isArco) {
    arrowPanel.style.display = '';
    const arrowBtns = document.getElementById('arrow-buttons');
    arrowBtns.innerHTML = '';
    const inv = actor.inventory || {};
    ARROWS.forEach(ar => {
      const qty = inv[ar.id] || 0;
      const isPreferred = actor.preferredArrow === ar.id;
      const isActive = getActiveArrow(actor)?.id === ar.id;
      const btn = document.createElement('button');
      btn.className = 'btn ' + (isPreferred ? 'btn-gold' : 'btn-secondary');
      btn.style.fontSize = '0.8rem';
      btn.style.textAlign = 'left';
      btn.disabled = qty === 0;
      btn.innerHTML = `${isActive && !isPreferred ? 'â†’ ' : ''}${ar.name} <span style="color:var(--muted);">(${qty})</span><br><small style="font-style:italic;color:var(--muted);">${ar.desc}</small>`;
      btn.onclick = () => {
        actor.preferredArrow = isPreferred ? null : ar.id;
        renderSkillPanel();
        renderBattle();
      };
      arrowBtns.appendChild(btn);
    });
    if (ARROWS.every(ar => (inv[ar.id] || 0) === 0)) {
      arrowBtns.innerHTML = '<span style="color:var(--dmg);font-size:.85rem;">Sem flechas â€” usando MÃ£os Livres!</span>';
    }
  } else {
    arrowPanel.style.display = 'none';
  }

  // Habilidades especÃ­ficas por arma
  skillBtns.innerHTML = '';

  if (isDaggerWeapon(actor.weapon)) {
    const btn = document.createElement('button');
    btn.className = 'btn-magic';
    btn.disabled = actor.mp < 2;
    btn.innerHTML = `Apunhalar<span class="magic-cost">2 MP Â· +1 dano, 60% Sangramento</span>`;
    btn.onclick = () => startTargeting('skill_apunhalar');
    skillBtns.appendChild(btn);

  } else if (isShieldWeapon(actor.weapon)) {
    const protectedAlly = combatants.find(c => c.id === actor.protecting);
    const coberturaBtn = document.createElement('button');
    coberturaBtn.className = 'btn-magic';
    coberturaBtn.style.borderColor = 'var(--gold-dim)';
    coberturaBtn.style.color = 'var(--gold)';
    coberturaBtn.innerHTML = protectedAlly
      ? `Cobertura<span class="magic-cost">Protegendo ${protectedAlly.name} â€” trocar/remover</span>`
      : `Cobertura<span class="magic-cost">GrÃ¡tis Â· Proteger um aliado (50% do dano)</span>`;
    coberturaBtn.onclick = () => startTargeting('skill_cobertura');
    skillBtns.appendChild(coberturaBtn);

    const defensivaBtn = document.createElement('button');
    defensivaBtn.className = 'btn-magic';
    defensivaBtn.disabled = actor.mp < 5;
    defensivaBtn.innerHTML = `Defensiva<span class="magic-cost">5 MP Â· -1 PotÃªncia, +1 ProteÃ§Ã£o (5 turnos)</span>`;
    defensivaBtn.onclick = () => resolveDefensiva(actor);
    skillBtns.appendChild(defensivaBtn);

  } else if (isSwordWeapon(actor.weapon)) {
    const btn = document.createElement('button');
    btn.className = 'btn-magic';
    btn.disabled = actor.mp < 5;
    btn.innerHTML = `Bravura<span class="magic-cost">5 MP Â· Acerto garantido neste turno</span>`;
    btn.onclick = () => startTargeting('skill_bravura');
    skillBtns.appendChild(btn);

  } else if (actor.weapon.unarmed) {
    const stage = actor.comboStage || 1;
    const comboData = [
      { stage: 2, action: 'skill_combo_2', label: '2 Hit Combo', bonus: 5,  cost: 1 },
      { stage: 3, action: 'skill_combo_3', label: '3 Hit Combo', bonus: 7,  cost: 1 },
      { stage: 4, action: 'skill_combo_4', label: '4 Hit Combo', bonus: 10, cost: 1 },
      { stage: 5, action: 'skill_combo_5', label: '5 Hit Combo', bonus: 20, cost: 0 },
    ];
    comboData.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'btn-magic';
      const available = stage === c.stage - 1;
      btn.disabled = !available || actor.mp < c.cost;
      btn.innerHTML = `${c.label}${available ? ' âœ¦' : ''}<span class="magic-cost">${c.cost > 0 ? c.cost + ' MP Â· ' : 'GrÃ¡tis Â· '}+${c.bonus}% atordoamento</span>`;
      btn.onclick = () => startTargeting(c.action);
      skillBtns.appendChild(btn);
    });
    const comboInfo = document.createElement('div');
    comboInfo.style.cssText = 'font-size:.75rem;color:var(--muted);margin-top:6px;font-style:italic;';
    comboInfo.textContent = stage > 1 ? `Combo em andamento â€” prÃ³ximo golpe: estÃ¡gio ${stage}` : 'Acerte para avanÃ§ar o combo; errar ou agir diferente quebra a sequÃªncia.';
    skillBtns.appendChild(comboInfo);

  } else {
    skillBtns.innerHTML = '<span style="color:var(--muted);font-size:0.85rem;font-style:italic;">Nenhuma habilidade disponÃ­vel ainda.</span>';
  }
}

// â”€â”€â”€ HABILIDADES POR ARMA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Adaga â€” Apunhalar: +1 dano e 60% de causar Sangramento. Custa 2 MP.
// Chance de Sangramento em Apunhalar, por nÃ­vel de Adaga
const APUNHALAR_BLEED_CHANCE = { adaga: 0.40, adaga_curva: 0.50, adaga_sombria: 0.60 };

function resolveApunhalar(actor, target) {
  const cost = 2;
  if (cost > actor.mp) {
    logEntry(`MP insuficiente para Apunhalar! NecessÃ¡rio: ${cost}.`, 'log-miss');
    return;
  }
  actor.mp -= cost;
  logDivider();
  logEntry(`${actor.name} usa Apunhalar em ${target.name}! (Custo: ${cost} MP)`, 'log-info');
  actor.skillDmgBonus = 1;
  resolveAttack(actor, target);
  actor.skillDmgBonus = 0;
  // Sangramento sÃ³ Ã© causado se o ataque realmente causou dano (acertou)
  if (target.alive && actor.lastAttackHit) {
    const bleedChance = APUNHALAR_BLEED_CHANCE[actor.weapon.id] || 0.40;
    if (Math.random() < bleedChance) applyBleed(target);
    else logEntry(`${target.name} nÃ£o sangrou desta vez.`, 'log-miss');
  }
  renderBattle(); renderSheet();
  if (checkBattleEnd()) return;
  endTurn();
}

// Espada e Escudo â€” Cobertura: protege um aliado, dividindo 50% do dano. Sem custo.
function setCobertura(actor, target) {
  logDivider();
  if (actor.protecting === target.id) {
    actor.protecting = null;
    logEntry(`${actor.name} para de proteger ${target.name}.`, 'log-info');
  } else {
    actor.protecting = target.id;
    logEntry(`ðŸ›¡ ${actor.name} agora protege ${target.name}! (divide 50% do dano recebido)`, 'log-info');
  }
  renderBattle(); renderSheet();
  endTurn();
}

// Espada e Escudo â€” Defensiva: converte 1 PotÃªncia em 1 ProteÃ§Ã£o por 5 turnos. Custa 5 MP.
function resolveDefensiva(actor) {
  const cost = 5;
  if (cost > actor.mp) {
    logEntry(`MP insuficiente para Defensiva! NecessÃ¡rio: ${cost}.`, 'log-miss');
    return;
  }
  actor.mp -= cost;
  logDivider();
  logEntry(`${actor.name} adota postura defensiva! (-1 PotÃªncia, +1 ProteÃ§Ã£o por 5 turnos, Custo: ${cost} MP)`, 'log-info');
  actor.buffs = (actor.buffs || []).filter(b => b.id !== 'defensiva');
  actor.buffs.push({ id: 'defensiva', name: 'Defensiva', turnsLeft: 5 });
  renderBattle(); renderSheet(); renderSkillPanel();
  endTurn();
}

// Espada â€” Bravura: garante sucesso no teste de ataque (resolve frenÃ©tico a favor). Custa 5 MP.
function resolveBravura(actor, target) {
  const cost = 5;
  if (cost > actor.mp) {
    logEntry(`MP insuficiente para Bravura! NecessÃ¡rio: ${cost}.`, 'log-miss');
    return;
  }
  actor.mp -= cost;
  logDivider();
  logEntry(`${actor.name} ataca com Bravura! (acerto garantido, Custo: ${cost} MP)`, 'log-info');
  actor.guaranteedHit = true;
  resolveAttack(actor, target);
  actor.guaranteedHit = false;
  renderBattle(); renderSheet();
  if (checkBattleEnd()) return;
  endTurn();
}

// MÃ£os Livres â€” Combo: cada estÃ¡gio Ã‰ o ataque daquele turno.
// Acertar avanÃ§a o combo; errar ou fazer outra coisa quebra a sequÃªncia.
const COMBO_STAGES = {
  skill_combo_2: { next: 2, bonus: 5,  cost: 1, label: '2 Hit Combo' },
  skill_combo_3: { next: 3, bonus: 7,  cost: 1, label: '3 Hit Combo' },
  skill_combo_4: { next: 4, bonus: 10, cost: 1, label: '4 Hit Combo' },
  skill_combo_5: { next: 0, bonus: 20, cost: 0, label: '5 Hit Combo' },
};

function resolveComboAttack(actor, target, action) {
  const stageKey = action.replace('skill_', '');
  const stageNum = parseInt(stageKey.split('_')[1], 10);
  const stage = COMBO_STAGES[action];
  if (!stage) return;

  if (stage.cost > actor.mp) {
    logEntry(`MP insuficiente para ${stage.label}! NecessÃ¡rio: ${stage.cost}.`, 'log-miss');
    return;
  }
  if (actor.comboStage !== stageNum - 1) {
    logEntry(`SequÃªncia de combo invÃ¡lida â€” comece do inÃ­cio.`, 'log-miss');
    return;
  }

  actor.mp -= stage.cost;
  logDivider();
  logEntry(`${actor.name} usa ${stage.label}! (+${stage.bonus}% atordoamento neste golpe${stage.cost>0?`, Custo: ${stage.cost} MP`:''})`, 'log-info');

  actor.comboBonus = stage.bonus;
  actor.lastAttackHit = false; // resolveAttack seta isso
  actor.comboActionTaken = true;
  resolveAttack(actor, target);
  actor.comboBonus = 0;

  if (actor.lastAttackHit) {
    if (stage.next > 0) {
      actor.comboStage = stage.next;
      logEntry(`âœ¦ ${actor.name} desbloqueou o prÃ³ximo golpe do combo!`, 'log-victory');
    } else {
      actor.comboStage = 1; // combo completo, reinicia
      logEntry(`âœ¦ ${actor.name} completou o combo!`, 'log-victory');
    }
  } else {
    actor.comboStage = 1;
    logEntry(`${actor.name} errou â€” o combo se quebra.`, 'log-miss');
  }

  renderBattle(); renderSheet(); renderSkillPanel();
  if (checkBattleEnd()) return;
  endTurn();
}

// Processed at start of turn: anything other than continuing the combo breaks it.
// Called from processTurn before the actor acts.
function checkComboBreak(actor) {
  if (!actor.comboStage || actor.comboStage <= 1) return;
  // Se o ator nÃ£o atacou via combo no turno anterior, a flag comboPending Ã© resetada em endTurn.
  // Esta funÃ§Ã£o apenas garante que o estado Ã© consistente; a quebra real ocorre
  // quando qualquer outra aÃ§Ã£o (ataque normal, magia, item, troca, esperar) Ã© tomada.
}

// Passivas de arma â€” executadas no inÃ­cio do turno do portador
function processWeaponPassives(actor) {
  if (!actor.alive) return;

  // Cajado: recupera 1 MP por turno
  if (isCajadoWeapon(actor.weapon) && actor.mp < actor.maxMP) {
    actor.mp = Math.min(actor.maxMP, actor.mp + 1);
    logEntry(`âœ¦ ${actor.name} recupera 1 MP pelo cajado. (${actor.mp}/${actor.maxMP})`, 'log-sys');
  }

  // Espada e Escudo: regenera 1 HP a cada 2 turnos, teto 50% HP mÃ¡ximo
  if (isShieldWeapon(actor.weapon)) {
    if (!actor.shieldRegenCounter) actor.shieldRegenCounter = 0;
    actor.shieldRegenCounter++;
    if (actor.shieldRegenCounter >= 2) {
      actor.shieldRegenCounter = 0;
      const cap = Math.floor(actor.maxHP * 0.5);
      if (actor.hp < cap) {
        actor.hp = Math.min(cap, actor.hp + 1);
        logEntry(`ðŸ›¡ ${actor.name} recupera 1 HP pelo escudo. (${actor.hp}/${actor.maxHP})`, 'log-sys');
      }
    }
  }
}

// Atordoamento de MÃ£os Livres â€” chamado apÃ³s causar dano
function rollStun(attacker, defender) {
  if (!attacker.weapon.unarmed) return;
  const comboBonus = (attacker.comboBonus || 0) / 100;
  const chance = (attacker.attrs.for + attacker.attrs.res) * 0.5 / 100 + comboBonus;
  if (Math.random() < chance) {
    if (!defender.effects) defender.effects = [];
    defender.effects = defender.effects.filter(e => e.id !== 'stun');
    defender.effects.push({ id: 'stun', turnsLeft: 1 });
    logEntry(`âš¡ ${defender.name} estÃ¡ Atordoado! (sem magia, 25% ataca aliado)`, 'log-info');
  }
}

// Aplica/empilha Sangramento â€” acumula atÃ© 3 stacks, cada aplicaÃ§Ã£o reseta duraÃ§Ã£o para 3 turnos
function applyBleed(target) {
  if (!target.effects) target.effects = [];
  const existing = target.effects.find(e => e.id === 'bleed');
  if (existing) {
    existing.stack = Math.min(3, (existing.stack || 1) + 1);
    existing.turnsLeft = 3;
    logEntry(`ðŸ©¸ ${target.name} sangra mais intensamente! (stack ${existing.stack}/3, ${Math.round(BLEED_STACK_PCT[existing.stack-1]*100)}% HP/turno)`, 'log-dmg');
  } else {
    target.effects.push({ id: 'bleed', turnsLeft: 3, stack: 1 });
    logEntry(`ðŸ©¸ ${target.name} estÃ¡ Sangrando! (10% HP/turno por 3 turnos)`, 'log-dmg');
  }
}

// Variante usada pela Flecha Lacerante: nunca empilha. Se jÃ¡ sangrando, sÃ³ renova a duraÃ§Ã£o.
// Se nÃ£o estava sangrando, aplica stack 1.
function applyBleedNoStack(target) {
  if (!target.effects) target.effects = [];
  const existing = target.effects.find(e => e.id === 'bleed');
  if (existing) {
    existing.turnsLeft = 3;
    logEntry(`ðŸ©¸ ${target.name} continua Sangrando! (stack ${existing.stack || 1}/3, duraÃ§Ã£o renovada)`, 'log-dmg');
  } else {
    target.effects.push({ id: 'bleed', turnsLeft: 3, stack: 1 });
    logEntry(`ðŸ©¸ ${target.name} estÃ¡ Sangrando! (10% HP/turno por 3 turnos)`, 'log-dmg');
  }
}

// Efeito de flecha especial â€” chamado quando ataque acerta
function rollArrowEffect(attacker, defender, arrow) {
  if (!arrow.effect) return;
  // Sangramento de flecha tem 40% de chance de sequer tentar (antes do teste de resistÃªncia)
  if (arrow.effect === 'bleed' && Math.random() >= 0.40) {
    logEntry(`ðŸ¹ A flecha nÃ£o corta fundo o suficiente para causar Sangramento.`, 'log-miss');
    return;
  }
  // Testa resistÃªncia do defensor (ResistÃªncia contra efeito de flecha)
  const w = attacker.weapon;
  const resVal = defender.attrs.res;
  const resRoll = rollDice(w.dice);
  let effectDef = null;
  if (arrow.effect === 'poison') effectDef = POISON_TIERS[0];
  else if (arrow.effect === 'paralyze') effectDef = PARALYZE_TIERS[0];
  const effectName = arrow.effect === 'bleed' ? 'Sangramento' : (effectDef?.name || arrow.effect);
  logEntry(`ðŸ¹ ${defender.name} testa ResistÃªncia contra ${effectName}: rola ${resRoll} vs ${resVal}`, 'log-sys');
  if (resRoll !== w.dice && resRoll <= resVal) {
    logEntry(`${defender.name} resistiu ao ${effectName}!`, 'log-miss');
    return;
  }
  if (arrow.effect === 'bleed') {
    applyBleedNoStack(defender);
  } else if (effectDef) {
    applyEffect(effectDef, defender, defender, effectDef.turns || 3);
  }
}

// IA dos inimigos
function aiAct(actor) {
  logDivider();
  const targets = alivePlayerSide();
  if (targets.length === 0) { endBattle(true); return; }

  // Cultista usa magia se tiver cajado, int >= 1 e MP suficiente
  const isCaster = isCajadoWeapon(actor.weapon) && actor.attrs.int >= 1 && actor.mp >= 2;

  // Atordoado: 25% chance de atacar aliado em vez de inimigo
  if (actor.stunThisTurn) {
    actor.stunThisTurn = false;
    if (Math.random() < 0.25) {
      const friendlies = (actor.side === 'enemy' ? aliveEnemySide() : alivePlayerSide()).filter(c => c.id !== actor.id);
      if (friendlies.length > 0) {
        const wrongTarget = friendlies[Math.floor(Math.random() * friendlies.length)];
        logEntry(`${actor.name} estÃ¡ confuso e ataca ${wrongTarget.name} (aliado)!`, 'log-info');
        resolveAttack(actor, wrongTarget);
        renderBattle(); renderSheet();
        if (checkBattleEnd()) return;
        endTurn(); return;
      }
    }
  }

  const useMagic = isCaster && actor.mp >= 2;

  if (useMagic) {
    const roll = Math.random();
    const target = targets[Math.floor(Math.random() * targets.length)];
    const wLevel = actor.weapon.level;
    // Usa o maior tier de Veneno/Paralisia disponÃ­vel ao nÃ­vel do cajado e ao MP do ator
    const poisonTier = [...POISON_TIERS].reverse().find(t => t.minWeaponLevel <= wLevel && actor.mp >= t.cost);
    const paralyzeTier = [...PARALYZE_TIERS].reverse().find(t => t.minWeaponLevel <= wLevel && actor.mp >= t.cost);

    if (roll < 0.35 && damageSpellAvailable(actor, DAMAGE_TIERS[0]) && actor.mp >= damageSpellCost(actor, DAMAGE_TIERS[0])) {
      resolveDamageSpell(actor, target, 'dano');
      return;
    } else if (roll < 0.65 && poisonTier) {
      logEntry(`${actor.name} conjura ${poisonTier.name} em ${target.name}!`, 'log-info');
      actor.mp -= poisonTier.cost;
      applyMagicEffect(actor, target, poisonTier, poisonTier.turns);
    } else if (roll < 0.90 && paralyzeTier) {
      logEntry(`${actor.name} conjura ${paralyzeTier.name} em ${target.name}!`, 'log-info');
      actor.mp -= paralyzeTier.cost;
      applyMagicEffect(actor, target, paralyzeTier, paralyzeTier.turns);
    } else if (wLevel >= FAINT_EFFECT.minWeaponLevel && actor.mp >= FAINT_EFFECT.cost) {
      logEntry(`${actor.name} conjura Desmaio em ${target.name}!`, 'log-info');
      actor.mp -= FAINT_EFFECT.cost;
      applyMagicEffect(actor, target, FAINT_EFFECT, 3);
    } else if (poisonTier) {
      logEntry(`${actor.name} conjura ${poisonTier.name} em ${target.name}!`, 'log-info');
      actor.mp -= poisonTier.cost;
      applyMagicEffect(actor, target, poisonTier, poisonTier.turns);
    } else {
      const physTarget = targets[Math.floor(Math.random() * targets.length)];
      resolveAttack(actor, physTarget);
    }
  } else {
    // Ataque fÃ­sico â€” caster sem MP ou combatente nÃ£o-mÃ¡gico
    if (isCaster && actor.mp < 2) logEntry(`${actor.name} estÃ¡ sem MP â€” ataca fisicamente!`, 'log-sys');
    const target = targets[Math.floor(Math.random() * targets.length)];
    resolveAttack(actor, target);
  }

  renderBattle(); renderSheet();
  if (checkBattleEnd()) return;
  endTurn();
}

function defendAction() {
  if (!currentActor) return;
  const actor = currentActor;
  setBattleButtons(false);
  logDivider();
  logEntry(`${actor.name} aguarda o prÃ³ximo movimento.`, 'log-info');
  actor.defending = true;
  setTimeout(() => { actor.defending = false; endTurn(); }, 400);
}

function castMagic() {
  if (!currentActor) return;

  // Paralisado nÃ£o pode usar magia
  if (hasAnyParalyze(currentActor) && currentActor.paralyzedThisRound) {
    logEntry(`${currentActor.name} estÃ¡ paralisado e nÃ£o pode conjurar magias!`, 'log-miss');
    return;
  }
  // Atordoado nÃ£o pode usar magia
  if (currentActor.stunThisTurn) {
    logEntry(`${currentActor.name} estÃ¡ atordoado e nÃ£o pode conjurar magias!`, 'log-miss');
    return;
  }

  // Reviver Ã© completamente independente â€” pede alvo entre aliados derrotados
  if (magicQueue.revive) {
    if (magicQueue.area) {
      logEntry('Reviver nÃ£o pode ser usado com Ã¡rea. Limpe a fila e tente novamente.', 'log-miss');
      return;
    }
    if (currentActor.attrs.int < 3 || currentActor.attrs.det < 5) {
      logEntry(`${currentActor.name} nÃ£o atende aos requisitos para Reviver (Int 3+, Det 5+).`, 'log-miss');
      return;
    }
    startTargeting('magic_revive');
    return;
  }

  const hasOffense = !!magicQueue.damageTier || !!magicQueue.effect;
  const hasSupport = magicQueue.supports.length > 0;
  const hasArea    = magicQueue.area; // null | 'two' | 'all'

  // ValidaÃ§Ã£o de nÃ­vel do Cajado para Ã¡rea (2 alvos = Nv2+, Todos = Nv3+)
  if (hasArea === 'two' && currentActor.weapon.level < 2) {
    logEntry(`${currentActor.name} precisa de Cajado NÃ­vel 2+ para atingir 2 alvos.`, 'log-miss');
    return;
  }
  if (hasArea === 'all' && currentActor.weapon.level < 3) {
    logEntry(`${currentActor.name} precisa de Cajado NÃ­vel 3+ para atingir todos os alvos.`, 'log-miss');
    return;
  }

  if (!hasOffense && !hasSupport) {
    logEntry('Nenhuma magia selecionada.', 'log-miss');
    return;
  }

  // Dano nunca usa Ã¡rea â€” exige alvo Ãºnico
  if (magicQueue.damageTier && hasArea) {
    logEntry('Magia de Dano nÃ£o pode ser usada em Ã¡rea. Limpe a fila e tente novamente.', 'log-miss');
    return;
  }

  // Suporte sem dano
  if (hasSupport && !hasOffense) {
    if (hasArea === 'two') { startTargeting('magic_area_two'); return; }
    if (hasArea) { castMagicArea(currentActor, 'support'); return; }
    startTargeting('magic_support');
    return;
  }

  // Ofensivo (efeito sozinho pode ir em Ã¡rea; dano sempre alvo Ãºnico)
  if (hasArea === 'two') { startTargeting('magic_area_two'); return; }
  if (hasArea) { castMagicArea(currentActor, 'offense'); return; }
  startTargeting('magic_offensive');
}

// â”€â”€â”€ MAGIA DE DANO (3 tiers) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Testa InteligÃªncia (com modificadores por tier). Conta como magia â€” sem contraataque.
const DAMAGE_TIERS = [
  { id: 'dano',         name: 'Dano',          atkMod: 0, defMod: 0, dmgBonus: 0, minInt: 3,  minDet: 2, minWeaponLevel: 1, extraCost: 0 },
  { id: 'dano_preciso', name: 'Dano Preciso',  atkMod: 1, defMod: -1, dmgBonus: 0, minInt: 7,  minDet: 0, minWeaponLevel: 2, extraCost: 3 },
  { id: 'dano_maior',   name: 'Dano Maior',    atkMod: 2, defMod: -2, dmgBonus: 3, minInt: 15, minDet: 0, minWeaponLevel: 3, extraCost: 5 },
];

function damageSpellAvailable(actor, tier) {
  return actor.attrs.int >= tier.minInt && actor.attrs.det >= tier.minDet &&
         isCajadoWeapon(actor.weapon) && actor.weapon.level >= tier.minWeaponLevel;
}

function damageSpellCost(actor, tier) {
  const attrBonus = Math.floor(0.4 * (actor.attrs.int + actor.attrs.det));
  return attrBonus + tier.extraCost;
}

function resolveDamageSpell(actor, target, tierId) {
  resolveDamageSpellWithEffect(actor, target, tierId, null, 3);
}

// NÃºcleo da Magia de Dano, com suporte a sintetizar um Efeito junto (passiva de Cajado Nv2/3).
// Quando synthEffect Ã© fornecido, o custo combinado jÃ¡ deve ter sido validado pelo chamador.
function resolveDamageSpellWithEffect(actor, target, tierId, synthEffect, turns) {
  const tier = DAMAGE_TIERS.find(t => t.id === tierId);
  if (!tier) return;
  if (!damageSpellAvailable(actor, tier)) {
    logEntry(`${actor.name} nÃ£o atende aos requisitos para ${tier.name}.`, 'log-miss');
    renderBattle(); renderMagicPanel();
    return;
  }
  const synthAllowed = synthesisLimit(actor) >= 2;
  if (synthEffect && !synthAllowed) {
    logEntry(`${actor.name} nÃ£o pode sintetizar Efeito com ${tier.name} â€” exige Cajado Nv2+.`, 'log-miss');
    synthEffect = null;
  }

  const dmgCost = damageSpellCost(actor, tier);
  const totalCost = dmgCost + (synthEffect ? synthEffect.cost : 0);
  if (totalCost > actor.mp) {
    logEntry(`MP insuficiente para ${tier.name}${synthEffect ? ' + ' + synthEffect.name : ''}! NecessÃ¡rio: ${totalCost}.`, 'log-miss');
    renderBattle(); renderMagicPanel();
    return;
  }

  const w = actor.weapon;
  actor.mp -= totalCost;
  actor.actedWithMagic = true;
  markTested(actor, 'int');
  markTested(actor, 'det');
  markTested(target, 'det');
  logDivider();

  const atkAttr = Math.max(1, actor.attrs.int + tier.atkMod);
  const defAttr = Math.max(1, target.attrs.det + tier.defMod);
  const castRoll = rollDice(w.dice);
  const castHit = castRoll !== w.dice && castRoll <= atkAttr;
  logEntry(`${actor.name} lanÃ§a ${tier.name}${synthEffect ? ' + ' + synthEffect.name : ''} em ${target.name}! (Custo: ${totalCost} MP) â€” InteligÃªncia rola ${castRoll} vs ${atkAttr}`, 'log-info');
  if (!castHit) {
    logEntry(`Magia falhou${castRoll === w.dice ? ' (falha auto)' : ''}!`, 'log-miss');
    renderBattle(); renderSheet(); renderMagicPanel();
    if (checkBattleEnd()) return;
    endTurn();
    return;
  }

  const diceDmg = rollDice(w.dmgDiceSides);
  const attrBonus = Math.floor(0.4 * (actor.attrs.int + actor.attrs.det));
  const barreiraRoll = rollArmorDefense(target.armor, 'barreira');
  const dmg = Math.max(0, diceDmg + attrBonus + tier.dmgBonus + atkBonus(actor) - barreiraRoll.value - defBonus(target));
  logEntry(`MalÃ­cia: d${w.dmgDiceSides} â†’ ${diceDmg} + 40% (Int+Det) â†’ ${attrBonus}${tier.dmgBonus ? ` + ${tier.dmgBonus} bÃ´nus` : ''} | Barreira: d${target.armor.barreiraDice||0} â†’ ${barreiraRoll.value}`, 'log-sys');
  if (dmg <= 0) logEntry(`Barreira absorveu! Dano: 0.`, 'log-miss');
  else { applyDamage(target, dmg); logEntry(`Dano mÃ¡gico em ${target.name}: ${dmg}!`, 'log-dmg'); }

  if (synthEffect && target.alive) {
    applyMagicEffect(actor, target, synthEffect, turns || 3);
  }

  renderBattle(); renderSheet(); renderMagicPanel();
  if (checkBattleEnd()) return;
  endTurn();
}

function applyMagicEffect(actor, target, ef, turns) {
  const w = actor.weapon;
  markTested(actor, 'int');
  markTested(target, ef.defAttr);
  // Veneno/Paralisia: resMod fixo por tier. Desmaio: reduÃ§Ã£o dinÃ¢mica = floor((Int+Det do mago)/5).
  let mod = ef.resMod || 0;
  if (ef.id === 'faint') mod = -Math.floor((actor.attrs.int + actor.attrs.det) / 5);
  const adjAttr = Math.max(1, target.attrs[ef.defAttr] + mod);
  const effRoll = rollDice(w.dice);
  logEntry(`${target.name} resiste (${ef.name}) â€” rola ${effRoll} vs ${ATTRS.find(a=>a.id===ef.defAttr).name} ${adjAttr}${mod ? ` (${mod})` : ''}`, 'log-sys');
  if (effRoll <= adjAttr && effRoll !== w.dice) logEntry(`${target.name} resistiu!`, 'log-miss');
  else applyEffect(ef, target, target, turns);
}

// â”€â”€â”€ CURA MÃGICA (3 tiers) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Sem teste â€” confiÃ¡vel por design. Disponibilidade gate por InteligÃªncia + nÃ­vel de Cajado.
const HEAL_TIERS = [
  { id: 'cura',          name: 'Cura',           dice: 10,  cost: 3,  minInt: 3,  minWeaponLevel: 1 },
  { id: 'cura_aprim',    name: 'Cura Aprimorada',dice: 50,  cost: 10, minInt: 7,  minWeaponLevel: 2 },
  { id: 'cura_avanc',    name: 'Cura AvanÃ§ada',  dice: 110, cost: 15, minInt: 15, minWeaponLevel: 3 },
];

function healSpellAvailable(actor, tier) {
  return actor.attrs.int >= tier.minInt && isCajadoWeapon(actor.weapon) && actor.weapon.level >= tier.minWeaponLevel;
}

function resolveHealSpell(actor, target, tierId) {
  const tier = HEAL_TIERS.find(t => t.id === tierId);
  if (!tier) return;
  if (!healSpellAvailable(actor, tier)) {
    logEntry(`${actor.name} nÃ£o atende aos requisitos para ${tier.name}.`, 'log-miss');
    return;
  }
  if (tier.cost > actor.mp) {
    logEntry(`MP insuficiente para ${tier.name}! NecessÃ¡rio: ${tier.cost}.`, 'log-miss');
    return;
  }
  actor.mp -= tier.cost;
  actor.actedWithMagic = true;
  markTested(actor, 'int');
  logDivider();
  const heal = rollDice(tier.dice);
  const before = target.hp;
  target.hp = Math.min(target.maxHP, target.hp + heal);
  const actual = target.hp - before;
  logEntry(`âœ¦ ${actor.name} lanÃ§a ${tier.name} em ${target.name}! (Custo: ${tier.cost} MP, d${tier.dice} â†’ ${heal}) Cura ${actual} HP.`, 'log-victory');
  renderBattle(); renderSheet(); renderMagicPanel();
  if (checkBattleEnd()) return;
  endTurn();
}

function getAreaTargets() {
  const isHeal = magicQueue.supports.length > 0; // Ã¡rea sÃ³ se aplica a Efeito (inimigos) ou Suporte (aliados)
  const pool = isHeal ? alivePlayerSide() : aliveEnemySide();
  if (magicQueue.area === 'all') return pool;
  if (magicQueue.area === 'two') return pool.slice(0, 2);
  return [];
}

function castMagicArea(actor, type, targets = null) {
  const cost = mpCostQueue(actor);
  if (cost > actor.mp) {
    logEntry(`MP insuficiente! NecessÃ¡rio: ${cost}, disponÃ­vel: ${actor.mp}.`, 'log-miss');
    clearMagicQueue(); renderBattle(); renderMagicPanel();
    return;
  }

  actor.mp -= cost;
  logDivider();

  if (!targets || targets.length === 0) targets = getAreaTargets();
  if (targets.length === 0) {
    logEntry('Nenhum alvo disponÃ­vel para magia em Ã¡rea.', 'log-miss');
    clearMagicQueue(); renderBattle(); renderMagicPanel();
    return;
  }

  const turns = 3;
  logEntry(`${actor.name} lanÃ§a magia em Ã¡rea! (${targets.map(t => t.name).join(', ')}) â€” Custo: ${cost} MP`, 'log-info');

  if (type === 'support') {
    targets.forEach(t => resolveSupportStack(actor, t, magicQueue.supports, turns));
  } else if (type === 'offense') {
    // Efeito em Ã¡rea (sem Magia de Dano â€” Dano nÃ£o suporta Ã¡rea)
    if (magicQueue.effect) {
      const effTurns = magicQueue.effect.turns || turns;
      targets.forEach(t => applyMagicEffect(actor, t, magicQueue.effect, effTurns));
    }
  }

  clearMagicQueue();
  renderBattle(); renderSheet(); renderMagicPanel();
  if (checkBattleEnd()) return;
  if (actor) { actor.actedWithMagic = true; markTested(actor, 'int'); }
  endTurn();
}

function castMagicResolved(actor, target) {
  const cost = mpCostQueue(actor);
  if (cost > actor.mp) {
    logEntry(`MP insuficiente! NecessÃ¡rio: ${cost}, disponÃ­vel: ${actor.mp}.`, 'log-miss');
    clearMagicQueue(); renderBattle(); renderMagicPanel();
    return;
  }

  const hasAtk = !!magicQueue.damageTier;
  const hasEff = !!magicQueue.effect;
  const hasSup = magicQueue.supports.length > 0;
  const turns = 3;

  // Dano (+ Efeito sintetizado, se Cajado Nv2/3) â€” delega para resolveDamageSpell,
  // que jÃ¡ gerencia seu prÃ³prio custo de MP e teste de InteligÃªncia.
  if (hasAtk) {
    const tierId = magicQueue.damageTier;
    const effectToSynth = hasEff ? magicQueue.effect : null;
    const effTurns = effectToSynth ? (effectToSynth.turns || turns) : turns;
    clearMagicQueue();
    resolveDamageSpellWithEffect(actor, target, tierId, effectToSynth, effTurns);
    return;
  }

  // Sem dano: cobra custo normalmente (Efeito isolado e/ou Suportes combinados)
  actor.mp -= cost;
  logDivider();
  logEntry(`${actor.name} lanÃ§a magia em ${target.name}! (Custo: ${cost} MP)`, 'log-info');

  if (hasEff) {
    applyMagicEffect(actor, target, magicQueue.effect, magicQueue.effect.turns || turns);
  }

  if (hasSup) {
    resolveSupportStack(actor, target, magicQueue.supports, turns);
  }

  clearMagicQueue();
  renderBattle(); renderSheet(); renderMagicPanel();
  if (checkBattleEnd()) return;
  if (actor) { actor.actedWithMagic = true; markTested(actor, 'int'); }
  endTurn();
}

// playerAttack e enemyTurn obsoletos no 3v3 â€” substituÃ­dos por resolveAttack e aiAct
// mantidos como stubs para nÃ£o quebrar referÃªncias antigas
function playerAttack() { /* substituÃ­do por resolveTargetedAction */ }
function enemyTurn(free) { /* substituÃ­do por aiAct */ }
function enemyTurnDefended() { /* substituÃ­do por defendAction */ }

function endPlayerTurn() { endTurn(); } // alias para compatibilidade

function totalAttrPoints(entity) {
  return Object.values(entity.attrs).reduce((a,b) => a+b, 0);
}

function endBattle(playerWon) {
  battleActive = false;
  setBattleButtons(false);
  const end = document.getElementById('battle-end');
  const msg = document.getElementById('battle-end-msg');
  end.style.display = '';

  // Times do lado do jogador que participaram da batalha (vivos ou nÃ£o)
  const playerSideAll = combatants.filter(c => c.side === 'player');
  const enemySideAll  = combatants.filter(c => c.side === 'enemy');

  if (playerWon) {
    logEntry(`âœ¦ VitÃ³ria! Todos os oponentes foram derrotados! âœ¦`, 'log-victory');
    msg.className = 'log-victory';
    msg.textContent = 'VitÃ³ria â€” os oponentes caÃ­ram!';
  } else {
    logEntry(`âœ¦ Derrota. Seu grupo foi abatido. âœ¦`, 'log-defeat');
    msg.className = 'log-defeat';
    msg.textContent = 'Derrota â€” seu grupo foi abatido.';
    player.hp = Math.floor(player.maxHP * 0.3);
  }

  // Para cada combatente do lado do jogador: XP baseado na arma + atributos testados.
  // Dobra se algum inimigo na batalha tiver mais pontos totais na ficha.
  playerSideAll.forEach(entity => {
    const strongerFoePresent = enemySideAll.some(foe => totalAttrPoints(foe) > totalAttrPoints(entity));
    grantBattleEndXP(entity, strongerFoePresent);
    logEntry(`${entity.name} ganhou experiÃªncia${strongerFoePresent ? ' (em dobro â€” oponente mais forte!)' : ''}.`, 'log-info');
  });

  renderSheet();
  renderTestButtons();
}

function restartBattle() {
  // recria inimigos sorteados e restaura HP/MP de todos
  const newEnemyTemplates = pickRandomEnemies(3);
  const e1 = makeCombatant(newEnemyTemplates[0], 'enemy', 'enemy1', false);
  const e2 = makeCombatant(newEnemyTemplates[1], 'enemy', 'enemy2', false);
  const e3 = makeCombatant(newEnemyTemplates[2], 'enemy', 'enemy3', false);

  // restaura lado do jogador
  combatants.filter(c => c.side === 'player').forEach(c => {
    c.hp = c.disease ? getEffectiveMaxHP(c) : c.maxHP;
    c.mp = c.maxMP;
    c.alive = true; c.effects = []; c.buffs = [];
    c.paralyzedRoundRolled = false; c.paralyzedThisRound = false;
    c.testedAttrs = new Set();
  });

  combatants = [...combatants.filter(c => c.side === 'player'), e1, e2, e3];
  renderSheet();
  initBattle();
}

// â”€â”€â”€ DOENÃ‡A â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DISEASE_STAGES = ['light', 'medium', 'severe'];
const DISEASE_HP_REDUCTION = { light: 0.10, medium: 0.25, severe: 0.50 };
const DISEASE_LABELS = { light: 'DoenÃ§a Leve', medium: 'DoenÃ§a MÃ©dia', severe: 'DoenÃ§a Grave' };

function getEffectiveMaxHP(entity) {
  if (!entity.disease) return entity.maxHP;
  const reduction = DISEASE_HP_REDUCTION[entity.disease.stage];
  return Math.max(1, Math.floor(entity.maxHP * (1 - reduction)));
}

// Aplica doenÃ§a a uma entidade (chamado externamente, ex: aventura)
function applyDisease(entity, stage = 'light') {
  entity.disease = { stage, roundsSick: 0 };
  logEntry(`â˜£ ${entity.name} contraiu ${DISEASE_LABELS[stage]}!`, 'log-info');
  // Ajusta HP para nÃ£o ultrapassar o novo mÃ¡ximo efetivo
  const effMax = getEffectiveMaxHP(entity);
  if (entity.hp > effMax) entity.hp = effMax;
}

// Processa progressÃ£o de doenÃ§a â€” chamado a cada 10 rodadas (rodada global)
let globalRoundCount = 0;
function processDiseaseProgression() {
  combatants.filter(c => c.alive && c.disease).forEach(entity => {
    entity.disease.roundsSick++;

    // A cada 10 rodadas: teste de ResistÃªncia para progredir
    if (entity.disease.roundsSick % 10 === 0) {
      const resVal = entity.attrs.res;
      const resRoll = rollDice(20);
      const resisted = resRoll <= resVal && resRoll !== 20;
      logEntry(`â˜£ ${entity.name}: teste de progressÃ£o da doenÃ§a â€” rola ${resRoll} vs ResistÃªncia ${resVal}`, 'log-sys');
      if (!resisted) {
        const idx = DISEASE_STAGES.indexOf(entity.disease.stage);
        if (idx < DISEASE_STAGES.length - 1) {
          entity.disease.stage = DISEASE_STAGES[idx + 1];
          logEntry(`â˜£ A doenÃ§a de ${entity.name} progrediu para ${DISEASE_LABELS[entity.disease.stage]}!`, 'log-dmg');
          const effMax = getEffectiveMaxHP(entity);
          if (entity.hp > effMax) { entity.hp = effMax; }
        }
        // DoenÃ§a Grave: apÃ³s 10 rodadas causa Envenenamento automÃ¡tico
        if (entity.disease.stage === 'severe') {
          logEntry(`â˜£ DoenÃ§a Grave: ${entity.name} Ã© automaticamente envenenado!`, 'log-dmg');
          applyEffect(POISON_TIERS[0], entity, entity, POISON_TIERS[0].turns);
        }
      } else {
        logEntry(`${entity.name} resistiu Ã  progressÃ£o da doenÃ§a!`, 'log-info');
      }

      // ContÃ¡gio: aliados testam ResistÃªncia a cada 10 rodadas
      const allies = combatants.filter(c => c.alive && c.id !== entity.id && c.side === entity.side && !c.disease);
      allies.forEach(ally => {
        const aRoll = rollDice(20);
        const aRes  = ally.attrs.res;
        const infected = aRoll > aRes || aRoll === 20;
        logEntry(`â˜£ ${ally.name}: teste de contÃ¡gio â€” rola ${aRoll} vs ResistÃªncia ${aRes}`, 'log-sys');
        if (infected) {
          applyDisease(ally, 'light');
        } else {
          logEntry(`${ally.name} nÃ£o foi infectado.`, 'log-sys');
        }
      });
    }
  });
}

// â”€â”€â”€ ARCO / FLECHAS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getActiveArrow(actor) {
  if (!actor.weapon.arrowBased) return null;
  const inv = actor.inventory || {};

  // Se tem preferÃªncia manual e ainda tem estoque, usa ela
  if (actor.preferredArrow && (inv[actor.preferredArrow] || 0) > 0) {
    return ARROWS.find(a => a.id === actor.preferredArrow) || null;
  }

  // LÃ³gica padrÃ£o: ordem de prioridade
  for (const id of ARROW_DEFAULT_ORDER) {
    if ((inv[id] || 0) > 0) return ARROWS.find(a => a.id === id) || null;
  }
  return null; // sem flechas â€” usa MÃ£os Livres
}

function getActiveArrowName(actor) {
  const arrow = getActiveArrow(actor);
  return arrow ? arrow.name : 'MÃ£os Livres';
}

// calcRawDmg com suporte a Arco (flecha define dmgStat)
function calcRawDmgWithArrow(attacker, defender, arrowOverride) {
  const w = attacker.weapon;

  if (w.unarmed) {
    const base = Math.floor((attacker.attrs.for + attacker.attrs.res) / 2);
    const diceSides = (attacker.attrs.for >= 10 && attacker.attrs.res >= 10) ? 6 : 4;
    return base + rollDice(diceSides);
  }

  if (w.arrowBased) {
    const arrow = arrowOverride || getActiveArrow(attacker);
    if (!arrow) {
      // sem flecha â†’ MÃ£os Livres
      const base = Math.floor((attacker.attrs.for + attacker.attrs.res) / 2);
      const diceSides = (attacker.attrs.for >= 10 && attacker.attrs.res >= 10) ? 6 : 4;
      return base + rollDice(diceSides);
    }
    const dmgStat = arrow.dmgStat;
    const defStat = DMG_VS_DEF[dmgStat];
    const atkBase = rollDice(w.dmgDiceSides) + (w.dmgBonus || 0);
    const defRoll = rollArmorDefense(defender.armor, defStat);
    let defBase = defRoll.value;
    if (defRoll.isMax && defender.armor.armorPassive === 'plate') {
      defBase += 1;
      logEntry(`ðŸ›¡ ${defender.name}: defesa mÃ¡xima na ${defender.armor.name}! (+1)`, 'log-sys');
    }
    if (defRoll.isMax && defender.armor.armorPassive === 'leather' && !attacker.actedWithMagic) {
      applyDamage(attacker, 1);
      logEntry(`ðŸ—¡ ${defender.name}: defesa mÃ¡xima na ${defender.armor.name}! ${attacker.name} sofre 1 de dano de retaliaÃ§Ã£o!`, 'log-dmg');
    }
    const atkMod  = getEffectMod(attacker, 'atk');
    const defMod  = getEffectMod(defender, 'def');
    const atkFinal = atkBase + atkMod;
    const defFinal = defBase + defMod;
    return atkFinal + atkBonus(attacker) - defFinal - defBonus(defender);
  }

  return calcRawDmg(attacker, defender);
}

// â”€â”€â”€ INVENTÃRIO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let pendingItemUse = null; // { actor, item }

function openInventoryPanel() {
  if (!currentActor) return;
  const actor = currentActor;
  document.getElementById('inventory-actor-name').textContent = actor.name;
  document.getElementById('inventory-target-selector').style.display = 'none';
  renderInventoryItems(actor);
  document.getElementById('inventory-panel').style.display = '';
  document.getElementById('action-panel').style.display = 'none';
  document.getElementById('skill-panel').style.display = 'none';
}

function closeInventoryPanel() {
  document.getElementById('inventory-panel').style.display = 'none';
  document.getElementById('action-panel').style.display = '';
  renderSkillPanel();
}

function renderInventoryItems(actor) {
  const inv = actor.inventory || {};
  const container = document.getElementById('inventory-items');
  container.innerHTML = '';

  const allItems = [...ITEMS_CONSUMABLE];
  let hasAny = false;

  allItems.forEach(item => {
    const qty = inv[item.id] || 0;
    if (qty === 0) return;
    hasAny = true;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;';
    row.innerHTML = `
      <div style="flex:1;">
        <div style="font-size:.9rem;">${item.name} <span style="color:var(--muted);font-size:.8rem;">(${qty})</span></div>
        <div style="font-size:.75rem;color:var(--muted);font-style:italic;">${item.desc}</div>
      </div>
      <button class="btn btn-secondary" style="font-size:.8rem;padding:6px 12px;" onclick="selectItemUse('${item.id}')">Usar</button>
    `;
    container.appendChild(row);
  });

  if (!hasAny) {
    container.innerHTML = '<span style="color:var(--muted);font-size:.85rem;font-style:italic;">InventÃ¡rio vazio.</span>';
  }
}

function selectItemUse(itemId) {
  const actor = currentActor;
  const item = getItemDef(itemId);
  if (!item) return;
  pendingItemUse = { actor, item };

  // Itens que precisam de alvo
  if (item.type === 'heal_hp' || item.type === 'heal_mp') {
    // Pode usar em si mesmo ou aliados vivos
    showInventoryTargetSelector(alivePlayerSide(), resolveItemUse);
  } else if (item.type === 'cure') {
    showInventoryTargetSelector(alivePlayerSide(), resolveItemUse);
  } else if (item.type === 'revive') {
    const dead = combatants.filter(c => c.side === 'player' && !c.alive);
    if (dead.length === 0) {
      logEntry('NÃ£o hÃ¡ aliados derrotados para reviver!', 'log-miss');
      return;
    }
    showInventoryTargetSelector(dead, resolveItemUse);
  }
}

function showInventoryTargetSelector(targets, callback) {
  const sel = document.getElementById('inventory-target-selector');
  const btns = document.getElementById('inventory-target-buttons');
  btns.innerHTML = '';
  targets.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.style.cssText = 'text-align:left;font-size:.85rem;';
    const effMax = getEffectiveMaxHP(t);
    btn.innerHTML = `${t.name} <span style="color:var(--muted);">(HP ${t.hp}/${effMax})</span>`;
    btn.onclick = () => callback(t);
    btns.appendChild(btn);
  });
  sel.style.display = '';
}

function cancelInventoryTarget() {
  document.getElementById('inventory-target-selector').style.display = 'none';
  pendingItemUse = null;
}

function resolveItemUse(target) {
  if (!pendingItemUse) return;
  const { actor, item } = pendingItemUse;
  pendingItemUse = null;
  document.getElementById('inventory-target-selector').style.display = 'none';

  const inv = actor.inventory;
  if (!inv || (inv[item.id] || 0) === 0) {
    logEntry(`Sem ${item.name} no inventÃ¡rio!`, 'log-miss');
    closeInventoryPanel();
    return;
  }
  inv[item.id]--;

  logDivider();

  if (item.type === 'heal_hp') {
    const heal = rollDice(item.dice);
    const effMax = getEffectiveMaxHP(target);
    const before = target.hp;
    target.hp = Math.min(effMax, target.hp + heal);
    const actual = target.hp - before;
    logEntry(`ðŸ§ª ${actor.name} usa ${item.name} em ${target.name}: cura ${actual} HP! (d${item.dice} â†’ ${heal})`, 'log-victory');
  } else if (item.type === 'heal_mp') {
    const heal = rollDice(item.dice);
    const before = target.mp;
    target.mp = Math.min(target.maxMP, target.mp + heal);
    const actual = target.mp - before;
    logEntry(`ðŸ”µ ${actor.name} usa ${item.name} em ${target.name}: recupera ${actual} MP! (d${item.dice} â†’ ${heal})`, 'log-info');
  } else if (item.type === 'cure') {
    const removed = [];
    let diseaseRemoved = false;

    item.removes.forEach(effectId => {
      // DoenÃ§a: tratada separadamente para nÃ£o iterar 3 vezes
      if (effectId.startsWith('disease_')) {
        if (!diseaseRemoved && target.disease) {
          diseaseRemoved = true;
          removed.push(DISEASE_LABELS[target.disease.stage] || 'DoenÃ§a');
          target.disease = null;
          // Restaura HP ao mÃ¡ximo efetivo (sem reduÃ§Ã£o de doenÃ§a)
          if (target.hp > target.maxHP) target.hp = target.maxHP;
        }
        return;
      }
      // Efeitos normais (bleed, poison_*, paralyze*...) â€” poison/paralyze casam por prefixo (tiers)
      const matches = e => {
        if (effectId === 'poison') return e.id.startsWith('poison');
        if (effectId === 'paralyze') return e.id.startsWith('paralyze');
        return e.id === effectId;
      };
      const had = target.effects?.some(matches);
      if (had) {
        const removedEffect = target.effects.find(matches);
        target.effects = target.effects.filter(e => !matches(e));
        const label = removedEffect.name || (effectId === 'bleed' ? 'Sangramento' : effectId);
        removed.push(label);
      }
    });

    if (removed.length > 0) {
      logEntry(`ðŸ’Š ${actor.name} usa ${item.name} em ${target.name}: remove ${removed.join(', ')}!`, 'log-victory');
    } else {
      logEntry(`${actor.name} usa ${item.name} em ${target.name}: nenhum efeito a remover.`, 'log-sys');
    }
  } else if (item.type === 'revive') {
    target.alive = true;
    target.hp = 1;
    target.effects = [];
    target.buffs = [];
    target.paralyzedRoundRolled = false;
    target.paralyzedThisRound = false;
    logEntry(`â˜• ${actor.name} usa ${item.name}: ${target.name} voltou ao combate com 1 HP!`, 'log-victory');
  }

  closeInventoryPanel();
  renderBattle();
  renderSheet();
  renderMagicPanel();
  if (checkBattleEnd()) return;
  endTurn();
}

// â”€â”€â”€ HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function rollD20() { return Math.floor(Math.random() * 20) + 1; }

function successChance(val) {
  if (val === 0) return 0.10;
  if (val <= 5)  return 0.50;
  return Math.min(0.99, 0.50 + (val - 5) * 0.0333);
}

function successCheck(val) {
  return Math.random() < successChance(val);
}

function giveXP(attrId, amount) {
  player.xp[attrId] += amount;
  const needed = xpNeeded(player.attrs[attrId]);
  if (player.xp[attrId] >= needed) {
    player.xp[attrId] -= needed;
    if (player.attrs[attrId] < 20) {
      player.attrs[attrId] += 1;
      player.maxHP = calcHP(player.attrs.res, player.attrs.for);
      player.maxMP = calcMP(player.attrs.det, player.attrs.int);
      if (player.hp > player.maxHP) player.hp = player.maxHP;
      if (player.mp > player.maxMP) player.mp = player.maxMP;
      const name = ATTRS.find(a=>a.id===attrId)?.name;
      logEntry(`âœ¦ ${name} aumentou para ${player.attrs[attrId]}! (prÃ³ximo nÃ­vel: ${xpNeeded(player.attrs[attrId])} XP)`, 'log-victory');
    }
  }
}

// VersÃ£o genÃ©rica de giveXP â€” funciona para qualquer combatente (jogador ou aliado)
function giveXPTo(entity, attrId, amount) {
  if (!entity.xp) entity.xp = { for:0, dex:0, int:0, agi:0, res:0, det:0 };
  entity.xp[attrId] += amount;
  const needed = xpNeeded(entity.attrs[attrId]);
  if (entity.xp[attrId] >= needed) {
    entity.xp[attrId] -= needed;
    if (entity.attrs[attrId] < 20) {
      entity.attrs[attrId] += 1;
      entity.maxHP = calcHP(entity.attrs.res, entity.attrs.for);
      entity.maxMP = calcMP(entity.attrs.det, entity.attrs.int);
      if (entity.hp > entity.maxHP) entity.hp = entity.maxHP;
      if (entity.mp > entity.maxMP) entity.mp = entity.maxMP;
      const name = ATTRS.find(a=>a.id===attrId)?.name;
      logEntry(`âœ¦ ${entity.name}: ${name} aumentou para ${entity.attrs[attrId]}!`, 'log-victory');
    }
  }
}

// Atributo(s) "da arma" para fins de XP â€” atkAttr sempre, +int se for cajado
function weaponXPAttrs(entity) {
  const attrs = new Set([entity.weapon.atkAttr]);
  if (isCajadoWeapon(entity.weapon)) attrs.add('int');
  return attrs;
}

// Concede XP de fim de batalha a um combatente: +2 (ou +4) nos attrs da arma,
// +1 (ou +2) nos attrs testados durante a batalha
function grantBattleEndXP(entity, strongerFoePresent) {
  const weaponAttrs = weaponXPAttrs(entity);
  const weaponBonus = strongerFoePresent ? 4 : 2;
  const testedBonus = strongerFoePresent ? 2 : 1;

  weaponAttrs.forEach(attrId => giveXPTo(entity, attrId, weaponBonus));

  (entity.testedAttrs || new Set()).forEach(attrId => {
    if (weaponAttrs.has(attrId)) return; // jÃ¡ recebeu o bÃ´nus de arma, evita duplicar
    giveXPTo(entity, attrId, testedBonus);
  });
}

function logEntry(text, cls = '') {
  const box = document.getElementById('battle-log');
  const p = document.createElement('div');
  p.className = `log-entry ${cls}`;
  p.textContent = text;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}

function logDivider() {
  const box = document.getElementById('battle-log');
  const d = document.createElement('div');
  d.className = 'log-divider';
  box.appendChild(d);
}

function clearLog() {
  document.getElementById('battle-log').innerHTML = '';
}

function setBattleButtons(enabled) {
  document.querySelectorAll('.btn-attack').forEach(b => b.disabled = !enabled);
  const def = document.getElementById('btn-defend');
  if (def) def.disabled = !enabled;
  const swp = document.getElementById('btn-swap');
  if (swp) swp.disabled = !enabled;
  const cast = document.getElementById('btn-cast');
  if (cast) cast.disabled = !enabled;
  const inv = document.getElementById('btn-inventory');
  if (inv) inv.disabled = !enabled;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// â”€â”€â”€ INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ─── EXPOSIÇÃO PARA onclick INLINE ───────────────────────────────────────
function _exposeGlobals() {
  window.changeAttr        = changeAttr
  window.toggleAlly        = toggleAlly
  window.confirmCreation   = confirmCreation
  window.showTab           = showTab
  window.cancelTargeting   = cancelTargeting
  window.defendAction      = defendAction
  window.openSwapPanel     = openSwapPanel
  window.openInventoryPanel = openInventoryPanel
  window.clearMagicQueue   = clearMagicQueue
  window.castMagic         = castMagic
  window.cancelInventoryTarget = cancelInventoryTarget
  window.closeInventoryPanel = closeInventoryPanel
  window.closeSwapPanel    = closeSwapPanel
  window.restartBattle     = restartBattle
  window.selectItemUse     = selectItemUse
  window.showScreen        = showScreen
}

function _cleanupGlobals() {
  const fns = [
    'changeAttr','toggleAlly','confirmCreation','showTab',
    'cancelTargeting','defendAction','openSwapPanel',
    'openInventoryPanel','clearMagicQueue','castMagic',
    'cancelInventoryTarget','closeInventoryPanel',
    'closeSwapPanel','restartBattle','selectItemUse','showScreen',
  ]
  fns.forEach(fn => { delete window[fn] })
}

function _getHTML() {
  return (
`<!-- SCREEN: CREATION -->
<div id="screen-creation" class="screen active">
  <div class="container">
    <div class="header-bar">
      <div class="ornament">✦ ✦ ✦</div>
      <h1>Criação — Sistema 3v3</h1>
      <p class="subtitle">Distribua seus pontos e defina quem você é</p>
    </div>

    <div class="points-display">
      <div class="points-num" id="pts-left">8</div>
      <div class="points-label">pontos restantes — máximo 3 por atributo</div>
    </div>

    <div class="card">
      <div class="card-title">Atributos Básicos</div>

      <div id="attr-builder"></div>
    </div>

    <div class="card">
      <div class="card-title">Arma</div>
      <div id="weapon-selector" style="display:flex; gap:8px; flex-wrap:wrap;"></div>
    </div>

    <div class="card">
      <div class="card-title">Armadura</div>
      <div id="armor-selector" style="display:flex; gap:8px; flex-wrap:wrap;"></div>
    </div>

    <div class="card">
      <div class="card-title">Resumo</div>
      <div class="row" style="justify-content:space-between; flex-wrap:wrap; gap:8px;">
        <span>HP: <span class="text-gold bold" id="preview-hp">—</span></span>
        <span>MP: <span class="text-gold bold" id="preview-mp">—</span></span>
        <span>Classe sugerida: <span class="text-gold bold" id="preview-class">—</span></span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Escolha 2 Aliados</div>
      <div id="ally-selector" style="display:flex; flex-direction:column; gap:8px;"></div>
    </div>

    <div class="row flex-end mt-8">
      <button class="btn btn-primary" id="btn-confirm" onclick="confirmCreation()">Confirmar e Iniciar</button>
    </div>
  </div>
</div>

<!-- SCREEN: MAIN -->
<div id="screen-main" class="screen">
  <div class="container">
    <div class="header-bar">
      <div class="ornament">✦ ✦ ✦</div>
      <h1>Batalha 3v3</h1>
      <p class="subtitle">Escolha sua próxima ação</p>
    </div>

    <div class="nav-tabs">
      <button class="nav-tab active" onclick="showTab('tab-sheet')">Ficha</button>
      <button class="nav-tab" onclick="showTab('tab-tests')">Testes</button>
      <button class="nav-tab" onclick="showTab('tab-battle')">Batalha</button>
    </div>

    <!-- TAB: SHEET -->
    <div id="tab-sheet">
      <div class="card">
        <div class="card-title">Atributos</div>
        <div class="sheet-grid" id="sheet-attrs"></div>
      </div>
      <div class="card">
        <div class="card-title">HP / MP</div>
        <div class="stat-bars" id="sheet-bars"></div>
      </div>
    </div>

    <!-- TAB: TESTS -->
    <div id="tab-tests" style="display:none">
      <div class="card">
        <div class="card-title">Teste de Atributo</div>
        <p class="text-muted" style="margin-bottom:14px;">Clique em um atributo para testá-lo. Sucesso e falha dependem do valor do atributo.</p>
        <div class="test-grid" id="test-buttons"></div>
        <div id="test-result" style="display:none" class="roll-result mt-12"></div>
      </div>
    </div>

    <!-- TAB: BATTLE -->
    <div id="tab-battle" style="display:none">
      <div class="card text-center" id="turn-indicator" style="padding:10px; margin-bottom:10px;">
        <span style="font-family:'Cinzel',serif; color:var(--gold);">Aguardando início...</span>
      </div>

      <div class="combatants-list" id="combatants-display"></div>

      <div class="card" id="action-panel" style="padding:12px 14px;">
        <div class="card-title" style="margin-bottom:10px;">Ações — <span id="action-actor-name" style="color:var(--gold);font-size:0.85rem;"></span></div>

        <div id="target-selector" style="display:none; margin-bottom:10px;">
          <div style="font-size:0.8rem; color:var(--muted); margin-bottom:6px;" id="target-selector-label">Escolha o alvo:</div>
          <div id="target-buttons" style="display:flex; flex-direction:column; gap:6px;"></div>
          <button class="btn btn-secondary" style="margin-top:8px; font-size:0.8rem;" onclick="cancelTargeting()">Cancelar</button>
        </div>

        <div class="attack-grid" id="attack-buttons"></div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:8px;">
          <button class="btn btn-secondary" id="btn-defend" onclick="defendAction()" style="font-size:0.8rem;">Esperar</button>
          <button class="btn btn-secondary" id="btn-swap" onclick="openSwapPanel()" style="font-size:0.8rem;">Trocar</button>
          <button class="btn btn-secondary" id="btn-inventory" onclick="openInventoryPanel()" style="font-size:0.8rem; border-color:var(--gold-dim); color:var(--gold);">Inventário</button>
        </div>
      </div>

      <!-- PAINEL DE HABILIDADES POR ARMA -->
      <div id="skill-panel" class="card" style="padding:12px 14px; display:none;">
        <div class="card-title" style="margin-bottom:8px;">Habilidades — <span id="skill-panel-weapon" style="color:var(--gold);font-size:0.85rem;"></span></div>

        <!-- Flechas (só aparece para Arco) -->
        <div id="arrow-panel" style="display:none;">
          <div style="font-size:0.8rem; color:var(--muted); margin-bottom:6px;">Flecha preferida:</div>
          <div id="arrow-buttons" style="display:flex; flex-direction:column; gap:6px; margin-bottom:8px;"></div>
        </div>

        <!-- Magia do Cajado (só aparece para Cajado) -->
        <div id="cajado-magic-panel" style="display:none;">
          <div class="mp-counter" id="mp-display">MP: — / —</div>

          <div style="margin-bottom:6px; font-size:0.8rem; color:var(--muted);">Área de efeito</div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;" id="area-magic-btns"></div>

          <div style="margin-bottom:6px; font-size:0.8rem; color:var(--muted);">Dano adicional</div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;" id="dmg-magic-btns"></div>

          <div style="margin-bottom:6px; font-size:0.8rem; color:var(--muted);">Cura (aliados)</div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;" id="heal-magic-btns"></div>

          <div style="margin-bottom:6px; font-size:0.8rem; color:var(--muted);">Efeitos (inimigo)</div>
          <div class="magic-grid" id="effect-magic-btns"></div>

          <div style="margin-bottom:6px; font-size:0.8rem; color:var(--muted);">Suporte (você)</div>
          <div class="magic-grid" id="support-magic-btns"></div>

          <div style="margin-bottom:6px; font-size:0.8rem; color:var(--muted);">Reviver</div>
          <div id="revive-magic-btn" style="margin-bottom:10px;"></div>

          <div id="magic-queue-display" style="min-height:24px; margin-bottom:8px;"></div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
            <button class="btn btn-secondary" id="btn-clear-magic" onclick="clearMagicQueue()" style="font-size:0.8rem;">Limpar</button>
            <button class="btn" id="btn-cast" onclick="castMagic()" style="font-size:0.85rem; background:#0d1a2e; border:1px solid var(--mp); color:var(--mp-light);">✦ Lançar Magia ✦</button>
          </div>
        </div>

        <!-- Placeholder para outras armas -->
        <div id="skill-buttons">
          <span style="color:var(--muted);font-size:0.85rem;font-style:italic;">Nenhuma habilidade disponível ainda.</span>
        </div>
      </div>

      <!-- INVENTÁRIO -->
      <div id="inventory-panel" class="card" style="padding:12px 14px; display:none;">
        <div class="card-title" style="margin-bottom:8px;">🎒 Inventário — <span id="inventory-actor-name" style="color:var(--gold);font-size:0.85rem;"></span></div>
        <div id="inventory-target-selector" style="display:none; margin-bottom:10px;">
          <div style="font-size:0.8rem; color:var(--muted); margin-bottom:6px;">Usar em quem?</div>
          <div id="inventory-target-buttons" style="display:flex; flex-direction:column; gap:6px;"></div>
          <button class="btn btn-secondary" style="margin-top:8px; font-size:0.8rem;" onclick="cancelInventoryTarget()">Cancelar</button>
        </div>
        <div id="inventory-items" style="display:flex; flex-direction:column; gap:6px;"></div>
        <button class="btn btn-secondary" onclick="closeInventoryPanel()" style="font-size:0.8rem; margin-top:10px;">Fechar</button>
      </div>

      <!-- TROCA DE ARMA / ARMADURA -->
      <div id="swap-panel" class="card" style="padding:12px 14px; display:none;">
        <div class="card-title" style="margin-bottom:8px;">Trocar Equipamento <span style="color:var(--muted);font-size:0.75rem;">(consome o turno)</span></div>
        <div style="font-size:0.8rem; color:var(--muted); margin-bottom:6px;">Arma:</div>
        <div id="swap-weapon-buttons" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;"></div>
        <div style="font-size:0.8rem; color:var(--muted); margin-bottom:6px;">Armadura:</div>
        <div id="swap-armor-buttons" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;"></div>
        <button class="btn btn-secondary" onclick="closeSwapPanel()" style="font-size:0.8rem;">Cancelar</button>
      </div>

      <div class="log-box" id="battle-log"></div>

      <div id="battle-end" style="display:none" class="card text-center">
        <div id="battle-end-msg" style="font-family:'Cinzel',serif; font-size:1.2rem; margin-bottom:12px;"></div>
        <button class="btn btn-gold" onclick="restartBattle()">Nova Batalha</button>
      </div>
    </div>
  </div>
</div>
`
)
}

// ─── API PÚBLICA PARA SRGRM.JSX ──────────────────────────────────────────

export function setupGame(rootEl) {
  rootEl.innerHTML = _getHTML()
  _exposeGlobals()
  renderCreation()
}

export function teardownGame(rootEl) {
  battleActive = false
  combatants = []
  turnOrder = []
  pendingAction = null
  _cleanupGlobals()
  rootEl.innerHTML = ''
}
