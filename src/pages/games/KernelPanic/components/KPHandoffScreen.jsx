export default function KPHandoffScreen({ playerIdx, onContinue }) {
  const prefix = playerIdx === 0 ? 'p1' : 'p2'
  return (
    <div className="handoff-overlay show">
      <div className="handoff-box">
        <div className="handoff-order">NOVO OPERADOR</div>
        <div className={`handoff-player ${prefix}`}>J{playerIdx + 1}</div>
        <div className="handoff-sub">Passe o dispositivo</div>
        <button className="handoff-btn" onClick={onContinue}>PRONTO</button>
        <div className="handoff-reticle" />
      </div>
    </div>
  )
}
