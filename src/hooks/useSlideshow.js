import { useState, useEffect, useRef } from 'react'

const DEFAULT_INTERVAL = 6000
const TRANSITION_DURATION = 1200

export function useSlideshow(images) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [enteringIndex, setEnteringIndex] = useState(null)
  const activeRef = useRef(0)
  const timerRef = useRef(null)
  const transitionRef = useRef(null)

  useEffect(() => {
    activeRef.current = activeIndex
  }, [activeIndex])

  useEffect(() => {
    const loaded = new Set()
    images.forEach((src, i) => {
      const img = new Image()
      img.onload = () => { loaded.add(i) }
      img.src = src
    })
  }, [images])

  useEffect(() => {
    const tick = () => {
      if (transitionRef.current) return
      const next = (activeRef.current + 1) % images.length
      setEnteringIndex(next)

      transitionRef.current = setTimeout(() => {
        setActiveIndex(next)
        setEnteringIndex(null)
        transitionRef.current = null
      }, TRANSITION_DURATION)
    }

    timerRef.current = setInterval(tick, DEFAULT_INTERVAL)
    return () => {
      clearInterval(timerRef.current)
      if (transitionRef.current) clearTimeout(transitionRef.current)
    }
  }, [images.length])

  const currentImage = images[activeIndex]
  const nextImage = enteringIndex !== null ? images[enteringIndex] : null

  return {
    currentImage,
    nextImage,
    activeIndex,
    enteringIndex,
    isTransitioning: enteringIndex !== null,
  }
}
