// ─── SRGRM GAME ENGINE v3.4.1 ─────────────────────────────────────────────────
// Game logic for Sistema RPG 3v3 (formerly Morto Engine)
// All game state is module-scoped; setupGame() attaches to DOM + window

const ATTRS = [
  { id: 'for', name: 'Fortitude',    type: 'Ativo',   hint: 'Ataques pesados' },
  { id: 'dex', name: 'Destreza',     type: 'Ativo',   hint: 'Ataques precisos' },
  { id: 'int', name: 'Inteligência', type: 'Ativo',   hint: 'Magias e tática' },
  { id: 'agi', name: 'Agilidade',    type: 'Passivo', hint: 'Defende vs Destreza' },
  { id: 'res', name: 'Resistência',  type: 'Passivo', hint: 'Defende vs Fortitude' },
  { id: 'det', name: 'Determinação', type: 'Passivo', hint: 'Defende vs Inteligência' },
]

const WEAPONS = [
  { id: 'espada',          name: 'Espada Longa',            level: 1, dice: 6,  atkAttr: 'for', dmgStat: 'potencia',   dmgDiceSides: 6,  dmgBonus: 1, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'espada_bastarda', name: 'Espada Bastarda',         level: 2, dice: 10, atkAttr: 'for', dmgStat: 'potencia',   dmgDiceSides: 10, dmgBonus: 2, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'espada_mae',      name: 'Espada-Mãe',              level: 3, dice: 20, atkAttr: 'for', dmgStat: 'potencia',   dmgDiceSides: 20, dmgBonus: 3, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'adaga',           name: 'Adaga',                   level: 1, dice: 6,  atkAttr: 'dex', dmgStat: 'letalidade', dmgDiceSides: 6,  dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'adaga_curva',     name: 'Adaga Curva',              level: 2, dice: 10, atkAttr: 'dex', dmgStat: 'letalidade', dmgDiceSides: 10, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'adaga_sombria',   name: 'Adaga Sombria',            level: 3, dice: 15, atkAttr: 'dex', dmgStat: 'letalidade', dmgDiceSides: 15, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'cajado',          name: 'Cajado',                  level: 1, dice: 6,  atkAttr: 'int', dmgStat: 'malicia',    dmgDiceSides: 6,  dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'cajado_avancado', name: 'Cajado Avançado',         level: 2, dice: 10, atkAttr: 'int', dmgStat: 'malicia',    dmgDiceSides: 10, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'cajado_arcano',   name: 'Cajado Arcano',           level: 3, dice: 20, atkAttr: 'int', dmgStat: 'malicia',    dmgDiceSides: 20, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0 },
  { id: 'espada_escudo',   name: 'Espada e Escudo',          level: 1, dice: 6,  atkAttr: 'dex', dmgStat: 'potencia',   dmgDiceSides: 6,  dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0, shieldRegen: true },
  { id: 'espada_broquel',  name: 'Espada e Broquel Reforçado', level: 2, dice: 10, atkAttr: 'dex', dmgStat: 'potencia', dmgDiceSides: 10, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0, shieldRegen: true },
  { id: 'espada_egide',    name: 'Espada e Égide',           level: 3, dice: 15, atkAttr: 'dex', dmgStat: 'potencia',   dmgDiceSides: 15, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0, shieldRegen: true },
  { id: 'arco',            name: 'Arco Curto',              level: 1, dice: 6,  atkAttr: 'dex', dmgStat: 'letalidade', dmgDiceSides: 4,  dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0, arrowBased: true },
  { id: 'arco_longo',      name: 'Arco Longo',              level: 2, dice: 10, atkAttr: 'dex', dmgStat: 'letalidade', dmgDiceSides: 7,  dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0, arrowBased: true },
  { id: 'arco_ancestral',  name: 'Arco Ancestral',          level: 3, dice: 20, atkAttr: 'dex', dmgStat: 'letalidade', dmgDiceSides: 15, dmgBonus: 0, potencia: 0, letalidade: 0, malicia: 0, arrowBased: true },
  { id: 'maos_livres',     name: 'Mãos Livres',             level: 1, dice: 6,  atkAttr: 'for', dmgStat: 'potencia',   potencia: 0, letalidade: 0, malicia: 0, unarmed: true },
]

const ARMORS = [
  { id: 'armadura',        name: 'Cota de Malha',              level: 1, dice: 6,  protecaoDice: 6,  evasivaDice: 3,  barreiraDice: 0,  armorPassive: 'plate' },
  { id: 'armadura_placas', name: 'Armadura de Placas',         level: 2, dice: 10, protecaoDice: 10, evasivaDice: 4,  barreiraDice: 2,  armorPassive: 'plate' },
  { id: 'armadura_pesada', name: 'Armadura Pesada',            level: 3, dice: 20, protecaoDice: 20, evasivaDice: 7,  barreiraDice: 4,  armorPassive: 'plate' },
  { id: 'couto',           name: 'Roupa de Couro',             level: 1, dice: 6,  protecaoDice: 3,  evasivaDice: 6,  barreiraDice: 0,  armorPassive: 'leather' },
  { id: 'couro_couraca',   name: 'Couraça de Couro',           level: 2, dice: 10, protecaoDice: 4,  evasivaDice: 10, barreiraDice: 4,  armorPassive: 'leather' },
  { id: 'couro_cravejado', name: 'Couraça de Couro Cravejado', level: 3, dice: 20, protecaoDice: 5,  evasivaDice: 20, barreiraDice: 6,  armorPassive: 'leather' },
  { id: 'tunica',          name: 'Túnica',                     level: 1, dice: 6,  protecaoDice: 0,  evasivaDice: 3,  barreiraDice: 6,  armorPassive: 'tunic' },
  { id: 'tunica_mistica',  name: 'Túnica Mística',              level: 2, dice: 10, protecaoDice: 3,  evasivaDice: 4,  barreiraDice: 10, armorPassive: 'tunic' },
  { id: 'robe',            name: 'Robe',                       level: 3, dice: 20, protecaoDice: 5,  evasivaDice: 6,  barreiraDice: 20, armorPassive: 'tunic' },
]
const DMG_VS_DEF = { potencia: 'protecao', letalidade: 'evasiva', malicia: 'barreira' }
const ATK_VS_DEF_ATTR = { for: 'res', dex: 'agi', int: 'det' }

function rollArmorDefense(armor, defStat) {
  const sides = armor[defStat + 'Dice']
  if (!sides || sides <= 0) return { value: 0, isMax: false }
  const roll = rollDice(sides)
  return { value: roll, isMax: roll === sides }
}
function atkBonus(entity)  { return Math.floor(entity.attrs.dex / 2) }
function defBonus(entity)  { return Math.floor(entity.attrs.agi / 2) }
function isCajadoWeapon(weapon) { return ['cajado', 'cajado_avancado', 'cajado_arcano'].includes(weapon.id) }
function isShieldWeapon(weapon) { return ['espada_escudo', 'espada_broquel', 'espada_egide'].includes(weapon.id) }
function isDaggerWeapon(weapon) { return ['adaga', 'adaga_curva', 'adaga_sombria'].includes(weapon.id) }
function isSwordWeapon(weapon)  { return ['espada', 'espada_bastarda', 'espada_mae'].includes(weapon.id) }
function isBowWeapon(weapon)    { return ['arco', 'arco_longo', 'arco_ancestral'].includes(weapon.id) }
function weaponFamily(weapon) {
  if (isCajadoWeapon(weapon)) return 'cajado'
  if (isShieldWeapon(weapon)) return 'espada_escudo'
  if (isDaggerWeapon(weapon)) return 'adaga'
  if (isSwordWeapon(weapon))  return 'espada'
  if (isBowWeapon(weapon))    return 'arco'
  if (weapon.unarmed) return 'maos_livres'
  return weapon.id
}

const ITEMS_CONSUMABLE = [
  { id:'pocao_p',   name:'Poção Pequena', type:'heal_hp', dice:10,  desc:'Cura 1d10 de HP' },
  { id:'pocao_m',   name:'Poção Média',   type:'heal_hp', dice:20,  desc:'Cura 1d20 de HP' },
  { id:'pocao_g',   name:'Poção Grande',  type:'heal_hp', dice:100, desc:'Cura 1d100 de HP' },
  { id:'mana_p',    name:'Maná Pequena',  type:'heal_mp', dice:10,  desc:'Cura 1d10 de MP' },
  { id:'mana_m',    name:'Maná Média',    type:'heal_mp', dice:20,  desc:'Cura 1d20 de MP' },
  { id:'mana_g',    name:'Maná Grande',   type:'heal_mp', dice:100, desc:'Cura 1d100 de MP' },
  { id:'ataduras',  name:'Ataduras',      type:'cure', removes:['bleed'],    desc:'Remove Sangramento' },
  { id:'antidoto',  name:'Antídoto',      type:'cure', removes:['poison'],   desc:'Remove Envenenamento' },
  { id:'camomila',  name:'Camomila',      type:'cure', removes:['paralyze'], desc:'Remove Paralisia' },
  { id:'xarope',    name:'Xarope',        type:'cure', removes:['disease_light','disease_medium','disease_severe'], desc:'Remove Doença' },
  { id:'cafe_forte',name:'Café Forte',    type:'revive', desc:'Revive aliado derrotado com 1 HP' },
]

const ARROWS = [
  { id:'flecha_pesada',    name:'Flechas Pesadas',           dmgStat:'potencia',   desc:'Ataque com Potência' },
  { id:'flecha_afiada',    name:'Flechas Afiadas',            dmgStat:'letalidade', desc:'Ataque com Letalidade' },
  { id:'flecha_corrompida',name:'Flechas Corrompidas',        dmgStat:'malicia',    desc:'Ataque com Malícia' },
  { id:'flecha_venenosa',  name:'Flechas Afiadas Envenenadas', dmgStat:'letalidade', desc:'Letalidade — pode causar Envenenamento', effect:'poison' },
  { id:'flecha_paralisante',name:'Flechas Afiadas Paralizantes',dmgStat:'letalidade', desc:'Letalidade — pode causar Paralisia', effect:'paralyze' },
  { id:'flecha_lacerante', name:'Flechas Afiadas Lacerantes',  dmgStat:'letalidade', desc:'Letalidade — pode causar Sangramento', effect:'bleed' },
]
const ARROW_DEFAULT_ORDER = ['flecha_pesada','flecha_afiada','flecha_corrompida','flecha_venenosa','flecha_paralisante','flecha_lacerante']

const STARTING_INVENTORY = {
  pocao_p: 5, pocao_m: 5, pocao_g: 5,
  mana_p: 5, mana_m: 5, mana_g: 5,
  ataduras: 5, antidoto: 5, camomila: 5, xarope: 5,
  cafe_forte: 5,
  flecha_pesada: 50, flecha_afiada: 50, flecha_corrompida: 50,
  flecha_venenosa: 10, flecha_paralisante: 10, flecha_lacerante: 10,
}

function makeInventory() { return { ...STARTING_INVENTORY } }

function getItemDef(id) {
  return ITEMS_CONSUMABLE.find(i => i.id === id) || ARROWS.find(a => a.id === id)
}

const ALLY_TEMPLATES = [
  { id:'brunhilda', name:'Brunhilda', role:'Guerreira',  attrs:{for:3,dex:1,int:0,agi:1,res:2,det:1}, weapon: WEAPONS.find(w=>w.id==='espada'),        armor: ARMORS.find(a=>a.id==='armadura') },
  { id:'finn',      name:'Finn',      role:'Ladino',     attrs:{for:1,dex:3,int:0,agi:3,res:1,det:0}, weapon: WEAPONS.find(w=>w.id==='adaga'),         armor: ARMORS.find(a=>a.id==='couto') },
  { id:'elowen',    name:'Elowen',    role:'Maga',       attrs:{for:0,dex:1,int:3,agi:1,res:0,det:3}, weapon: WEAPONS.find(w=>w.id==='cajado'),        armor: ARMORS.find(a=>a.id==='tunica') },
  { id:'boran',     name:'Boran',     role:'Defensor',   attrs:{for:2,dex:1,int:0,agi:0,res:3,det:2}, weapon: WEAPONS.find(w=>w.id==='espada_escudo'), armor: ARMORS.find(a=>a.id==='armadura') },
  { id:'sylvara',   name:'Sylvara',   role:'Arqueira',   attrs:{for:0,dex:3,int:0,agi:3,res:1,det:1}, weapon: WEAPONS.find(w=>w.id==='arco'),          armor: ARMORS.find(a=>a.id==='couto') },
  { id:'kael',      name:'Kael',      role:'Monge',      attrs:{for:3,dex:0,int:0,agi:1,res:3,det:1}, weapon: WEAPONS.find(w=>w.id==='maos_livres'),   armor: ARMORS.find(a=>a.id==='couto') },
]

const ENEMY_TEMPLATES = [
  { name:'Soldado Renegado',  attrs:{for:2,dex:1,int:0,agi:1,res:2,det:0}, weapon: WEAPONS.find(w=>w.id==='espada'), armor: ARMORS[0] },
  { name:'Mercenário Errante',attrs:{for:1,dex:2,int:0,agi:2,res:1,det:0}, weapon: WEAPONS.find(w=>w.id==='adaga'),  armor: ARMORS[1] },
  { name:'Cultista Sombrio',  attrs:{for:0,dex:1,int:2,agi:1,res:0,det:2}, weapon: WEAPONS.find(w=>w.id==='cajado'), armor: ARMORS[2] },
  { name:'Bandido Veloz',     attrs:{for:1,dex:3,int:0,agi:2,res:0,det:0}, weapon: WEAPONS.find(w=>w.id==='adaga'),  armor: ARMORS[1] },
  { name:'Bruto das Cavernas',attrs:{for:3,dex:0,int:0,agi:0,res:3,det:0}, weapon: WEAPONS.find(w=>w.id==='espada'), armor: ARMORS[0] },
]
function makeCombatant(template, side, id, isPlayerControlled) {
  const maxHP = calcHP(template.attrs.res, template.attrs.for)
  const maxMP = calcMP(template.attrs.det, template.attrs.int)
  return {
    id, name: template.name, role: template.role || null, side,
    isPlayerControlled: !!isPlayerControlled,
    attrs: { ...template.attrs },
    weapon: template.weapon, armor: template.armor,
    maxHP, hp: maxHP, maxMP, mp: maxMP,
    effects: [], buffs: [], alive: true,
    paralyzedRoundRolled: false, paralyzedThisRound: false,
    inventory: isPlayerControlled ? makeInventory() : null,
    preferredArrow: null, disease: null,
    xp: { for:0, dex:0, int:0, agi:0, res:0, det:0 },
    testedAttrs: new Set(),
    comboStage: 1, protecting: null,
  }
}

function markTested(entity, attrId) {
  if (entity && entity.testedAttrs) entity.testedAttrs.add(attrId)
}

const POISON_TIERS = [
  { id:'poison_minor',    name:'Envenenamento Menor',    cost:2,  defAttr:'res', resMod:0,  pct:0.10, turns:3, minWeaponLevel:1, cls:'effect-poison' },
  { id:'poison_moderate', name:'Envenenamento Moderado', cost:5,  defAttr:'res', resMod:-1, pct:0.10, turns:4, minWeaponLevel:2, cls:'effect-poison' },
  { id:'poison_major',    name:'Envenenamento Maior',    cost:10, defAttr:'res', resMod:-2, pct:0.20, turns:5, minWeaponLevel:3, cls:'effect-poison' },
]
const PARALYZE_TIERS = [
  { id:'paralyze_minor',    name:'Paralisia Menor',    cost:2,  defAttr:'res', resMod:0,  chance:0.40, turns:3, minWeaponLevel:1, cls:'effect-paralyze' },
  { id:'paralyze_moderate', name:'Paralisia Moderada', cost:5,  defAttr:'res', resMod:-1, chance:0.50, turns:3, minWeaponLevel:2, cls:'effect-paralyze' },
  { id:'paralyze_major',    name:'Paralisia Maior',    cost:10, defAttr:'res', resMod:-2, chance:0.60, turns:3, minWeaponLevel:3, cls:'effect-paralyze' },
]
const FAINT_EFFECT = { id:'faint', name:'Desmaio', cost:7, defAttr:'det', desc:'Perde turno+rec', cls:'effect-faint', minWeaponLevel:2 }

const STAT_DEBUFF_TIERS = {
  fragile: [
    { id:'fragile_minor',    name:'Fragilidade Menor',    cost:2, defAttr:'det', type:'def_attr', attrMod:-1, minWeaponLevel:1, cls:'effect-fragile' },
    { id:'fragile_moderate', name:'Fragilidade Moderada', cost:5, defAttr:'det', type:'def_attr', attrMod:-2, minWeaponLevel:2, cls:'effect-fragile' },
    { id:'fragile_major',    name:'Fragilidade Maior',    cost:7, defAttr:'det', type:'def_attr', attrMod:-3, minWeaponLevel:3, cls:'effect-fragile' },
  ],
  neglect: [
    { id:'neglect_minor',    name:'Negligência Menor',    cost:2, defAttr:'det', type:'def', diceMod:4,  minWeaponLevel:1, cls:'effect-fragile' },
    { id:'neglect_moderate', name:'Negligência Moderada', cost:5, defAttr:'det', type:'def', diceMod:6,  minWeaponLevel:2, cls:'effect-fragile' },
    { id:'neglect_major',    name:'Negligência Maior',    cost:7, defAttr:'det', type:'def', diceMod:10, minWeaponLevel:3, cls:'effect-fragile' },
  ],
  imperit: [
    { id:'imperit_minor',    name:'Imperícia Menor',      cost:2, defAttr:'det', type:'atk', diceMod:4,  minWeaponLevel:1, cls:'effect-fragile' },
    { id:'imperit_moderate', name:'Imperícia Moderada',   cost:5, defAttr:'det', type:'atk', diceMod:6,  minWeaponLevel:2, cls:'effect-fragile' },
    { id:'imperit_major',    name:'Imperícia Maior',      cost:7, defAttr:'det', type:'atk', diceMod:10, minWeaponLevel:3, cls:'effect-fragile' },
  ],
  imprud: [
    { id:'imprud_minor',    name:'Imprudência Menor',    cost:2, defAttr:'det', type:'atk_attr', attrMod:-1, minWeaponLevel:1, cls:'effect-fragile' },
    { id:'imprud_moderate', name:'Imprudência Moderada', cost:5, defAttr:'det', type:'atk_attr', attrMod:-2, minWeaponLevel:2, cls:'effect-fragile' },
    { id:'imprud_major',    name:'Imprudência Maior',    cost:7, defAttr:'det', type:'atk_attr', attrMod:-3, minWeaponLevel:3, cls:'effect-fragile' },
  ],
}
const EFFECTS_ENEMY = [
  ...STAT_DEBUFF_TIERS.fragile, ...STAT_DEBUFF_TIERS.neglect,
  ...STAT_DEBUFF_TIERS.imperit, ...STAT_DEBUFF_TIERS.imprud,
]

const BLEED_EFFECT = { id:'bleed', name:'Sangramento', defAttr:'res', cls:'effect-bleed' }
const BLEED_STACK_PCT = [0.10, 0.15, 0.20]

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
}
const EFFECTS_ALLY = [
  { id:'regen',   name:'Regeneração', cost:2,  desc:'+10% HP/turno',  cls:'effect-regen' },
  { id:'detox',   name:'Detox',       cost:2,  desc:'Limpa efeitos',  cls:'effect-regen' },
  ...STAT_BUFF_TIERS.blind, ...STAT_BUFF_TIERS.prepare,
  ...STAT_BUFF_TIERS.skill, ...STAT_BUFF_TIERS.caution,
  { id:'revive',  name:'Reviver',     cost:10, desc:'Revive com 1 HP', cls:'effect-regen' },
]

const DAMAGE_TIERS = [
  { id: 'dano',         name: 'Dano',          atkMod: 0, defMod: 0, dmgBonus: 0, minInt: 3,  minDet: 2, minWeaponLevel: 1, extraCost: 0 },
  { id: 'dano_preciso', name: 'Dano Preciso',  atkMod: 1, defMod: -1, dmgBonus: 0, minInt: 7,  minDet: 0, minWeaponLevel: 2, extraCost: 3 },
  { id: 'dano_maior',   name: 'Dano Maior',    atkMod: 2, defMod: -2, dmgBonus: 3, minInt: 15, minDet: 0, minWeaponLevel: 3, extraCost: 5 },
]

const HEAL_TIERS = [
  { id: 'cura',          name: 'Cura',           dice: 10,  cost: 3,  minInt: 3,  minWeaponLevel: 1 },
  { id: 'cura_aprim',    name: 'Cura Aprimorada',dice: 50,  cost: 10, minInt: 7,  minWeaponLevel: 2 },
  { id: 'cura_avanc',    name: 'Cura Avançada',  dice: 110, cost: 15, minInt: 15, minWeaponLevel: 3 },
]
const COMBO_STAGES = {
  skill_combo_2: { next: 2, bonus: 5,  cost: 1, label: '2 Hit Combo' },
  skill_combo_3: { next: 3, bonus: 7,  cost: 1, label: '3 Hit Combo' },
  skill_combo_4: { next: 4, bonus: 10, cost: 1, label: '4 Hit Combo' },
  skill_combo_5: { next: 0, bonus: 20, cost: 0, label: '5 Hit Combo' },
}
const APUNHALAR_BLEED_CHANCE = { adaga: 0.40, adaga_curva: 0.50, adaga_sombria: 0.60 }
const DISEASE_STAGES = ['light', 'medium', 'severe']
const DISEASE_HP_REDUCTION = { light: 0.10, medium: 0.25, severe: 0.50 }
const DISEASE_LABELS = { light: 'Doença Leve', medium: 'Doença Média', severe: 'Doença Grave' }

let player = {}
let combatants = []
let battleActive = false
let creation = { for:0, dex:0, int:0, agi:0, res:0, det:0 }
let selectedWeapon = WEAPONS[0]
let selectedArmor  = ARMORS[0]
let selectedAllies = [ALLY_TEMPLATES[0], ALLY_TEMPLATES[1]]
let turnOrder = []
let turnIndex = 0
let currentActor = null
let pendingAction = null
let areaTargetsPicked = []
let globalRoundCount = 0
let magicQueue = { damageTier: null, effect: null, supports: [], revive: false, area: null }
let pendingItemUse = null
const MAX_PTS = 8
const MAX_PER = 3

function getPointsLeft() {
  return MAX_PTS - Object.values(creation).reduce((a,b) => a+b, 0)
}
function calcHP(res, fort) {
  const base = res === 0 ? 5 : 10
  const pairs = Math.floor(res / 2)
  return base + pairs * 10 + fort
}
function calcMP(det, intel) {
  const base = det === 0 ? 5 : 10
  const pairs = Math.floor(det / 2)
  return base + pairs * 10 + intel
}
function suggestClass() {
  const { for: f, dex, int: i, res, agi, det } = creation
  if (i >= 2 && det >= 2) return 'Mago'
  if (dex >= 2 && agi >= 2) return 'Ladino'
  if (f >= 2 && res >= 2) return 'Guerreiro'
  if (f >= 2 || res >= 2) return 'Guerreiro'
  if (dex >= 2 || agi >= 2) return 'Ladino'
  if (i >= 2 || det >= 2) return 'Mago'
  return 'Híbrido'
}
function rollDice(sides) { return Math.floor(Math.random() * sides) + 1 }
function rollD20() { return rollDice(20) }
function successChance(val) {
  if (val === 0) return 0.10
  if (val <= 5)  return 0.50
  return Math.min(0.99, 0.50 + (val - 5) * 0.0333)
}
function successCheck(val) { return Math.random() < successChance(val) }
function xpNeeded(attrVal) {
  if (attrVal <= 3)  return 10
  if (attrVal <= 7)  return 20
  if (attrVal <= 11) return 30
  if (attrVal <= 17) return 40
  return 50
}
function synthesisLimit(actor) {
  if (!actor || !actor.weapon) return 1
  if (actor.weapon.id === 'cajado_arcano') return 3
  if (actor.weapon.id === 'cajado_avancado') return 2
  return 1
}
function mpCostQueue(actor) {
  actor = actor || currentActor
  if (magicQueue.revive) return 10
  let cost = 0
  if (magicQueue.damageTier && actor) {
    const tier = DAMAGE_TIERS.find(t => t.id === magicQueue.damageTier)
    if (tier) cost += damageSpellCost(actor, tier)
  }
  if (magicQueue.area === 'two') cost += 1
  else if (magicQueue.area === 'all') cost += 2
  if (magicQueue.effect) cost += magicQueue.effect.cost
  magicQueue.supports.forEach(sup => { cost += sup.cost })
  return cost
}
function damageSpellAvailable(actor, tier) {
  return actor.attrs.int >= tier.minInt && actor.attrs.det >= tier.minDet &&
         isCajadoWeapon(actor.weapon) && actor.weapon.level >= tier.minWeaponLevel
}
function damageSpellCost(actor, tier) {
  return Math.floor(0.4 * (actor.attrs.int + actor.attrs.det)) + tier.extraCost
}
function healSpellAvailable(actor, tier) {
  return actor.attrs.int >= tier.minInt && isCajadoWeapon(actor.weapon) && actor.weapon.level >= tier.minWeaponLevel
}
function getEffectiveMaxHP(entity) {
  if (!entity.disease) return entity.maxHP
  return Math.max(1, Math.floor(entity.maxHP * (1 - DISEASE_HP_REDUCTION[entity.disease.stage])))
}
function hasEffect(entity, id) { return entity.effects?.some(e => e.id === id) || false }
function hasAnyParalyze(entity) { return entity.effects?.some(e => e.id.startsWith('paralyze')) || false }
function getEffectMod(entity, type) {
  if (type === 'def_attr') return 0
  let mod = 0
  if (entity.buffs) entity.buffs.forEach(b => { if (b.type === type && typeof b.diceMod === 'number') mod += rollDice(b.diceMod) })
  if (entity.effects) entity.effects.forEach(ef => { if (ef.type === type && typeof ef.diceMod === 'number') mod -= rollDice(ef.diceMod) })
  return mod
}
function getAttrTestMod(entity, type) {
  let mod = 0
  if (entity.buffs) entity.buffs.forEach(b => { if (b.type === type && typeof b.attrMod === 'number') mod += b.attrMod })
  if (entity.effects) entity.effects.forEach(ef => { if (ef.type === type && typeof ef.attrMod === 'number') mod += ef.attrMod })
  return mod
}
function alivePlayerSide() { return combatants.filter(c => c.side === 'player' && c.alive) }
function aliveEnemySide()  { return combatants.filter(c => c.side === 'enemy'  && c.alive) }
function getCombatant(id)  { return combatants.find(c => c.id === id) }
function totalAttrPoints(entity) { return Object.values(entity.attrs).reduce((a,b) => a+b, 0) }
function renderCreation() {
  const builder = document.getElementById('attr-builder')
  builder.innerHTML = ''
  ATTRS.forEach(a => {
    const row = document.createElement('div')
    row.className = 'attr-row'
    const left = getPointsLeft()
    row.innerHTML = '<div class=\"attr-name\">' + a.name + '<div class=\"attr-type\">' + a.type + ' — ' + a.hint + '</div></div><div class=\"attr-controls\"><button class=\"btn-small\" onclick=\"changeAttr(\'' + a.id + '\',-1)\" ' + (creation[a.id]<=0?'disabled':'') + '>−</button><div class=\"attr-val\">' + creation[a.id] + '</div><button class=\"btn-small\" onclick=\"changeAttr(\'' + a.id + '\',1)\" ' + ((left<=0||creation[a.id]>=MAX_PER)?'disabled':'') + '>+</button></div>'
    builder.appendChild(row)
  })
  const ws = document.getElementById('weapon-selector')
  if (ws) {
    ws.innerHTML = ''
    WEAPONS.forEach(w => {
      const btn = document.createElement('button')
      btn.className = 'btn ' + (selectedWeapon.id === w.id ? 'btn-gold' : 'btn-secondary')
      btn.style.fontSize = '0.85rem'
      const dmgLabel = w.unarmed ? '(For+Res)÷2 + 1d4 (1d6 se For≥10 e Res≥10)' : '1d' + w.dmgDiceSides + (w.dmgBonus ? '+' + w.dmgBonus : '') + ' ' + w.dmgStat
      btn.innerHTML = w.name + '<br><small style=\"font-style:italic;color:var(--muted);\">' + dmgLabel + '</small>'
      btn.onclick = function() { selectedWeapon = w; renderCreation() }
      ws.appendChild(btn)
    })
  }
  const as = document.getElementById('armor-selector')
  if (as) {
    as.innerHTML = ''
    ARMORS.forEach(ar => {
      const btn = document.createElement('button')
      btn.className = 'btn ' + (selectedArmor.id === ar.id ? 'btn-gold' : 'btn-secondary')
      btn.style.fontSize = '0.85rem'
      btn.innerHTML = ar.name + '<br><small style=\"font-style:italic;color:var(--muted);\">Prot ' + (ar.protecaoDice ? '1d' + ar.protecaoDice : '—') + ' | Eva ' + (ar.evasivaDice ? '1d' + ar.evasivaDice : '—') + ' | Bar ' + (ar.barreiraDice ? '1d' + ar.barreiraDice : '—') + '</small>'
      btn.onclick = function() { selectedArmor = ar; renderCreation() }
      as.appendChild(btn)
    })
  }
  const als = document.getElementById('ally-selector')
  if (als) {
    als.innerHTML = ''
    ALLY_TEMPLATES.forEach(a => {
      const selected = selectedAllies.some(x => x.id === a.id)
      const btn = document.createElement('button')
      btn.className = 'btn ' + (selected ? 'btn-gold' : 'btn-secondary')
      btn.style.textAlign = 'left'
      btn.style.fontSize = '0.85rem'
      const attrSummary = ATTRS.map(at => at.name.slice(0,3) + ' ' + a.attrs[at.id]).join(' · ')
      btn.innerHTML = '<strong>' + a.name + '</strong> — ' + a.role + '<br><small style=\"font-style:italic;color:var(--muted);\">' + attrSummary + ' | ' + a.weapon.name + ' · ' + a.armor.name + '</small>'
      btn.onclick = function() { toggleAlly(a) }
      als.appendChild(btn)
    })
  }
  document.getElementById('pts-left').textContent = getPointsLeft()
  document.getElementById('preview-hp').textContent = calcHP(creation.res, creation.for)
  document.getElementById('preview-mp').textContent = calcMP(creation.det, creation.int)
  document.getElementById('preview-class').textContent = suggestClass()
  document.getElementById('btn-confirm').disabled = getPointsLeft() > 0
}

function changeAttr(id, delta) {
  const next = creation[id] + delta
  if (next < 0 || next > MAX_PER) return
  if (delta > 0 && getPointsLeft() <= 0) return
  creation[id] = next
  renderCreation()
}

function toggleAlly(template) {
  const idx = selectedAllies.findIndex(a => a.id === template.id)
  if (idx >= 0) {
    if (selectedAllies.length > 1) selectedAllies.splice(idx, 1)
  } else {
    if (selectedAllies.length < 2) selectedAllies.push(template)
    else selectedAllies[1] = template
  }
  renderCreation()
}

function pickRandomEnemies(n) {
  const pool = [...ENEMY_TEMPLATES]
  const chosen = []
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    chosen.push(pool[idx])
    pool.splice(idx, 1)
    if (pool.length === 0) pool.push(...ENEMY_TEMPLATES)
  }
  return chosen
}

function confirmCreation() {
  const maxHP = calcHP(creation.res, creation.for)
  const maxMP = calcMP(creation.det, creation.int)
  player = {
    id: 'player', name: 'Aventureiro', side: 'player', isPlayerControlled: true,
    attrs: { ...creation },
    xp: { for:0, dex:0, int:0, agi:0, res:0, det:0 },
    maxHP, hp: maxHP, maxMP, mp: maxMP,
    weapon: selectedWeapon, armor: selectedArmor,
    effects: [], buffs: [], alive: true,
    paralyzedRoundRolled: false, paralyzedThisRound: false,
    inventory: makeInventory(), preferredArrow: null,
    disease: null, testedAttrs: new Set(), comboStage: 1, protecting: null,
  }
  const ally1 = makeCombatant(selectedAllies[0], 'player', 'ally1', true)
  const ally2 = makeCombatant(selectedAllies[1], 'player', 'ally2', true)
  const enemyTemplates = pickRandomEnemies(3)
  combatants = [player, ally1, ally2,
    makeCombatant(enemyTemplates[0], 'enemy', 'enemy1', false),
    makeCombatant(enemyTemplates[1], 'enemy', 'enemy2', false),
    makeCombatant(enemyTemplates[2], 'enemy', 'enemy3', false)]
  buildMainScreen()
  showScreen('screen-main')
}
function buildMainScreen() {
  renderSheet()
  renderTestButtons()
  setTimeout(initBattle, 200)
}
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById(id).classList.add('active')
}
function showTab(id) {
  ;['tab-sheet','tab-tests','tab-battle'].forEach(t => {
    const el = document.getElementById(t)
    if (el) el.style.display = t === id ? '' : 'none'
  })
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'))
  const tabBtn = document.getElementById('tab-btn-' + id.replace('tab-', ''))
  if (tabBtn) tabBtn.classList.add('active')
}

function renderSheet() {
  const grid = document.getElementById('sheet-attrs')
  grid.innerHTML = ''
  ATTRS.forEach(a => {
    const val = player.attrs[a.id]
    const xp = player.xp[a.id]
    const xpPct = Math.min((xp / xpNeeded(val)) * 100, 100)
    grid.innerHTML += '<div style=\"background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:10px 12px;\"><div style=\"display:flex;justify-content:space-between;align-items:center;\"><span style=\"font-size:.95rem;\">' + a.name + '</span><span style=\"font-family:\'Cinzel\',serif;font-size:1.3rem;color:var(--gold);\">' + val + '</span></div><div class=\"xp-row\"><div class=\"xp-bar\"><div class=\"xp-fill\" style=\"width:' + xpPct + '%\"></div></div><div class=\"xp-label\">' + xp + '/' + xpNeeded(val) + ' xp</div></div></div>'
  })
  const bars = document.getElementById('sheet-bars')
  bars.innerHTML = '<div class=\"stat-bar-row\"><div class=\"stat-bar-label\" style=\"color:var(--hp-light)\">HP</div><div class=\"bar-track\"><div class=\"bar-fill bar-hp ' + (player.hp/player.maxHP < 0.3 ? 'low' : '') + '\" style=\"width:' + (player.hp/player.maxHP)*100 + '%\"></div></div><div class=\"stat-val\">' + player.hp + ' / ' + player.maxHP + '</div></div><div class=\"stat-bar-row\"><div class=\"stat-bar-label\" style=\"color:var(--mp-light)\">MP</div><div class=\"bar-track\"><div class=\"bar-fill bar-mp\" style=\"width:' + (player.mp/player.maxMP)*100 + '%\"></div></div><div class=\"stat-val\">' + player.mp + ' / ' + player.maxMP + '</div></div>'
}

function renderTestButtons() {
  const grid = document.getElementById('test-buttons')
  grid.innerHTML = ''
  ATTRS.forEach(a => {
    const btn = document.createElement('div')
    btn.className = 'test-attr-btn'
    btn.innerHTML = '<div class=\"t-name\">' + a.name + '</div><div class=\"t-val\">' + player.attrs[a.id] + '</div><div class=\"t-hint\">' + a.hint + '</div>'
    btn.onclick = function() { runTest(a) }
    grid.appendChild(btn)
  })
}

function runTest(attr) {
  const val = player.attrs[attr.id]
  const win = successCheck(val)
  const cls = win ? 'roll-success' : 'roll-fail'
  const verdict = win ? '✦ Sucesso ✦' : '✦ Falha ✦'
  const detail = attr.name + ' — ' + (win ? '+1 XP' : '+2 XP')
  giveXP(attr.id, win ? 1 : 2)
  const res = document.getElementById('test-result')
  res.style.display = ''
  res.innerHTML = '<div class=\"roll-verdict ' + cls + '\" style=\"font-size:1.8rem; margin-bottom:8px;\">' + verdict + '</div><div class=\"roll-detail\">' + detail + '</div>'
  renderSheet()
  renderTestButtons()
}

function giveXP(attrId, amount) {
  player.xp[attrId] += amount
  const needed = xpNeeded(player.attrs[attrId])
  if (player.xp[attrId] >= needed) {
    player.xp[attrId] -= needed
    if (player.attrs[attrId] < 20) {
      player.attrs[attrId] += 1
      player.maxHP = calcHP(player.attrs.res, player.attrs.for)
      player.maxMP = calcMP(player.attrs.det, player.attrs.int)
      if (player.hp > player.maxHP) player.hp = player.maxHP
      if (player.mp > player.maxMP) player.mp = player.maxMP
      logEntry('✦ ' + ATTRS.find(a=>a.id===attrId)?.name + ' aumentou para ' + player.attrs[attrId] + '! (próximo nível: ' + xpNeeded(player.attrs[attrId]) + ' XP)', 'log-victory')
    }
  }
}

function giveXPTo(entity, attrId, amount) {
  if (!entity.xp) entity.xp = { for:0, dex:0, int:0, agi:0, res:0, det:0 }
  entity.xp[attrId] += amount
  const needed = xpNeeded(entity.attrs[attrId])
  if (entity.xp[attrId] >= needed) {
    entity.xp[attrId] -= needed
    if (entity.attrs[attrId] < 20) {
      entity.attrs[attrId] += 1
      entity.maxHP = calcHP(entity.attrs.res, entity.attrs.for)
      entity.maxMP = calcMP(entity.attrs.det, entity.attrs.int)
      if (entity.hp > entity.maxHP) entity.hp = entity.maxHP
      if (entity.mp > entity.maxMP) entity.mp = entity.maxMP
      logEntry('✦ ' + entity.name + ': ' + ATTRS.find(a=>a.id===attrId)?.name + ' aumentou para ' + entity.attrs[attrId] + '!', 'log-victory')
    }
  }
}

function weaponXPAttrs(entity) {
  const attrs = new Set([entity.weapon.atkAttr])
  if (isCajadoWeapon(entity.weapon)) attrs.add('int')
  return attrs
}

function grantBattleEndXP(entity, strongerFoePresent) {
  const weaponAttrs = weaponXPAttrs(entity)
  const weaponBonus = strongerFoePresent ? 4 : 2
  const testedBonus = strongerFoePresent ? 2 : 1
  weaponAttrs.forEach(attrId => giveXPTo(entity, attrId, weaponBonus))
  ;(entity.testedAttrs || new Set()).forEach(attrId => {
    if (weaponAttrs.has(attrId)) return
    giveXPTo(entity, attrId, testedBonus)
  })
}
function initBattle() {
  combatants.sort((a, b) => (b.attrs.agi + b.attrs.det) - (a.attrs.agi + a.attrs.det))
  turnIndex = 0
  turnOrder = combatants.filter(c => c.alive)
  globalRoundCount = 0
  battleActive = true
  pendingAction = null
  areaTargetsPicked = []
  clearMagicQueue()
  renderBattle()
}

function clearMagicQueue() {
  magicQueue = { damageTier: null, effect: null, supports: [], revive: false, area: null }
}

function entityATK(entity) {
  const ab = atkBonus(entity)
  const mod = getEffectMod(entity, 'atk')
  const attrMod = getAttrTestMod(entity, 'atk_attr')
  const attrVal = entity.attrs[entity.weapon.atkAttr] + attrMod
  const roll = rollD20()
  return { value: ab + roll + mod, roll, ab, mod, raw: roll }
}

function entityDEF(entity) {
  const db = defBonus(entity)
  const mod = getEffectMod(entity, 'def')
  const attrMod = getAttrTestMod(entity, 'def_attr')
  const attrVal = entity.attrs[ATK_VS_DEF_ATTR[entity.weapon.atkAttr]] + attrMod
  const roll = rollD20()
  return { value: db + roll + mod, roll, db, mod, raw: roll }
}

function calcRawDamage(entity) {
  const weapon = entity.weapon
  const attrVal = entity.attrs[weapon.atkAttr]
  const dmgSides = weapon.dmgDiceSides
  let dmg = 1
  if (weapon.unarmed) {
    dmg = Math.floor((entity.attrs.for + entity.attrs.res) / 2) + rollDice(4)
    if (entity.attrs.for >= 10 && entity.attrs.res >= 10) dmg = Math.floor((entity.attrs.for + entity.attrs.res) / 2) + rollDice(6)
  } else if (dmgSides && dmgSides > 0) {
    dmg = rollDice(dmgSides) + (weapon.dmgBonus || 0)
  } else {
    dmg = Math.max(1, Math.floor(attrVal / 2))
  }
  return dmg
}

function calcDefenseValue(entity, dmgStat) {
  const armor = entity.armor
  if (!armor) return 0
  const side = DMG_VS_DEF[dmgStat]
  if (!side) return 0
  const diceSide = armor[side + 'Dice']
  if (!diceSide || diceSide <= 0) return 0
  return rollDice(diceSide)
}

function calcDamage(attacker, defender, combat, atkVal, defVal) {
  const raw = calcRawDamage(attacker)
  const defVal2 = calcDefenseValue(defender, attacker.weapon.dmgStat)
  const net = Math.max(0, raw + Math.max(0, atkVal - defVal) - defVal2)
  return { raw, protection: defVal2, net }
}

function applyDamage(defender, combat) {
  const hpLost = Math.min(defender.hp, combat.damage.net)
  defender.hp -= combat.damage.net
  if (defender.hp <= 0) { defender.hp = 0; defender.alive = false }
  return hpLost
}

function isStrongerEnemy(entity) {
  return entity.side === 'enemy' && totalAttrPoints(entity) >= totalAttrPoints(player) + 2
}

function formatEffectTags(effects) {
  if (!effects || effects.length === 0) return ''
  return effects.map(e => {
    const cls = e.cls || 'effect-regen'
    return '<span class="' + cls + '" style="font-size:.75rem;padding:2px 6px;border-radius:3px;">' + e.name + '</span>'
  }).join(' ')
}
function renderBattle() {
  updateTurnOrder()
  const display = document.getElementById('battlefield')
  if (!display) return
  display.innerHTML = ''
  combatants.forEach(c => {
    const card = document.createElement('div')
    card.className = 'battle-card ' + (c.side === 'player' ? 'ally' : 'enemy') + (c.alive ? '' : ' defeated') + (c === currentActor ? ' active-turn' : '') + (c.paralyzedThisRound ? ' paralyzed-effect' : '')
    if (c.inventory) card.innerHTML = '<div class=\"bc-header\">' + c.name + '<span class=\"bc-info\">' + (c.role || '') + '</span></div><div class=\"bc-hp\"><div class=\"bar-track comp\"><div class=\"bar-fill bar-hp ' + ((c.hp/c.maxHP) < 0.3 ? 'low' : '') + '\" style=\"width:' + Math.max(0, (c.hp/c.maxHP)*100) + '%\"></div></div><span class=\"bar-num\">' + Math.max(0, c.hp) + '/' + c.maxHP + '</span></div><div class=\"bc-mp\"><div class=\"bar-track comp\"><div class=\"bar-fill bar-mp\" style=\"width:' + Math.max(0, (c.mp/c.maxMP)*100) + '%\"></div></div><span class=\"bar-num\">' + Math.max(0, c.mp) + '/' + c.maxMP + '</span></div><div class=\"bc-tags\">' + formatEffectTags(c.effects) + (c.disease ? '<span class=\"effect-poison\">' + DISEASE_LABELS[c.disease.stage] + '</span>' : '') + '</div>'
    else card.innerHTML = '<div class=\"bc-header\">' + c.name + '</div><div class=\"bc-hp\"><div class=\"bar-track comp\"><div class=\"bar-fill bar-hp ' + ((c.hp/c.maxHP) < 0.3 ? 'low' : '') + '\" style=\"width:' + Math.max(0, (c.hp/c.maxHP)*100) + '%\"></div></div><span class=\"bar-num\">' + Math.max(0, c.hp) + '/' + c.maxHP + '</span></div><div class=\"bc-mp\"><div class=\"bar-track comp\"><div class=\"bar-fill bar-mp\" style=\"width:' + Math.max(0, (c.mp/c.maxMP)*100) + '%\"></div></div><span class=\"bar-num\">' + Math.max(0, c.mp) + '/' + c.maxMP + '</span></div><div class=\"bc-tags\">' + formatEffectTags(c.effects) + (c.disease ? '<span class=\"effect-poison\">' + DISEASE_LABELS[c.disease.stage] + '</span>' : '') + '</div>'
    if (c.alive && c.side === 'player' && !pendingAction && c === currentActor && battleActive) card.style.cursor = 'pointer'
    display.appendChild(card)
  })
  document.getElementById('round-count').textContent = globalRoundCount
  const actionBar = document.getElementById('action-bar')
  if (actionBar) {
    if (!battleActive) { actionBar.innerHTML = '<div class=\"battle-msg\">Combate encerrado.</div>'; return }
    if (currentActor && currentActor.side === 'enemy') { actionBar.innerHTML = '<div class=\"battle-msg\">Vez do inimigo...</div>'; return }
    if (!currentActor || !currentActor.alive) { actionBar.innerHTML = '<div class=\"battle-msg\">Aguardando...</div>'; return }
    renderActionBar(actionBar)
  }
}

function updateTurnOrder() {
  turnOrder = combatants.filter(c => c.alive).sort((a, b) => (b.attrs.agi + b.attrs.det) - (a.attrs.agi + a.attrs.det))
  if (!currentActor && turnOrder.length > 0) currentActor = turnOrder[0]
  if (turnOrder.indexOf(currentActor) < 0) currentActor = turnOrder[0]
}

function advanceTurn() {
  clearMagicQueue()
  pendingAction = null
  if (!battleActive) return
  turnOrder = combatants.filter(c => c.alive)
  if (turnOrder.length === 0) return
  const idx = turnOrder.indexOf(currentActor)
  if (idx < 0 || idx >= turnOrder.length - 1) {
    nextRound()
    return
  }
  currentActor = turnOrder[idx + 1]
  pendingAction = null
  if (currentActor.side === 'enemy') {
    setTimeout(enemyTurn, 600)
  }
  renderBattle()
}

function nextRound() {
  globalRoundCount++
  turnOrder = combatants.filter(c => c.alive)
  if (turnOrder.length === 0) return
  currentActor = turnOrder[0]
  pendingAction = null
  combatants.forEach(c => { c.paralyzedThisRound = false; c.paralyzedRoundRolled = false })
  processRoundStartEffects()
}

function processRoundStartEffects() {
  combatants.forEach(c => {
    if (!c.alive) return
    if (hasEffect(c, 'regen')) {
      const heal = Math.floor(c.maxHP * 0.10)
      c.hp = Math.min(c.maxHP, c.hp + heal)
      logEntry('♻️ Regeneração: ' + c.name + ' recuperou ' + heal + ' HP.', 'log-info')
    }
    if (c.disease) {
      const reduction = DISEASE_HP_REDUCTION[c.disease.stage]
      const pctStr = (reduction * 100).toFixed(0)
      const dmg = Math.floor(c.maxHP * reduction)
      c.hp -= dmg
      if (c.hp <= 0) { c.hp = 0; c.alive = false }
      logEntry('☠️ ' + DISEASE_LABELS[c.disease.stage] + ': ' + c.name + ' perdeu ' + dmg + ' HP (' + pctStr + '%).', 'log-info')
    }
  })
  combatants = combatants.filter(c => c.alive)
  checkBattleEnd()
}

function checkBattleEnd() {
  if (!battleActive) return
  const alivePlayer = combatants.filter(c => c.side === 'player' && c.alive)
  const aliveEnemy  = combatants.filter(c => c.side === 'enemy' && c.alive)
  if (aliveEnemy.length === 0 || alivePlayer.length === 0) {
    battleActive = false
    const victory = alivePlayer.length > 0
    if (victory) {
      const stronger = combatants.some(e => e.side === 'enemy' && isStrongerEnemy(e))
      combatants.forEach(c => {
        if (c.side === 'player' && c.alive) grantBattleEndXP(c, stronger)
      })
      logEntry('⚔️ Vitória!', 'log-victory')
    } else {
      logEntry('💀 Derrota...', 'log-info')
    }
    renderBattle()
    showEndButtons(victory)
  }
}
function renderActionBar(container) {
  const actor = currentActor
  if (!actor || !actor.alive) { container.innerHTML = ''; return }
  container.innerHTML = '<div style=\"padding:8px 0;font-family:\'Cinzel\',serif;\">Turno de: <strong>' + actor.name + '</strong></div>'
  const btnRow = document.createElement('div')
  btnRow.style.display = 'flex'
  btnRow.style.flexWrap = 'wrap'
  btnRow.style.gap = '6px'
  btnRow.style.margin = '6px 0'

  const atkBtn = makeActionBtn('⚔️ Atacar', function() { pendingAction = 'attack'; renderBattle(); selectTarget('attack') })
  const defBtn = makeActionBtn('🛡️ Defender', function() { executeDefend() })
  const mgcBtn = makeActionBtn('🔮 Magia', function() { showMagicPanel() })
  const itmBtn = makeActionBtn('🎒 Item', function() { showItemPanel() })
  const skipBtn = makeActionBtn('⏭️ Passar', function() { advanceTurn() })
  btnRow.append(atkBtn, defBtn, mgcBtn, itmBtn, skipBtn)
  container.appendChild(btnRow)

  if (pendingAction === 'attack') {
    container.innerHTML += '<div style=\"margin-top:6px;font-size:.85rem;color:var(--gold);\">Selecione um alvo no campo de batalha</div>'
  }
}

function makeActionBtn(text, onClick) {
  const btn = document.createElement('button')
  btn.className = 'btn btn-action'
  btn.textContent = text
  btn.onclick = onClick
  return btn
}
function selectTarget(action) {
  const cards = document.querySelectorAll('.battle-card.enemy')
  cards.forEach(c => { c.style.cursor = 'pointer'; c.style.outline = '2px solid var(--gold)' })
  const battleMsg = document.getElementById('action-bar')
  if (battleMsg) battleMsg.innerHTML = '<div style=\"padding:8px 0;color:var(--gold);\">Clique em um inimigo para ' + action + '.</div>'
  const handler = function(e) {
    const idx = Array.from(document.getElementById('battlefield').children).indexOf(e.currentTarget)
    const enemy = combatants.filter(c => c.side === 'enemy' && c.alive)[idx]
    if (!enemy) return
    cards.forEach(c => { c.style.cursor = ''; c.style.outline = ''; c.onclick = null })
    executeAttack(enemy)
  }
  cards.forEach(c => { c.onclick = handler })
}

function executeAttack(target) {
  if (!currentActor || !target || !target.alive || !battleActive) return
  const actor = currentActor
  const combat = { actor: actor.id, target: target.id }

  let atkCheckResult = entityATK(actor)
  let defCheckResult = entityDEF(target)
  const defTotal = defCheckResult.value

  const family = weaponFamily(actor.weapon)
  if (family === 'arco' && actor.inventory) {
    const arrowId = actor.preferredArrow || ARROW_DEFAULT_ORDER[0]
    const arrow = ARROWS.find(a => a.id === arrowId)
    if (actor.inventory[arrowId] > 0) {
      actor.inventory[arrowId]--
      if (arrow.dmgStat) actor.weapon.dmgStat = arrow.dmgStat
      logEntry('🏹 ' + actor.name + ' usou ' + arrow.name + ' restam ' + actor.inventory[arrowId], '')
    } else {
      actor.weapon.dmgStat = 'potencia'
      logEntry('🏹 ' + actor.name + ' sem flechas especiais, usou padrão', '')
    }
  }

  const diff = atkCheckResult.value - defTotal
  const hit = diff >= 0
  const damage = hit ? calcDamage(actor, target, combat, atkCheckResult.value, defTotal) : null
  combat.hit = hit
  if (hit) combat.damage = damage

  if (hit) {
    const hpLost = applyDamage(target, combat)
    let log = '⚔️ ' + actor.name + ' atacou ' + target.name + ' — Acertou! (' + hpLost + ' dano)'
    log += ' [ATK ' + atkCheckResult.value + ' vs DEF ' + defTotal + '; Dmg raw: ' + damage.raw + ', armadura: ' + damage.protection + ', net: ' + damage.net + ']'
    logEntry(log, 'log-attack')

    if (target.alive) {
      applyOnHitEffects(actor, target)
      applyDebuffEffects(actor, target)
    }

    if (family === 'adaga') {
      const bleedChance = APUNHALAR_BLEED_CHANCE[actor.weapon.id] || 0.50
      if (Math.random() < bleedChance && target.alive) {
        applyBleed(target)
        logEntry('🩸 ' + target.name + ' começou a sangrar!', 'log-status')
      }
    }
  } else {
    logEntry('⚔️ ' + actor.name + ' atacou ' + target.name + ' — Errou! (ATK ' + atkCheckResult.value + ' vs DEF ' + defTotal + ')', 'log-attack')
    if (family === 'cajado') {
      logEntry('🔮 ' + actor.name + ' (Cajado): ainda pode usar Magia como ação bônus!', 'log-info')
    }
  }

  markTested(actor, actor.weapon.atkAttr)
  target.testedAttrs = target.testedAttrs || new Set()
  target.testedAttrs.add(ATK_VS_DEF_ATTR[actor.weapon.atkAttr])

  if (hit && target.alive && !target.alive) {}
  checkBattleEnd()
  if (battleActive) advanceTurn()
  else renderBattle()
}

function executeDefend() {
  if (!currentActor || !battleActive) return
  const actor = currentActor
  const duration = 1
  const defBuff = { id: 'defend_' + actor.id + '_' + Date.now(), name: 'Defesa Total', type: 'def', diceMod: 6, duration, minWeaponLevel: 1, cls: 'effect-regen', remaining: duration }
  actor.buffs = actor.buffs || []
  actor.buffs.push(defBuff)
  logEntry('🛡️ ' + actor.name + ' assume postura defensiva (+1d6 na Defesa por ' + duration + ' rodada).', 'log-defense')
  advanceTurn()
}
function applyOnHitEffects(attacker, defender) {
  const weapon = attacker.weapon
  if (weapon.id === 'cajado') { tryApplyStun(defender, 0.30) }
  else if (weapon.id === 'cajado_avancado') { tryApplyParalyze(defender, 0.40) }
  else if (weapon.id === 'cajado_arcano') { tryApplyParalyze(defender, 0.50) }
  else if (weapon.id === 'espada_bastarda') { tryApplyBleedOnHit(defender, 0.20) }
  else if (weapon.id === 'espada_mae') { tryApplyBleedOnHit(defender, 0.30) }
}

function applyDebuffEffects(attacker, defender) {
  const weapon = attacker.weapon
  if (weapon.id === 'adaga_sombria') {
    const fragile = STAT_DEBUFF_TIERS.fragile.find(f => f.minWeaponLevel === 1)
    if (fragile && Math.random() < 0.20 && defender.alive) applyEffect(defender, { ...fragile, duration: 3, remaining: 3 })
  }
}

function tryApplyStun(target, chance) {
  if (!target.alive || Math.random() >= chance) return
  applyEffect(target, { ...FAINT_EFFECT, name: 'Atordoamento', duration: 1, remaining: 1 })
  logEntry('⚡ ' + target.name + ' foi atordoado!', 'log-status')
}

function tryApplyParalyze(target, chance) {
  if (!target.alive || Math.random() >= chance) return
  applyEffect(target, { ...PARALYZE_TIERS[0], duration: 2, remaining: 2 })
  logEntry('⚡ ' + target.name + ' foi paralisado!', 'log-status')
}

function tryApplyBleedOnHit(target, chance) {
  if (!target.alive || Math.random() >= chance) return
  applyBleed(target)
}

function applyBleed(target) {
  if (!target.alive) return
  const stacks = target.effects.filter(e => e.id === 'bleed').length
  if (stacks >= 3) return
  applyEffect(target, { ...BLEED_EFFECT, duration: 3, remaining: 3, stack: stacks + 1 })
  const pct = BLEED_STACK_PCT[stacks]
  logEntry('🩸 ' + target.name + ' — Sangramento nível ' + (stacks + 1) + ' (' + (pct * 100) + '% HP/ turno)', 'log-status')
}

function tryApplyPoison(target, tier, chance) {
  if (!target.alive || Math.random() >= chance) return
  const existing = target.effects.findIndex(e => e.id === tier.id)
  if (existing >= 0) target.effects.splice(existing, 1)
  applyEffect(target, { ...tier, duration: tier.turns, remaining: tier.turns })
  logEntry('☠️ ' + target.name + ' — ' + tier.name + '!', 'log-status')
}

function applyEffect(entity, effect) {
  if (!entity.effects) entity.effects = []
  entity.effects.push(effect)
}

function processStatusEffects() {
  combatants.forEach(c => {
    if (!c.alive) return
    processBleed(c)
    processPoison(c)
    processParalyze(c)
    c.effects = (c.effects || []).filter(e => {
      if (e.duration) { e.remaining = (e.remaining || e.duration) - 1; return e.remaining > 0 }
      if (e.turns) { e.remaining = (e.remaining || e.turns) - 1; return e.remaining > 0 }
      return true
    })
    c.buffs = (c.buffs || []).filter(b => {
      if (b.duration) { b.remaining = (b.remaining || b.duration) - 1; return b.remaining > 0 }
      return true
    })
  })
}

function processBleed(entity) {
  const bleedStacks = entity.effects.filter(e => e.id === 'bleed')
  bleedStacks.forEach(b => {
    const idx = b.stack ? b.stack - 1 : 0
    const pct = BLEED_STACK_PCT[idx] || 0.10
    const dmg = Math.floor(entity.maxHP * pct)
    entity.hp -= dmg
    if (entity.hp <= 0) { entity.hp = 0; entity.alive = false }
    logEntry('🩸 ' + entity.name + ' sangrou (' + dmg + ' dano)', 'log-status')
  })
}

function processPoison(entity) {
  entity.effects.filter(e => e.id && e.id.startsWith('poison')).forEach(p => {
    const dmg = Math.floor(entity.maxHP * (p.pct || 0.10))
    entity.hp -= dmg
    if (entity.hp <= 0) { entity.hp = 0; entity.alive = false }
    logEntry('☠️ ' + entity.name + ' sofreu dano de ' + p.name + ' (' + dmg + ')', 'log-status')
  })
}

function processParalyze(entity) {
  if (hasAnyParalyze(entity)) {
    if (!entity.paralyzedRoundRolled) {
      entity.paralyzedRoundRolled = true
      if (Math.random() < 0.50) {
        entity.paralyzedThisRound = true
        logEntry('⚡ ' + entity.name + ' está paralisado e perderá o turno!', 'log-status')
      }
    }
  }
}
function showMagicPanel() {
  if (!currentActor || !currentActor.alive) return
  const panel = document.getElementById('magic-panel')
  if (!panel) return
  panel.style.display = 'block'
  panel.innerHTML = '<div style=\"padding:10px;\"><h4 style=\"margin:0 0 10px 0;font-family:\'Cinzel\',serif;\">🔮 Síntese Mágica</h4><div style=\"margin-bottom:6px;font-size:.8rem;\">Limite: ' + synthesisLimit(currentActor) + ' efeitos</div>'
  
  const dmgSection = document.createElement('div')
  dmgSection.innerHTML = '<strong style=\"font-size:.9rem;\">Dano</strong>'
  DAMAGE_TIERS.filter(t => damageSpellAvailable(currentActor, t)).forEach(t => {
    const cost = damageSpellCost(currentActor, t)
    const active = magicQueue.damageTier === t.id
    const btn = document.createElement('button')
    btn.className = 'btn btn-small ' + (active ? 'btn-gold' : '')
    btn.textContent = t.name + ' (MP ' + cost + ' | ' + currentActor.weapon.name + ')'
    btn.onclick = function(e) { e.stopPropagation(); toggleMagicDmg(t) }
    dmgSection.appendChild(btn)
  })
  if (damageSpellAvailable(currentActor, DAMAGE_TIERS[0])) panel.appendChild(dmgSection)

  const areaSection = document.createElement('div')
  areaSection.innerHTML = '<strong style=\"font-size:.9rem;margin-top:6px;display:block;\">Área</strong>'
  if (magicQueue.damageTier) {
    const areaNone = document.createElement('button')
    areaNone.className = 'btn btn-small ' + (!magicQueue.area ? 'btn-gold' : '')
    areaNone.textContent = 'Alvo Único'
    areaNone.onclick = function() { magicQueue.area = null; showMagicPanel() }
    areaSection.appendChild(areaNone)
    const areaTwo = document.createElement('button')
    areaTwo.className = 'btn btn-small ' + (magicQueue.area === 'two' ? 'btn-gold' : '')
    areaTwo.textContent = 'Dois Alvos (+1 MP)'
    areaTwo.onclick = function() { magicQueue.area = 'two'; showMagicPanel() }
    areaSection.appendChild(areaTwo)
    const areaAll = document.createElement('button')
    areaAll.className = 'btn btn-small ' + (magicQueue.area === 'all' ? 'btn-gold' : '')
    areaAll.textContent = 'Todos (+2 MP)'
    areaAll.onclick = function() { magicQueue.area = 'all'; showMagicPanel() }
    areaSection.appendChild(areaAll)
  }
  if (magicQueue.damageTier) panel.appendChild(areaSection)

  const effectSection = document.createElement('div')
  effectSection.innerHTML = '<strong style=\"font-size:.9rem;margin-top:6px;display:block;\">Efeito Ofensivo</strong>'
  let currentEffects = currentActor.effects || []
  EFFECTS_ENEMY.filter(e => isCajadoWeapon(currentActor.weapon) && currentActor.weapon.level >= e.minWeaponLevel).forEach(e => {
    const active = magicQueue.effect?.id === e.id
    const btn = document.createElement('button')
    btn.className = 'btn btn-small ' + (active ? 'btn-gold' : '')
    btn.textContent = e.name + ' (MP ' + e.cost + ')'
    btn.onclick = function() { toggleMagicEffect(e) }
    effectSection.appendChild(btn)
  })
  panel.appendChild(effectSection)

  const supportSection = document.createElement('div')
  supportSection.innerHTML = '<strong style=\"font-size:.9rem;margin-top:6px;display:block;\">Suporte (aliados vivos)</strong>'
  const aliveAllies = combatants.filter(c => c.side === 'player' && c.alive && c.id !== currentActor.id)
  EFFECTS_ALLY.filter(e => isCajadoWeapon(currentActor.weapon) && currentActor.weapon.level >= (e.minWeaponLevel || 1)).forEach(e => {
    const active = magicQueue.supports.some(s => s.id === e.id)
    const btn = document.createElement('button')
    btn.className = 'btn btn-small ' + (active ? 'btn-gold' : '')
    btn.textContent = e.name + ' (MP ' + e.cost + ')'
    btn.onclick = function() { toggleSupport(e) }
    supportSection.appendChild(btn)
    if (e.id === 'revive' && aliveAllies.length === 0) btn.disabled = true
    if (e.id === 'revive') btn.title = 'Revive um aliado derrotado'
  })
  panel.appendChild(supportSection)

  panel.innerHTML += '<div style=\"margin-top:10px;\"><strong>Custo total estimado:</strong> ' + mpCostQueue(currentActor) + ' MP</div>'

  const confirmBtn = document.createElement('button')
  confirmBtn.className = 'btn btn-gold'
  confirmBtn.textContent = 'Lançar Magia'
  confirmBtn.onclick = executeMagic
  if (mpCostQueue(currentActor) > currentActor.mp || synthesisLimit(currentActor) < countMagicQueue()) confirmBtn.disabled = true
  panel.appendChild(confirmBtn)

  const cancelBtn = document.createElement('button')
  cancelBtn.className = 'btn'
  cancelBtn.textContent = 'Cancelar'
  cancelBtn.style.marginLeft = '6px'
  cancelBtn.onclick = function() { panel.style.display = 'none'; clearMagicQueue(); renderBattle() }
  panel.appendChild(cancelBtn)
}

function countMagicQueue() {
  let count = magicQueue.damageTier ? 1 : 0
  if (magicQueue.area) count++
  if (magicQueue.effect) count++
  count += magicQueue.supports.length
  if (magicQueue.revive) count++
  return count
}

function toggleMagicDmg(tier) {
  if (magicQueue.damageTier === tier.id) { magicQueue.damageTier = null; magicQueue.area = null }
  else magicQueue.damageTier = tier.id
  showMagicPanel()
}

function toggleMagicEffect(effect) {
  if (magicQueue.effect?.id === effect.id) magicQueue.effect = null
  else magicQueue.effect = effect
  showMagicPanel()
}

function toggleSupport(effect) {
  const idx = magicQueue.supports.findIndex(s => s.id === effect.id)
  if (idx >= 0) magicQueue.supports.splice(idx, 1)
  else magicQueue.supports.push(effect)
  if (effect.id === 'revive') magicQueue.revive = !magicQueue.revive
  showMagicPanel()
}
function executeMagic() {
  if (!currentActor || !currentActor.alive || !battleActive) return
  const caster = currentActor
  const cost = mpCostQueue(caster)
  if (cost > caster.mp) { logEntry('❌ MP insuficiente!', ''); showMagicPanel(); return }
  caster.mp -= cost
  document.getElementById('magic-panel').style.display = 'none'

  const targets = []
  const aliveEnemies = combatants.filter(c => c.side === 'enemy' && c.alive)
  const aliveAllies = combatants.filter(c => c.side === 'player' && c.alive && c.id !== caster.id)
  const deadAllies = combatants.filter(c => c.side === 'player' && !c.alive)

  const logParts = ['🔮 ' + caster.name + ' lançou magia']

  if (magicQueue.revive && deadAllies.length > 0) {
    const target = deadAllies[0]
    target.alive = true
    target.hp = 1
    logParts.push('✨ reviveu ' + target.name)
  }

  if (magicQueue.supports.length > 0) {
    magicQueue.supports.forEach(ef => {
      if (ef.id === 'regen') {
        aliveAllies.forEach(a => { applyEffect(a, { ...ef, duration: 4, remaining: 4 }); logParts.push('♻️ ' + a.name + ' regeneração') })
      } else if (ef.id === 'detox') {
        aliveAllies.forEach(a => { a.effects = []; a.disease = null; logParts.push('🧹 ' + a.name + ' limpo') })
      } else if (ef.id === 'revive' && deadAllies.length > 0) {
      } else if (ef.id.startsWith('blind') || ef.id.startsWith('prepare') || ef.id.startsWith('skill') || ef.id.startsWith('caution')) {
        aliveAllies.forEach(a => { const b = { ...ef, duration: 3, remaining: 3 }; a.buffs = a.buffs || []; a.buffs.push(b); logParts.push('✨ ' + a.name + ' ' + ef.name) })
      } else {
        aliveAllies.forEach(a => { applyEffect(a, { ...ef, duration: 3, remaining: 3 }); logParts.push('✨ ' + a.name + ' ' + ef.name) })
      }
    })
  }

  if (magicQueue.damageTier) {
    const tier = DAMAGE_TIERS.find(t => t.id === magicQueue.damageTier)
    const targetsToHit = magicQueue.area === 'all' ? aliveEnemies : magicQueue.area === 'two' ? aliveEnemies.slice(0, 2) : [aliveEnemies[0]]
    targetsToHit.forEach(t => {
      if (!t.alive) return
      const atkCheck = entityATK(caster)
      atkCheck.value += (caster.attrs.int - 3) + tier.atkMod
      const defCheck = entityDEF(t)
      defCheck.value += tier.defMod
      const diff = atkCheck.value - defCheck.value
      if (diff >= 0) {
        const raw = calcRawDamage(caster) + tier.dmgBonus
        const prot = calcDefenseValue(t, caster.weapon.dmgStat)
        const net = Math.max(0, raw + diff - prot)
        t.hp -= net
        if (t.hp <= 0) { t.hp = 0; t.alive = false }
        logParts.push('💥 ' + t.name + ' sofreu ' + net + ' dano mágico')
      } else {
        logParts.push('❌ ' + t.name + ' resistiu')
      }
    })
    if (magicQueue.effect && targetsToHit.length > 0) {
      targetsToHit.forEach(t => {
        if (!t.alive) return
        const chance = 0.30 + (castLogic(caster) ? 0.20 : 0)
        if (Math.random() < chance) {
          applyEffect(t, { ...magicQueue.effect, duration: 3, remaining: 3 })
          logParts.push('⚡ ' + t.name + ' ' + magicQueue.effect.name)
        }
      })
    }
  }

  logEntry(logParts.join(' | '), 'log-magic')
  clearMagicQueue()
  checkBattleEnd()
  if (battleActive) advanceTurn()
  else renderBattle()
}

function castLogic(caster) {
  return caster.attrs.int >= 10
}
function showItemPanel() {
  if (!currentActor || !currentActor.alive || !currentActor.inventory) return
  const panel = document.getElementById('item-panel')
  if (!panel) return
  panel.style.display = 'block'
  panel.innerHTML = '<div style=\"padding:10px;\"><h4 style=\"margin:0 0 10px 0;font-family:\'Cinzel\',serif;\">🎒 Itens</h4>'

  const consumables = ITEMS_CONSUMABLE.filter(i => (currentActor.inventory[i.id] || 0) > 0)
  if (consumables.length === 0) {
    panel.innerHTML += '<div style=\"font-size:.85rem;color:var(--muted);\">Nenhum item disponível.</div>'
  } else {
    consumables.forEach(i => {
      const qty = currentActor.inventory[i.id] || 0
      const btn = document.createElement('button')
      btn.className = 'btn btn-small'
      btn.textContent = i.name + ' (' + qty + 'x)'
      btn.onclick = function() { useItem(i); showItemPanel() }
      const desc = document.createElement('div')
      desc.style.fontSize = '.75rem'
      desc.style.color = 'var(--muted)'
      desc.textContent = i.desc
      const row = document.createElement('div')
      row.style.margin = '4px 0'
      row.appendChild(btn)
      row.appendChild(desc)
      panel.appendChild(row)
    })
  }
  
  if (isBowWeapon(currentActor.weapon)) {
    panel.innerHTML += '<hr style=\"border-color:var(--border);margin:8px 0;\"><div style=\"font-size:.85rem;margin-bottom:4px;\"><strong>Flechas Especiais</strong></div>'
    ARROWS.forEach(a => {
      const qty = currentActor.inventory[a.id] || 0
      if (qty <= 0) return
      const active = currentActor.preferredArrow === a.id
      const btn = document.createElement('button')
      btn.className = 'btn btn-small ' + (active ? 'btn-gold' : '')
      btn.textContent = a.name + ' (' + qty + 'x)'
      btn.onclick = function() {
        currentActor.preferredArrow = currentActor.preferredArrow === a.id ? null : a.id
        showItemPanel()
      }
      const desc = document.createElement('div')
      desc.style.fontSize = '.75rem'
      desc.style.color = 'var(--muted)'
      desc.textContent = a.desc
      const row = document.createElement('div')
      row.style.margin = '4px 0'
      row.appendChild(btn)
      row.appendChild(desc)
      panel.appendChild(row)
    })
  }

  const closeBtn = document.createElement('button')
  closeBtn.className = 'btn'
  closeBtn.textContent = 'Fechar'
  closeBtn.style.marginTop = '8px'
  closeBtn.onclick = function() { panel.style.display = 'none'; renderBattle() }
  panel.appendChild(closeBtn)
}

function useItem(item) {
  if (!currentActor || !currentActor.alive || !currentActor.inventory) return
  const qty = currentActor.inventory[item.id] || 0
  if (qty <= 0) return
  
  currentActor.inventory[item.id]--
  
  if (item.type === 'heal_hp' && item.dice) {
    const heal = rollDice(item.dice)
    currentActor.hp = Math.min(currentActor.maxHP, currentActor.hp + heal)
    logEntry('💚 ' + currentActor.name + ' usou ' + item.name + ' curou ' + heal + ' HP (' + currentActor.hp + '/' + currentActor.maxHP + ')', 'log-heal')
  } else if (item.type === 'heal_mp' && item.dice) {
    const heal = rollDice(item.dice)
    currentActor.mp = Math.min(currentActor.maxMP, currentActor.mp + heal)
    logEntry('💙 ' + currentActor.name + ' usou ' + item.name + ' curou ' + heal + ' MP (' + currentActor.mp + '/' + currentActor.maxMP + ')', 'log-heal')
  } else if (item.type === 'cure' && item.removes) {
    const before = (currentActor.effects || []).length
    currentActor.effects = (currentActor.effects || []).filter(e => !item.removes.includes(e.id) && !item.removes.some(r => e.id.startsWith(r)))
    if (item.removes.includes('poison') || item.removes.some(r => r.startsWith('poison'))) {
      currentActor.effects = currentActor.effects.filter(e => !e.id.startsWith('poison'))
    }
    if (item.removes.some(r => r.startsWith('disease'))) currentActor.disease = null
    const after = (currentActor.effects || []).length
    logEntry('💊 ' + currentActor.name + ' usou ' + item.name + ' (removeu ' + (before - after) + ' efeitos negativos)', 'log-heal')
  } else if (item.type === 'revive') {
    const deadAllies = combatants.filter(c => c.side === 'player' && !c.alive)
    if (deadAllies.length > 0) {
      const target = deadAllies[0]
      target.alive = true
      target.hp = 1
      logEntry('✨ ' + currentActor.name + ' reviveu ' + target.name + ' com Café Forte!', 'log-heal')
    }
  }
}
function enemyTurn() {
  if (!battleActive || !currentActor || !currentActor.alive) return
  const enemy = currentActor
  const targets = combatants.filter(c => c.side === 'player' && c.alive)
  if (targets.length === 0) { checkBattleEnd(); return }

  if (hasAnyParalyze(enemy)) {
    if (enemy.paralyzedThisRound) {
      logEntry('⚡ ' + enemy.name + ' está paralisado e perdeu o turno!', 'log-status')
      if (battleActive) advanceTurn()
      return
    }
  }

  const totalPoints = totalAttrPoints(enemy)
  const isBoss = totalPoints >= 12
  const weaponIsHealing = isCajadoWeapon(enemy.weapon)
  const healthPct = enemy.hp / enemy.maxHP

  if (isBoss && healthPct < 0.30 && Math.random() < 0.50) {
    const heal = rollDice(10) + 5
    enemy.hp = Math.min(enemy.maxHP, enemy.hp + heal)
    logEntry('🔮 ' + enemy.name + ' se curou (' + heal + ' HP)!', 'log-enemy')
    if (battleActive) advanceTurn()
    return
  }

  const target = targets.reduce((a, b) => a.hp < b.hp ? a : b)
  const atkCheck = entityATK(enemy)
  const defCheck = entityDEF(target)
  const diff = atkCheck.value - defCheck.value

  if (diff >= 0) {
    const raw = calcRawDamage(enemy)
    const prot = calcDefenseValue(target, enemy.weapon.dmgStat)
    const net = Math.max(0, raw + (enemy.attrs.for > 5 ? 2 : 0) - prot)
    target.hp -= net
    if (target.hp <= 0) { target.hp = 0; target.alive = false }
    logEntry('⚔️ ' + enemy.name + ' atacou ' + target.name + ' causando ' + net + ' dano!', 'log-enemy')

    if (enemy.weapon.id === 'espada_bastarda' && Math.random() < 0.20 && target.alive) {
      applyBleed(target); logEntry('🩸 ' + target.name + ' sangrando!', 'log-enemy')
    }
    if (enemy.weapon.id === 'adaga' && Math.random() < 0.30 && target.alive) {
      applyBleed(target); logEntry('🩸 ' + target.name + ' sangrando!', 'log-enemy')
    }
  } else {
    logEntry('⚔️ ' + enemy.name + ' atacou ' + target.name + ' e errou!', 'log-enemy')
  }

  target.testedAttrs = target.testedAttrs || new Set()
  target.testedAttrs.add(ATK_VS_DEF_ATTR[enemy.weapon.atkAttr])

  checkBattleEnd()
  setTimeout(function() { if (battleActive) advanceTurn() }, 400)
}
function logEntry(text, cls) {
  const log = document.getElementById('battle-log')
  if (!log) return
  const entry = document.createElement('div')
  entry.className = 'log-entry' + (cls ? ' ' + cls : '')
  entry.textContent = text
  log.appendChild(entry)
  log.scrollTop = log.scrollHeight
}

function showEndButtons(victory) {
  const actionBar = document.getElementById('action-bar')
  if (!actionBar) return
  actionBar.innerHTML = '<div style=\"padding:12px;text-align:center;\">' +
    '<div style=\"font-size:1.5rem;font-family:\'Cinzel\',serif;margin-bottom:10px;color:' + (victory ? 'var(--gold)' : 'var(--hp-light)') + ';\">' + (victory ? '⚔️ Vitória!' : '💀 Derrota') + '</div>' +
    '<button class=\"btn btn-gold\" onclick=\"restartGame()\">🔄 Nova Batalha</button>' +
    '<button class=\"btn\" onclick=\"showScreen(\'screen-creation\')\" style=\"margin-left:8px;\">🔄 Recriar Personagem</button>' +
    '</div>'
}

function restartGame() {
  clearMagicQueue()
  battleActive = false
  pendingAction = null
  currentActor = null
  const r = Math.floor(Math.random() * ENEMY_TEMPLATES.length)
  const enemyTemplates = [ENEMY_TEMPLATES[r], ENEMY_TEMPLATES[(r+1)%ENEMY_TEMPLATES.length], ENEMY_TEMPLATES[(r+2)%ENEMY_TEMPLATES.length]]
  const newEnemies = enemyTemplates.map((t, i) => makeCombatant(t, 'enemy', 'enemy' + (i+1), false))
  ;[player, ...combatants.filter(c => c.side === 'player')].forEach(c => {
    c.hp = c.maxHP
    c.mp = c.maxMP
    c.alive = true
    c.effects = []
    c.buffs = []
    c.paralyzedRoundRolled = false
    c.paralyzedThisRound = false
    c.testedAttrs = new Set()
    c.comboStage = 1
  })
  const playerSide = [player, ...combatants.filter(c => c.side === 'player' && c.id !== 'player')]
  combatants = [...playerSide, ...newEnemies]
  document.getElementById('battle-log').innerHTML = ''
  buildMainScreen()
  showScreen('screen-main')
}

window.changeAttr = changeAttr
window.toggleAlly = toggleAlly
window.confirmCreation = confirmCreation
window.showScreen = showScreen
window.showTab = showTab
window.restartGame = restartGame
function getHTML() {
  return '<div class=\"srgrm-root\"><div id=\"screen-creation\" class=\"screen active\"><div style=\"padding:16px;\"><h2 class=\"gold-title\">Sistema RPG 3v3</h2><div id=\"attr-builder\" class=\"attr-grid\" style=\"margin:16px 0;\"></div><div style=\"display:flex;gap:16px;margin:8px 0;\"><span>HP: <span id=\"preview-hp\">10</span></span><span>MP: <span id=\"preview-mp\">5</span></span><span>Classe: <span id=\"preview-class\">Híbrido</span></span><strong>Pontos restantes: <span id=\"pts-left\">8</span></strong></div><button class=\"btn btn-gold\" id=\"btn-confirm\" onclick=\"confirmCreation()\" style=\"margin:8px 0;\">⚔️ Iniciar Batalha</button><details style=\"margin:12px 0;\"><summary style=\"cursor:pointer;font-family:\'Cinzel\',serif;font-size:.9rem;\">⚔️ Arma</summary><div id=\"weapon-selector\" style=\"display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;\"></div></details><details style=\"margin:12px 0;\"><summary style=\"cursor:pointer;font-family:\'Cinzel\',serif;font-size:.9rem;\">🛡️ Armadura</summary><div id=\"armor-selector\" style=\"display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;\"></div></details><details style=\"margin:12px 0;\"><summary style=\"cursor:pointer;font-family:\'Cinzel\',serif;font-size:.9rem;\">👥 Aliados (selecione 2)</summary><div id=\"ally-selector\" style=\"display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;\"></div></details></div></div><div id=\"screen-main\" class=\"screen\"><div style=\"padding:8px;\"><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px;\"><button class=\"nav-tab active\" id=\"tab-btn-sheet\" onclick=\"showTab(\'tab-sheet\')\">📋 Ficha</button><button class=\"nav-tab\" id=\"tab-btn-tests\" onclick=\"showTab(\'tab-tests\')\">🎲 Testes</button><button class=\"nav-tab\" id=\"tab-btn-battle\" onclick=\"showTab(\'tab-battle\')\">⚔️ Batalha</button></div><div id=\"tab-sheet\" class=\"tab-content\"><h4 class=\"gold-title\" style=\"margin:4px 0;\">' + (window.player?.name || 'Aventureiro') + '</h4><div id=\"sheet-attrs\" class=\"attr-grid\" style=\"margin:8px 0;\"></div><div id=\"sheet-bars\" style=\"margin:8px 0;\"></div></div><div id=\"tab-tests\" class=\"tab-content\" style=\"display:none;\"><div id=\"test-buttons\" class=\"attr-grid\" style=\"margin:8px 0;\"></div><div id=\"test-result\" style=\"display:none;text-align:center;padding:12px;margin:8px 0;background:var(--surface);border:1px solid var(--border);border-radius:8px;\"></div></div><div id=\"tab-battle\" class=\"tab-content\" style=\"display:none;\"><div style=\"display:flex;justify-content:space-between;align-items:center;margin:6px 0;\"><strong>⚔️ Rodada: <span id=\"round-count\">0</span></strong></div><div id=\"battlefield\" class=\"battlefield\" style=\"margin:8px 0;\"></div><div id=\"action-bar\" style=\"margin:6px 0;\"></div><div id=\"magic-panel\" class=\"panel-overlay\" style=\"display:none;\"></div><div id=\"item-panel\" class=\"panel-overlay\" style=\"display:none;\"></div></div><div id=\"battle-log\" class=\"log-container\" style=\"margin:8px 0;\"></div></div></div></div>'
}
export function setupGame(rootEl) {
  rootEl.innerHTML = getHTML()
  renderCreation()
}

export function teardownGame(rootEl) {
  battleActive = false
  currentActor = null
  pendingAction = null
  turnOrder = []
  combatants = []
  clearMagicQueue()
  rootEl.innerHTML = ''
}
