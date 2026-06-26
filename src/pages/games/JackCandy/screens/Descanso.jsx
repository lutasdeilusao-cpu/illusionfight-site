import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useJackStore } from '../store/useJackStore'

export default function Descanso() {
  const { t } = useLanguage()
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
        // Se comeÃ§ou com 0 HP, sÃ³ recupera metade
        if (eraZero && novo >= Math.ceil(hpMax * 0.5)) {
          stopRef.current = true
          setTimeout(() => setAcordou(true), 500)
          store.setMonologo('vocÃª descansou. nem tudo voltou. mas o suficiente.')
          return novo
        }
        // Se nÃ£o era 0, recupera atÃ© 100% ou 75% se HP estava crÃ­tico
        if (novo >= hpMax && !eraZero) {
          stopRef.current = true
          setTimeout(() => setAcordou(true), 500)
          return novo
        }
        if (novo >= Math.ceil(hpMax * 0.75) && eraZero === false && hp < Math.ceil(hpMax * 0.5)) {
          stopRef.current = true
          setTimeout(() => setAcordou(true), 500)
          store.setMonologo('vocÃª descansou. se sente melhor.')
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
          <div className="jdc-descanso-icon">ðŸŒ…</div>
          <p className="jack-text jack-text--amber">{t('games.jackcandy.descanso_acordou')}</p>
          <p className="jack-text jack-text--dim">
            {t('games.jackcandy.descanso_recuperado', { hp, hpMax, pct: hpPct })}
          </p>
          <button className="jack-btn jack-btn--amber jdc-btn-mt-1" onClick={() => store.setFase('vila')}>
            {t('games.jackcandy.descanso_levantar')}
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
            ðŸ˜´
          </motion.span>
        </div>
        <p className="jack-text jack-text--dim">
          {eraZero ? t('games.jackcandy.descanso_desmaiou') : t('games.jackcandy.descanso_descansando')}
        </p>

        <div className="jdc-descanso-hpbar">
          <motion.div className="jdc-dungeon-hpbar-fill"
            animate={{ width: `${hpPct}%` }}
            transition={{ duration: 0.3 }}
            style={{ backgroundColor: hpColor }} />
        </div>
        <p className="jack-text jack-text--dim jdc-text-xs">
          {t('games.jackcandy.descanso_moral', { hp, hpMax })}
        </p>

        {!eraZero && (
          <button className="jack-btn jdc-btn-xs jdc-btn-mt-05" onClick={() => { stopRef.current = true; store.setFase('vila') }}>
            {t('games.jackcandy.descanso_acordar_agora')}
          </button>
        )}
      </div>
    </motion.div>
  )
}
