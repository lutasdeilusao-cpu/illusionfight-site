import { motion } from 'framer-motion'
import { useDueloStore } from '../store/useDueloStore'
import { useLanguage } from '../../../../context/LanguageContext'
import './DueloDerrota.css'

export default function DueloDerrota({ onRevanche, onMenu }) {
  const { t } = useLanguage()
  const store = useDueloStore()
  return (
    <div className="duelo-derrota">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
        <span className="duelo-derrota__emoji">💀</span>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="duelo-derrota__titulo">
        {t('games.duelo.derrota')}
      </motion.h1>
      <p className="duelo-derrota__info">
        {t('games.duelo.ia_lp_restante', { n: store.aiLP })} · {t('games.duelo.turnos', { n: store.turnNumber })}
      </p>
      <div className="duelo-derrota__actions">
        <button onClick={onRevanche} className="duelo-derrota__btn duelo-derrota__btn--revanche">
          {t('games.duelo.btn_jogar_novamente')}
        </button>
        <button onClick={onMenu} className="duelo-derrota__btn duelo-derrota__btn--menu">
          {t('games.duelo.btn_voltar_menu')}
        </button>
      </div>
    </div>
  )
}
