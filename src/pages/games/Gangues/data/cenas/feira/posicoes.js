// Coordenadas de MUNDO de cada POI da rua da Feira (onde o pino fica) e a
// zona de interação (onde o jogador pisa pra interagir). Os pontos
// herdados do esqueleto da Pista são o espelho exato (x' = 760 − x) dos
// dela, já validados; os novos da Feira ficam sempre sobre asfalto livre
// (rua principal x305–455 ou travessas), fora de quarteirão.
// POI que mora DENTRO de interior (pensão, rádio, mercearia...) não tem
// entrada aqui — o motor tira ele da rua sozinho (refsInternos).
export const POS_FEIRA = {
  catraca: { x: 550, y: 2570 },
  banca_turco: { x: 380, y: 2380 },
  cobranca: { x: 315, y: 2190 },
  quadro_luz: { x: 582, y: 2197 },
  pagina_1: { x: 650, y: 2245 },
  beco_gato: { x: 430, y: 2270 },
  muamba: { x: 150, y: 2010 },
  balanca: { x: 380, y: 1950 },
  camelo: { x: 160, y: 2560 },
  favor_devedor: { x: 380, y: 2070 },
  favor_marmita: { x: 80, y: 2246 },
  favor_cobrador: { x: 690, y: 1745 },
  caderneta_viva: { x: 150, y: 1740 },
  mao_turco: { x: 320, y: 1755 },
  caixa_forte: { x: 400, y: 1440 },
  // lado apagado
  pagina_2: { x: 380, y: 1000 },
  rinha_apostas: { x: 380, y: 780 },
  deposito_1: { x: 460, y: 860 },
  deposito_2: { x: 330, y: 600 },
  boss: { x: 190, y: 175 },
}

export const ENTRY_ZONES_FEIRA = {
  catraca: { x: 447, y: 2532, w: 70, h: 76 },
  banca_turco: { x: 350, y: 2352, w: 60, h: 56 },
  cobranca: { x: 329, y: 2155, w: 76, h: 70 },
  quadro_luz: { x: 552, y: 2166, w: 60, h: 62 },
  pagina_1: { x: 613, y: 2212, w: 72, h: 72 },
  beco_gato: { x: 400, y: 2246, w: 60, h: 52 },
  muamba: { x: 290, y: 1970, w: 60, h: 82 },
  balanca: { x: 350, y: 1926, w: 60, h: 52 },
  camelo: { x: 130, y: 2530, w: 60, h: 60 },
  favor_devedor: { x: 350, y: 2042, w: 60, h: 56 },
  favor_marmita: { x: 50, y: 2218, w: 60, h: 56 },
  favor_cobrador: { x: 660, y: 1717, w: 60, h: 56 },
  caderneta_viva: { x: 120, y: 1710, w: 60, h: 60 },
  mao_turco: { x: 290, y: 1731, w: 60, h: 52 },
  caixa_forte: { x: 370, y: 1416, w: 60, h: 52 },
  pagina_2: { x: 350, y: 972, w: 60, h: 56 },
  rinha_apostas: { x: 350, y: 752, w: 60, h: 56 },
  deposito_1: { x: 426, y: 834, w: 64, h: 56 },
  deposito_2: { x: 296, y: 574, w: 64, h: 56 },
  boss: { x: 150, y: 300, w: 80, h: 45 },
}
