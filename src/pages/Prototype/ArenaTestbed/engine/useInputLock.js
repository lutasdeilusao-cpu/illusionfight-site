import { useState, useRef, useEffect } from 'react'

export default function useInputLock() {
  const [inputLocked, setInputLocked] = useState(false)
  const inputLockedRef = useRef(false)
  const unlockTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
    }
  }, [])

  function lockInput() {
    if (unlockTimerRef.current) {
      clearTimeout(unlockTimerRef.current)
      unlockTimerRef.current = null
    }
    inputLockedRef.current = true
    setInputLocked(true)
  }

  function unlockInput(delay = 0) {
    if (unlockTimerRef.current) {
      clearTimeout(unlockTimerRef.current)
      unlockTimerRef.current = null
    }
    if (delay > 0) {
      unlockTimerRef.current = setTimeout(() => {
        inputLockedRef.current = false
        setInputLocked(false)
        unlockTimerRef.current = null
      }, delay)
    } else {
      inputLockedRef.current = false
      setInputLocked(false)
    }
  }

  return { inputLocked, inputLockedRef, lockInput, unlockInput }
}
