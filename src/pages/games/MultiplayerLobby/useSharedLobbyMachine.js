import { useCallback, useEffect, useReducer, useRef } from 'react'

const initialState = {
  phase: 'idle',
  queueKey: null,
  roomId: null,
  opponentId: null
}

function reducer(state, event) {
  switch (event.type) {
    case 'CONFIGURE':
      return { ...initialState, queueKey: event.queueKey }
    case 'SEARCH':
      if (state.phase !== 'idle' || !state.queueKey) return state
      return { ...state, phase: 'searching' }
    case 'CANCEL':
      if (state.phase !== 'searching') return state
      return { ...state, phase: 'idle' }
    case 'MATCH_FOUND':
      if (state.phase !== 'searching' || event.queueKey !== state.queueKey) return state
      return { ...state, phase: 'match_ready', roomId: event.roomId, opponentId: event.opponentId }
    case 'RESET':
      return { ...initialState, queueKey: state.queueKey }
    default:
      return state
  }
}

export default function useSharedLobbyMachine({ gameId, modeId, rulesVersion }) {
  const queueKey = `${gameId}:${modeId}:${rulesVersion}`
  const [state, rawDispatch] = useReducer(reducer, { ...initialState, queueKey })
  const stateRef = useRef(state)

  useEffect(() => { stateRef.current = state }, [state])

  const dispatch = useCallback((event) => {
    const previous = stateRef.current
    const next = reducer(previous, event)
    console.log('[MULTIPLAYER_LOBBY:TRANSICAO]', {
      evento: event.type,
      faseAnterior: previous.phase,
      faseSeguinte: next.phase,
      queueKey: next.queueKey,
      aceita: next !== previous
    })
    if (next !== previous) {
      stateRef.current = next
      rawDispatch(event)
    }
  }, [])

  useEffect(() => {
    dispatch({ type: 'CONFIGURE', queueKey })
  }, [dispatch, queueKey])

  return { state, dispatch, queueKey }
}
