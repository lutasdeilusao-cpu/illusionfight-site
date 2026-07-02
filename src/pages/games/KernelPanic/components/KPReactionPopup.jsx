export default function KPReactionPopup({ open, card, onReact, onDecline }) {
  if (!open) return null
  return (
    <div className="shot-overlay show" style={{ zIndex: 95 }}>
      <div className="shot-box" style={{ borderColor: '#ff00aa' }}>
        <h2 style={{ color: '#ff00aa' }}>REAÇÃO</h2>
        <div className="shot-sub">Uma carta de reação está disponível</div>
        <div className="shot-section-label">Disparar {card?.name}?</div>
        <div className="shot-summary">
          Permite um segundo disparo com metade da geração de Exposição.
        </div>
        <div className="shot-actions">
          <button className="btn-fire" onClick={onReact} style={{ background: '#ff00aa', borderColor: '#ff00aa' }}>
            USAR
          </button>
          <button className="btn-cancel-shot" onClick={onDecline}>
            DECLINAR
          </button>
        </div>
      </div>
    </div>
  )
}
