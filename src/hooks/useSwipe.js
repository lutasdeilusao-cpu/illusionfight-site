import { useEffect } from 'react'

export function useSwipe(ref, onSwipe, { minDistance = 15 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let startX = 0, startY = 0
    const onStart = (e) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY }
    const onEnd = (e) => {
      const dx = e.changedTouches[0].clientX - startX
      const dy = e.changedTouches[0].clientY - startY
      const absDx = Math.abs(dx), absDy = Math.abs(dy)
      if (Math.max(absDx, absDy) < minDistance) return
      if (absDx > absDy) onSwipe(0, dx > 0 ? 1 : -1)
      else onSwipe(dy > 0 ? 1 : -1, 0)
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchend', onEnd) }
  }, [ref, onSwipe])
}
