import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ESTADO_ANIM = {
  vivo: { scale: 1, y: 0 },
  critico: { scale: 0.85, y: 5 },
  morto: { scale: 0, y: 20 },
}

export default function CriaturaSprite({ criaturaId, status, estagio, criaturas, acao, estado }) {
  const c = criaturas.find(x => x.id === criaturaId)
  const [pulando, setPulando] = useState(false)
  const [erroImg, setErroImg] = useState(false)
  const timerRef = useRef(null)

  // Pulinho a cada 10-15s
  useEffect(() => {
    const agendar = () => {
      const delay = 10000 + Math.random() * 5000
      timerRef.current = setTimeout(() => {
        setPulando(true)
        setTimeout(() => setPulando(false), 600)
        agendar()
      }, delay)
    }
    agendar()
    return () => clearTimeout(timerRef.current)
  }, [])

  if (!c) return <div className="tama-sprite-placeholder">?</div>

  const anim = ESTADO_ANIM[status] || ESTADO_ANIM.vivo
  const tam = estagio >= 2 ? 280 : estagio === 1 ? 220 : 160
  const temImagem = !!c.imagem && !erroImg

  // Resolve imagem: estado → ação → status → base
  const imgEstado = estado && c.gifs?.[estado]
  const imgAcao = !imgEstado && acao && c.gifs?.[acao]
  const imgStatus = !imgEstado && !imgAcao && status && c.gifs?.[status]
  const url = imgEstado || imgAcao || imgStatus || c.imagem

  const bounceVariants = {
    idle: { y: 0, scale: 1, opacity: 1 },
    pulando: { y: [0, -48, -72, -48, 0], scale: [1, 1.05, 1.1, 1.05, 1], opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${criaturaId}-${estado || status}-${acao}`}
        className={`tama-sprite${estado && estado !== 'idle' ? ` tama-sprite--${estado}` : ''}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={temImagem ? (pulando ? 'pulando' : 'idle') : { scale: anim.scale, opacity: 1, y: anim.y }}
        exit={{ scale: 0, opacity: 0 }}
        variants={temImagem ? bounceVariants : undefined}
        transition={temImagem ? { type: 'spring', stiffness: 300, damping: 10 } : { type: 'spring', stiffness: 200, damping: 15 }}
        style={{
          width: tam, height: tam, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
        }}
      >
        {temImagem ? (
          <img
            src={url}
            alt={c.nome}
            onError={() => setErroImg(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              borderRadius: '50%', filter: status === 'morto' ? 'grayscale(1) brightness(0.3)' : status === 'critico' ? 'brightness(0.7)' : 'none',
              imageRendering: 'auto',
            }}
          />
        ) : (
          <div style={{ fontSize: `${tam * 0.5}px`, lineHeight: 1 }}>
            {c.emoji}
          </div>
        )}

        {/* Brilho vitalidade */}
        {status === 'vivo' && temImagem && (
          <motion.div
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,255,136,0.2), transparent)',
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
