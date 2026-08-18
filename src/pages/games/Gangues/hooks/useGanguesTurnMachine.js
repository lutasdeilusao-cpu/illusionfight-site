import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { resolveGanguesAction, resolveGanguesInitiative } from '../engine/ganguesCombatResolver.js'
import { getGanguesResources, normalizeGanguesLoadout } from '../data/ganguesLoadout.js'

const d3 = () => Math.floor(Math.random() * 3) + 1
const coin = () => Math.random() < 0.5

// IA de alvo: evita bater sempre no mesmo alvo quando há outro vivo — alterna entre focar
// quem está com menos PV (foco) e escolher alguém aleatório entre os outros vivos.
function pickEnemyTarget(combatants, lastTargetKey, roll = Math.random) {
  const targets = combatants.filter(item => item.side === 'player' && item.pv > 0)
  if (targets.length <= 1) return targets[0] || null
  const others = targets.filter(item => item.key !== lastTargetKey)
  const pool = others.length ? others : targets
  if (roll() < 0.55) return [...pool].sort((a, b) => a.pv - b.pv)[0]
  return pool[Math.floor(roll() * pool.length)]
}

function prepare(combatant, side, index) {
  const enemy = side === 'enemy'
  const normalized = enemy ? { ...combatant, attributes: combatant.stats || combatant.attributes || {}, combat_path: combatant.preferred_mode === 'power' ? 'mistico' : combatant.preferred_mode === 'armed' ? 'defensor' : 'atacante' } : { ...combatant, ...normalizeGanguesLoadout(combatant) }
  const resources = enemy ? { pvMax: Number(combatant.pv_max) || 10, pmMax: Number(combatant.pm_max) || 0 } : getGanguesResources(normalized.combat_path, normalized.attributes?.R)
  return { ...normalized, key: `${side}-${index}-${combatant.id}`, side, statuses: [], pv: resources.pvMax, pm: resources.pmMax, pvMax: resources.pvMax, pmMax: resources.pmMax, actedThisRound: false, specialState: { charge: 0, shield: 0, totalPvLost: 0 } }
}

export default function useGanguesTurnMachine({ playerTeam = [], enemyTeam = [], onFinish, attackRoll = d3, defenseRoll = d3, initiativeRoll = d3, bonusRoll = coin, targetRoll = Math.random, enemyDelay = 2200 }) {
  const initial = useMemo(() => [...playerTeam.map((member, index) => prepare(member, 'player', index)), ...enemyTeam.map((member, index) => prepare(member, 'enemy', index))], [])
  const initiative = useMemo(() => initial.map(combatant => {
    const die = initiativeRoll()
    const resolved = resolveGanguesInitiative({ combatant, roll: die })
    return { key: combatant.key, side: combatant.side, ...resolved, tie: Math.random() }
  }).sort((a, b) => b.total - a.total || b.ability - a.ability || b.tie - a.tie), [])
  const [combatants, setCombatants] = useState(initial)
  const [round, setRound] = useState(1)
  const [turnIndex, setTurnIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const [pending, setPending] = useState(null)
  const [events, setEvents] = useState([])
  const aiQueued = useRef(false)
  const lastEnemyTargetKey = useRef(null)
  const entered = useRef(false)
  const currentTurn = initiative[turnIndex]
  const currentActor = combatants.find(item => item.key === currentTurn?.key)
  const phase = !started ? 'select' : pending ? 'rolling' : currentActor?.side || 'finished'
  const record = useCallback(event => setEvents(list => [...list, { ...event, id: `${Date.now()}-${Math.random()}` }]), [])

  const advanceTurn = useCallback(next => {
    const playersAlive = next.some(item => item.side === 'player' && item.pv > 0)
    const enemiesAlive = next.some(item => item.side === 'enemy' && item.pv > 0)
    if (!playersAlive || !enemiesAlive) { onFinish(enemiesAlive ? 'defeat' : 'victory'); return }
    let nextIndex = turnIndex
    do nextIndex = (nextIndex + 1) % initiative.length
    while ((next.find(item => item.key === initiative[nextIndex].key)?.pv || 0) <= 0)
    if (nextIndex <= turnIndex) {
      setRound(value => value + 1)
      setCombatants(next.map(item => ({ ...item, actedThisRound: false })))
    }
    setTurnIndex(nextIndex)
  }, [initiative, onFinish, turnIndex])

  const queueAction = useCallback((actor, target, activeSpecialId = null) => {
    if (!actor || !target || pending) return false
    const result = resolveGanguesAction({
      attacker: actor, defender: target, action: { type: 'attack', mode: 'attack' },
      rolls: { fa: attackRoll(), fd: defenseRoll(), attackerBonus: bonusRoll(), defenderBonus: bonusRoll() },
      activeSpecialId,
    })
    setPending({ actorKey: actor.key, targetKey: target.key, side: actor.side, result })
    return true
  }, [attackRoll, defenseRoll, bonusRoll, pending])

  const playerAction = useCallback((actorKey, targetKey, activeSpecialId = null) => {
    if (phase !== 'player' || currentActor?.key !== actorKey) return false
    const target = combatants.find(item => item.key === targetKey && item.side === 'enemy' && item.pv > 0)
    return queueAction(currentActor, target, activeSpecialId)
  }, [phase, currentActor, combatants, queueAction])

  const completePending = useCallback(() => {
    if (!pending) return
    const next = combatants.map(item => {
      if (item.key === pending.actorKey) return { ...item, statuses: pending.result.attackerStatuses, pm: Math.max(0, item.pm - pending.result.pmCost), pv: Math.max(0, item.pv - (pending.result.pvCost || 0)), specialState: pending.result.attackerSpecialState, actedThisRound: true }
      if (item.key === pending.targetKey) return { ...item, statuses: pending.result.defenderStatuses, pv: Math.max(0, item.pv - pending.result.damage), specialState: pending.result.defenderSpecialState }
      return item
    })
    record({ type: 'attack', side: pending.side, actorKey: pending.actorKey, targetKey: pending.targetKey, result: pending.result, round })
    setCombatants(next)
    setPending(null)
    advanceTurn(next)
  }, [pending, combatants, advanceTurn, record, round])

  useEffect(() => {
    if (phase !== 'enemy' || pending || aiQueued.current || !currentActor) return
    aiQueued.current = true
    const timer = setTimeout(() => {
      const target = pickEnemyTarget(combatants, lastEnemyTargetKey.current, targetRoll)
      lastEnemyTargetKey.current = target?.key || null
      queueAction(currentActor, target)
      aiQueued.current = false
    }, enemyDelay)
    return () => { clearTimeout(timer); aiQueued.current = false }
  }, [phase, pending, currentActor, combatants, queueAction, enemyDelay, targetRoll])

  const enterCombat = useCallback(() => {
    if (entered.current) return
    entered.current = true
    setStarted(true)
    record({ type: 'battle_start' })
    record({ type: 'initiative', order: initiative })
  }, [initiative, record])

  return { combatants, phase, round, pending, events, initiative, currentActor, playerActors: phase === 'player' && currentActor ? [currentActor] : [], enterCombat, playerAction, completePending }
}
