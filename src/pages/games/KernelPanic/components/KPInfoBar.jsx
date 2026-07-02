export default function KPInfoBar({ round, currentPlayer, deckCount, cemeteryCount, terrainName }) {
  return (
    <div className="info-bar">
      <div className="info-cell">
        <span className="ic-label">Ciclo</span>
        <span className="ic-val">{round}</span>
      </div>
      <div className="info-cell">
        <span className="ic-label">Operador</span>
        <span className="ic-val">J{currentPlayer + 1}</span>
      </div>
      <div className="info-cell">
        <span className="ic-label">Stack</span>
        <span className="ic-val">{deckCount}</span>
      </div>
      <div className="info-cell">
        <span className="ic-label">Lixo</span>
        <span className="ic-val">{cemeteryCount}</span>
      </div>
    </div>
  )
}
