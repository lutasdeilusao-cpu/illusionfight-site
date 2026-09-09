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
  pista:   { moldes: [1101, 1102, 1103, 1201, 1202, 1203, 1301, 1302, 1303, 1401, 1402], min: 1, max: 4 },
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
// fixo, e o loop de RPG é você VOLTAR mais forte. Quanto mais nível, mais
// confortável fica a mesma luta.
// Só a Pista está calibrada por simulação headless (scratchpad/sim_boss7.py):
// budget 20 · líder 60% · 2 corpos → time balanceado de 2 fichas vence
// L5 ~8% · L6-7 ~22% · L8 ~50% · L10 ~69% (tank L10 >95%). Pedido do Isaias:
// "abaixo do 8 quase errado de encarar, no 8 pau a pau, no 10 confortável".
// Os outros 6 são 1ª aproximação (~+7 por bairro) — recalibrar quando cada um
// ganhar cena própria e simulação dedicada.
export const GANGUES_CHEFE_BUDGET = { pista: 20, feira: 30, baixada: 42, vila: 55, morro: 68, alto: 82, laje: 96 }
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
export const GANGUES_TERRITORIO_RATIO = {
  pista: 0.52, feira: 0.58, baixada: 0.64, vila: 0.68,
  morro: 0.70, alto: 0.72, laje: 0.74,
}
// facil/normal/dificil = deslocamento DENTRO do bairro, pra não empilhar luta
// puxada atrás de luta puxada.
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
export function gerarBandoInimigo({ territorioId, dificuldade = 'normal', playerTeam, enemiesData, pontosFixos, liderFixo }) {
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

  const ratioBase = GANGUES_TERRITORIO_RATIO[territorioId] ?? 0.60
  const ratio = Math.max(0.30, ratioBase + (GANGUES_DIFICULDADE_OFFSET[dificuldade] ?? 0))
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

/** Bando de REVEZAMENTO — pros encontros de dungeon (túnel, galpão) onde o
 *  Isaias quer "estilo Pokémon": um punhado de capangas fracos que se revezam,
 *  quase sempre 1 sozinho, às vezes uma dupla, sempre leves. Ignora o pool do
 *  território e a amarra de qtdMin (ceil(time × 0.6)) que fazia toda treta vir
 *  com 2+ corpos. `pool` = ids que podem aparecer; `budgetPorCorpo` = pontos de
 *  cada capanga (o molde é escalado pra esse total — os vigias 11xx nascem com
 *  4); `chanceDupla` = prob. de vir 2 em vez de 1 (a dupla vem mais magra,
 *  ×0.75, pra não ser só o dobro). */
export function gerarBandoRevezamento({ pool, budgetPorCorpo = 5, chanceDupla = 0.3, enemiesData }) {
  if (!pool?.length || !enemiesData?.length) return null
  const dupla = Math.random() < chanceDupla
  const qtd = dupla ? 2 : 1
  const orcamento = dupla ? Math.max(2, Math.round(budgetPorCorpo * 0.75)) : budgetPorCorpo

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
export function gerarBandoChefe({ territorioId, playerTeam, enemiesData }) {
  const ids = GANGUES_CHEFE_EQUIPE[territorioId]
  if (!ids?.length || !playerTeam?.length || !enemiesData?.length) return null

  const n = Math.min(ids.length, GANGUES_CHEFE_CORPOS[territorioId] || 3)
  const budget = GANGUES_CHEFE_BUDGET[territorioId]
    ?? Math.round(calcularPontosTime(playerTeam) * 0.8) // fallback defensivo p/ território sem budget
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
