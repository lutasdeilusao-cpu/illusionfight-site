// A campanha da luta rítmica: os inimigos do Lendas em ordem, do mais fácil ao
// mais difícil. Cada um define o ritmo e o jeito de brigar:
//   vida (do inimigo), bpm, niveis (de quais níveis de frase rítmica ele tira as
//   sequências, ver FRASES em LutaRitmo.jsx), golpes (o que VOCÊ ataca, com peso)
//   e defesas (o que ELE manda pra você defender: bloqueio ✋ ou esquiva 💨, com
//   peso; os grupos alternam: um seu, um dele, e às vezes `defesaPeso` dá dois dele seguidos).
// O primeiro é o treino: lento e com pouca nota. Cada luta sobe um degrau.
//   musica: a faixa da luta (uma por inimigo, já cortada no começo). O bpm dele É o
//   da música; `entrada` (s) é a batida em que o beat entra: a 1ª nota cai ali, e
//   quando a música acaba ela recomeça e a luta espera de novo até a entrada.
//   Medidos no próprio arquivo, batida por batida.
//   superDele: a cada `cada` frases ele solta um super; você defende as `notas`
//   (vermelhas) e toma `dano` × a fração que deixou passar.
// Nomes e falas no i18n (games.ldi.batalha.inimigos.<id>).
import luta01 from './musica/luta-01.mp3?url'
import luta02 from './musica/luta-02.mp3?url'
import luta03 from './musica/luta-03.mp3?url'
import luta04 from './musica/luta-04.mp3?url'
import luta05 from './musica/luta-05.mp3?url'
import luta06 from './musica/luta-06.mp3?url'
import luta07 from './musica/luta-07.mp3?url'
import luta08 from './musica/luta-08.mp3?url'
// (a 02 e a 04 batem em 154 e 141; a luta anda na metade, senão as notas grudam)
// Toda música toca um pouco acelerada (VELOCIDADE); o bpm da luta acompanha.
const VELOCIDADE = 1.08
const MUSICAS = {
  // a 01 bate a 100, mas o golpe segue o pulso de 50 (um a cada 1,2 s), marcado pelo Isaias no arquivo
  1: { url: luta01, bpm: 99.983 / 2, entrada: 6.017 },
  2: { url: luta02, bpm: 154.414 / 2, entrada: 2.855 },
  3: { url: luta03, bpm: 97.996, entrada: 6.201 },
  4: { url: luta04, bpm: 141.325 / 2, entrada: 9.201 },
  5: { url: luta05, bpm: 119.895, entrada: 9.867 },
  6: { url: luta06, bpm: 111.999, entrada: 10.166 },
  7: { url: luta07, bpm: 110.65, entrada: 5.755 },
  8: { url: luta08, bpm: 99.998, entrada: 8.598 },
}

export const INIMIGOS = [
  { id: 1, vida: 120, musica: { ...MUSICAS[1], velocidade: VELOCIDADE }, bpm: MUSICAS[1].bpm * VELOCIDADE, niveis: [1], defesaPeso: 0.2,
    // 2 golpes no beat, 2 de descanso, 2 golpes (beats 1-2 e 5-6 de cada frase)
    frases: [[2, 4, 10, 12]],
    golpes: { soco: 2, chute: 1, cabecada: 1 }, defesas: { bloqueio: 1 } },
  { id: 2, vida: 240, musica: { ...MUSICAS[2], velocidade: VELOCIDADE }, bpm: MUSICAS[2].bpm * VELOCIDADE, niveis: [1, 2], defesaPeso: 0.25,
    golpes: { soco: 2, chute: 1, cabecada: 1 }, defesas: { bloqueio: 1 } },
  { id: 3, vida: 280, musica: { ...MUSICAS[3], velocidade: VELOCIDADE }, bpm: MUSICAS[3].bpm * VELOCIDADE, niveis: [1, 2], defesaPeso: 0.28,
    golpes: { soco: 2, chute: 2, cabecada: 1 }, defesas: { bloqueio: 2, esquiva: 2 } },
  { id: 4, vida: 320, musica: { ...MUSICAS[4], velocidade: VELOCIDADE }, bpm: MUSICAS[4].bpm * VELOCIDADE, niveis: [2], defesaPeso: 0.3,
    golpes: { soco: 2, chute: 2, cabecada: 1 }, defesas: { bloqueio: 2, esquiva: 1 } },
  { id: 5, vida: 360, musica: { ...MUSICAS[5], velocidade: VELOCIDADE }, bpm: MUSICAS[5].bpm * VELOCIDADE, superDele: { cada: 6, notas: [0, 2, 4, 6], dano: 22 }, niveis: [2, 3], defesaPeso: 0.32,
    golpes: { soco: 2, chute: 2, cabecada: 1 }, defesas: { bloqueio: 2, esquiva: 2 } },
  { id: 6, vida: 440, musica: { ...MUSICAS[6], velocidade: VELOCIDADE }, bpm: MUSICAS[6].bpm * VELOCIDADE, superDele: { cada: 5, notas: [0, 2, 4, 5, 6], dano: 26 }, niveis: [2, 3], defesaPeso: 0.35,
    golpes: { soco: 1, chute: 2, cabecada: 2 }, defesas: { bloqueio: 3, esquiva: 1 } },
  { id: 7, vida: 440, musica: { ...MUSICAS[7], velocidade: VELOCIDADE }, bpm: MUSICAS[7].bpm * VELOCIDADE, superDele: { cada: 5, notas: [0, 2, 3, 4, 6], dano: 30 }, niveis: [3, 4], defesaPeso: 0.38,
    golpes: { soco: 2, chute: 1, cabecada: 2 }, defesas: { bloqueio: 1, esquiva: 3 } },
  { id: 8, vida: 520, musica: { ...MUSICAS[8], velocidade: VELOCIDADE }, bpm: MUSICAS[8].bpm * VELOCIDADE, superDele: { cada: 4, notas: [0, 1, 2, 4, 5, 6], dano: 34 }, niveis: [3, 4], defesaPeso: 0.4,
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
