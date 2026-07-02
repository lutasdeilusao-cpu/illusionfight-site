import { useKpI18n } from '../hooks/useKpI18n'

export default function KPMessagePopup({ message, onClose }) {
  const { t } = useKpI18n()
  if (!message) return null
  return (
    <div className="msg-overlay show">
      <div className="msg-box">
        <p>{message.text || message}</p>
        <button className="btn-msg-close" onClick={onClose}>{t('kp.message.ok')}</button>
      </div>
    </div>
  )
}
