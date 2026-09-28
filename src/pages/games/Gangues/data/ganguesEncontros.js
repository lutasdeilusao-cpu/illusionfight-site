import { getGanguesResources } from './ganguesLoadout.js'
import { ajustarPontosFixo, GANGUES_LADDER_PASSO } from './ganguesDificuldade.js'
import { GANGUES_CHEFE_EQUIPE, GANGUES_CHEFE_BUDGET, GANGUES_CHEFE_CORPOS, liderFracChefe } from './ganguesChefes.js'

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

// Tabelas dos CHEFES (equipe fixa, orçamento, fração do líder, corpos) moram
// em ./ganguesChefes.js — aqui fica só a geração do bando (gerarBandoChefe).

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

export function distribuirPontos(total, qtd) {
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
const somaPontos = e => ['A', 'H', 'D', 'PV', 'PM'].reduce((s, k) => s + (Number(e?.stats?.[k]) || 0), 0)

/** Pontos de ficha REAIS do líder do chefe do território (mesma conta de
 *  gerarBandoChefe: orçamento ajustado pela dificuldade × fração do líder,
 *  escalado no molde dele). É o teto de todo inimigo daquele território. */
export function pontosDoChefe(territorioId, modo, enemiesData) {
  const budget = GANGUES_CHEFE_BUDGET[territorioId]
  const molde = enemiesData?.find(e => e.id === GANGUES_CHEFE_EQUIPE[territorioId]?.[0])
  if (!budget || !molde) return Infinity
  return somaPontos(escalarInimigo(molde, Math.round(ajustarPontosFixo(budget, modo) * liderFracChefe(territorioId))))
}

export function pontosPreviewPoi(poi, territorioId) {
  if (poi.rinhaInfinita) return null // nível sorteado a cada luta (niveisDoTerritorio)
  if (poi.pontosFixo > 0) return poi.pontosFixo
  if (poi.revezamento?.budgetPorCorpo > 0) return poi.revezamento.budgetPorCorpo
  if (poi.ehChefe) {
    const budget = GANGUES_CHEFE_BUDGET[territorioId]
    return budget ? Math.round(budget * liderFracChefe(territorioId)) : null
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
export function numerarRepetidos(bando) {
  const contagem = {}
  bando.forEach(inimigo => { contagem[inimigo.id] = (contagem[inimigo.id] || 0) + 1 })
  const visto = {}
  bando.forEach(inimigo => {
    if (contagem[inimigo.id] <= 1) return
    visto[inimigo.id] = (visto[inimigo.id] || 0) + 1
    inimigo.numeroInstancia = visto[inimigo.id]
  })
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

export function gerarBandoRevezamento({ pool, budgetPorCorpo: budgetBase = 5, chanceDupla = 0.3, enemiesData, modo = 'medio', qtdMin, qtdMax, playerTeam, ratioComTime = 0, baseMaisForte = false, niveisSorteio, tetoTerritorio, apelidos }) {
  if (!pool?.length || !enemiesData?.length) return null
  // Rinha infinita (`niveisSorteio`, Isaias 28/09/2026: "segue a média de
  // level do território"): cada luta sorteia o nível entre os das lutas do
  // bairro, do mais fraco ao chefão (niveisDoTerritorio, cenaHelpers.js).
  const budgetPorCorpo = niveisSorteio?.length ? niveisSorteio[Math.floor(Math.random() * niveisSorteio.length)] : budgetBase
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

  const teto = tetoTerritorio ? pontosDoChefe(tetoTerritorio, modo, enemiesData) : Infinity
  const bag = []
  const sortear = () => {
    if (!bag.length) bag.push(...pool)
    return bag.splice(Math.floor(Math.random() * bag.length), 1)[0]
  }
  const bando = Array.from({ length: qtd }, (_, i) => {
    const id = sortear()
    const molde = enemiesData.find(e => e.id === id)
    if (!molde) return null
    // Teto = o chefão do território (a ficha REAL do líder do chefe): nada
    // gerado ali passa dele, por mais forte que a tropa esteja (encontro que
    // escala com o time, multidão...). O arredondamento do escalarInimigo
    // pode estourar 1-2 pontos — desce o orçamento até caber.
    let orcamento = Math.min(teto, Math.max(2, ajustarPontosFixo(baseAlvo - deducaoCorpo(i), modo)))
    let inimigo = escalarInimigo(molde, orcamento)
    while (somaPontos(inimigo) > teto && orcamento > 2) inimigo = escalarInimigo(molde, --orcamento)
    return inimigo
  }).filter(Boolean)

  if (!bando.length) return null
  if (GANGUES_APELIDOS_QTD[apelidos]) batizarBando(bando, apelidos)
  else numerarRepetidos(bando)
  return bando
}

/** Apelidos de rua (v3.71.0 — Isaias: "tá usando os nomes genéricos, garupa
 *  1, garupa 2... cria uns nomes da hora, de rua mesmo, e não deixa repetir;
 *  os polícia também, capitão não sei o quê"). Bando com `apelidos` (a
 *  chave de uma lista em games.gangues.apelidos.<lista>, nos 3 idiomas)
 *  ganha um nome próprio por corpo, sorteado SEM repetir dentro da luta —
 *  no lugar do nome do molde + "(1)", "(2)". Usado pelos encontros
 *  aleatórios cujos moldes são papéis genéricos (Piloto/Garupa, Soldado/Cabo
 *  da Ronda). QTD tem que bater com o tamanho da lista no i18n. */
export const GANGUES_APELIDOS_QTD = { moto: 12, policia: 12, rapa: 12 }
function batizarBando(bando, lista) {
  const livres = Array.from({ length: GANGUES_APELIDOS_QTD[lista] }, (_, i) => i)
  bando.forEach(inimigo => {
    inimigo.apelido = { lista, i: livres.splice(Math.floor(Math.random() * livres.length), 1)[0] }
  })
}

/** Bando do CHEFE — orçamento de pontos FIXO (GANGUES_CHEFE_BUDGET), nunca
 *  escalado contra o jogador. Corpos = os N primeiros ids de GANGUES_CHEFE_EQUIPE
 *  (N = GANGUES_CHEFE_CORPOS, default 3). O 1º corpo (o chefe) leva a maior
 *  fatia (piso = budget × liderFracChefe), o resto divide o que sobra.
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
  const piso = Math.round(budget * liderFracChefe(territorioId))
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

// O bando do CLUBE DA LUTA mora no módulo do Clube: clube/ganguesClubeRegras.js.
