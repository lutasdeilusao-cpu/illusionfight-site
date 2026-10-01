// ── POIs do Alto do Morro (território 6) ─────────────────────────────
// Plano aprovado pelo Isaias em 30/09/2026 (GDD §4, Território 6). O ponto
// mais POLÍTICO do jogo: os Cinco quase viraram cúpula e o Alto inteiro deve
// favor ao Contador. MECÂNICA — o Caderno do Contador (`cena.caderno`): cada
// um dos Cinco se resolve COMPRANDO a dívida dele (grana alta; ele sai do
// caderno e o Contador perde 1 de Couro) ou ENCARANDO na porrada (de graça;
// ele corre chorar pro Contador, que ganha 1 de Porrada).
//
// LADDER (pontos de ficha por corpo, faixa do Alto 73–85):
//   73 porta de aço → 74 sala fechada → os Cinco 75 · 76 · 77 · 78 · 79 (G)
//   → 80 a Roda → 82 Formação Completa (G, sala dos Cinco)
//   → escritório: 83 Favor Devido → porrinha → bilhar → O CONTADOR 85 (+ escolta ~64).
import { ALTO_POOL_ENTRADA, ALTO_POOL_RODA, ALTO_POOL_RUA } from './pools.js'
import { LAJE_LINHAS, poiLinha } from '../laje/pois.js'
import { GANGUES_LOJA_EQUIP } from '../../ganguesEquipDistribuicao.js'

// Os Cinco, na ordem do caderno: id do POI, molde, ficha e o preço da dívida.
export const ALTO_CINCO = [
  { id: 'cinco_verme', enemy: 1316, pontos: 75, preco: 600 },
  { id: 'cinco_presa', enemy: 1317, pontos: 76, preco: 650 },
  { id: 'cinco_engrenagem', enemy: 1318, pontos: 77, preco: 700 },
  { id: 'cinco_quase', enemy: 1411, pontos: 78, preco: 750 },
  { id: 'cinco_quarto', enemy: 1461, pontos: 79, preco: 800 },
]
// A flag de quem teve a dívida COMPRADA (storyProgress.__flags).
export const flagComprou = id => `alto_comprou_${id}`

function treta(id, pontos, pool, chanceDupla, extra) {
  return {
    id, tipo: 'treta', repetivel: true, nivelRec: pontos,
    i18n: `games.gangues.cena.alto.${id}`, recompensa: { rep: 6 },
    revezamento: { pool, budgetPorCorpo: pontos, chanceDupla },
    ...extra,
  }
}
function fixo(id, pontos, enemy, extra) {
  return {
    id, tipo: 'treta', repetivel: true, nivelRec: pontos,
    i18n: `games.gangues.cena.alto.${id}`, recompensa: { rep: 7 },
    enemy, fixo: true, pontosFixo: pontos,
    ...extra,
  }
}
// Um dos Cinco: papo com duas saídas — comprar a dívida ou encarar.
function cinco({ id, enemy, pontos, preco }) {
  return {
    id, tipo: 'papo', nivelRec: pontos,
    i18n: `games.gangues.cena.alto.${id}`,
    escolhas: [
      { id: 'comprar', custoGrana: preco, informante: flagComprou(id), revela: ['roda'] },
      { id: 'encarar', revela: ['roda'], viraTreta: { enemy, rep: 2, revezamento: { pool: [enemy], budgetPorCorpo: pontos, chanceDupla: 0 }, recompensa: { rep: 6 } } },
    ],
  }
}

export const POIS_ALTO = [
  // ══ O CAMINHO (portao.precisa) ═════════════════════════════════════
  fixo('porta_aco', 73, 1116, { visivel: true, revela: ['sala_fechada', 'rinha_alto'] }),
  treta('sala_fechada', 74, ALTO_POOL_ENTRADA, 0.35, { enemy: 1117, revela: ALTO_CINCO.map(c => c.id) }),
  ...ALTO_CINCO.map(cinco),
  treta('roda', 80, ALTO_POOL_RODA, 1, { enemy: 1216 }),
  // Dentro da sala dos Cinco e do escritório (./interiores.js).
  fixo('formacao_completa', 82, 1462, { recompensa: { rep: 8, item: 41, qtd: 3 } }),
  fixo('favor_devido', 83, 1118),
  // As fases-jogo do Contador (Isaias, 30/09/2026: "ele gosta de se divertir"):
  // ganha dele na porrinha e no bilhar antes da porrada (components/cena/jogos/).
  { id: 'jogo_porrinha', tipo: 'jogo', jogo: 'porrinha', i18n: 'games.gangues.cena.alto.jogo_porrinha', recompensa: { rep: 4 } },
  { id: 'jogo_bilhar', tipo: 'jogo', jogo: 'bilhar', i18n: 'games.gangues.cena.alto.jogo_bilhar', recompensa: { rep: 4 } },

  // ══ OPCIONAIS ═══════════════════════════════════════════════════════
  {
    id: 'rinha_alto',
    tipo: 'treta',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.alto.rinha_alto',
    rinhaInfinita: true,
    semGrana: true,
    revezamento: { pool: ALTO_POOL_RUA, budgetPorCorpo: 3, chanceDupla: 0.35, nivelDaTropa: true },
  },
  {
    id: 'birosca_alto',
    tipo: 'descanso',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.alto.birosca_alto',
    custoGrana: 50,
  },
  {
    // O agiota do Alto (Dívida do Alto, 1412 — trabalha direto pro Contador).
    id: 'divida_do_alto',
    tipo: 'agiota',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.alto.divida_do_alto',
    retratoEnemyId: 1412,
    custoGrana: 50,
    emprestimo: 1200,
  },
  {
    id: 'emporio',
    tipo: 'loja',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.alto.emporio',
    itens: [1, 2, 10, 34, 41, ...GANGUES_LOJA_EQUIP.alto],
  },
  {
    id: 'ferraria_alto',
    tipo: 'ferreiro',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.alto.ferraria_alto',
    tetoAprim: 8,
  },
  {
    // A mesa vazia da sala dos Cinco — onde eles quase viraram cúpula.
    id: 'mesa_dos_cinco',
    tipo: 'achado',
    opcional: true,
    i18n: 'games.gangues.cena.alto.mesa_dos_cinco',
    recompensa: { grana: 200, rep: 3, item: 34 },
  },
  // A linha do Retalho neste bairro (Laje — ver data/cenas/laje/pois.js): corta na porrada.
  poiLinha(LAJE_LINHAS.find(l => l.cena === 'alto')),
  {
    // O recado da Laje (sala dos fundos da birosca): a ponte pro território final —
    // destranca o Retalho (`__flags.laje`) e faz as linhas dele aparecerem nos bairros de baixo.
    id: 'informante_laje',
    tipo: 'papo',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.alto.informante_laje',
    escolhas: [{ id: 'ouvir', informante: 'laje' }],
  },
]
