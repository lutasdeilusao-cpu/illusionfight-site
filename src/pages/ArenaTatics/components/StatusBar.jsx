export default function StatusBar({ personagens = [], lado = 'aliado' }) {
  return (
    <div className={`tatics-statusbar ${lado === 'aliado' ? 'statusbar-aliado' : 'statusbar-inimigo'}`}>
      {personagens.map(p => {
        const pct = p.hp / p.hpMax
        return (
          <div key={p.id} className="tatics-status-card">
            <div className="tatics-status-header">
              <span className="tatics-status-nome">{p.nome}</span>
              <span className="tatics-status-hp">{p.hp}/{p.hpMax}</span>
            </div>
            <div className="tatics-status-bar-bg">
              <div className="tatics-status-bar-fill" style={{
                width: `${pct * 100}%`,
                '--fill-color': pct > 0.5 ? 'var(--cor-lado)' : pct > 0.25 ? '#F4A227' : '#E24B4A',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
