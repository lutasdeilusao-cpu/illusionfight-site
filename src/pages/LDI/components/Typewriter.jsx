import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CURSOR_BLINK = 530

function isFala(text) {
  return text?.startsWith('"') || text?.includes('—')
}

export default function Typewriter({ paragraphs, speed = 30, pauseBetween = 300, onComplete, onSkip }) {
  const [displayedTexts, setDisplayedTexts] = useState([])
  const [currentPara, setCurrentPara] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const containerRef = useRef(null)

  const skip = useCallback(() => {
    if (done) return
    setSkipped(true)
    setDone(true)
    setDisplayedTexts(paragraphs)
    setCurrentPara(paragraphs.length)
    onSkip?.()
    if (onComplete) setTimeout(onComplete, 100)
  }, [done, paragraphs, onSkip, onComplete])

  useEffect(() => {
    setDisplayedTexts([])
    setCurrentPara(0)
    setCharIndex(0)
    setDone(false)
    setSkipped(false)
  }, [paragraphs])

  useEffect(() => {
    if (skipped || !paragraphs || paragraphs.length === 0) return
    if (currentPara >= paragraphs.length) {
      setDone(true)
      onComplete?.()
      return
    }

    const text = paragraphs[currentPara]
    if (!text) {
      setCurrentPara(p => p + 1)
      return
    }

    if (charIndex < text.length) {
      const timer = setTimeout(() => {
        setCharIndex(i => i + 1)
        setDisplayedTexts(prev => {
          const copy = [...prev]
          if (copy.length <= currentPara) {
            copy.push(text.slice(0, charIndex + 1))
          } else {
            copy[currentPara] = text.slice(0, charIndex + 1)
          }
          return copy
        })
      }, speed)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setCurrentPara(p => p + 1)
        setCharIndex(0)
      }, pauseBetween)
      return () => clearTimeout(timer)
    }
  }, [currentPara, charIndex, paragraphs, speed, pauseBetween, skipped, onComplete])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!done) skip()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [done, skip])

  const isTypingLastPara = currentPara === paragraphs.length - 1 || currentPara === paragraphs.length
  const showCursor = !done && isTypingLastPara

  return (
    <div className="ldi-typewriter" ref={containerRef} onClick={skip}>
      {paragraphs.map((para, i) => (
        <p key={i} className={`ldi-typewriter-para ${isFala(para) ? 'ldi-text-fala' : 'ldi-text-narrativa'}`} style={{ opacity: i <= currentPara ? 1 : 0.2 }}>
          {displayedTexts[i] || ''}
          {showCursor && i === displayedTexts.length - 1 && (
            <motion.span
              className="ldi-typewriter-cursor"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.53, repeat: Infinity, repeatType: 'reverse' }}
            >█</motion.span>
          )}
        </p>
      ))}
      {done && (
        <motion.span
          className="ldi-typewriter-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1] }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >[ Clique ou Enter para continuar ]</motion.span>
      )}
    </div>
  )
}
