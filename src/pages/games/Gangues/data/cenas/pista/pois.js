// POIs (pontos de interesse) do exterior da Pista. Extraído de
// data/cenas/pista.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §4).
// Ordem canônica: sinal → ferro-velho (+ fundo) → oficina → beco → birosca →
// corre → beco_2 → beco_3 → Sinaleiro Chefe → Rasteira Velha → [muro/túnel]
// → galpão → Carvão. Opcionais: rinha (farm), descanso, Duda.
import { PISTA_POOL_RUA, PISTA_POOL_GALPAO } from './pools.js'

export const POIS_PISTA = [
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
]
