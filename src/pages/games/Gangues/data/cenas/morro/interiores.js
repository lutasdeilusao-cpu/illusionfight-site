// ── INTERIORES navegáveis do Morro ──────────────────────────────────────
// Mesmo formato dos outros bairros (ver data/cenas/pista/interiores.js pras
// notas de colisão e da porta larga). A birosca segue a regra da sala dos
// fundos (data/cenas/salaDosFundos.js); a boca da Zefa é onde mora o chefe.
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

export const INTERIORES_MORRO = {
  birosca: {
    nome: 'games.gangues.cena.morro.int.birosca',
    porta: { predio: 'c1' },
    comodos: [{
      ...sala({
        id: 'sala', w: 460, h: 320,
        balcao: { x: 108, y: 66, w: 244, h: 40 },
        cenario: [
          { tipo: 'balcao', x: 230, y: 86, w: 240 }, { tipo: 'geladeira-refri', x: 66, y: 120 },
          { tipo: 'mesa', x: 120, y: 210 }, { tipo: 'mesa', x: 340, y: 220 },
        ],
        pois: [{ ref: 'birosca_morro', pos: { x: 74, y: 210 } }],
      }),
      passagem: portaFundos(460),
    }, salaDosFundos(['fiado_da_zefa', 'informante_alto'])],
  },
  oficina: {
    nome: 'games.gangues.cena.morro.int.oficina',
    porta: { predio: 'of' },
    comodos: [sala({
      id: 'oficina', w: 420, h: 300,
      balcao: { x: 90, y: 60, w: 240, h: 44 },
      cenario: [{ tipo: 'balcao', x: 210, y: 82, w: 236 }, { tipo: 'pilha-sucata', x: 70, y: 220 }],
      pois: [{ ref: 'serralheria_morro', pos: { x: 210, y: 140 } }],
    })],
  },
  venda: {
    nome: 'games.gangues.cena.morro.int.venda',
    porta: { predio: 'pm1' },
    comodos: [sala({
      id: 'venda', w: 440, h: 320,
      balcao: { x: 96, y: 70, w: 250, h: 40 },
      cenario: [
        { tipo: 'caixa-loja', x: 220, y: 90, w: 246 },
        { tipo: 'prateleira', x: 60, y: 200, w: 76, h: 116 }, { tipo: 'prateleira', x: 380, y: 200, w: 76, h: 116 },
      ],
      pois: [{ ref: 'venda', pos: { x: 200, y: 140 } }],
    })],
  },
  creche: {
    nome: 'games.gangues.cena.morro.int.creche',
    porta: { predio: 'loja' },
    comodos: [sala({
      id: 'creche', w: 440, h: 320,
      cenario: [{ tipo: 'mesa', x: 120, y: 200 }, { tipo: 'mesa', x: 320, y: 200 }, { tipo: 'cartaz', x: 220, y: 40 }],
      pois: [{ ref: 'creche', pos: { x: 120, y: 130 } }, { ref: 'creche_achado', pos: { x: 330, y: 130 } }],
    })],
  },
  // ── A BOCA DA ZEFA: a antessala (Conta do Morro) e o quintal dela ──
  boca: {
    nome: 'games.gangues.cena.morro.int.boca',
    porta: { predio: 'galpao' },
    abreComResolvido: 'ultima_escada',
    comodos: [
      {
        ...sala({
          id: 'antessala', w: 420, h: 340,
          cenario: [{ tipo: 'mesa', x: 110, y: 120 }, { tipo: 'cofre', x: 360, y: 80 }],
          pois: [{ ref: 'conta_do_morro', pos: { x: 210, y: 170 } }],
        }),
        passagem: { x: 170, y: 30, w: 80, h: 24, para: 1, precisa: 'conta_do_morro', label: 'avancar' },
      },
      {
        id: 'quintal',
        world: { w: 480, h: 380 }, spawn: { x: 240, y: 300 },
        voltaPara: 0,
        colliders: [{ x: 0, y: 0, w: 480, h: 30 }, { x: 0, y: 0, w: 14, h: 380 }, { x: 466, y: 0, w: 14, h: 380 }, { x: 0, y: 352, w: 480, h: 28 }],
        cenario: [{ tipo: 'luz-facho', x: 240, y: 150 }, { tipo: 'varal', x: 120, y: 90, w: 80 }],
        pois: [{ ref: '__chefe', pos: { x: 240, y: 130 } }],
      },
    ],
  },
}
