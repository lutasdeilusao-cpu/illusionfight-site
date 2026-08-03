import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildArenaModifiers, resolveArenaAction, resolveArenaInitiative } from '../engine/arenaCombatResolver.js'
import { getArenaResources, normalizeArenaLoadout } from '../data/arenaLoadout.js'

const d6 = () => Math.floor(Math.random() * 6) + 1

function prepare(combatant, side, index) {
  const enemy = side === 'enemy'
  const normalized = enemy ? {
    ...combatant,
    attributes: combatant.stats || combatant.attributes || {},
    combat_path: combatant.preferred_mode === 'power' ? 'mistico' : combatant.preferred_mode === 'armed' ? 'defensor' : 'atacante',
  } : { ...combatant, ...normalizeArenaLoadout(combatant) }
  const resources = enemy
    ? { pvMax: Number(combatant.pv_max) || 10, pmMax: Number(combatant.pm_max) || 0 }
    : getArenaResources(normalized.combat_path, normalized.attributes?.R)
  return { ...normalized, key: `${side}-${index}-${combatant.id}`, side, statuses: [], pv: resources.pvMax, pm: resources.pmMax, pvMax: resources.pvMax, pmMax: resources.pmMax }
}

export default function useArenaTurnMachine({ playerTeam = [], enemyTeam = [], onFinish, roll = d6 }) {
  const initial = useMemo(() => [
    ...playerTeam.map((member, index) => prepare(member, 'player', index)),
    ...enemyTeam.map((member, index) => prepare(member, 'enemy', index)),
  ], [])
  const [combatants, setCombatants] = useState(initial)
  const [turnIndex, setTurnIndex] = useState(0)
  const [round, setRound] = useState(1)
  const [pending, setPending] = useState(null)
  const [events, setEvents] = useState([])
  const [started, setStarted] = useState(false)
  const aiQueued = useRef(false)

  const initiative = useMemo(() => initial.map(combatant => ({
    key: combatant.key,
    side: combatant.side,
    value: resolveArenaInitiative({ combatant, roll: roll(), modifiers: buildArenaModifiers(combatant) }).value,
  })).sort((a, b) => b.value - a.value), [])

  const currentTurn = initiative[turnIndex]
  const currentActor = combatants.find(item => item.key === currentTurn?.key)
  const phase = !started ? 'select' : pending ? 'rolling' : currentActor?.side || 'finished'
  const record = useCallback(event => setEvents(list => [...list, { ...event, id: `${Date.now()}-${Math.random()}` }]), [])

  const finishOrAdvance = useCallback((next) => {
    const playersAlive = next.some(item => item.side === 'player' && item.pv > 0)
    const enemiesAlive = next.some(item => item.side === 'enemy' && item.pv > 0)
    if (!playersAlive || !enemiesAlive) { onFinish(enemiesAlive ? 'defeat' : 'victory'); return }
    let nextIndex = turnIndex
    do nextIndex = (nextIndex + 1) % initiative.length
    while ((next.find(item => item.key === initiative[nextIndex].key)?.pv || 0) <= 0)
    if (nextIndex <= turnIndex) setRound(value => value + 1)
    setTurnIndex(nextIndex)
  }, [initiative, onFinish, turnIndex])

  const queueAction = useCallback((actor, target, action) => {
    if (!actor || !target || pending) return false
    const result = resolveArenaAction({
      attacker: actor,
      defender: target,
      action,
      rolls: { fa: roll(), fd: roll() },
      activeModifiers: { attacker: buildArenaModifiers(actor, { aiModifier: action.aiModifier }), defender: buildArenaModifiers(target) },
    })
    setPending({ actorKey: actor.key, targetKey: target.key, side: actor.side, result })
    return true
  }, [pending, roll])

  const playerAction = useCallback((targetKey) => {
    if (phase !== 'player') return false
    return queueAction(currentActor, combatants.find(item => item.key === targetKey && item.pv > 0), { type: 'attack', mode: 'attack' })
  }, [phase, currentActor, combatants, queueAction])

  const completePending = useCallback(() => {
    if (!pending) return
    const next = combatants.map(item => {
      if (item.key === pending.actorKey) return { ...item, statuses: pending.result.attackerStatuses, pm: Math.max(0, item.pm - pending.result.pmCost) }
      if (item.key === pending.targetKey) return { ...item, statuses: pending.result.defenderStatuses, pv: Math.max(0, item.pv - pending.result.damage) }
      return item
    })
    record({ type: 'attack', side: pending.side, actorKey: pending.actorKey, targetKey: pending.targetKey, result: pending.result, round })
    setCombatants(next)
    setPending(null)
    finishOrAdvance(next)
  }, [pending, combatants, finishOrAdvance, record, round])

  useEffect(() => {
    if (phase !== 'enemy' || aiQueued.current) return
    aiQueued.current = true
    const timer = setTimeout(() => {
      const targets = combatants.filter(item => item.side === 'player' && item.pv > 0).sort((a, b) => a.pv - b.pv)
      queueAction(currentActor, targets[0], { type: 'attack', mode: 'attack' })
      aiQueued.current = false
    }, 650)
    return () => { clearTimeout(timer); aiQueued.current = false }
  }, [phase, currentActor, combatants, queueAction])

  const enterCombat = useCallback(() => { setStarted(true); record({ type: 'initiative', initiative }) }, [initiative, record])
  return { combatants, currentActor, phase, round, pending, events, initiative, enterCombat, playerAction, completePending }
}
