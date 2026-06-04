import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'

export default function Descanso() {
  const store = useJackStore()
  const [hp, setHp] = useState(store.hpAtual)
  const [acordou, setAcordou] = useState(false)
  const hpMax = store.hpMax
  const stopRef = useRef(false)

  const eraZero = hp <= 0

  useEffect(() => {
    stopRef.current = false
    const tick = () => {
      if (stopRef.current) return
      setHp(h => {
        const novo = Math.min(h + 2, hpMax)
        store.setHpAtual(novo)
        // Se começou com 0 HP, só recupera metade
        if (eraZero && novo >= Math.ceil(hpMax * 0.5)) {
          stopRef.current = true
          setTimeout(() => setAcordou(true), 500)
          store.setMonologo('você descansou. nem tudo voltou. mas o suficiente.')
          return novo
        }
        // Se não era 0, recupera até 100% ou 75% se HP estava crítico
        if (novo >= hpMax && !eraZero) {
          stopRef.current = true
          setTimeout(() => setAcordou(true), 500)
          return novo
        }
        if (novo >= Math.ceil(hpMax * 0.75) && eraZero === false && hp < Math.ceil(hpMax * 0.5)) {
          stopRef.current = true
          setTimeout(() => setAcordou(true), 500)
          store.setMonologo('você descansou. se sente melhor.')
          return novo
        }
        return novo
      })
    }
    const interval = setInterval(tick, 400)
    return () => { clearInterval(interval); stopRef.current = true }
  }, [])

  const hpPct = hpMax > 0 ? Math.round((hp / hpMax) * 100) : 0
  const hpColor = hpPct > 60 ? '#22C55E' : hpPct > 30 ? '#F5A623' : '#8B0000'

  if (acordou) {
    return (
      <motion.div className="jdc-descanso" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="jdc-descanso-card">
          <div className="jdc-descanso-icon">🌅</div>
          <p className="jack-text jack-text--amber">você acordou.</p>
          <p className="jack-text jack-text--dim">
            Moral recuperado até {hp}/{hpMax} ({hpPct}%).
          </p>
          <button className="jack-btn jack-btn--amber" onClick={() => store.setFase('vila')} style={{ marginTop: '1rem' }}>
            [ levantar ]
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div className="jdc-descanso" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="jdc-descanso-card">
        <div className="jdc-descanso-icon">
          <motion.span animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
            😴
          </motion.span>
        </div>
        <p className="jack-text jack-text--dim">
          {eraZero ? 'você desmaiou. recomece com metade das forças.' : 'descansando...'}
        </p>

        <div className="jdc-descanso-hpbar">
          <motion.div className="jdc-dungeon-hpbar-fill"
            animate={{ width: `${hpPct}%` }}
            transition={{ duration: 0.3 }}
            style={{ backgroundColor: hpColor }} />
        </div>
        <p className="jack-text jack-text--dim" style={{ fontSize: '0.7rem' }}>
          Moral: {hp}/{hpMax}
        </p>

        {!eraZero && (
          <button className="jack-btn" onClick={() => { stopRef.current = true; store.setFase('vila') }}
            style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>
            [ acordar agora ]
          </button>
        )}
      </div>
    </motion.div>
  )
}
