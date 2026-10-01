// ── POIs da Laje (território 7 — o FINAL) ────────────────────────────
// Pedido do Isaias, 30/09/2026: "tem que ser o pior território, o mais longo,
// o gameplay mais longo de todos... o chefão tem pelo menos três fases de
// batalha pesada... tem que ser épico, memorável". E: "os inimigos podem ser os
// chefões das outras fases também — não repetidamente, mas pra revanche".
//
// LADDER (pontos de ficha por corpo, faixa da Laje 86–99, Retalho 100):
//   RUA (a entrada costurada): 86 Última Guarda → 87 revanche do Carvão → 88 Fiapo
//     → 89 revanche do Cobrador → 90 Agulha → 91 revanche do Fura-Bucho → 92 Linha Reta (G)
//   SALA DE COSTURA (6 salas): 93 revanche do Ferrugem → 94 revanche da Zefa
//     → 95 Costura Fina → 96 Tesoura (G) → 97 Corte Certo (G) → 98 revanche do Contador
//   O TOPO (sem descanso): fase 1 "A Costura" (bando de 4) → fase 2 "A Colcha"
//     (bando de 5) → fase 3: O RETALHO 100 (+ escolta).
//
// AS LINHAS DO RETALHO (`ajusteChefe` em ./index.js): ele segura cada um dos 6
// bairros antigos por uma linha — um contato dele na sala dos fundos da birosca
// de lá (POIs `linha_<bairro>`, só aparecem depois do recado da Laje). Cada
// linha cortada na porrada é uma a menos; cada uma que sobrar dá +1 de Porrada
// e +1 de Couro pro Retalho na fase final.
import { LAJE_POOL_ENTRADA, LAJE_POOL_COSTURA, LAJE_POOL_LINHAS, LAJE_POOL_RUA } from './pools.js'
import { GANGUES_LOJA_EQUIP } from '../../ganguesEquipDistribuicao.js'

// As 6 linhas: bairro, id do POI lá embaixo, molde do contato.
export const LAJE_LINHAS = [
  { cena: 'pista', id: 'linha_pista', enemy: 1219 },
  { cena: 'feira', id: 'linha_feira', enemy: 1221 },
  { cena: 'baixada', id: 'linha_baixada', enemy: 1413 },
  { cena: 'vila', id: 'linha_vila', enemy: 1414 },
  { cena: 'morro', id: 'linha_morro', enemy: 1319 },
  { cena: 'alto', id: 'linha_alto', enemy: 1320 },
]

function treta(id, pontos, pool, chanceDupla, extra) {
  return {
    id, tipo: 'treta', repetivel: true, nivelRec: pontos,
    i18n: `games.gangues.cena.laje.${id}`, recompensa: { rep: 8 },
    revezamento: { pool, budgetPorCorpo: pontos, chanceDupla },
    ...extra,
  }
}
function fixo(id, pontos, enemy, extra) {
  return {
    id, tipo: 'treta', repetivel: true, nivelRec: pontos,
    i18n: `games.gangues.cena.laje.${id}`, recompensa: { rep: 9 },
    enemy, fixo: true, pontosFixo: pontos,
    ...extra,
  }
}
// Revanche de um chefe antigo: UMA vez só, sozinho, já na ficha da Laje.
const revanche = (id, pontos, enemy) => fixo(id, pontos, enemy, { repetivel: false, recompensa: { rep: 12, item: 41, qtd: 2 } })
// Uma fase do Retalho no topo: bando de vários corpos, orçamento TOTAL fixo,
// ele sempre na frente (liderFixo).
const fase = (id, total, qtd, pool, nivel) => ({
  id, tipo: 'treta', nivelRec: nivel, i18n: `games.gangues.cena.laje.${id}`,
  enemy: 1600, liderFixo: 1600, moldesPool: pool, pontosFixo: total, qtdMin: qtd, qtdMax: qtd,
  recompensa: { rep: 15 },
})

export const POIS_LAJE = [
  // ══ A ENTRADA COSTURADA (rua) ══════════════════════════════════════
  treta('ultima_guarda', 86, LAJE_POOL_ENTRADA, 0.5, { visivel: true, enemy: 1119, revela: ['revanche_carvao', 'rinha_laje_topo', 'mirante'] }),
  { ...revanche('revanche_carvao', 87, 1500), revela: ['fiapo'] },
  fixo('fiapo', 88, 1319, { revela: ['revanche_cobrador'] }),
  { ...revanche('revanche_cobrador', 89, 1501), revela: ['agulha'] },
  fixo('agulha', 90, 1320, { revela: ['revanche_fura_bucho'] }),
  { ...revanche('revanche_fura_bucho', 91, 1502), revela: ['linha_reta'] },
  fixo('linha_reta', 92, 1321, { recompensa: { rep: 10, item: 41, qtd: 3 } }),

  // ══ A SALA DE COSTURA (./interiores.js) ═════════════════════════════
  revanche('revanche_ferrugem', 93, 1503),
  revanche('revanche_zefa', 94, 1504),
  treta('costura_fina', 95, LAJE_POOL_COSTURA, 0.6, { enemy: 1413 }),
  fixo('tesoura', 96, 1463, { recompensa: { rep: 10, item: 41, qtd: 3 } }),
  fixo('corte_certo', 97, 1464, { recompensa: { rep: 10, item: 41, qtd: 3 } }),
  revanche('revanche_contador', 98, 1505),

  // ══ O TOPO — as três fases do Retalho ═══════════════════════════════
  // Fase 1: ele + a Tesoura, o Corte Certo e a Costura Fina (escolta sem repetir nome).
  fase('fase_costura', 340, 4, [1463, 1464, 1413], 98),
  fase('fase_colcha', 430, 5, LAJE_POOL_LINHAS, 99),

  // ══ OPCIONAIS ═══════════════════════════════════════════════════════
  {
    // O mirante: Marélia inteira lá embaixo (cada conversa, uma lembrança).
    id: 'mirante',
    tipo: 'papo',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.laje.mirante',
    falasSorteadas: true,
    escolhas: [{ id: 'olhar' }],
  },
  {
    id: 'rinha_laje_topo',
    tipo: 'treta',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.laje.rinha_laje_topo',
    rinhaInfinita: true,
    semGrana: true,
    revezamento: { pool: LAJE_POOL_RUA, budgetPorCorpo: 3, chanceDupla: 0.35, nivelDaTropa: true },
  },
  {
    id: 'birosca_laje',
    tipo: 'descanso',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.laje.birosca_laje',
    custoGrana: 60,
  },
  {
    // O agiota da Laje (Ponto da Laje, 1220 — o último ponto de venda do topo).
    id: 'ponto_da_laje',
    tipo: 'agiota',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.laje.ponto_da_laje',
    retratoEnemyId: 1220,
    custoGrana: 60,
    emprestimo: 1500,
  },
  {
    id: 'loja_laje',
    tipo: 'loja',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.laje.loja_laje',
    itens: [1, 2, 10, 34, 41, ...GANGUES_LOJA_EQUIP.laje],
  },
  {
    id: 'alfaiataria',
    tipo: 'ferreiro',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.laje.alfaiataria',
    tetoAprim: 9,
  },
  {
    // A planilha do Retalho: os seis bairros como colunas de uma tabela.
    id: 'planilha',
    tipo: 'achado',
    opcional: true,
    i18n: 'games.gangues.cena.laje.planilha',
    recompensa: { grana: 300, rep: 5, item: 34 },
  },
]

// Os POIs `linha_<bairro>` que moram nos bairros de baixo (cada um vai no
// pois.js do seu bairro): o contato do Retalho, cortado na porrada.
export function poiLinha({ id, enemy }) {
  return {
    id, tipo: 'papo', opcional: true,
    i18n: `games.gangues.cena.laje.linhas.${id}`,
    escolhas: [{ id: 'cortar', viraTreta: { enemy, rep: 3, revezamento: { pool: [enemy, ...LAJE_POOL_LINHAS.filter(e => e !== enemy)], budgetPorCorpo: 88, chanceDupla: 0.6 }, recompensa: { rep: 6 } } }],
  }
}
