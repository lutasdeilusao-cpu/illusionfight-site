import { motion } from 'framer-motion'
import { getArenaProgression } from '../utils/arenaProgression'

/**
 * Componente de barra de progresso de XP — usado na lobby e na tela de vitória.
 */
export default function ArenaXpBar({ xpTotal, t, animated = false, compact = false }) {
  const { level, xpInLevel, xpNeeded, xpRemaining, progress } = getArenaProgression(xpTotal)

  const barContent = (
    <>
      {/* Level + XP counters */}
      <div className="arena-xpbar-header">
        <span className="arena-xpbar-level">
          {t('games.arena.lv', { n: level })}
        </span>
        <span className="arena-xpbar-count">
          {xpInLevel} / {xpNeeded} XP
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="arena-xpbar-track">
        <motion.div
          className="arena-xpbar-fill"
          initial={animated ? { width: '0%' } : { width: `${progress * 100}%` }}
          animate={{ width: `${progress * 100}%` }}
          transition={animated ? { duration: 1.2, ease: 'easeOut', delay: 0.5 } : { duration: 0.3 }}
        />
      </div>

      {/* Quanto falta */}
      <span className="arena-xpbar-remaining">
        {t('games.arena.xp_faltam', { n: xpRemaining })}
      </span>
    </>
  )

  if (compact) {
    return <div className="arena-xpbar arena-xpbar--compact">{barContent}</div>
  }

  return <div className="arena-xpbar">{barContent}</div>
}
