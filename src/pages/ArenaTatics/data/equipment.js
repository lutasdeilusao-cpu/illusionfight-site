/**
 * EQUIPAMENTOS — Arena LDI Tatics
 * Cada personagem pode equipar 1 Arma, 1 Armadura, 1 Acessório
 */

export const ARMES = [
  { id: 'espada_curta',  nome: 'Espada Curta',  tipo: 'arma',    atq: 3,  def: 0,  crit: 2,  desc: 'Lâmina leve e rápida' },
  { id: 'machado_pesado',nome: 'Machado Pesado',tipo: 'arma',    atq: 6,  def: 0,  crit: 0,  desc: 'Golpes brutais' },
  { id: 'adaga_dupla',   nome: 'Adaga Dupla',   tipo: 'arma',    atq: 2,  def: 0,  crit: 5,  desc: 'Ataques precisos' },
  { id: 'lança_longa',   nome: 'Lança Longa',   tipo: 'arma',    atq: 4,  def: 1,  crit: 1,  desc: 'Alcance e versatilidade' },
  { id: 'cajado_arcano', nome: 'Cajado Arcano', tipo: 'arma',    atq: 5,  def: 0,  crit: 3,  desc: 'Canaliza energia elemental' },
  { id: 'martelo_guerra',nome: 'Martelo de Guerra',tipo: 'arma', atq: 7,  def: 0,  crit: 0,  desc: 'Esmaga armaduras' },
  { id: 'arco_longo',    nome: 'Arco Longo',    tipo: 'arma',    atq: 3,  def: 0,  crit: 4,  desc: 'Fogo preciso à distância' },
  { id: 'katana',        nome: 'Katana',        tipo: 'arma',    atq: 5,  def: 0,  crit: 6,  desc: 'Corte letal' },
]

export const ARMADURAS = [
  { id: 'armadura_couro',  nome: 'Armadura de Couro',  tipo: 'armadura', atq: 0, def: 3,  desc: 'Leve e flexível' },
  { id: 'cota_malha',     nome: 'Cota de Malha',     tipo: 'armadura', atq: 0, def: 5,  desc: 'Proteção equilibrada' },
  { id: 'armadura_platina',nome: 'Armadura de Platina',tipo: 'armadura', atq: 0, def: 8,  desc: 'Máxima proteção' },
  { id: 'manto_sombrio',  nome: 'Manto Sombrio',    tipo: 'armadura', atq: 2, def: 1,  desc: 'Sacrifica defesa por ataque' },
  { id: 'armadura_ossea', nome: 'Armadura Óssea',   tipo: 'armadura', atq: 1, def: 6,  desc: 'Resistência natural' },
]

export const ACESSORIOS = [
  { id: 'anel_forca',     nome: 'Anel da Força',    tipo: 'acessorio', atq: 3, def: 0,  desc: 'Aumenta poder de ataque' },
  { id: 'amuleto_defesa', nome: 'Amuleto de Defesa',tipo: 'acessorio', atq: 0, def: 3,  desc: 'Campo de proteção' },
  { id: 'bracelete_crit', nome: 'Bracelete Crítico',tipo: 'acessorio', atq: 0, def: 0,  crit: 4, desc: 'Aumenta chance crítico' },
  { id: 'colar_vida',     nome: 'Colar da Vida',    tipo: 'acessorio', atq: 0, def: 0,  hp: 30, desc: 'Aumenta HP máximo' },
  { id: 'foco_arcano',    nome: 'Foco Arcano',      tipo: 'acessorio', atq: 4, def: 0,  desc: 'Amplifica energia' },
  { id: 'escudo_menor',   nome: 'Escudo Menor',     tipo: 'acessorio', atq: 0, def: 5,  desc: 'Defesa extra' },
]

export function getAllEquipamentos() {
  return [...ARMES, ...ARMADURAS, ...ACESSORIOS]
}

export function getEquipamento(id) {
  return getAllEquipamentos().find(e => e.id === id) || null
}

/**
 * Retorna os bônus acumulados de todos os equipamentos de um personagem
 */
export function calcularBonus(equipamento) {
  const bonus = { atq: 0, def: 0, crit: 0, hp: 0 }
  if (!equipamento) return bonus
  Object.values(equipamento).forEach(eq => {
    if (!eq) return
    bonus.atq += eq.atq || 0
    bonus.def += eq.def || 0
    bonus.crit += eq.crit || 0
    bonus.hp += eq.hp || 0
  })
  return bonus
}
