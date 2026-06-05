export default function StatusBar({ personagens = [], lado = 'aliado' }) {
  const cor = lado === 'aliado' ? '#00ff88' : '#ff4444'
  return (
    <div style={{ display: 'flex', gap: 6, padding: '4px 8px' }}>
      {personagens.map(p => (
        <div key={p.id} style={{
          flex: 1, background: '#0d0d0d', border: `1px solid ${cor}33`,
          borderRadius: 8, padding: '4px 8px', minWidth: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span style={{ color: '#eee', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'Courier New', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.nome}
            </span>
            <span style={{ color: cor, fontSize: '0.55rem', fontFamily: 'Courier New' }}>{p.hp}/{p.hpMax}</span>
          </div>
          <div style={{ height: 4, background: '#222', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${(p.hp / p.hpMax) * 100}%`,
              background: p.hp / p.hpMax > 0.5 ? cor : p.hp / p.hpMax > 0.25 ? '#FFD700' : '#FF4444',
              borderRadius: 2, transition: 'width 0.3s',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}
