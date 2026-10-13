// A campanha da luta rítmica: os inimigos do Lendas em ordem, do mais fácil ao
// mais difícil. Cada um define o ritmo e o jeito de brigar:
//   vida (do inimigo), bpm, niveis (de quais níveis de frase rítmica ele tira as
//   sequências, ver FRASES em LutaRitmo.jsx), golpes (o que VOCÊ ataca, com peso)
//   e defesas (o que ELE manda pra você defender: bloqueio ✋ ou esquiva 💨, com
//   peso; os grupos alternam: um seu, um dele, e às vezes `defesaPeso` dá dois dele seguidos).
// O primeiro é o treino: lento e com pouca nota. Cada luta sobe um degrau.
//   musica: a faixa da luta, uma por inimigo, cada uma mais rápida que a anterior.
//   O bpm dele É o da música; `entrada` (s) é a batida em que o groove entra
//   (depois da introdução): a 1ª nota cai ali. Medidos no próprio arquivo.
//   superDele: a cada `cada` frases ele solta um super; você defende as `notas`
//   (vermelhas) e toma `dano` × a fração que deixou passar.
// Nomes e falas no i18n (games.ldi.batalha.inimigos.<id>).
// Músicas: Kevin MacLeod (incompetech.com), CC BY 4.0 — créditos também na tela do laboratório.
import fretless from './musica/fretless.mp3?url'
import funkorama from './musica/funkorama.mp3?url'
import cutAndRun from './musica/cut-and-run.mp3?url'
import koolKats from './musica/kool-kats.mp3?url'
import discoMedusae from './musica/disco-medusae.mp3?url'
import hustle from './musica/hustle.mp3?url'
import localForecast from './musica/local-forecast.mp3?url'
import showYourMoves from './musica/show-your-moves.mp3?url'
const MUSICAS = {
  1: { url: fretless, bpm: 100, entrada: 0.025 },
  2: { url: funkorama, bpm: 101, entrada: 7.450 },
  3: { url: cutAndRun, bpm: 107, entrada: 0.024 },
  4: { url: koolKats, bpm: 113, entrada: 0.025 },
  5: { url: discoMedusae, bpm: 115, entrada: 4.218 },
  6: { url: hustle, bpm: 120, entrada: 0.278 },
  7: { url: localForecast, bpm: 124, entrada: 0.033 },
  8: { url: showYourMoves, bpm: 136, entrada: 13.701 },
}

export const INIMIGOS = [
  { id: 1, vida: 60, musica: MUSICAS[1], bpm: MUSICAS[1].bpm, niveis: [1], defesaPeso: 0.2,
    golpes: { soco: 1 }, defesas: { bloqueio: 1 } },
  { id: 2, vida: 120, musica: MUSICAS[2], bpm: MUSICAS[2].bpm, niveis: [1, 2], defesaPeso: 0.25,
    golpes: { soco: 2, chute: 1 }, defesas: { bloqueio: 1 } },
  { id: 3, vida: 140, musica: MUSICAS[3], bpm: MUSICAS[3].bpm, niveis: [1, 2], defesaPeso: 0.28,
    golpes: { soco: 2, chute: 2, cabecada: 1 }, defesas: { bloqueio: 2, esquiva: 2 } },
  { id: 4, vida: 160, musica: MUSICAS[4], bpm: MUSICAS[4].bpm, niveis: [2], defesaPeso: 0.3,
    golpes: { soco: 2, chute: 2, cabecada: 1 }, defesas: { bloqueio: 2, esquiva: 1 } },
  { id: 5, vida: 180, musica: MUSICAS[5], bpm: MUSICAS[5].bpm, superDele: { cada: 6, notas: [0, 2, 4, 6], dano: 22 }, niveis: [2, 3], defesaPeso: 0.32,
    golpes: { soco: 2, chute: 2, cabecada: 1 }, defesas: { bloqueio: 2, esquiva: 2 } },
  { id: 6, vida: 220, musica: MUSICAS[6], bpm: MUSICAS[6].bpm, superDele: { cada: 5, notas: [0, 2, 4, 5, 6], dano: 26 }, niveis: [2, 3], defesaPeso: 0.35,
    golpes: { soco: 1, chute: 2, cabecada: 2 }, defesas: { bloqueio: 3, esquiva: 1 } },
  { id: 7, vida: 220, musica: MUSICAS[7], bpm: MUSICAS[7].bpm, superDele: { cada: 5, notas: [0, 2, 3, 4, 6], dano: 30 }, niveis: [3, 4], defesaPeso: 0.38,
    golpes: { soco: 2, chute: 1, cabecada: 2 }, defesas: { bloqueio: 1, esquiva: 3 } },
  { id: 8, vida: 260, musica: MUSICAS[8], bpm: MUSICAS[8].bpm, superDele: { cada: 4, notas: [0, 1, 2, 4, 5, 6], dano: 34 }, niveis: [3, 4], defesaPeso: 0.4,
    golpes: { soco: 2, chute: 2, cabecada: 2 }, defesas: { bloqueio: 2, esquiva: 2 } },
]

// Os poderes do SUPER. Cada um é uma virada de bateria: `virada` são as notas em
// semicolcheias (0 = cabeça da virada; 1 = um quarto de batida depois). Quanto mais
// nota e mais seguida, mais difícil e mais forte. O efeito sai proporcional às notas
// acertadas: acertou 3 de 4, sai 75% do poder.
//   dano: tira do inimigo · cura: devolve sua vida · atordoa: ms em que ele não ataca
// Nenhum super tira mais que TETO_SUPER da vida cheia de quem apanha (o seu nem o dele).
export const TETO_SUPER = 0.35

export const PODERES = {
  rajada: { virada: [0, 2, 4, 6], dano: 40 },
  folego: { virada: [0, 2, 3, 4], cura: 35 },
  geloNegro: { virada: [0, 1, 2, 4, 6], dano: 25, atordoa: 6000 },
  choque: { virada: [0, 1, 2, 3, 4, 6], dano: 60 },
  furia: { virada: [0, 1, 2, 3, 4, 6, 8], dano: 90 },
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
