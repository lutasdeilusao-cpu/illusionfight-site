// ── MUNDO do Alto do Morro (geometria + cenário) ─────────────────────
// Esqueleto da Pista/Baixada/Vila/Morro na MESMA orientação (ruas,
// quarteirões, portas e zonas já validados). O Alto fica atrás da porta de
// aço, no topo do Morro: rua livre, sem muro nem portão — o que trava o
// Contador é o CADERNO dele (ver `cena.caderno` em ./index.js).
import { RUAS_PISTA, QUARTEIROES_PISTA, POSTES_PISTA, PREDIOS_PISTA, OBSTACULOS_PISTA, FIACAO_PISTA } from '../pista/mundo.js'

export const MUNDO_ALTO = { w: 760, h: 2840, spawn: { x: 380, y: 2720 } }
export const RUAS_ALTO = RUAS_PISTA
export const QUARTEIROES_ALTO = QUARTEIROES_PISTA
export const POSTES_ALTO = POSTES_PISTA
export const FIACAO_ALTO = FIACAO_PISTA
export const OBSTACULOS_ALTO = OBSTACULOS_PISTA

const PICH = 'games.gangues.cena.alto.pich'

// Cores do Alto: reboco pintado, grade preta e o vermelho dos Cinco.
const CORES = ['#7a5560', '#6c5a66', '#8a6a6a', '#5e5468', '#946a62', '#6e6670', '#80606a']

const PORTAS = {
  c1: { para: 'birosca', nome: 'games.gangues.cena.alto.predio.birosca' },
  of: { para: 'oficina', nome: 'games.gangues.cena.alto.predio.oficina' },
  pm1: { para: 'emporio', nome: 'games.gangues.cena.alto.predio.emporio' },
  loja: { para: 'sala_cinco', nome: 'games.gangues.cena.alto.predio.sala_cinco' },
  galpao: { para: 'escritorio', nome: 'games.gangues.cena.alto.predio.escritorio' },
}

export const PREDIOS_ALTO = PREDIOS_PISTA.map((pr, i) => {
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

export const CENARIO_ALTO = [
  { tipo: 'praca', x: 380, y: 1895, w: 330, h: 200 },
  { tipo: 'arvore', x: 300, y: 1840 }, { tipo: 'arvore', x: 470, y: 1860 },
  { tipo: 'banco', x: 330, y: 1900 }, { tipo: 'banco', x: 430, y: 1940 },
  { tipo: 'quadra', x: 130, y: 1900, w: 150, h: 180 }, { tipo: 'cesta', x: 130, y: 1830 },
  { tipo: 'mural', x: 478, y: 2120, w: 150, h: 46 },
  { tipo: 'orelhao', x: 300, y: 1770 }, { tipo: 'bica', x: 470, y: 2000 },
  { tipo: 'carro-sem-roda', x: 620, y: 2470 },
  { tipo: 'caixa-dagua-com', x: 60, y: 2180 },
  { tipo: 'grafite', x: 70, y: 1260, texto: 'games.gangues.cena.alto.grafite' },
  { tipo: 'varal', x: 160, y: 1000, w: 70 }, { tipo: 'banco', x: 300, y: 1120 },
  { tipo: 'moto', x: 250, y: 430 }, { tipo: 'caixa-dagua-com', x: 160, y: 640 },
  { tipo: 'grafite', x: 300, y: 250, texto: 'games.gangues.cena.alto.grafite' },
]
