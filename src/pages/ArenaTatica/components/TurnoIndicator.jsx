export default function TurnoIndicator({ turno, fase }) {
  return (
    <div style={{
      textAlign: 'center', padding: '4px 0',
      fontFamily: 'Courier New', fontSize: '0.65rem',
      color: fase === 'player' ? '#00ff88' : fase === 'inimigo' ? '#ff4444' : '#888',
      letterSpacing: '0.15em',
    }}>
      {fase === 'player' ? '⚔️ SEU TURNO' : fase === 'inimigo' ? '⏳ INIMIGO AGINDO...' : `TURNO ${turno}`}
      <span style={{ marginLeft: 8, color: '#555' }}>· RODADA {turno}</span>
    </div>
  )
}
