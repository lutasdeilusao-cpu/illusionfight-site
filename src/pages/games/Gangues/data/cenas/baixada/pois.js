// ── POIs da Baixada (território 3) ───────────────────────────────────
// Plano aprovado pelo Isaias em 29/09/2026 (docs/Games/Gangues/LDI_GANGUES_GDD.md
// §4, Território 3). A virada: o "chefe" que foge o bairro inteiro — o
// FOLGADO, que se apresenta como Fura-Bucho — é o mais fraco de todos. O dono
// da Baixada de verdade é o VELHO grogue da entrada, que fala filosofia com
// gíria pra quem passa. O bairro inteiro é ganhar RESPEITO: cada capanga que o
// folgado joga no caminho enche a barra; cheia, ele não tem mais pra onde
// correr. Batido o folgado, ele entrega: "dá um café pro véio". A Dona Cida
// libera o café, o velho acorda — e aí é a luta de verdade.
//
// LADDER (pontos de ficha por corpo, faixa da Baixada 34–46):
//   34 folgado_1 (Sangria) → 36 folgado_2 (Gelo) → 38 folgado_3 (Sobra)
//   → 41 folgado_4 (Caco Maior, General) → 43 folgado_5 (Nome do Sombra, General)
//   → 34 o próprio folgado (o mais fraco, de propósito)
//   → Fura-Bucho 46 (+ os dois Generais de escolta, ~35 cada).
import { BAIXADA_POOL_RUA, BAIXADA_POOL_SANGRIA, BAIXADA_POOL_GELO, BAIXADA_POOL_SOBRA } from './pools.js'
import { LAJE_LINHAS, poiLinha } from '../laje/pois.js'

// A cadeia do folgado — a Barra de Respeito conta estes cinco.
export const BAIXADA_RESPEITO = ['folgado_1', 'folgado_2', 'folgado_3', 'folgado_4', 'folgado_5']

// Item do café do velho (material de quest, ver ganguesItens.js).
export const BAIXADA_CAFE_ID = 16

// Uma treta da cadeia do folgado: ele aparece (pino grande, `fuga`), solta a
// marra, joga um capanga e some pro próximo ponto (`revela`).
function fuga(id, nivel, extra) {
  return {
    id, tipo: 'treta', fuga: true, repetivel: true, nivelRec: nivel,
    i18n: `games.gangues.cena.baixada.${id}`, recompensa: { rep: 4 },
    ...extra,
  }
}

export const POIS_BAIXADA = [
  // ══ O VELHO DA ENTRADA ═══════════════════════════════════════════════
  {
    // Grogue, com cara de morador de rua. Cada conversa sorteia uma
    // filosofia (array em `.falas`). Some quando o café sai da padaria — no
    // lugar dele fica o pino do café (e depois, o chefe).
    id: 'veio',
    tipo: 'papo',
    opcional: true,
    repetivel: true,
    visivel: true,
    someQuando: 'dona_cida',
    i18n: 'games.gangues.cena.baixada.veio',
    falasSorteadas: true,
    escolhas: [{ id: 'ouvir' }],
  },
  {
    // O café na mão: entrega pro velho e ele acorda (abre o chefe).
    id: 'veio_cafe',
    tipo: 'papo',
    someQuando: 'veio_cafe',
    i18n: 'games.gangues.cena.baixada.veio_cafe',
    escolhas: [{ id: 'dar_cafe', precisaItens: { [BAIXADA_CAFE_ID]: 1 }, recompensa: { rep: 3 } }],
  },

  // ══ A CADEIA DO FOLGADO (portao.precisa) ═════════════════════════════
  fuga('folgado_1', 34, {
    visivel: true,
    enemy: 1308,
    revezamento: { pool: BAIXADA_POOL_SANGRIA, budgetPorCorpo: 34, chanceDupla: 0.2 },
    revela: ['folgado_2', 'rinha_trilho'],
  }),
  fuga('folgado_2', 36, {
    enemy: 1309,
    revezamento: { pool: BAIXADA_POOL_GELO, budgetPorCorpo: 36, chanceDupla: 0.35 },
    revela: ['folgado_3', 'caixa_trilho'],
  }),
  fuga('folgado_3', 38, {
    enemy: 1405,
    revezamento: { pool: BAIXADA_POOL_SOBRA, budgetPorCorpo: 38, chanceDupla: 0.4 },
    revela: ['folgado_4'],
  }),
  fuga('folgado_4', 41, {
    enemy: 1455, fixo: true, pontosFixo: 41,
    recompensa: { rep: 5, equipPrimeiraVez: 312 },
    revela: ['folgado_5'],
  }),
  fuga('folgado_5', 43, {
    enemy: 1456, fixo: true, pontosFixo: 43,
    recompensa: { rep: 6, equipPrimeiraVez: 306 },
    revela: ['folgado_final'],
  }),
  {
    // O folgado, enfim — sem capanga, sem pra onde correr. É o mais fraco
    // do bairro (de propósito). Batido, ele entrega quem manda de verdade.
    id: 'folgado_final',
    tipo: 'treta',
    fuga: true,
    nivelRec: 34,
    i18n: 'games.gangues.cena.baixada.folgado_final',
    enemy: 1322,
    fixo: true,
    pontosFixo: 34,
    recompensa: { rep: 6 },
  },
  {
    // Dona Cida (DENTRO da padaria, só depois do folgado): o café do velho.
    id: 'dona_cida',
    tipo: 'papo',
    i18n: 'games.gangues.cena.baixada.dona_cida',
    escolhas: [{ id: 'pega_cafe', recompensa: { item: BAIXADA_CAFE_ID, qtd: 1 }, revela: ['veio_cafe'] }],
  },

  // ══ OPCIONAIS ═══════════════════════════════════════════════════════
  {
    // A Rinha do Trilho — o farm da Baixada (rinha infinita, igual as outras).
    id: 'rinha_trilho',
    tipo: 'treta',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.baixada.rinha_trilho',
    rinhaInfinita: true,
    semGrana: true,
    revezamento: { pool: BAIXADA_POOL_RUA, budgetPorCorpo: 3, chanceDupla: 0.35, nivelDaTropa: true },
  },
  {
    // Uma caixa esquecida na beira da linha.
    id: 'caixa_trilho',
    tipo: 'achado',
    opcional: true,
    i18n: 'games.gangues.cena.baixada.caixa_trilho',
    recompensa: { grana: 60, rep: 2, item: 34 },
  },
  {
    // A Dona Lurdes (dentro da birosca): boato da Vila + a ponte pra lá —
    // destranca o Ferrugem, igual o rádio pirata faz pra Baixada
    // (`__flags.vila`, ver `precisaInformante`).
    id: 'informante_vila',
    tipo: 'papo',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.baixada.informante_vila',
    escolhas: [{ id: 'ouvir', informante: 'vila' }],
  },
  {
    // Birosca da Dona Lurdes — descanso de baixo da linha.
    id: 'birosca',
    tipo: 'descanso',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.baixada.birosca',
    custoGrana: 20,
  },
  {
    // A pensão do outro lado da linha — descanso de cima.
    id: 'birosca_2',
    tipo: 'descanso',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.baixada.birosca_2',
    custoGrana: 20,
  },
  {
    // O agiota da Baixada (Resto de Faca, 1406 — cobra em nome dos três
    // cacos): a MESMA caderneta global, degrau maior.
    id: 'taxa_fixa',
    tipo: 'agiota',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.baixada.taxa_fixa',
    retratoEnemyId: 1406,
    custoGrana: 20,
    emprestimo: 500,
  },
  {
    // O depósito do Seu Nono: o RARO dos 3 caminhos (GDD §9.7) — nada que a
    // Pista ou a Feira vendem, fora os consumíveis.
    id: 'deposito',
    tipo: 'loja',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.baixada.deposito',
    itens: [1, 2, 4, 10, 34, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318],
  },
  {
    // O remédio da creche da Zefa: 2 Poções de Osso (Vila) abrem o 3º portão.
    // Só aparece depois do recado do Morro (`__flags.morro`, Vila) e abre um
    // dos portões da escadaria (BARREIRAS_MORRO, data/cenas/morro/mundo.js).
    id: 'aval_morro_baixada',
    tipo: 'papo',
    opcional: true,
    i18n: 'games.gangues.cena.aval.aval_morro_baixada',
    escolhas: [{ id: 'entregar', precisaItens: { 41: 2 }, informante: 'morro_baixada' }],
  },
  // A linha do Retalho neste bairro (Laje — ver data/cenas/laje/pois.js): corta na porrada.
  poiLinha(LAJE_LINHAS.find(l => l.cena === 'baixada')),
]
