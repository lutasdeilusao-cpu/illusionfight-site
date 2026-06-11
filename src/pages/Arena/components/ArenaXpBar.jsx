import { motion } from 'framer-motion'

/**
 * Deriva attribute_points_gained a partir do xp_total acumulado.
 * Útil quando os dados vêm do Supabase (que não tem coluna attribute_points_gained).
 *
 * Sistema de leveling:
 * - Level = attribute_points_gained + 1
 * - XP necessário para o próximo level = 10 + attribute_points_gained * 2
 * - startOfLevelXp = XP total acumulada até o início deste level
 *   = sum(10 + 2*i) para i = 0 até pointsGained-1
 *   = pointsGained * (9 + pointsGained)
 */
function derivePointsFromXp(xpTotal) {
  let pts = 0
  let cumXp = 0
  while (true) {
    const cost = 10 + pts * 2
    if (cumXp + cost > xpTotal) break
    cumXp += cost
    pts++
  }
  return pts
}

function calcXpProgress(xpTotal, pointsGained) {
  const xp = xpTotal || 0
  // Se pointsGained não foi informado (ex: veio do Supabase sem a coluna),
  // deriva a partir do xp_total
  const pts = (pointsGained ?? undefined) !== undefined
    ? (pointsGained || 0)
    : derivePointsFromXp(xp)

  // XP total gasto para chegar neste level
  const startOfLevelXp = pts > 0 ? pts * (9 + pts) : 0

  // XP necessário para subir deste level
  const xpNeeded = 10 + pts * 2

  // XP já ganho dentro deste level
  const xpInThisLevel = Math.max(0, xp - startOfLevelXp)

  // Progresso (0 a 1)
  const progress = Math.min(1, xpInThisLevel / xpNeeded)

  // Quanto falta
  const xpRemaining = Math.max(0, xpNeeded - xpInThisLevel)

  return {
    level: pts + 1,
    xpInThisLevel,
    xpNeeded,
    xpRemaining,
    progress,
    startOfLevelXp,
  }
}

/**
 * Componente de barra de progresso de XP — usado na lobby e na tela de vitória.
 */
export default function ArenaXpBar({ xpTotal, pointsGained, t, animated = false, compact = false }) {
  const { level, xpInThisLevel, xpNeeded, xpRemaining, progress } = calcXpProgress(xpTotal, pointsGained)

  const barContent = (
    <>
      {/* Level + XP counters */}
      <div className="arena-xpbar-header">
        <span className="arena-xpbar-level">
          {t('games.arena.lv', { n: level })}
        </span>
        <span className="arena-xpbar-count">
          {xpInThisLevel} / {xpNeeded} XP
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
      {xpRemaining > 0 && (
        <span className="arena-xpbar-remaining">
          {t('games.arena.xp_faltam', { n: xpRemaining })}
        </span>
      )}
      {xpRemaining <= 0 && (
        <span className="arena-xpbar-remaining arena-xpbar-remaining--ready">
          {t('games.arena.xp_level_up_ready')}
        </span>
      )}
    </>
  )

  if (compact) {
    return <div className="arena-xpbar arena-xpbar--compact">{barContent}</div>
  }

  return <div className="arena-xpbar">{barContent}</div>
}
