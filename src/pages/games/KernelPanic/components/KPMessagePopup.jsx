export default function KPMessagePopup({ message, onClose }) {
  if (!message) return null
  return (
    <div className="msg-overlay show">
      <div className="msg-box">
        <p>{message.text || message}</p>
        <button className="btn-msg-close" onClick={onClose}>OK</button>
      </div>
    </div>
  )
}
