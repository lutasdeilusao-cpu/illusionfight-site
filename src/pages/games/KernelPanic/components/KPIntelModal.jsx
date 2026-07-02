export default function KPIntelModal({ cards, onClose }) {
  if (!cards || cards.length === 0) return null
  return (
    <div className="inspect-overlay show" style={{ zIndex: 260 }}>
      <div className="inspect-box">
        <div className="ib-type">INTELIGÊNCIA</div>
        <div className="ib-name">Cartas reveladas</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              background: 'var(--grove)', border: '1px solid var(--sage)',
              padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: 'var(--fs-sm)',
            }}>
              {c.name}
            </div>
          ))}
        </div>
        <button className="btn-inspect-close" onClick={onClose}>FECHAR</button>
      </div>
    </div>
  )
}
