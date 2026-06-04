import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const PERSONAGEM_STYLE = {
  'NEOGULDE': { cor: '#00B4D8', fonte: "'Share Tech Mono', monospace" },
  'KAEDA': { cor: '#FF6B6B', fonte: 'Rajdhani, sans-serif' },
  'VOZ': { cor: '#A855F4', fonte: "'JetBrains Mono', monospace" },
  'STORMBYTE': { cor: '#F97316', fonte: "'Share Tech Mono', monospace" },
  'SISTEMA': { cor: '#22C55E', fonte: "'JetBrains Mono', monospace" },
}

function detectarPrefixo(texto) {
  const match = texto.match(/^\[([A-Z_]+)\]\s*/)
  if (match) return { personagem: match[1], textoLimpo: texto.replace(match[0], '') }
  return { personagem: null, textoLimpo: texto }
}

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

  const cleanTexts = paragraphs.map(p => detectarPrefixo(p).textoLimpo)

  const skip = useCallback(() => {
    if (done) return
    setSkipped(true)
    setDone(true)
    setDisplayedTexts(cleanTexts)
    setCurrentPara(paragraphs.length)
    onSkip?.()
    if (onComplete) setTimeout(onComplete, 100)
  }, [done, cleanTexts, paragraphs.length, onSkip, onComplete])

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

    const text = cleanTexts[currentPara]
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
  }, [currentPara, charIndex, paragraphs, speed, pauseBetween, skipped, onComplete, cleanTexts])

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
        const { personagem, textoLimpo } = detectarPrefixo(para)
        if (personagem) console.log('[TW] prefixo detectado:', personagem, '| textoLimpo:', textoLimpo.slice(0, 50))
        const estilo = PERSONAGEM_STYLE[personagem] || null
        const classeFala = isFala(textoLimpo) ? 'ldi-text-fala' : 'ldi-text-narrativa'
        const className = `ldi-typewriter-para ${classeFala}`.trim()
        return (
          <p
            key={i}
            className={className}
            style={{
              opacity: i <= currentPara ? 1 : 0.2,
              ...(estilo && isFala(textoLimpo) ? { '--personagem-cor': estilo.cor, fontFamily: estilo.fonte } : {}),
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
