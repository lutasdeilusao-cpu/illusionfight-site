import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { CLASSES } from '../data/classes'
import { getCorPorElemental } from '../data/cosmeticos'

export default function PreBatalha({ aliados, inimigos, onIniciar }) {
  const { t } = useLanguage()
  return (
    <div className="pb-wrap">
      <div className="pb-header">{t('games.tatics.pre_batalha')}</div>

      <div className="pb-body">
        {/* Aliados */}
        <div>
          <div className="pb-section-title" style={{ color: '#00ff88' }}>{t('games.tatics.seu_time')}</div>
          {aliados.map(a => {
            const cor = getCorPorElemental(a.elemental || 'fogo')
            return (
              <div key={a.id} className="pb-card" style={{ border: `1px solid ${cor}33` }}>
                <div className="pb-card-name">{a.nome}</div>
                <div className="pb-card-detail">{CLASSES[a.classe]?.nome} · {t('games.tatics.nivel')}{a.nivel}</div>
              </div>
            )
          })}
        </div>

        {/* VS */}
        <div className="pb-vs">
          <span className="pb-vs-text">{t('games.tatics.vs')}</span>
        </div>

        {/* Inimigos */}
        <div>
          <div className="pb-section-title" style={{ color: '#ff4444' }}>{t('games.tatics.inimigos')}</div>
          {inimigos.map(i => (
            <div key={i.nome} className="pb-card" style={{ border: '1px solid #ff444433' }}>
              <div className="pb-card-name">{i.nome}</div>
              <div className="pb-card-detail">{CLASSES[i.classe]?.nome} · {t('games.tatics.nivel')}{i.nivel} · {t('games.tatics.tier')} {i.tier || '?'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Batalha info */}
      <div className="pb-battle-info">
        A arena se materializa ao redor. O SBI sincroniza.
      </div>

      <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
        onClick={onIniciar} className="pb-start-btn">
        {t('games.tatics.iniciar_batalha')}
      </motion.button>
    </div>
  )
}
