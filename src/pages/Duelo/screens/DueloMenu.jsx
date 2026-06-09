import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useNavigate } from 'react-router-dom'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'

export default function DueloMenu({ onStart }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  return (
    <div className="duel-menu-wrap">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="duel-menu-header">
        <p className="duel-menu-label">{t('games.duelo.subtitulo')}</p>
        <h1 className="duel-menu-title">{t('games.duelo.titulo')}</h1>
        <p className="duel-menu-sub">{t('games.duelo.subtitulo')}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="duel-menu-card">
        <p className="duel-menu-desc">
          {t('games.duelo.descricao')}<br />
          {t('games.duelo.descricao2')}<br />
          {t('games.duelo.descricao3')}
        </p>
        <button onClick={onStart} className="duel-menu-btn">
          {t('games.duelo.iniciar')}
        </button>
      </motion.div>

      <div className="duel-menu-stats">
        <span>{t('games.duelo.lp')} 8000</span>
        <span>·</span>
        <span>5 {t('games.duelo.cartas')}</span>
        <span>·</span>
        <span>{t('games.duelo.vs_ia')}</span>
      </div>

      <BackToGamesBtn onClick={() => navigate('/games')} />
    </div>
  )
}
