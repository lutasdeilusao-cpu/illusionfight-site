export default function KPVictoryScreen({ winner, onRestart, onMenu }) {
  return (
    <div className="victory-overlay show">
      <div className="victory-title">
        {winner === 0 ? 'VITÓRIA' : 'DERROTA'}
      </div>
      <div className="victory-sub">
        {winner === 0 ? 'Operador venceu o confronto!' : 'IA dominou o sistema...'}
      </div>
      <button className="btn-restart" onClick={onRestart}>REVANCHE</button>
      <button className="btn-restart" onClick={onMenu} style={{ borderColor: 'var(--olive)', color: 'var(--ghost)' }}>MENU</button>
    </div>
  )
}
