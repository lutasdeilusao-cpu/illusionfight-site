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
        { id: 'aperta', viraTreta: { enemy: 1201, rep: -1, recompensa: { grana: 4 } }, revela: ['ferro'] },
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
      falha: { viraTreta: { enemy: 1201, recompensa: { grana: 3 } } },
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
      // ficha. O bando é sorteado na hora (GanguesRoute → gerarBandoInimigo)
      // dos 11 moldes comuns da Pista (Vigia/Vapor/Gerente/Cobrador), sempre
      // uma composição diferente — tipo e quantidade (1 a 4 corpos) variam a
      // cada tentativa. `dificuldade: 'facil'` (ratio 0.42 na Pista) deixa a
      // porta de entrada gentil: ~97% de vitória num time balanceado.
      enemy: 1201,
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
      // Visível DESDE O COMEÇO (não só depois da birosca) — agora que PV/PM
      // persiste entre lutas (aplicarDanoPersistente), o jogador precisa de
      // um jeito de recuperar folego já nas primeiras tretas repetíveis
      // (sinal/rinha), muito antes de beco+ferro+birosca abrirem.
      id: 'descanso',
      tipo: 'descanso',
      opcional: true,
      repetivel: true,
      visivel: true,
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
