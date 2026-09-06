import { resolveGanguesAction, resolveGanguesInitiative } from './ganguesCombatResolver.js'
import { prepare, pickEnemyTarget } from '../hooks/useGanguesTurnMachine.js'

/* ══════════════════════════════════════════════════════════════
   BRIGA EM MULTIDÃO — RODADA a rodada, não a luta inteira de um clique.

   O jogo é por turno: cada clique em "avançar rodada" resolve UMA rodada
   completa (todo mundo vivo age uma vez, na ordem de iniciativa — jogador
   focando o inimigo mais fraco, inimigo com a IA de sempre) e PARA. O
   jogador vê o resultado daquela rodada e decide se continua. Só o alvo
   automático (em vez de escolher manualmente) e o dano em lote (em vez de
   um DramaticDice por golpe) são "rápidos" — o ritmo de jogo (uma decisão
   por rodada) continua igual ao combate normal.

   Usa exatamente as mesmas contas do combate normal (mesmo
   resolveGanguesAction, mesmo prepare/pickEnemyTarget da
   useGanguesTurnMachine).
   ══════════════════════════════════════════════════════════════ */

const d3 = () => Math.floor(Math.random() * 3) + 1
const coin = () => Math.random() < 0.5

function podePagarCusto(actor, special) {
  if (!special) return true
  const cost = special.effect?.cost
  if (!cost) return true
  const value = cost.values[special.level - 1]
  if (cost.kind === 'pm') return (actor.pm || 0) >= value
  if (cost.kind === 'pv') return (actor.pv || 0) > 1
  return true
}

/** Monta o estado inicial da briga (times preparados + iniciativa sorteada). Nenhuma rodada resolvida ainda. */
export function iniciarBrigaMultidao({ playerTeam, enemyTeam }) {
  const combatants = [
    ...playerTeam.map((m, i) => prepare(m, 'player', i)),
    ...enemyTeam.map((m, i) => prepare(m, 'enemy', i)),
  ]
  const initiative = combatants
    .map(c => {
      const resolved = resolveGanguesInitiative({ combatant: c, roll: d3() })
      return { key: c.key, side: c.side, ...resolved, tie: Math.random() }
    })
    .sort((a, b) => b.total - a.total || b.ability - a.ability || b.tie - a.tie)

  return {
    combatants, initiative, turnIndex: 0, round: 1, lastEnemyTargetKey: null,
    terminado: false, outcome: null,
    eventosIniciais: [{ type: 'battle_start', id: 'bm-start' }, { type: 'initiative', id: 'bm-initiative', order: initiative }],
    seq: 0,
  }
}

/** Resolve UMA rodada a partir do estado atual — todo combatente vivo age uma vez. Retorna o novo estado + os eventos só dessa rodada.
 *  poderesPorPersonagem/especiaisPorPersonagem são lidos a cada chamada (não travados na iniciação) — o jogador pode trocar o poder escolhido entre uma rodada e outra.
 *  personagensUsandoItem: { [memberId]: true } — quem marcou "usar item" abre mão do ataque nesta rodada (a ação vira usar item, não bater). Ainda não existe
 *  sistema de item de verdade (sem catálogo/inventário) — isso só reserva o comportamento de "gastar a ação" pra quando existir. */
export function avancarRodadaMultidao(estado, poderesPorPersonagem = {}, especiaisPorPersonagem = {}, personagensUsandoItem = {}) {
  const byKey = new Map(estado.combatants.map(c => [c.key, { ...c }]))
  const { initiative } = estado
  let { turnIndex, round, lastEnemyTargetKey, seq } = estado
  const eventosRodada = []

  const checarFim = () => {
    const alive = [...byKey.values()]
    const playersAlive = alive.some(c => c.side === 'player' && c.pv > 0)
    const enemiesAlive = alive.some(c => c.side === 'enemy' && c.pv > 0)
    if (playersAlive && enemiesAlive) return null
    return enemiesAlive ? 'defeat' : 'victory'
  }

  let outcome = checarFim()
  const rodadaAlvo = round // para assim que essa rodada fechar (turnIndex voltar a 0) ou a luta acabar

  while (!outcome) {
    const turn = initiative[turnIndex]
    const actor = byKey.get(turn.key)
    if (!actor || actor.pv <= 0) {
      turnIndex = (turnIndex + 1) % initiative.length
      if (turnIndex === 0) { round += 1; break }
      continue
    }

    // Usar item ABRE MÃO do ataque nesta rodada — o personagem ainda consome
    // seu turno na ordem de iniciativa, só que sem bater em ninguém.
    if (actor.side === 'player' && personagensUsandoItem[actor.id]) {
      actor.actedThisRound = true
      seq += 1
      eventosRodada.push({ type: 'item', id: `bm-${seq}`, actorKey: actor.key, round: rodadaAlvo })
      turnIndex = (turnIndex + 1) % initiative.length
      outcome = checarFim()
      if (turnIndex === 0 && !outcome) { round += 1; break }
      continue
    }

    let target = null
    let activeSpecialId = null
    if (actor.side === 'player') {
      // Foca sempre o inimigo mais perto de cair — eficiente pra limpar um bando grande.
      target = [...byKey.values()].filter(c => c.side === 'enemy' && c.pv > 0).sort((a, b) => a.pv - b.pv)[0] || null
      const especiais = especiaisPorPersonagem[actor.id] || []
      const escolhaId = poderesPorPersonagem[actor.id] || null
      const especial = escolhaId ? especiais.find(s => s.id === escolhaId) : null
      activeSpecialId = especial && podePagarCusto(actor, especial) ? escolhaId : null
    } else {
      target = pickEnemyTarget([...byKey.values()], lastEnemyTargetKey, Math.random)
      lastEnemyTargetKey = target?.key || null
    }
    if (!target) { turnIndex = (turnIndex + 1) % initiative.length; continue }

    const result = resolveGanguesAction({
      attacker: actor, defender: target, action: { type: 'attack', mode: 'attack' },
      rolls: { fa: d3(), fd: d3(), attackerBonus: coin(), defenderBonus: coin() },
      activeSpecialId,
    })

    actor.statuses = result.attackerStatuses
    actor.pm = Math.max(0, actor.pm - result.pmCost)
    actor.pv = Math.max(0, actor.pv - (result.pvCost || 0))
    actor.specialState = result.attackerSpecialState
    actor.actedThisRound = true
    target.statuses = result.defenderStatuses
    target.pv = Math.max(0, target.pv - result.damage)
    target.specialState = result.defenderSpecialState

    seq += 1
    eventosRodada.push({ type: 'attack', id: `bm-${seq}`, side: actor.side, actorKey: actor.key, targetKey: target.key, result, round: rodadaAlvo })

    turnIndex = (turnIndex + 1) % initiative.length
    outcome = checarFim()
    if (turnIndex === 0 && !outcome) { round += 1; break }
  }

  const combatantsFinais = [...byKey.values()]
  if (!outcome) outcome = checarFim()

  return {
    combatants: combatantsFinais, initiative, turnIndex, round, lastEnemyTargetKey, seq,
    terminado: Boolean(outcome), outcome: outcome || null,
    eventosRodada,
  }
}
