// Cálculo puro da resolução de vitória/derrota — extraído de GanguesVictory.jsx
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §2). Nenhuma função
// aqui chama store.* — só recebe dados e devolve números prontos pra aplicar.
// Isso permite testar a distribuição de AP/recompensa sem montar componente.
import { getGanguesLevelFromXp } from '../data/ganguesCharacters.js'

/** Nome do combatente pro relatório — numera instâncias repetidas do mesmo
 *  molde de inimigo (ver gerarBandoInimigo/numeroInstancia). */
export function combatantName(t, member) {
  if (member?.side !== 'enemy') return member?.sheet_name
  const base = t(`games.gangues.enemy_names.${member.id}`) || member.name
  return member.numeroInstancia ? `${base} (${member.numeroInstancia})` : base
}

/** Junta os eventos (atributo ganho, poder desbloqueado) de todo nível
 *  cruzado nesta luta — cobre o caso raro de subir mais de um nível de uma
 *  vez (bando grande, XP dividido mesmo assim empurrando 2 níveis). */
export function eventosDoLevelUp(character, fromLevel, toLevel, eventosDoNivel) {
  const eventos = []
  for (let lvl = fromLevel + 1; lvl <= toLevel; lvl++) {
    const levelData = character.levels.find(item => item.level === lvl)
    if (levelData) eventos.push(...eventosDoNivel(levelData))
  }
  return eventos
}

// O total de AP é SEMPRE 10 por inimigo no bando, em QUALQUER modo (Torre ou
// história). Chegou a subir pra 30 no modo história em dez/2026 pra escada de
// nível dos chefes acompanhar o ritmo — o Isaias reverteu isso em set/2026
// (ficava rápido/quebrado demais: 2 inimigos já rendiam 60 AP numa luta só).
// A escada de nível dos 7 chefes (ver GANGUES_CHEFE_BUDGET no GDD) fica mais
// lenta de acompanhar com 10 fixo — ainda não recalibrada, ver seção 12 do GDD.
// Chefe é luta única, vale 5×. Torre escala +100% a cada 5 andares. Na derrota
// é sempre 1 AP simbólico, sem relação com o bando.
const GANGUES_AP_POR_INIMIGO_BASE = 10

/** Soma de pontos de um conjunto de atributos (A+H+D+PV+PM) — mesma conta de
 *  `calcularPontosTime` (ganguesEncontros.js), mas pra UM combatente só (aqui
 *  precisamos comparar cada inimigo individualmente, não o time inteiro). */
function pontosDeAtributos(attrs) {
  return ['A', 'H', 'D', 'PV', 'PM'].reduce((s, k) => s + (Number(attrs?.[k]) || 0), 0)
}

/** "Recompensa por risco" (pedido do Isaias, 19/09/2026): "não tem porque
 *  subir, porque subir não dá mais experiência do que ficar embaixo em
 *  frente a cara fraco". Cada inimigo agora rende AP relativo à distância
 *  entre a ficha DELE e a ficha do personagem MAIS FORTE da gangue (não o
 *  time inteiro — só o mais forte importa pra essa régua):
 *    • inimigo até 2 pontos ABAIXO do mais forte (ou igual, ou acima até o
 *      próximo degrau): ficha cheia (100%).
 *    • cada ponto A MAIS abaixo desses 2 de tolerância desconta
 *      `tamanhoTime` AP da ficha cheia — "é gradual, e perder 1 ponto se
 *      tiver 2 personagens, perde 2 pontos da experiência cheia por
 *      diferença de nível" — o desconto é POR PERSONAGEM da gangue (1 ponto
 *      de AP "perdido" por cabeça), não um flat -1 pro bolo inteiro — senão
 *      um time grande mal sentiria a perda já que o AP é dividido entre
 *      todo mundo depois.
 *    • inimigo 1 a 5 pontos ACIMA do mais forte: TRIPLO do AP.
 *    • inimigo mais de 5 pontos ACIMA: QUÁDRUPLO do AP.
 *  AJUSTE 20/09/2026 (Isaias jogando de verdade, nível médio: "tá muito
 *  difícil... tô ficando sem área pra upar, sou obrigado a lutar com os
 *  fortes porque os fracos não dão nenhum ponto de experiência, tô tirando
 *  1 de experiência"): o piso antigo (`tamanhoTime`, 1 AP por cabeça da
 *  gangue) na prática rendia quase nada pro farm de sobrevivência — ele
 *  pediu um piso de verdade, "pelo menos 5 pontos", e SUBIU o prêmio de
 *  quem se arrisca de dobro/triplo pra TRIPLO/QUÁDRUPLO, "já tem que mudar
 *  isso nos tutoriais". `GANGUES_AP_PISO_MINIMO` é flat (não escala com o
 *  time) — o Isaias confirmou explicitamente "5 fixo", não "5 por cabeça".
 *  "pontos" aqui é o total bruto de atributos (A+H+D+PV+PM), o mesmo usado
 *  em toda a ladder de dificuldade — não é o "nível real" de
 *  `nivelRealDePontos` (ganguesDificuldade.js), que é só pra exibição do
 *  aviso de risco, mecânica separada. */
const GANGUES_AP_TOLERANCIA_ABAIXO = 2
const GANGUES_AP_LIMIAR_TRIPLO = 1
const GANGUES_AP_LIMIAR_QUADRUPLO = 5
const GANGUES_AP_PISO_MINIMO = 5
export function apPorInimigo(pontosInimigo, pontosMaisForte, tamanhoTime = 1) {
  const time = Math.max(1, tamanhoTime)
  const delta = pontosInimigo - pontosMaisForte
  if (delta > GANGUES_AP_LIMIAR_QUADRUPLO) return GANGUES_AP_POR_INIMIGO_BASE * 4
  if (delta >= GANGUES_AP_LIMIAR_TRIPLO) return GANGUES_AP_POR_INIMIGO_BASE * 3
  if (delta >= -GANGUES_AP_TOLERANCIA_ABAIXO) return GANGUES_AP_POR_INIMIGO_BASE
  const niveisAbaixoDaTolerancia = Math.abs(delta) - GANGUES_AP_TOLERANCIA_ABAIXO
  return Math.max(GANGUES_AP_PISO_MINIMO, GANGUES_AP_POR_INIMIGO_BASE - niveisAbaixoDaTolerancia * time)
}

export function calcularApTotal({ victory, enemyCount, cenaChefe, torre, torreAndar, inimigosAttrs, pontosMaisForte, tamanhoTime = 1 }) {
  if (!victory) return 1
  const multiplicadorChefe = cenaChefe ? 5 : 1
  const multiplicadorTorre = torre ? 1 + Math.floor(torreAndar / 5) : 1
  // Sem os atributos dos inimigos (chamada antiga/defensiva) cai pro flat de
  // sempre — nunca deveria acontecer no fluxo real (useGanguesVictoryResolution
  // sempre manda `inimigosAttrs`), só protege contra uso futuro incompleto.
  const base = Array.isArray(inimigosAttrs) && inimigosAttrs.length
    ? inimigosAttrs.reduce((soma, attrs) => soma + apPorInimigo(pontosDeAtributos(attrs), pontosMaisForte ?? 0, tamanhoTime), 0)
    : GANGUES_AP_POR_INIMIGO_BASE * Math.max(1, enemyCount)
  return Math.round(base * multiplicadorChefe * multiplicadorTorre)
}

/** Quem participou, quem caiu, e o peso de cada um pra dividir o AP.
 *  Peso por FAIXA de contribuição (abates pesam mais que dano, dano desempata):
 *  quem mais contribuiu pesa 3, a 2ª faixa pesa 2, o resto 1 — empatados ficam
 *  na MESMA faixa (não dividem por posição do sort). Na derrota todo mundo
 *  pesa igual (1). `nivelPorId` serve pro store decidir o desempate da sobra
 *  (número ímpar da divisão) a favor de quem tem MENOR nível. */
export function calcularPesosEParticipantes({ victory, report, match }) {
  const koIds = new Set(report.combatants.filter(c => c.side === 'player' && c.pv <= 0).map(c => c.id))
  const escaladosIds = match.playerTeam.map(member => member.id)
  // Personagem que CAIU na luta não ganha AP de participação na vitória —
  // mas continua escalado (aparece na tela com 0 + marca de KO).
  const participantIds = victory ? escaladosIds.filter(id => !koIds.has(id)) : escaladosIds

  const contrib = report.contribuicoes || {}
  const score = id => { const c = contrib[id] || { dano: 0, abates: 0 }; return (c.abates || 0) * 100000 + (c.dano || 0) }
  const faixas = [...new Set(participantIds.map(score))].sort((a, b) => b - a)
  const pesosPorId = {}
  participantIds.forEach(id => {
    if (!victory) { pesosPorId[id] = 1; return }
    if (faixas.length <= 1) { pesosPorId[id] = 1; return }
    const faixa = faixas.indexOf(score(id))
    pesosPorId[id] = faixa === 0 ? 3 : faixa === 1 ? 2 : 1
  })

  const nivelPorId = {}
  participantIds.forEach(id => {
    const m = match.playerTeam.find(x => x.id === id)
    nivelPorId[id] = getGanguesLevelFromXp(m?.xp_total ?? 0)
  })

  return { koIds, escaladosIds, participantIds, pesosPorId, nivelPorId }
}

/** Grana de vitória (pedido do Isaias, 19/09/2026: "o mínimo é 10, porque é o
 *  pagamento pra pelo menos um descanso... você ganha mais grana conforme o
 *  número de oponentes que você enfrenta, cada oponente novo vale mais 10...
 *  quando enfrentar o Carvão vai dar pelo menos 500 de grana, independente
 *  de como ele vier"). Substitui por completo a grana AUTORADA por POI que
 *  existia em `cenaRecompensa`/`viraTreta.recompensa` (ficava incoerente com
 *  o número de inimigos de verdade — ex: `rinha` sempre dava 4, mesmo
 *  virando dupla) — mesmo padrão de fórmula pura já usado em `calcularApTotal`.
 *  `ehChefe` cobre qualquer luta de chefe de território (`storyAlvo.isChefe`),
 *  não só o Carvão da Pista — hoje é o único chefe que passa por aqui (os
 *  outros 6 territórios ainda usam a trilha antiga), mas a régua já nasce
 *  genérica pra quando eles também ganharem chefe de verdade. */
const GANGUES_GRANA_POR_INIMIGO = 10
const GANGUES_GRANA_CHEFE_MINIMO = 500
export function calcularGranaTotal({ enemyCount = 1, ehChefe = false }) {
  const base = GANGUES_GRANA_POR_INIMIGO * Math.max(1, enemyCount)
  return ehChefe ? Math.max(GANGUES_GRANA_CHEFE_MINIMO, base) : base
}

/** Recompensa de rep/item da vitória, conforme o contexto (encontro aleatório
 *  de rua vs. POI programado da cena) — não toca no store, só soma os
 *  números pra quem chamar aplicar. Grana não é mais autorada por POI, ver
 *  `calcularGranaTotal`. */
export function calcularRecompensaCena({ emCena, storyAlvo, enemyCount = 1, ehChefe = false }) {
  let rep = 0
  const itens = []
  if (emCena && storyAlvo.evento) {
    const rec = storyAlvo.cenaRecompensa
    if (rec?.rep) rep += rec.rep
    if (rec?.item) itens.push({ id: rec.item, qtd: rec.qtd || 1 })
  } else if (emCena) {
    if (storyAlvo.repDelta) rep += storyAlvo.repDelta
    const rec = storyAlvo.cenaRecompensa
    if (rec) {
      if (rec.rep) rep += rec.rep
      if (rec.item) itens.push({ id: rec.item, qtd: rec.qtd || 1 })
    }
  }
  return { grana: calcularGranaTotal({ enemyCount, ehChefe }), rep, itens }
}
