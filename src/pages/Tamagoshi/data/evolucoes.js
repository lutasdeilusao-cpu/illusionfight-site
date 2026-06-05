export const ESTAGIOS = [
  {
    nivel: 0,
    nome: 'Ovo',
    desc: 'um ovo misterioso pulsando com energia',
    diasParaEvoluir: 0,
  },
  {
    nivel: 1,
    nome: 'Filhote',
    desc: 'pequeno, curioso, aprendendo a confiar',
    diasParaEvoluir: 3,
    condicao: { fomeMin: 60, humorMin: 60 },
  },
  {
    nivel: 2,
    nome: 'Adulto',
    desc: 'maduro, com personalidade bem definida',
    diasParaEvoluir: 7,
    condicao: { fomeMin: 50, humorMin: 50 },
  },
  {
    nivel: 3,
    nome: 'Ancião',
    desc: 'sábio, calmo, cicatrizes de muitas histórias',
    diasParaEvoluir: null,
    condicao: { fomeMin: 40, humorMin: 40, streakMin: 10 },
  },
]

export const VARIANTES = {
  normal: { nome: 'Comum', desc: 'aparência padrão' },
  brilhante: { nome: 'Brilhante', desc: 'cores mais vivas, brilho sutil' },
  sombria: { nome: 'Sombria', desc: 'tons escuros, aura misteriosa' },
  celestial: { nome: 'Celestial', desc: 'luz própria, partículas flutuantes' },
}
