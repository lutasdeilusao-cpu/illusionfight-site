// ── INTERIORES navegáveis do Alto do Morro ──────────────────────────────
// Mesmo formato dos outros bairros (ver data/cenas/pista/interiores.js pras
// notas de colisão e da porta larga). A birosca segue a regra da sala dos
// fundos (data/cenas/salaDosFundos.js); o escritório é onde mora o Contador.
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

export const INTERIORES_ALTO = {
  birosca: {
    nome: 'games.gangues.cena.alto.int.birosca',
    porta: { predio: 'c1' },
    comodos: [{
      ...sala({
        id: 'sala', w: 460, h: 320,
        balcao: { x: 108, y: 66, w: 244, h: 40 },
        cenario: [
          { tipo: 'balcao', x: 230, y: 86, w: 240 }, { tipo: 'geladeira-refri', x: 66, y: 120 },
          { tipo: 'mesa', x: 120, y: 210 }, { tipo: 'mesa', x: 340, y: 220 },
        ],
        pois: [{ ref: 'birosca_alto', pos: { x: 74, y: 210 } }],
      }),
      passagem: portaFundos(460),
    }, salaDosFundos(['divida_do_alto'])],
  },
  oficina: {
    nome: 'games.gangues.cena.alto.int.oficina',
    porta: { predio: 'of' },
    comodos: [sala({
      id: 'oficina', w: 420, h: 300,
      balcao: { x: 90, y: 60, w: 240, h: 44 },
      cenario: [{ tipo: 'balcao', x: 210, y: 82, w: 236 }, { tipo: 'pilha-sucata', x: 70, y: 220 }],
      pois: [{ ref: 'ferraria_alto', pos: { x: 210, y: 140 } }],
    })],
  },
  emporio: {
    nome: 'games.gangues.cena.alto.int.emporio',
    porta: { predio: 'pm1' },
    comodos: [sala({
      id: 'emporio', w: 440, h: 320,
      balcao: { x: 96, y: 70, w: 250, h: 40 },
      cenario: [
        { tipo: 'caixa-loja', x: 220, y: 90, w: 246 },
        { tipo: 'prateleira', x: 60, y: 200, w: 76, h: 116 }, { tipo: 'prateleira', x: 380, y: 200, w: 76, h: 116 },
      ],
      pois: [{ ref: 'emporio', pos: { x: 200, y: 140 } }],
    })],
  },
  // ── A sala dos Cinco: onde eles quase viraram cúpula. A Formação Completa
  // guarda a mesa — batida, o escritório do Contador abre. ──
  sala_cinco: {
    nome: 'games.gangues.cena.alto.int.sala_cinco',
    porta: { predio: 'loja' },
    abreComResolvido: 'roda',
    comodos: [sala({
      id: 'sala_cinco', w: 460, h: 340,
      balcao: { x: 150, y: 70, w: 160, h: 50 },
      cenario: [{ tipo: 'mesa-escritorio', x: 230, y: 95, w: 156 }, { tipo: 'cofre', x: 400, y: 80 }, { tipo: 'cartaz', x: 80, y: 50 }],
      pois: [{ ref: 'formacao_completa', pos: { x: 230, y: 190 } }, { ref: 'mesa_dos_cinco', pos: { x: 80, y: 200 } }],
    })],
  },
  // ── O escritório do Contador: a antessala (Favor Devido) e a sala dele ──
  escritorio: {
    nome: 'games.gangues.cena.alto.int.escritorio',
    porta: { predio: 'galpao' },
    abreComResolvido: 'formacao_completa',
    comodos: [
      {
        ...sala({
          id: 'antessala', w: 420, h: 340,
          cenario: [{ tipo: 'mesa', x: 110, y: 120 }, { tipo: 'quadro-horarios', x: 360, y: 90 }],
          pois: [{ ref: 'favor_devido', pos: { x: 210, y: 170 } }],
        }),
        passagem: { x: 170, y: 30, w: 80, h: 24, para: 1, precisa: 'favor_devido', label: 'avancar' },
      },
      // As três fases do Contador: porrinha, bilhar e, só no fim, a porrada.
      {
        id: 'mesa_porrinha',
        world: { w: 420, h: 340 }, spawn: { x: 210, y: 270 },
        voltaPara: 0,
        colliders: [{ x: 0, y: 0, w: 420, h: 30 }, { x: 0, y: 0, w: 14, h: 340 }, { x: 406, y: 0, w: 14, h: 340 }, { x: 0, y: 312, w: 420, h: 28 }, { x: 150, y: 90, w: 120, h: 50 }],
        cenario: [{ tipo: 'mesa', x: 210, y: 115 }, { tipo: 'tv', x: 370, y: 60 }],
        pois: [{ ref: 'jogo_porrinha', pos: { x: 210, y: 180 } }],
        passagem: { x: 170, y: 30, w: 80, h: 24, para: 2, precisa: 'jogo_porrinha', label: 'avancar' },
      },
      {
        id: 'sala_bilhar',
        world: { w: 420, h: 340 }, spawn: { x: 210, y: 270 },
        voltaPara: 1,
        colliders: [{ x: 0, y: 0, w: 420, h: 30 }, { x: 0, y: 0, w: 14, h: 340 }, { x: 406, y: 0, w: 14, h: 340 }, { x: 0, y: 312, w: 420, h: 28 }, { x: 130, y: 80, w: 160, h: 60 }],
        cenario: [{ tipo: 'mesa-escritorio', x: 210, y: 110, w: 156 }, { tipo: 'luz-facho', x: 210, y: 110 }],
        pois: [{ ref: 'jogo_bilhar', pos: { x: 210, y: 190 } }],
        passagem: { x: 170, y: 30, w: 80, h: 24, para: 3, precisa: 'jogo_bilhar', label: 'avancar' },
      },
      {
        id: 'sala_contador',
        world: { w: 480, h: 380 }, spawn: { x: 240, y: 300 },
        voltaPara: 2,
        colliders: [{ x: 0, y: 0, w: 480, h: 30 }, { x: 0, y: 0, w: 14, h: 380 }, { x: 466, y: 0, w: 14, h: 380 }, { x: 0, y: 352, w: 480, h: 28 }],
        cenario: [{ tipo: 'mesa-escritorio', x: 240, y: 80, w: 176 }, { tipo: 'cofre', x: 420, y: 90 }, { tipo: 'luz-facho', x: 240, y: 150 }],
        pois: [{ ref: '__chefe', pos: { x: 240, y: 170 } }],
      },
    ],
  },
}
