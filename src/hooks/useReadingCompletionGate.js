import { useEffect, useRef } from 'react'

const NOT_ARMED = 'NOT_ARMED'
const ARMED = 'ARMED'
const COMPLETED = 'COMPLETED'

export function useReadingCompletionGate({ sentinelRef, contentKey, enabled, onComplete }) {
  const stateRef = useRef(NOT_ARMED)
  const hasDownwardMovementRef = useRef(false)
  const hasTriggeredRef = useRef(false)
  const lastScrollYRef = useRef(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    stateRef.current = NOT_ARMED
    hasDownwardMovementRef.current = false
    hasTriggeredRef.current = false
    lastScrollYRef.current = window.scrollY

    const sentinel = sentinelRef.current
    if (!enabled || !sentinel) return

    const onScroll = () => {
      const currentScrollY = window.scrollY
      if (stateRef.current === ARMED && currentScrollY > lastScrollYRef.current) {
        hasDownwardMovementRef.current = true
      }
      lastScrollYRef.current = currentScrollY
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (hasTriggeredRef.current) return

      if (!entry.isIntersecting) {
        if (stateRef.current === NOT_ARMED) stateRef.current = ARMED
        return
      }

      if (stateRef.current !== ARMED || !hasDownwardMovementRef.current) return

      stateRef.current = COMPLETED
      hasTriggeredRef.current = true
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      onCompleteRef.current()
    }, { threshold: 0.1 })

    window.addEventListener('scroll', onScroll, { passive: true })
    observer.observe(sentinel)

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [contentKey, enabled, sentinelRef])
}
