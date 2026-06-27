import { useRef } from 'react'

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }) {
  const startX = useRef(null)
  const startY = useRef(null)

  function onPointerDown(e) {
    startX.current = e.clientX
    startY.current = e.clientY
  }

  function onPointerUp(e) {
    if (startX.current === null) return
    const deltaX = e.clientX - startX.current
    const deltaY = e.clientY - startY.current
    if (Math.abs(deltaX) < Math.abs(deltaY)) return
    if (deltaX < -threshold && onSwipeLeft) onSwipeLeft()
    if (deltaX > threshold && onSwipeRight) onSwipeRight()
    startX.current = null
    startY.current = null
  }

  return { onPointerDown, onPointerUp }
}
