import { useRef } from 'react'

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }) {
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(deltaX) < Math.abs(deltaY)) return
    if (deltaX < -threshold && onSwipeLeft) onSwipeLeft()
    if (deltaX > threshold && onSwipeRight) onSwipeRight()
    touchStartX.current = null
    touchStartY.current = null
  }

  return { onTouchStart, onTouchEnd }
}
