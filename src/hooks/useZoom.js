import { useState, useRef } from 'react'

export function useZoom({ min = 1, max = 3, hideDelay = 2000 } = {}) {
  const [zoom, setZoomState] = useState(min)
  const [controlsVisible, setControlsVisible] = useState(false)
  const timerRef = useRef(null)

  const showControls = () => {
    setControlsVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setControlsVisible(false), hideDelay)
  }

  const setZoom = (fn) => {
    setZoomState(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      return Math.max(min, Math.min(max, next))
    })
    showControls()
  }

  return { zoom, setZoom, controlsVisible, showControls }
}
