// Geometria do mundo navegável da Pista (rua, quarteirões/colisão, prédios,
// obstáculos, cenário decorativo, fiação aérea). Extraído de
// data/cenas/pista.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §4).
// Coordenadas dos pinos: viewBox "0 0 100 240" (rua vertical que rola).

// A rua da Pista — sobe da base (moleque no farol) até a boca do Fumaça no topo.
export const RUA_PISTA =
  'M 50 236 C 34 214 66 198 52 176 C 40 156 72 140 56 118 ' +
  'C 44 98 74 84 58 62 C 48 46 62 30 50 8'

// ── Mundo navegável do exterior ──────────────────────────────
// (antes eram consts soltas em GanguesCena.jsx — agora moram no dado da cena,
//  pra o mesmo motor servir os interiores na fase 2)
export const MUNDO_PISTA = { w: 760, h: 2840, spawn: { x: 380, y: 2720 } }

// Quarteirões — os blocos SÓLIDOS de construção (colisão). São exatamente os
// COLLIDERS antigos: o motor não muda, só ganha prédio desenhado por cima.
export const QUARTEIROES_PISTA = [
  { x: 0, y: 1350, w: 287, h: 326 }, { x: 473, y: 1350, w: 287, h: 326 },
  { x: 0, y: 1802, w: 287, h: 370 }, { x: 473, y: 1802, w: 287, h: 370 },
  { x: 0, y: 2302, w: 287, h: 190 }, { x: 473, y: 2302, w: 287, h: 190 },
  { x: 0, y: 2622, w: 287, h: 218 }, { x: 473, y: 2622, w: 287, h: 218 },
]

// Prédios (só VISUAL — a colisão vem dos quarteirões). Cada bloco de favela é
// vários barracos/lajes desalinhados, não uma caixa só. `tipo`:
//  barraco  — 1 pavimento, madeirite + tijolo, telha de amianto
//  laje     — concreto cru, tijolo baiano, vergalhão pra cima, caixa d'água
//  sobrado  — 2 pavimentos rebocados e pintados, varandinha com grade
//  comercio — térreo com toldo, placa pintada à mão, portão de aço
//  galpao   — grande, telha metálica, portão de correr, pichação
// `porta`: { para } marca onde a fase 2 abre um interior (na fase 1 é decorativa).
export const PREDIOS_PISTA = [
  // ── Entrada da Pista (base, y>1622) ──
  { id: 'e1', tipo: 'barraco', x: 8, y: 2636, w: 150, h: 118, cor: '#7a6a52', luz: 1 },
  { id: 'e2', tipo: 'laje', x: 150, y: 2622, w: 132, h: 150, andares: 2, cor: '#8f8577', varal: 1 },
  { id: 'e3', tipo: 'barraco', x: 486, y: 2648, w: 140, h: 110, cor: '#6f6350' },
  { id: 'e4', tipo: 'sobrado', x: 620, y: 2622, w: 138, h: 170, cor: '#4a6a63', luz: 1, varal: 1 },
  // ── Miolo baixo (Bar do Zé / Banca, y1302–1492) ──
  { id: 'c1', tipo: 'comercio', x: 137, y: 2330, w: 150, h: 152, cor: '#b8863b', nome: 'games.gangues.cena.pista.predio.bar', porta: { para: 'birosca', zx: 332, zy: 2405 }, toldo: 1, solo: 1 },
  { id: 'c2', tipo: 'laje', x: 156, y: 2310, w: 126, h: 170, andares: 2, cor: '#8a8074', pich: 1 },
  { id: 'c3', tipo: 'comercio', x: 476, y: 2322, w: 150, h: 158, cor: '#3f6f8a', nome: 'games.gangues.cena.pista.predio.banca', portao_aco: 1 },
  { id: 'c4', tipo: 'barraco', x: 628, y: 2332, w: 128, h: 150, cor: '#726552', luz: 1 },
  // ── Banda da praça (mercadinho, fliperama, y802–1172) ──
  { id: 'b1', tipo: 'laje', x: 4, y: 1812, w: 150, h: 180, andares: 3, cor: '#948a7c', varal: 1, pich: 1 },
  { id: 'b2', tipo: 'barraco', x: 150, y: 1900, w: 132, h: 122, cor: '#6b5f4d' },
  { id: 'b3', tipo: 'laje', x: 150, y: 1806, w: 132, h: 96, cor: '#8b8175', luz: 1 },
  { id: 'b4', tipo: 'comercio', x: 476, y: 1820, w: 154, h: 150, cor: '#a85f3b', nome: 'games.gangues.cena.pista.predio.mercado', toldo: 1 },
  { id: 'b5', tipo: 'comercio', x: 476, y: 1970, w: 154, h: 110, cor: '#5a4a8a', nome: 'games.gangues.cena.pista.predio.fliperama', luz: 1 },
  { id: 'b6', tipo: 'laje', x: 630, y: 1812, w: 126, h: 180, andares: 2, cor: '#8f8578', varal: 1 },
  // ── Oficina do Nando (miolo baixo-esq, y676+) ── nasce fora de quarteirão
  { id: 'of', tipo: 'comercio', x: 150, y: 1610, w: 128, h: 92, cor: '#c2a03b', nome: 'games.gangues.cena.pista.predio.oficina', porta: { para: 'oficina', zx: 232, zy: 1744 }, oficina: 1, solo: 1 },
  // ── Antes do MURO (y350–676) — a base da gangue rival ──
  { id: 'a1', tipo: 'laje', x: 4, y: 1356, w: 150, h: 200, andares: 3, cor: '#7d7468', pich: 1 },
  { id: 'a2', tipo: 'barraco', x: 152, y: 1500, w: 130, h: 160, cor: '#5f5545' },
  { id: 'a3', tipo: 'laje', x: 152, y: 1356, w: 130, h: 140, andares: 2, cor: '#867c70', varal: 1 },
  // A BOCA DO TÚNEL — barraco encostado no muro; por dentro dele desce a
  // passagem "secreta" que fura por BAIXO do muro. Só abre depois de fechar os
  // ponto (portao.precisa). O muro em si NUNCA abre — só depois de bater o
  // Carvão, aí libera a abertura pra facilitar o vai-e-vem.
  { id: 'tunel_ent', tipo: 'barraco', x: 476, y: 1352, w: 132, h: 122, cor: '#544b3d', pich: 1, nome: 'games.gangues.cena.pista.predio.tunel_ent', porta: { para: 'tunel', comodo: 0, zx: 452, zy: 1404 }, solo: 1 },
  // ── DEPOIS do muro (y<1330) — só se chega tunelando ──
  // Área pós-muro ENORME (1330px de fundo): você emerge do túnel COLADO no muro
  // (tunel_sai, y~1120), e sobe uma rua LONGA de quebrada — birosca do primo,
  // dois bondes de tocaia, a loja — até o galpão do Carvão lá no fundão (y~24).
  // A favela pós-muro (barracos/lajes `pm*`) forra as duas beiras; o miolo
  // (x287-473) fica sempre livre pra caminhada.
  { id: 'tunel_sai', tipo: 'barraco', x: 300, y: 1112, w: 132, h: 112, cor: '#4e463a', pich: 1, nome: 'games.gangues.cena.pista.predio.tunel_sai', porta: { para: 'tunel', comodo: 2, zx: 366, zy: 1256 }, solo: 1, pos_portao: 1 },
  // A loja da Pista — no meio da subida, equipa a gangue pro que vem.
  { id: 'loja', tipo: 'comercio', x: 40, y: 420, w: 150, h: 120, cor: '#c25a2a', nome: 'games.gangues.cena.pista.predio.lojapista', porta: { para: 'loja', zx: 210, zy: 486 }, toldo: 1, pos_portao: 1, solo: 1 },
  // ── O GALPÃO DO CARVÃO (topo-direita, o fundão) ──
  { id: 'galpao', tipo: 'galpao', x: 470, y: 24, w: 250, h: 210, cor: '#3a4247', pich: 1, porta: { para: 'galpao', zx: 596, zy: 262 }, portaX: 546, portaW: 100, solo: 1, pos_portao: 1 },
  // ── Favela pós-muro (só decoração + colisão; forra as beiras da rua longa) ──
  // pm1 = A BIROSCA DO PRIMO: primeiro barraco depois da saída do túnel, tem
  // porta (interior birosca_2) — descanso + caderneta do Nato lá DENTRO, sem
  // pino solto na rua. É a "franquia" pós-muro: paga/descansa sem voltar tunelando.
  { id: 'pm1', tipo: 'barraco', x: 8, y: 1150, w: 150, h: 118, cor: '#6b5f4d', pos_portao: 1, solo: 1, luz: 1, nome: 'games.gangues.cena.pista.predio.birosca_2', porta: { para: 'birosca_2', zx: 178, zy: 1206 } },
  { id: 'pm2', tipo: 'laje', x: 600, y: 1170, w: 152, h: 150, andares: 2, cor: '#867c70', pos_portao: 1, solo: 1, varal: 1 },
  { id: 'pm3', tipo: 'laje', x: 8, y: 940, w: 140, h: 170, andares: 2, cor: '#8f8578', pos_portao: 1, solo: 1, pich: 1 },
  { id: 'pm4', tipo: 'sobrado', x: 590, y: 930, w: 160, h: 168, cor: '#4a6a63', pos_portao: 1, solo: 1, luz: 1, varal: 1 },
  { id: 'pm5', tipo: 'barraco', x: 8, y: 720, w: 148, h: 120, cor: '#7a6a52', pos_portao: 1, solo: 1 },
  { id: 'pm6', tipo: 'laje', x: 600, y: 690, w: 150, h: 190, andares: 3, cor: '#948a7c', pos_portao: 1, solo: 1, varal: 1, pich: 1 },
  { id: 'pm7', tipo: 'laje', x: 8, y: 558, w: 150, h: 150, andares: 2, cor: '#7d7468', pos_portao: 1, solo: 1, varal: 1 },
  { id: 'pm8', tipo: 'barraco', x: 600, y: 430, w: 150, h: 130, cor: '#726552', pos_portao: 1, solo: 1, luz: 1 },
  { id: 'pm9', tipo: 'laje', x: 8, y: 200, w: 140, h: 180, andares: 3, cor: '#8a8074', pos_portao: 1, solo: 1, pich: 1 },
]

// Empecilhos de rua — POR ENQUANTO todos são DECORAÇÃO (sem colisão). Buraco
// sólido no meio do corredor estreito (~186px) travava o jogador logo no 1º
// passo, sem sinal nenhum de que era pra contornar. O "desvia do buraco" volta
// depois, com desenho de nível pensado (buraco fora da coluna de spawn, dica).
export const OBSTACULOS_PISTA = [
  { id: 'o1', tipo: 'buraco', x: 300, y: 2660 },
  { id: 'o2', tipo: 'entulho', x: 320, y: 2400 },
  { id: 'o3', tipo: 'buraco', x: 448, y: 2330 },
  { id: 'o4', tipo: 'lixo', x: 300, y: 2240 },
  { id: 'o5', tipo: 'lombada', x: 380, y: 2190 },
  { id: 'o6', tipo: 'pneu', x: 448, y: 2120 },
  { id: 'o7', tipo: 'geladeira', x: 300, y: 2050 },
  { id: 'o8', tipo: 'poca', x: 400, y: 1900 },
  { id: 'o9', tipo: 'buraco', x: 300, y: 1760 },
  { id: 'o10', tipo: 'bueiro', x: 448, y: 1640 },
  { id: 'o11', tipo: 'entulho', x: 300, y: 1470 },
  { id: 'o12', tipo: 'cone', x: 448, y: 1400 },
  { id: 'o13', tipo: 'lixo', x: 620, y: 2200 },
  { id: 'o14', tipo: 'sofa', x: 120, y: 2240 },
  // ── Pós-muro (a rua longa até o galpão) — tudo decoração ──
  { id: 'pmo1', tipo: 'entulho', x: 300, y: 1180 },
  { id: 'pmo2', tipo: 'pneu', x: 470, y: 1120 },
  { id: 'pmo3', tipo: 'lixo', x: 320, y: 1000 },
  { id: 'pmo4', tipo: 'buraco', x: 450, y: 900 },
  { id: 'pmo5', tipo: 'geladeira', x: 300, y: 760 },
  { id: 'pmo6', tipo: 'lombada', x: 380, y: 640 },
  { id: 'pmo7', tipo: 'entulho', x: 460, y: 470 },
  { id: 'pmo8', tipo: 'poca', x: 320, y: 360 },
  { id: 'pmo9', tipo: 'cone', x: 470, y: 300 },
]

// Cenário — decoração pura, sem colisão. `tipo` desenha em CSS.
export const CENARIO_PISTA = [
  // praça (miolo, y790–1000, x210–550) — árvores, bancos, mural, quadra
  { tipo: 'praca', x: 380, y: 1895, w: 330, h: 200 },
  { tipo: 'arvore', x: 300, y: 1840 }, { tipo: 'arvore', x: 470, y: 1860 },
  { tipo: 'arvore', x: 360, y: 1960 }, { tipo: 'arvore-seca', x: 250, y: 1930 },
  { tipo: 'banco', x: 330, y: 1900 }, { tipo: 'banco', x: 430, y: 1940 },
  { tipo: 'coreto', x: 385, y: 1880 },
  { tipo: 'quadra', x: 130, y: 1900, w: 150, h: 180 },
  { tipo: 'cesta', x: 130, y: 1830 },
  { tipo: 'mural', x: 478, y: 2120, w: 150, h: 46 },
  { tipo: 'orelhao', x: 300, y: 1770 },
  { tipo: 'bica', x: 470, y: 2000 },
  // vida
  { tipo: 'crianca', x: 340, y: 1920 }, { tipo: 'crianca', x: 415, y: 1890 },
  { tipo: 'cachorro', x: 300, y: 2010 },
  { tipo: 'moto', x: 95, y: 1720 },
  { tipo: 'carro-sem-roda', x: 620, y: 2470 },
  { tipo: 'ponto-onibus', x: 640, y: 1730 },
  { tipo: 'caixa-dagua-com', x: 60, y: 2180 },
  // varais entre prédios
  { tipo: 'varal', x: 285, y: 2400, w: 60 }, { tipo: 'varal', x: 285, y: 1900, w: 60 },
  // grafite / pichação no chão e muro
  { tipo: 'grafite', x: 70, y: 1290, texto: 'games.gangues.cena.pista.grafite' },
  { tipo: 'tenis-no-fio', x: 305, y: 2130 },
  // ── Pós-muro — vida na rua longa (favela do outro lado) ──
  { tipo: 'varal', x: 160, y: 1000, w: 70 }, { tipo: 'varal', x: 560, y: 780, w: 70 },
  { tipo: 'arvore', x: 250, y: 1060 }, { tipo: 'arvore-seca', x: 500, y: 560 },
  { tipo: 'banco', x: 300, y: 1120 }, { tipo: 'cachorro', x: 430, y: 980 },
  { tipo: 'crianca', x: 350, y: 720 }, { tipo: 'moto', x: 250, y: 430 },
  { tipo: 'caixa-dagua-com', x: 160, y: 640 },
  { tipo: 'grafite', x: 300, y: 250, texto: 'games.gangues.cena.pista.grafite' },
  { tipo: 'tenis-no-fio', x: 455, y: 700 },
  { tipo: 'carro-sem-roda', x: 610, y: 560 },
]

// Fiação aérea — pares [xA, yA, xB, yB] no mundo; puro visual (o gato).
export const FIACAO_PISTA = [
  [45, 300, 690, 320], [45, 620, 690, 600], [45, 940, 690, 960], [45, 1240, 690, 1220],
  [45, 1700, 690, 1690], [45, 2120, 690, 2140],
  [45, 2430, 690, 2420], [305, 250, 305, 2600], [455, 250, 455, 2600],
]
