import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ESTADO_ANIM = {
  vivo: { scale: 1, y: 0 },
  critico: { scale: 0.85, y: 5 },
  morto: { scale: 0, y: 20 },
}

export function resolverEstadoVisualTama({ estadoVisual, status, metricas }) {
  if (estadoVisual) return estadoVisual
  if (status === 'critico' || status === 'morto') return 'abandonado'
  if (!metricas) return 'idle'

  const estadosPorMetrica = [
    { valor: metricas.fome, estado: 'comendo' },
    { valor: metricas.higiene, estado: 'sujo' },
    { valor: metricas.energia, estado: 'sonolento' },
    { valor: metricas.humor, estado: metricas.humor <= 20 ? 'abandonado' : 'raiva' },
    { valor: metricas.saude, estado: 'doente' },
  ].sort((a, b) => a.valor - b.valor)

  if (estadosPorMetrica[0].valor < 60) return estadosPorMetrica[0].estado
  if (estadosPorMetrica.every(metrica => metrica.valor >= 85)) return 'feliz'
  return 'idle'
}

export default function CriaturaSprite({ criaturaId, status, estagio, criaturas, estadoVisual, metricas }) {
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
  const tam = (estagio >= 2 ? 280 : estagio === 1 ? 220 : 160)
  const estadoResolvido = resolverEstadoVisualTama({ estadoVisual, status, metricas })
  const imagemEstado = c.gifs?.[estadoResolvido] || c.imagem
  const temImagem = !!imagemEstado && !erroImg
  const filterVal = status === 'morto' ? 'grayscale(1) brightness(0.3)' : status === 'critico' ? 'brightness(0.7)' : 'none'

  const bounceVariants = {
    idle: { y: 0, scale: 1, opacity: 1 },
    pulando: { y: [0, -48, -72, -48, 0], scale: [1, 1.05, 1.1, 1.05, 1], opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${criaturaId}-${estadoResolvido}`}
        className="tama-sprite"
        data-estagio={estagio}
        data-status={status}
        data-tem-imagem={temImagem ? 'true' : 'false'}
        initial={{ scale: 0, opacity: 0 }}
        animate={temImagem ? (pulando ? 'pulando' : 'idle') : { scale: anim.scale, opacity: 1, y: anim.y }}
        exit={{ scale: 0, opacity: 0 }}
        variants={temImagem ? bounceVariants : undefined}
        transition={temImagem ? { type: 'spring', stiffness: 300, damping: 10 } : { type: 'spring', stiffness: 200, damping: 15 }}
      >
        {temImagem ? (
          <img
            src={imagemEstado}
            alt={c.nome}
            draggable={false}
            onError={() => setErroImg(true)}
            className="tama-sprite-img"
            data-status={status}
            data-estado-visual={estadoResolvido}
          />
        ) : (
          <div className="tama-sprite-emoji" data-estagio={estagio}>
            {c.emoji}
          </div>
        )}

        {/* Brilho vitalidade */}
        {status === 'vivo' && temImagem && (
          <motion.div
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="tama-sprite-brilho"
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
