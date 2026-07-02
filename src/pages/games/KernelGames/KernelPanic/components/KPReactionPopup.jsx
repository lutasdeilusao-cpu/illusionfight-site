import { useKpI18n } from '../hooks/useKpI18n'

export default function KPReactionPopup({ open, card, onReact, onDecline }) {
  const { t } = useKpI18n()
  if (!open) return null
  return (
    <div className="shot-overlay show" style={{ zIndex: 95 }}>
      <div className="shot-box" style={{ borderColor: '#ff00aa' }}>
        <h2 style={{ color: '#ff00aa' }}>{t('kp.reaction.titulo')}</h2>
        <div className="shot-sub">{t('kp.reaction.disponivel')}</div>
        <div className="shot-section-label">{t('kp.reaction.disparar', { card: card?.name })}</div>
        <div className="shot-summary">
          {t('kp.reaction.descricao')}
        </div>
        <div className="shot-actions">
          <button className="btn-fire" onClick={onReact} style={{ background: '#ff00aa', borderColor: '#ff00aa' }}>
            {t('kp.reaction.usar')}
          </button>
          <button className="btn-cancel-shot" onClick={onDecline}>
            {t('kp.reaction.declinar')}
          </button>
        </div>
      </div>
    </div>
  )
}
