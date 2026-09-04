import { resolveGanguesAction, resolveGanguesInitiative } from './ganguesCombatResolver.js'
import { prepare, pickEnemyTarget } from '../hooks/useGanguesTurnMachine.js'

/* ══════════════════════════════════════════════════════════════
   BRIGA EM MULTIDÃO — resolve a luta inteira de uma vez, sem passar por
   cada golpe na tela. Usa exatamente as mesmas contas do combate normal
   (mesmo resolveGanguesAction, mesmo prepare/pickEnemyTarget da
   useGanguesTurnMachine) — só não pausa pra animação de cada ataque.

   Alvo: personagens do jogador sempre focam o inimigo com menos PV (limpa
   o bando mais rápido); inimigos usam a mesma IA de alvo do combate normal.
   Poderes: cada personagem do jogador usa o poder escolhido em
   `poderes[sheetId]` (ou ataque normal se null/sem PM/PV suficiente) em
   TODOS os turnos dele — é a versão "modo rápido" de "decide uma vez, a
   luta inteira usa essa escolha", coerente com a UI de escolher poder uma
   vez só antes da luta.
   ══════════════════════════════════════════════════════════════ */

const d3 = () => Math.floor(Math.random() * 3) + 1
const coin = () => Math.random() < 0.5
const MAX_TURNOS = 600 // válvula de segurança — nunca deveria bater nisso (PV só cai)

function podePagarCusto(actor, special) {
  if (!special) return true
  const cost = special.effect?.cost
  if (!cost) return true
  const value = cost.values[special.level - 1]
  if (cost.kind === 'pm') return (actor.pm || 0) >= value
  if (cost.kind === 'pv') return (actor.pv || 0) > 1
  return true
}

export function simularGanguesBrigaMultidao({ playerTeam, enemyTeam, poderesPorPersonagem = {}, especiaisPorPersonagem = {} }) {
  const combatants = [
    ...playerTeam.map((m, i) => prepare(m, 'player', i)),
    ...enemyTeam.map((m, i) => prepare(m, 'enemy', i)),
  ]
  const byKey = new Map(combatants.map(c => [c.key, c]))

  const initiative = combatants
    .map(c => {
      const resolved = resolveGanguesInitiative({ combatant: c, roll: d3() })
      return { key: c.key, side: c.side, ...resolved, tie: Math.random() }
    })
    .sort((a, b) => b.total - a.total || b.ability - a.ability || b.tie - a.tie)

  const events = [{ type: 'battle_start', id: 'bm-start' }, { type: 'initiative', id: 'bm-initiative', order: initiative }]
  let round = 1
  let turnIndex = 0
  let lastEnemyTargetKey = null
  let seq = 0

  for (let i = 0; i < MAX_TURNOS; i++) {
    const alive = [...byKey.values()]
    const playersAlive = alive.some(c => c.side === 'player' && c.pv > 0)
    const enemiesAlive = alive.some(c => c.side === 'enemy' && c.pv > 0)
    if (!playersAlive || !enemiesAlive) {
      return { outcome: enemiesAlive ? 'defeat' : 'victory', events, initiative, combatants: alive, rounds: round }
    }

    const turn = initiative[turnIndex]
    const actor = byKey.get(turn.key)
    if (!actor || actor.pv <= 0) {
      turnIndex = (turnIndex + 1) % initiative.length
      if (turnIndex === 0) { round += 1; for (const c of byKey.values()) c.actedThisRound = false }
      continue
    }

    let target = null
    let activeSpecialId = null
    if (actor.side === 'player') {
      // Foca sempre o inimigo mais perto de cair — é o jeito eficiente de
      // limpar um bando grande, e é o que o resumo final vai mostrar.
      target = alive.filter(c => c.side === 'enemy' && c.pv > 0).sort((a, b) => a.pv - b.pv)[0] || null
      const especiais = especiaisPorPersonagem[actor.id] || []
      const escolhaId = poderesPorPersonagem[actor.id] || null
      const especial = escolhaId ? especiais.find(s => s.id === escolhaId) : null
      activeSpecialId = especial && podePagarCusto(actor, especial) ? escolhaId : null
    } else {
      target = pickEnemyTarget(alive, lastEnemyTargetKey, Math.random)
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
    events.push({ type: 'attack', id: `bm-${seq}`, side: actor.side, actorKey: actor.key, targetKey: target.key, result, round })

    turnIndex = (turnIndex + 1) % initiative.length
    if (turnIndex === 0) { round += 1; for (const c of byKey.values()) c.actedThisRound = false }
  }

  // Válvula de segurança (não deveria disparar: PV só decresce, alguém cai antes de 600 turnos).
  const enemiesAlive = [...byKey.values()].some(c => c.side === 'enemy' && c.pv > 0)
  return { outcome: enemiesAlive ? 'defeat' : 'victory', events, initiative, combatants: [...byKey.values()], rounds: round }
}
