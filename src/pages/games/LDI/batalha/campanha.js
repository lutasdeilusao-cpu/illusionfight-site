// A campanha da luta rítmica: os inimigos do Lendas em ordem, do mais fácil ao
// mais difícil. Cada um define o ritmo e o jeito de brigar:
//   vida (do inimigo), bpm, densidade (chance de cair nota numa batida, no começo
//   da luta), sobe (quanto a densidade cresce por frase, até `teto`), golpes (o
//   que VOCÊ ataca, com peso) e defesas (o que ELE manda pra você defender:
//   bloqueio ✋ ou esquiva 💨, com peso; `defesaPeso` = fração das notas que são dele).
// O primeiro é o treino: lento, pouca nota, só soco e bloqueio, pra aprender.
// Nomes e falas no i18n (games.ldi.batalha.inimigos.<id>).
export const INIMIGOS = [
  { id: 1, vida: 90, bpm: 78, densidade: 0.22, sobe: 0.01, teto: 0.3, defesaPeso: 0.25,
    golpes: { soco: 1 }, defesas: { bloqueio: 1 } },
  { id: 2, vida: 120, bpm: 84, densidade: 0.28, sobe: 0.015, teto: 0.38, defesaPeso: 0.3,
    golpes: { soco: 3, chute: 1 }, defesas: { bloqueio: 1 } },
  { id: 3, vida: 140, bpm: 88, densidade: 0.3, sobe: 0.02, teto: 0.42, defesaPeso: 0.32,
    golpes: { soco: 2, chute: 2 }, defesas: { bloqueio: 3, esquiva: 1 } },
  { id: 4, vida: 160, bpm: 92, densidade: 0.32, sobe: 0.02, teto: 0.46, defesaPeso: 0.35,
    golpes: { soco: 2, chute: 2, cabecada: 1 }, defesas: { bloqueio: 2, esquiva: 1 } },
  { id: 5, vida: 180, bpm: 96, densidade: 0.34, sobe: 0.025, teto: 0.5, defesaPeso: 0.38,
    golpes: { soco: 2, chute: 2, cabecada: 1 }, defesas: { bloqueio: 2, esquiva: 2 } },
  { id: 6, vida: 220, bpm: 100, densidade: 0.36, sobe: 0.025, teto: 0.52, defesaPeso: 0.42,
    golpes: { soco: 1, chute: 2, cabecada: 2 }, defesas: { bloqueio: 3, esquiva: 1 } },
  { id: 7, vida: 220, bpm: 106, densidade: 0.38, sobe: 0.03, teto: 0.55, defesaPeso: 0.42,
    golpes: { soco: 2, chute: 1, cabecada: 2 }, defesas: { bloqueio: 1, esquiva: 3 } },
  { id: 8, vida: 260, bpm: 112, densidade: 0.4, sobe: 0.03, teto: 0.58, defesaPeso: 0.45,
    golpes: { soco: 2, chute: 2, cabecada: 2 }, defesas: { bloqueio: 2, esquiva: 2 } },
]
