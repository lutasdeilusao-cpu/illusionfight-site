import { useLanguage } from '../../../context/LanguageContext'

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
  const stars = isMonster ? '★'.repeat(card.level || 0) : ''

  return (
    <div className="duelo-statusbar">
      <div className="duelo-statusbar-inner">
        <span className="duelo-statusbar-name">{card.name}</span>
        {isMonster && (
          <>
            <span className="duelo-statusbar-stars">{stars}</span>
            <span className="duelo-statusbar-atk">{t('games.duelo.card_atk')} {card.atk} / {t('games.duelo.card_def')} {card.def}</span>
          </>
        )}
        {!isMonster && (
          <span className="duelo-statusbar-type">{card.type === 'SPELL' ? t('games.duelo.card_magia') : t('games.duelo.card_armadilha')}</span>
        )}
        <span className="duelo-statusbar-desc">{card.description}</span>
      </div>
    </div>
  )
}
