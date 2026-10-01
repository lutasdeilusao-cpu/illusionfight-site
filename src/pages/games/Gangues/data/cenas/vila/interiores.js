// ── INTERIORES navegáveis da Vila ───────────────────────────────────────
// Mesmo formato dos da Pista/Feira/Baixada (a caixa de um cômodo é a mesma,
// já validada lá — ver data/cenas/pista/interiores.js pras notas de colisão
// e da porta larga). `pois[].ref` reaproveita um POI de pois.js.
//
// O BLOCO A é o prédio inteiro num interior só: cômodo 0 = hall da portaria,
// cômodos 1–10 = os andares. A escada é a `passagem` do topo de cada andar
// (trancada até bater quem segura o patamar, `precisa`) e o `voltaPara` da
// borda de baixo — o mesmo encaixe do túnel e do galpão da Pista, sem motor
// novo. Andar `escuro` (a escada sem luz) fica no breu até o Ferrugem cair.
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

// Um andar: corredor comprido, escada de volta embaixo (`voltaPara`) e a de
// subir no topo (`passagem`, trancada pelo POI `precisa`).
const AW = 360, AH = 560
function andar(n, { escuro = false, precisa, pois = [], cenario = [], topo = false }) {
  return {
    id: `andar_${n}`,
    world: { w: AW, h: AH }, spawn: { x: AW / 2, y: AH - 84 },
    voltaPara: n - 1,
    escuro,
    colliders: [
      { x: 0, y: 0, w: AW, h: 30 }, { x: 0, y: 0, w: 40, h: AH }, { x: AW - 40, y: 0, w: 40, h: AH }, { x: 0, y: AH - 28, w: AW, h: 28 },
    ],
    cenario: [{ tipo: 'chao-interno' }, ...(escuro ? [] : [{ tipo: 'lampada-tunel', x: AW / 2, y: 40 }]), ...cenario],
    pois,
    ...(topo ? {} : { passagem: { x: AW / 2 - 40, y: 30, w: 80, h: 24, para: n + 1, precisa, label: 'subir' } }),
  }
}
const MEIO = { x: AW / 2, y: 250 }

export const INTERIORES_VILA = {
  // ── A birosca do térreo (descanso + o agiota da Vila) ──
  birosca: {
    nome: 'games.gangues.cena.vila.int.birosca',
    porta: { predio: 'c1' },
    comodos: [{ ...sala({
      id: 'sala', w: 460, h: 320,
      balcao: { x: 108, y: 66, w: 244, h: 40 },
      cenario: [
        { tipo: 'balcao', x: 230, y: 86, w: 240 }, { tipo: 'geladeira-refri', x: 66, y: 120 },
        { tipo: 'tv', x: 396, y: 62 }, { tipo: 'mesa', x: 120, y: 210 }, { tipo: 'mesa', x: 340, y: 220 },
      ],
      pois: [
        { ref: 'birosca_vila', pos: { x: 74, y: 210 } },
      ],
    }), passagem: portaFundos(460) }, salaDosFundos(['aluguel_vencido', 'informante_morro', { ref: 'linha_vila', precisaFlag: 'laje' }])],
  },
  // ── A oficina do zelador (ferreiro) ──
  oficina: {
    nome: 'games.gangues.cena.vila.int.oficina',
    porta: { predio: 'of' },
    comodos: [sala({
      id: 'oficina', w: 420, h: 300,
      balcao: { x: 90, y: 60, w: 240, h: 44 },
      cenario: [
        { tipo: 'balcao', x: 210, y: 82, w: 236 }, { tipo: 'pilha-sucata', x: 70, y: 220 },
        { tipo: 'caixote', x: 350, y: 210 },
      ],
      pois: [{ ref: 'oficina_zelador', pos: { x: 210, y: 140 } }],
    })],
  },
  // ── O brechó da síndica (loja) ──
  brecho: {
    nome: 'games.gangues.cena.vila.int.brecho',
    porta: { predio: 'loja' },
    comodos: [sala({
      id: 'brecho', w: 440, h: 320,
      balcao: { x: 96, y: 70, w: 250, h: 40 },
      cenario: [
        { tipo: 'caixa-loja', x: 220, y: 90, w: 246 },
        { tipo: 'prateleira', x: 60, y: 200, w: 76, h: 116 }, { tipo: 'prateleira', x: 380, y: 200, w: 76, h: 116 },
      ],
      pois: [{ ref: 'brecho', pos: { x: 200, y: 140 } }],
    })],
  },
  // ── O BLOCO A: hall + dez andares ──
  bloco_a: {
    nome: 'games.gangues.cena.vila.int.bloco_a',
    porta: { predio: 'galpao' },
    // Só abre depois de bater o Cadeado, que toma conta do térreo.
    abreComResolvido: 'cadeado',
    // O topo mostra "3º ANDAR" em vez de "CÔMODO 4/11" (cômodo 0 = hall/térreo).
    andares: true,
    comodos: [
      {
        ...sala({
          id: 'hall', w: AW, h: 360,
          cenario: [{ tipo: 'chao-interno' }, { tipo: 'cartaz', x: 90, y: 60 }, { tipo: 'mesa', x: 280, y: 250 }],
          pois: [{ ref: 'elevador', pos: { x: 290, y: 120 } }],
        }),
        passagem: { x: 80, y: 30, w: 80, h: 24, para: 1, label: 'subir' },
      },
      andar(1, { escuro: true, precisa: 'andar_1', pois: [{ ref: 'andar_1', pos: MEIO }], cenario: [{ tipo: 'escombro', x: 90, y: 420 }] }),
      andar(2, { escuro: true, precisa: 'andar_2', pois: [{ ref: 'andar_2', pos: MEIO }] }),
      andar(3, { escuro: true, precisa: 'trinco', pois: [{ ref: 'trinco', pos: MEIO }, { ref: 'apto_302', pos: { x: 90, y: 420 } }] }),
      andar(4, { escuro: true, precisa: 'andar_4', pois: [{ ref: 'andar_4', pos: MEIO }] }),
      andar(5, {
        precisa: 'condominio',
        cenario: [{ tipo: 'mesa', x: 90, y: 380 }, { tipo: 'tv', x: 270, y: 470 }],
        pois: [
          { ref: 'condominio', pos: MEIO },
          { ref: 'dona_neide_descanso', pos: { x: 90, y: 430 }, precisa: 'andar_4' },
          { ref: 'dona_neide', pos: { x: 270, y: 400 }, precisa: 'andar_4' },
          { ref: 'elevador', pos: { x: 270, y: 110 } },
        ],
      }),
      andar(6, { escuro: true, precisa: 'andar_6', pois: [{ ref: 'andar_6', pos: MEIO }, { ref: 'apto_604', pos: { x: 270, y: 420 } }] }),
      andar(7, { precisa: 'bloco_inteiro', pois: [{ ref: 'bloco_inteiro', pos: MEIO }] }),
      andar(8, { precisa: 'goteira', pois: [{ ref: 'goteira', pos: MEIO }, { ref: 'apto_801', pos: { x: 90, y: 420 } }] }),
      andar(9, {
        precisa: 'chave_mestra',
        pois: [{ ref: 'chave_mestra', pos: MEIO }, { ref: 'elevador', pos: { x: 270, y: 110 } }],
      }),
      andar(10, {
        topo: true,
        cenario: [{ tipo: 'caixote', x: 80, y: 120 }, { tipo: 'luz-facho', x: AW / 2, y: 150 }],
        pois: [{ ref: 'caixa_dagua', pos: { x: 90, y: 400 } }, { ref: '__chefe', pos: { x: AW / 2, y: 140 } }],
      }),
    ],
  },
}
