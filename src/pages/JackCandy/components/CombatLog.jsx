import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function CombatLog({ entries, inimigosRestantes, hp, hpMax }) {
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [entries])

  const hpPct = hpMax > 0 ? Math.round((hp / hpMax) * 100) : 0

  return (
    <div className="jdc-combat-log">
      <div className="jdc-combat-log-hp">
        <span className="jdc-combat-log-hp-label">HP</span>
        <div className="jdc-combat-log-hp-bar">
          <div className="jdc-combat-log-hp-fill" style={{ width: `${hpPct}%` }} />
        </div>
        <span className="jdc-combat-log-hp-text">{hp}/{hpMax}</span>
      </div>
      <div className="jdc-combat-log-feed">
        {entries.map((e, i) => (
          <motion.p key={i} className="jdc-combat-log-entry"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {e}
          </motion.p>
        ))}
        <div ref={endRef} />
      </div>
      <div className="jdc-combat-log-footer">
        <span>inimigos restantes: {inimigosRestantes}</span>
      </div>
    </div>
  )
}
