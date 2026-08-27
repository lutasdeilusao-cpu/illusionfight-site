import { useEffect, useRef, useState } from 'react'
export default function DeferredSection({ children, size = 'medium' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible) return undefined
    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setVisible(true)
      observer.disconnect()
    }, { rootMargin: '300px 0px' })

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [visible])

  return (
    <div ref={ref} className={`deferred-section deferred-section--${size}`}>
      {visible ? children : null}
    </div>
  )
}
