import { useCallback, useEffect, useReducer, useRef } from 'react'
import {
  buscarSala,
  buscarSalaPublicaAtivaDoJogador,
  entrarFilaPublica,
  sairFilaPublica,
  subscribeToSala
} from '../../../hooks/useTopTrumpsMP'

const initialState = {
  phase: 'connecting',
  roomId: null,
  playerRole: null,
  opponentId: null,
  error: null
}

function reducer(state, event) {
  switch (event.type) {
    case 'SEARCHING':
      return { ...state, phase: 'searching', roomId: event.roomId, playerRole: event.playerRole, error: null }
    case 'MATCHED':
      return {
        ...state,
        phase: 'matched',
        roomId: event.roomId,
        playerRole: event.playerRole,
        opponentId: event.opponentId,
        error: null
      }
    case 'ERROR':
      return { ...state, phase: 'error', error: event.error }
    case 'CANCELLED':
      return initialState
    default:
      return state
  }
}

function normalizeMatchResult(result) {
  if (!result) return null
  if (typeof result === 'string') {
    try { return JSON.parse(result) } catch { return null }
  }
  return result
}

export default function useSharedLobbyMachine({ gameId, modeId, userId, onMatch }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const roomIdRef = useRef(null)
  const subscriptionRef = useRef(null)
  const pollRef = useRef(null)
  const startedRef = useRef(false)
  const matchedRef = useRef(false)
  const onMatchRef = useRef(onMatch)
  onMatchRef.current = onMatch

  const stopWatching = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = null
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe()
    subscriptionRef.current = null
  }, [])

  const processRoom = useCallback((room) => {
    if (!room || room.id !== roomIdRef.current || matchedRef.current) return
    const playerRole = room.jogador1_id === userId ? 'j1' : room.jogador2_id === userId ? 'j2' : null
    const opponentId = playerRole === 'j1' ? room.jogador2_id : room.jogador1_id
    console.log('[SHARED_LOBBY:SALA_CONFIRMADA]', {
      gameId,
      modeId,
      roomId: room.id,
      status: room.status,
      userId,
      playerRole,
      opponentId
    })
    if (!playerRole) {
      dispatch({ type: 'ERROR', error: 'player_not_in_room' })
      return
    }
    if (room.status === 'em_jogo' && room.jogador1_id && room.jogador2_id && room.jogador1_id !== room.jogador2_id) {
      matchedRef.current = true
      stopWatching()
      dispatch({ type: 'MATCHED', roomId: room.id, playerRole, opponentId })
      console.log('[SHARED_LOBBY:MATCH_REAL]', { gameId, modeId, roomId: room.id, jogador1: room.jogador1_id, jogador2: room.jogador2_id })
      onMatchRef.current?.(room.id)
      return
    }
    dispatch({ type: 'SEARCHING', roomId: room.id, playerRole })
  }, [gameId, modeId, stopWatching, userId])

  const watchRoom = useCallback((roomId) => {
    stopWatching()
    roomIdRef.current = roomId
    const reconcile = async () => {
      const canonicalRoom = await buscarSalaPublicaAtivaDoJogador(userId, modeId, roomIdRef.current)
      const room = canonicalRoom || await buscarSala(roomIdRef.current)
      if (room?.id && room.id !== roomIdRef.current) {
        console.log('[SHARED_LOBBY:SALA_RECONCILIADA]', {
          gameId,
          modeId,
          userId,
          previousRoomId: roomIdRef.current,
          canonicalRoomId: room.id
        })
        roomIdRef.current = room.id
      }
      processRoom(room)
    }
    subscriptionRef.current = subscribeToSala(roomId, payload => processRoom(payload.new), reconcile)
    pollRef.current = setInterval(reconcile, 2000)
    reconcile()
  }, [gameId, modeId, processRoom, stopWatching, userId])

  const joinQueue = useCallback(async () => {
    if (!userId || startedRef.current) return
    if (gameId !== 'toptrumps') {
      dispatch({ type: 'ERROR', error: 'unsupported_game' })
      return
    }
    startedRef.current = true
    matchedRef.current = false
    console.log('[SHARED_LOBBY:FILA_ENTRANDO]', { gameId, modeId, userId })
    try {
      const result = normalizeMatchResult(await entrarFilaPublica(userId, modeId, 5))
      const roomId = result?.salaId || result?.sala_id
      if (!roomId) throw new Error('queue_without_room')
      console.log('[SHARED_LOBBY:FILA_CANONICA]', { gameId, modeId, userId, roomId, result })
      watchRoom(roomId)
    } catch (error) {
      console.error('[SHARED_LOBBY:ERRO]', { gameId, modeId, userId, error })
      startedRef.current = false
      dispatch({ type: 'ERROR', error: error.message || 'queue_error' })
    }
  }, [gameId, modeId, userId, watchRoom])

  const cancel = useCallback(async () => {
    stopWatching()
    const roomId = roomIdRef.current
    roomIdRef.current = null
    startedRef.current = false
    matchedRef.current = false
    if (roomId) await sairFilaPublica(roomId, userId)
    console.log('[SHARED_LOBBY:FILA_CANCELADA]', { gameId, modeId, userId, roomId })
    dispatch({ type: 'CANCELLED' })
  }, [gameId, modeId, stopWatching, userId])

  useEffect(() => {
    joinQueue()
    return stopWatching
  }, [joinQueue, stopWatching])

  return { state, retry: joinQueue, cancel }
}
