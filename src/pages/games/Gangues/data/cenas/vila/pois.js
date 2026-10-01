// ── POIs da Vila (território 4) ──────────────────────────────────────
// Plano aprovado pelo Isaias em 30/09/2026 (docs/Games/Gangues/PLANO_VILA.md,
// GDD §4 Território 4). A Vila é a guerra mais dura da década: o Bonde dos
// Prédio segura o térreo e a escada como quartel, Os Andar de Cima moram da
// cobertura pra baixo. O pátio é livre; SUBIR é o jogo. Cada andar só abre
// batendo quem segura o patamar (`passagem.precisa`, ver ./interiores.js).
//
// LADDER (pontos de ficha por corpo, faixa da Vila 47–59):
//   47 guarita → 48 portaria (foge) → 49 cadeado (abre o Bloco A)
//   → 50 · 51 · 52 Trinco · 53 · 54 · 55 · 56 Bloco Inteiro (G) · 57 · 58 Chave Mestra (G)
//   → Ferrugem 59 na cobertura (+ os dois Generais de escolta, ~44 cada).
//
// BARRA DE ALERTA (`cena.alerta`, ver ./index.js): o Portaria corre avisando
// o bonde. Perder uma luta na Vila ou o elevador travar sobe o alerta; cada
// ponto soma +1 de ficha em todo corpo das tretas daqui (nunca passa do
// Ferrugem). Bater o Portaria desce; bater a última aparição dele zera.
import { VILA_POOL_TERREO, VILA_POOL_ESCADA, VILA_POOL_MEIO, VILA_POOL_ALTO } from './pools.js'
import { LAJE_LINHAS, poiLinha } from '../laje/pois.js'
import { GANGUES_LOJA_EQUIP } from '../../ganguesEquipDistribuicao.js'

// A chave do elevador (a Dona Neide entrega no 5º andar).
export const VILA_CHAVE_ELEVADOR_ID = 18

// Treta de rua/andar com revezamento (1 corpo, às vezes dupla).
function treta(id, pontos, pool, chanceDupla, extra) {
  return {
    id, tipo: 'treta', repetivel: true, nivelRec: pontos,
    i18n: `games.gangues.cena.vila.${id}`, recompensa: { rep: 4 },
    revezamento: { pool, budgetPorCorpo: pontos, chanceDupla },
    ...extra,
  }
}
// Treta de nível fixo contra UMA ficha (Trinco, Cadeado, os Generais).
function fixo(id, pontos, enemy, extra) {
  return {
    id, tipo: 'treta', repetivel: true, nivelRec: pontos,
    i18n: `games.gangues.cena.vila.${id}`, recompensa: { rep: 5 },
    enemy, fixo: true, pontosFixo: pontos,
    ...extra,
  }
}

export const POIS_VILA = [
  // ══ TÉRREO — o caminho até o Bloco A ═════════════════════════════════
  treta('guarita', 47, VILA_POOL_TERREO, 0.2, {
    visivel: true, enemy: 1110,
    revela: ['portaria_fuga_1', 'varal_patio', 'rinha_laje'],
  }),
  // O Portaria corre pro Bloco A gritando no rádio (pino grande, `fuga`).
  treta('portaria_fuga_1', 48, VILA_POOL_TERREO, 0.3, { fuga: true, enemy: 1110, revela: ['cadeado'] }),
  // O Cadeado toma conta do térreo — batido, o Bloco A abre.
  fixo('cadeado', 49, 1310),

  // ══ A SUBIDA (dentro do Bloco A — ver ./interiores.js) ═══════════════
  treta('andar_1', 50, VILA_POOL_ESCADA, 0.3, { enemy: 1111 }),
  treta('andar_2', 51, VILA_POOL_ESCADA, 0.35, { enemy: 1111 }),
  fixo('trinco', 52, 1311),
  treta('andar_4', 53, [1110, 1312, 1111], 0.4, { fuga: true, enemy: 1110 }),
  treta('condominio', 54, VILA_POOL_MEIO, 0.4, { enemy: 1211 }),
  // A última aparição do Portaria — batido, o rádio dele quebra e o alerta zera.
  treta('andar_6', 55, [1110, 1312, 1211], 0.45, { fuga: true, enemy: 1110 }),
  fixo('bloco_inteiro', 56, 1457, { recompensa: { rep: 6, equipPrimeiraVez: 405 } }),
  treta('goteira', 57, VILA_POOL_ALTO, 0.5, { enemy: 1407 }),
  fixo('chave_mestra', 58, 1458, { recompensa: { rep: 6, equipPrimeiraVez: 412 } }),

  // ══ OPCIONAIS ═══════════════════════════════════════════════════════
  {
    // O vizinho barulhento do pátio: cada conversa sorteia um boato.
    id: 'vizinho',
    tipo: 'papo',
    opcional: true,
    repetivel: true,
    visivel: true,
    i18n: 'games.gangues.cena.vila.vizinho',
    falasSorteadas: true,
    escolhas: [{ id: 'ouvir' }],
  },
  {
    id: 'varal_patio',
    tipo: 'achado',
    opcional: true,
    i18n: 'games.gangues.cena.vila.varal_patio',
    recompensa: { grana: 80, rep: 2, item: 34 },
  },
  {
    // A Rinha da Laje — o farm da Vila (rinha infinita, igual as outras).
    id: 'rinha_laje',
    tipo: 'treta',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.vila.rinha_laje',
    rinhaInfinita: true,
    semGrana: true,
    revezamento: { pool: VILA_POOL_TERREO, budgetPorCorpo: 3, chanceDupla: 0.35, nivelDaTropa: true },
  },
  {
    // Birosca do Térreo — descanso de baixo.
    id: 'birosca_vila',
    tipo: 'descanso',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.vila.birosca_vila',
    custoGrana: 30,
  },
  {
    // O agiota da Vila (Aluguel Vencido, 1408): a MESMA caderneta global.
    id: 'aluguel_vencido',
    tipo: 'agiota',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.vila.aluguel_vencido',
    retratoEnemyId: 1408,
    custoGrana: 30,
    emprestimo: 800,
  },
  {
    // O Brechó da Síndica: o PESADO dos 3 caminhos (GDD §9.7). 405 e 412 só
    // caem dos Generais.
    id: 'brecho',
    tipo: 'loja',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.vila.brecho',
    itens: [1, 2, 10, 34, 41, ...GANGUES_LOJA_EQUIP.vila],
  },
  {
    // A Oficina do Zelador — aprimoramento até +6.
    id: 'oficina_zelador',
    tipo: 'ferreiro',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.vila.oficina_zelador',
    tetoAprim: 6,
  },
  {
    // Apartamento da Dona Neide (5º andar): descanso no meio da subida.
    id: 'dona_neide_descanso',
    tipo: 'descanso',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.vila.dona_neide_descanso',
    custoGrana: 30,
  },
  {
    // A Dona Neide entrega a chave do elevador pra quem chegou até o 5º.
    id: 'dona_neide',
    tipo: 'papo',
    opcional: true,
    i18n: 'games.gangues.cena.vila.dona_neide',
    escolhas: [{ id: 'pega_chave', recompensa: { item: VILA_CHAVE_ELEVADOR_ID, qtd: 1 } }],
  },
  {
    // O elevador quebrado (hall, 5º e 9º): atalho entre andares JÁ liberados.
    // Cada viagem pode travar (`cena.elevador.chanceTravar`) — aí é emboscada.
    // Sem a chave, só leva do hall pro 1º andar.
    id: 'elevador',
    tipo: 'papo',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.vila.elevador',
    escolhas: [
      { id: 'terreo', elevador: { comodo: 0, pontos: 49 }, exigeItem: VILA_CHAVE_ELEVADOR_ID },
      { id: 'andar_1', elevador: { comodo: 1, pontos: 50 } },
      { id: 'andar_5', elevador: { comodo: 5, pontos: 54 }, exigeItem: VILA_CHAVE_ELEVADOR_ID, precisaResolvido: 'andar_4' },
      { id: 'andar_9', elevador: { comodo: 9, pontos: 58 }, exigeItem: VILA_CHAVE_ELEVADOR_ID, precisaResolvido: 'goteira' },
    ],
  },
  {
    id: 'apto_302',
    tipo: 'achado',
    opcional: true,
    i18n: 'games.gangues.cena.vila.apto_302',
    recompensa: { grana: 60, item: 31 },
  },
  {
    id: 'apto_604',
    tipo: 'achado',
    opcional: true,
    i18n: 'games.gangues.cena.vila.apto_604',
    recompensa: { grana: 40, item: 41 },
  },
  // O Zelador disfarçado no 801 — treta opcional, fixo.
  fixo('apto_801', 57, 1212, { opcional: true, repetivel: false, recompensa: { rep: 3, item: 41 } }),
  {
    // A caixa d'água da cobertura: achar o registro revela o ponto fraco do
    // Ferrugem (−2 Couro, `fraquezaChefe`). Errar dá choque e chama o zelador.
    id: 'caixa_dagua',
    tipo: 'parada',
    opcional: true,
    i18n: 'games.gangues.cena.vila.caixa_dagua',
    puzzle: { type: 'labirinto', config: { difficulty: 'hard' }, skin: 'fios' },
    recompensa: { rep: 2 },
    falha: { choque: 2, viraTreta: { enemy: 1212, revezamento: { pool: VILA_POOL_ALTO, budgetPorCorpo: 57, chanceDupla: 0 }, semTravar: true } },
  },
  {
    // O recado do Morro (sala dos fundos da birosca): a ponte pro 5º
    // território — destranca a Zefa (`__flags.morro`, ver `precisaInformante`)
    // e faz aparecer os avais nos bairros de baixo.
    id: 'informante_morro',
    tipo: 'papo',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.vila.informante_morro',
    escolhas: [{ id: 'ouvir', informante: 'morro' }],
  },
  // A linha do Retalho neste bairro (Laje — ver data/cenas/laje/pois.js): corta na porrada.
  poiLinha(LAJE_LINHAS.find(l => l.cena === 'vila')),
]
