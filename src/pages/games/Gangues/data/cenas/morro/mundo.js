// ── MUNDO do Morro (geometria + cenário) ─────────────────────────────
// Esqueleto da Pista/Baixada/Vila na MESMA orientação (ruas, quarteirões,
// portas e zonas já validados). O Morro é a favela de encosta: a subida é
// uma escadaria só, e os Fogueteiro FECHAM ela em três pontos (`BARREIRAS_MORRO`).
// Cada portão só abre com o AVAL de um bairro que o jogador já dominou — o
// Morro nunca foi tomado, só negociado (GDD §4, Território 5).
import { RUAS_PISTA, QUARTEIROES_PISTA, POSTES_PISTA, PREDIOS_PISTA, OBSTACULOS_PISTA, FIACAO_PISTA } from '../pista/mundo.js'

export const MUNDO_MORRO = { w: 760, h: 2840, spawn: { x: 380, y: 2720 } }
export const RUAS_MORRO = RUAS_PISTA
export const QUARTEIROES_MORRO = QUARTEIROES_PISTA
export const POSTES_MORRO = POSTES_PISTA
export const FIACAO_MORRO = FIACAO_PISTA
export const OBSTACULOS_MORRO = OBSTACULOS_PISTA

// Os três portões da escadaria: faixa y1–y2 que barra a rua inteira enquanto
// o `flag` (storyProgress.__flags) não existe. Faixas conferidas por busca de
// alcance: fechadas, nada acima delas é alcançável; abertas, tudo é.
export const BARREIRAS_MORRO = [
  { id: 'pista', y1: 2040, y2: 2080, flag: 'morro_pista' },
  { id: 'feira', y1: 1296, y2: 1336, flag: 'morro_feira' },
  { id: 'baixada', y1: 800, y2: 840, flag: 'morro_baixada' },
]

const PICH = 'games.gangues.cena.morro.pich'

// Cores do Morro: tijolo sem reboco, laje cinza e a tinta laranja da Frente.
const CORES = ['#9a5b3c', '#8a6048', '#a0705a', '#7d5a48', '#b07a52', '#8e8070', '#9c6a4a']

const PORTAS = {
  c1: { para: 'birosca', nome: 'games.gangues.cena.morro.predio.birosca' },
  of: { para: 'oficina', nome: 'games.gangues.cena.morro.predio.oficina' },
  pm1: { para: 'venda', nome: 'games.gangues.cena.morro.predio.venda' },
  loja: { para: 'creche', nome: 'games.gangues.cena.morro.predio.creche' },
  galpao: { para: 'boca', nome: 'games.gangues.cena.morro.predio.boca' },
}

export const PREDIOS_MORRO = PREDIOS_PISTA.map((pr, i) => {
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

export const CENARIO_MORRO = [
  { tipo: 'praca', x: 380, y: 1895, w: 330, h: 200 },
  { tipo: 'arvore-seca', x: 300, y: 1840 }, { tipo: 'arvore', x: 470, y: 1860 },
  { tipo: 'banco', x: 330, y: 1900 }, { tipo: 'quadra', x: 130, y: 1900, w: 150, h: 180 }, { tipo: 'cesta', x: 130, y: 1830 },
  { tipo: 'mural', x: 478, y: 2120, w: 150, h: 46 },
  { tipo: 'orelhao', x: 300, y: 1770 }, { tipo: 'bica', x: 470, y: 2000 },
  { tipo: 'crianca', x: 340, y: 1920 }, { tipo: 'cachorro', x: 300, y: 2010 },
  { tipo: 'caixa-dagua-com', x: 60, y: 2180 },
  { tipo: 'varal', x: 285, y: 2400, w: 60 }, { tipo: 'varal', x: 285, y: 1900, w: 60 },
  { tipo: 'grafite', x: 70, y: 1260, texto: 'games.gangues.cena.morro.grafite' },
  { tipo: 'tenis-no-fio', x: 305, y: 2130 },
  { tipo: 'varal', x: 160, y: 1000, w: 70 }, { tipo: 'arvore-seca', x: 250, y: 1060 },
  { tipo: 'crianca', x: 350, y: 720 }, { tipo: 'moto', x: 250, y: 430 },
  { tipo: 'caixa-dagua-com', x: 160, y: 640 },
  { tipo: 'grafite', x: 300, y: 250, texto: 'games.gangues.cena.morro.grafite' },
]
