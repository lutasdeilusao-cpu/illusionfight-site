import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildArenaModifiers,
  chooseArenaEnemyAction,
  resolveArenaAction,
  resolveArenaInitiative,
  resolveArenaRoundClose,
} from '../engine/arenaCombatResolver.js'
import { getArenaResources, normalizeArenaLoadout } from '../data/arenaLoadout.js'

const d6 = () => Math.floor(Math.random() * 6) + 1

function makePlayer(sheet) {
  return { ...sheet, ...normalizeArenaLoadout(sheet), statuses: [] }
}

function makeEnemy(enemy = {}) {
  return {
    ...enemy,
    attributes: enemy.stats || {},
    combat_path: enemy.preferred_mode === 'power' ? 'mistico' : enemy.preferred_mode === 'armed' ? 'defensor' : 'atacante',
    statuses: [], loadout_version: 2,
  }
}

export default function useArenaTurnMachine({ sheet, enemy, onFinish, roll = d6 }) {
  const [player, setPlayer] = useState(() => makePlayer(sheet))
  const [opponent, setOpponent] = useState(() => makeEnemy(enemy || {}))
  const playerResources = getArenaResources(sheet.combat_path, sheet.attributes?.R)
  const playerMaxPv = playerResources.pvMax
  const playerMaxPm = playerResources.pmMax
  const enemyMaxPv = Number(enemy?.pv_max) || 10
  const [playerPv, setPlayerPv] = useState(playerMaxPv)
  const [playerPm, setPlayerPm] = useState(playerMaxPm)
  const [enemyPv, setEnemyPv] = useState(enemyMaxPv)
  const [phase, setPhase] = useState('select')
  const [round, setRound] = useState(1)
  const [turnIndex, setTurnIndex] = useState(0)
  const [pending, setPending] = useState(null)
  const [events, setEvents] = useState([])
  const [aiState, setAiState] = useState({ lastAttackHit: false, charged: false })
  const enemyQueuedRef = useRef(false)

  const initiative = useMemo(() => {
    const p = resolveArenaInitiative({ combatant: player, roll: roll(), modifiers: buildArenaModifiers(player) })
    const e = resolveArenaInitiative({ combatant: opponent, roll: roll(), modifiers: buildArenaModifiers(opponent) })
    return { player: p, enemy: e, order: e.value > p.value ? ['enemy', 'player'] : ['player', 'enemy'] }
  }, [])

  const record = useCallback((event) => setEvents(current => [...current, { ...event, id: Date.now() + Math.random() }]), [])

  const closeRound = useCallback((nextPlayer = player, nextEnemy = opponent, nextPlayerPv = playerPv, nextEnemyPv = enemyPv) => {
    const playerClose = resolveArenaRoundClose({ combatant: nextPlayer, pv: nextPlayerPv, pvMax: playerMaxPv })
    const enemyClose = resolveArenaRoundClose({ combatant: nextEnemy, pv: nextEnemyPv, pvMax: enemyMaxPv })
    if (playerClose.heal || enemyClose.heal) record({ type: 'round_close', playerHeal: playerClose.heal, enemyHeal: enemyClose.heal, round })
    setPlayerPv(playerClose.pv)
    setEnemyPv(enemyClose.pv)
    setRound(value => value + 1)
  }, [player, opponent, playerPv, enemyPv, playerMaxPv, enemyMaxPv, record, round])

  const advanceTurn = useCallback((nextState = {}) => {
    const atRoundEnd = turnIndex === initiative.order.length - 1
    if (atRoundEnd) {
      closeRound(nextState.player, nextState.opponent, nextState.playerPv, nextState.enemyPv)
      setTurnIndex(0)
      setPhase(initiative.order[0])
    } else {
      setTurnIndex(value => value + 1)
      setPhase(initiative.order[turnIndex + 1])
    }
  }, [turnIndex, initiative.order, closeRound])

  const resolveForSide = useCallback((side, action, aiModifier = null) => {
    const attacker = side === 'player' ? player : opponent
    const defender = side === 'player' ? opponent : player
    const result = resolveArenaAction({
      attacker, defender, action,
      rolls: { fa: roll(), fd: roll() },
      activeModifiers: {
        attacker: buildArenaModifiers(attacker, { aiModifier }),
        defender: buildArenaModifiers(defender),
      },
    })

    if (result.skipped) {
      const updated = { ...attacker, statuses: result.attackerStatuses }
      if (side === 'player') setPlayer(updated)
      else {
        setOpponent(updated)
        if (action.type === 'charge') setAiState(state => ({ ...state, charged: true }))
      }
      record({ type: 'action', side, result, round })
      advanceTurn(side === 'player' ? { player: updated } : { opponent: updated })
      return
    }
    setPending({ side, result, round })
  }, [player, opponent, roll, record, round, advanceTurn])

  const playerAction = useCallback((action) => {
    if (phase !== 'player' || pending) return false
    const anticipatedCost = action.powerCost || 0
    if (playerPm < anticipatedCost) return false
    resolveForSide('player', action)
    return true
  }, [phase, pending, playerPm, resolveForSide])

  const completePending = useCallback(() => {
    if (!pending) return
    const { side, result } = pending
    setPending(null)
    if (side === 'player') {
      const nextEnemyPv = Math.max(0, enemyPv - result.damage)
      const nextPlayerPv = Math.max(0, playerPv - result.counterDamage)
      const nextPlayer = { ...player, statuses: result.attackerStatuses }
      const nextEnemy = { ...opponent, statuses: result.defenderStatuses }
      setPlayer(nextPlayer); setOpponent(nextEnemy)
      setPlayerPm(value => Math.max(0, value - result.pmCost))
      setEnemyPv(nextEnemyPv); setPlayerPv(nextPlayerPv)
      record({ type: 'attack', side, result, playerPv: nextPlayerPv, enemyPv: nextEnemyPv, round })
      if (nextEnemyPv <= 0) { setPhase('finished'); onFinish('victory'); return }
      if (nextPlayerPv <= 0) { setPhase('finished'); onFinish('defeat'); return }
      advanceTurn({ player: nextPlayer, opponent: nextEnemy, playerPv: nextPlayerPv, enemyPv: nextEnemyPv })
    } else {
      const nextPlayerPv = Math.max(0, playerPv - result.damage)
      const nextEnemyPv = Math.max(0, enemyPv - result.counterDamage)
      const nextEnemy = { ...opponent, statuses: result.attackerStatuses }
      const nextPlayer = { ...player, statuses: result.defenderStatuses }
      setOpponent(nextEnemy); setPlayer(nextPlayer)
      setPlayerPv(nextPlayerPv); setEnemyPv(nextEnemyPv)
      setAiState(state => ({ ...state, lastAttackHit: result.damage > 0, charged: false }))
      record({ type: 'attack', side, result, playerPv: nextPlayerPv, enemyPv: nextEnemyPv, round })
      if (nextPlayerPv <= 0) { setPhase('finished'); onFinish('defeat'); return }
      if (nextEnemyPv <= 0) { setPhase('finished'); onFinish('victory'); return }
      advanceTurn({ player: nextPlayer, opponent: nextEnemy, playerPv: nextPlayerPv, enemyPv: nextEnemyPv })
    }
  }, [pending, player, opponent, playerPv, enemyPv, record, round, advanceTurn, onFinish])

  useEffect(() => {
    if (phase !== 'enemy' || pending || enemyQueuedRef.current) return
    enemyQueuedRef.current = true
    const timer = setTimeout(() => {
      const action = chooseArenaEnemyAction(enemy, aiState)
      enemyQueuedRef.current = false
      resolveForSide('enemy', action, action.aiModifier)
    }, 650)
    return () => { clearTimeout(timer); enemyQueuedRef.current = false }
  }, [phase, pending, enemy, aiState, resolveForSide])

  const enterCombat = useCallback(() => {
    if (phase !== 'select') return
    setTurnIndex(0)
    setPhase(initiative.order[0])
    record({ type: 'initiative', initiative })
  }, [phase, initiative, record])

  return {
    player, opponent, playerPv, playerPm, enemyPv,
    playerMaxPv, playerMaxPm, enemyMaxPv,
    phase, round, pending, events, initiative,
    enterCombat, playerAction, completePending,
  }
}
