// ── INTERIORES navegáveis da Feira ──────────────────────────────────────
// Mesmo formato dos da Pista (ver data/cenas/pista/interiores.js pra todas
// as notas de colisão/porta larga — a geometria dos cômodos aqui é a mesma,
// já validada lá). `pois[].ref` reaproveita um POI de pois.js; `pois[].poi` é
// um POI completo que só existe dentro do cômodo (tretas de dungeon).
import { portaFundos, salaDosFundos } from '../salaDosFundos.js'
import { FEIRA_POOL_GATO, FEIRA_POOL_MERCADAO } from './pools.js'
import { FEIRA_REP_GATE_DEPOSITO } from './pois.js'

// Sala pequena de um cômodo (pensão, rádio, mercearia, serralheria) — a mesma
// caixa da birosca/oficina/loja da Pista, só muda o cenário e os pinos.
function sala({ id, w, h, balcao, cenario, pois }) {
  return {
    id,
    world: { w, h }, spawn: { x: w / 2, y: h - 84 },
    saida: { x: w / 2 - 80, y: h - 20, w: 160, h: 20 },
    colliders: [
      { x: 0, y: 0, w, h: 30 }, { x: 0, y: 0, w: 14, h }, { x: w - 14, y: 0, w: 14, h },
      { x: 0, y: h - 6, w: w / 2 - 80, h: 10 }, { x: w / 2 + 80, y: h - 6, w: w / 2 - 80, h: 10 },
      ...(balcao ? [balcao] : []),
    ],
    cenario,
    pois,
  }
}

// ── Labirinto das barracas (Mercadão) ──
// Sala comprida (460×900) com 3 fileiras de barraca atravessando a largura,
// cada uma com UM vão (110px) alternando de lado — o caminho vira um
// zigue-zague. `gaps` diz o lado do vão de baixo pra cima. A 1ª briga fica no
// 1º corredor, colada no vão que leva pra cima; a 2ª só aparece depois da 1ª
// (`precisa`), no vão da fileira seguinte; a passagem pro próximo cômodo, lá
// em cima, só abre depois da 2ª. Cada fileira é UM colisor, com as barracas
// desenhadas lado a lado em cima (tipo `barraca`, CenaInterior).
const LAB_W = 460
const LAB_H = 900
const LAB_VAO = 110
const LAB_FILEIRAS_Y = [660, 440, 220]
const LAB_FILEIRA_H = 56
const LONAS = ['#c8453a', '#3a7bc8', '#d9a12a', '#4a9a5a', '#8a4ac8']
function fileiraDeBarracas(y, gap, lona) {
  const x = gap === 'esq' ? 14 + LAB_VAO : 14
  const w = LAB_W - 28 - LAB_VAO
  const n = Math.round(w / 64)
  const bw = w / n
  return {
    collider: { x, y, w, h: LAB_FILEIRA_H },
    cenario: Array.from({ length: n }, (_, i) => ({
      tipo: 'barraca', x: Math.round(x + bw * i + bw / 2), y: y + LAB_FILEIRA_H / 2,
      w: Math.round(bw - 6), h: LAB_FILEIRA_H - 10, lona: LONAS[(lona + i) % LONAS.length],
    })),
  }
}
// Centro do vão da fileira `k` (0 = a de baixo), um pouco acima dela — onde a
// briga fica de tocaia.
function noVao(k, gaps) {
  return { x: gaps[k] === 'esq' ? 14 + LAB_VAO / 2 : LAB_W - 14 - LAB_VAO / 2, y: LAB_FILEIRAS_Y[k] - 70 }
}
function salaLabirinto({ id, gaps, lona, entrada, voltaPara, briga1, briga2, extras = [], passagem }) {
  const fileiras = gaps.map((g, k) => fileiraDeBarracas(LAB_FILEIRAS_Y[k], g, lona + k))
  const treta = b => ({ ...b, tipo: 'treta', repetivel: true, i18n: `games.gangues.cena.feira.mercadao.${b.id}`, recompensa: { rep: 3 } })
  // A passagem fica em cima, do lado do último vão (o jogador chega por ali).
  const ultimo = gaps[gaps.length - 1]
  const pgX = ultimo === 'esq' ? 40 : LAB_W - 120
  return {
    id,
    world: { w: LAB_W, h: LAB_H }, spawn: { x: LAB_W / 2, y: LAB_H - 80 },
    saida: entrada ? { x: LAB_W / 2 - 80, y: LAB_H - 20, w: 160, h: 20 } : null,
    ...(voltaPara != null ? { voltaPara } : {}),
    colliders: [
      { x: 0, y: 0, w: LAB_W, h: 30 }, { x: 0, y: 0, w: 14, h: LAB_H }, { x: LAB_W - 14, y: 0, w: 14, h: LAB_H },
      ...(entrada
        ? [{ x: 0, y: LAB_H - 6, w: LAB_W / 2 - 80, h: 10 }, { x: LAB_W / 2 + 80, y: LAB_H - 6, w: LAB_W / 2 - 80, h: 10 }]
        : [{ x: 0, y: LAB_H - 28, w: LAB_W, h: 28 }]),
      ...fileiras.map(f => f.collider),
    ],
    cenario: [{ tipo: 'chao-galpao' }, ...fileiras.flatMap(f => f.cenario)],
    pois: [
      { poi: treta(briga1), pos: noVao(0, gaps) },
      { poi: treta(briga2), pos: noVao(1, gaps), precisa: briga1.id },
      ...extras,
    ],
    passagem: { x: pgX, y: 34, w: 80, h: 24, para: passagem, precisa: briga2.id, label: 'avancar' },
  }
}

export const INTERIORES_FEIRA = {
  // ── Pensão da Dona Regina (descanso + o agiota da Feira) ──
  pensao: {
    nome: 'games.gangues.cena.feira.int.pensao',
    porta: { predio: 'pensao' },
    comodos: [{ ...sala({
      id: 'sala', w: 460, h: 320,
      balcao: { x: 108, y: 66, w: 244, h: 40 },
      cenario: [
        { tipo: 'balcao', x: 230, y: 86, w: 240 }, { tipo: 'geladeira-refri', x: 66, y: 120 },
        { tipo: 'mesa', x: 120, y: 210 }, { tipo: 'mesa', x: 340, y: 220 }, { tipo: 'cartaz', x: 230, y: 40 },
      ],
      pois: [
        { ref: 'pensao', pos: { x: 74, y: 210 } },
      ],
    }), passagem: portaFundos(460) }, salaDosFundos(['juro_alto', { ref: 'aval_morro_feira', precisaFlag: 'morro' }, { ref: 'linha_feira', precisaFlag: 'laje' }])],
  },
  // ── Oficina de rádio do Toninho ──
  radio: {
    nome: 'games.gangues.cena.feira.int.radio',
    porta: { predio: 'radio' },
    comodos: [sala({
      id: 'bancada', w: 420, h: 300,
      balcao: { x: 90, y: 60, w: 240, h: 44 },
      cenario: [
        { tipo: 'bancada', x: 210, y: 82, w: 236 }, { tipo: 'tv', x: 360, y: 60 },
        { tipo: 'peca-exposta', x: 360, y: 150 }, { tipo: 'ferramentas', x: 210, y: 44 },
      ],
      pois: [
        { ref: 'radio', pos: { x: 200, y: 120 } },
        // o rádio pirata só existe depois do rádio consertado
        { ref: 'radio_pirata', pos: { x: 110, y: 200 }, precisa: 'radio' },
      ],
    })],
  },
  // ── Mercearia do Seu Aziz (lado apagado) ──
  mercearia: {
    nome: 'games.gangues.cena.feira.int.mercearia',
    porta: { predio: 'mercearia', posPortao: true },
    comodos: [{
      ...sala({
        id: 'mercearia', w: 440, h: 320,
        balcao: { x: 96, y: 70, w: 250, h: 40 },
        cenario: [
          { tipo: 'caixa-loja', x: 220, y: 90, w: 246 },
          { tipo: 'prateleira', x: 60, y: 200, w: 76, h: 116 }, { tipo: 'prateleira', x: 380, y: 200, w: 76, h: 116 },
          { tipo: 'cartaz', x: 220, y: 44 },
        ],
        pois: [{ ref: 'mercearia', pos: { x: 200, y: 122 } }],
      }),
      // prateleiras laterais sólidas
      colliders: [
        { x: 0, y: 0, w: 440, h: 30 }, { x: 0, y: 0, w: 14, h: 320 }, { x: 426, y: 0, w: 14, h: 320 },
        { x: 0, y: 314, w: 140, h: 10 }, { x: 300, y: 314, w: 140, h: 10 },
        { x: 96, y: 70, w: 250, h: 40 }, { x: 20, y: 140, w: 80, h: 120 }, { x: 340, y: 140, w: 80, h: 120 },
      ],
    }],
  },
  // ── Serralheria do Bigode (lado apagado) — aprimoramento até +4 ──
  serralheria: {
    nome: 'games.gangues.cena.feira.int.serralheria',
    porta: { predio: 'serralheria', posPortao: true },
    comodos: [sala({
      id: 'forja', w: 420, h: 300,
      balcao: { x: 90, y: 60, w: 240, h: 44 },
      cenario: [
        { tipo: 'bancada', x: 210, y: 82, w: 236 }, { tipo: 'ferramentas', x: 210, y: 44 },
        { tipo: 'pneu', x: 60, y: 210 }, { tipo: 'peca-exposta', x: 360, y: 150 },
      ],
      pois: [{ ref: 'serralheria', pos: { x: 200, y: 130 } }],
    })],
  },
  // ── A pensão da filha da Regina (lado apagado) ──
  pensao_2: {
    nome: 'games.gangues.cena.feira.int.pensao_2',
    porta: { predio: 'pensao2', posPortao: true },
    comodos: [sala({
      id: 'sala', w: 440, h: 300,
      balcao: { x: 100, y: 58, w: 240, h: 40 },
      cenario: [
        { tipo: 'balcao', x: 220, y: 78, w: 236 }, { tipo: 'geladeira-refri', x: 60, y: 118 },
        { tipo: 'mesa', x: 120, y: 200 }, { tipo: 'cartaz', x: 220, y: 40 },
      ],
      pois: [{ ref: 'pensao_2', pos: { x: 220, y: 130 } }],
    })],
  },

  // ── A GALERIA DOS GATO — por baixo da barricada (3 cômodos, escura) ──
  // Destranca quando os 10 pontos do caminho principal caem (gate 'portao').
  galeria: {
    nome: 'games.gangues.cena.feira.int.galeria',
    porta: { predio: 'galeria_ent' },
    gate: 'portao',
    // Os Gato cortaram a luz: lá dentro só se enxerga em volta do jogador.
    escuro: true,
    comodos: [
      {
        id: 'boca',
        world: { w: 380, h: 340 }, spawn: { x: 190, y: 288 },
        saida: { x: 110, y: 302, w: 160, h: 20 },
        colliders: [
          { x: 0, y: 0, w: 380, h: 28 }, { x: 0, y: 0, w: 34, h: 340 }, { x: 346, y: 0, w: 34, h: 340 },
          { x: 0, y: 334, w: 110, h: 10 }, { x: 270, y: 334, w: 110, h: 10 },
          { x: 270, y: 70, w: 70, h: 60 },
        ],
        cenario: [{ tipo: 'chao-tunel' }, { tipo: 'escombro', x: 305, y: 100 }, { tipo: 'lampada-tunel', x: 190, y: 40 }],
        pois: [
          { poi: { id: 'galeria_m1', tipo: 'treta', repetivel: true, nivelRec: 21, revezamento: { pool: FEIRA_POOL_GATO, budgetPorCorpo: 21, chanceDupla: 0.25 }, i18n: 'games.gangues.cena.feira.galeria.m1', recompensa: { rep: 2 } }, pos: { x: 190, y: 130 } },
        ],
        passagem: { x: 150, y: 30, w: 80, h: 24, para: 1, precisa: 'galeria_m1', label: 'avancar' },
      },
      {
        id: 'meio',
        world: { w: 360, h: 420 }, spawn: { x: 180, y: 378 },
        voltaPara: 0,
        colliders: [
          { x: 0, y: 0, w: 360, h: 28 }, { x: 0, y: 0, w: 40, h: 420 }, { x: 320, y: 0, w: 40, h: 420 }, { x: 0, y: 392, w: 360, h: 28 },
        ],
        cenario: [{ tipo: 'chao-tunel' }, { tipo: 'lampada-tunel', x: 180, y: 40 }, { tipo: 'lampada-tunel', x: 180, y: 230 }, { tipo: 'escombro', x: 70, y: 300 }],
        pois: [
          // A porta do meio abre com o código do gato (decoder). Errar vira
          // treta sem travar — dá pra tentar de novo.
          { poi: { id: 'galeria_porta', tipo: 'parada', i18n: 'games.gangues.cena.feira.galeria.porta', puzzle: { type: 'decoder', config: { difficulty: 'easy' }, skin: 'gato' }, falha: { viraTreta: { enemy: 1104, revezamento: { pool: FEIRA_POOL_GATO, budgetPorCorpo: 22, chanceDupla: 0.1 }, semTravar: true } } }, pos: { x: 180, y: 300 } },
          { poi: { id: 'galeria_m2', tipo: 'treta', repetivel: true, nivelRec: 22, revezamento: { pool: FEIRA_POOL_GATO, budgetPorCorpo: 22, chanceDupla: 0.45 }, i18n: 'games.gangues.cena.feira.galeria.m2', recompensa: { rep: 3 } }, pos: { x: 180, y: 190 }, precisa: 'galeria_porta' },
          { poi: { id: 'pagina_3', tipo: 'achado', opcional: true, i18n: 'games.gangues.cena.feira.pagina_3', recompensa: { grana: 15, rep: 1, item: 5 } }, pos: { x: 290, y: 120 } },
        ],
        passagem: { x: 140, y: 30, w: 80, h: 24, para: 2, precisa: 'galeria_m2', label: 'avancar' },
      },
      {
        id: 'saida',
        world: { w: 380, h: 340 }, spawn: { x: 190, y: 288 },
        voltaPara: 1,
        saida: { x: 110, y: 30, w: 160, h: 22, paraPredio: 'galeria_sai' },
        colliders: [
          { x: 0, y: 0, w: 110, h: 2 }, { x: 270, y: 0, w: 110, h: 2 },
          { x: 0, y: 0, w: 34, h: 340 }, { x: 346, y: 0, w: 34, h: 340 }, { x: 0, y: 312, w: 380, h: 28 },
          { x: 50, y: 80, w: 70, h: 60 },
        ],
        cenario: [{ tipo: 'chao-tunel' }, { tipo: 'lampada-tunel', x: 190, y: 60 }, { tipo: 'escombro', x: 85, y: 110 }],
        pois: [
          { poi: { id: 'galeria_m3', tipo: 'treta', repetivel: true, nivelRec: 23, revezamento: { pool: FEIRA_POOL_GATO, budgetPorCorpo: 23, chanceDupla: 0.3 }, i18n: 'games.gangues.cena.feira.galeria.m3', recompensa: { rep: 2 } }, pos: { x: 190, y: 180 } },
        ],
      },
    ],
  },

  // ── O MERCADÃO do Cobrador — dungeon final: o LABIRINTO DAS BARRACAS ──
  // Pedido do Isaias (27/09/2026): "praticamente um mini labirinto com as
  // barraquinhas de feira e você tem que sair enfrentando um monte de cara
  // pra chegar no chefe... pelo menos umas seis ou sete batalhas". Três salas
  // de barracas em zigue-zague (2 brigas cada, a 2ª só aparece depois da 1ª e
  // a passagem só abre depois da 2ª — não dá pra passar reto), o fundo com o
  // Marreta (7ª) e o livro-caixa, e o cofre do Cobrador. Destranca depois do
  // 2º guarda do depósito.
  mercadao: {
    nome: 'games.gangues.cena.feira.int.mercadao',
    porta: { predio: 'mercadao', posPortao: true },
    abreComResolvido: 'deposito_2',
    comodos: [
      salaLabirinto({
        id: 'entrada', gaps: ['esq', 'dir', 'esq'], lona: 0, entrada: true,
        briga1: { id: 'barraca_1', nivelRec: 30, revezamento: { pool: FEIRA_POOL_MERCADAO, budgetPorCorpo: 30, chanceDupla: 0.3 } },
        briga2: { id: 'barraca_2', nivelRec: 30, revezamento: { pool: FEIRA_POOL_MERCADAO, budgetPorCorpo: 6, qtdMin: 3, qtdMax: 5, ratioComTime: 0.4 } },
        passagem: 1,
      }),
      salaLabirinto({
        id: 'lonas', gaps: ['dir', 'esq', 'dir'], lona: 2, voltaPara: 0,
        briga1: { id: 'barraca_3', nivelRec: 31, revezamento: { pool: FEIRA_POOL_MERCADAO, budgetPorCorpo: 31, chanceDupla: 0.4 } },
        briga2: { id: 'barraca_4', nivelRec: 31, revezamento: { pool: FEIRA_POOL_MERCADAO, budgetPorCorpo: 31, chanceDupla: 0.5 } },
        // O estoque escondido do Turco fica num canto do labirinto (opcional).
        extras: [{ poi: { id: 'mercadao_achado', tipo: 'achado', opcional: true, i18n: 'games.gangues.cena.feira.mercadao.achado', recompensa: { grana: 25, item: 13, qtd: 2, equip: 212 } }, pos: { x: 60, y: 110 } }],
        passagem: 2,
      }),
      salaLabirinto({
        id: 'praca', gaps: ['esq', 'dir', 'esq'], lona: 4, voltaPara: 1,
        briga1: { id: 'barraca_5', nivelRec: 31, revezamento: { pool: FEIRA_POOL_MERCADAO, budgetPorCorpo: 31, chanceDupla: 0.5 } },
        briga2: { id: 'barraca_6', nivelRec: 32, revezamento: { pool: FEIRA_POOL_MERCADAO, budgetPorCorpo: 32, chanceDupla: 0.6 } },
        passagem: 3,
      }),
      {
        id: 'fundo',
        world: { w: 440, h: 380 }, spawn: { x: 220, y: 300 },
        saida: null,
        voltaPara: 2,
        colliders: [
          { x: 0, y: 0, w: 440, h: 30 }, { x: 0, y: 0, w: 14, h: 380 }, { x: 426, y: 0, w: 14, h: 380 }, { x: 0, y: 352, w: 440, h: 28 },
          { x: 20, y: 120, w: 60, h: 200 }, { x: 330, y: 70, w: 96, h: 40 },
        ],
        cenario: [
          { tipo: 'prateleira-alta', x: 50, y: 220, w: 56, h: 196 }, { tipo: 'mesa-escritorio', x: 378, y: 90, w: 96 },
          { tipo: 'quadro-horarios', x: 380, y: 200 }, { tipo: 'chao-galpao' },
        ],
        pois: [
          // 7ª briga: o Marreta e o bando dele guardam a porta do cofre.
          { poi: { id: 'mercadao_m2', tipo: 'treta', repetivel: true, nivelRec: 31, enemy: 1403, liderFixo: 1403, repGate: FEIRA_REP_GATE_DEPOSITO, moldesPool: FEIRA_POOL_MERCADAO, pontosFixo: 28, qtdMin: 3, qtdMax: 5, i18n: 'games.gangues.cena.feira.mercadao.m2', recompensa: { rep: 4 } }, pos: { x: 220, y: 170 } },
          // O livro-caixa do Turco: quanto a Feira inteira deve. Com as 3
          // páginas da caderneta na mão, o ponto fraco do Cobrador fica claro.
          { poi: { id: 'livro_caixa', tipo: 'papo', opcional: true, repetivel: true, i18n: 'games.gangues.cena.feira.mercadao.livro_caixa', escolhas: [{ id: 'ler' }] }, pos: { x: 378, y: 150 } },
        ],
        passagem: { x: 180, y: 34, w: 80, h: 24, para: 4, precisa: 'mercadao_m2', label: 'avancar' },
      },
      {
        id: 'cofre',
        world: { w: 520, h: 400 }, spawn: { x: 260, y: 320 },
        saida: null,
        voltaPara: 3,
        colliders: [
          { x: 0, y: 0, w: 520, h: 30 }, { x: 0, y: 0, w: 14, h: 400 }, { x: 506, y: 0, w: 14, h: 400 }, { x: 0, y: 372, w: 520, h: 28 },
        ],
        cenario: [
          { tipo: 'chao-galpao' }, { tipo: 'luz-facho', x: 260, y: 150 },
          { tipo: 'cofre', x: 90, y: 300 }, { tipo: 'cofre', x: 430, y: 310 },
        ],
        pois: [
          { ref: '__chefe', pos: { x: 260, y: 120 } },
        ],
      },
    ],
  },
}
