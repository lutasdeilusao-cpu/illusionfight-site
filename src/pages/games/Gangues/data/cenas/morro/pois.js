// ── POIs do Morro (território 5) ─────────────────────────────────────
// Plano aprovado pelo Isaias em 30/09/2026 (GDD §4, Território 5). O Morro
// nunca foi tomado, só NEGOCIADO: a escadaria tem três portões dos Fogueteiro
// (BARREIRAS_MORRO, ./mundo.js) e cada um só abre com o aval de um bairro que
// a gangue já dominou — o jogador volta na Pista, na Feira e na Baixada pra
// negociar (POIs `aval_morro` nas salas dos fundos de lá). A entrada vem da
// Vila (`informante_morro`, grava __flags.morro).
//
// LADDER (pontos de ficha por corpo, faixa do Morro 60–72):
//   60 escadaria → 61 Cupim → [portão da Pista] → 63 laje nova
//   → [portão da Feira] → 65 posto de rojão → 66 Segunda Mãe (G)
//   → [portão da Baixada] → 68 Escadaria Inteira (G) → 69 última escada
//   → a boca da Zefa: 70 Conta do Morro → A FERA 72 (+ escolta ~54).
import { MORRO_POOL_ESCADA, MORRO_POOL_MEIO, MORRO_POOL_ALTO, MORRO_POOL_RUA } from './pools.js'

function treta(id, pontos, pool, chanceDupla, extra) {
  return {
    id, tipo: 'treta', repetivel: true, nivelRec: pontos,
    i18n: `games.gangues.cena.morro.${id}`, recompensa: { rep: 5 },
    revezamento: { pool, budgetPorCorpo: pontos, chanceDupla },
    ...extra,
  }
}
function fixo(id, pontos, enemy, extra) {
  return {
    id, tipo: 'treta', repetivel: true, nivelRec: pontos,
    i18n: `games.gangues.cena.morro.${id}`, recompensa: { rep: 6 },
    enemy, fixo: true, pontosFixo: pontos,
    ...extra,
  }
}

export const POIS_MORRO = [
  // ══ A SUBIDA (portao.precisa) ═══════════════════════════════════════
  treta('escadaria', 60, MORRO_POOL_ESCADA, 0.3, { visivel: true, enemy: 1313, revela: ['cupim'] }),
  fixo('cupim', 61, 1313, { revela: ['laje_nova', 'rinha_morro'] }),
  treta('laje_nova', 63, MORRO_POOL_MEIO, 0.4, { enemy: 1214, revela: ['posto_rojao'] }),
  fixo('posto_rojao', 65, 1409, { revela: ['segunda_mae'] }),
  fixo('segunda_mae', 66, 1459, { recompensa: { rep: 7, item: 41, qtd: 2 }, revela: ['escadaria_inteira'] }),
  fixo('escadaria_inteira', 68, 1460, { recompensa: { rep: 7, item: 41, qtd: 2 }, revela: ['ultima_escada'] }),
  treta('ultima_escada', 69, MORRO_POOL_ALTO, 0.5, { enemy: 1315 }),
  // Dentro da boca da Zefa (./interiores.js) — a antessala antes dela.
  fixo('conta_do_morro', 70, 1410),

  // ══ OPCIONAIS ═══════════════════════════════════════════════════════
  {
    // O morador do pé do Morro: explica os portões (cada conversa, um boato).
    id: 'morador',
    tipo: 'papo',
    opcional: true,
    repetivel: true,
    visivel: true,
    i18n: 'games.gangues.cena.morro.morador',
    falasSorteadas: true,
    escolhas: [{ id: 'ouvir' }],
  },
  {
    id: 'rinha_morro',
    tipo: 'treta',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.morro.rinha_morro',
    rinhaInfinita: true,
    semGrana: true,
    revezamento: { pool: MORRO_POOL_RUA, budgetPorCorpo: 3, chanceDupla: 0.35, nivelDaTropa: true },
  },
  {
    id: 'birosca_morro',
    tipo: 'descanso',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.morro.birosca_morro',
    custoGrana: 40,
  },
  {
    // O agiota do Morro (Conta do Morro, 1410 — guarda quem deve favor à Zefa).
    id: 'fiado_da_zefa',
    tipo: 'agiota',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.morro.fiado_da_zefa',
    retratoEnemyId: 1410,
    custoGrana: 40,
    emprestimo: 1000,
  },
  {
    id: 'venda',
    tipo: 'loja',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.morro.venda',
    itens: [1, 2, 10, 34, 41, 401, 402, 403, 404, 406, 407, 408, 409, 410, 411, 413, 414, 415, 416, 417, 418],
  },
  {
    id: 'serralheria_morro',
    tipo: 'ferreiro',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.morro.serralheria_morro',
    tetoAprim: 7,
  },
  {
    // A creche da Zefa: intocável até pra rival. Um papo, e um descanso de graça.
    id: 'creche',
    tipo: 'papo',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.morro.creche',
    falasSorteadas: true,
    escolhas: [{ id: 'ouvir' }],
  },
  {
    id: 'creche_achado',
    tipo: 'achado',
    opcional: true,
    i18n: 'games.gangues.cena.morro.creche_achado',
    recompensa: { grana: 120, rep: 3, item: 34 },
  },
  {
    // O recado do Alto (sala dos fundos da birosca): a ponte pro 6º território —
    // destranca o Contador (`__flags.alto`, ver `precisaInformante`).
    id: 'informante_alto',
    tipo: 'papo',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.morro.informante_alto',
    escolhas: [{ id: 'ouvir', informante: 'alto' }],
  },
]
