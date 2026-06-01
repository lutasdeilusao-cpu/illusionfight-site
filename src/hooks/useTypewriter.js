import { useState, useEffect, useRef } from 'react'

const TYPE_SPEED = 45
const DELETE_SPEED = 25
const PAUSE_AFTER_TYPE = 25000
const CURSOR_AFTER_TYPE = 2000
const PAUSE_BEFORE_TYPE = 500

export function useTypewriter(text) {
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    const clear = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }

    const cursorOn = () => setShowCursor(true)
    const cursorOff = () => setShowCursor(false)

    const wait = (ms) => new Promise(resolve => {
      timerRef.current = setTimeout(resolve, ms)
    })

    const run = async () => {
      setDisplayText('')
      indexRef.current = 0
      cursorOn()
      await wait(PAUSE_BEFORE_TYPE)

      for (let i = 0; i <= text.length; i++) {
        setDisplayText(text.slice(0, i))
        await wait(TYPE_SPEED)
      }

      await wait(CURSOR_AFTER_TYPE)
      cursorOff()

      await wait(PAUSE_AFTER_TYPE)

      for (let i = text.length; i >= 0; i--) {
        setDisplayText(text.slice(0, i))
        await wait(DELETE_SPEED)
      }

      await wait(PAUSE_BEFORE_TYPE)
      run()
    }

    run()

    return clear
  }, [text])

  return { displayText, showCursor }
}
