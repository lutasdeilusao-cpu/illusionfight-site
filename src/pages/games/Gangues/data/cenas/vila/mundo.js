// ── MUNDO da Vila (geometria + cenário do TÉRREO) ────────────────────
// Esqueleto da Pista/Baixada na MESMA orientação (ruas, quarteirões, portas e
// zonas já validados lá: colisão, alcance, perseguidor). A Vila é um conjunto
// habitacional: o térreo é o pátio — livre desde o começo, sem muro nem trem.
// O "muro" daqui é o PRÉDIO: o galpão do esqueleto vira o Bloco A, e os dez
// andares são um interior só, com um cômodo por andar (ver ./interiores.js).
import { RUAS_PISTA, QUARTEIROES_PISTA, POSTES_PISTA, PREDIOS_PISTA, OBSTACULOS_PISTA, FIACAO_PISTA } from '../pista/mundo.js'

export const MUNDO_VILA = { w: 760, h: 2840, spawn: { x: 380, y: 2720 } }
export const RUAS_VILA = RUAS_PISTA
export const QUARTEIROES_VILA = QUARTEIROES_PISTA
export const POSTES_VILA = POSTES_PISTA
export const FIACAO_VILA = FIACAO_PISTA
export const OBSTACULOS_VILA = OBSTACULOS_PISTA

const PICH = 'games.gangues.cena.vila.pich'

// Cores da Vila: bloco de concreto pintado, azulejo e ferrugem de portão.
const CORES = ['#8a8f96', '#7c858f', '#9a948a', '#6f7b86', '#a39585', '#838a80', '#77818c']

// Portas: quais prédios do esqueleto viram interior aqui (o resto é fachada).
const PORTAS = {
  c1: { para: 'birosca', nome: 'games.gangues.cena.vila.predio.birosca' },
  of: { para: 'oficina', nome: 'games.gangues.cena.vila.predio.oficina' },
  loja: { para: 'brecho', nome: 'games.gangues.cena.vila.predio.brecho' },
  galpao: { para: 'bloco_a', nome: 'games.gangues.cena.vila.predio.bloco_a' },
}

export const PREDIOS_VILA = PREDIOS_PISTA.map((pr, i) => {
  const { pos_portao, porta, nome, oficina, ...resto } = pr
  const nova = PORTAS[pr.id]
  return {
    ...resto,
    cor: CORES[i % CORES.length],
    ...(pr.pich ? { pich: PICH } : {}),
    ...(nova ? { nome: nova.nome, porta: { ...porta, para: nova.para } } : {}),
    // Sem muro, o que era "do outro lado" também tem fachada sólida.
    ...(pos_portao ? { solo: 1 } : {}),
  }
})

// Cenário do pátio: quadra, varal, orelhão e a vida do conjunto.
export const CENARIO_VILA = [
  { tipo: 'praca', x: 380, y: 1895, w: 330, h: 200 },
  { tipo: 'arvore', x: 300, y: 1840 }, { tipo: 'arvore', x: 470, y: 1860 },
  { tipo: 'banco', x: 330, y: 1900 }, { tipo: 'banco', x: 430, y: 1940 },
  { tipo: 'quadra', x: 130, y: 1900, w: 150, h: 180 }, { tipo: 'cesta', x: 130, y: 1830 },
  { tipo: 'mural', x: 478, y: 2120, w: 150, h: 46 },
  { tipo: 'orelhao', x: 300, y: 1770 }, { tipo: 'bica', x: 470, y: 2000 },
  { tipo: 'crianca', x: 340, y: 1920 }, { tipo: 'cachorro', x: 300, y: 2010 },
  { tipo: 'carro-sem-roda', x: 620, y: 2470 },
  { tipo: 'caixa-dagua-com', x: 60, y: 2180 },
  { tipo: 'varal', x: 285, y: 2400, w: 60 }, { tipo: 'varal', x: 285, y: 1900, w: 60 },
  { tipo: 'grafite', x: 70, y: 1260, texto: 'games.gangues.cena.vila.grafite' },
  { tipo: 'tenis-no-fio', x: 305, y: 2130 },
  { tipo: 'varal', x: 160, y: 1000, w: 70 }, { tipo: 'arvore-seca', x: 250, y: 1060 },
  { tipo: 'banco', x: 300, y: 1120 }, { tipo: 'cachorro', x: 430, y: 980 },
  { tipo: 'crianca', x: 350, y: 720 }, { tipo: 'moto', x: 250, y: 430 },
  { tipo: 'caixa-dagua-com', x: 160, y: 640 },
  { tipo: 'grafite', x: 300, y: 250, texto: 'games.gangues.cena.vila.grafite' },
]
