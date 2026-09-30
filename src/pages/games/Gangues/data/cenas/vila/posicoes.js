// Coordenadas de MUNDO dos POIs do TÉRREO da Vila (pino) e a zona de
// interação. O esqueleto é o da Pista/Baixada (mesma orientação); estes pontos
// são os MESMOS já validados na Baixada (asfalto livre, alcançáveis do spawn).
// Tudo que mora dentro do Bloco A (os dez andares), da birosca, do brechó e
// da oficina não tem entrada aqui — o motor tira da rua sozinho.
export const POS_VILA = {
  vizinho: { x: 380, y: 2590 },
  guarita: { x: 600, y: 2560 },
  portaria_fuga_1: { x: 150, y: 2245 },
  rinha_laje: { x: 620, y: 1745 },
  varal_patio: { x: 600, y: 1128 },
  cadeado: { x: 380, y: 320 },
}

export const ENTRY_ZONES_VILA = {
  vizinho: { x: 345, y: 2555, w: 70, h: 70 },
  guarita: { x: 568, y: 2528, w: 64, h: 64 },
  portaria_fuga_1: { x: 118, y: 2213, w: 64, h: 64 },
  rinha_laje: { x: 590, y: 1715, w: 60, h: 60 },
  varal_patio: { x: 570, y: 1098, w: 60, h: 60 },
  cadeado: { x: 348, y: 288, w: 64, h: 64 },
}
