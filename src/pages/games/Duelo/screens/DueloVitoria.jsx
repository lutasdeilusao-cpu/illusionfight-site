import { motion } from 'framer-motion'
import { useDueloStore } from '../store/useDueloStore'
import { useLanguage } from '../../../../context/LanguageContext'
import './DueloVitoria.css'

export default function DueloVitoria({ onRevanche, onMenu }) {
  const { t } = useLanguage()
  const store = useDueloStore()
  return (
    <div className="duelo-vitoria">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
        <span className="duelo-vitoria__emoji">🏆</span>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="duelo-vitoria__titulo">
        {t('games.duelo.vitoria')}!
      </motion.h1>
      <p className="duelo-vitoria__info">
        {t('games.duelo.lp_restante', { n: store.playerLP })} · {t('games.duelo.turnos', { n: store.turnNumber })}
      </p>
      <div className="duelo-vitoria__actions">
        <button onClick={onRevanche} className="duelo-vitoria__btn duelo-vitoria__btn--revanche">
          {t('games.duelo.btn_jogar_novamente')}
        </button>
        <button onClick={onMenu} className="duelo-vitoria__btn duelo-vitoria__btn--menu">
          {t('games.duelo.btn_voltar_menu')}
        </button>
      </div>
    </div>
  )
}
