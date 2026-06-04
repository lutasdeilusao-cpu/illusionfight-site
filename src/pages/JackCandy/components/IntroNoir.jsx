import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntroNoir({ onFim }) {
  const [fase, setFase] = useState('animando')

  useEffect(() => {
    const t1 = setTimeout(() => setFase('fadeout'), 2800)
    const t2 = setTimeout(() => onFim?.(), 3400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <AnimatePresence>
      {fase !== 'fim' && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: fase === 'fadeout' ? 0 : 1 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'fixed', inset: 0,
            background: '#000', overflow: 'hidden', zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => { setFase('fadeout'); setTimeout(() => onFim?.(), 600) }}
        >
            <motion.div
              style={{
                position: 'fixed', inset: 0,
                background: 'radial-gradient(circle 180px at 0% 55%, rgba(255,255,200,0.13) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            animate={{ backgroundPosition: ['0% 55%', '110% 55%'] }}
            transition={{ duration: 2.5, ease: 'linear', repeat: 0 }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0.7, 0] }}
            transition={{ duration: 2.5, times: [0, 0.1, 0.85, 1] }}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            <motion.div
              style={{
                position: 'absolute', top: '50%', width: '100%', height: '100%',
                background: 'radial-gradient(circle 120px at 0% 0%, rgba(255,255,200,0.09) 0%, transparent 65%)',
                transform: 'translateY(-50%)',
              }}
              animate={{ x: ['0%', '115%'] }}
              transition={{ duration: 2.5, ease: 'linear', delay: 0.3 }}
            />
          </motion.div>

          <motion.div
            style={{
              position: 'absolute', bottom: '38%', fontSize: '2rem',
              filter: 'brightness(0.3)', userSelect: 'none',
            }}
            initial={{ x: '-80px' }}
            animate={{ x: 'calc(100vw + 80px)' }}
            transition={{ duration: 2.6, ease: 'linear' }}
          >🕵️</motion.div>

          <motion.div
            style={{
              position: 'absolute', bottom: '38%', fontSize: '1.2rem',
              filter: 'brightness(0.5) sepia(1) hue-rotate(10deg)', userSelect: 'none',
            }}
            initial={{ x: '-120px' }}
            animate={{ x: 'calc(100vw + 40px)' }}
            transition={{ duration: 2.6, ease: 'linear', delay: 0.4 }}
          >🔍</motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0.4, 0] }}
            transition={{ duration: 2.5, times: [0, 0.2, 0.8, 1] }}
            style={{
              position: 'absolute', bottom: '20%', width: '100%', textAlign: 'center',
              fontFamily: "'Share Tech Mono', monospace", fontSize: '0.65rem',
              color: '#555', letterSpacing: '0.2em', userSelect: 'none',
            }}
          >toque para pular</motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
