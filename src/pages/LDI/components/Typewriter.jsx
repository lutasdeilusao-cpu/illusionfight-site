import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CURSOR_BLINK = 530

const PERSONAGEM_STYLE = {
  'NeoGuide': { cor: '#00B4D8', fonte: 'Share Tech Mono' },
  'Kaeda': { cor: '#FF6B6B', fonte: 'Rajdhani' },
  'Voz': { cor: '#A855F4', fonte: 'JetBrains Mono' },
  'StormByte_91': { cor: '#F97316', fonte: 'Share Tech Mono' },
  'sistema': { cor: '#22C55E', fonte: 'JetBrains Mono' },
  'default': { cor: '#00B4D8', fonte: 'Share Tech Mono' },
}

const CENA_PERSONAGEM = {
  '1.1': 'NeoGuide',
  '1.1b': 'NeoGuide',
  '1.1c': 'NeoGuide',
  '1.1d': 'NeoGuide',
  '2.1': 'Kaeda',
  '2.1a': 'Kaeda',
  '2.1b': 'Kaeda',
  '2.1c': 'Kaeda',
  '2.1d': 'Kaeda',
}

function isFala(text) {
  return text?.startsWith('"') || text?.includes('—')
}

export default function Typewriter({ paragraphs, speed = 30, pauseBetween = 300, onComplete, onSkip, sceneId }) {
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
      {paragraphs.map((para, i) => {
        const personagemId = CENA_PERSONAGEM[sceneId] || null
        const estiloPersonagem = personagemId && isFala(para) ? (PERSONAGEM_STYLE[personagemId] || PERSONAGEM_STYLE.default) : null
        const className = `ldi-typewriter-para ${isFala(para) ? 'ldi-text-fala' : 'ldi-text-narrativa'}`
        return (
          <p
            key={i}
            className={className}
            style={{
              opacity: i <= currentPara ? 1 : 0.2,
              ...(estiloPersonagem ? {
                '--personagem-cor': estiloPersonagem.cor,
                '--personagem-fonte': `'${estiloPersonagem.fonte}', monospace`,
              } : {}),
            }}
          >
            {displayedTexts[i] || ''}
            {showCursor && i === displayedTexts.length - 1 && (
              <motion.span
                className="ldi-typewriter-cursor"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.53, repeat: Infinity, repeatType: 'reverse' }}
              >█</motion.span>
            )}
          </p>
        )
      })}
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
