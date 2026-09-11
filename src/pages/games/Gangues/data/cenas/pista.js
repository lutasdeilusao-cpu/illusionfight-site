/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — A Pista como CENA navegável
   (protótipo da proposta em src/pages/games/Gangues/GANGUES_MODO_HISTORIA_ENCONTROS.md;
   lore canônica em docs/Games/Gangues/LDI_GANGUES_GDD.md)

   O bairro deixa de ser "trilha de nós" e vira uma rua desenhada com
   PINOS (POIs). Cada POI tem um TIPO e um estado
   (escondido → disponível → resolvido). Resolver um POI revela o
   próximo pelo grafo `revela`. O portão do chefe abre quando os
   POIs-chave caíram (`portao`).

   Coordenadas dos pinos: viewBox "0 0 100 240" (rua vertical que rola).
   `ruaPath` é um <path> tortinho subindo — o Isaias troca por arte
   depois; a curva e os pinos ficam.

   TIPOS:
   • treta    → GanguesCombat (fluxo story-combat existente)
   • parada   → GanguesParada  (lib Puzzles/ com skin de gangue)
   • papo     → GanguesPapo    (GangDialog + escolhas)
   • corre    → GanguesCorre   (PuzzleStealthGrid com skin)
   • achado   → GanguesAchado  (loot, sem interação)
   • descanso → GanguesDescanso (cura fôlego gastando grana)
   ══════════════════════════════════════════════════════════════ */

// A rua da Pista — sobe da base (moleque no farol) até a boca do Fumaça no topo.
const RUA_PISTA =
  'M 50 236 C 34 214 66 198 52 176 C 40 156 72 140 56 118 ' +
  'C 44 98 74 84 58 62 C 48 46 62 30 50 8'

// ── Mundo navegável do exterior ──────────────────────────────
// (antes eram consts soltas em GanguesCena.jsx — agora moram no dado da cena,
//  pra o mesmo motor servir os interiores na fase 2)
const MUNDO_PISTA = { w: 760, h: 2840, spawn: { x: 380, y: 2720 } }

// Quarteirões — os blocos SÓLIDOS de construção (colisão). São exatamente os
// COLLIDERS antigos: o motor não muda, só ganha prédio desenhado por cima.
const QUARTEIROES_PISTA = [
  { x: 0, y: 1350, w: 287, h: 326 }, { x: 473, y: 1350, w: 287, h: 326 },
  { x: 0, y: 1802, w: 287, h: 370 }, { x: 473, y: 1802, w: 287, h: 370 },
  { x: 0, y: 2302, w: 287, h: 190 }, { x: 473, y: 2302, w: 287, h: 190 },
  { x: 0, y: 2622, w: 287, h: 218 }, { x: 473, y: 2622, w: 287, h: 218 },
]

// Moldes que as tretas de rua da Pista revezam ("estilo Pokémon"). Antes eram
// só 5 ids repetidos à exaustão — o Isaias reclamou de encarar Ratazana toda
// hora. Agora ~14: vigia fraco de esquina (11xx) + vapor de rua (12xx). O
// escalarInimigo ajusta a força, então o molde é só a "cara".
const PISTA_POOL_RUA = [1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1201, 1202, 1203, 1204, 1205]
// Só vigia (sem vapor) pro corredor do túnel — o degrau mais fácil.
const PISTA_POOL_TUNEL = [1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110]
// Guarda-costas do Carvão (pós-muro, antes do galpão) — o bonde de verdade:
// vapor casca-grossa + gerente. Um degrau acima da rua.
const PISTA_POOL_GALPAO = [1206, 1207, 1208, 1301, 1302, 1303, 1401, 1402]

// Prédios (só VISUAL — a colisão vem dos quarteirões). Cada bloco de favela é
// vários barracos/lajes desalinhados, não uma caixa só. `tipo`:
//  barraco  — 1 pavimento, madeirite + tijolo, telha de amianto
//  laje     — concreto cru, tijolo baiano, vergalhão pra cima, caixa d'água
//  sobrado  — 2 pavimentos rebocados e pintados, varandinha com grade
//  comercio — térreo com toldo, placa pintada à mão, portão de aço
//  galpao   — grande, telha metálica, portão de correr, pichação
// `porta`: { para } marca onde a fase 2 abre um interior (na fase 1 é decorativa).
const PREDIOS_PISTA = [
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
const OBSTACULOS_PISTA = [
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
const CENARIO_PISTA = [
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
const FIACAO_PISTA = [
  [45, 300, 690, 320], [45, 620, 690, 600], [45, 940, 690, 960], [45, 1240, 690, 1220],
  [45, 1700, 690, 1690], [45, 2120, 690, 2140],
  [45, 2430, 690, 2420], [305, 250, 305, 2600], [455, 250, 455, 2600],
]

export const CENA_PISTA = {
  id: 'pista',
  territorioId: 'pista',
  cor: '#3ddc97',
  ruaPath: RUA_PISTA,
  mundo: MUNDO_PISTA,
  quarteiroes: QUARTEIROES_PISTA,
  predios: PREDIOS_PISTA,
  obstaculos: OBSTACULOS_PISTA,
  cenario: CENARIO_PISTA,
  fiacao: FIACAO_PISTA,
  // Fala de chegada (voz da quebrada — uma ou duas linhas no GangDialog).
  chegada: 'games.gangues.cena.pista.chegada',
  falante: 'games.gangues.dialogo.veio_nome',
  falanteSub: 'games.gangues.dialogo.veio_sub',

  pois: [
    {
      id: 'sinal',
      tipo: 'papo',
      visivel: true,
      // Repetível: a opção "aperta" (brigar com o moleque, enemy:1201)
      // é a primeira briga que existe no jogo — o jogador pode voltar aqui e
      // brigar de novo sempre que quiser (custa -1 rep por vez, igual da
      // primeira). As outras duas opções (compra/ignora) também continuam
      // reabrindo o papo, mas não têm efeito relevante além da primeira vez.
      repetivel: true,
      pino: { x: 52, y: 208 },
      i18n: 'games.gangues.cena.pista.sinal',
      // escolhas do papo: cada uma tem efeito próprio
      escolhas: [
        { id: 'compra', custoGrana: 4, recompensa: { rep: 0 }, revela: ['ferro'] },
        { id: 'aperta', viraTreta: { enemy: 1201, rep: -1, recompensa: { grana: 4 }, revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 4, chanceDupla: 0.15 } }, revela: ['ferro'] },
        { id: 'ignora', revela: ['ferro'] },
      ],
    },
    {
      id: 'ferro',
      tipo: 'parada',
      pino: { x: 60, y: 168 },
      i18n: 'games.gangues.cena.pista.ferro',
      // "A sequência da fechadura" — decorar e repetir a ordem dos pinos do
      // cadeado (PuzzleSimonSays, self-styled, sem depender de Puzzles.css).
      puzzle: { type: 'simon', config: { difficulty: 'easy' }, skin: 'gazua' },
      recompensa: { grana: 12, item: 13 },
      falha: { viraTreta: { enemy: 1201, recompensa: { grana: 3 }, revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 4, chanceDupla: 0.1 } } },
      // Abrir a fechadura revela o beco (caminho principal), o fundo do
      // ferro-velho (achado — 2º pedaço de sucata) e a oficina do Nando (onde
      // a sucata vira peça).
      revela: ['beco', 'achado', 'oficina'],
    },
    {
      // Achado — loot dentro do ferro-velho, sem interação (GanguesCena.abrir
      // resolve na hora com toast). Revelado só depois de abrir a gazua.
      id: 'achado',
      tipo: 'achado',
      opcional: true,
      pino: { x: 68, y: 150 },
      i18n: 'games.gangues.cena.pista.achado',
      recompensa: { grana: 15, item: 13 },
    },
    {
      // A OFICINA DO NANDO — o desafio de cenário estilo Zelda clássico: o
      // jogador junta 2 pedaços de sucata (um no puzzle do ferro-velho, outro
      // no fundo dele) e traz pro Nando, que forja uma peça E conta onde o
      // Carvão se enfia. Obrigatório pro portão — sem a peça o time não tem
      // fôlego pro chefe. (Seu Nando: GDD §8, a oficina já é cena decorativa.)
      id: 'oficina',
      tipo: 'papo',
      pino: { x: 30, y: 62 },
      i18n: 'games.gangues.cena.pista.oficina',
      escolhas: [
        { id: 'forjar', precisaItens: { 13: 2 }, daEquip: [101], recompensa: { rep: 4 } },
      ],
    },
    {
      id: 'beco',
      nivelRec: 2,
      tipo: 'treta',
      // Continua OBRIGATÓRIA pra abrir o portão (portao.precisa) — repetivel
      // só faz ela continuar desafiável DEPOIS de vencida uma vez, igual a
      // rinha (mesmo travarPontosFarm em GanguesCena.jsx). É a treta mais
      // fácil e mais cedo da Pista — vira o alvo natural pra upar quem acaba
      // de ser recrutado e começa do nível 1.
      repetivel: true,
      pino: { x: 50, y: 132 },
      i18n: 'games.gangues.cena.pista.beco',
      // É a primeira treta de verdade do jogo, logo depois da criação da
      // ficha. REVEZAMENTO (v2.74.6): em vez de sortear dos 11 moldes da Pista
      // (que podia trazer Gerente/Cobrador escalado logo de cara), roda um
      // punhado de fracos — Farejador/Dedo-Duro/Pingo/Ratazana/Chinelada —
      // quase sempre 1 sozinho, às vezes uma dupla. Orçamento leve e FIXO por
      // corpo (não escala com o time): a porta de entrada fica gentil e continua
      // farmável pra sempre.
      enemy: 1201,
      revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 5, chanceDupla: 0.4 },
      forca: 1,
      dificuldade: 'facil',
      recompensa: { grana: 8, rep: 2 },
      revela: ['birosca'],
    },
    {
      id: 'birosca',
      tipo: 'papo',
      pino: { x: 62, y: 100 },
      i18n: 'games.gangues.cena.pista.birosca',
      escolhas: [
        { id: 'aceita_corre', revela: ['corre', 'beco_2', 'descanso'] },
        { id: 'so_papo', revela: ['beco_2', 'descanso'] },
      ],
    },
    {
      id: 'corre',
      tipo: 'corre',
      opcional: true,
      pino: { x: 56, y: 70 },
      i18n: 'games.gangues.cena.pista.corre',
      // Corre opcional, primeira vez do jogador com stealth: grade 5×5, só 2
      // câmeras de alcance 1, sem timer. Falhar aqui só custa fôlego.
      puzzle: { type: 'stealth', config: { size: 5, cameraCount: 2, visionRange: 1, hasTimer: false }, skin: 'viatura' },
      recompensa: { grana: 16, rep: 2 },
    },
    {
      id: 'beco_2',
      nivelRec: 4,
      tipo: 'treta',
      // Regra geral (pedido do Isaias): todo evento de batalha da história
      // deve poder ser repetido pra upar, exceto o chefe. Continua
      // OBRIGATÓRIA vencer 1x pra abrir o portão (portao não depende dela
      // aqui, mas fica revelada só depois de beco+ferro+birosca).
      repetivel: true,
      pino: { x: 44, y: 48 },
      i18n: 'games.gangues.cena.pista.beco_2',
      // Segunda treta — um degrau acima da primeira: 'normal' (ratio 0.52 na
      // Pista) em vez de 'facil'. 'dificil' fica reservado pros bairros de
      // cima; aqui ainda é a rampa de entrada.
      enemy: 1301,
      forca: 2,
      dificuldade: 'normal',
      recompensa: { grana: 8, rep: 3 },
      revela: ['beco_3'],
    },
    {
      // 3º ponto da Pista — o degrau do meio, mantém o bairro mais longo pra
      // quem corre sem upar chegar no Carvão já em L6-L7 (e apanhar). Pool
      // comum da Pista, 'normal'. Repetível pra farm.
      id: 'beco_3',
      nivelRec: 6,
      tipo: 'treta',
      repetivel: true,
      pino: { x: 40, y: 40 },
      i18n: 'games.gangues.cena.pista.beco_3',
      enemy: 1302,
      forca: 2,
      dificuldade: 'normal',
      recompensa: { grana: 9, rep: 3 },
      revela: ['sinaleiro'],
    },
    {
      // O SINALEIRO CHEFE (1451) — o outro General da Pista. "Comanda todos os
      // vigias: se ele apita, o bairro corre." `liderFixo` põe ele sempre na
      // frente do bando. Obrigatório pro portão — os dois generais (Sinaleiro
      // + Rasteira Velha) caem antes do Carvão descer. Entra no álbum aqui,
      // não só na luta de chefe.
      id: 'sinaleiro',
      nivelRec: 8,
      tipo: 'treta',
      repetivel: true,
      pino: { x: 66, y: 30 },
      i18n: 'games.gangues.cena.pista.sinaleiro',
      enemy: 1451,
      liderFixo: 1451,
      forca: 3,
      dificuldade: 'dificil',
      recompensa: { grana: 12, rep: 5 },
      revela: ['rasteira_velha'],
    },
    {
      // A luta de GENERAL — o "quase-chefe" que sinaliza que o Carvão vai
      // descer (GDD §4/§5.5). A Rasteira Velha (1452, "a mais antiga do Bonde
      // do Sinal, treinou os pivete novo") é a dona do beco — por isso o beco
      // tem o nome dela. `liderFixo` força o bando a vir SEMPRE com ela na
      // frente (+ escolta sorteada). 'dificil' + obrigatória pro portão.
      id: 'rasteira_velha',
      nivelRec: 10,
      tipo: 'treta',
      repetivel: true,
      pino: { x: 58, y: 30 },
      i18n: 'games.gangues.cena.pista.rasteira_velha',
      enemy: 1452,
      liderFixo: 1452,
      forca: 3,
      dificuldade: 'dificil',
      recompensa: { grana: 10, rep: 6 },
    },
    {
      // Treta repetível de farm: pode ser encarada quantas vezes o jogador
      // quiser, pra upar sem depender de progresso novo. O bando é travado
      // no primeiro confronto contra o total de pontos da gangue NAQUELE
      // momento (ver travarPontosFarm/GanguesCena.jsx) — não escala mais
      // depois disso, então fica mais fácil conforme a gangue cresce.
      id: 'rinha',
      tipo: 'treta',
      opcional: true,
      repetivel: true,
      visivel: true,
      pino: { x: 40, y: 190 },
      i18n: 'games.gangues.cena.pista.rinha',
      enemy: 1201,
      revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 5, chanceDupla: 0.35 },
      forca: 1,
      dificuldade: 'facil',
      recompensa: { grana: 4 },
    },
    {
      // A "loja abandonada" do outro lado do muro. Só aparece e fica
      // alcançável DEPOIS que o portão do chefe abre (todo o trabalho da base
      // feito — é o Proceder: "não se desafia o topo sem rachar a base").
      // A partir daí é a loja permanente da Pista: equipa a gangue pra Feira
      // e pro farm. `pos_portao` = GanguesCena só mostra o pino com bossAberto.
      id: 'loja',
      tipo: 'loja',
      opcional: true,
      repetivel: true,
      visivel: false,
      pos_portao: true,
      pino: { x: 26, y: 13 },
      i18n: 'games.gangues.cena.pista.loja',
      // Catálogo final da Pista (ids numéricos — consumível 1–99 em
      // data/ganguesItens.js, equipamento 101+ em data/ganguesEquip.js):
      //  1/2   poção HP / MP
      //  comum, 1 por slot: 101 soqueira · 104 gorro · 107/108 colete PV/PM
      //                     · 112 luva · 115 tênis · 118 corrente
      //  incomum ("junta grana"): 102 faca · 105 capacete · 109 colete placa
      //                           · 113 manopla · 116 coturno
      itens: [1, 2, 101, 102, 104, 105, 107, 108, 109, 112, 113, 115, 116, 118],
    },
    {
      // Reaproveitamento: continua na Pista mesmo depois dela virar
      // território dominado — é assim que ele libera o chefe da Feira
      // (ver `precisaInformante` em ganguesTerritorios.js). Sempre visível
      // e repetível: o jogador pode voltar aqui a qualquer momento.
      id: 'informante',
      tipo: 'papo',
      opcional: true,
      repetivel: true,
      visivel: true,
      pino: { x: 30, y: 150 },
      i18n: 'games.gangues.cena.pista.informante',
      escolhas: [
        { id: 'perguntar', informante: 'feira' },
      ],
    },
    {
      // Visível DESDE O COMEÇO (não só depois da birosca) — como o PV/PM
      // persiste entre lutas (aplicarDanoPersistente), o jogador precisa de
      // um jeito de curar a tropa já nas primeiras tretas repetíveis
      // (sinal/rinha), muito antes de beco+ferro+birosca abrirem.
      id: 'descanso',
      tipo: 'descanso',
      opcional: true,
      repetivel: true,
      visivel: true,
      pino: { x: 70, y: 118 },
      i18n: 'games.gangues.cena.pista.descanso',
      custoGrana: 10,
    },
    {
      // Birosca improvisada do OUTRO lado do muro — o Nato tem um primo lá.
      // Mesma função (curar a tropa + caderneta do Nato pra pagar a dívida),
      // só que já pós-muro. NÃO fica solta na rua: mora DENTRO do barraco pm1
      // (interiores.birosca_2) — o jogador entra pela porta. É a "franquia"
      // pós-muro: descansa/paga sem voltar tunelando.
      id: 'descanso_2',
      tipo: 'descanso',
      opcional: true,
      repetivel: true,
      i18n: 'games.gangues.cena.pista.descanso_2',
      custoGrana: 10,
    },
    {
      // ── Guarda-costas do Carvão, PÓS-MURO — gate do galpão ──
      // O caminho até o galpão (lá no fundo do mundo agora) tem dois bondes de
      // tocaia. Tem que bater os dois pra a porta do galpão destrancar
      // (galpao.abreComResolvido). Repetíveis pra farm depois.
      id: 'posmuro_1',
      nivelRec: 11,
      tipo: 'treta',
      repetivel: true,
      pos_portao: true,
      pino: { x: 40, y: 90 },
      i18n: 'games.gangues.cena.pista.posmuro_1',
      enemy: 1206,
      revezamento: { pool: PISTA_POOL_GALPAO, budgetPorCorpo: 6, chanceDupla: 0.5 },
      forca: 2,
      dificuldade: 'normal',
      recompensa: { grana: 9, rep: 3 },
      revela: ['posmuro_2'],
    },
    {
      id: 'posmuro_2',
      nivelRec: 13,
      tipo: 'treta',
      repetivel: true,
      pino: { x: 60, y: 60 },
      i18n: 'games.gangues.cena.pista.posmuro_2',
      enemy: 1301,
      liderFixo: 1301,
      revezamento: { pool: PISTA_POOL_GALPAO, budgetPorCorpo: 7, chanceDupla: 0.6 },
      forca: 3,
      dificuldade: 'dificil',
      recompensa: { grana: 12, rep: 4 },
    },
  ],

  // ── INTERIORES navegáveis (fase 2) ──────────────────────────
  // Cada interior tem 1+ cômodos. Um cômodo é um mundo pequeno próprio:
  //  world/spawn/saida/colliders/cenario/pois (+ passagem pro próximo cômodo).
  // `pois[].ref` reaproveita um POI de `pois` acima (mesma lógica de combate/
  // papo/loja); `pois[].poi` é um POI completo próprio (mobs do galpão).
  // `porta.predio` = qual prédio do exterior abre este interior.
  interiores: {
    birosca: {
      nome: 'games.gangues.cena.pista.int.birosca',
      porta: { predio: 'c1' },
      // A birosca do Nato tá sempre aberta (é a única esquina de confiança da
      // Pista). O papo do Nato (`birosca`, obrigatório pro portão) só aparece
      // DEPOIS do beco — antes disso o Nato nem te reconhece. O descanso e o
      // Duda (informante) ficam disponíveis desde sempre.
      comodos: [{
        id: 'sala',
        world: { w: 460, h: 320 }, spawn: { x: 230, y: 236 },
        saida: { x: 202, y: 300, w: 56, h: 20 },
        colliders: [
          { x: 0, y: 0, w: 460, h: 30 }, { x: 0, y: 0, w: 14, h: 320 }, { x: 446, y: 0, w: 14, h: 320 },
          { x: 0, y: 292, w: 188, h: 28 }, { x: 258, y: 292, w: 202, h: 28 },
          { x: 108, y: 66, w: 244, h: 40 }, // balcão
        ],
        cenario: [
          { tipo: 'balcao', x: 230, y: 86, w: 240 },
          { tipo: 'geladeira-refri', x: 66, y: 120 }, { tipo: 'tv', x: 396, y: 62 },
          { tipo: 'mesa', x: 120, y: 210 }, { tipo: 'mesa', x: 340, y: 220 },
          { tipo: 'cartaz', x: 230, y: 40 },
        ],
        pois: [
          { ref: 'birosca', pos: { x: 200, y: 118 }, precisa: 'beco' },
          { ref: 'informante', pos: { x: 400, y: 200 } },
          { ref: 'descanso', pos: { x: 74, y: 210 } },
        ],
      }],
    },
    // ── A BIROSCA DO PRIMO (pós-muro) — dentro do barraco pm1 ──
    // Mesma cara da birosca do Nato, do outro lado do muro. Um cômodo só:
    // o descanso_2 (descansar a tropa + caderneta do Nato pra quitar a dívida).
    birosca_2: {
      nome: 'games.gangues.cena.pista.int.birosca_2',
      porta: { predio: 'pm1', posPortao: true },
      comodos: [{
        id: 'sala',
        world: { w: 440, h: 300 }, spawn: { x: 220, y: 220 },
        saida: { x: 194, y: 280, w: 52, h: 20 },
        colliders: [
          { x: 0, y: 0, w: 440, h: 28 }, { x: 0, y: 0, w: 14, h: 300 }, { x: 426, y: 0, w: 14, h: 300 },
          { x: 0, y: 272, w: 182, h: 28 }, { x: 258, y: 272, w: 182, h: 28 },
          { x: 100, y: 58, w: 240, h: 40 }, // balcão
        ],
        cenario: [
          { tipo: 'balcao', x: 220, y: 78, w: 236 },
          { tipo: 'geladeira-refri', x: 60, y: 118 }, { tipo: 'tv', x: 380, y: 58 },
          { tipo: 'mesa', x: 120, y: 200 }, { tipo: 'cartaz', x: 220, y: 40 },
        ],
        pois: [
          { ref: 'descanso_2', pos: { x: 220, y: 118 } },
        ],
      }],
    },
    oficina: {
      nome: 'games.gangues.cena.pista.int.oficina',
      porta: { predio: 'of' },
      abreCom: 'oficina',
      comodos: [{
        id: 'bancada',
        world: { w: 420, h: 300 }, spawn: { x: 210, y: 218 },
        saida: { x: 184, y: 280, w: 52, h: 20 },
        colliders: [
          { x: 0, y: 0, w: 420, h: 28 }, { x: 0, y: 0, w: 14, h: 300 }, { x: 406, y: 0, w: 14, h: 300 },
          { x: 0, y: 272, w: 172, h: 28 }, { x: 236, y: 272, w: 184, h: 28 },
          { x: 90, y: 60, w: 240, h: 44 }, // bancada
        ],
        cenario: [
          { tipo: 'bancada', x: 210, y: 82, w: 236 }, { tipo: 'ferramentas', x: 210, y: 44 },
          { tipo: 'pneu', x: 60, y: 210 }, { tipo: 'peca-exposta', x: 360, y: 120 },
        ],
        pois: [{ ref: 'oficina', pos: { x: 200, y: 120 } }],
      }],
    },
    loja: {
      nome: 'games.gangues.cena.pista.int.loja',
      porta: { predio: 'loja' },
      comodos: [{
        id: 'mercearia',
        world: { w: 440, h: 320 }, spawn: { x: 220, y: 236 },
        saida: { x: 194, y: 300, w: 52, h: 20 },
        colliders: [
          { x: 0, y: 0, w: 440, h: 28 }, { x: 0, y: 0, w: 14, h: 320 }, { x: 426, y: 0, w: 14, h: 320 },
          { x: 0, y: 292, w: 182, h: 28 }, { x: 262, y: 292, w: 178, h: 28 },
          { x: 96, y: 70, w: 250, h: 40 }, // caixa
          { x: 20, y: 140, w: 80, h: 120 }, { x: 340, y: 140, w: 80, h: 120 }, // prateleiras
        ],
        cenario: [
          { tipo: 'caixa-loja', x: 220, y: 90, w: 246 },
          { tipo: 'prateleira', x: 60, y: 200, w: 76, h: 116 }, { tipo: 'prateleira', x: 380, y: 200, w: 76, h: 116 },
          { tipo: 'cartaz', x: 220, y: 44 },
        ],
        pois: [{ ref: 'loja', pos: { x: 200, y: 122 } }],
      }],
    },
    // ── O TÚNEL "secreto" — fura por baixo do muro (3 cômodos) ──
    // O muro NUNCA abre sozinho. Depois de fechar os ponto (portao.precisa) a
    // boca do túnel destranca; você atravessa (uns vigia no caminho) e emerge
    // no barraco do outro lado. Bidirecional: entra pela boca (cômodo 0) ou
    // pela saída do outro lado (cômodo 2).
    tunel: {
      nome: 'games.gangues.cena.pista.int.tunel',
      porta: { predio: 'tunel_ent' },
      gate: 'portao', // destranca só com portao.precisa TODO feito
      comodos: [
        {
          id: 'boca',
          world: { w: 380, h: 340 }, spawn: { x: 190, y: 288 },
          saida: { x: 162, y: 302, w: 56, h: 20 }, // volta pra rua (lado de cá)
          colliders: [
            { x: 0, y: 0, w: 380, h: 28 }, { x: 0, y: 0, w: 34, h: 340 }, { x: 346, y: 0, w: 34, h: 340 },
            { x: 0, y: 294, w: 150, h: 46 }, { x: 230, y: 294, w: 150, h: 46 },
            { x: 40, y: 70, w: 70, h: 60 }, // entulho/escombro
          ],
          cenario: [{ tipo: 'chao-tunel' }, { tipo: 'escombro', x: 75, y: 100 }, { tipo: 'lampada-tunel', x: 190, y: 40 }],
          pois: [
            { poi: { id: 'tunel_m1', tipo: 'treta', repetivel: true, revezamento: { pool: PISTA_POOL_TUNEL, budgetPorCorpo: 4, chanceDupla: 0.22 }, i18n: 'games.gangues.cena.pista.tunel.m1', recompensa: { grana: 5, rep: 2 } }, pos: { x: 190, y: 130 } },
          ],
          passagem: { x: 150, y: 30, w: 80, h: 24, para: 1, precisa: 'tunel_m1', label: 'avancar' },
        },
        {
          id: 'meio',
          world: { w: 360, h: 420 }, spawn: { x: 180, y: 378 },
          voltaPara: 0,
          colliders: [
            { x: 0, y: 0, w: 360, h: 28 }, { x: 0, y: 0, w: 40, h: 420 }, { x: 320, y: 0, w: 40, h: 420 }, { x: 0, y: 392, w: 360, h: 28 },
          ],
          cenario: [{ tipo: 'chao-tunel' }, { tipo: 'lampada-tunel', x: 180, y: 40 }, { tipo: 'lampada-tunel', x: 180, y: 230 }, { tipo: 'escombro', x: 300, y: 300 }],
          pois: [
            { poi: { id: 'tunel_m2', tipo: 'treta', repetivel: true, nivelRec: 8, revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 6, chanceDupla: 0.45 }, i18n: 'games.gangues.cena.pista.tunel.m2', recompensa: { grana: 7, rep: 3 } }, pos: { x: 180, y: 210 } },
            { poi: { id: 'tunel_achado', tipo: 'achado', opcional: true, i18n: 'games.gangues.cena.pista.tunel.achado', recompensa: { grana: 14, item: 13 } }, pos: { x: 290, y: 120 } },
          ],
          passagem: { x: 140, y: 30, w: 80, h: 24, para: 2, precisa: 'tunel_m2', label: 'avancar' },
        },
        {
          id: 'saida',
          world: { w: 380, h: 340 }, spawn: { x: 190, y: 288 },
          voltaPara: 1,
          // emerge no barraco do OUTRO lado do muro
          saida: { x: 162, y: 30, w: 56, h: 22, paraPredio: 'tunel_sai' },
          colliders: [
            { x: 0, y: 0, w: 150, h: 46 }, { x: 230, y: 0, w: 150, h: 46 },
            { x: 0, y: 0, w: 34, h: 340 }, { x: 346, y: 0, w: 34, h: 340 }, { x: 0, y: 312, w: 380, h: 28 },
            { x: 260, y: 80, w: 70, h: 60 },
          ],
          cenario: [{ tipo: 'chao-tunel' }, { tipo: 'lampada-tunel', x: 190, y: 60 }, { tipo: 'escombro', x: 295, y: 110 }],
          pois: [
            { poi: { id: 'tunel_m3', tipo: 'treta', repetivel: true, revezamento: { pool: PISTA_POOL_TUNEL, budgetPorCorpo: 5, chanceDupla: 0.3 }, i18n: 'games.gangues.cena.pista.tunel.m3', recompensa: { grana: 6, rep: 2 } }, pos: { x: 190, y: 180 } },
          ],
        },
      ],
    },
    // ── O GALPÃO DO CARVÃO — mini dungeon de 4 cômodos ──
    galpao: {
      nome: 'games.gangues.cena.pista.int.galpao',
      porta: { predio: 'galpao', posPortao: true },
      // Porta só destranca depois de BATER os dois bondes de tocaia do
      // caminho pós-muro (posmuro_1 → posmuro_2).
      abreComResolvido: 'posmuro_2',
      comodos: [
        {
          id: 'doca',
          world: { w: 480, h: 340 }, spawn: { x: 240, y: 256 },
          saida: { x: 212, y: 320, w: 56, h: 20 },
          colliders: [
            { x: 0, y: 0, w: 480, h: 30 }, { x: 0, y: 0, w: 14, h: 340 }, { x: 466, y: 0, w: 14, h: 340 },
            { x: 0, y: 312, w: 200, h: 28 }, { x: 280, y: 312, w: 200, h: 28 },
            { x: 40, y: 90, w: 90, h: 70 }, { x: 360, y: 200, w: 90, h: 70 }, // caixotes/empilhadeira
          ],
          cenario: [
            { tipo: 'caixote', x: 85, y: 125 }, { tipo: 'caixote', x: 110, y: 90 },
            { tipo: 'empilhadeira', x: 405, y: 235 }, { tipo: 'chao-galpao' },
          ],
          pois: [
            // Perto do chefe: NÃO pode sortear do pool genérico da rua toda
            // (o Isaias pegou um "Chinelada" — vigia de esquina fraquinho —
            // aqui dentro, óbvio que parecia fácil demais mesmo com o budget
            // "certo": pouco ponto espalhado num corpo de flavor fraco ainda
            // parece fraco). revezamento concentra tudo num corpo só (raro 2)
            // sorteado do pool casca-grossa do galpão.
            { poi: { id: 'galpao_m1', tipo: 'treta', repetivel: true, nivelRec: 12, revezamento: { pool: PISTA_POOL_GALPAO, budgetPorCorpo: 7, chanceDupla: 0.4 }, i18n: 'games.gangues.cena.pista.galpao.m1', recompensa: { grana: 6, rep: 2 } }, pos: { x: 300, y: 130 } },
          ],
          passagem: { x: 220, y: 34, w: 80, h: 24, para: 1, precisa: 'galpao_m1', label: 'avancar' },
        },
        {
          id: 'estoque',
          world: { w: 440, h: 380 }, spawn: { x: 220, y: 300 },
          saida: null,
          voltaPara: 0,
          colliders: [
            { x: 0, y: 0, w: 440, h: 30 }, { x: 0, y: 0, w: 14, h: 380 }, { x: 426, y: 0, w: 14, h: 380 }, { x: 0, y: 352, w: 440, h: 28 },
            { x: 20, y: 120, w: 60, h: 200 }, { x: 360, y: 120, w: 60, h: 200 }, // prateleiras altas
          ],
          cenario: [
            { tipo: 'prateleira-alta', x: 50, y: 220, w: 56, h: 196 }, { tipo: 'prateleira-alta', x: 390, y: 220, w: 56, h: 196 },
            { tipo: 'chao-galpao' },
          ],
          pois: [
            // Mantém liderFixo (o Cão Louco sempre lidera essa sala), mas a
            // escolta (se vier) sorteia do pool casca-grossa do galpão, não
            // do pool genérico da Pista inteira — mesmo motivo do m1.
            { poi: { id: 'galpao_m2', tipo: 'treta', repetivel: true, nivelRec: 14, enemy: 1301, liderFixo: 1301, moldesPool: PISTA_POOL_GALPAO, dificuldade: 'normal', i18n: 'games.gangues.cena.pista.galpao.m2', recompensa: { grana: 8, rep: 3 } }, pos: { x: 220, y: 180 } },
            { poi: { id: 'galpao_achado', tipo: 'achado', opcional: true, i18n: 'games.gangues.cena.pista.galpao.achado', recompensa: { grana: 18, item: 1 } }, pos: { x: 388, y: 150 } },
          ],
          passagem: { x: 200, y: 34, w: 80, h: 24, para: 2, precisa: 'galpao_m2', label: 'avancar' },
        },
        {
          id: 'escritorio',
          world: { w: 420, h: 320 }, spawn: { x: 210, y: 246 },
          saida: null,
          voltaPara: 1,
          colliders: [
            { x: 0, y: 0, w: 420, h: 30 }, { x: 0, y: 0, w: 14, h: 320 }, { x: 406, y: 0, w: 14, h: 320 }, { x: 0, y: 292, w: 420, h: 28 },
            { x: 120, y: 90, w: 180, h: 56 }, // mesa
          ],
          cenario: [
            { tipo: 'mesa-escritorio', x: 210, y: 118, w: 176 }, { tipo: 'cofre', x: 360, y: 210 },
            { tipo: 'quadro-horarios', x: 60, y: 90 }, { tipo: 'chao-galpao' },
          ],
          pois: [
            // "aperta" era enemy:1203 (Chinelada) FIXO, sem escalar — igual ao
            // Chinelada do galpao_m1/m2 (2.74.54), mas esse escapou porque não
            // é um POI de treta, é a punição de uma escolha de papo (o motor
            // trata viraTreta SEM revezamento como `fixo`, direto do molde
            // cru, sem calcular pontos contra o time). O Isaias pegou um
            // Chinelada A1/H1/R2/D1 de 6 PV bem na sala antes do breu do
            // Carvão. Agora escala igual o resto do galpão (revezamento,
            // pool casca-grossa).
            { poi: { id: 'galpao_contador', tipo: 'papo', opcional: true, repetivel: true, i18n: 'games.gangues.cena.pista.galpao.contador', escolhas: [{ id: 'escuta' }, { id: 'aperta', viraTreta: { enemy: 1203, rep: -1, recompensa: { grana: 6 }, revezamento: { pool: PISTA_POOL_GALPAO, budgetPorCorpo: 6, chanceDupla: 0.3 } } }] }, pos: { x: 120, y: 210 } },
          ],
          passagem: { x: 300, y: 34, w: 80, h: 24, para: 3, label: 'avancar' },
        },
        {
          id: 'breu',
          world: { w: 520, h: 400 }, spawn: { x: 260, y: 320 },
          saida: null,
          voltaPara: 2,
          colliders: [
            { x: 0, y: 0, w: 520, h: 30 }, { x: 0, y: 0, w: 14, h: 400 }, { x: 506, y: 0, w: 14, h: 400 }, { x: 0, y: 372, w: 520, h: 28 },
          ],
          cenario: [
            { tipo: 'chao-galpao' }, { tipo: 'luz-facho', x: 260, y: 150 },
            { tipo: 'pilha-sucata', x: 90, y: 300 }, { tipo: 'pilha-sucata', x: 430, y: 310 },
          ],
          pois: [
            { ref: '__chefe', pos: { x: 260, y: 120 } },
          ],
        },
      ],
    },
  },

  // O chefe — só aparece quando o portão abre.
  chefe: {
    id: 'boss',
    poiNo: 'pista-chefe', // nó real em ganguesTerritorios.js (marcarNoDominado)
    tipo: 'treta',
    pino: { x: 50, y: 12 },
    // Nível recomendado da tropa pra encarar (aviso no TretaVS quando abaixo).
    // O Carvão tem orçamento fixo ~L15+; abaixo disso é pau feio.
    nivelRec: 15,
    i18n: 'games.gangues.cena.pista.boss',
    // Ficha própria (não mais "kaeda" emprestado) — o combate real agora
    // mostra "Fumaça" lutando, batendo com a fala/nome já usados na tela
    // de confronto (games.gangues.story.bosses.fumaca).
    enemy: 1500,
    forca: 3,
    boss: 'fumaca',
    recompensa: { grana: 20, rep: 5 },
  },

  // A área final só abre depois de todo o caminho obrigatório da Pista —
  // incluindo a Rasteira Velha (o General). Só aí o Carvão desce.
  portao: {
    precisa: ['sinal', 'ferro', 'beco', 'birosca', 'beco_2', 'beco_3', 'oficina', 'sinaleiro', 'rasteira_velha'],
  },
}

export const CENAS_POR_ID = {
  [CENA_PISTA.id]: CENA_PISTA,
}

/** Uma cena existe para este território? (senão, cai na trilha antiga) */
export function temCena(territorioId) {
  return Boolean(CENAS_POR_ID[territorioId])
}

/** O portão do chefe está aberto, dado o mapa de POIs resolvidos? */
export function portaoAberto(cena, resolvidos = {}) {
  const p = cena.portao || {}
  const precisa = (p.precisa || []).every(id => resolvidos[id])
  const ou = !p.ou?.length || p.ou.some(id => resolvidos[id])
  return precisa && ou
}

/** Todos os POIs não-opcionais + o chefe caíram? = bairro dominado */
export function cenaCompleta(cena, resolvidos = {}, bossFeito = false) {
  const obrig = cena.pois.filter(poi => !poi.opcional).every(poi => resolvidos[poi.id])
  return obrig && bossFeito
}

/** Contagem para o breadcrumb "A Pista · 3/7" — o caminho obrigatório é
 *  exatamente `portao.precisa` + o chefe. POIs opcionais (rinha, corre,
 *  informante, descanso, achado) e o farm não entram. */
export function contarCena(cena, resolvidos = {}, bossFeito = false) {
  const obrig = cena.portao?.precisa || []
  const total = obrig.length + 1
  const feitos = obrig.filter(id => resolvidos[id]).length + (bossFeito ? 1 : 0)
  return { feitos, total }
}
