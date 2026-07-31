import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { supabase } from '../../../lib/supabase'

const initialState = {
  phase: 'connecting',
  connectionStatus: 'connecting',
  players: [],
  choices: {},
  roomId: null,
  result: null
}

function reducer(state, event) {
  switch (event.type) {
    case 'CHANNEL_STATUS':
      return { ...state, connectionStatus: event.status }
    case 'PRESENCE_SYNC': {
      const players = event.players.slice(0, 2)
      const isMatched = players.length === 2 && players.some(player => player.clientId === event.clientId)
      if (!isMatched) return { ...state, phase: 'searching', players, choices: {}, roomId: null, result: null }
      const choices = Object.fromEntries(players.filter(player => player.choice).map(player => [player.clientId, player.choice]))
      const bothChose = players.every(player => choices[player.clientId])
      const sum = bothChose ? players.reduce((total, player) => total + choices[player.clientId], 0) : null
      const winnerIndex = bothChose ? (sum % 2 === 0 ? 0 : 1) : null
      return {
        ...state,
        phase: bothChose ? 'result' : 'matched',
        players,
        choices,
        roomId: players.map(player => player.clientId.slice(0, 8)).sort().join('-'),
        result: bothChose ? { sum, parity: sum % 2 === 0 ? 'even' : 'odd', winnerId: players[winnerIndex].clientId } : null
      }
    }
    default:
      return state
  }
}

export default function useSharedLobbyMachine({ gameId, modeId, rulesVersion, user, displayName }) {
  const queueKey = `${gameId}:${modeId}:${rulesVersion}`
  const topic = useMemo(() => `shared-lobby-${queueKey.replace(/[^a-zA-Z0-9_-]/g, '-')}`, [queueKey])
  const clientIdRef = useRef(globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)
  const channelRef = useRef(null)
  const presenceRef = useRef(null)
  const [state, dispatch] = useReducer(reducer, initialState)

  const syncPresence = useCallback((channel) => {
    const players = Object.values(channel.presenceState())
      .flat()
      .filter(player => player?.clientId)
      .sort((a, b) => String(a.joinedAt).localeCompare(String(b.joinedAt)) || a.clientId.localeCompare(b.clientId))
    console.log('[MULTIPLAYER_LOBBY:PRESENCA]', { queueKey, clientId: clientIdRef.current, players })
    dispatch({ type: 'PRESENCE_SYNC', players, clientId: clientIdRef.current })
  }, [queueKey])

  useEffect(() => {
    const clientId = clientIdRef.current
    const presence = {
      clientId,
      userId: user?.id || null,
      displayName: displayName || clientId.slice(0, 8),
      choice: null,
      joinedAt: new Date().toISOString()
    }
    presenceRef.current = presence
    const channel = supabase.channel(topic, { config: { presence: { key: clientId } } })
    channelRef.current = channel
    channel.on('presence', { event: 'sync' }, () => syncPresence(channel))
    channel.subscribe(async (status) => {
      console.log('[MULTIPLAYER_LOBBY:CANAL]', { queueKey, topic, status, clientId })
      dispatch({ type: 'CHANNEL_STATUS', status: status.toLowerCase() })
      if (status === 'SUBSCRIBED') {
        await channel.track(presence)
        syncPresence(channel)
      }
    })
    return () => {
      channelRef.current = null
      channel.untrack()
      channel.unsubscribe()
    }
  }, [displayName, queueKey, syncPresence, topic, user?.id])

  const chooseNumber = useCallback(async (choice) => {
    if (!channelRef.current || !presenceRef.current || choice < 1 || choice > 5) return
    const nextPresence = { ...presenceRef.current, choice }
    presenceRef.current = nextPresence
    console.log('[MULTIPLAYER_LOBBY:ESCOLHA]', { queueKey, clientId: clientIdRef.current, choice })
    await channelRef.current.track(nextPresence)
  }, [queueKey])

  const resetRound = useCallback(async () => {
    if (!channelRef.current || !presenceRef.current) return
    const nextPresence = { ...presenceRef.current, choice: null }
    presenceRef.current = nextPresence
    console.log('[MULTIPLAYER_LOBBY:NOVA_RODADA]', { queueKey, clientId: clientIdRef.current })
    await channelRef.current.track(nextPresence)
  }, [queueKey])

  return { state, queueKey, clientId: clientIdRef.current, chooseNumber, resetRound }
}
