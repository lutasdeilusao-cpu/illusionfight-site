import { useLanguage } from '../../../../context/LanguageContext'
import './CombatHUD.css'

export default function CombatHUD({ characters, currentChar, onCharClick, hpAnterior = {} }) {
  const { t } = useLanguage()
  return (
    <div className="atb-hud">
      {characters.filter(c => c.vivo).map(ch => {
        const isActive = ch.id === currentChar?.id
        const hpAntigo = hpAnterior[ch.id] ?? ch.hp
        const hpPct = (ch.hp / ch.hpMax) * 100
        const antigoPct = (hpAntigo / ch.hpMax) * 100
        const perdeuHP = hpAntigo > ch.hp
        return (
          <div
            key={ch.id}
            className={`atb-hud-chip ${isActive ? 'atb-hud-chip--active' : ''}`}
            onClick={() => onCharClick(ch)}
          >
            <div className={`atb-hud-dot ${ch.time}`} />
            <div className="atb-hud-info">
              <div className="atb-hud-name">{ch.nome}</div>
              <div className="atb-hud-bars">
                <div className="atb-hud-bar-row">
                  <div className="atb-hud-bar-track">
                    {perdeuHP && <div className="atb-hud-bar-fill hp-delta" style={{ '--pct': `${antigoPct}%` }} />}
                    <div className="atb-hud-bar-fill hp" style={{ '--pct': `${hpPct}%` }} />
                  </div>
                </div>
                <div className="atb-hud-bar-row">
                  <div className="atb-hud-bar-track">
                    <div className="atb-hud-bar-fill mp" style={{ '--pct': `${(ch.mp / ch.mpMax) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}