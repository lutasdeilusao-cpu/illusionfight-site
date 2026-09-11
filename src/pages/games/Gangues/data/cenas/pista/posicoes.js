// Coordenadas dos pinos (POS) e zonas de interação (ENTRY_ZONES) dos POIs da
// Pista no mundo navegável. Extraído de GanguesCena.jsx
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §5): antes viviam
// no arquivo GENÉRICO da cena, mesmo sendo 100% específicas da Pista — o
// motor (engine/ganguesCenaMotor.js) lê essas coordenadas via
// `cena.pos`/`cena.entryZones`, nunca de uma constante global, então cada
// território pode ter seu próprio arquivo de posições sem tocar no motor.

// Os 4 pontos da linha da Rasteira (beco_2, beco_3, sinaleiro, rasteira_velha)
// ficavam TODOS empilhados no corredor antes do muro — visão poluída. Agora
// que tem radar (GanguesMiniMapa) pra guiar, eles se espalham pela rua toda,
// na ordem em que se revelam: birosca → beco_2 (baixo) → beco_3 (praça) →
// sinaleiro (vão aberto) → rasteira_velha (o último, colado no muro). O
// jogador sobe a Pista batendo um por um.
export const POS_PISTA = { sinal: { x: 210, y: 2570 }, ferro: { x: 150, y: 2325 }, achado: { x: 110, y: 2245 }, beco: { x: 445, y: 2190 }, birosca: { x: 170, y: 2460 }, corre: { x: 610, y: 2010 }, beco_2: { x: 330, y: 2270 }, beco_3: { x: 380, y: 1950 }, sinaleiro: { x: 440, y: 1755 }, rasteira_velha: { x: 360, y: 1440 }, oficina: { x: 250, y: 1705 }, descanso: { x: 205, y: 2440 }, posmuro_1: { x: 300, y: 860 }, posmuro_2: { x: 430, y: 600 }, informante: { x: 150, y: 1740 }, rinha: { x: 610, y: 1740 }, loja: { x: 210, y: 486 }, boss: { x: 570, y: 175 } }

export const ENTRY_ZONES_PISTA = {
  sinal: { x: 243, y: 2532, w: 70, h: 76 }, ferro: { x: 270, y: 2288, w: 35, h: 76 }, achado: { x: 75, y: 2212, w: 72, h: 72 }, beco: { x: 355, y: 2155, w: 76, h: 70 },
  birosca: { x: 270, y: 2418, w: 35, h: 82 }, corre: { x: 455, y: 1970, w: 35, h: 82 },
  // Os 4 pontos da linha da Rasteira espalhados pela rua toda (o radar guia).
  // Cada zona no corredor andável da sua faixa. beco_2: vão aberto y1172-1302.
  // beco_3: corredor da praça (x287-473). sinaleiro: vão aberto y676-802.
  // rasteira_velha: corredor colado no muro. loja: já do outro lado (y<350).
  beco_2: { x: 300, y: 2246, w: 60, h: 52 }, beco_3: { x: 350, y: 1926, w: 60, h: 52 },
  sinaleiro: { x: 410, y: 1731, w: 60, h: 52 }, rasteira_velha: { x: 330, y: 1416, w: 60, h: 52 },
  loja: { x: 196, y: 456, w: 64, h: 64 }, oficina: { x: 220, y: 1678, w: 64, h: 62 },
  // descanso_2 não tem zona de rua — mora dentro do barraco pm1 (interiores.birosca_2).
  posmuro_1: { x: 270, y: 834, w: 64, h: 56 }, posmuro_2: { x: 400, y: 574, w: 64, h: 56 },
  // informante/rinha ficam num trecho SEM colisor nenhum (y:1705-781 não tem
  // nenhum COLLIDERS cobrindo essa faixa) — diferente de ferro/corre/etc,
  // que hospedam perto de prédio de verdade e por isso a zona anda longe do
  // pino (encosta na borda do prédio, não no ícone). Aqui não existe prédio,
  // então a zona fica centralizada NO PRÓPRIO ícone — senão o jogador anda
  // até o que vê na tela e nada acontece, porque a zona de verdade tava
  // longe dali.
  descanso: { x: 270, y: 2375, w: 35, h: 72 }, informante: { x: 120, y: 1710, w: 60, h: 60 }, rinha: { x: 580, y: 1710, w: 60, h: 60 },
  boss: { x: 530, y: 300, w: 80, h: 45 },
}
