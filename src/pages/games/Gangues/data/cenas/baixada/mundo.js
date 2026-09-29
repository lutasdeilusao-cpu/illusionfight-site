// ── MUNDO da Baixada (geometria + cenário) ───────────────────────────
// Esqueleto da Pista na MESMA orientação (ruas, quarteirões, portas e zonas já
// validados lá: colisão, alcance, perseguidor). O que muda é a identidade:
// a Baixada fica "do outro lado da linha do trem" — concreto velho, azul de
// lona, o valão — e NÃO tem muro de gangue rival. No lugar dele, a LINHA DO
// TREM corta o mapa: de tempos em tempos o trem passa e fecha a travessia
// (ver TREM_BAIXADA e hooks/useGanguesTrem.js).
import { RUAS_PISTA, QUARTEIROES_PISTA, POSTES_PISTA, PREDIOS_PISTA, OBSTACULOS_PISTA, FIACAO_PISTA } from '../pista/mundo.js'

export const MUNDO_BAIXADA = { w: 760, h: 2840, spawn: { x: 380, y: 2720 } }
export const RUAS_BAIXADA = RUAS_PISTA
export const QUARTEIROES_BAIXADA = QUARTEIROES_PISTA
export const POSTES_BAIXADA = POSTES_PISTA
export const FIACAO_BAIXADA = FIACAO_PISTA
export const OBSTACULOS_BAIXADA = OBSTACULOS_PISTA

// A linha do trem: faixa y1–y2 (a rua inteira) que o trem fecha quando passa.
// `ciclo` = de quanto em quanto tempo ele vem; `aviso` = o apito antes;
// `passa` = quanto tempo a travessia fica fechada. Quem estiver nos trilhos
// quando ele chega leva `dano` na tropa (nunca derruba) e é jogado pro lado
// mais perto.
export const TREM_BAIXADA = { y1: 1296, y2: 1336, ciclo: 24000, aviso: 3000, passa: 8000, dano: 2 }

const PICH = 'games.gangues.cena.baixada.pich'

// Cores da Baixada: concreto azulado, lona e ferrugem.
const CORES = ['#4f5f6b', '#5b6a73', '#6a6f64', '#3f5566', '#70675a', '#586674', '#4a5a52']

// Portas: quais prédios do esqueleto viram interior aqui (o resto fica só
// fachada). Nada tem `pos_portao` — sem muro, o bairro inteiro é andável.
const PORTAS = {
  c1: { para: 'birosca', nome: 'games.gangues.cena.baixada.predio.birosca' },
  of: { para: 'padaria', nome: 'games.gangues.cena.baixada.predio.padaria' },
  pm1: { para: 'birosca_2', nome: 'games.gangues.cena.baixada.predio.birosca_2' },
  loja: { para: 'deposito', nome: 'games.gangues.cena.baixada.predio.deposito' },
}

export const PREDIOS_BAIXADA = PREDIOS_PISTA.map((pr, i) => {
  const { pos_portao, porta, nome, oficina, ...resto } = pr
  const nova = PORTAS[pr.id]
  return {
    ...resto,
    cor: CORES[i % CORES.length],
    ...(pr.pich ? { pich: PICH } : {}),
    ...(nova ? { nome: nova.nome, porta: { ...porta, para: nova.para } } : {}),
    // Sem muro, o prédio de cima também tem fachada sólida desde o começo.
    ...(pos_portao ? { solo: 1 } : {}),
  }
})

// Cenário: o valão, a linha do trem e a vida de sempre.
export const CENARIO_BAIXADA = [
  { tipo: 'praca', x: 380, y: 1895, w: 330, h: 200 },
  { tipo: 'arvore-seca', x: 300, y: 1840 }, { tipo: 'arvore', x: 470, y: 1860 },
  { tipo: 'banco', x: 330, y: 1900 }, { tipo: 'banco', x: 430, y: 1940 },
  { tipo: 'quadra', x: 130, y: 1900, w: 150, h: 180 }, { tipo: 'cesta', x: 130, y: 1830 },
  { tipo: 'mural', x: 478, y: 2120, w: 150, h: 46 },
  { tipo: 'orelhao', x: 300, y: 1770 }, { tipo: 'bica', x: 470, y: 2000 },
  { tipo: 'crianca', x: 340, y: 1920 }, { tipo: 'cachorro', x: 300, y: 2010 },
  { tipo: 'carro-sem-roda', x: 620, y: 2470 }, { tipo: 'ponto-onibus', x: 640, y: 1730 },
  { tipo: 'caixa-dagua-com', x: 60, y: 2180 },
  { tipo: 'varal', x: 285, y: 2400, w: 60 }, { tipo: 'varal', x: 285, y: 1900, w: 60 },
  { tipo: 'grafite', x: 70, y: 1260, texto: 'games.gangues.cena.baixada.grafite' },
  { tipo: 'tenis-no-fio', x: 305, y: 2130 },
  // do outro lado da linha
  { tipo: 'varal', x: 160, y: 1000, w: 70 }, { tipo: 'arvore-seca', x: 250, y: 1060 },
  { tipo: 'banco', x: 300, y: 1120 }, { tipo: 'cachorro', x: 430, y: 980 },
  { tipo: 'crianca', x: 350, y: 720 }, { tipo: 'moto', x: 250, y: 430 },
  { tipo: 'caixa-dagua-com', x: 160, y: 640 },
  { tipo: 'grafite', x: 300, y: 250, texto: 'games.gangues.cena.baixada.grafite' },
  { tipo: 'carro-sem-roda', x: 610, y: 560 },
]
