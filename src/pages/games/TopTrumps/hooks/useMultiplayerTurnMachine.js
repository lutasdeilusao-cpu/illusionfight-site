import { useCallback, useEffect, useReducer, useRef } from 'react'

export const RESULT_DURATION_MS = 30000

const initialState = {
  phase: 'carregando',
  result: null,
  resultStartedAt: null,
  resultRemaining: 30,
  localReady: false,
  opponentReady: false,
  advanceRequested: false
}

function reduce(state, event) {
  switch (event.type) {
    case 'ENTER_PPT':
      if (state.phase !== 'carregando' && state.phase !== 'ppt') return state
      return { ...initialState, phase: 'ppt' }
    case 'ENTER_PLAYING':
      if (!['carregando', 'ppt', 'revelacao'].includes(state.phase)) return state
      if (state.phase === 'revelacao' && !event.authorized) return state
      return { ...initialState, phase: 'jogando' }
    case 'START_RESULT':
      if (state.phase !== 'jogando' || !event.result?.turn) return state
      return {
        ...state,
        phase: 'revelacao',
        result: event.result,
        resultStartedAt: event.now,
        resultRemaining: 30,
        localReady: false,
        opponentReady: false,
        advanceRequested: false
      }
    case 'RESULT_TICK':
      if (state.phase !== 'revelacao') return state
      return { ...state, resultRemaining: event.remaining }
    case 'LOCAL_READY':
      if (state.phase !== 'revelacao') return state
      return { ...state, localReady: true }
    case 'PRESENCE_READY':
      if (state.phase !== 'revelacao' || Number(event.turn) !== Number(state.result?.turn)) return state
      return { ...state, localReady: event.localReady, opponentReady: event.opponentReady }
    case 'REQUEST_ADVANCE':
      if (state.phase !== 'revelacao') return state
      if (state.resultRemaining > 0 && !(state.localReady && state.opponentReady)) return state
      return { ...state, advanceRequested: true }
    case 'FINAL_RESULT_READY':
      if (state.phase !== 'revelacao' || Number(event.turn) !== Number(state.result?.turn)) return state
      return { ...state, advanceRequested: true }
    case 'ADVANCE_APPLIED':
      if (state.phase !== 'revelacao' || !state.advanceRequested) return state
      return { ...initialState, phase: event.finished ? 'fim' : 'jogando' }
    case 'FINISH_MATCH':
      return { ...state, phase: 'fim' }
    default:
      return state
  }
}

export default function useMultiplayerTurnMachine({ salaId, log }) {
  const [state, rawDispatch] = useReducer(reduce, initialState)
  const stateRef = useRef(state)

  useEffect(() => { stateRef.current = state }, [state])

  const dispatch = useCallback((event) => {
    const previous = stateRef.current
    const next = reduce(previous, event)
    log('MAQUINA_TRANSICAO', {
      salaId,
      evento: event.type,
      faseAnterior: previous.phase,
      faseSeguinte: next.phase,
      turnoResultado: next.result?.turn || previous.result?.turn || null,
      aceita: next !== previous,
      restante: next.resultRemaining
    })
    if (next !== previous) {
      stateRef.current = next
      rawDispatch(event)
    }
    return next !== previous
  }, [log, salaId])

  useEffect(() => {
    if (state.phase !== 'revelacao' || !state.resultStartedAt) return
    const tick = () => {
      const elapsed = Date.now() - state.resultStartedAt
      const remaining = Math.max(0, Math.ceil((RESULT_DURATION_MS - elapsed) / 1000))
      dispatch({ type: 'RESULT_TICK', remaining })
      log('MAQUINA_RESULTADO_TICK', {
        salaId,
        turno: state.result?.turn,
        restante: remaining,
        decorridoMs: elapsed
      })
      if (remaining === 0) dispatch({ type: 'REQUEST_ADVANCE', reason: 'tempo-esgotado' })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [dispatch, log, salaId, state.phase, state.result?.turn, state.resultStartedAt])

  return { state, stateRef, dispatch }
}
