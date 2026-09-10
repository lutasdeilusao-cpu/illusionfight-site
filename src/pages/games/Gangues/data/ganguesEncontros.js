import { getGanguesResources } from './ganguesLoadout.js'

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
  pista:   { moldes: [1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1201, 1202, 1203, 1204, 1205, 1206, 1301, 1302, 1303, 1401, 1402], min: 1, max: 4 },
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
// calcularPontosTime = soma de A+H+D+R, e o crescimento autorado é EXATAMENTE
// +1 ponto por nível → 1 ficha nível N = N pontos. O time cresce 1 vaga por
// território dominado (2 na Pista, 3 na Feira, ... até 6 = teto de batalha):
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
// virar pushover pra quem chega no nível-alvo. Playtest pra confirmar.
export const GANGUES_CHEFE_BUDGET = { pista: 44, feira: 110, baixada: 210, vila: 345, morro: 510, alto: 606, laje: 732 }
export const GANGUES_CHEFE_LIDER_FRAC = 0.60
// Quantos CORPOS o bando do chefe tem (o resto de GANGUES_CHEFE_EQUIPE fica só
// pra lore/álbum). Pista = 2 (Carvão + Rasteira Velha): 2×2 é a única treta
// justa enquanto o elenco do jogador é travado em 2 fichas (a vaga nº 3 só abre
// vencendo o próprio chefe). O 3º general (Sinaleiro Chefe, 1451) é
// colecionável no POI `sinaleiro` da cena da Pista.
export const GANGUES_CHEFE_CORPOS = { pista: 2 }

// Total de pontos do bando = pontos do jogador × ratio. O ratio SOBE por
// território ("sempre igualando a ficha do jogador" — pedido do Isaias): a
// Pista dá ~metade dos teus pontos pro bando, a Laje dá ~três quartos. Sem
// isso, um time que subiu de nível zerava os bairros de cima sem tomar dano.
// Validado por simulação headless (3000 batalhas/célula, porta fiel do
// resolver + turn machine) — a curva e a tabela de resultados estão em
// src/pages/games/Gangues/GANGUES_MODO_HISTORIA_ENCONTROS.md §"Balanceamento".
// MODO de dificuldade — escolha do jogador (storyProgress.__dificuldade), como
// em qualquer game. `facil` é a curva simulada original (bando de rua da Pista
// com ~52% dos teus pontos); `medio` e `dificil` sobem. Pedido do Isaias
// (jan/2027 — "tá muito fácil, mato no automático com uma porrada").
export const GANGUES_MODO_RATIO = { facil: 0.52, medio: 0.70, dificil: 0.80 }
// degrau por território, somado ao ratio do modo (a Pista continua mais leve
// que a Laje). Provisório pros bairros sem cena — recalibrar com simulação.
export const GANGUES_TERRITORIO_STEP = {
  pista: 0, feira: 0.03, baixada: 0.06, vila: 0.08, morro: 0.10, alto: 0.11, laje: 0.12,
}
// multiplicador do modo pro que NÃO usa ratio (revezamento de dungeon, encontro
// aleatório, orçamento do chefe).
export const GANGUES_MODO_MULT = { facil: 0.82, medio: 1, dificil: 1.18 }
// facil/normal/dificil = deslocamento DENTRO do bairro (tag do POI), pra não
// empilhar luta puxada atrás de luta puxada. NÃO confundir com o MODO acima.
export const GANGUES_DIFICULDADE_OFFSET = { facil: -0.10, normal: 0, dificil: 0.10 }

export function calcularPontosTime(team) {
  return team.reduce((sum, m) => sum + ['A', 'H', 'R', 'D'].reduce((s, k) => s + (Number(m.attributes?.[k]) || 0), 0), 0)
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

function escalarInimigo(molde, pontosAlvo) {
  const pontosOriginais = molde.stats.A + molde.stats.H + molde.stats.R + molde.stats.D
  const fator = pontosOriginais > 0 ? pontosAlvo / pontosOriginais : 1
  const stats = {
    A: Math.max(0, Math.round(molde.stats.A * fator)),
    H: Math.max(0, Math.round(molde.stats.H * fator)),
    R: Math.max(1, Math.round(molde.stats.R * fator)),
    D: Math.max(0, Math.round(molde.stats.D * fator)),
  }
  // PV/PM seguem a MESMA regra da ficha do jogador (Resistência × taxa do
  // caminho, ver getGanguesResources) — nunca mais escalados por conta
  // própria, senão a ficha do inimigo (que agora usa o mesmo componente
  // visual da do jogador) mostra um R que não explica o PV/PM ao lado.
  const recursos = getGanguesResources(caminhoDoInimigo(molde.preferred_mode), stats.R)
  return { ...molde, stats, pv_max: recursos.pvMax, pm_max: recursos.pmMax }
}

/** Sorteia um bando inimigo pro território/dificuldade dados, escalado contra
 *  o time atual do jogador — ou contra `pontosFixos`, se vier preenchido.
 *  `pontosFixos` é o retrato ("snapshot") congelado de uma treta repetível
 *  (ver `travarPontosFarm` no store): sem isso, todo bando repetível ficaria
 *  sempre no mesmo nível de dificuldade do jogador atual, e nunca ficaria
 *  fácil de "farmar" depois que a gangue evolui — o ponto inteiro de ter
 *  uma treta pra repetir é ela ficar mais fraca que você com o tempo. */
/** `liderFixo`: id de inimigo (ex: um General, 1451+) que SEMPRE entra como o
 *  1º corpo do bando, com a maior fatia de pontos. O resto do bando segue
 *  sorteado do pool do território. É como se monta a luta de General ("a
 *  Rasteira Velha e o bonde dela"). */
export function gerarBandoInimigo({ territorioId, dificuldade = 'normal', modo = 'medio', playerTeam, enemiesData, pontosFixos, liderFixo }) {
  const config = GANGUES_TERRITORIO_ENCONTRO[territorioId]
  if (!config || !playerTeam?.length) return null

  const pontosJogador = pontosFixos > 0 ? pontosFixos : calcularPontosTime(playerTeam)
  // Bando muito concentrado (poucos corpos) é o cenário mais perigoso — o
  // mínimo de corpos acompanha o tamanho do seu time, não só o teto fixo
  // do território.
  const qtdMin = Math.max(config.min, Math.ceil(playerTeam.length * 0.6))
  // CAP de "action economy": o bando nunca tem muito mais corpos que o teu
  // time. Sem isso, ratio alto vira 8-10 corpos, cada um agindo no turno, e a
  // guerra de atrito flipa contra o jogador (a simulação mostrou 34 rodadas /
  // 18% de vitória na Laje). Com o cap, cada corpo fica mais "gordo" — combina
  // com a hierarquia de cargo (um Gerente pesa mais que um Vigia).
  const qtdMax = Math.max(qtdMin, Math.min(config.max, playerTeam.length + 2))
  const qtd = qtdMin + Math.floor(Math.random() * (qtdMax - qtdMin + 1))

  const ratioBase = (GANGUES_MODO_RATIO[modo] ?? GANGUES_MODO_RATIO.medio) + (GANGUES_TERRITORIO_STEP[territorioId] ?? 0.10)
  const ratio = Math.min(0.95, Math.max(0.30, ratioBase + (GANGUES_DIFICULDADE_OFFSET[dificuldade] ?? 0)))
  const totalAlvo = Math.max(qtd, Math.round(pontosJogador * ratio))
  const partes = distribuirPontos(totalAlvo, qtd)

  // liderFixo: o 1º corpo é o líder (um General). Ele fica com a maior fatia
  // (distribuirPontos já front-carrega a sobra) + um piso amarrado aos pontos
  // ORIGINAIS da ficha dele (~30%) — pra ele parecer um General mesmo num
  // bando pequeno, sem virar um muro. Simulado: ~88% de vitória pra time L1
  // recém-criado, ~97% no L2. Um degrau acima da treta normal, não um paredão.
  const liderMolde = liderFixo && enemiesData.find(e => e.id === liderFixo)
  if (liderMolde && partes.length) {
    const s = liderMolde.stats
    partes[0] = Math.max(partes[0], Math.round((s.A + s.H + s.R + s.D) * 0.3))
  }

  const bando = partes.map((pontos, i) => {
    const moldeId = (i === 0 && liderFixo) ? liderFixo : config.moldes[Math.floor(Math.random() * config.moldes.length)]
    const molde = enemiesData.find(e => e.id === moldeId)
    return molde ? escalarInimigo(molde, pontos) : null
  }).filter(Boolean)

  numerarRepetidos(bando)
  return bando
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
  const mult = GANGUES_MODO_MULT[modo] ?? 1
  const teto = Math.round((GANGUES_EVENTO_CAP[territorioId] ?? Math.round(pontosJogador * 1.2)) * mult)
  const totalAlvo = Math.max(5, Math.min(Math.round(pontosJogador * 1.1 * mult), teto))
  const qtd = 1 + (Math.random() < 0.45 ? 1 : 0)
  const partes = distribuirPontos(totalAlvo, qtd)
  const bando = partes.map(pontos => {
    const moldeId = config.moldes[Math.floor(Math.random() * config.moldes.length)]
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
 *  4); `chanceDupla` = prob. de vir 2 em vez de 1 (a dupla vem mais magra,
 *  ×0.75, pra não ser só o dobro). */
export function gerarBandoRevezamento({ pool, budgetPorCorpo = 5, chanceDupla = 0.3, enemiesData, modo = 'medio' }) {
  if (!pool?.length || !enemiesData?.length) return null
  const dupla = Math.random() < chanceDupla
  const qtd = dupla ? 2 : 1
  const mult = GANGUES_MODO_MULT[modo] ?? 1
  const orcamento = Math.max(2, Math.round((dupla ? budgetPorCorpo * 0.75 : budgetPorCorpo) * mult))

  const bag = []
  const sortear = () => {
    if (!bag.length) bag.push(...pool)
    return bag.splice(Math.floor(Math.random() * bag.length), 1)[0]
  }
  const bando = Array.from({ length: qtd }, () => {
    const id = sortear()
    const molde = enemiesData.find(e => e.id === id)
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
  const budget = Math.round(budgetBase * (GANGUES_MODO_MULT[modo] ?? 1))
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
