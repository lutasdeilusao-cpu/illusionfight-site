import { useLanguage } from '../../../../context/LanguageContext'
import './OrderingModal.css'

export default function OrderingModal({ playerTeamOrder, setPlayerTeamOrder, onConfirm }) {
  const { t } = useLanguage()
  return (
    <div className="atb-ordering-overlay">
      <div className="atb-ordering-modal">
        <div className="atb-ordering-title">{t('prototype.arena_testbed.ordering_title')}</div>
        <div className="atb-ordering-subtitle">{t('prototype.arena_testbed.ordering_subtitle')}</div>
        <div className="atb-ordering-list">
          {playerTeamOrder.map((ch, idx) => {
            const prevSameAgi = idx > 0 && playerTeamOrder[idx - 1].agi === ch.agi
            const nextSameAgi = idx < playerTeamOrder.length - 1 && playerTeamOrder[idx + 1].agi === ch.agi
            const isMovable = prevSameAgi || nextSameAgi
            return (
              <div key={ch.id} className={`atb-ordering-row ${isMovable ? 'movable' : 'locked'}`}>
                <div className="atb-ordering-position">{idx + 1}º</div>
                <div className="atb-ordering-name">{ch.nome}</div>
                <div className="atb-ordering-agi">AGI {ch.agi}</div>
                <div className="atb-ordering-arrows">
                  <button
                    className="atb-ordering-btn"
                    disabled={!isMovable || idx === 0 || playerTeamOrder[idx - 1].agi !== ch.agi}
                    onClick={() => {
                      const novo = [...playerTeamOrder]
                      ;[novo[idx - 1], novo[idx]] = [novo[idx], novo[idx - 1]]
                      setPlayerTeamOrder(novo)
                    }}
                  >▲</button>
                  <button
                    className="atb-ordering-btn"
                    disabled={!isMovable || idx === playerTeamOrder.length - 1 || playerTeamOrder[idx + 1].agi !== ch.agi}
                    onClick={() => {
                      const novo = [...playerTeamOrder]
                      ;[novo[idx], novo[idx + 1]] = [novo[idx + 1], novo[idx]]
                      setPlayerTeamOrder(novo)
                    }}
                  >▼</button>
                </div>
              </div>
            )
          })}
        </div>
        <button className="atb-ordering-confirm" onClick={onConfirm}>
          ✓ {t('prototype.arena_testbed.btn_confirm_order')}
        </button>
      </div>
    </div>
  )
}