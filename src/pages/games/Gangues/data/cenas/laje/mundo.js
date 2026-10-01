// ── MUNDO da Laje (geometria + cenário) ─────────────────────
// Esqueleto da Pista e dos outros bairros na MESMA orientação (ruas, quarteirões,
// portas e zonas já validados). A Laje é o topo de Marélia: a rua é a
// entrada costurada; a sala de costura e o topo (as 3 fases do Retalho) são
// interiores (ver ./interiores.js).
import { RUAS_PISTA, QUARTEIROES_PISTA, POSTES_PISTA, PREDIOS_PISTA, OBSTACULOS_PISTA, FIACAO_PISTA } from '../pista/mundo.js'

export const MUNDO_LAJE = { w: 760, h: 2840, spawn: { x: 380, y: 2720 } }
export const RUAS_LAJE = RUAS_PISTA
export const QUARTEIROES_LAJE = QUARTEIROES_PISTA
export const POSTES_LAJE = POSTES_PISTA
export const FIACAO_LAJE = FIACAO_PISTA
export const OBSTACULOS_LAJE = OBSTACULOS_PISTA

const PICH = 'games.gangues.cena.laje.pich'

// Cores da Laje: concreto de cobertura e o roxo da costura.
const CORES = ['#5e4a6e', '#6a5878', '#4f4660', '#76628a', '#5a5468', '#6e5a7a', '#48405a']

const PORTAS = {
  c1: { para: 'birosca', nome: 'games.gangues.cena.laje.predio.birosca' },
  of: { para: 'oficina', nome: 'games.gangues.cena.laje.predio.oficina' },
  pm1: { para: 'loja', nome: 'games.gangues.cena.laje.predio.loja' },
  loja: { para: 'sala_costura', nome: 'games.gangues.cena.laje.predio.sala_costura' },
  galpao: { para: 'topo', nome: 'games.gangues.cena.laje.predio.topo' },
}

export const PREDIOS_LAJE = PREDIOS_PISTA.map((pr, i) => {
  const { pos_portao, porta, nome, oficina, ...resto } = pr
  const nova = PORTAS[pr.id]
  return {
    ...resto,
    cor: CORES[i % CORES.length],
    ...(pr.pich ? { pich: PICH } : {}),
    ...(nova ? { nome: nova.nome, porta: { ...porta, para: nova.para } } : {}),
    ...(pos_portao ? { solo: 1 } : {}),
  }
})

export const CENARIO_LAJE = [
  { tipo: 'praca', x: 380, y: 1895, w: 330, h: 200 },
  { tipo: 'arvore', x: 300, y: 1840 }, { tipo: 'arvore', x: 470, y: 1860 },
  { tipo: 'banco', x: 330, y: 1900 }, { tipo: 'banco', x: 430, y: 1940 },
  { tipo: 'quadra', x: 130, y: 1900, w: 150, h: 180 }, { tipo: 'cesta', x: 130, y: 1830 },
  { tipo: 'mural', x: 478, y: 2120, w: 150, h: 46 },
  { tipo: 'orelhao', x: 300, y: 1770 }, { tipo: 'bica', x: 470, y: 2000 },
  { tipo: 'carro-sem-roda', x: 620, y: 2470 },
  { tipo: 'caixa-dagua-com', x: 60, y: 2180 },
  { tipo: 'grafite', x: 70, y: 1260, texto: 'games.gangues.cena.laje.grafite' },
  { tipo: 'varal', x: 160, y: 1000, w: 70 }, { tipo: 'banco', x: 300, y: 1120 },
  { tipo: 'moto', x: 250, y: 430 }, { tipo: 'caixa-dagua-com', x: 160, y: 640 },
  { tipo: 'grafite', x: 300, y: 250, texto: 'games.gangues.cena.laje.grafite' },
]
