// Coordenadas de MUNDO dos POIs da rua do Morro (pino) e a zona de interação.
// São os MESMOS pontos já validados na Baixada/Vila (asfalto livre). Cada
// trecho entre dois portões da escadaria (ver BARREIRAS_MORRO) tem os seus:
//   embaixo do 1º portão (y > 2080): morador, escadaria, cupim
//   entre o 1º e o 2º (1336–2040):   laje nova, rinha
//   entre o 2º e o 3º (840–1296):    posto de rojão, segunda mãe
//   em cima do 3º (y < 800):         escadaria inteira, última escada
export const POS_MORRO = {
  morador: { x: 380, y: 2590 },
  escadaria: { x: 600, y: 2560 },
  cupim: { x: 150, y: 2245 },
  laje_nova: { x: 380, y: 1760 },
  rinha_morro: { x: 620, y: 1745 },
  posto_rojao: { x: 380, y: 1075 },
  segunda_mae: { x: 600, y: 1128 },
  escadaria_inteira: { x: 600, y: 615 },
  ultima_escada: { x: 380, y: 320 },
}

export const ENTRY_ZONES_MORRO = {
  morador: { x: 345, y: 2555, w: 70, h: 70 },
  escadaria: { x: 568, y: 2528, w: 64, h: 64 },
  cupim: { x: 118, y: 2213, w: 64, h: 64 },
  laje_nova: { x: 348, y: 1728, w: 64, h: 64 },
  rinha_morro: { x: 590, y: 1715, w: 60, h: 60 },
  posto_rojao: { x: 348, y: 1043, w: 64, h: 64 },
  segunda_mae: { x: 570, y: 1098, w: 60, h: 60 },
  escadaria_inteira: { x: 568, y: 583, w: 64, h: 64 },
  ultima_escada: { x: 348, y: 288, w: 64, h: 64 },
}
