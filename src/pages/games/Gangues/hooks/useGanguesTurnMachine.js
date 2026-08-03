import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildGanguesModifiers, resolveGanguesAction } from '../engine/ganguesCombatResolver.js'
import { getGanguesResources, normalizeGanguesLoadout } from '../data/ganguesLoadout.js'

const d6 = () => Math.floor(Math.random() * 6) + 1

function prepare(combatant, side, index) {
  const enemy = side === 'enemy'
  const normalized = enemy ? {
    ...combatant,
    attributes: combatant.stats || combatant.attributes || {},
    combat_path: combatant.preferred_mode === 'power' ? 'mistico' : combatant.preferred_mode === 'armed' ? 'defensor' : 'atacante',
  } : { ...combatant, ...normalizeGanguesLoadout(combatant) }
  const resources = enemy
    ? { pvMax: Number(combatant.pv_max) || 10, pmMax: Number(combatant.pm_max) || 0 }
    : getGanguesResources(normalized.combat_path, normalized.attributes?.R)
  return { ...normalized, key: `${side}-${index}-${combatant.id}`, side, statuses: [], pv: resources.pvMax, pm: resources.pmMax, pvMax: resources.pvMax, pmMax: resources.pmMax, actedThisRound: false }
}

/**
 * Rodada em duas fases: cada personagem vivo de um lado age uma vez, na ordem que o
 * controlador escolher. Na fase do jogador, o jogador escolhe qual dos seus membros
 * ataca e qual alvo — não existe mais um "ator atual" fixo definido por iniciativa.
 */
export default function useGanguesTurnMachine({ playerTeam = [], enemyTeam = [], onFinish, roll = d6 }) {
  const initial = useMemo(() => [
    ...playerTeam.map((member, index) => prepare(member, 'player', index)),
    ...enemyTeam.map((member, index) => prepare(member, 'enemy', index)),
  ], [])
  const [combatants, setCombatants] = useState(initial)
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState('select')
  const [pending, setPending] = useState(null)
  const [events, setEvents] = useState([])
  const aiQueued = useRef(false)

  const record = useCallback(event => setEvents(list => [...list, { ...event, id: `${Date.now()}-${Math.random()}` }]), [])

  const playerActors = combatants.filter(item => item.side === 'player' && item.pv > 0 && !item.actedThisRound)
  const enemyActors = combatants.filter(item => item.side === 'enemy' && item.pv > 0 && !item.actedThisRound)

  const advancePhaseOrRound = useCallback((next) => {
    const playersAlive = next.some(item => item.side === 'player' && item.pv > 0)
    const enemiesAlive = next.some(item => item.side === 'enemy' && item.pv > 0)
    if (!playersAlive || !enemiesAlive) { onFinish(enemiesAlive ? 'defeat' : 'victory'); return }

    if (next.some(item => item.side === 'player' && item.pv > 0 && !item.actedThisRound)) { setPhase('player'); return }
    if (next.some(item => item.side === 'enemy' && item.pv > 0 && !item.actedThisRound)) { setPhase('enemy'); return }

    setCombatants(next.map(item => ({ ...item, actedThisRound: false })))
    setRound(value => value + 1)
    setPhase('player')
  }, [onFinish])

  const queueAction = useCallback((actor, target, action) => {
    if (!actor || !target || pending) return false
    const result = resolveGanguesAction({
      attacker: actor,
      defender: target,
      action,
      rolls: { fa: roll() },
      activeModifiers: { attacker: buildGanguesModifiers(actor), defender: buildGanguesModifiers(target) },
    })
    setPending({ actorKey: actor.key, targetKey: target.key, side: actor.side, result })
    return true
  }, [pending, roll])

  const playerAction = useCallback((actorKey, targetKey) => {
    if (phase !== 'player') return false
    const actor = combatants.find(item => item.key === actorKey && item.side === 'player' && item.pv > 0 && !item.actedThisRound)
    const target = combatants.find(item => item.key === targetKey && item.side === 'enemy' && item.pv > 0)
    return queueAction(actor, target, { type: 'attack', mode: 'attack' })
  }, [phase, combatants, queueAction])

  const completePending = useCallback(() => {
    if (!pending) return
    const next = combatants.map(item => {
      if (item.key === pending.actorKey) return { ...item, statuses: pending.result.attackerStatuses, pm: Math.max(0, item.pm - pending.result.pmCost), actedThisRound: true }
      if (item.key === pending.targetKey) return { ...item, statuses: pending.result.defenderStatuses, pv: Math.max(0, item.pv - pending.result.damage) }
      return item
    })
    record({ type: 'attack', side: pending.side, actorKey: pending.actorKey, targetKey: pending.targetKey, result: pending.result, round })
    setCombatants(next)
    setPending(null)
    advancePhaseOrRound(next)
  }, [pending, combatants, advancePhaseOrRound, record, round])

  useEffect(() => {
    if (phase !== 'enemy' || pending || aiQueued.current) return
    const actor = enemyActors[0]
    if (!actor) return
    aiQueued.current = true
    const timer = setTimeout(() => {
      const targets = combatants.filter(item => item.side === 'player' && item.pv > 0).sort((a, b) => a.pv - b.pv)
      queueAction(actor, targets[0], { type: 'attack', mode: 'attack' })
      aiQueued.current = false
    }, 650)
    return () => { clearTimeout(timer); aiQueued.current = false }
  }, [phase, pending, enemyActors, combatants, queueAction])

  const entered = useRef(false)
  const enterCombat = useCallback(() => {
    if (entered.current) return
    entered.current = true
    setPhase('player')
    record({ type: 'battle_start' })
  }, [record])

  return {
    combatants, phase, round, pending, events,
    playerActors, enemyActors,
    enterCombat, playerAction, completePending,
  }
}
