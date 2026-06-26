import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ONOMATOPEIAS_FISTS = ['POW!', 'WHAM!', 'CRACK!']
const ONOMATOPEIAS_ARMED = ['SLASH!', 'CLANG!', 'THWACK!']
const ONOMATOPEIAS_POWER = ['BOOM!', 'ZAP!', 'FWOOSH!']
const ONOMATOPEIAS_DODGE = ['DODGE!', 'SWISH!']
const CRITICAL_TEXT = 'CRITICAL!!'

function getOnomatopeia(mode) {
  if (mode === 'fists') return ONOMATOPEIAS_FISTS[Math.floor(Math.random() * ONOMATOPEIAS_FISTS.length)]
  if (mode === 'armed') return ONOMATOPEIAS_ARMED[Math.floor(Math.random() * ONOMATOPEIAS_ARMED.length)]
  if (mode === 'power') return ONOMATOPEIAS_POWER[Math.floor(Math.random() * ONOMATOPEIAS_POWER.length)]
  return ONOMATOPEIAS_FISTS[0]
}

export function Onomatopeia({ mode, critical, onDone }) {
  const text = critical ? CRITICAL_TEXT : getOnomatopeia(mode)

  return (
    <motion.div
      className={`ldi-onomatopeia ${critical ? 'ldi-onomatopeia--critical' : ''}`}
      initial={{ scale: 1.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onAnimationComplete={() => {
        setTimeout(onDone, 500)
      }}
    >
      {text}
    </motion.div>
  )
}

export function DiceRollDisplay({ result, breakdown, success, onDone }) {
  const [rolling, setRolling] = useState(true)
  const [displayNum, setDisplayNum] = useState('?')
  const [showBreakdown, setShowBreakdown] = useState(false)
  const isCritFail = result.raw === 6

  useEffect(() => {
    let frame
    const start = Date.now()
    const duration = 400
    let lastNum = 1

    function animate() {
      const elapsed = Date.now() - start
      if (elapsed < duration) {
        lastNum = Math.floor(Math.random() * 6) + 1
        setDisplayNum(lastNum)
        frame = requestAnimationFrame(animate)
      } else {
        setRolling(false)
        setDisplayNum(result.raw)
        setTimeout(() => setShowBreakdown(true), 200)
        if (onDone) setTimeout(onDone, 1200)
      }
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [result.raw, onDone])

  return (
    <div className="ldi-dice-roll">
      <motion.div
        className={`ldi-dice-result ${isCritFail ? 'ldi-dice-result--critfail' : success ? 'ldi-dice-result--success' : 'ldi-dice-result--fail'}`}
        initial={{ scale: 0.5 }}
        animate={rolling ? { rotate: [0, 360], scale: [0.8, 1.2, 0.8] } : { scale: 1.5 }}
        transition={rolling ? { duration: 0.2, repeat: Infinity } : { type: 'spring', stiffness: 300, delay: 0.05 }}
      >
        🎲 {rolling ? displayNum : result.raw}
      </motion.div>

      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            className="ldi-dice-breakdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isCritFail ? (
              <span className="ldi-dice-critfail">FALHA CRÍTICA</span>
            ) : success ? (
              <span className="ldi-dice-success">✓ SUCESSO</span>
            ) : (
              <span className="ldi-dice-fail">✗ FALHA</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ScreenFlash({ color = 'red', intensity = 0.4, duration = 300, onDone }) {
  return (
    <motion.div
      className="ldi-screen-flash"
      style={{ backgroundColor: color === 'red' ? '#ff0000' : '#ffffff' }}
      initial={{ opacity: intensity }}
      animate={{ opacity: 0 }}
      transition={{ duration: duration / 1000, ease: 'easeOut' }}
      onAnimationComplete={onDone}
    />
  )
}

export function ScreenVignette({ active, pulsating }) {
  return (
    <motion.div
      className={`ldi-vignette ${pulsating ? 'ldi-vignette--pulse' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    />
  )
}
