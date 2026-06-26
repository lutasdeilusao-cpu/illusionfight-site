import { useLanguage } from '../../../../context/LanguageContext'

export default function StatusBar({ card }) {
  const { t } = useLanguage()
  if (!card) {
    return (
      <div className="duelo-statusbar">
        <span className="duelo-statusbar-hint">{t('games.duelo.hint_toque')}</span>
      </div>
    )
  }

  const isMonster = card.type === 'MONSTER'

  return (
    <div className="duelo-statusbar">
      <div className="duelo-statusbar-inner">
        <span className="duelo-statusbar-name">{card.name}</span>
        {isMonster && (
          <>
            <span className="duelo-statusbar-atk">{t('games.duelo.card_atk')} {card.atk} / {t('games.duelo.card_def')} {card.def}</span>
            <span className="duelo-statusbar-movrng">👟{card.mov} 🎯{card.rng}</span>
          </>
        )}
        {!isMonster && card.type === 'SPELL' && (
          <span className="duelo-statusbar-type">{t('games.duelo.card_magia')} {card.duracao > 0 ? `(${card.duracao} turnos)` : ''}</span>
        )}
        {!isMonster && card.type === 'TRAP' && (
          <span className="duelo-statusbar-type">{t('games.duelo.card_armadilha')} (área: {card.area})</span>
        )}
        <span className="duelo-statusbar-desc">{card.desc}</span>
      </div>
    </div>
  )
}
