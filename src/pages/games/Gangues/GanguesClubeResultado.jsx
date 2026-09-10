import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { sfx } from '../../../lib/sfx'
import './GanguesClube.css'

/* CLUBE DA LUTA — tela de desfecho: fim do gauntlet (vitória), derrota em
   qualquer ronda, ou fuga no meio. É a cena mais pesada do modo história:
   holofote, plateia em silhueta, grão de filme, faíscas / caco de caderneta
   na vitória, vinheta pulsando e dessaturação na derrota/fuga. Tudo CSS/framer
   + sfx sintetizado (sem arquivo de áudio). */

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function Plateia() {
  return (
    <div className="gang-clube-plateia" aria-hidden="true">
      {Array.from({ length: 11 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
    </div>
  )
}

// modo: 'vitoria' | 'derrota' | 'fuga'
export default function GanguesClubeResultado({ modo = 'derrota', entrouLimpo = false, divida = 0, onVoltar }) {
  const { t } = useLanguage()
  const [etapa, setEtapa] = useState(0) // 0 selo/impacto · 1 texto · 2 botão
  const reduced = useRef(prefersReduced())
  const R = reduced.current
  const venceu = modo === 'vitoria'

  useEffect(() => {
    let vivo = true
    const marca = (ms, n, fn) => setTimeout(() => { if (vivo) { setEtapa(s => Math.max(s, n)); fn?.() } }, R ? Math.min(ms, 200) : ms)
    const timers = []
    if (venceu) {
      sfx.explosion?.()
      timers.push(marca(120, 0, () => sfx.attackCritical?.()))
      timers.push(marca(320, 0, () => sfx.attackHeavy?.()))
      timers.push(marca(680, 0, () => sfx.vs?.()))
      timers.push(marca(1500, 1, () => sfx.win?.()))
      timers.push(marca(3200, 2))
    } else {
      sfx.lose?.()
      timers.push(marca(500, 0, () => sfx.heartbeat?.()))
      timers.push(marca(1400, 1, () => sfx.heartbeat?.()))
      timers.push(marca(2600, 1, () => sfx.heartbeat?.()))
      timers.push(marca(3600, 2))
    }
    return () => { vivo = false; timers.forEach(clearTimeout) }
  }, [venceu, R])

  const titulo = t(`games.gangues.clube.${modo}_titulo`)
  const texto = venceu
    ? t(entrouLimpo ? 'games.gangues.clube.venceu_texto_grana' : 'games.gangues.clube.venceu_texto')
    : t(`games.gangues.clube.${modo}_texto`)
  const cor = venceu ? 'vitoria' : 'derrota'

  return (
    <main className={`gang-clube-cena gang-clube-cena--${cor}${R ? ' is-reduced' : ''}`}>
      <div className="gang-clube-holofote" aria-hidden="true" />
      <Plateia />
      <div className="gang-clube-vinheta" aria-hidden="true" />
      <div className="gang-clube-grain" aria-hidden="true" />

      {venceu && !R && (
        <>
          <div className="gang-clube-flash" aria-hidden="true" />
          <div className="gang-clube-faiscas" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
          </div>
          <div className="gang-clube-papel" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
          </div>
        </>
      )}

      <div className="gang-clube-cena-conteudo">
        <motion.span className="gang-clube-cena-code"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          {t('games.gangues.clube.result_code')}
        </motion.span>

        <motion.h1 className="gang-clube-cena-titulo"
          initial={R ? { opacity: 0 } : { opacity: 0, scale: 1.35, filter: 'blur(6px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ delay: R ? 0.1 : 0.55, type: 'spring', stiffness: 220, damping: 12 }}>
          {titulo}
        </motion.h1>

        <AnimatePresence>
          {etapa >= 1 && (
            <motion.p className="gang-clube-cena-par"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              {texto}
            </motion.p>
          )}
        </AnimatePresence>

        {!venceu && divida > 0 && etapa >= 1 && (
          <motion.div className="gang-clube-cena-caderneta"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {t('games.gangues.clube.sala_caderneta', { divida })}
          </motion.div>
        )}

        <AnimatePresence>
          {etapa >= 2 && (
            <motion.button className="gang-clube-cena-btn"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              onClick={onVoltar}>
              {t('games.gangues.clube.voltar')}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
