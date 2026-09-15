// Coordenadas dos pinos (POS) e zonas de interação (ENTRY_ZONES) dos POIs da
// Pista no mundo navegável. Extraído de GanguesCena.jsx
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §5): o motor
// (engine/ganguesCenaMotor.js) lê essas coordenadas via
// `cena.pos`/`cena.entryZones`, nunca de uma constante global.
//
// v3.2.0 (15/09/2026): remapeado do zero pra bater com a ilustração de fundo
// `PistaMapa.png` (724×2172 — ver mundo.js/FUNDO_PISTA). Onde a imagem tem um
// cenário claramente reconhecível, o POI foi plantado ali (oficina no
// barracão de ferramentas+carro, ferro/achado no ferro-velho com portão de
// grade, birosca nas mesas do bar, informante no orelhão da praça, loja na
// lojinha de toldo verde pós-muro, os 2 bondes de tocaia pós-muro perto do
// sofá/carro branco). Os demais (as tretas de rua — beco/beco_2/beco_3/
// sinaleiro/rasteira_velha/rinha — e descanso) não têm um prédio único e
// exclusivo pintado pra cada um na imagem; ficaram espalhados nos trechos de
// rua genérica, preservando o lado (esquerda/direita) e a proximidade
// relativa ao muro (rasteira_velha é o mais perto, sinaleiro o penúltimo,
// como já era). Isso é uma limitação aceita de usar 1 imagem só em vez de uma
// pintada sob medida por ponto (ver docs/ReportAI/MAPA_PISTA_ATUAL.md).
export const POS_PISTA = {
  // ── Pré-muro (y940-2172, sobe da entrada até o muro) ──
  sinal: { x: 362, y: 2000 },
  rinha: { x: 150, y: 2080 },
  descanso: { x: 150, y: 1660 },
  informante: { x: 365, y: 1630 },
  birosca: { x: 80, y: 1620 },
  corre: { x: 150, y: 1850 },
  beco: { x: 350, y: 1900 },
  beco_2: { x: 550, y: 1870 },
  beco_3: { x: 500, y: 1780 },
  achado: { x: 170, y: 1330 },
  ferro: { x: 230, y: 1290 },
  oficina: { x: 110, y: 1150 },
  sinaleiro: { x: 240, y: 1080 },
  rasteira_velha: { x: 600, y: 1000 },
  // ── Pós-muro (y<800, do túnel até o galpão) ──
  posmuro_1: { x: 150, y: 560 },
  posmuro_2: { x: 600, y: 430 },
  loja: { x: 490, y: 590 },
  // Só usado pelo radar (a luta em si acontece dentro do interior do galpão —
  // ver `temGalpaoInterno` em ganguesCenaMotor.js) — mantido pra apontar a
  // seta do minimapa antes do muro abrir.
  boss: { x: 362, y: 120 },
}

export const ENTRY_ZONES_PISTA = {
  sinal: { x: 332, y: 1970, w: 60, h: 60 },
  rinha: { x: 120, y: 2050, w: 60, h: 60 },
  descanso: { x: 120, y: 1630, w: 60, h: 60 },
  informante: { x: 335, y: 1600, w: 60, h: 60 },
  birosca: { x: 60, y: 1590, w: 60, h: 60 },
  corre: { x: 120, y: 1820, w: 60, h: 60 },
  beco: { x: 320, y: 1870, w: 60, h: 60 },
  beco_2: { x: 520, y: 1840, w: 60, h: 60 },
  beco_3: { x: 470, y: 1750, w: 60, h: 60 },
  achado: { x: 140, y: 1300, w: 60, h: 60 },
  ferro: { x: 200, y: 1260, w: 60, h: 60 },
  oficina: { x: 90, y: 1160, w: 60, h: 60 },
  sinaleiro: { x: 210, y: 1050, w: 60, h: 60 },
  rasteira_velha: { x: 570, y: 970, w: 60, h: 60 },
  posmuro_1: { x: 120, y: 530, w: 60, h: 60 },
  posmuro_2: { x: 570, y: 400, w: 60, h: 60 },
  loja: { x: 460, y: 560, w: 64, h: 64 },
  boss: { x: 332, y: 90, w: 60, h: 60 },
}
