// ── INTERIORES navegáveis da Laje ───────────────────────────────────────
// Mesmo formato dos outros bairros (ver data/cenas/pista/interiores.js pras
// notas de colisão e da porta larga). A sala de costura é uma fila de 6 salas;
// o topo são as 3 fases do Retalho, SEM descanso nenhum lá em cima (sobe com o
// que trouxe — o dano passa de uma fase pra outra).
import { portaFundos, salaDosFundos } from '../salaDosFundos.js'

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

// Uma sala da fila: volta pra anterior embaixo, porta pra próxima em cima
// (trancada até bater quem guarda esta). `entrada` = a 1ª, que sai pra rua.
function salaFila(n, { id, pois, precisa, ultima = false, cenario = [], w = 420, h = 360 }) {
  const base = n === 0
    ? sala({ id, w, h, cenario, pois })
    : {
        id, world: { w, h }, spawn: { x: w / 2, y: h - 70 }, voltaPara: n - 1,
        colliders: [{ x: 0, y: 0, w, h: 30 }, { x: 0, y: 0, w: 14, h }, { x: w - 14, y: 0, w: 14, h }, { x: 0, y: h - 28, w, h: 28 }],
        cenario, pois,
      }
  return ultima ? base : { ...base, passagem: { x: w / 2 - 40, y: 30, w: 80, h: 24, para: n + 1, precisa, label: 'avancar' } }
}

const MEIO = { x: 210, y: 180 }
const CHAO = { tipo: 'chao-galpao' }

export const INTERIORES_LAJE = {
  birosca: {
    nome: 'games.gangues.cena.laje.int.birosca',
    porta: { predio: 'c1' },
    comodos: [{
      ...sala({
        id: 'sala', w: 460, h: 320,
        balcao: { x: 108, y: 66, w: 244, h: 40 },
        cenario: [
          { tipo: 'balcao', x: 230, y: 86, w: 240 }, { tipo: 'geladeira-refri', x: 66, y: 120 },
          { tipo: 'mesa', x: 120, y: 210 }, { tipo: 'mesa', x: 340, y: 220 },
        ],
        pois: [{ ref: 'birosca_laje', pos: { x: 74, y: 210 } }],
      }),
      passagem: portaFundos(460),
    }, salaDosFundos(['ponto_da_laje'])],
  },
  oficina: {
    nome: 'games.gangues.cena.laje.int.oficina',
    porta: { predio: 'of' },
    comodos: [sala({
      id: 'oficina', w: 420, h: 300,
      balcao: { x: 90, y: 60, w: 240, h: 44 },
      cenario: [{ tipo: 'balcao', x: 210, y: 82, w: 236 }, { tipo: 'pilha-sucata', x: 70, y: 220 }],
      pois: [{ ref: 'alfaiataria', pos: { x: 210, y: 140 } }],
    })],
  },
  loja: {
    nome: 'games.gangues.cena.laje.int.loja',
    porta: { predio: 'pm1' },
    comodos: [sala({
      id: 'loja', w: 440, h: 320,
      balcao: { x: 96, y: 70, w: 250, h: 40 },
      cenario: [
        { tipo: 'caixa-loja', x: 220, y: 90, w: 246 },
        { tipo: 'prateleira', x: 60, y: 200, w: 76, h: 116 }, { tipo: 'prateleira', x: 380, y: 200, w: 76, h: 116 },
      ],
      pois: [{ ref: 'loja_laje', pos: { x: 200, y: 140 } }],
    })],
  },
  // ── A SALA DE COSTURA: seis salas em fila, onde Damião organiza Marélia ──
  sala_costura: {
    nome: 'games.gangues.cena.laje.int.sala_costura',
    porta: { predio: 'loja' },
    abreComResolvido: 'linha_reta',
    comodos: [
      salaFila(0, { id: 'costura_1', precisa: 'revanche_ferrugem', pois: [{ ref: 'revanche_ferrugem', pos: MEIO }], cenario: [CHAO, { tipo: 'caixote', x: 70, y: 90 }] }),
      salaFila(1, { id: 'costura_2', precisa: 'revanche_zefa', pois: [{ ref: 'revanche_zefa', pos: MEIO }], cenario: [CHAO, { tipo: 'mesa', x: 340, y: 90 }] }),
      salaFila(2, { id: 'costura_3', precisa: 'costura_fina', pois: [{ ref: 'costura_fina', pos: MEIO }, { ref: 'planilha', pos: { x: 80, y: 260 } }], cenario: [CHAO, { tipo: 'mesa-escritorio', x: 330, y: 260, w: 120 }] }),
      salaFila(3, { id: 'costura_4', precisa: 'tesoura', pois: [{ ref: 'tesoura', pos: MEIO }], cenario: [CHAO, { tipo: 'luz-facho', x: 210, y: 150 }] }),
      salaFila(4, { id: 'costura_5', precisa: 'corte_certo', pois: [{ ref: 'corte_certo', pos: MEIO }], cenario: [CHAO, { tipo: 'luz-facho', x: 210, y: 150 }] }),
      salaFila(5, { id: 'costura_6', ultima: true, pois: [{ ref: 'revanche_contador', pos: MEIO }], cenario: [CHAO, { tipo: 'mesa-escritorio', x: 210, y: 90, w: 176 }, { tipo: 'cofre', x: 370, y: 90 }] }),
    ],
  },
  // ── O TOPO DA LAJE: as três fases do Retalho, Marélia inteira lá embaixo ──
  topo: {
    nome: 'games.gangues.cena.laje.int.topo',
    porta: { predio: 'galpao' },
    abreComResolvido: 'revanche_contador',
    comodos: [
      { ...salaFila(0, { id: 'fase_1', precisa: 'fase_costura', pois: [{ ref: 'fase_costura', pos: { x: 240, y: 170 } }], cenario: [{ tipo: 'luz-facho', x: 240, y: 150 }], w: 480, h: 380 }), nome: 'games.gangues.cena.laje.fase_1_nome' },
      { ...salaFila(1, { id: 'fase_2', precisa: 'fase_colcha', pois: [{ ref: 'fase_colcha', pos: { x: 240, y: 170 } }], cenario: [{ tipo: 'luz-facho', x: 240, y: 150 }], w: 480, h: 380 }), nome: 'games.gangues.cena.laje.fase_2_nome' },
      { ...salaFila(2, { id: 'fase_3', ultima: true, pois: [{ ref: '__chefe', pos: { x: 240, y: 150 } }], cenario: [{ tipo: 'luz-facho', x: 240, y: 140 }], w: 480, h: 380 }), nome: 'games.gangues.cena.laje.fase_3_nome' },
    ],
  },
}
