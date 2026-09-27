// ── MUNDO da Feira (geometria + cenário) ─────────────────────────────
// A Feira usa o MESMO esqueleto da Pista ESPELHADO na horizontal (x' = 760 − x):
// toda rua, quarteirão, porta e zona de interação já foi validada na Pista
// (colisão, alcance, perseguidor), e espelhar mantém isso verdade sem mudar a
// cara — tudo que era à esquerda vai pra direita. O que muda é a identidade:
// bancas de lona no corredor, fiação de gato por todo lado, o Acerto de Contas
// pichado nas paredes e, do outro lado da barricada, a Feira no APAGÃO.

export const MUNDO_FEIRA = { w: 760, h: 2840, spawn: { x: 380, y: 2720 } }

export const RUAS_FEIRA = [
  { tipo: 'main', x: 305, y: 0, w: 150, h: 2840 },
  { tipo: 'cross', x: 0, y: 2510, w: 760, h: 112 }, { tipo: 'cross', x: 0, y: 2190, w: 760, h: 112 },
  { tipo: 'cross', x: 0, y: 1690, w: 760, h: 112 }, { tipo: 'cross', x: 0, y: 1040, w: 760, h: 112 },
  { tipo: 'cross', x: 0, y: 560, w: 760, h: 112 },
  { tipo: 'branch-left', x: 80, y: 1935, w: 260, h: 82 }, { tipo: 'branch-right', x: 420, y: 1935, w: 260, h: 82 },
]

// A "barricada" da Feira: bancas empilhadas + fiação caída, na mesma faixa do
// muro da Pista. Abre de vez quando o Cobrador cai (a luz volta).
export const MURO_FEIRA = { y1: 1330, y2: 1350, aviso: 1430 }

export const POSTES_FEIRA = [120, 340, 520, 700, 880, 1060, 1240, 1510, 1690, 1870, 2050, 2260, 2440, 2620]

const PICH = 'games.gangues.cena.feira.pich'

export const QUARTEIROES_FEIRA = [
  { x: 473, y: 1350, w: 287, h: 326 }, { x: 0, y: 1350, w: 287, h: 326 },
  { x: 473, y: 1802, w: 287, h: 370 }, { x: 0, y: 1802, w: 287, h: 370 },
  { x: 473, y: 2302, w: 287, h: 190 }, { x: 0, y: 2302, w: 287, h: 190 },
  { x: 473, y: 2622, w: 287, h: 218 }, { x: 0, y: 2622, w: 287, h: 218 },
]

// Prédios com `porta.para` abrem interior (ver interiores.js); `solo` = a
// fachada colide; `pos_portao` = do outro lado da barricada (lado apagado).
export const PREDIOS_FEIRA = [
  // ── entrada (spawn) ──
  { id: 'e1', tipo: 'comercio', x: 602, y: 2636, w: 150, h: 118, cor: '#3f7a5a', toldo: 1, nome: 'games.gangues.cena.feira.predio.hortifruti' },
  { id: 'e2', tipo: 'laje', x: 478, y: 2622, w: 132, h: 150, andares: 2, cor: '#8a7f70', varal: 1 },
  { id: 'e3', tipo: 'barraco', x: 134, y: 2648, w: 140, h: 110, cor: '#7a5f4a', luz: 1 },
  { id: 'e4', tipo: 'sobrado', x: 2, y: 2622, w: 138, h: 170, cor: '#5a4a7a', varal: 1 },
  // ── a banca do Turco / pensão ──
  { id: 'pensao', tipo: 'comercio', x: 473, y: 2330, w: 150, h: 152, cor: '#b0664a', nome: 'games.gangues.cena.feira.predio.pensao', porta: { para: 'pensao', zx: 428, zy: 2405 }, toldo: 1, solo: 1 },
  { id: 'c2', tipo: 'laje', x: 478, y: 2310, w: 126, h: 170, andares: 2, cor: '#867c6c', pich: PICH },
  { id: 'c3', tipo: 'comercio', x: 134, y: 2322, w: 150, h: 158, cor: '#c2a03b', nome: 'games.gangues.cena.feira.predio.caderneta', portao_aco: 1 },
  { id: 'c4', tipo: 'barraco', x: 4, y: 2332, w: 128, h: 150, cor: '#6a5a44', luz: 1 },
  // ── miolo da feira ──
  { id: 'b1', tipo: 'laje', x: 606, y: 1812, w: 150, h: 180, andares: 3, cor: '#8f8474', varal: 1, pich: PICH },
  { id: 'b2', tipo: 'barraco', x: 478, y: 1900, w: 132, h: 122, cor: '#5f6a4d' },
  { id: 'b3', tipo: 'laje', x: 478, y: 1806, w: 132, h: 96, cor: '#8b8175', luz: 1 },
  { id: 'b4', tipo: 'comercio', x: 130, y: 1820, w: 154, h: 150, cor: '#a8453b', nome: 'games.gangues.cena.feira.predio.acougue', toldo: 1 },
  { id: 'b5', tipo: 'comercio', x: 130, y: 1970, w: 154, h: 110, cor: '#3b6fa8', nome: 'games.gangues.cena.feira.predio.pastel', luz: 1 },
  { id: 'b6', tipo: 'laje', x: 4, y: 1812, w: 126, h: 180, andares: 2, cor: '#8f8578', varal: 1 },
  { id: 'radio', tipo: 'comercio', x: 482, y: 1610, w: 128, h: 92, cor: '#4a8a8a', nome: 'games.gangues.cena.feira.predio.radio', porta: { para: 'radio', zx: 528, zy: 1744 }, solo: 1 },
  { id: 'a1', tipo: 'laje', x: 606, y: 1356, w: 150, h: 200, andares: 3, cor: '#7d7468', pich: PICH },
  { id: 'a2', tipo: 'barraco', x: 478, y: 1500, w: 130, h: 160, cor: '#5f5545' },
  { id: 'a3', tipo: 'laje', x: 478, y: 1356, w: 130, h: 140, andares: 2, cor: '#867c70', varal: 1 },
  { id: 'galeria_ent', tipo: 'barraco', x: 152, y: 1352, w: 132, h: 122, cor: '#3a4a3f', pich: PICH, nome: 'games.gangues.cena.feira.predio.galeria_ent', porta: { para: 'galeria', comodo: 0, zx: 308, zy: 1404 }, solo: 1 },
  // ── LADO APAGADO (depois da barricada) ──
  { id: 'galeria_sai', tipo: 'barraco', x: 328, y: 1112, w: 132, h: 112, cor: '#34423a', pich: PICH, nome: 'games.gangues.cena.feira.predio.galeria_sai', porta: { para: 'galeria', comodo: 2, zx: 394, zy: 1256 }, solo: 1, pos_portao: 1 },
  { id: 'mercearia', tipo: 'comercio', x: 570, y: 420, w: 150, h: 120, cor: '#b8863b', nome: 'games.gangues.cena.feira.predio.mercearia', porta: { para: 'mercearia', zx: 550, zy: 486 }, toldo: 1, pos_portao: 1, solo: 1 },
  { id: 'mercadao', tipo: 'galpao', x: 40, y: 24, w: 250, h: 210, cor: '#2f3a44', pich: PICH, porta: { para: 'mercadao', zx: 164, zy: 262 }, portaX: 114, portaW: 100, solo: 1, pos_portao: 1 },
  { id: 'pensao2', tipo: 'barraco', x: 602, y: 1150, w: 150, h: 118, cor: '#7a5f4a', pos_portao: 1, solo: 1, luz: 1, nome: 'games.gangues.cena.feira.predio.pensao_2', porta: { para: 'pensao_2', zx: 582, zy: 1206 } },
  { id: 'pm2', tipo: 'laje', x: 8, y: 1170, w: 152, h: 150, andares: 2, cor: '#867c70', pos_portao: 1, solo: 1, varal: 1 },
  { id: 'pm3', tipo: 'laje', x: 612, y: 940, w: 140, h: 170, andares: 2, cor: '#8f8578', pos_portao: 1, solo: 1, pich: PICH },
  { id: 'serralheria', tipo: 'sobrado', x: 10, y: 930, w: 160, h: 168, cor: '#5a5f66', pos_portao: 1, solo: 1, luz: 1, nome: 'games.gangues.cena.feira.predio.serralheria', porta: { para: 'serralheria', zx: 196, zy: 1014 } },
  { id: 'pm5', tipo: 'barraco', x: 604, y: 720, w: 148, h: 120, cor: '#7a6a52', pos_portao: 1, solo: 1 },
  { id: 'pm6', tipo: 'laje', x: 10, y: 690, w: 150, h: 190, andares: 3, cor: '#948a7c', pos_portao: 1, solo: 1, varal: 1, pich: PICH },
  { id: 'pm7', tipo: 'laje', x: 602, y: 558, w: 150, h: 150, andares: 2, cor: '#7d7468', pos_portao: 1, solo: 1, varal: 1 },
  { id: 'pm8', tipo: 'barraco', x: 10, y: 430, w: 150, h: 130, cor: '#726552', pos_portao: 1, solo: 1, luz: 1 },
  { id: 'pm9', tipo: 'laje', x: 612, y: 200, w: 140, h: 180, andares: 3, cor: '#8a8074', pos_portao: 1, solo: 1, pich: PICH },
]

// Empecilhos de rua (sem colisão) — caixote virado, lixo de feira, fio no chão.
export const OBSTACULOS_FEIRA = [
  { id: 'o1', tipo: 'lixo', x: 460, y: 2660 },
  { id: 'o2', tipo: 'entulho', x: 440, y: 2440 },
  { id: 'o3', tipo: 'poca', x: 312, y: 2330 },
  { id: 'o4', tipo: 'lixo', x: 460, y: 2240 },
  { id: 'o5', tipo: 'lombada', x: 380, y: 2150 },
  { id: 'o6', tipo: 'pneu', x: 312, y: 2120 },
  { id: 'o7', tipo: 'cone', x: 460, y: 2000 },
  { id: 'o8', tipo: 'poca', x: 360, y: 1880 },
  { id: 'o9', tipo: 'lixo', x: 460, y: 1640 },
  { id: 'o10', tipo: 'bueiro', x: 312, y: 1600 },
  { id: 'o11', tipo: 'entulho', x: 460, y: 1470 },
  { id: 'o12', tipo: 'cone', x: 312, y: 1380 },
  { id: 'pmo1', tipo: 'entulho', x: 460, y: 1180 },
  { id: 'pmo2', tipo: 'lixo', x: 290, y: 1080 },
  { id: 'pmo3', tipo: 'poca', x: 440, y: 960 },
  { id: 'pmo4', tipo: 'buraco', x: 310, y: 900 },
  { id: 'pmo5', tipo: 'geladeira', x: 460, y: 760 },
  { id: 'pmo6', tipo: 'lombada', x: 380, y: 640 },
  { id: 'pmo7', tipo: 'entulho', x: 300, y: 470 },
  { id: 'pmo8', tipo: 'poca', x: 440, y: 360 },
]

// Cenário: as BANCAS (lona listrada, cor por banca) margeando o corredor da
// feira de domingo, caixotes, e a vida de rua de sempre.
const LONAS = ['#c8453a', '#3a7ac8', '#e0a12f', '#3aa86a', '#9a4ac8', '#c8743a']
const banca = (x, y, i) => ({ tipo: 'banca', x, y, cor: LONAS[i % LONAS.length] })
export const CENARIO_FEIRA = [
  // corredor de bancas na calçada dos dois lados da rua principal
  ...[2700, 2460, 2380, 2120, 2040, 1960, 1880, 1600, 1500, 1420].map((y, i) => banca(282, y, i)),
  ...[2740, 2470, 2400, 2140, 2060, 1980, 1620, 1520, 1440].map((y, i) => banca(478, y, i + 3)),
  { tipo: 'caixote', x: 300, y: 2640 }, { tipo: 'caixote', x: 462, y: 2560 }, { tipo: 'caixote', x: 300, y: 2280 },
  { tipo: 'caixote', x: 462, y: 1920 }, { tipo: 'caixote', x: 300, y: 1550 },
  { tipo: 'praca', x: 380, y: 1895, w: 330, h: 200 },
  { tipo: 'coreto', x: 385, y: 1880 }, { tipo: 'banco', x: 330, y: 1900 }, { tipo: 'banco', x: 430, y: 1940 },
  { tipo: 'arvore', x: 300, y: 1840 }, { tipo: 'arvore', x: 470, y: 1860 },
  { tipo: 'crianca', x: 345, y: 1925 }, { tipo: 'cachorro', x: 460, y: 2010 },
  { tipo: 'orelhao', x: 460, y: 1770 }, { tipo: 'ponto-onibus', x: 120, y: 1730 },
  { tipo: 'moto', x: 665, y: 1720 }, { tipo: 'carro-sem-roda', x: 140, y: 2470 },
  { tipo: 'mural', x: 132, y: 2120, w: 150, h: 46 },
  { tipo: 'grafite', x: 690, y: 1290, texto: 'games.gangues.cena.feira.grafite' },
  // lado apagado
  { tipo: 'caixote', x: 460, y: 1060 }, { tipo: 'caixote', x: 300, y: 820 },
  { tipo: 'banca', x: 480, y: 980, cor: '#5a5a5a' }, { tipo: 'banca', x: 282, y: 700, cor: '#5a5a5a' },
  { tipo: 'arvore-seca', x: 260, y: 560 }, { tipo: 'cachorro', x: 330, y: 980 },
  { tipo: 'grafite', x: 460, y: 250, texto: 'games.gangues.cena.feira.grafite' },
]

// Fiação de gato — a Feira é dos Gato: fio atravessando tudo.
export const FIACAO_FEIRA = [
  [45, 300, 690, 320], [45, 620, 690, 600], [45, 940, 690, 960], [45, 1240, 690, 1220],
  [45, 1560, 690, 1580], [45, 1700, 690, 1690], [45, 1980, 690, 2000], [45, 2120, 690, 2140],
  [45, 2430, 690, 2420], [45, 2600, 690, 2620], [305, 250, 305, 2600], [455, 250, 455, 2600],
  [45, 1860, 455, 1780], [305, 2300, 690, 2360],
]
