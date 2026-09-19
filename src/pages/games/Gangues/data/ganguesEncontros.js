import { getGanguesResources } from './ganguesLoadout.js'
import { ajustarPontosFixo, GANGUES_LADDER_PASSO } from './ganguesDificuldade.js'

/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — geração de bando inimigo por encontro (não fixo)

   Em vez de um `enemy`+`qtd` fixos por nó, cada tentativa da MESMA treta
   sorteia uma composição diferente — quantidade e distribuição de pontos
   variam a cada vez, feito "encontro selvagem" de RPG: você sabe a região,
   não sabe exatamente quem vai aparecer.

   Calibrado por SIMULAÇÃO (rodada centenas de vezes com times de jogador
   diversificados nos 3 caminhos — atacante/defensor/místico), não por
   fórmula no papel: um inimigo concentrado (poucos corpos, PV alto) é MUITO
   mais perigoso que o mesmo total de pontos espalhado em vários corpos
   fracos, porque PV só vem do atributo R e um time do jogador espalha esse
   investimento em vários personagens — por isso o total de pontos do bando
   fica ABAIXO do total do jogador (não acima), e a quantidade mínima é
   amarrada ao tamanho do time do jogador (bando muito concentrado é o
   cenário mais injusto, mesmo com poucos pontos).
   ══════════════════════════════════════════════════════════════ */

// Moldes de inimigo por região (mistura aleatória) + faixa de quantidade de
// corpos no bando — a quantidade real também respeita o tamanho do time do
// jogador (ver gerarBandoInimigo).
// moldes = os inimigos COMUNS daquele território (ids numéricos —
// data/gangues-enemies.json). São os 11 de cada bairro: 3 Vigia + 3 Vapor +
// 3 Gerente + 2 Cobrador (a hierarquia da Banca, ver docs/Games/Gangues/
// LDI_GANGUES_GDD.md §5). gerarBandoInimigo sorteia e escala por pontos
// (escalarInimigo) — o molde é forma relativa, não stat absoluto. É assim que
// o Álbum de Marélia se preenche jogando as tretas.
export const GANGUES_TERRITORIO_ENCONTRO = {
  // `max: 5` + `folgaMax: 3` (pedido do Isaias, 13/09/2026 — Pista tá "fácil
  // demais", quer nivelar pra cima pra punir quem tenta avançar sem grindar):
  // sem `folgaMax`, o teto real de corpos em gerarBandoInimigo é
  // `min(config.max, playerTeam.length + 2)` — com o time da Pista travado em
  // 2 fichas (3 com rep≥50), isso já batia em 4 ANTES mesmo de mexer no `max`
  // (2+2=4), então só subir `max` pra 5 não mudava nada na prática. `folgaMax`
  // sobrescreve esse `+2` só pra Pista, liberando o teto de verdade (2+3=5)
  // sem tocar no cálculo dos outros territórios.
  pista:   { moldes: [1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1201, 1202, 1203, 1204, 1205, 1206, 1301, 1302, 1303, 1401, 1402], min: 1, max: 5, folgaMax: 3 },
  feira:   { moldes: [1104, 1105, 1106, 1204, 1205, 1206, 1304, 1305, 1306, 1403, 1404], min: 2, max: 5 },
  baixada: { moldes: [1107, 1108, 1109, 1207, 1208, 1209, 1307, 1308, 1309, 1405, 1406], min: 3, max: 6 },
  vila:    { moldes: [1110, 1111, 1112, 1210, 1211, 1212, 1310, 1311, 1312, 1407, 1408], min: 3, max: 6 },
  morro:   { moldes: [1113, 1114, 1115, 1213, 1214, 1215, 1313, 1314, 1315, 1409, 1410], min: 4, max: 8 },
  alto:    { moldes: [1116, 1117, 1118, 1216, 1217, 1218, 1316, 1317, 1318, 1411, 1412], min: 5, max: 10 },
  laje:    { moldes: [1119, 1120, 1121, 1219, 1220, 1221, 1319, 1320, 1321, 1413, 1414], min: 6, max: 10 },
}

// Equipe do CHEFE — fixa, nunca sorteada. O chefe não anda sozinho, leva os
// melhores da própria gangue junto (o 1º id é sempre o próprio chefe). Sendo
// sempre a mesma composição, dá pra aprender o combate e voltar mais forte —
// bem diferente do bando comum, que é aleatório de propósito.
// O 1º id é sempre o próprio chefe; os outros são os 2 GENERAIS daquele
// território (faixa 1451+, ver GDD §5.5) — vencer o chefe desbloqueia os
// generais no Álbum de uma vez, já que eles não aparecem em treta comum.
export const GANGUES_CHEFE_EQUIPE = {
  pista: [1500, 1451, 1452],
  feira: [1501, 1453, 1454],
  baixada: [1502, 1455, 1456],
  vila: [1503, 1457, 1458],
  morro: [1504, 1459, 1460],
  alto: [1505, 1461, 1462],
  laje: [1600, 1463, 1464],
}

// Orçamento de pontos FIXO do bando do chefe, por território — NÃO escala com o
// jogador (ao contrário da treta comum). É de propósito: o chefe é um paredão
// fixo, e o loop de RPG é você VOLTAR mais forte.
//
// ESCADA DE NÍVEL DOS 7 CHEFES (pedido do Isaias, dez/2026): 7 territórios,
// teto do jogador L99. Cada chefe é "pau a pau" no nível-alvo abaixo:
//   pista 15 · feira 28 · baixada 42 · vila 56 · morro 70 · alto 84 · laje 99+
// (~14 níveis entre cada; o 7º é PAREDÃO — encara no L99 e ainda apanha).
//
// calcularPontosTime = soma de A+H+D+PV+PM, e o crescimento autorado é
// EXATAMENTE +1 ponto por nível → 1 ficha nível N = N pontos (+ o total
// inicial de nível 1). O time cresce 1 vaga por território dominado (2 na
// Pista, 3 na Feira, ... até 6 = teto de batalha):
//   pista  L15 · 2 fichas ·  30 pts → budget ~35  (~1.15×, pau a pau)
//   feira  L28 · 3 fichas ·  84 pts → budget ~97
//   baixada L42 · 4 fichas · 168 pts → budget ~193
//   vila   L56 · 5 fichas · 280 pts → budget ~322
//   morro  L70 · 6 fichas · 420 pts → budget ~483
//   alto   L84 · 6 fichas · 504 pts → budget ~580
//   laje   L99 · 6 fichas · 594 pts → budget ~700 (paredão, ~1.18×)
//
// AJUSTE jan/2027 (feedback do Isaias — "tô matando no automático com uma
// porrada, sou muito de upar"): +~4 níveis por ficha em cada chefe (o Isaias
// pediu "3 a 5 pontos"), +5 na Laje. Não é soft-scaling (o chefe continua
// fixo — o loop de RPG é voltar mais forte), só um piso mais alto pra não
// virar pushover pra quem chega no nível-alvo. "Playtest pra confirmar" —
// ver o ajuste de 15/09/2026 logo abaixo, esse foi o playtest.
//
// AJUSTE 15/09/2026 (Isaias, via relato do amigo dele jogando): o playtest
// pedido acima aconteceu — amigo chegou no Carvão no nível 11 (bem abaixo do
// alvo L15) e "venceu com certa facilidade". Investigado com simulação real
// (mesma iniciativa H+d3, mesmo FA/FD do resolver, sem usar poderes — modo
// Automático só ataca no normal): SEM equipamento, o Carvão de fato esmaga
// (só ~5% de vitória do jogador) — o budget em si tava correto. O furo real:
// `calcularPontosTime` (usada em toda escala dinâmica) soma só atributo CRU,
// nunca conta o bônus de equipamento — e o chefe, sendo orçamento FIXO, não
// tem NENHUMA compensação em lugar nenhum. Simulado: +2A/+1D por ficha (1
// arma barata cada, fácil de bancar) já vira a luta pra ~49%; +4A/+2D vira
// ~88% pro jogador — "vitória com certa facilidade" bate exatamente com uma
// gangue com um pouco de equipamento.
//
// Decisão do Isaias (não foi "só sobe o budget" — foi mudar o paradigma):
// PARAR de tentar acompanhar a ficha do jogador nas tretas da Pista (a raiz
// do problema é viver perseguindo um alvo que build de equipamento sempre
// vai furar). Pista virou NÍVEL FIXO ponta a ponta — cada POI tem uma ficha
// de pontos travada de propósito, sem depender de playerTeam/ratio nenhum
// (ver `pontosFixo`/`poi.fixo` em GanguesCena.jsx+GanguesRoute.jsx e o
// `revezamento` das tretas comuns em data/cenas/pista/pois.js). Ladder
// aprovada pelo Isaias: 1º inimigo nível 3, tretas de rua sobem de 3 em 3
// (6, 9), os 2 Generais ficam acima da média da rua (13, 16), o galpão
// pós-muro continua subindo (17, 19) e o Carvão fecha fixo em nível 20 —
// dessa vez o equipamento é um bônus de verdade (você fica mais forte que o
// "nível" da luta), não um furo que zera o desafio.
// Budget recalculado pra bater Carvão=20: corpos=2, liderFrac=0.60 →
// 33×0.60=19.8→20 (Carvão) e o resto (13) pro Sinaleiro que o acompanha.
// Os outros 6 territórios (ainda formato antigo) continuam na tabela velha
// até passarem pelo mesmo tratamento.
//
// AJUSTE 15/09/2026 nº2 (Isaias, direto, sem ambiguidade): "de três em três
// essa progressão, a primeira luta [sinal] é MUITO fácil de propósito (ficha
// de 3, sempre) — a partir da segunda luta sobe de 3 em 3 sem exceção, cada
// inimigo novo tem que obrigar a ralar uns 3 níveis pra encarar o próximo."
// Ladder final da Pista: sinal=3 · beco=8 · beco_2=11 · beco_3=14 ·
// Sinaleiro=17 · Rasteira Velha=20 · posmuro_1=23 · posmuro_2=26 ·
// Carvão=30 (o chefe quebra o padrão de +3 de propósito — "pra ser difícil,
// pra ser ralado"). Budget recalculado pra bater Carvão=30: corpos=2,
// liderFrac=0.60 → 50×0.60=30 (Carvão) e o resto (20) pro Sinaleiro que
// some com ele na luta de chefe.
export const GANGUES_CHEFE_BUDGET = { pista: 50, feira: 110, baixada: 210, vila: 345, morro: 510, alto: 606, laje: 732 }
export const GANGUES_CHEFE_LIDER_FRAC = 0.60
// Quantos CORPOS o bando do chefe tem (o resto de GANGUES_CHEFE_EQUIPE fica só
// pra lore/álbum). Pista = 2 (Carvão + Rasteira Velha): 2×2 é a única treta
// justa enquanto o elenco do jogador é travado em 2 fichas (a vaga nº 3 só abre
// vencendo o próprio chefe). O 3º general (Sinaleiro Chefe, 1451) é
// colecionável no POI `sinaleiro` da cena da Pista.
export const GANGUES_CHEFE_CORPOS = { pista: 2 }

// Total de pontos de todo bando (rua, revezamento, chefe, evento) é um número
// FIXO autorado por quem criou o encontro (ver ganguesTerritorios.js e
// data/cenas/pista/*), não mais um ratio contra o total de pontos do time do
// jogador. O ajuste de fácil/médio/difícil (`storyProgress.__dificuldade`)
// mora sozinho em ganguesDificuldade.js — `ajustarPontosFixo` é chamado em
// cada gerarBando* abaixo. Ver esse arquivo pro histórico completo de por que
// o ratio antigo (GANGUES_MODO_RATIO/GANGUES_TERRITORIO_STEP/
// GANGUES_DIFICULDADE_OFFSET/GANGUES_MODO_MULT) foi removido.

export function calcularPontosTime(team) {
  return team.reduce((sum, m) => sum + ['A', 'H', 'D', 'PV', 'PM'].reduce((s, k) => s + (Number(m.attributes?.[k]) || 0), 0), 0)
}

function distribuirPontos(total, qtd) {
  const base = Math.floor(total / qtd)
  const resto = total - base * qtd
  const partes = Array.from({ length: qtd }, () => base)
  for (let i = 0; i < resto; i++) partes[i % qtd] += 1
  return partes.map(p => Math.max(1, p))
}

// Mesmo mapeamento usado em prepare() (useGanguesTurnMachine.js) pra achar o
// "caminho" de combate de um inimigo a partir do preferred_mode do molde —
// precisa bater os dois lugares, senão a taxa de PV/PM por R diverge.
function caminhoDoInimigo(preferredMode) {
  return preferredMode === 'power' ? 'mistico' : preferredMode === 'armed' ? 'defensor' : 'atacante'
}

// Exportada (só pra POIs de "nível fixo" — ver escalarInimigoFixo/GanguesRoute)
// além do uso interno dos bandos sorteados.
export function escalarInimigo(molde, pontosAlvo) {
  const pontosOriginais = molde.stats.A + molde.stats.H + molde.stats.D + molde.stats.PV + molde.stats.PM
  const fator = pontosOriginais > 0 ? pontosAlvo / pontosOriginais : 1
  const stats = {
    A: Math.max(0, Math.round(molde.stats.A * fator)),
    H: Math.max(0, Math.round(molde.stats.H * fator)),
    D: Math.max(0, Math.round(molde.stats.D * fator)),
    PV: Math.max(1, Math.round(molde.stats.PV * fator)),
    PM: Math.max(0, Math.round(molde.stats.PM * fator)),
  }
  // PV/PM seguem a MESMA regra da ficha do jogador (PV e PM são atributos
  // próprios agora, cada um × a taxa do caminho, ver getGanguesResources) —
  // nunca mais escalados por conta própria, senão a ficha do inimigo (que
  // usa o mesmo componente visual da do jogador) mostra um número que não
  // explica o PV/PM ao lado.
  const recursos = getGanguesResources(caminhoDoInimigo(molde.preferred_mode), stats.PV, stats.PM)
  return { ...molde, stats, pv_max: recursos.pvMax, pm_max: recursos.pmMax }
}

/** Pontos que esse POI vai REALMENTE usar na luta — só pra preview na carta
 *  TretaVS (`GanguesCenaEncontros.jsx`), nunca pra montar o bando de verdade
 *  (isso sempre roda de novo na hora, via gerarBandoRevezamento/gerarBandoChefe).
 *  Achado do Isaias, 15/09/2026: a carta mostrava `enemy.stats` cru do
 *  catálogo (ex.: Cão Louco no baseline dele, ~6 pontos) mesmo quando a
 *  treta de verdade ia sortear um corpo aleatório do pool escalado pro
 *  orçamento fixo da ladder (ex.: 11 pontos em `beco_2`) — a ficha exibida
 *  não condizia com a ficha interna. Cobre os 3 formatos de nível fixo
 *  (`fixo`/Generais/rua comum, `revezamento`/rua-dungeon, chefe/orçamento×
 *  fração do líder — mesma conta de `gerarBandoChefe`). Não inclui o ajuste
 *  de dificuldade (ganguesDificuldade.js) — é o valor-base pra referência. */
export function pontosPreviewPoi(poi, territorioId) {
  if (poi.pontosFixo > 0) return poi.pontosFixo
  if (poi.revezamento?.budgetPorCorpo > 0) return poi.revezamento.budgetPorCorpo
  if (poi.ehChefe) {
    const budget = GANGUES_CHEFE_BUDGET[territorioId]
    return budget ? Math.round(budget * GANGUES_CHEFE_LIDER_FRAC) : null
  }
  return null
}

/** Sorteia um bando inimigo pro território dado, com total de pontos FIXO
 *  (`pontosFixo`, já ajustado pela dificuldade escolhida — ver
 *  ganguesDificuldade.js). Só a quantidade/composição de corpos é sorteada;
 *  o orçamento total nunca escala contra o jogador.
 *  `liderFixo`: id de inimigo (ex: um General, 1451+) que SEMPRE entra como o
 *  1º corpo do bando, com a maior fatia de pontos. O resto do bando segue
 *  sorteado do pool do território. É como se monta a luta de General ("a
 *  Rasteira Velha e o bonde dela"). */
export function gerarBandoInimigo({ territorioId, pontosFixo, playerTeam, enemiesData, liderFixo, moldesPool, qtdMin: qtdMinPoi, qtdMax: qtdMaxPoi }) {
  const config = GANGUES_TERRITORIO_ENCONTRO[territorioId]
  if (!config || !playerTeam?.length || !(pontosFixo > 0)) return null
  // moldesPool: restringe QUEM pode sortear (escolta), pra POIs perto do
  // fim (ex: sala do galpão com liderFixo) não puxarem vigia fraquinho do
  // pool genérico do território inteiro — mesmo budget, cara mais séria.
  // Exclui o próprio liderFixo da escolta — sem isso, a escolta podia
  // sortear o MESMO id do líder e o bando saía com "Cão Louco" (1) e (2)
  // (bug reportado pelo Isaias, 2026-09-14: "não é pra ter dois personagens
  // com o mesmo nome, nunca aconteceu com nenhum outro personagem").
  const poolBase = moldesPool?.length ? moldesPool : config.moldes
  const poolSemLider = liderFixo ? poolBase.filter(id => id !== liderFixo) : poolBase
  const moldes = poolSemLider.length ? poolSemLider : poolBase

  // Bando muito concentrado (poucos corpos) é o cenário mais perigoso — o
  // mínimo de corpos acompanha o tamanho do seu time, não só o teto fixo
  // do território.
  const qtdMin = Math.max(qtdMinPoi ?? config.min, Math.ceil(playerTeam.length * 0.6))
  // CAP de "action economy": o bando nunca tem muito mais corpos que o teu
  // time. Sem isso, ratio alto vira 8-10 corpos, cada um agindo no turno, e a
  // guerra de atrito flipa contra o jogador (a simulação mostrou 34 rodadas /
  // 18% de vitória na Laje). Com o cap, cada corpo fica mais "gordo" — combina
  // com a hierarquia de cargo (um Gerente pesa mais que um Vigia).
  // `qtdMax` do POI (ex: o galpão do Carvão, que precisa ser SEMPRE multidão)
  // ignora esse cap de propósito — é uma exceção autorada, não o bando comum.
  // Sem override, usa `folgaMax` do território se existir (Pista, 13/09/2026)
  // ou o `+2` padrão.
  const qtdMax = qtdMaxPoi != null ? Math.max(qtdMin, qtdMaxPoi) : Math.max(qtdMin, Math.min(config.max, playerTeam.length + (config.folgaMax ?? 2)))
  const qtd = qtdMin + Math.floor(Math.random() * (qtdMax - qtdMin + 1))

  const totalAlvo = Math.max(qtd, pontosFixo)
  const partes = distribuirPontos(totalAlvo, qtd)

  // liderFixo: o 1º corpo é o líder (um General). Ele fica com a maior fatia
  // (distribuirPontos já front-carrega a sobra) + um piso amarrado aos pontos
  // ORIGINAIS da ficha dele (~30%) — pra ele parecer um General mesmo num
  // bando pequeno, sem virar um muro. Simulado: ~88% de vitória pra time L1
  // recém-criado, ~97% no L2. Um degrau acima da treta normal, não um paredão.
  // Bug encontrado 2026-09-13: usava `s.R`, atributo que não existe mais nos
  // moldes (viraram A/H/D/PV/PM — ver nota em escalarInimigo sobre PV/PM
  // terem virado atributos próprios). Resultado: NaN se propagava pro piso
  // do líder inteiro, quebrando qualquer POI com liderFixo (ex: galpao_m2).
  const liderMolde = liderFixo && enemiesData.find(e => e.id === liderFixo)
  if (liderMolde && partes.length) {
    const s = liderMolde.stats
    partes[0] = Math.max(partes[0], Math.round((s.A + s.H + s.D + s.PV + s.PM) * 0.3))
  }

  // Sorteio da escolta SEM reposição (mesmo "saco" de gerarBandoRevezamento/
  // gerarBandoClube) — antes sorteava com reposição (`moldes[random]`), podia
  // sair o MESMO molde 2x no mesmo bando ("Fiado Vencido (1)"/"Fiado Vencido
  // (2)"). Isaias reportou (2026-09-14): "não é pra ter nome repetido, temos
  // um catálogo enorme de inimigos, usa melhor ele". Em todo território o
  // pool tem ids suficientes pra nunca precisar repetir dentro de um bando
  // (ver comentário de GANGUES_TERRITORIO_ENCONTRO); só reenche o saco se
  // esvaziar meio a meio de um sorteio muito grande.
  const bag = []
  const sortearMolde = () => {
    if (!bag.length) bag.push(...moldes)
    return bag.splice(Math.floor(Math.random() * bag.length), 1)[0]
  }
  const bando = partes.map((pontos, i) => {
    const moldeId = (i === 0 && liderFixo) ? liderFixo : sortearMolde()
    const molde = enemiesData.find(e => e.id === moldeId)
    return molde ? escalarInimigo(molde, pontos) : null
  }).filter(Boolean)

  numerarRepetidos(bando)
  return bando
}

// PRIMEIRA LUTA da conta — "tapa na cara" ao contrário (pedido do Isaias,
// set/2026): criou a gangue agora e a 1ª treta já engoliu um personagem +
// zerou a grana → já nasce endividado na birosca, experiência péssima de
// entrada. Não importa o nível/dificuldade escolhida: a 1ª luta de toda
// conta nova vem 1 corpo só, na METADE dos pontos que teria normalmente —
// dá uma vitória fácil de propósito (falsa sensação de segurança), só essa
// vez. Da 2ª luta em diante volta pro normal (ver GanguesRoute.jsx,
// storyProgress.__primeiraLutaFeita). Não mexe em chefe/clube/torre —
// aqueles já são gated por progresso, nunca caem como 1ª luta na prática.
export function suavizarPrimeiraLuta(bando) {
  if (!bando?.length) return bando
  const alvo = bando[0]
  const stats = {
    A: Math.max(0, Math.round(alvo.stats.A * 0.5)),
    H: Math.max(0, Math.round(alvo.stats.H * 0.5)),
    D: Math.max(0, Math.round(alvo.stats.D * 0.5)),
    PV: Math.max(1, Math.round(alvo.stats.PV * 0.5)),
    PM: Math.max(0, Math.round(alvo.stats.PM * 0.5)),
  }
  const recursos = getGanguesResources(caminhoDoInimigo(alvo.preferred_mode), stats.PV, stats.PM)
  // Sobrando só 1 corpo não tem mais repetição — tira o "(2)" etc. que
  // numerarRepetidos possa ter marcado no bando original antes do corte.
  const { numeroInstancia, ...resto } = alvo
  return [{ ...resto, stats, pv_max: recursos.pvMax, pm_max: recursos.pmMax }]
}

// "Regra da frustração" (pedido do Isaias, 19/09/2026): depois de derrotas
// SEGUIDAS na história (GANGUES_FRUSTRACAO_LIMIAR, ganguesDificuldade.js),
// a próxima treta comum vem mais leve — mas NÃO metade da ficha ("aí é
// fácil demais e fica roubado" — correção dele mesmo). Fica 1 inimigo só
// (o líder do bando, bando[0]), um degrau (GANGUES_LADDER_PASSO) ABAIXO do
// que teria normalmente — o mesmo "nível anterior" que rege a escolta de
// multidão logo abaixo. Chefe/clube ficam de fora (ver GanguesRoute.jsx).
export function suavizarPorFrustracao(bando) {
  if (!bando?.length) return bando
  const alvo = bando[0]
  const totalAtual = ['A', 'H', 'D', 'PV', 'PM'].reduce((s, k) => s + (alvo.stats[k] || 0), 0)
  const totalNovo = Math.max(1, totalAtual - GANGUES_LADDER_PASSO)
  const fator = totalAtual > 0 ? totalNovo / totalAtual : 1
  const stats = {
    A: Math.max(0, Math.round(alvo.stats.A * fator)),
    H: Math.max(0, Math.round(alvo.stats.H * fator)),
    D: Math.max(0, Math.round(alvo.stats.D * fator)),
    PV: Math.max(1, Math.round(alvo.stats.PV * fator)),
    PM: Math.max(0, Math.round(alvo.stats.PM * fator)),
  }
  const recursos = getGanguesResources(caminhoDoInimigo(alvo.preferred_mode), stats.PV, stats.PM)
  const { numeroInstancia, ...resto } = alvo
  return [{ ...resto, stats, pv_max: recursos.pvMax, pm_max: recursos.pmMax }]
}

// O molde é sorteado por slot, sem exclusividade — é comum o mesmo tipo
// (ex: 1201) sair 2x+ no mesmo bando. Sem uma numeração, os dois aparecem com o
// nome idêntico na tela de combate, impossível de diferenciar (qual "Moleque da
// Pista" já perdi PV, qual eu quero focar). numeroInstancia marca a 2ª, 3ª...
// ocorrência de cada id repetido — fighterName() usa isso pra por " II", " III".
function numerarRepetidos(bando) {
  const contagem = {}
  bando.forEach(inimigo => { contagem[inimigo.id] = (contagem[inimigo.id] || 0) + 1 })
  const visto = {}
  bando.forEach(inimigo => {
    if (contagem[inimigo.id] <= 1) return
    visto[inimigo.id] = (visto[inimigo.id] || 0) + 1
    inimigo.numeroInstancia = visto[inimigo.id]
  })
}

// Encontro ALEATÓRIO de rua — o "encontro selvagem" que aparece vez ou outra
// enquanto o jogador anda pela cena (não é um POI programado). Pedido do
// Isaias: o bando vem um pouquinho ACIMA da ficha atual do jogador, mas com um
// TETO fixo por território pra nunca virar paredão — no nível em que o chefe já
// é confortável de bater (Pista = L8), o encontro aleatório também é "numa boa".
// O teto fica ~70% do orçamento do chefe daquele bairro.
export const GANGUES_EVENTO_CAP = { pista: 14, feira: 22, baixada: 30, vila: 40, morro: 50, alto: 62, laje: 74 }

/** Sorteia o bando de um encontro aleatório de rua. Total de pontos =
 *  min(pontos do time × 1.1, teto do território). 1 corpo (45% de chance de 2).
 *  Escalado do pool comum do bairro. */
export function gerarBandoEvento({ territorioId, playerTeam, enemiesData, modo = 'medio' }) {
  const config = GANGUES_TERRITORIO_ENCONTRO[territorioId]
  if (!config || !playerTeam?.length || !enemiesData?.length) return null
  const pontosJogador = calcularPontosTime(playerTeam)
  const teto = ajustarPontosFixo(GANGUES_EVENTO_CAP[territorioId] ?? Math.round(pontosJogador * 1.2), modo)
  const totalAlvo = Math.max(5, Math.min(Math.round(pontosJogador * 1.1), teto))
  const qtd = 1 + (Math.random() < 0.45 ? 1 : 0)
  const partes = distribuirPontos(totalAlvo, qtd)
  // Mesmo fix de gerarBandoInimigo: sorteio sem reposição (só importa aqui
  // quando qtd=2, mas o mesmo bug existia).
  const bag = []
  const bando = partes.map(pontos => {
    if (!bag.length) bag.push(...config.moldes)
    const moldeId = bag.splice(Math.floor(Math.random() * bag.length), 1)[0]
    const molde = enemiesData.find(e => e.id === moldeId)
    return molde ? escalarInimigo(molde, pontos) : null
  }).filter(Boolean)
  if (!bando.length) return null
  numerarRepetidos(bando)
  return bando
}

/** Bando de REVEZAMENTO — pros encontros de dungeon (túnel, galpão) onde o
 *  Isaias quer "estilo Pokémon": um punhado de capangas fracos que se revezam,
 *  quase sempre 1 sozinho, às vezes uma dupla, sempre leves. Ignora o pool do
 *  território e a amarra de qtdMin (ceil(time × 0.6)) que fazia toda treta vir
 *  com 2+ corpos. `pool` = ids que podem aparecer; `budgetPorCorpo` = pontos de
 *  cada capanga (o molde é escalado pra esse total — os vigias 11xx nascem com
 *  4); `chanceDupla` = prob. de vir 2 em vez de 1.
 *  AJUSTE 15/09/2026 (Isaias): quando vem dupla, NÃO é "os dois saem iguais,
 *  mais fracos" (era ×0.75 nos dois) — o 1º corpo mantém a ficha OFICIAL do
 *  POI (`budgetPorCorpo` cheio) e só o(s) outro(s) saem 2-3 pontos abaixo
 *  (`DUPLA_DEDUCAO_MIN/MAX`), pra continuar parecendo o mesmo nível de
 *  ameaça, só um corpo mais fresco/novato do que o outro.
 *
 *  `qtdMin`/`qtdMax`: opcional — troca o "1, às vezes 2" pelo modo "multidão
 *  GARANTIDA" (ex: o galpão do Carvão, que o Isaias pediu pra ser sempre osso
 *  duro de 3-5, não mais o revezamento fraquinho do túnel). Quando presentes,
 *  ignoram `chanceDupla` por completo.
 *  BUG achado pelo Isaias (19/09/2026, "regra da frustração" — briga de
 *  gangue/multidão tem que respeitar a ficha igual qualquer outra luta):
 *  `multidaoGarantida` dava a ficha CHEIA (`budgetPorCorpo` sem dedução
 *  nenhuma) pra TODOS os corpos — um bando de 5 contra um personagem
 *  nível 14 virava 5 fichas de 14 pontos cada, intragável. Corrigido: só o
 *  1º corpo (o líder do bando) leva a ficha cheia; o resto vem um degrau
 *  ABAIXO na ladder (`MULTIDAO_DEGRAU_ABAIXO`, mesmo passo de
 *  `ganguesTerritorios.js` — nível 14 → escolta de 11), igual "os outros
 *  personagens da luta são do nível anterior" que ele descreveu.
 *  `playerTeam`/`ratioComTime`: opcional — soma ao `budgetPorCorpo` autorado
 *  uma fatia dos pontos do time do jogador (dividida pelos corpos do bando),
 *  pra deixar de ser um orçamento cego (nível 1 == nível 12) sem tirar o "piso"
 *  de personalidade do budget autorado (o galpão nunca fica mole demais nem
 *  vira paredão puro pra quem chegou fraco). Reportado pelo Isaias
 *  (2026-09-13): nível 11/12 matava tudo com um golpe no galpão.
 *  `baseMaisForte`: variante de `ratioComTime` pedida pelo Isaias
 *  (19/09/2026, testando a `rinha` já com a tropa upada: "a rinha deveria
 *  se adaptar à minha ficha... você acha que essa numeração tá certa?" —
 *  não estava: o `ratioComTime` padrão soma uma fatia da SOMA de pontos do
 *  time inteiro, dividida pelos corpos — pra farm "sempre no seu nível" isso
 *  fica bem abaixo do personagem mais forte, e a "recompensa por risco"
 *  (ganguesVictoryResolver.js) então quase não dá AP nenhum). Com
 *  `baseMaisForte`, a base de comparação vira o MAIOR total de pontos entre
 *  os personagens do time (não a soma) e o orçamento do líder vira
 *  `Math.max(budgetPorCorpo, pontosMaisForte × ratioComTime)` — um MAX, não
 *  soma — pra o líder ficar sempre bem perto do personagem mais forte da
 *  gangue (ratioComTime=1 = igual), nunca a mais. A dedução da dupla ainda
 *  se aplica DEPOIS desse cálculo, então o 2º corpo continua mais fraco. */
const GANGUES_DUPLA_DEDUCAO_MIN = 2
const GANGUES_DUPLA_DEDUCAO_MAX = 3
const GANGUES_MULTIDAO_DEGRAU_ABAIXO = GANGUES_LADDER_PASSO

export function gerarBandoRevezamento({ pool, budgetPorCorpo = 5, chanceDupla = 0.3, enemiesData, modo = 'medio', qtdMin, qtdMax, playerTeam, ratioComTime = 0, baseMaisForte = false }) {
  if (!pool?.length || !enemiesData?.length) return null
  const multidaoGarantida = qtdMin != null && qtdMax != null
  const dupla = !multidaoGarantida && Math.random() < chanceDupla
  const qtd = multidaoGarantida ? (qtdMin + Math.floor(Math.random() * (qtdMax - qtdMin + 1))) : (dupla ? 2 : 1)
  const pontosMaisForte = baseMaisForte
    ? Math.max(0, ...(playerTeam || []).map(m => ['A', 'H', 'D', 'PV', 'PM'].reduce((s, k) => s + (Number(m.attributes?.[k]) || 0), 0)))
    : 0
  const bonusTime = (playerTeam?.length && ratioComTime > 0)
    ? (baseMaisForte ? pontosMaisForte * ratioComTime : (calcularPontosTime(playerTeam) * ratioComTime) / qtd)
    : 0
  const baseAlvo = baseMaisForte ? Math.max(budgetPorCorpo, bonusTime) : (budgetPorCorpo + bonusTime)
  // 1º corpo (índice 0, o líder) sempre leva a ficha oficial do POI. Os
  // demais vêm mais fracos: na dupla comum, 2-3 pontos abaixo aleatório
  // (ameaça parecida, corpo "mais novato"); na multidão garantida, um
  // degrau INTEIRO abaixo (a mesma escala da ladder de território) — senão
  // vira bando inteiro na ficha do líder, impossível de vencer em grupo.
  const deducaoCorpo = i => {
    if (i === 0) return 0
    return multidaoGarantida ? GANGUES_MULTIDAO_DEGRAU_ABAIXO : (GANGUES_DUPLA_DEDUCAO_MIN + Math.floor(Math.random() * (GANGUES_DUPLA_DEDUCAO_MAX - GANGUES_DUPLA_DEDUCAO_MIN + 1)))
  }

  const bag = []
  const sortear = () => {
    if (!bag.length) bag.push(...pool)
    return bag.splice(Math.floor(Math.random() * bag.length), 1)[0]
  }
  const bando = Array.from({ length: qtd }, (_, i) => {
    const id = sortear()
    const molde = enemiesData.find(e => e.id === id)
    const orcamento = Math.max(2, ajustarPontosFixo(baseAlvo - deducaoCorpo(i), modo))
    return molde ? escalarInimigo(molde, orcamento) : null
  }).filter(Boolean)

  if (!bando.length) return null
  numerarRepetidos(bando)
  return bando
}

/** Bando do CHEFE — orçamento de pontos FIXO (GANGUES_CHEFE_BUDGET), nunca
 *  escalado contra o jogador. Corpos = os N primeiros ids de GANGUES_CHEFE_EQUIPE
 *  (N = GANGUES_CHEFE_CORPOS, default 3). O 1º corpo (o chefe) leva a maior
 *  fatia (piso = budget × GANGUES_CHEFE_LIDER_FRAC), o resto divide o que sobra.
 *  Sempre a mesma composição — dá pra aprender a luta e voltar mais preparado. */
export function gerarBandoChefe({ territorioId, playerTeam, enemiesData, modo = 'medio' }) {
  const ids = GANGUES_CHEFE_EQUIPE[territorioId]
  if (!ids?.length || !playerTeam?.length || !enemiesData?.length) return null

  const n = Math.min(ids.length, GANGUES_CHEFE_CORPOS[territorioId] || 3)
  const budgetBase = GANGUES_CHEFE_BUDGET[territorioId]
    ?? Math.round(calcularPontosTime(playerTeam) * 0.8) // fallback defensivo p/ território sem budget
  const budget = ajustarPontosFixo(budgetBase, modo)
  const partes = distribuirPontos(budget, n)

  // Piso do líder — desloca pontos das escoltas pro chefe sem estourar o budget.
  const piso = Math.round(budget * GANGUES_CHEFE_LIDER_FRAC)
  if (partes[0] < piso) {
    let falta = piso - partes[0]
    partes[0] = piso
    for (let i = 1; i < n && falta > 0; i++) {
      const tira = Math.min(partes[i] - 1, Math.ceil(falta / (n - i)))
      partes[i] -= tira
      falta -= tira
    }
  }

  const bando = ids.slice(0, n).map((id, i) => {
    const molde = enemiesData.find(e => e.id === id)
    return molde ? escalarInimigo(molde, partes[i]) : null
  }).filter(Boolean)

  if (!bando.length) return null
  numerarRepetidos(bando)
  return bando
}

/** Pool e bando do CLUBE DA LUTA — a roda clandestina do Nato. Brigões de
 *  galpão (vapores e cobradores mais casca-grossa da Pista/Feira). Orçamento
 *  FIXO e alto (não escala com o jogador): é pra doer, o cara só cai aqui em
 *  último caso, endividado até o pescoço. 2–3 corpos. */
export const GANGUES_CLUBE_POOL = [1211, 1212, 1213, 1219, 1311, 1312, 1411, 1412]
export const GANGUES_CLUBE_BUDGET = 26
// Gauntlet de 3 rondas: 1 corpo fraco → 2 → 3 casca-grossa (o bando de antes).
const GANGUES_CLUBE_RONDAS = {
  1: { qtd: 1, budget: 7 },
  2: { qtd: 2, budget: 15 },
  3: { qtd: 3, budget: GANGUES_CLUBE_BUDGET },
}
export function gerarBandoClube({ enemiesData, ronda = 3 }) {
  if (!enemiesData?.length) return null
  const cfg = GANGUES_CLUBE_RONDAS[ronda] || GANGUES_CLUBE_RONDAS[3]
  const qtd = cfg.qtd
  const partes = distribuirPontos(cfg.budget, qtd)
  const bag = []
  const sortear = () => {
    if (!bag.length) bag.push(...GANGUES_CLUBE_POOL)
    return bag.splice(Math.floor(Math.random() * bag.length), 1)[0]
  }
  const bando = partes.map(pontos => {
    const id = sortear()
    const molde = enemiesData.find(e => e.id === id)
    return molde ? escalarInimigo(molde, pontos) : null
  }).filter(Boolean)
  if (!bando.length) return null
  numerarRepetidos(bando)
  return bando
}
