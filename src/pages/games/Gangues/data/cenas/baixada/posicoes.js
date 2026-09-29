// Coordenadas de MUNDO dos POIs da rua da Baixada (pino) e a zona de
// interação (onde o jogador pisa). O esqueleto é o da Pista (mesma orientação,
// ruas e quarteirões já validados); tudo fica sobre asfalto livre.
// A LINHA DO TREM corta o mapa na faixa y1296–1336 (ver TREM_BAIXADA em
// mundo.js): o folgado foge sempre pro OUTRO lado dela, então a cadeia
// alterna embaixo/em cima da linha.
// POI que mora dentro de interior (birosca, padaria, depósito) não tem
// entrada aqui — o motor tira ele da rua sozinho (refsInternos).
export const POS_BAIXADA = {
  // O velho da entrada — e, depois do café, o próprio chefe no mesmo lugar.
  veio: { x: 380, y: 2590 },
  veio_cafe: { x: 380, y: 2590 },
  boss: { x: 380, y: 2590 },
  // A cadeia do folgado (embaixo → em cima → embaixo…)
  folgado_1: { x: 600, y: 2560 },
  folgado_2: { x: 380, y: 1075 },
  folgado_3: { x: 150, y: 2245 },
  folgado_4: { x: 600, y: 615 },
  folgado_5: { x: 380, y: 1760 },
  folgado_final: { x: 380, y: 320 },
  // opcionais
  rinha_trilho: { x: 620, y: 1745 },
  caixa_trilho: { x: 600, y: 1128 },
}

export const ENTRY_ZONES_BAIXADA = {
  veio: { x: 345, y: 2555, w: 70, h: 70 },
  veio_cafe: { x: 345, y: 2555, w: 70, h: 70 },
  boss: { x: 340, y: 2550, w: 80, h: 80 },
  folgado_1: { x: 568, y: 2528, w: 64, h: 64 },
  folgado_2: { x: 348, y: 1043, w: 64, h: 64 },
  folgado_3: { x: 118, y: 2213, w: 64, h: 64 },
  folgado_4: { x: 568, y: 583, w: 64, h: 64 },
  folgado_5: { x: 348, y: 1728, w: 64, h: 64 },
  folgado_final: { x: 348, y: 288, w: 64, h: 64 },
  rinha_trilho: { x: 590, y: 1715, w: 60, h: 60 },
  caixa_trilho: { x: 570, y: 1098, w: 60, h: 60 },
}
