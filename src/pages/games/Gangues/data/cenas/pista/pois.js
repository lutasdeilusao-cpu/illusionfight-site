// POIs (pontos de interesse) do exterior da Pista. Extraído de
// data/cenas/pista.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §4).
// Ordem canônica: sinal → ferro-velho (+ fundo) → oficina → beco → [corre,
// oferecido pelo Nato dentro do próprio Descanso] → beco_2 → beco_3 →
// Sinaleiro Chefe → Rasteira Velha → [muro/túnel] → galpão → Carvão.
// Opcionais: rinha (farm), descanso, Duda. (Removido 20/09/2026: o POI
// `birosca`, papo à parte que virou duplicata do próprio Descanso.)
import { PISTA_POOL_RUA, PISTA_POOL_GALPAO } from './pools.js'
import { GANGUES_REP_GATE_GALPAO } from '../../ganguesLoadout.js'
import { LAJE_LINHAS, poiLinha } from '../laje/pois.js'
import { GANGUES_LOJA_EQUIP } from '../../ganguesEquipDistribuicao.js'

export const POIS_PISTA = [
  {
    id: 'sinal',
    tipo: 'papo',
    // Pivete do farol: patrulha (vai e volta olhando o sinal) — ver movimentoDoPino.
    movimento: 'patrulha-h',
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
    i18n: 'games.gangues.cena.pista.oficina',
    escolhas: [
      { id: 'forjar', precisaItens: { 13: 2 }, daEquip: [237], recompensa: { rep: 4 } },
    ],
  },
  {
    // A BANCADA DO NANDO — aprimoramento de equipamento (27/09/2026, plano
    // em docs/Games/Gangues/PLANO_ITENS_RANGE.md §3). Só aparece dentro da
    // oficina DEPOIS da quest da sucata (`precisa: 'oficina'` no interior).
    // O Nando faz só o +1 (`tetoAprim`); até +4 é a Serralheria da Feira.
    id: 'bancada_nando',
    tipo: 'ferreiro',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.pista.bancada_nando',
    tetoAprim: 1,
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
    recompensa: { rep: 2 },
    // AJUSTE 20/09/2026 (Isaias, achou o pino "A birosca do Seu Nato"
    // redundante com "Descanso na birosca" — mesma cara duas vezes no
    // mapa, "não precisa, a missão do Nego Véio pode aparecer ali no
    // descanso"): o POI `birosca` (papo à parte) foi removido — beco_2 é
    // revelado direto, e o convite pro corre do Nato virou uma oferta
    // dentro do PRÓPRIO modal de Descanso (ver `oferta.flagId` no POI
    // `descanso` abaixo, e GanguesDescanso.jsx).
    revela: ['beco_2', 'nato_oferta'],
  },
  {
    id: 'corre',
    tipo: 'corre',
    opcional: true,
    i18n: 'games.gangues.cena.pista.corre',
    // Corre opcional, primeira vez do jogador com stealth: grade 5×5, só 2
    // câmeras de alcance 1, sem timer. Falhar aqui só custa fôlego.
    puzzle: { type: 'stealth', config: { size: 5, cameraCount: 2, visionRange: 1, hasTimer: false }, skin: 'viatura' },
    // + a Bota com Biqueira (223, incomum do Paredão) — as peças não tinham fonte
    // nenhuma no jogo (PLANO_ITENS_RANGE.md §6). O corre só se faz 1 vez.
    recompensa: { grana: 16, rep: 2, equip: 223 },
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
    i18n: 'games.gangues.cena.pista.beco_2',
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): "de 3 em 3 a partir da 2ª luta",
    // sem exceção — nível 11 (8 + 3). Era escalada contra o time do jogador
    // via gerarBandoInimigo/ratio; convertida pro mesmo mecanismo FIXO de
    // `revezamento` que `beco`/`sinal` já usavam.
    enemy: 1301,
    revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 11, chanceDupla: 0.4 },
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
    i18n: 'games.gangues.cena.pista.beco_3',
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): +3 de novo — nível 14 (11 + 3).
    // Mesma conversão de beco_2 (era ratio, virou revezamento fixo).
    enemy: 1302,
    revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 14, chanceDupla: 0.4 },
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
    i18n: 'games.gangues.cena.pista.sinaleiro',
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): continua o +3 sem exceção mesmo
    // pros Generais — nível 17 (14 + 3). `fixo`+`pontosFixo`: SEMPRE o
    // Sinaleiro sozinho (nunca um pool aleatório), escalado pra esse ponto
    // exato, nunca contra o time do jogador (ver GanguesCena.jsx).
    enemy: 1451,
    fixo: true,
    pontosFixo: 17,
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
    i18n: 'games.gangues.cena.pista.rasteira_velha',
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): +3 de novo — nível 20 (17 + 3).
    // Mesmo mecanismo `fixo`/`pontosFixo` (sempre a Rasteira Velha sozinha,
    // nunca escalada pelo time do jogador).
    enemy: 1452,
    fixo: true,
    pontosFixo: 20,
    recompensa: { rep: 6 },
  },
  {
    id: 'rinha',
    tipo: 'treta',
    opcional: true,
    repetivel: true,
    visivel: true,
    i18n: 'games.gangues.cena.pista.rinha',
    enemy: 1201,
    // RINHA INFINITA (Isaias, 28/09/2026): entrou, é luta atrás de luta até
    // sair — cada adversário sorteado em volta do nível da tropa, de 5 abaixo
    // a 2 acima do teu mais forte (`nivelDaTropa`, niveisDaRinha em
    // cenaHelpers.js). É o ÚNICO lugar com
    // farm calculado com o app no fundo: 1 luta a cada 5 minutos (ver
    // engine/ganguesFarmAusente.js).
    rinhaInfinita: true,
    revezamento: { pool: PISTA_POOL_RUA, budgetPorCorpo: 3, chanceDupla: 0.35, nivelDaTropa: true },
    // Farm dá só XP, nunca grana (Isaias, 28/09/2026) — grana de grind é o
    // Clube e a Banca do Tio Dado.
    semGrana: true,
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
    i18n: 'games.gangues.cena.pista.loja',
    // Loja da Pista (GDD §9.7): poções, remédios de status (30–39) e só o
    // equipamento COMUM dos 3 caminhos + o boné livre. O incomum é da loja da
    // Feira — cada território vende a sua faixa, sem repetir.
    itens: [1, 2, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, ...GANGUES_LOJA_EQUIP.pista],
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
    i18n: 'games.gangues.cena.pista.descanso',
    // Dono da birosca (arte já existe, npcs/nego_veio/neutro.png) — mostra
    // a cabeça dele no card de descanso (pedido do Isaias, 20/09/2026).
    npcSlug: 'nego_veio',
    custoGrana: 10,
    // Oferta pendente do Nato (corre do pacote) — vira o convite dentro do
    // MODAL de Descanso assim que `beco` revela `nato_oferta` (ver acima).
    // Enquanto não decidida (aceitar/recusar), o pino fica verde igual um
    // "tem missão aqui" (GanguesCenaAtores.jsx/farolDe, ganguesCenaMotor.js).
    oferta: { flagId: 'nato_oferta', i18n: 'games.gangues.cena.pista.birosca', revelaSeAceitar: ['corre'] },
  },
  {
    // Loja de bico, bem simples — pedido do Isaias, 21/09/2026: "só vende
    // poção de HP e MP, pelo dobro do preço da loja de cima, na cara de
    // pau, porque agora que o jogo balanceou (recompensa por risco), pra
    // arriscar e ganhar mais experiência você tem que ir municiado de
    // item".
    //
    // VOLTOU pra rua no mesmo dia (Isaias, depois de ver ela dentro da
    // birosca junto do agiota: "tava achando que esse balcão do aperto era
    // o agiota, mas não é, ele é o cara que vende itens, tem que ficar na
    // rua mesmo") — só uma loja de bico, não tem nada a ver com a
    // agiotagem/Nato. Renomeada de "Balcão do Aperto" pra "Lojinha do Zé"
    // ("esse nome tá horrível") — reaproveita o Zé do "Bar do Zé" (predio
    // c1, bem do lado), dá continuidade em vez de inventar um dono novo.
    // Posição ajustada de novo no dia seguinte (22/09/2026, print marcando
    // o lugar certo): "coloca a lojinha do Seu Zé bem aí onde eu marquei...
    // ali no meio dessa rua, porque aonde ele tá tá trabalhando muito" — a
    // 1ª posição (colada na porta da birosca) congestionava aquele ponto de
    // entrada; agora fica no trecho aberto da rua (posicoes.js), sem
    // prédio por perto.
    id: 'loja_pocoes',
    tipo: 'loja',
    opcional: true,
    repetivel: true,
    visivel: true,
    i18n: 'games.gangues.cena.pista.loja_pocoes',
    // Cara emprestada do catálogo de INIMIGO (o "balconista", 1205 — já
    // tem arte e o nome nem podia combinar mais com "atende um balcão de
    // loja") — só a imagem, sem nenhuma implicação de combate.
    retratoEnemyId: 1205,
    itens: [1, 2, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    precoMultiplicador: 2,
  },
  {
    // O agiota — pedido do Isaias, 21/09/2026: "vamos criar um pin dedicado
    // ao agiota... coloca ele no cantinho, parado... uma tag nele, agiota".
    // Personagem NOVO (não é o Nato da birosca) — todo o sistema de
    // agiotagem (empréstimo/cura fiada/socorro/pagar/Clube da Luta) migrou
    // pra cá; a birosca (POI `descanso`) voltou a ser só cura, sem dívida
    // nenhuma. Fica parado (ehPersonagem exclui `tipo==='agiota'`,
    // GanguesCenaAtores.jsx).
    //
    // CORRIGIDO no mesmo dia (Isaias viu a 1ª versão no exterior e pediu pra
    // mudar: "você colocou o agiota fora do prédio... é lá dentro da parte
    // do descanso da birosca... ele tem que estar aqui dentro, não lá
    // fora") — NÃO tem posição de rua (sem entrada em POS_PISTA/
    // ENTRY_ZONES_PISTA); mora dentro do cômodo da birosca via `ref`
    // (interiores.js, igual descanso/informante) — some da rua sozinho
    // porque `refsInternos()` exclui qualquer POI referenciado por um
    // interior da lista do exterior (ganguesCenaMotor.js).
    id: 'agiota',
    tipo: 'agiota',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.pista.agiota',
    // Cara emprestada do catálogo de INIMIGO ("Fiado Vencido", 1206 — já
    // tem arte e o nome combina exatamente com o tema de dívida/agiotagem),
    // só a imagem, sem nenhuma implicação de combate (mesmo truque do
    // `loja_pocoes` acima).
    retratoEnemyId: 1206,
    custoGrana: 10,
  },
  {
    // A BANCA do Tio Dado (29/09/2026, pedido do Isaias) — apostas, a grana
    // do farm sem porrada: desafio de mão (puzzle) e rinha de aposta (NPC x
    // NPC). Mora dentro da birosca (interiores.js), igual o agiota. Regra em
    // data/ganguesApostas.js. Retrato emprestado do "Troco Certo" (1402).
    id: 'banca',
    tipo: 'banca',
    opcional: true,
    repetivel: true,
    i18n: 'games.gangues.cena.pista.banca',
    retratoEnemyId: 1402,
    rinhaPool: PISTA_POOL_RUA,
    rinhaPontos: 8,
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
    i18n: 'games.gangues.cena.pista.posmuro_1',
    // NÍVEL FIXO (ajuste 15/09/2026 nº2): +3 de novo — nível 23 (20 + 3).
    enemy: 1206,
    revezamento: { pool: PISTA_POOL_GALPAO, budgetPorCorpo: 23, chanceDupla: 0.5 },
    recompensa: { rep: 3 },
    revela: ['posmuro_2'],
  },
  {
    id: 'posmuro_2',
    nivelRec: 26,
    tipo: 'treta',
    repetivel: true,
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
    // `equipPrimeiraVez`: a Soqueira de Ferro (207, incomum) só na 1ª vitória — é
    // treta repetível, o chip continua saindo em toda vitória.
    recompensa: { rep: 4, item: 21, qtd: 1, equipPrimeiraVez: 207 },
  },
  {
    // O pedágio do Morro: o Marimbondo abre o 1º portão da escadaria por 600.
    // Só aparece depois do recado do Morro (`__flags.morro`, Vila) e abre um
    // dos portões da escadaria (BARREIRAS_MORRO, data/cenas/morro/mundo.js).
    id: 'aval_morro_pista',
    tipo: 'papo',
    opcional: true,
    i18n: 'games.gangues.cena.aval.aval_morro_pista',
    escolhas: [{ id: 'pagar', custoGrana: 600, informante: 'morro_pista' }],
  },
  // A linha do Retalho neste bairro (Laje — ver data/cenas/laje/pois.js): corta na porrada.
  poiLinha(LAJE_LINHAS.find(l => l.cena === 'pista')),
]
