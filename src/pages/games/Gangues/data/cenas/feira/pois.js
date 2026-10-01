// ── POIs da Feira (território 2) ─────────────────────────────────────
// Plano completo em docs/Games/Gangues/PLANO_FEIRA.md. Aqui não tem tiro —
// tem DÍVIDA e LUZ: o Acerto de Contas anota o nome de todo mundo na caderneta
// do Turco, Os Gato mandam na energia. Tudo que a Pista tem volta numa versão
// "upgrade" (tabela da §1 do plano).
//
// LADDER (pontos de ficha por corpo — nível real = pontos − 6):
//   26 catraca (1ª luta, suave de propósito — o último degrau comum da Pista)
//   → 29 cobrança → 32 beco dos Gato → 35 balança / caderneta
//   → 38 Mão do Turco (General) → 41 Caixa Forte (General)
//   → 44 / 47 os dois do depósito → Cobrador 52 (+ 2 escoltas de 29).
// A Galeria (dungeon de passagem, 23/26/29) fica ABAIXO da rua, igual o túnel
// da Pista: é caminho, não teste.
import { FEIRA_POOL_RUA, FEIRA_POOL_COBRANCA, FEIRA_POOL_MERCADAO } from './pools.js'
import { LAJE_LINHAS, poiLinha } from '../laje/pois.js'

// Rep pra encarar o 2º guarda do depósito (gate do Mercadão).
export const FEIRA_REP_GATE_DEPOSITO = 60

export const POIS_FEIRA = [
  // ══ CAMINHO PRINCIPAL (portao.precisa) ══════════════════════════════
  {
    // 1ª luta da Feira — Os Gato cobram pedágio de quem entra.
    id: 'catraca',
    tipo: 'treta',
    nivelRec: 22,
    repetivel: true,
    visivel: true,
    i18n: 'games.gangues.cena.feira.catraca',
    revezamento: { pool: FEIRA_POOL_RUA, budgetPorCorpo: 22, chanceDupla: 0.15 },
    recompensa: { rep: 2 },
    revela: ['banca_turco', 'camelo'],
  },
  {
    // A banca do Turco: onde o nome de todo mundo vai pra caderneta. Se a
    // gangue já deve ao agiota, o Turco SABE (fala própria — `falaDevedor`).
    id: 'banca_turco',
    tipo: 'papo',
    i18n: 'games.gangues.cena.feira.banca_turco',
    retratoEnemyId: 1305,
    falaDevedor: true,
    escolhas: [
      { id: 'paga_taxa', custoGrana: 20, recompensa: { rep: 1 }, revela: ['cobranca'] },
      { id: 'nao_paga', recompensa: { rep: 2 }, revela: ['cobranca'] },
    ],
  },
  {
    id: 'cobranca',
    tipo: 'treta',
    nivelRec: 23,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.cobranca',
    revezamento: { pool: FEIRA_POOL_COBRANCA, budgetPorCorpo: 23, chanceDupla: 0.4 },
    recompensa: { rep: 3 },
    revela: ['quadro_luz'],
  },
  {
    // O Quadro de Luz — ligar o gato sem levar choque (labirinto de fios).
    // Falhar dá choque (−2 PV na tropa) e vira treta, sem travar o ponto.
    id: 'quadro_luz',
    tipo: 'parada',
    i18n: 'games.gangues.cena.feira.quadro_luz',
    puzzle: { type: 'labirinto', config: { difficulty: 'medium' }, skin: 'fios' },
    recompensa: { grana: 20, item: 14 },
    falha: { choque: 2, viraTreta: { enemy: 1106, revezamento: { pool: FEIRA_POOL_RUA, budgetPorCorpo: 23, chanceDupla: 0.1 }, semTravar: true } },
    revela: ['beco_gato', 'pagina_1'],
  },
  {
    id: 'beco_gato',
    tipo: 'treta',
    nivelRec: 25,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.beco_gato',
    revezamento: { pool: FEIRA_POOL_RUA, budgetPorCorpo: 25, chanceDupla: 0.4 },
    recompensa: { rep: 3 },
    revela: ['balanca', 'muamba'],
  },
  {
    // A Balança do Pesagem — dá a 1ª válvula do rádio (só na 1ª vitória).
    id: 'balanca',
    tipo: 'treta',
    nivelRec: 26,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.balanca',
    revezamento: { pool: FEIRA_POOL_COBRANCA, budgetPorCorpo: 26, chanceDupla: 0.4 },
    recompensa: { rep: 3, itemPrimeiraVez: 15 },
    revela: ['caderneta_viva'],
  },
  {
    // O Caderneta (1305) sabe o que cada um deve — contra devedor ele fica
    // mais ligeiro (+1 de Pique enquanto a dívida com o agiota existir).
    id: 'caderneta_viva',
    tipo: 'treta',
    nivelRec: 26,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.caderneta_viva',
    enemy: 1305,
    fixo: true,
    pontosFixo: 26,
    inimigoBonusSeDivida: { H: 1 },
    recompensa: { rep: 3 },
  },
  {
    // General 1 — só aparece depois do rádio consertado (o rádio pega a
    // frequência do Acerto de Contas e entrega onde ele fica).
    id: 'mao_turco',
    tipo: 'treta',
    nivelRec: 27,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.mao_turco',
    enemy: 1453,
    fixo: true,
    pontosFixo: 27,
    recompensa: { rep: 5, equipPrimeiraVez: 236 }, // Olho Grego (merge 29/09: o Pingente de Asa saiu com o catálogo por caminho)
    revela: ['caixa_forte'],
  },
  {
    // General 2 — o cofre da Feira: vencer DOBRA a grana da luta, e a 1ª
    // vitória rende o Colete de Placa (221, incomum do Paredão).
    id: 'caixa_forte',
    tipo: 'treta',
    nivelRec: 28,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.caixa_forte',
    enemy: 1454,
    fixo: true,
    pontosFixo: 28,
    recompensa: { rep: 6, granaMult: 2, equipPrimeiraVez: 221 },
  },
  {
    // A oficina de rádio do Toninho (DENTRO do prédio `radio`) — fetch quest:
    // 3 válvulas (item 15) + 1 fio de cobre (item 14). Válvula 1 = balança,
    // 2 = a muamba de domingo, 3 = comprada no camelô. Consertado, o rádio
    // pega a frequência do Acerto de Contas: revela o 1º General e o rádio
    // pirata (a ponte pra Baixada).
    id: 'radio',
    tipo: 'papo',
    i18n: 'games.gangues.cena.feira.radio',
    escolhas: [
      { id: 'consertar', precisaItens: { 14: 1, 15: 3 }, recompensa: { rep: 3 }, revela: ['mao_turco', 'radio_pirata'] },
    ],
  },

  // ══ OPCIONAIS ═══════════════════════════════════════════════════════
  {
    // O Camelô — os consumíveis novos (e a válvula 3). Pechincha: acertou o
    // anagrama, leva com desconto nesta visita.
    id: 'camelo',
    tipo: 'loja',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.camelo',
    retratoEnemyId: 1205,
    itens: [1, 2, 3, 4, 6, 8, 10, 11, 12, 13, 15],
    pechincha: { desconto: 0.3 },
  },
  {
    // A Muamba de Domingo — stealth com cronômetro no meio da feira. Dá a
    // válvula 2 do rádio.
    id: 'muamba',
    tipo: 'corre',
    opcional: true,
    i18n: 'games.gangues.cena.feira.muamba',
    puzzle: { type: 'stealth', config: { size: 6, cameraCount: 3, visionRange: 1, hasTimer: true }, skin: 'rapa' },
    recompensa: { grana: 40, rep: 3, item: 15 },
  },
  // ── Favores da Dona Regina (pagam o fiado da pensão — ver __regina) ──
  {
    id: 'favor_marmita',
    tipo: 'corre',
    opcional: true,
    repetivel: true,
    visivel: true,
    i18n: 'games.gangues.cena.feira.favor_marmita',
    puzzle: { type: 'stealth', config: { size: 5, cameraCount: 2, visionRange: 1, hasTimer: false }, skin: 'rapa' },
    recompensa: { grana: 10, rep: 1, pagaFavor: true },
  },
  {
    id: 'favor_devedor',
    tipo: 'papo',
    opcional: true,
    repetivel: true,
    visivel: true,
    i18n: 'games.gangues.cena.feira.favor_devedor',
    retratoEnemyId: 1105,
    escolhas: [
      { id: 'convence', recompensa: { rep: 2, pagaFavor: true } },
      { id: 'aperta', viraTreta: { enemy: 1105, rep: -1, recompensa: { pagaFavor: true }, revezamento: { pool: [1105], budgetPorCorpo: 22, chanceDupla: 0 } } },
    ],
  },
  {
    id: 'favor_cobrador',
    tipo: 'treta',
    opcional: true,
    repetivel: true,
    visivel: true,
    i18n: 'games.gangues.cena.feira.favor_cobrador',
    revezamento: { pool: FEIRA_POOL_RUA, budgetPorCorpo: 3, chanceDupla: 0.35, ratioComTime: 1, baseMaisForte: true },
    recompensa: { rep: 2, pagaFavor: true },
  },
  // ── As 3 páginas da Caderneta do Turco: com as 3, o Cobrador entra na luta
  // com −2 de Couro (ver `fraquezaChefe` em index.js). ──
  {
    id: 'pagina_1',
    tipo: 'achado',
    opcional: true,
    i18n: 'games.gangues.cena.feira.pagina_1',
    recompensa: { grana: 15, rep: 1 },
  },
  {
    id: 'pagina_2',
    tipo: 'achado',
    opcional: true,
    pos_portao: true,
    i18n: 'games.gangues.cena.feira.pagina_2',
    recompensa: { grana: 20, rep: 1 },
  },
  {
    // O rádio pirata (dentro da oficina de rádio, depois de consertar):
    // boato da Feira + a ponte pra Baixada — destranca o chefe de lá, igual o
    // Duda faz pra Feira (`__flags.baixada`, ver `precisaInformante`).
    id: 'radio_pirata',
    tipo: 'papo',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.radio_pirata',
    escolhas: [
      { id: 'ouvir', informante: 'baixada' },
    ],
  },
  {
    // Pensão da Dona Regina — descanso da Feira (15 / 45) com FIADO POR FAVOR:
    // sem grana, ela cura igual e a gangue fica devendo 1 favor (ver
    // `fiadoFavor` em GanguesDescanso.jsx e storyProgress.__regina).
    id: 'pensao',
    tipo: 'descanso',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.pensao',
    custoGrana: 15,
    fiadoFavor: true,
  },
  {
    // O agiota da Feira (Juro Alto, 1404, do Acerto de Contas): MESMA
    // caderneta global do Marimbondo, degrau maior — empréstimo de 300.
    id: 'juro_alto',
    tipo: 'agiota',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.juro_alto',
    retratoEnemyId: 1404,
    custoGrana: 15,
    emprestimo: 300,
  },

  // ══ LADO APAGADO (depois da barricada) ═══════════════════════════════
  {
    id: 'deposito_1',
    tipo: 'treta',
    nivelRec: 30,
    repetivel: true,
    pos_portao: true,
    i18n: 'games.gangues.cena.feira.deposito_1',
    revezamento: { pool: FEIRA_POOL_MERCADAO, budgetPorCorpo: 30, chanceDupla: 0.5 },
    recompensa: { rep: 4 },
    revela: ['deposito_2'],
  },
  {
    id: 'deposito_2',
    tipo: 'treta',
    nivelRec: 31,
    repetivel: true,
    repGate: FEIRA_REP_GATE_DEPOSITO,
    i18n: 'games.gangues.cena.feira.deposito_2',
    revezamento: { pool: [1403, 1404, 1304], budgetPorCorpo: 31, chanceDupla: 0.6 },
    recompensa: { rep: 5, item: 21, qtd: 1 },
  },
  {
    // A Rinha da Feira — o farm do bairro. Sem aposta (Isaias, 30/09/2026:
    // aposta só na birosca); o id `rinha_apostas` fica por causa dos saves.
    id: 'rinha_apostas',
    tipo: 'treta',
    opcional: true,
    repetivel: true,
    pos_portao: true,
    i18n: 'games.gangues.cena.feira.rinha_apostas',
    // RINHA INFINITA (igual a Rinha da Pista): luta atrás de luta com
    // adversário sorteado.
    rinhaInfinita: true,
    revezamento: { pool: FEIRA_POOL_RUA, budgetPorCorpo: 3, chanceDupla: 0.35, nivelDaTropa: true },
  },
  {
    id: 'mercearia',
    tipo: 'loja',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.mercearia',
    // Catálogo por caminho (merge 29/09/2026, GDD §9.7): a Feira vende o
    // INCOMUM dos 3 caminhos — nada que a Pista já vende.
    itens: [1, 2, 4, 10, 34, 207, 208, 209, 210, 211, 212, 219, 220, 221, 222, 223, 224, 231, 232, 233, 234, 235, 236],
  },
  {
    // A Serralheria do Bigode — aprimoramento até +4 (o Nando da Pista só +1).
    id: 'serralheria',
    tipo: 'ferreiro',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.serralheria',
    tetoAprim: 4,
  },
  {
    id: 'pensao_2',
    tipo: 'descanso',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.feira.pensao_2',
    custoGrana: 15,
    fiadoFavor: true,
  },
  {
    // Os rádios dos Fogueteiro: 3 válvulas (Camelô) abrem o 2º portão.
    // Só aparece depois do recado do Morro (`__flags.morro`, Vila) e abre um
    // dos portões da escadaria (BARREIRAS_MORRO, data/cenas/morro/mundo.js).
    id: 'aval_morro_feira',
    tipo: 'papo',
    opcional: true,
    i18n: 'games.gangues.cena.aval.aval_morro_feira',
    escolhas: [{ id: 'entregar', precisaItens: { 15: 3 }, informante: 'morro_feira' }],
  },
  // A linha do Retalho neste bairro (Laje — ver data/cenas/laje/pois.js): corta na porrada.
  poiLinha(LAJE_LINHAS.find(l => l.cena === 'feira')),
]
