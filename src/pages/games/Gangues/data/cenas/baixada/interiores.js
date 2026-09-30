// ── INTERIORES navegáveis da Baixada ────────────────────────────────────
// Mesmo formato dos da Pista e da Feira (a caixa de um cômodo é a mesma, já
// validada lá — ver data/cenas/pista/interiores.js pras notas de colisão e da
// porta larga). `pois[].ref` reaproveita um POI de pois.js.
import { portaFundos, salaDosFundos } from '../salaDosFundos.js'

// Sala de um cômodo, porta larga embaixo.
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

export const INTERIORES_BAIXADA = {
  // ── A birosca da Dona Lurdes (descanso + o agiota da Baixada) ──
  birosca: {
    nome: 'games.gangues.cena.baixada.int.birosca',
    porta: { predio: 'c1' },
    comodos: [{ ...sala({
      id: 'sala', w: 460, h: 320,
      balcao: { x: 108, y: 66, w: 244, h: 40 },
      cenario: [
        { tipo: 'balcao', x: 230, y: 86, w: 240 }, { tipo: 'geladeira-refri', x: 66, y: 120 },
        { tipo: 'tv', x: 396, y: 62 }, { tipo: 'mesa', x: 120, y: 210 }, { tipo: 'mesa', x: 340, y: 220 },
      ],
      pois: [
        { ref: 'birosca', pos: { x: 74, y: 210 } },
      ],
    }), passagem: portaFundos(460) }, salaDosFundos(['taxa_fixa', 'informante_vila'])],
  },
  // ── A padaria da Dona Cida — onde sai o café do velho ──
  padaria: {
    nome: 'games.gangues.cena.baixada.int.padaria',
    porta: { predio: 'of' },
    comodos: [sala({
      id: 'balcao', w: 420, h: 300,
      balcao: { x: 90, y: 60, w: 240, h: 44 },
      cenario: [
        { tipo: 'balcao', x: 210, y: 82, w: 236 }, { tipo: 'cartaz', x: 210, y: 40 },
        { tipo: 'mesa', x: 90, y: 200 }, { tipo: 'geladeira-refri', x: 360, y: 150 },
      ],
      // A Dona Cida só serve o café do velho pra quem já botou o folgado no chão.
      pois: [{ ref: 'dona_cida', pos: { x: 210, y: 130 }, precisa: 'folgado_final' }],
    })],
  },
  // ── A pensão do outro lado da linha (descanso de cima) ──
  birosca_2: {
    nome: 'games.gangues.cena.baixada.int.birosca_2',
    porta: { predio: 'pm1' },
    comodos: [sala({
      id: 'sala', w: 420, h: 300,
      cenario: [{ tipo: 'mesa', x: 120, y: 200 }, { tipo: 'tv', x: 330, y: 60 }],
      pois: [{ ref: 'birosca_2', pos: { x: 90, y: 150 } }],
    })],
  },
  // ── O depósito do Seu Nono — a loja da Baixada ──
  deposito: {
    nome: 'games.gangues.cena.baixada.int.deposito',
    porta: { predio: 'loja' },
    comodos: [sala({
      id: 'deposito', w: 440, h: 320,
      balcao: { x: 96, y: 70, w: 250, h: 40 },
      cenario: [
        { tipo: 'caixa-loja', x: 220, y: 90, w: 246 },
        { tipo: 'prateleira', x: 60, y: 200, w: 76, h: 116 }, { tipo: 'prateleira', x: 380, y: 200, w: 76, h: 116 },
      ],
      pois: [{ ref: 'deposito', pos: { x: 200, y: 140 } }],
    })],
  },
}
