// ── INTERIORES navegáveis da Feira ──────────────────────────────────────
// Mesmo formato dos da Pista (ver data/cenas/pista/interiores.js pra todas
// as notas de colisão/porta larga — a geometria dos cômodos aqui é a mesma,
// já validada lá). `pois[].ref` reaproveita um POI de pois.js; `pois[].poi` é
// um POI completo que só existe dentro do cômodo (tretas de dungeon).
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

export const INTERIORES_FEIRA = {
  // ── Pensão da Dona Regina (descanso + o agiota da Feira) ──
  pensao: {
    nome: 'games.gangues.cena.feira.int.pensao',
    porta: { predio: 'pensao' },
    comodos: [sala({
      id: 'sala', w: 460, h: 320,
      balcao: { x: 108, y: 66, w: 244, h: 40 },
      cenario: [
        { tipo: 'balcao', x: 230, y: 86, w: 240 }, { tipo: 'geladeira-refri', x: 66, y: 120 },
        { tipo: 'mesa', x: 120, y: 210 }, { tipo: 'mesa', x: 340, y: 220 }, { tipo: 'cartaz', x: 230, y: 40 },
      ],
      pois: [
        { ref: 'pensao', pos: { x: 74, y: 210 } },
        { ref: 'juro_alto', pos: { x: 390, y: 200 } },
      ],
    })],
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
          { poi: { id: 'galeria_m1', tipo: 'treta', repetivel: true, nivelRec: 23, revezamento: { pool: FEIRA_POOL_GATO, budgetPorCorpo: 23, chanceDupla: 0.25 }, i18n: 'games.gangues.cena.feira.galeria.m1', recompensa: { rep: 2 } }, pos: { x: 190, y: 130 } },
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
          { poi: { id: 'galeria_porta', tipo: 'parada', i18n: 'games.gangues.cena.feira.galeria.porta', puzzle: { type: 'decoder', config: { difficulty: 'easy' }, skin: 'gato' }, falha: { viraTreta: { enemy: 1104, revezamento: { pool: FEIRA_POOL_GATO, budgetPorCorpo: 26, chanceDupla: 0.1 }, semTravar: true } } }, pos: { x: 180, y: 300 } },
          { poi: { id: 'galeria_m2', tipo: 'treta', repetivel: true, nivelRec: 26, revezamento: { pool: FEIRA_POOL_GATO, budgetPorCorpo: 26, chanceDupla: 0.45 }, i18n: 'games.gangues.cena.feira.galeria.m2', recompensa: { rep: 3 } }, pos: { x: 180, y: 190 }, precisa: 'galeria_porta' },
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
          { poi: { id: 'galeria_m3', tipo: 'treta', repetivel: true, nivelRec: 29, revezamento: { pool: FEIRA_POOL_GATO, budgetPorCorpo: 29, chanceDupla: 0.3 }, i18n: 'games.gangues.cena.feira.galeria.m3', recompensa: { rep: 2 } }, pos: { x: 190, y: 180 } },
        ],
      },
    ],
  },

  // ── O MERCADÃO do Cobrador — dungeon final (4 cômodos) ──
  // Destranca depois do 2º guarda do depósito.
  mercadao: {
    nome: 'games.gangues.cena.feira.int.mercadao',
    porta: { predio: 'mercadao', posPortao: true },
    abreComResolvido: 'deposito_2',
    comodos: [
      {
        id: 'doca',
        world: { w: 480, h: 340 }, spawn: { x: 240, y: 256 },
        saida: { x: 160, y: 320, w: 160, h: 20 },
        colliders: [
          { x: 0, y: 0, w: 480, h: 30 }, { x: 0, y: 0, w: 14, h: 340 }, { x: 466, y: 0, w: 14, h: 340 },
          { x: 0, y: 334, w: 160, h: 10 }, { x: 320, y: 334, w: 160, h: 10 },
          { x: 40, y: 90, w: 90, h: 70 }, { x: 360, y: 200, w: 90, h: 70 },
        ],
        cenario: [
          { tipo: 'caixote', x: 85, y: 125 }, { tipo: 'caixote', x: 110, y: 90 },
          { tipo: 'empilhadeira', x: 405, y: 235 }, { tipo: 'chao-galpao' },
        ],
        pois: [
          { poi: { id: 'mercadao_m1', tipo: 'treta', repetivel: true, nivelRec: 44, revezamento: { pool: FEIRA_POOL_MERCADAO, budgetPorCorpo: 8, qtdMin: 3, qtdMax: 5, ratioComTime: 0.4 }, i18n: 'games.gangues.cena.feira.mercadao.m1', recompensa: { rep: 3 } }, pos: { x: 300, y: 130 } },
        ],
        passagem: { x: 220, y: 34, w: 80, h: 24, para: 1, precisa: 'mercadao_m1', label: 'avancar' },
      },
      {
        id: 'camara_fria',
        world: { w: 440, h: 380 }, spawn: { x: 220, y: 300 },
        saida: null,
        voltaPara: 0,
        colliders: [
          { x: 0, y: 0, w: 440, h: 30 }, { x: 0, y: 0, w: 14, h: 380 }, { x: 426, y: 0, w: 14, h: 380 }, { x: 0, y: 352, w: 440, h: 28 },
          { x: 20, y: 120, w: 60, h: 200 }, { x: 360, y: 120, w: 60, h: 200 },
        ],
        cenario: [
          { tipo: 'prateleira-alta', x: 50, y: 220, w: 56, h: 196 }, { tipo: 'prateleira-alta', x: 390, y: 220, w: 56, h: 196 },
          { tipo: 'chao-galpao' },
        ],
        pois: [
          { poi: { id: 'mercadao_m2', tipo: 'treta', repetivel: true, nivelRec: 46, enemy: 1403, liderFixo: 1403, repGate: FEIRA_REP_GATE_DEPOSITO, moldesPool: FEIRA_POOL_MERCADAO, pontosFixo: 40, qtdMin: 3, qtdMax: 5, i18n: 'games.gangues.cena.feira.mercadao.m2', recompensa: { rep: 4, item: 21, qtd: 1 } }, pos: { x: 220, y: 180 } },
          { poi: { id: 'mercadao_achado', tipo: 'achado', opcional: true, i18n: 'games.gangues.cena.feira.mercadao.achado', recompensa: { grana: 25, item: 13, qtd: 2, equip: 120 } }, pos: { x: 388, y: 150 } },
        ],
        passagem: { x: 200, y: 34, w: 80, h: 24, para: 2, precisa: 'mercadao_m2', label: 'avancar' },
      },
      {
        id: 'escritorio',
        world: { w: 420, h: 320 }, spawn: { x: 210, y: 246 },
        saida: null,
        voltaPara: 1,
        colliders: [
          { x: 0, y: 0, w: 420, h: 30 }, { x: 0, y: 0, w: 14, h: 320 }, { x: 406, y: 0, w: 14, h: 320 }, { x: 0, y: 292, w: 420, h: 28 },
          { x: 120, y: 90, w: 180, h: 56 },
        ],
        cenario: [
          { tipo: 'mesa-escritorio', x: 210, y: 118, w: 176 }, { tipo: 'cofre', x: 360, y: 210 },
          { tipo: 'quadro-horarios', x: 60, y: 90 }, { tipo: 'chao-galpao' },
        ],
        pois: [
          // O livro-caixa do Turco: quanto a Feira inteira deve. Com as 3
          // páginas da caderneta na mão, o ponto fraco do Cobrador fica claro.
          { poi: { id: 'livro_caixa', tipo: 'papo', opcional: true, repetivel: true, i18n: 'games.gangues.cena.feira.mercadao.livro_caixa', escolhas: [{ id: 'ler' }] }, pos: { x: 120, y: 210 } },
        ],
        passagem: { x: 300, y: 34, w: 80, h: 24, para: 3, label: 'avancar' },
      },
      {
        id: 'cofre',
        world: { w: 520, h: 400 }, spawn: { x: 260, y: 320 },
        saida: null,
        voltaPara: 2,
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
