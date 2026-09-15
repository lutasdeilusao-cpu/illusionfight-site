// Geometria do mundo navegável da Pista (rua, quarteirões/colisão, prédios,
// fundo). Extraído de data/cenas/pista.js
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §4).
//
// v3.2.0 (15/09/2026): a Pista ganhou arte de fundo de verdade — uma
// ilustração top-down única (`PistaMapa.png`, pedida pelo Isaias a partir de
// um prompt gerado com as medidas reais que este arquivo já tinha) cobrindo a
// rua inteira. Antes disso, TUDO aqui (prédio, obstáculo, cenário, fiação)
// era desenhado em CSS puro por `CenaCenario.jsx`; agora esse desenho vem da
// imagem de fundo (`FUNDO_PISTA`), e este arquivo só guarda o que ainda tem
// função de JOGO: o tamanho do mundo, a colisão (retângulos aproximando onde
// a ilustração realmente tem prédio) e as portas de interior (prédio → sala).
// `OBSTACULOS_PISTA`/`CENARIO_PISTA`/`FIACAO_PISTA` viraram listas vazias — a
// imagem já tem poste, fiação, entulho, árvore etc. desenhados; não faz
// sentido desenhar de novo por cima. Coordenadas em pixel de mundo puro
// (0–724 × 0–2172, o tamanho nativo da imagem) — mesmo espaço da posição do
// jogador e de `posicoes.js`.
// v3.9.0 (15/09/2026, pedido do Isaias — "carrega esse mapa por cortes... só
// a parte de baixo que você precisa até o muro... a segunda imagem carrega
// no lazy load"): a imagem única (470KB) virou DUAS, cortadas exatamente na
// faixa do muro (y920 — o mesmo y900-940 que já bloqueia colisão em
// `hitsSolid`, ganguesCenaMotor.js, então o corte cai bem em cima da parede
// desenhada, onde um possível 1px de emenda visual já fica escondido pela
// própria arte do muro). `mapa-exterior-baixo.webp` (y920-2172, 1252px,
// ~265KB) é a metade que o jogador SEMPRE precisa pra jogar (spawn é
// y2130, e o muro trava a passagem pro resto até bater o Carvão) — carregada
// eager, com uma tela de loading bloqueando a entrada até ela existir de
// verdade no navegador (ver `mapaPronto` em GanguesCena.jsx). `mapa-exterior-
// cima.webp` (y0-920, 920px, ~198KB) só existe pra quem já destrancou o
// muro/túnel — usa `loading="lazy"` nativo do `<img>` (CenaCenario.jsx): o
// navegador só baixa quando o retângulo real na tela (depois da câmera
// transformar/rolar) chega perto do viewport, sem precisar de nenhuma lógica
// custom de "só renderiza se...". Gerados com Pillow a partir do PNG
// original (mesma técnica de compressão webp qualidade 82 do arquivo único
// anterior) — nenhuma perda de nitidez, e a soma dos dois (~463KB) ficou até
// um pouco MENOR que o arquivo único de antes.
import mapaExteriorBaixo from '../../../assets/cenas/pista/mapa-exterior-baixo.webp'
import mapaExteriorCima from '../../../assets/cenas/pista/mapa-exterior-cima.webp'

// Y onde a imagem foi cortada em dois arquivos — MESMO espaço de coordenada
// de mundo que tudo mais aqui (`hitsSolid` usa a faixa y900-940 pro muro).
export const FUNDO_PISTA_CORTE_Y = 920
export const FUNDO_PISTA = { baixo: mapaExteriorBaixo, cima: mapaExteriorCima, corteY: FUNDO_PISTA_CORTE_Y }

// Curva do "radar"/minimapa — hoje não é lida por nenhum componente (campo
// vestigial, ver comentário antigo em index.js); mantida só por não quebrar
// o shape de CENA_PISTA.
export const RUA_PISTA =
  'M 362 2160 C 300 2000 420 1850 362 1700 ' +
  'C 300 1550 420 1300 362 1150 ' +
  'C 300 1000 420 850 460 900 ' +
  'C 500 950 362 500 362 20'

// ── Mundo navegável do exterior — tamanho NATIVO da ilustração ──
export const MUNDO_PISTA = { w: 724, h: 2172, spawn: { x: 362, y: 2130 } }

// Quarteirões — retângulos de colisão aproximando onde a ilustração REALMENTE
// tem prédio de cada lado da rua (a rua da imagem serpenteia; isso não é
// pixel-perfeito, só o suficiente pra não deixar o jogador atravessar
// parede). Ajustado visualmente com Playwright (overlay de debug, revertido).
export const QUARTEIROES_PISTA = [
  // Entrada (base) — y2000-2172
  { x: 0, y: 2000, w: 190, h: 172 }, { x: 560, y: 2000, w: 164, h: 172 },
  // Trecho genérico pré-praça — y1750-2000
  { x: 0, y: 1750, w: 130, h: 250 }, { x: 610, y: 1750, w: 114, h: 250 },
  // Praça (miolo aberto, sem colisor no centro — coreto/quadra/mercado só
  // decoração) — mantém as laterais fechadas.
  { x: 0, y: 1500, w: 60, h: 250 }, { x: 690, y: 1500, w: 34, h: 250 },
  // Oficina/gate/casas — y1000-1500
  { x: 0, y: 1270, w: 60, h: 230 }, { x: 620, y: 1270, w: 104, h: 230 },
  { x: 0, y: 1000, w: 300, h: 270 }, { x: 560, y: 1000, w: 164, h: 270 },
  // Aproximação do muro — y800-1000
  { x: 0, y: 800, w: 330, h: 200 }, { x: 640, y: 800, w: 84, h: 200 },
  // Pós-muro — y0-800 (galpão fica livre pra zona do chefe)
  { x: 0, y: 500, w: 250, h: 300 }, { x: 560, y: 500, w: 164, h: 300 },
  { x: 0, y: 170, w: 180, h: 330 }, { x: 560, y: 170, w: 164, h: 330 },
]

// Prédios — hoje só as portas de interior importam (a fachada é a imagem de
// fundo); cada entrada aqui é uma hitbox pequena e invisível.
export const PREDIOS_PISTA = [
  { id: 'c1', tipo: 'comercio', x: 40, y: 1590, w: 90, h: 70, nome: 'games.gangues.cena.pista.predio.bar', porta: { para: 'birosca', zx: 100, zy: 1660 }, solo: 1 },
  { id: 'of', tipo: 'comercio', x: 60, y: 1110, w: 100, h: 90, nome: 'games.gangues.cena.pista.predio.oficina', porta: { para: 'oficina', zx: 110, zy: 1190 }, solo: 1 },
  { id: 'tunel_ent', tipo: 'barraco', x: 470, y: 900, w: 100, h: 70, nome: 'games.gangues.cena.pista.predio.tunel_ent', porta: { para: 'tunel', comodo: 0, zx: 515, zy: 950 }, solo: 1 },
  { id: 'tunel_sai', tipo: 'barraco', x: 460, y: 700, w: 100, h: 70, nome: 'games.gangues.cena.pista.predio.tunel_sai', porta: { para: 'tunel', comodo: 2, zx: 500, zy: 745 }, solo: 1, pos_portao: 1 },
  { id: 'loja', tipo: 'comercio', x: 450, y: 550, w: 100, h: 70, nome: 'games.gangues.cena.pista.predio.lojapista', porta: { para: 'loja', zx: 490, zy: 595 }, pos_portao: 1 },
  { id: 'pm1', tipo: 'barraco', x: 100, y: 340, w: 100, h: 80, nome: 'games.gangues.cena.pista.predio.birosca_2', porta: { para: 'birosca_2', zx: 150, zy: 385 }, pos_portao: 1 },
  { id: 'galpao', tipo: 'galpao', x: 280, y: 20, w: 160, h: 140, porta: { para: 'galpao', zx: 362, zy: 120 }, pos_portao: 1 },
]

// Obstáculos/cenário/fiação — a ilustração de fundo já desenha tudo isso
// (entulho, poste, árvore, fiação). Listas vazias de propósito.
export const OBSTACULOS_PISTA = []
export const CENARIO_PISTA = []
export const FIACAO_PISTA = []
