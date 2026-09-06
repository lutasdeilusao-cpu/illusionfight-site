/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — A Pista como CENA navegável
   (protótipo da proposta em docs/Games/Gangues/GANGUES_MODO_HISTORIA_ENCONTROS.md)

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

export const CENA_PISTA = {
  id: 'pista',
  territorioId: 'pista',
  cor: '#3ddc97',
  ruaPath: RUA_PISTA,
  // Fala de chegada (voz da quebrada — uma ou duas linhas no GangDialog).
  chegada: 'games.gangues.cena.pista.chegada',
  falante: 'games.gangues.dialogo.veio_nome',
  falanteSub: 'games.gangues.dialogo.veio_sub',

  pois: [
    {
      id: 'sinal',
      tipo: 'papo',
      visivel: true,
      pino: { x: 52, y: 208 },
      i18n: 'games.gangues.cena.pista.sinal',
      // escolhas do papo: cada uma tem efeito próprio
      escolhas: [
        { id: 'compra', custoGrana: 4, recompensa: { rep: 0 }, revela: ['ferro'] },
        { id: 'aperta', viraTreta: { enemy: 'treinamento', rep: -1 }, revela: ['ferro'] },
        { id: 'ignora', revela: ['ferro'] },
      ],
    },
    {
      id: 'ferro',
      tipo: 'parada',
      pino: { x: 60, y: 168 },
      i18n: 'games.gangues.cena.pista.ferro',
      puzzle: { type: 'forca', config: { difficulty: 'easy' }, skin: 'gazua' },
      recompensa: { grana: 12, xp: 6, item: 'sucata' },
      falha: { viraTreta: { enemy: 'treinamento' } },
      revela: ['molecada_1'],
    },
    {
      id: 'molecada_1',
      tipo: 'treta',
      pino: { x: 50, y: 132 },
      i18n: 'games.gangues.cena.pista.molecada_1',
      // É a primeira treta de verdade do jogo, logo depois da criação da
      // ficha. O bando é sorteado na hora (GanguesRoute → gerarBandoInimigo,
      // moldes da Pista) calibrado contra o time atual — nunca é sempre o
      // mesmo inimigo/quantidade.
      enemy: 'moleque_a',
      forca: 1,
      dificuldade: 'normal',
      recompensa: { grana: 8, rep: 2, xp: 10 },
      revela: ['birosca'],
    },
    {
      id: 'birosca',
      tipo: 'papo',
      pino: { x: 62, y: 100 },
      i18n: 'games.gangues.cena.pista.birosca',
      escolhas: [
        { id: 'aceita_corre', revela: ['corre', 'molecada_2', 'descanso'] },
        { id: 'so_papo', revela: ['molecada_2', 'descanso'] },
      ],
    },
    {
      id: 'corre',
      tipo: 'corre',
      opcional: true,
      pino: { x: 56, y: 70 },
      i18n: 'games.gangues.cena.pista.corre',
      puzzle: { type: 'stealth', config: { size: 4, hasTimer: true, timerSegundos: 34 }, skin: 'viatura' },
      recompensa: { grana: 16, rep: 2 },
    },
    {
      id: 'molecada_2',
      tipo: 'treta',
      pino: { x: 44, y: 48 },
      i18n: 'games.gangues.cena.pista.molecada_2',
      // Segunda treta — dificuldade 'dificil' (o jogador já deve ter 1
      // vitória de AP acumulado até chegar aqui).
      enemy: 'moleque_b',
      forca: 2,
      dificuldade: 'dificil',
      recompensa: { grana: 8, rep: 3, xp: 10 },
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
      id: 'descanso',
      tipo: 'descanso',
      opcional: true,
      repetivel: true,
      pino: { x: 70, y: 118 },
      i18n: 'games.gangues.cena.pista.descanso',
      custoGrana: 10,
      cura: 40,
    },
  ],

  // O chefe — só aparece quando o portão abre.
  chefe: {
    id: 'boss',
    poiNo: 'pista-chefe', // nó real em ganguesTerritorios.js (marcarNoDominado)
    tipo: 'treta',
    pino: { x: 50, y: 12 },
    i18n: 'games.gangues.cena.pista.boss',
    // Ficha própria (não mais "kaeda" emprestado) — o combate real agora
    // mostra "Fumaça" lutando, batendo com a fala/nome já usados na tela
    // de confronto (games.gangues.story.bosses.fumaca).
    enemy: 'fumaca',
    forca: 3,
    boss: 'fumaca',
  },

  // A área final só abre depois de todo o caminho obrigatório da Pista.
  portao: {
    precisa: ['sinal', 'ferro', 'molecada_1', 'birosca', 'molecada_2'],
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

/** Contagem para o breadcrumb "A Pista · 3/7" (POIs + chefe, sem repetíveis
 *  tipo descanso/informante — esses não fazem parte do caminho obrigatório). */
export function contarCena(cena, resolvidos = {}, bossFeito = false) {
  const contaveis = cena.pois.filter(poi => !poi.repetivel)
  const total = contaveis.length + 1
  const feitos = contaveis.filter(poi => resolvidos[poi.id]).length + (bossFeito ? 1 : 0)
  return { feitos, total }
}
