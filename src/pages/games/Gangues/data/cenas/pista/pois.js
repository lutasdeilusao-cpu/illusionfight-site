// POIs (pontos de interesse) do exterior da Pista. Extraído de
// data/cenas/pista.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §4).
// Ordem canônica: sinal → ferro-velho (+ fundo) → oficina → beco → [corre,
// oferecido pelo Nato dentro do próprio Descanso] → beco_2 → beco_3 →
// Sinaleiro Chefe → Rasteira Velha → [muro/túnel] → galpão → Carvão.
// Opcionais: rinha (farm), descanso, Duda. (Removido 20/09/2026: o POI
// `birosca`, papo à parte que virou duplicata do próprio Descanso.)
import { PISTA_POOL_RUA, PISTA_POOL_GALPAO } from './pools.js'
import { GANGUES_REP_GATE_GALPAO } from '../../ganguesLoadout.js'

export const POIS_PISTA = [
  {
    id: 'sinal',
    tipo: 'papo',
    // Cabeça oficial do pivete do Bonde do Sinal que fica nesse ponto
    // (arte do Isaias, 14/09/2026 — "Cria do Sinal").
    npcSlug: 'cria_do_sinal',
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
      // NÍVEL FIXO, AJUSTE 15/09/2026 nº2 (Isaias: "a primeira luta é MUITO
      // fácil de propósito — ficha de 3 pontos, seja 1 ou 10 jogadores — a
      // partir da SEGUNDA luta sobe de 3 em 3, sem exceção"). `sinal` é
      // literalmente a 1ª luta do jogo — fica no piso de 3, todo o resto da
      // ladder (a partir de `beco`) sobe a partir do 8.
      { id: 'aperta', viraTreta: { enemy: 1201, rep: -1, revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 3, chanceDupla: 0.15 } }, revela: ['ferro'] },
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
    // semTravar: falhar a gazua NÃO tranca o ponto pra sempre — sem isso, o
    // jogador perdia essa sucata de vez (só sobra a do `achado`, e a Oficina
    // do Nando exige 2×), softlock real de progresso (achado 13/09/2026,
    // Isaias: "eu falhei e ela nunca mais... deveria repetir"). Com
    // semTravar, ganhar a treta da falha só revela o mapa (igual sempre) mas
    // NÃO marca `ferro` resolvido — o jogador pode voltar e tentar a gazua de
    // novo quantas vezes quiser, até acertar e ganhar a sucata de verdade.
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): já é a "2ª luta" tier — nível 8,
    // confirmado pelo Isaias explicitamente ("esse jogador desse puzzle...
    // já tem que ter uma ficha de 8"). Não mudou nesta leva.
    falha: { viraTreta: { enemy: 1201, revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 8, chanceDupla: 0.1 }, semTravar: true } },
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
    nivelRec: 8,
    tipo: 'treta',
    // Continua OBRIGATÓRIA pra abrir o portão (portao.precisa) — repetivel
    // só faz ela continuar desafiável DEPOIS de vencida uma vez, igual a
    // rinha. É a treta mais fácil e mais cedo da Pista — vira o alvo
    // natural pra upar quem acaba de ser recrutado e começa do nível 1.
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
    // NÍVEL FIXO, AJUSTE 15/09/2026 (ver AGENTS.md — 1ª leva tinha descido
    // isso pra 3, o Isaias jogou e reportou com print: "ficha de 2-3 pontos,
    // nem tem nível pra isso"). Piso corrigido pra 8 — "a partir da 2ª luta
    // do jogo é ficha de 8, sem exceção". Dupla: o 1º corpo mantém 8 cheio,
    // o 2º sai 2-3 abaixo (ver `gerarBandoRevezamento`/ganguesEncontros.js —
    // não é mais "os dois ×0.75 iguais").
    enemy: 1201,
    revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 8, chanceDupla: 0.4 },
    forca: 1,
    recompensa: { rep: 2 },
    // AJUSTE 20/09/2026 (Isaias, achou o pino "A birosca do Seu Nato"
    // redundante com "Descanso na birosca" — mesma cara duas vezes no
    // mapa, "não precisa, a missão do Nego Véio pode aparecer ali no
    // descanso"): o POI `birosca` (papo à parte) foi removido — beco_2 é
    // revelado direto, e o convite pro corre do Nato virou uma oferta
    // dentro do PRÓPRIO modal de Descanso (ver `ofertaFlagId` no POI
    // `descanso` abaixo, e GanguesDescanso.jsx).
    revela: ['beco_2', 'nato_oferta'],
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
    nivelRec: 11,
    tipo: 'treta',
    // Regra geral (pedido do Isaias): todo evento de batalha da história
    // deve poder ser repetido pra upar, exceto o chefe. Continua
    // OBRIGATÓRIA vencer 1x pra abrir o portão (portao não depende dela
    // aqui, mas fica revelada só depois de beco+ferro+birosca).
    repetivel: true,
    pino: { x: 44, y: 48 },
    i18n: 'games.gangues.cena.pista.beco_2',
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): "de 3 em 3 a partir da 2ª luta",
    // sem exceção — nível 11 (8 + 3). Era escalada contra o time do jogador
    // via gerarBandoInimigo/ratio; convertida pro mesmo mecanismo FIXO de
    // `revezamento` que `beco`/`sinal` já usavam.
    enemy: 1301,
    revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 11, chanceDupla: 0.4 },
    forca: 2,
    recompensa: { rep: 3 },
    revela: ['beco_3'],
  },
  {
    // 3º ponto da Pista — o degrau do meio, mantém o bairro mais longo pra
    // quem corre sem upar chegar no Carvão já em L6-L7 (e apanhar). Pool
    // comum da Pista, 'normal'. Repetível pra farm.
    id: 'beco_3',
    nivelRec: 14,
    tipo: 'treta',
    repetivel: true,
    pino: { x: 40, y: 40 },
    i18n: 'games.gangues.cena.pista.beco_3',
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): +3 de novo — nível 14 (11 + 3).
    // Mesma conversão de beco_2 (era ratio, virou revezamento fixo).
    enemy: 1302,
    revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 14, chanceDupla: 0.4 },
    forca: 2,
    recompensa: { rep: 3 },
    revela: ['sinaleiro'],
  },
  {
    // O SINALEIRO CHEFE (1451) — o outro General da Pista. "Comanda todos os
    // vigias: se ele apita, o bairro corre." Luta sempre SÓ contra ele (ver
    // `fixo`/`pontosFixo` abaixo), nunca um bando. Obrigatório pro portão —
    // os dois generais (Sinaleiro + Rasteira Velha) caem antes do Carvão
    // descer. Entra no álbum aqui, não só na luta de chefe.
    id: 'sinaleiro',
    nivelRec: 17,
    tipo: 'treta',
    repetivel: true,
    pino: { x: 66, y: 30 },
    i18n: 'games.gangues.cena.pista.sinaleiro',
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): continua o +3 sem exceção mesmo
    // pros Generais — nível 17 (14 + 3). `fixo`+`pontosFixo`: SEMPRE o
    // Sinaleiro sozinho (nunca um pool aleatório), escalado pra esse ponto
    // exato, nunca contra o time do jogador (ver GanguesCena.jsx).
    enemy: 1451,
    fixo: true,
    pontosFixo: 17,
    forca: 3,
    recompensa: { rep: 5 },
    revela: ['rasteira_velha'],
  },
  {
    // A luta de GENERAL — o "quase-chefe" que sinaliza que o Carvão vai
    // descer (GDD §4/§5.5). A Rasteira Velha (1452, "a mais antiga do Bonde
    // do Sinal, treinou os pivete novo") é a dona do beco — por isso o beco
    // tem o nome dela. Luta sempre SÓ contra ela (`fixo`/`pontosFixo`, sem
    // escolta) — obrigatória pro portão.
    id: 'rasteira_velha',
    nivelRec: 20,
    tipo: 'treta',
    repetivel: true,
    pino: { x: 58, y: 30 },
    i18n: 'games.gangues.cena.pista.rasteira_velha',
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): +3 de novo — nível 20 (17 + 3).
    // Mesmo mecanismo `fixo`/`pontosFixo` (sempre a Rasteira Velha sozinha,
    // nunca escalada pelo time do jogador).
    enemy: 1452,
    fixo: true,
    pontosFixo: 20,
    forca: 3,
    recompensa: { rep: 6 },
  },
  {
    // Treta repetível de farm: pode ser encarada quantas vezes o jogador
    // quiser, pra upar sem depender de progresso novo. Orçamento FIXO por
    // corpo (`revezamento`, igual `beco`) — nunca dependeu do time do
    // jogador, então o farm-lock (`travarPontosFarm`) nunca teve efeito real
    // aqui apesar do comentário antigo dizer o contrário (corrigido
    // 15/09/2026 — ver `iniciarTreta`/GanguesCena.jsx, que agora nem tenta
    // travar pontos pra POI com `revezamento`).
    id: 'rinha',
    tipo: 'treta',
    opcional: true,
    repetivel: true,
    visivel: true,
    pino: { x: 40, y: 190 },
    i18n: 'games.gangues.cena.pista.rinha',
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): `rinha` fica visível desde o
    // início, junto com `sinal` (antes até de abrir a gazua do ferro-velho)
    // — piso de 3, o mesmo da "1ª luta muito fácil", não o 8 de `beco`
    // (que só existe depois de abrir o ferro-velho).
    // AJUSTE 19/09/2026 (Isaias, achou o inimigo "muito fraco" farmando com
    // a tropa já grande): ganhou `ratioComTime` igual o galpão. AJUSTE Nº2,
    // mesmo dia (ele foi conferir os números de novo: "a rinha deveria se
    // adaptar à minha ficha... essa numeração tá certa?" — não estava: a
    // soma de pontos do time inteiro ÷ corpos ficava bem abaixo do
    // personagem mais forte, e a "recompensa por risco" quase não dava AP
    // nenhum farmando aqui). Trocado pro modo `baseMaisForte`
    // (ganguesEncontros.js) — o líder do bando vira `Math.max(3,
    // pontosMaisForte × 1)`, ou seja, sempre bem perto do personagem MAIS
    // FORTE da gangue (nunca a soma do time todo) — a rinha vira um "sparring
    // sempre no seu nível" de verdade, dentro da tolerância cheia da
    // recompensa por risco.
    enemy: 1201,
    revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 3, chanceDupla: 0.35, ratioComTime: 1, baseMaisForte: true },
    forca: 1,
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
    npcSlug: 'duda_o_orelha',
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
    // Dono da birosca (arte já existe, npcs/nego_veio/neutro.png) — mostra
    // a cabeça dele no card de descanso (pedido do Isaias, 20/09/2026).
    npcSlug: 'nego_veio',
    custoGrana: 10,
    // Oferta pendente do Nato (corre do pacote) — vira o convite dentro do
    // MODAL de Descanso assim que `beco` revela `nato_oferta` (ver acima).
    // Enquanto não decidida (aceitar/recusar), o pino fica verde igual um
    // "tem missão aqui" (GanguesCenaAtores.jsx/farolDe, ganguesCenaMotor.js).
    ofertaFlagId: 'nato_oferta',
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
    nivelRec: 23,
    tipo: 'treta',
    repetivel: true,
    pos_portao: true,
    pino: { x: 40, y: 90 },
    i18n: 'games.gangues.cena.pista.posmuro_1',
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): +3 de novo — nível 23 (20 + 3).
    enemy: 1206,
    revezamento: { pool: PISTA_POOL_GALPAO, budgetPorCorpo: 23, chanceDupla: 0.5 },
    forca: 2,
    recompensa: { rep: 3 },
    revela: ['posmuro_2'],
  },
  {
    id: 'posmuro_2',
    nivelRec: 26,
    tipo: 'treta',
    repetivel: true,
    pino: { x: 60, y: 60 },
    i18n: 'games.gangues.cena.pista.posmuro_2',
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): último degrau antes do Carvão
    // (30) — nível 26 (23 + 3), "mais osso do que o resto da rua" continua
    // valendo.
    enemy: 1301,
    liderFixo: 1301,
    // Gate de reputação: essa treta é do Cão Louco, mais osso do que o resto
    // da rua — não trava o Sinaleiro/Rasteira Velha (progressão obrigatória).
    repGate: GANGUES_REP_GATE_GALPAO,
    revezamento: { pool: PISTA_POOL_GALPAO, budgetPorCorpo: 26, chanceDupla: 0.6 },
    forca: 3,
    recompensa: { rep: 4, item: 21, qtd: 1 },
  },
]
