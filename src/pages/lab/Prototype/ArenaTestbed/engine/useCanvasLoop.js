import { useEffect, useRef } from 'react'

export default function useCanvasLoop({ draw, calcVersion, onFrame }) {
  const rafRef = useRef(null)

  useEffect(() => {
    function loop() {
      if (onFrame) onFrame()
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw, calcVersion])
}
