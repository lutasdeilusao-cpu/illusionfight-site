import { useLanguage } from '../../../../context/LanguageContext'
import './CharInfoModal.css'

export default function CharInfoModal({ char, onClose }) {
  const { t } = useLanguage()
  if (!char) return null
  return (
    <div className="atb-modal-overlay" onClick={onClose}>
      <div className="atb-modal" onClick={e => e.stopPropagation()}>
        <div className="atb-modal-header">
          <div className={`atb-modal-dot ${char.time}`} />
          <span className="atb-modal-name">{char.nome}</span>
          <button className="atb-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="atb-modal-body">
          <div className="atb-modal-stat">
            <span className="atb-modal-stat-label hp">{t('prototype.arena_testbed.label_hp')}</span>
            <div className="atb-modal-bar-track">
              <div className="atb-modal-bar-fill hp" style={{ '--pct': `${(char.hp / char.hpMax) * 100}%` }} />
            </div>
            <span className="atb-modal-stat-val">{Math.ceil(char.hp)}/{char.hpMax}</span>
          </div>
          <div className="atb-modal-stat">
            <span className="atb-modal-stat-label mp">{t('prototype.arena_testbed.label_mp')}</span>
            <div className="atb-modal-bar-track">
              <div className="atb-modal-bar-fill mp" style={{ '--pct': `${(char.mp / char.mpMax) * 100}%` }} />
            </div>
            <span className="atb-modal-stat-val">{Math.ceil(char.mp)}/{char.mpMax}</span>
          </div>
          <div className="atb-modal-attr-row">
            <span>{t('prototype.arena_testbed.attr_forca')}: {char.forca}</span>
            <span>{t('prototype.arena_testbed.attr_agi')}: {char.agi}</span>
            <span>{t('prototype.arena_testbed.attr_dex')}: {char.dex}</span>
          </div>
          <div className="atb-modal-attr-row">
            <span>{t('prototype.arena_testbed.attr_pdf')}: {char.pdf}</span>
            <span>{t('prototype.arena_testbed.attr_res')}: {char.res}</span>
            <span>{t('prototype.arena_testbed.attr_arm')}: {char.arm}</span>
          </div>
        </div>
      </div>
    </div>
  )
}