// A campanha da luta rítmica: os inimigos do Lendas em ordem, do mais fácil ao
// mais difícil. Cada um define o ritmo e o jeito de brigar:
//   vida (do inimigo), bpm, niveis (de quais níveis de frase rítmica ele tira as
//   sequências, ver FRASES em LutaRitmo.jsx), golpes (o que VOCÊ ataca, com peso)
//   e defesas (o que ELE manda pra você defender: bloqueio ✋ ou esquiva 💨, com
//   peso; os grupos alternam: um seu, um dele, e às vezes `defesaPeso` dá dois dele seguidos).
// O primeiro é o treino: lento e com pouca nota. Cada luta sobe um degrau.
// Nomes e falas no i18n (games.ldi.batalha.inimigos.<id>).
export const INIMIGOS = [
  { id: 1, vida: 60, bpm: 80, niveis: [1], defesaPeso: 0.2,
    golpes: { soco: 1 }, defesas: { bloqueio: 1 } },
  { id: 2, vida: 120, bpm: 84, niveis: [1, 2], defesaPeso: 0.25,
    golpes: { soco: 2, chute: 1 }, defesas: { bloqueio: 1 } },
  { id: 3, vida: 140, bpm: 88, niveis: [1, 2], defesaPeso: 0.28,
    golpes: { soco: 2, chute: 2, cabecada: 1 }, defesas: { bloqueio: 2, esquiva: 2 } },
  { id: 4, vida: 160, bpm: 92, niveis: [2], defesaPeso: 0.3,
    golpes: { soco: 2, chute: 2, cabecada: 1 }, defesas: { bloqueio: 2, esquiva: 1 } },
  { id: 5, vida: 180, bpm: 96, niveis: [2, 3], defesaPeso: 0.32,
    golpes: { soco: 2, chute: 2, cabecada: 1 }, defesas: { bloqueio: 2, esquiva: 2 } },
  { id: 6, vida: 220, bpm: 100, niveis: [2, 3], defesaPeso: 0.35,
    golpes: { soco: 1, chute: 2, cabecada: 2 }, defesas: { bloqueio: 3, esquiva: 1 } },
  { id: 7, vida: 220, bpm: 106, niveis: [3, 4], defesaPeso: 0.38,
    golpes: { soco: 2, chute: 1, cabecada: 2 }, defesas: { bloqueio: 1, esquiva: 3 } },
  { id: 8, vida: 260, bpm: 112, niveis: [3, 4], defesaPeso: 0.4,
    golpes: { soco: 2, chute: 2, cabecada: 2 }, defesas: { bloqueio: 2, esquiva: 2 } },
]

// Os poderes do SUPER. Cada um é uma virada de bateria: `virada` são as notas em
// semicolcheias (0 = cabeça da virada; 1 = um quarto de batida depois). Quanto mais
// nota e mais seguida, mais difícil e mais forte. O efeito sai proporcional às notas
// acertadas: acertou 3 de 4, sai 75% do poder.
//   dano: tira do inimigo · cura: devolve sua vida · atordoa: ms em que ele não ataca
export const PODERES = {
  rajada: { icone: '⚡', virada: [0, 2, 4, 6], dano: 40 },
  folego: { icone: '💚', virada: [0, 2, 3, 4], cura: 35 },
  geloNegro: { icone: '❄️', virada: [0, 1, 2, 4, 6], dano: 25, atordoa: 6000 },
  choque: { icone: '🌩️', virada: [0, 1, 2, 3, 4, 6], dano: 60 },
  furia: { icone: '🔥', virada: [0, 1, 2, 3, 4, 6, 8], dano: 90 },
}

// Quais poderes você leva em cada luta (pelo id do inimigo).
export const KIT = {
  1: ['rajada', 'folego'],
  2: ['rajada', 'folego', 'geloNegro'],
  3: ['rajada', 'folego', 'geloNegro'],
  4: ['rajada', 'folego', 'geloNegro', 'choque'],
  5: ['rajada', 'folego', 'geloNegro', 'choque'],
  6: ['folego', 'geloNegro', 'choque', 'furia'],
  7: ['folego', 'geloNegro', 'choque', 'furia'],
  8: ['folego', 'geloNegro', 'choque', 'furia'],
}
