// ── INTERIORES navegáveis da Pista ──────────────────────────
// Cada interior tem 1+ cômodos. Um cômodo é um mundo pequeno próprio:
//  world/spawn/saida/colliders/cenario/pois (+ passagem pro próximo cômodo).
// `pois[].ref` reaproveita um POI de `pois.js` (mesma lógica de combate/
// papo/loja); `pois[].poi` é um POI completo próprio (mobs do galpão).
// `porta.predio` = qual prédio do exterior abre este interior.
// Extraído de data/cenas/pista.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §4).
import { PISTA_POOL_RUA, PISTA_POOL_TUNEL, PISTA_POOL_GALPAO } from './pools.js'

export const INTERIORES_PISTA = {
  birosca: {
    nome: 'games.gangues.cena.pista.int.birosca',
    porta: { predio: 'c1' },
    // A birosca do Nato tá sempre aberta (é a única esquina de confiança da
    // Pista). O papo do Nato (`birosca`, obrigatório pro portão) só aparece
    // DEPOIS do beco — antes disso o Nato nem te reconhece. O descanso e o
    // Duda (informante) ficam disponíveis desde sempre.
    comodos: [{
      id: 'sala',
      world: { w: 460, h: 320 }, spawn: { x: 230, y: 236 },
      saida: { x: 202, y: 300, w: 56, h: 20 },
      colliders: [
        { x: 0, y: 0, w: 460, h: 30 }, { x: 0, y: 0, w: 14, h: 320 }, { x: 446, y: 0, w: 14, h: 320 },
        { x: 0, y: 292, w: 188, h: 28 }, { x: 258, y: 292, w: 202, h: 28 },
        { x: 108, y: 66, w: 244, h: 40 }, // balcão
      ],
      cenario: [
        { tipo: 'balcao', x: 230, y: 86, w: 240 },
        { tipo: 'geladeira-refri', x: 66, y: 120 }, { tipo: 'tv', x: 396, y: 62 },
        { tipo: 'mesa', x: 120, y: 210 }, { tipo: 'mesa', x: 340, y: 220 },
        { tipo: 'cartaz', x: 230, y: 40 },
      ],
      pois: [
        { ref: 'birosca', pos: { x: 200, y: 118 }, precisa: 'beco' },
        { ref: 'informante', pos: { x: 400, y: 200 } },
        { ref: 'descanso', pos: { x: 74, y: 210 } },
      ],
    }],
  },
  // ── A BIROSCA DO PRIMO (pós-muro) — dentro do barraco pm1 ──
  // Mesma cara da birosca do Nato, do outro lado do muro. Um cômodo só:
  // o descanso_2 (descansar a tropa + caderneta do Nato pra quitar a dívida).
  birosca_2: {
    nome: 'games.gangues.cena.pista.int.birosca_2',
    porta: { predio: 'pm1', posPortao: true },
    comodos: [{
      id: 'sala',
      world: { w: 440, h: 300 }, spawn: { x: 220, y: 220 },
      saida: { x: 194, y: 280, w: 52, h: 20 },
      colliders: [
        { x: 0, y: 0, w: 440, h: 28 }, { x: 0, y: 0, w: 14, h: 300 }, { x: 426, y: 0, w: 14, h: 300 },
        { x: 0, y: 272, w: 182, h: 28 }, { x: 258, y: 272, w: 182, h: 28 },
        { x: 100, y: 58, w: 240, h: 40 }, // balcão
      ],
      cenario: [
        { tipo: 'balcao', x: 220, y: 78, w: 236 },
        { tipo: 'geladeira-refri', x: 60, y: 118 }, { tipo: 'tv', x: 380, y: 58 },
        { tipo: 'mesa', x: 120, y: 200 }, { tipo: 'cartaz', x: 220, y: 40 },
      ],
      pois: [
        { ref: 'descanso_2', pos: { x: 220, y: 118 } },
      ],
    }],
  },
  oficina: {
    nome: 'games.gangues.cena.pista.int.oficina',
    porta: { predio: 'of' },
    abreCom: 'oficina',
    comodos: [{
      id: 'bancada',
      world: { w: 420, h: 300 }, spawn: { x: 210, y: 218 },
      saida: { x: 184, y: 280, w: 52, h: 20 },
      colliders: [
        { x: 0, y: 0, w: 420, h: 28 }, { x: 0, y: 0, w: 14, h: 300 }, { x: 406, y: 0, w: 14, h: 300 },
        { x: 0, y: 272, w: 172, h: 28 }, { x: 236, y: 272, w: 184, h: 28 },
        { x: 90, y: 60, w: 240, h: 44 }, // bancada
      ],
      cenario: [
        { tipo: 'bancada', x: 210, y: 82, w: 236 }, { tipo: 'ferramentas', x: 210, y: 44 },
        { tipo: 'pneu', x: 60, y: 210 }, { tipo: 'peca-exposta', x: 360, y: 120 },
      ],
      pois: [{ ref: 'oficina', pos: { x: 200, y: 120 } }],
    }],
  },
  loja: {
    nome: 'games.gangues.cena.pista.int.loja',
    porta: { predio: 'loja' },
    comodos: [{
      id: 'mercearia',
      world: { w: 440, h: 320 }, spawn: { x: 220, y: 236 },
      saida: { x: 194, y: 300, w: 52, h: 20 },
      colliders: [
        { x: 0, y: 0, w: 440, h: 28 }, { x: 0, y: 0, w: 14, h: 320 }, { x: 426, y: 0, w: 14, h: 320 },
        { x: 0, y: 292, w: 182, h: 28 }, { x: 262, y: 292, w: 178, h: 28 },
        { x: 96, y: 70, w: 250, h: 40 }, // caixa
        { x: 20, y: 140, w: 80, h: 120 }, { x: 340, y: 140, w: 80, h: 120 }, // prateleiras
      ],
      cenario: [
        { tipo: 'caixa-loja', x: 220, y: 90, w: 246 },
        { tipo: 'prateleira', x: 60, y: 200, w: 76, h: 116 }, { tipo: 'prateleira', x: 380, y: 200, w: 76, h: 116 },
        { tipo: 'cartaz', x: 220, y: 44 },
      ],
      pois: [{ ref: 'loja', pos: { x: 200, y: 122 } }],
    }],
  },
  // ── O TÚNEL "secreto" — fura por baixo do muro (3 cômodos) ──
  // O muro NUNCA abre sozinho. Depois de fechar os ponto (portao.precisa) a
  // boca do túnel destranca; você atravessa (uns vigia no caminho) e emerge
  // no barraco do outro lado. Bidirecional: entra pela boca (cômodo 0) ou
  // pela saída do outro lado (cômodo 2).
  tunel: {
    nome: 'games.gangues.cena.pista.int.tunel',
    porta: { predio: 'tunel_ent' },
    gate: 'portao', // destranca só com portao.precisa TODO feito
    comodos: [
      {
        id: 'boca',
        world: { w: 380, h: 340 }, spawn: { x: 190, y: 288 },
        saida: { x: 162, y: 302, w: 56, h: 20 }, // volta pra rua (lado de cá)
        colliders: [
          { x: 0, y: 0, w: 380, h: 28 }, { x: 0, y: 0, w: 34, h: 340 }, { x: 346, y: 0, w: 34, h: 340 },
          { x: 0, y: 294, w: 150, h: 46 }, { x: 230, y: 294, w: 150, h: 46 },
          { x: 40, y: 70, w: 70, h: 60 }, // entulho/escombro
        ],
        cenario: [{ tipo: 'chao-tunel' }, { tipo: 'escombro', x: 75, y: 100 }, { tipo: 'lampada-tunel', x: 190, y: 40 }],
        pois: [
          { poi: { id: 'tunel_m1', tipo: 'treta', repetivel: true, revezamento: { pool: PISTA_POOL_TUNEL, budgetPorCorpo: 4, chanceDupla: 0.22 }, i18n: 'games.gangues.cena.pista.tunel.m1', recompensa: { grana: 5, rep: 2 } }, pos: { x: 190, y: 130 } },
        ],
        passagem: { x: 150, y: 30, w: 80, h: 24, para: 1, precisa: 'tunel_m1', label: 'avancar' },
      },
      {
        id: 'meio',
        world: { w: 360, h: 420 }, spawn: { x: 180, y: 378 },
        voltaPara: 0,
        colliders: [
          { x: 0, y: 0, w: 360, h: 28 }, { x: 0, y: 0, w: 40, h: 420 }, { x: 320, y: 0, w: 40, h: 420 }, { x: 0, y: 392, w: 360, h: 28 },
        ],
        cenario: [{ tipo: 'chao-tunel' }, { tipo: 'lampada-tunel', x: 180, y: 40 }, { tipo: 'lampada-tunel', x: 180, y: 230 }, { tipo: 'escombro', x: 300, y: 300 }],
        pois: [
          { poi: { id: 'tunel_m2', tipo: 'treta', repetivel: true, nivelRec: 8, revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 6, chanceDupla: 0.45 }, i18n: 'games.gangues.cena.pista.tunel.m2', recompensa: { grana: 7, rep: 3 } }, pos: { x: 180, y: 210 } },
          { poi: { id: 'tunel_achado', tipo: 'achado', opcional: true, i18n: 'games.gangues.cena.pista.tunel.achado', recompensa: { grana: 14, item: 13 } }, pos: { x: 290, y: 120 } },
        ],
        passagem: { x: 140, y: 30, w: 80, h: 24, para: 2, precisa: 'tunel_m2', label: 'avancar' },
      },
      {
        id: 'saida',
        world: { w: 380, h: 340 }, spawn: { x: 190, y: 288 },
        voltaPara: 1,
        // emerge no barraco do OUTRO lado do muro
        saida: { x: 162, y: 30, w: 56, h: 22, paraPredio: 'tunel_sai' },
        colliders: [
          { x: 0, y: 0, w: 150, h: 46 }, { x: 230, y: 0, w: 150, h: 46 },
          { x: 0, y: 0, w: 34, h: 340 }, { x: 346, y: 0, w: 34, h: 340 }, { x: 0, y: 312, w: 380, h: 28 },
          { x: 260, y: 80, w: 70, h: 60 },
        ],
        cenario: [{ tipo: 'chao-tunel' }, { tipo: 'lampada-tunel', x: 190, y: 60 }, { tipo: 'escombro', x: 295, y: 110 }],
        pois: [
          { poi: { id: 'tunel_m3', tipo: 'treta', repetivel: true, revezamento: { pool: PISTA_POOL_TUNEL, budgetPorCorpo: 5, chanceDupla: 0.3 }, i18n: 'games.gangues.cena.pista.tunel.m3', recompensa: { grana: 6, rep: 2 } }, pos: { x: 190, y: 180 } },
        ],
      },
    ],
  },
  // ── O GALPÃO DO CARVÃO — mini dungeon de 4 cômodos ──
  galpao: {
    nome: 'games.gangues.cena.pista.int.galpao',
    porta: { predio: 'galpao', posPortao: true },
    // Porta só destranca depois de BATER os dois bondes de tocaia do
    // caminho pós-muro (posmuro_1 → posmuro_2).
    abreComResolvido: 'posmuro_2',
    comodos: [
      {
        id: 'doca',
        world: { w: 480, h: 340 }, spawn: { x: 240, y: 256 },
        saida: { x: 212, y: 320, w: 56, h: 20 },
        colliders: [
          { x: 0, y: 0, w: 480, h: 30 }, { x: 0, y: 0, w: 14, h: 340 }, { x: 466, y: 0, w: 14, h: 340 },
          { x: 0, y: 312, w: 200, h: 28 }, { x: 280, y: 312, w: 200, h: 28 },
          { x: 40, y: 90, w: 90, h: 70 }, { x: 360, y: 200, w: 90, h: 70 }, // caixotes/empilhadeira
        ],
        cenario: [
          { tipo: 'caixote', x: 85, y: 125 }, { tipo: 'caixote', x: 110, y: 90 },
          { tipo: 'empilhadeira', x: 405, y: 235 }, { tipo: 'chao-galpao' },
        ],
        pois: [
          // Perto do chefe: NÃO pode sortear do pool genérico da rua toda
          // (o Isaias pegou um "Chinelada" — vigia de esquina fraquinho —
          // aqui dentro, óbvio que parecia fácil demais mesmo com o budget
          // "certo": pouco ponto espalhado num corpo de flavor fraco ainda
          // parece fraco). revezamento concentra tudo num corpo só (raro 2)
          // sorteado do pool casca-grossa do galpão.
          { poi: { id: 'galpao_m1', tipo: 'treta', repetivel: true, nivelRec: 12, revezamento: { pool: PISTA_POOL_GALPAO, budgetPorCorpo: 7, chanceDupla: 0.4 }, i18n: 'games.gangues.cena.pista.galpao.m1', recompensa: { grana: 6, rep: 2 } }, pos: { x: 300, y: 130 } },
        ],
        passagem: { x: 220, y: 34, w: 80, h: 24, para: 1, precisa: 'galpao_m1', label: 'avancar' },
      },
      {
        id: 'estoque',
        world: { w: 440, h: 380 }, spawn: { x: 220, y: 300 },
        saida: null,
        voltaPara: 0,
        colliders: [
          { x: 0, y: 0, w: 440, h: 30 }, { x: 0, y: 0, w: 14, h: 380 }, { x: 426, y: 0, w: 14, h: 380 }, { x: 0, y: 352, w: 440, h: 28 },
          { x: 20, y: 120, w: 60, h: 200 }, { x: 360, y: 120, w: 60, h: 200 }, // prateleiras altas
        ],
        cenario: [
          { tipo: 'prateleira-alta', x: 50, y: 220, w: 56, h: 196 }, { tipo: 'prateleira-alta', x: 390, y: 220, w: 56, h: 196 },
          { tipo: 'chao-galpao' },
        ],
        pois: [
          // Mantém liderFixo (o Cão Louco sempre lidera essa sala), mas a
          // escolta (se vier) sorteia do pool casca-grossa do galpão, não
          // do pool genérico da Pista inteira — mesmo motivo do m1.
          { poi: { id: 'galpao_m2', tipo: 'treta', repetivel: true, nivelRec: 14, enemy: 1301, liderFixo: 1301, moldesPool: PISTA_POOL_GALPAO, dificuldade: 'normal', i18n: 'games.gangues.cena.pista.galpao.m2', recompensa: { grana: 8, rep: 3 } }, pos: { x: 220, y: 180 } },
          { poi: { id: 'galpao_achado', tipo: 'achado', opcional: true, i18n: 'games.gangues.cena.pista.galpao.achado', recompensa: { grana: 18, item: 1 } }, pos: { x: 388, y: 150 } },
        ],
        passagem: { x: 200, y: 34, w: 80, h: 24, para: 2, precisa: 'galpao_m2', label: 'avancar' },
      },
      {
        id: 'escritorio',
        world: { w: 420, h: 320 }, spawn: { x: 210, y: 246 },
        saida: null,
        voltaPara: 1,
        colliders: [
          { x: 0, y: 0, w: 420, h: 30 }, { x: 0, y: 0, w: 14, h: 320 }, { x: 406, y: 0, w: 14, h: 320 }, { x: 0, y: 292, w: 420, h: 28 },
          { x: 120, y: 90, w: 180, h: 56 }, // mesa
        ],
        cenario: [
          { tipo: 'mesa-escritorio', x: 210, y: 118, w: 176 }, { tipo: 'cofre', x: 360, y: 210 },
          { tipo: 'quadro-horarios', x: 60, y: 90 }, { tipo: 'chao-galpao' },
        ],
        pois: [
          // "aperta" era enemy:1203 (Chinelada) FIXO, sem escalar — igual ao
          // Chinelada do galpao_m1/m2 (2.74.54), mas esse escapou porque não
          // é um POI de treta, é a punição de uma escolha de papo (o motor
          // trata viraTreta SEM revezamento como `fixo`, direto do molde
          // cru, sem calcular pontos contra o time). O Isaias pegou um
          // Chinelada A1/H1/R2/D1 de 6 PV bem na sala antes do breu do
          // Carvão. Agora escala igual o resto do galpão (revezamento,
          // pool casca-grossa).
          { poi: { id: 'galpao_contador', tipo: 'papo', opcional: true, repetivel: true, i18n: 'games.gangues.cena.pista.galpao.contador', escolhas: [{ id: 'escuta' }, { id: 'aperta', viraTreta: { enemy: 1203, rep: -1, recompensa: { grana: 6 }, revezamento: { pool: PISTA_POOL_GALPAO, budgetPorCorpo: 6, chanceDupla: 0.3 } } }] }, pos: { x: 120, y: 210 } },
        ],
        passagem: { x: 300, y: 34, w: 80, h: 24, para: 3, label: 'avancar' },
      },
      {
        id: 'breu',
        world: { w: 520, h: 400 }, spawn: { x: 260, y: 320 },
        saida: null,
        voltaPara: 2,
        colliders: [
          { x: 0, y: 0, w: 520, h: 30 }, { x: 0, y: 0, w: 14, h: 400 }, { x: 506, y: 0, w: 14, h: 400 }, { x: 0, y: 372, w: 520, h: 28 },
        ],
        cenario: [
          { tipo: 'chao-galpao' }, { tipo: 'luz-facho', x: 260, y: 150 },
          { tipo: 'pilha-sucata', x: 90, y: 300 }, { tipo: 'pilha-sucata', x: 430, y: 310 },
        ],
        pois: [
          { ref: '__chefe', pos: { x: 260, y: 120 } },
        ],
      },
    ],
  },
}
