import { useState, useRef, useCallback, useEffect } from 'react'

const AI_DELAYS = {
  initial: 600,
  betweenCards: 400,
  afterEquip: 500,
  beforeShot: 600,
  beforePass: 400,
}

function diffState(before, after) {
  const actions = []
  if (!before || !after) return actions

  const aiIdx = 1
  const beforePl = before.players[aiIdx]
  const afterPl = after.players[aiIdx]

  const beforeField = beforePl.field.map(c => c && c.id)
  const afterField = afterPl.field.map(c => c && c.id)

  for (let i = 0; i < beforeField.length; i++) {
    if (!beforeField[i] && afterField[i]) {
      actions.push({ type: 'place', slotIdx: i, card: afterPl.field[i] })
    }
  }

  const drawCount = afterPl.hand.length - beforePl.hand.length
  if (drawCount > 0) {
    const drawn = afterPl.hand.slice(-drawCount)
    drawn.forEach(c => actions.push({ type: 'draw', card: c }))
  }

  const perigoDelta = (afterPl.perigo || 0) - (beforePl.perigo || 0)
  if (perigoDelta > 0) {
    actions.push({ type: 'perigo_up', delta: perigoDelta })
  }

  const cemBefore = before.cemetery.length
  const cemAfter = after.cemetery.length
  const cemDiff = cemAfter - cemBefore
  if (cemDiff > 0) {
    const newCards = after.cemetery.slice(-cemDiff)
    newCards.forEach(c => {
      if (c.type === 'eqp') actions.push({ type: 'equip_used', card: c })
    })
  }

  if (after.shotContext && !before.shotContext) {
    actions.push({ type: 'ai_shoot' })
  }

  if (after.currentPlayer !== before.currentPlayer && !after.shotContext) {
    actions.push({ type: 'pass' })
  }

  const deduped = []
  const seen = new Set()
  for (const a of actions) {
    const key = `${a.type}_${a.slotIdx ?? ''}_${a.card?.id ?? ''}`
    if (!seen.has(key)) { seen.add(key); deduped.push(a) }
  }

  return deduped
}

export function useAITurnPresenter(state) {
  const [presenting, setPresenting] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [actionQueue, setActionQueue] = useState([])
  const capturedRef = useRef(null)
  const armedRef = useRef(false)
  const timerRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => { mountedRef.current = false; if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const isAI = (state.mode === 'solo-easy' || state.mode === 'solo-medium') && state.currentPlayer === 1

  useEffect(() => {
    if (!isAI || state.gameOver) {
      armedRef.current = false
      return
    }
    if (!armedRef.current) {
      capturedRef.current = JSON.parse(JSON.stringify(state))
      armedRef.current = true
    }
  }, [isAI, state.gameOver, state.currentPlayer, state.round])

  useEffect(() => {
    if (!armedRef.current || !capturedRef.current || state.gameOver) return
    if (!isAI) return

    const before = capturedRef.current
    const after = state
    if (before.currentPlayer === after.currentPlayer && before.round === after.round && before.players[1].field === after.players[1].field) return

    armedRef.current = false
    const actions = diffState(before, after)
    if (actions.length === 0) return
    if (!mountedRef.current) return

    setActionQueue(actions)
    setPresenting(true)
    setCurrentStep(0)

    const delays = actions.map(a => {
      switch (a.type) {
        case 'draw': return AI_DELAYS.initial
        case 'place': return AI_DELAYS.betweenCards
        case 'equip_used': return AI_DELAYS.afterEquip
        case 'ai_shoot': return AI_DELAYS.beforeShot
        case 'pass': return AI_DELAYS.beforePass
        default: return 400
      }
    })

    let cancelled = false
    ;(async () => {
      for (let i = 0; i < actions.length; i++) {
        if (!mountedRef.current || cancelled) break
        await new Promise(r => { timerRef.current = setTimeout(r, delays[i]) })
        if (!mountedRef.current || cancelled) break
        if (i < actions.length - 1) setCurrentStep(i + 1)
      }
      if (mountedRef.current && !cancelled) {
        setPresenting(false)
        setCurrentStep(-1)
        setActionQueue([])
        capturedRef.current = null
      }
    })()

    return () => { cancelled = true }
  }, [state, isAI, state.gameOver])

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setPresenting(false)
    setCurrentStep(-1)
    setActionQueue([])
    capturedRef.current = null
    armedRef.current = false
  }, [])

  return { isPresenting: presenting, currentStep, actionQueue, cancel }
}
