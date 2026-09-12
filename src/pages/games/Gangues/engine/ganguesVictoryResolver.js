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
export function calcularApTotal({ victory, enemyCount, cenaChefe, torre, torreAndar }) {
  if (!victory) return 1
  const apPorInimigo = 10
  const multiplicadorChefe = cenaChefe ? 5 : 1
  const multiplicadorTorre = torre ? 1 + Math.floor(torreAndar / 5) : 1
  return apPorInimigo * Math.max(1, enemyCount) * multiplicadorChefe * multiplicadorTorre
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

/** Recompensa de grana/rep/item da vitória, conforme o contexto (encontro
 *  aleatório de rua vs. POI programado da cena) — não toca no store, só
 *  soma os números pra quem chamar aplicar. */
export function calcularRecompensaCena({ emCena, storyAlvo }) {
  let grana = 0, rep = 0
  const itens = []
  if (emCena && storyAlvo.evento) {
    const rec = storyAlvo.cenaRecompensa
    if (rec?.grana) grana += rec.grana
    if (rec?.rep) rep += rec.rep
    if (rec?.item) itens.push({ id: rec.item, qtd: rec.qtd || 1 })
  } else if (emCena) {
    if (storyAlvo.repDelta) rep += storyAlvo.repDelta
    const rec = storyAlvo.cenaRecompensa
    if (rec) {
      if (rec.grana) grana += rec.grana
      if (rec.rep) rep += rec.rep
      if (rec.item) itens.push({ id: rec.item, qtd: rec.qtd || 1 })
    }
  }
  return { grana, rep, itens }
}
