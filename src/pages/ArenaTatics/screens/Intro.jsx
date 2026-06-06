import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TATICS_VERSION } from '../../../config/version'

const LINES = [
  { text: 'SISTEMA DE COMBATE TÁTICO', delay: 400 },
  { text: 'CARREGANDO PROTOCOLO NEXUS...', delay: 1200 },
  { text: 'ENERGIA MENTAL DETECTADA', delay: 2000 },
  { text: 'SINCRONIZAÇÃO DE UNIDADES OK', delay: 2800 },
  { text: 'INICIANDO PROTOCOLO DE SELEÇÃO', delay: 3600 },
]

export default function Intro({ onEnter, onSimulacao }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [showButton, setShowButton] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: 0.5, y: 0.5 })
  const containerRef = useRef(null)

  // Typewriter effect for lines
  useEffect(() => {
    let timeouts = []
    LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, i])
        if (i === LINES.length - 1) {
          setTimeout(() => setShowButton(true), 1400)
        }
      }, line.delay)
      timeouts.push(t)
    })
    return () => timeouts.forEach(clearTimeout)
  }, [])

  // Mouse parallax for grid
  useEffect(() => {
    const handleMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setCursorPos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <div ref={containerRef} className="tatics-intro">
      {/* ── Background layers ── */}
      <div className="tatics-intro-bg" />
      <div className="tatics-intro-grid" style={{
        transform: `perspective(500px) rotateX(60deg) translate(${(cursorPos.x - 0.5) * 20}px, ${(cursorPos.y - 0.5) * 20}px)`,
      }} />
      <div className="tatics-intro-scanlines" />
      <div className="tatics-intro-vignette" />

      {/* ── Floating particles ── */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="tatics-intro-particle"
          style={{
            left: `${(i * 47 + 13) % 100}%`,
            top: `${(i * 31 + 7) % 100}%`,
            animationDelay: `${(i * 0.7) % 4}s`,
            animationDuration: `${3 + (i % 3)}s`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
          }}
        />
      ))}

      {/* ── Content ── */}
      <div className="tatics-intro-content">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="tatics-intro-logo-wrapper"
        >
          <div className="tatics-intro-logo-border" />
          <div className="tatics-intro-logo">
            <span className="tatics-intro-logo-ldi">LDI</span>
            <span className="tatics-intro-logo-tatics">TATICS</span>
          </div>
          <div className="tatics-intro-logo-sub">SISTEMA DE COMBATE TÁTICO</div>
          <div className="tatics-intro-logo-line" />
        </motion.div>

        {/* Terminal lines */}
        <div className="tatics-intro-terminal">
          {LINES.map((line, i) => (
            <AnimatePresence key={i}>
              {visibleLines.includes(i) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="tatics-intro-terminal-line"
                >
                  <span className="tatics-intro-terminal-prompt">&gt;</span>
                  <span className="tatics-intro-terminal-text">{line.text}</span>
                  <span className="tatics-intro-terminal-status">OK</span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Button */}
        <AnimatePresence>
          {showButton && (
            <>
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEnter}
                className="tatics-intro-btn"
              >
                <span className="tatics-intro-btn-text">ACESSAR SISTEMA</span>
                <span className="tatics-intro-btn-glow" />
              </motion.button>

              {onSimulacao && (
                <motion.button
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSimulacao}
                  className="tatics-intro-btn tatics-intro-btn-sim"
                >
                  <span className="tatics-intro-btn-text">⚙ SIMULAÇÃO IA</span>
                  <span className="tatics-intro-btn-glow" />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Version */}
        <div className="tatics-intro-version">v{TATICS_VERSION} // NEXUS PROTOCOL</div>
      </div>
    </div>
  )
}
