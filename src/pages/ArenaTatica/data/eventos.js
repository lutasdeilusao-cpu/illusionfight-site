/**
 * ARENA TÁTICA — Pool de Eventos de Batalha
 * Um evento aleatório a cada 3 rodadas
 */

export const EVENTOS = [
  {
    id: 'sinal_yohu',
    nome: 'Sinal Yohu',
    desc: 'Sinal Yohu interferindo — Energia Mental regenera +20% esta rodada.',
    desc_en: 'Yohu signal interfering — Mental Energy regenerates +20% this round.',
    efeito: { tipo: 'buff', alvo: 'todos', energia_bonus: 0.2 },
  },
  {
    id: 'terremoto',
    nome: 'Terremoto',
    desc: 'Terremoto na arena — obstrução cria nova coluna no grid.',
    desc_en: 'Earthquake in the arena — obstruction creates a new column in the grid.',
    efeito: { tipo: 'grid', acao: 'criar_obstrucao' },
  },
  {
    id: 'tempestade_elemental',
    nome: 'Tempestade Elemental',
    desc: 'Tempestade elemental — personagens de Fogo recebem -15% de dano.',
    desc_en: 'Elemental storm — Fire characters receive -15% damage.',
    efeito: { tipo: 'buff', alvo: 'elemental', elemental: 'fogo', dano_bonus: -0.15 },
  },
  {
    id: 'modo_xama',
    nome: 'Modo Xamã',
    desc: 'Modo Xamã ativado — próxima skill Armas é gratuita.',
    desc_en: 'Shaman Mode activated — next Weapons skill is free.',
    efeito: { tipo: 'buff', alvo: 'aliados', skill_gratis: 'armas' },
  },
  {
    id: 'nevoa_venenosa',
    nome: 'Névoa Venenosa',
    desc: 'Névoa venenosa cobre a arena — todos recebem dano leve (5% HP) no início do turno.',
    desc_en: 'Poison mist covers the arena — everyone takes light damage (5% HP) at turn start.',
    efeito: { tipo: 'dano_per_turno', valor: 0.05 },
  },
  {
    id: 'arena_sagrada',
    nome: 'Arena Sagrada',
    desc: 'Arena Sagrada — curas são 30% mais eficientes esta rodada.',
    desc_en: 'Sacred Arena — heals are 30% more efficient this round.',
    efeito: { tipo: 'buff', alvo: 'todos', cura_bonus: 0.3 },
  },
  {
    id: 'escuridao_total',
    nome: 'Escuridão Total',
    desc: 'Escuridão total — precisão de ataques a distância reduzida em 30%.',
    desc_en: 'Total darkness — ranged attack precision reduced by 30%.',
    efeito: { tipo: 'debuff', alvo: 'todos', precisao_penalidade: -0.3 },
  },
  {
    id: 'furia_ancestral',
    nome: 'Fúria Ancestral',
    desc: 'Fúria ancestral — skills de Mãos Livres causam +25% dano.',
    desc_en: 'Ancestral fury — Hand-to-Hand skills deal +25% damage.',
    efeito: { tipo: 'buff', alvo: 'aliados', tipo_skill: 'fisico', dano_bonus: 0.25 },
  },
  {
    id: 'escudo_protetor',
    nome: 'Escudo Protetor',
    desc: 'Escudo protetor — todos os aliados recebem -20% dano por 1 turno.',
    desc_en: 'Protective shield — all allies receive -20% damage for 1 turn.',
    efeito: { tipo: 'buff', alvo: 'aliados', dano_bonus: -0.2 },
  },
  {
    id: 'dreno_mental',
    nome: 'Dreno Mental',
    desc: 'Dreno mental — Energia Mental de todos os personagens cai em 30%.',
    desc_en: 'Mental drain — all characters\' Mental Energy drops by 30%.',
    efeito: { tipo: 'debuff', alvo: 'todos', energia_penalidade: -0.3 },
  },
]

export function getEventoAleatorio(eventosUsados = []) {
  const disponiveis = EVENTOS.filter(e => !eventosUsados.includes(e.id))
  if (disponiveis.length === 0) return EVENTOS[Math.floor(Math.random() * EVENTOS.length)]
  return disponiveis[Math.floor(Math.random() * disponiveis.length)]
}
