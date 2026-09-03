import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'
import './DramaticDice.css'

/**
 * DramaticDice — Tela cheia que pausa o jogo e mostra um dado rodando
 * com efeito cinematográfico (começa rápido, desacelera, revela o número).
 *
 * Mostra QUEM está atacando e em QUEM — sem isso o jogador se perde no
 * meio da rolagem, sem saber de quem é o turno.
 *
 * @param {{ finalValue: number, sides?: number, side: 'player'|'enemy', onComplete: () => void, powerName?: string, attackerName?: string, targetName?: string }} props
 */
export default function DramaticDice({ finalValue, sides = 6, side, onComplete, powerName, attackerName, targetName }) {
  const { t } = useLanguage()
  const [display, setDisplay] = useState(null)       // null = fase de "aquecimento"
  const [phase, setPhase] = useState('intro')        // intro → rolling → reveal → done
  const displayRef = useRef(null)                    // ref para usar dentro do rAF sem causar re-render
  const lastSoundRef = useRef(0)
  const phaseRef = useRef('intro')
  const isCritical = finalValue === sides

  // Mantém phaseRef sincronizado com o state phase (evita stale closure no rAF)
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Duração: normal 1.5s~2s, crítico 2s fixo para mais drama
  const totalDuration = useRef(
    isCritical ? 2000 : (1500 + Math.random() * 500)
  )

  useEffect(() => {
    // Fase 1: intro — show the "?" for a moment
    const t1 = setTimeout(() => {
      setPhase('rolling')
    }, 400)

    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (phase !== 'rolling') return

    let stopped = false
    const start = performance.now()
    const rollDuration = totalDuration.current

    // Gera delays com easing CÚBICO (começa rápido, desacelera MUITO no final)
    const steps = []
    let accum = 0
    while (accum < rollDuration) {
      const progress = accum / rollDuration // 0 → 1
      // delay cúbico: começa em ~30ms, termina em ~350ms
      // curva cúbica: fica mais lento exponencialmente perto do fim
      const rawDelay = 30 + Math.pow(progress, 1.8) * 320
      const jitter = (Math.random() - 0.5) * 20
      const delay = Math.max(20, Math.min(400, rawDelay + jitter))
      steps.push({ delay, at: accum })
      accum += delay
    }

    let stepIdx = 0
    let frameId

    function tick() {
      if (stopped || phaseRef.current !== 'rolling') return

      const elapsed = performance.now() - start
      const step = steps[stepIdx]

      if (step && elapsed >= step.at) {
        // Sorteia um número diferente do atual (usa ref p/ não causar loop)
        let next
        do {
          next = Math.floor(Math.random() * sides) + 1
        } while (next === displayRef.current && steps.length > 3)
        displayRef.current = next
        setDisplay(next)

        // Som de tick a cada troca de número (com debounce)
        const now = Date.now()
        if (now - lastSoundRef.current > 30) {
          lastSoundRef.current = now
          sfx.diceTick()
        }

        stepIdx++
      }

      if (elapsed < rollDuration) {
        frameId = requestAnimationFrame(tick)
      } else {
        // Roll acabou → fase de REVELAÇÃO
        sfx.diceLand()
        setPhase('reveal')
        setDisplay(finalValue)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => { stopped = true; cancelAnimationFrame(frameId) }
  }, [phase, finalValue, sides]) // ← sem display! ref evita o loop infinito

  // Na fase reveal, espera 1s (normal) ou 1.2s (crítico) e chama onComplete
  useEffect(() => {
    if (phase !== 'reveal') return
    const delay = isCritical ? 1200 : 1000
    const t = setTimeout(() => {
      setPhase('done')
      onComplete?.()
    }, delay)
    return () => clearTimeout(t)
  }, [phase, onComplete, isCritical])

  const isPlayer = side === 'player'

  return (
    <AnimatePresence>
      <motion.div
        className="dramatic-dice-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Background blur */}
        <div className="dramatic-dice-bg" />

        <div className="dramatic-dice-container">
          {/* Nome do poder (se houver) — aparece antes da label */}
          {powerName && (
            <motion.div
              className="dramatic-dice-powername"
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
            >
              ⚡ {powerName} ⚡
            </motion.div>
          )}

          {/* Quem ataca quem — a identificação que faltava */}
          <motion.div
            className={`dramatic-dice-label dramatic-dice-label--${isPlayer ? 'player' : 'enemy'}`}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <span className="dramatic-dice-attacker">{isPlayer ? '🎯' : '💀'} {attackerName || (isPlayer ? '—' : '—')}</span>
            {targetName && (
              <span className="dramatic-dice-vs">{t('games.gangues.dado.ataca')} <b>{targetName}</b></span>
            )}
          </motion.div>

          {/* O dado em si */}
          <div className="dramatic-dice-stage">
            {/* LIGHTING EFFECTS */}
            <div className={`dramatic-dice-glow ${isCritical && phase === 'reveal' ? 'dramatic-dice-glow--critico' : ''}`} />

            <motion.div
              className={`dramatic-dice-box ${isCritical && phase === 'reveal' ? 'dramatic-dice-box--critico' : ''} ${phase === 'reveal' ? 'dramatic-dice-box--reveal' : ''} ${phase === 'rolling' ? 'dramatic-dice-box--rolling' : ''}`}
              animate={
                phase === 'intro' ? { scale: 0, rotate: -180 } :
                phase === 'rolling' ? { scale: 1, rotate: [0, 15, -15, 10, -10, 5, -5, 0] } :
                phase === 'reveal' ? {
                  scale: [1.3, 0.9, 1.1, 1],
                  rotate: [5, -3, 2, 0],
                } :
                { scale: 1, rotate: 0 }
              }
              transition={
                phase === 'intro' ? { duration: 0.4, ease: 'easeOut' } :
                phase === 'rolling' ? { duration: 0.15, repeat: Infinity, ease: 'linear' } :
                phase === 'reveal' ? { duration: 0.6, ease: 'easeOut' } :
                { duration: 0.3 }
              }
            >
              <span className="dramatic-dice-emoji">🎲</span>
              <span className={`dramatic-dice-number ${phase === 'reveal' ? 'dramatic-dice-number--final' : ''} ${isCritical && phase === 'reveal' ? 'dramatic-dice-number--critico' : ''}`}>
                {display ?? '?'}
              </span>
            </motion.div>

            {/* Impacto: onda de choque + soco batendo no instante da revelação.
                É o que dá peso ao número — antes o dado só parava. */}
            {phase === 'reveal' && (
              <>
                <motion.span
                  className={`dramatic-dice-shockwave ${isCritical ? 'dramatic-dice-shockwave--critico' : ''}`}
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: isCritical ? 3.2 : 2.4, opacity: 0 }}
                  transition={{ duration: isCritical ? 0.7 : 0.55, ease: 'easeOut' }}
                />
                <motion.span
                  className={`dramatic-dice-impacto ${isCritical ? 'dramatic-dice-impacto--critico' : ''}`}
                  initial={{ scale: 0, rotate: isPlayer ? -35 : 35, opacity: 0 }}
                  animate={{ scale: [0, 1.3, 1.05], rotate: isPlayer ? [-35, 8, 0] : [35, -8, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6, times: [0, 0.3, 1], ease: 'easeOut' }}
                >
                  {isCritical ? '💥' : '👊'}
                </motion.span>
              </>
            )}

            {/* Partículas / estrelas ao redor no reveal */}
            {phase === 'reveal' && (
              <motion.div
                className="dramatic-dice-particles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {[...Array(8)].map((_, i) => {
                  const angle = (i / 8) * 360
                  const dist = 60 + Math.random() * 40
                  return (
                    <motion.span
                      key={i}
                      className="dramatic-dice-particle"
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos((angle * Math.PI) / 180) * dist,
                        y: Math.sin((angle * Math.PI) / 180) * dist,
                        opacity: 0,
                        scale: 0,
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{
                        background: isCritical ? '#F5A623' : '#00B4D8',
                      }}
                    >
                      {isCritical ? '✦' : '•'}
                    </motion.span>
                  )
                })}
              </motion.div>
            )}
          </div>

          {/* Frase dramática embaixo */}
          <motion.div
            className="dramatic-dice-subtext"
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {phase === 'intro' && `🎲 ${t('games.gangues.dado.preparando')}`}
            {phase === 'rolling' && t('games.gangues.dado.girando')}
            {phase === 'reveal' && (
              <motion.span
                className={isCritical ? 'dramatic-dice-subtext--critico' : ''}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {isCritical
                  ? (isPlayer ? `⚡ ${t('games.gangues.dado.critico_player')} ⚡` : `💀 ${t('games.gangues.dado.critico_enemy')} 💀`)
                  : `🎯 ${t('games.gangues.dado.resultado', { n: finalValue })}`
                }
              </motion.span>
            )}
          </motion.div>

          {/* Barra de progresso no rodapé (sutil) */}
          {phase === 'rolling' && (
            <motion.div
              className="dramatic-dice-progress"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: totalDuration.current / 1000, ease: 'easeIn' }}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
