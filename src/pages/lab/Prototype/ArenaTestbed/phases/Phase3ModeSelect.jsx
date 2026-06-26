import { useLanguage } from '../../../../../context/LanguageContext'
import { audio } from '../engine/audioManager'
import './Phase3ModeSelect.css'

export default function Phase3ModeSelect({ onSelectTraining, onBack }) {
  const { t } = useLanguage()

  return (
    <div className="p3-root">
      <div className="p3-card">
        <h2 className="p3-title">{t('prototype.arena_testbed.p3_title')}</h2>
        <p className="p3-subtitle">{t('prototype.arena_testbed.p3_subtitle')}</p>

        <button className="p3-btn p3-btn--training" onClick={() => { audio.confirm(); onSelectTraining() }}>
          <span className="p3-btn-icon">⚔</span>
          <span className="p3-btn-label">{t('prototype.arena_testbed.p3_training')}</span>
        </button>

        <button className="p3-btn p3-btn--campaign" disabled>
          <span className="p3-btn-icon">📜</span>
          <span className="p3-btn-label">{t('prototype.arena_testbed.p3_campaign')}</span>
          <span className="p3-btn-badge">{t('prototype.arena_testbed.p3_soon')}</span>
        </button>

        <button className="p3-back" onClick={() => { audio.cancel(); onBack() }}>
          {t('prototype.arena_testbed.back')}
        </button>
      </div>
    </div>
  )
}
