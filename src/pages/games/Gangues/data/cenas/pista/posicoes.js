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
// na ordem em que se revelam: beco → beco_2 (baixo) → beco_3 (praça) →
// sinaleiro (vão aberto) → rasteira_velha (o último, colado no muro). O
// jogador sobe a Pista batendo um por um.
// `agiota` NÃO tem posição de rua — pedido do Isaias, 21/09/2026 (corrigindo
// a 1ª versão, que tinha ido pro exterior): "você colocou o agiota fora do
// prédio, é lá dentro da birosca que ele tem que estar". Mora dentro da
// birosca (interiores.js/pois: ref 'agiota'). Todo POI que mora dentro de
// um interior (descanso, informante, oficina, loja...) não tem entrada aqui —
// a setinha do mini-mapa aponta pra porta do prédio (posNoMapa).
// `loja_pocoes` (Lojinha do Zé) — pedido do Isaias, 22/09/2026: "coloca a
// lojinha do Seu Zé bem aí onde eu marquei... ali no meio dessa rua porque
// aonde ele tá tá trabalhando muito" (print apontando um trecho vazio da
// rua, aberto, entre os dois quarteirões y2492-2622 — bem depois da Banca
// Fechada/c3, longe da porta da birosca que tava congestionada). Sem
// prédio nenhum perto (zona centrada no próprio ícone, mesmo critério de
// rinha).
export const POS_PISTA = { sinal: { x: 210, y: 2570 }, ferro: { x: 178, y: 2197 }, achado: { x: 110, y: 2245 }, beco: { x: 445, y: 2190 }, loja_pocoes: { x: 600, y: 2560 }, corre: { x: 610, y: 2010 }, beco_2: { x: 330, y: 2270 }, beco_3: { x: 380, y: 1950 }, sinaleiro: { x: 440, y: 1755 }, rasteira_velha: { x: 360, y: 1440 }, posmuro_1: { x: 300, y: 860 }, posmuro_2: { x: 430, y: 600 }, rinha: { x: 610, y: 1740 }, boss: { x: 570, y: 175 } }

export const ENTRY_ZONES_PISTA = {
  sinal: { x: 243, y: 2532, w: 70, h: 76 }, ferro: { x: 148, y: 2166, w: 60, h: 62 }, achado: { x: 75, y: 2212, w: 72, h: 72 }, beco: { x: 355, y: 2155, w: 76, h: 70 },
  loja_pocoes: { x: 570, y: 2530, w: 60, h: 60 }, corre: { x: 410, y: 1970, w: 60, h: 82 },
  // Os 4 pontos da linha da Rasteira espalhados pela rua toda (o radar guia).
  // Cada zona no corredor andável da sua faixa. beco_2: vão aberto y1172-1302.
  // beco_3: corredor da praça (x287-473). sinaleiro: vão aberto y676-802.
  // rasteira_velha: corredor colado no muro.
  beco_2: { x: 300, y: 2246, w: 60, h: 52 }, beco_3: { x: 350, y: 1926, w: 60, h: 52 },
  sinaleiro: { x: 410, y: 1731, w: 60, h: 52 }, rasteira_velha: { x: 330, y: 1416, w: 60, h: 52 },
  posmuro_1: { x: 270, y: 834, w: 64, h: 56 }, posmuro_2: { x: 400, y: 574, w: 64, h: 56 },
  // rinha fica num trecho SEM colisor nenhum (y:1705-781 não tem
  // nenhum COLLIDERS cobrindo essa faixa) — diferente de ferro/corre/etc,
  // que hospedam perto de prédio de verdade e por isso a zona anda longe do
  // pino (encosta na borda do prédio, não no ícone). Aqui não existe prédio,
  // então a zona fica centralizada NO PRÓPRIO ícone — senão o jogador anda
  // até o que vê na tela e nada acontece, porque a zona de verdade tava
  // longe dali.
  rinha: { x: 580, y: 1710, w: 60, h: 60 },
  boss: { x: 530, y: 300, w: 80, h: 45 },
}
