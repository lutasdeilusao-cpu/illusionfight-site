import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import PowerDescription from './PowerDescription'
import './PowerCard.css'

const ELEM_ICON = { fogo: '🔥', agua: '💧', terra: '🪨', ar: '🌪️', trevas: '🌑', luz: '✨' }

export default function PowerCard({ poder, selected, atLimit, onToggle, tipoChar }) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`pc-card ${selected ? 'pc-card--sel' : ''} ${atLimit && !selected ? 'pc-card--lim' : ''}`}>
      <button className="pc-btn" onClick={() => onToggle()} disabled={atLimit && !selected}>
        <div className="pc-head">
          <span className="pc-elem">{poder.elemento ? ELEM_ICON[poder.elemento] || '' : '⚙️'}</span>
          <span className="pc-nome">{t('prototype.arena_testbed.' + poder.chaveI18n)}</span>
          <span className="pc-mp">-{poder.custoMP} MP</span>
        </div>
        <div className="pc-bar">
          <span className={`pc-tipo pc-tipo--${poder.gatilho}`}>
            {poder.gatilho === 'ataque'
              ? t('prototype.arena_testbed.power_trigger_attack')
              : t('prototype.arena_testbed.power_trigger_defense')}
          </span>
          {selected && <span className="pc-check">✓</span>}
        </div>
      </button>

      <button className="pc-desc-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? '▲' : '▼'}
      </button>

      {expanded && (
        <PowerDescription texto={t('prototype.arena_testbed.' + poder.chaveI18nDescricao)} />
      )}
    </div>
  )
}
