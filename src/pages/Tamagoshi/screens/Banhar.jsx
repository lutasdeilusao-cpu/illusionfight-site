import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { CRIATURAS } from '../data/criaturas'
import CriaturaSprite from '../components/CriaturaSprite'
import { DIX_POR_ACAO } from '../data/moedas'

export default function Banhar({ onConcluir }) {
  const { t } = useLanguage()
  const store = useTamagoshiStore()
  const [progress, setProgress] = useState(0)
  const [bolhas, setBolhas] = useState([])
  const acumulado = useRef(0)
  const lastY = useRef(null)
  const containerRef = useRef(null)

  const inv = store.inventario || {}
  const temSabonete = (inv['sabonete'] || 0) > 0 || (inv['shampoo'] || 0) > 0
  const itemUsar = inv['shampoo'] > 0 ? 'shampoo' : inv['sabonete'] > 0 ? 'sabonete' : null

  const handleMove = (y) => {
    if (lastY.current === null) { lastY.current = y; return }
    const delta = Math.abs(y - lastY.current)
    lastY.current = y
    acumulado.current += delta
    const novoProgress = Math.min(Math.floor(acumulado.current / 8), 100)
    setProgress(novoProgress)
    if (novoProgress % 20 === 0 && delta > 5) {
      setBolhas(b => [...b.slice(-15), { id: Date.now(), x: Math.random() * 80 + 10, size: Math.random() * 12 + 6 }])
    }
  }

  // Trava scroll do body enquanto estiver no banho
  useEffect(() => {
    const body = document.body
    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'
    body.style.overscrollBehavior = 'none'
    return () => {
      body.style.overflow = ''
      body.style.touchAction = ''
      body.style.overscrollBehavior = ''
    }
  }, [])

  // Event listeners manuais com passive: false para evitar warning do React 19
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onTouch = (e) => {
      e.preventDefault()
      handleMove(e.touches[0].clientY)
    }
    const onEnd = () => resetTracking()
    const onMouse = (e) => {
      if (e.buttons === 1) handleMove(e.clientY)
    }
    el.addEventListener('touchmove', onTouch, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    el.addEventListener('mousemove', onMouse)
    el.addEventListener('mouseup', onEnd)
    el.addEventListener('mouseleave', onEnd)
    return () => {
      el.removeEventListener('touchmove', onTouch)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
      el.removeEventListener('mousemove', onMouse)
      el.removeEventListener('mouseup', onEnd)
      el.removeEventListener('mouseleave', onEnd)
    }
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const concluir = async () => {
        try {
          if (itemUsar) await store.consumirItem(itemUsar)
          store.banhar()
          store.ganharDix(store._userId, DIX_POR_ACAO, 'banhou criatura')
          onConcluir()
        } catch (e) { console.error(e) }
      }
      concluir()
    }
  }, [progress])

  const resetTracking = () => { lastY.current = null; acumulado.current = 0 }

  return (
    <div className="tama-acao-screen"
      ref={containerRef}
      style={{ touchAction: 'none', overscrollBehavior: 'none' }}
    >
      <h2 className="tama-acao-title">{t('games.tamagoshi.banhar_title')}</h2>

      <div className="tama-acao-progress-container">
        <div className="tama-acao-progress-track">
          <div className="tama-acao-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="tama-acao-progress-label">{Math.round(progress)}%</span>
      </div>

      <div className="tama-acao-banho-area">
        <div className="tama-acao-sprite">
          <CriaturaSprite
            criaturaId={store.criaturaId}
            status={store.status}
            estagio={store.estagio}
            criaturas={CRIATURAS}
            estado="satisfeito"
          />
        </div>
        {bolhas.map(b => (
          <motion.div
            key={b.id}
            className="tama-acao-banho-bolha"
            initial={{ y: 0, opacity: 0.8, x: `${b.x}%` }}
            animate={{ y: -80, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ width: b.size, height: b.size, left: `${b.x}%` }}
          />
        ))}
      </div>

      {temSabonete ? (
        <p className="tama-acao-hint">{t('games.tamagoshi.banhar_hint')}</p>
      ) : (
        <p className="tama-aviso">{t('games.tamagoshi.banhar_sem_sabonete')}</p>
      )}

      <motion.button
        className="tama-btn"
        style={{ marginTop: '0.5rem', opacity: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onConcluir}
      >
        [ {t('games.tamagoshi.voltar')} ]
      </motion.button>
    </div>
  )
}
