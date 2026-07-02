import { useKpI18n } from '../hooks/useKpI18n'

export default function KPInspectModal({ card, onClose }) {
  const { t } = useKpI18n()
  if (!card) return null
  const kind = card.kind || card.type
  return (
    <div className="inspect-overlay show">
      <div className="inspect-box">
        <div className="ib-type">{kind}</div>
        <div className="ib-name">{card.name}</div>
        {card.bonus !== undefined && (
          <div className={`ib-bonus ${card.bonus >= 0 ? 'pos' : 'neg'}`}>
            {card.bonus > 0 ? '+' : ''}{card.bonus}
          </div>
        )}
        {card.desc && <div className="ib-desc">{card.desc}</div>}
        {card.attr && <div className="ib-slot">{t('kp.inspect.atributo', { attr: card.attr })}</div>}
        {card.trigger && <div className="ib-slot">{t('kp.inspect.trigger', { trigger: card.trigger })}</div>}
        <button className="btn-inspect-close" onClick={onClose}>{t('kp.inspect.fechar')}</button>
      </div>
    </div>
  )
}
