import { motion } from 'framer-motion'
import { getGanguesProgression } from '../utils/ganguesProgression'

/**
 * Componente de barra de progresso de XP — usado na lobby e na tela de vitória.
 */
export default function GanguesXpBar({ xpTotal, t, animated = false, compact = false }) {
  const { level, xpInLevel, xpNeeded, xpRemaining, progress } = getGanguesProgression(xpTotal)

  const barContent = (
    <>
      {/* Level + XP counters */}
      <div className="gangues-xpbar-header">
        <span className="gangues-xpbar-level">
          {t('games.gangues.lv', { n: level })}
        </span>
        <span className="gangues-xpbar-count">
          {xpInLevel} / {xpNeeded} XP
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="gangues-xpbar-track">
        <motion.div
          className="gangues-xpbar-fill"
          initial={animated ? { width: '0%' } : { width: `${progress * 100}%` }}
          animate={{ width: `${progress * 100}%` }}
          transition={animated ? { duration: 1.2, ease: 'easeOut', delay: 0.5 } : { duration: 0.3 }}
        />
      </div>

      {/* Quanto falta */}
      <span className="gangues-xpbar-remaining">
        {t('games.gangues.xp_faltam', { n: xpRemaining })}
      </span>
    </>
  )

  if (compact) {
    return <div className="gangues-xpbar gangues-xpbar--compact">{barContent}</div>
  }

  return <div className="gangues-xpbar">{barContent}</div>
}
