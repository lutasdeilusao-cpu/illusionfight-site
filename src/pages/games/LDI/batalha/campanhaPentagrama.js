// A campanha do pentagrama: os inimigos do Lendas em ordem, do mais fácil ao
// mais difícil. Cada um define o que ELE faz e o kit que VOCÊ tem naquela luta:
//   vida, defende (chance de defender alguma coisa), defesaMax (1 ou 2 pontos),
//   leitura (aposta nos membros do seu último ataque), esquiva, espelho (repete o
//   seu combo), combos (o que ele ataca, com peso) e super (o poder dele: qual,
//   quantos pontos você tem que tocar pra defender, e quanto a barra enche por
//   batida; `poder: null` sorteia entre todos).
//   kit.golpes: quantos pontos você liga por batida. kit.poderes: os seus poderes.
// Nomes e falas no i18n (games.ldi.batalha.inimigos.<id>).
const JAB_DIRETO = ['maoE', 'maoD']

export const INIMIGOS = [
  {
    id: 1, vida: 30, defende: 0.45, defesaMax: 1, leitura: 0, esquiva: 0, espelho: 0,
    combos: [{ combo: ['maoE'], peso: 1 }, { combo: ['maoD'], peso: 1 }],
    super: null, kit: { golpes: 2, poderes: [] },
  },
  {
    id: 2, vida: 40, defende: 0.65, defesaMax: 1, leitura: 0.1, esquiva: 0, espelho: 0,
    combos: [{ combo: JAB_DIRETO, peso: 3 }, { combo: ['maoE'], peso: 1 }],
    super: null, kit: { golpes: 2, poderes: ['geloNegro'] },
  },
  {
    id: 3, vida: 50, defende: 0.8, defesaMax: 1, leitura: 0.2, esquiva: 0.03, espelho: 0,
    combos: [{ combo: JAB_DIRETO, peso: 3 }, { combo: ['maoD', 'peE'], peso: 2 }, { combo: ['peD'], peso: 1 }],
    super: null, kit: { golpes: 3, poderes: ['geloNegro'] },
  },
  {
    id: 4, vida: 60, defende: 0.85, defesaMax: 2, leitura: 0.3, esquiva: 0.05, espelho: 0.25,
    combos: [
      { combo: ['maoE', 'maoD', 'cotD'], peso: 3 }, { combo: JAB_DIRETO, peso: 2 },
      { combo: ['peE', 'joeE'], peso: 2 }, { combo: ['maoE', 'cotE', 'peD'], peso: 2 },
    ],
    super: { poder: 'choque', golpes: 3, porBatida: 12 }, kit: { golpes: 3, poderes: ['geloNegro', 'choque'] },
  },
  {
    id: 5, vida: 70, defende: 0.9, defesaMax: 2, leitura: 0.35, esquiva: 0.08, espelho: 0.3,
    combos: [
      { combo: ['cotD', 'joeD', 'cotE'], peso: 3 }, { combo: ['maoE', 'maoD', 'peD'], peso: 2 },
      { combo: ['peE', 'joeE', 'cotE'], peso: 2 }, { combo: ['cab', 'maoD'], peso: 1 },
    ],
    super: { poder: 'cegueira', golpes: 4, porBatida: 14 }, kit: { golpes: 4, poderes: ['geloNegro', 'choque', 'cegueira'] },
  },
  {
    id: 6, vida: 95, defende: 1, defesaMax: 2, leitura: 0.4, esquiva: 0.02, espelho: 0.2,
    combos: [
      { combo: ['joeD', 'cotD', 'joeE'], peso: 3 }, { combo: ['cab', 'cotE'], peso: 2 },
      { combo: ['peD', 'joeD', 'cab'], peso: 2 }, { combo: ['cotD', 'cotE', 'joeD'], peso: 2 },
    ],
    super: { poder: 'geloNegro', golpes: 4, porBatida: 15 }, kit: { golpes: 4, poderes: ['geloNegro', 'choque', 'cegueira'] },
  },
  {
    id: 7, vida: 85, defende: 1, defesaMax: 2, leitura: 0.5, esquiva: 0.12, espelho: 0.4,
    combos: [
      { combo: ['maoE', 'cotE', 'joeE'], peso: 3 }, { combo: ['peD', 'maoD', 'cab'], peso: 2 },
      { combo: ['cotD', 'peE', 'maoE'], peso: 2 }, { combo: ['joeD', 'joeE', 'cotD'], peso: 2 },
    ],
    super: { poder: 'cegueira', golpes: 5, porBatida: 18 }, kit: { golpes: 4, poderes: ['geloNegro', 'choque', 'cegueira'] },
  },
  {
    id: 8, vida: 120, defende: 1, defesaMax: 2, leitura: 0.6, esquiva: 0.1, espelho: 0.45,
    combos: [
      { combo: ['cab', 'joeD', 'cotE'], peso: 3 }, { combo: ['cotD', 'cotE', 'joeE'], peso: 3 },
      { combo: ['peE', 'cab', 'maoD'], peso: 2 }, { combo: ['joeE', 'maoE', 'joeD'], peso: 2 },
    ],
    super: { poder: null, golpes: 6, porBatida: 20 }, kit: { golpes: 4, poderes: ['geloNegro', 'choque', 'cegueira'] },
  },
]
