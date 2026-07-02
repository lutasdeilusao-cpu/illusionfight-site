const PERIGO_MAX = 15

function PipRow({ value }) {
  const pips = []
  for (let i = 0; i < PERIGO_MAX; i++) {
    let cls = 'perigo-pip'
    if (i < value) {
      cls += value <= 5 ? ' low' : value <= 10 ? ' mid' : ' high'
    }
    pips.push(<div key={i} className={cls} />)
  }
  return <div className="perigo-track">{pips}</div>
}

export default function KPPerigoMeter({ players }) {
  return (
    <div className="perigo-row">
      {players.map((pl, i) => (
        <div key={i} className="perigo-card">
          <div className="perigo-label">J{i + 1}</div>
          <PipRow value={pl.perigo} />
          <div className={`perigo-value ${pl.perigo >= 10 ? 'danger' : ''}`}>{pl.perigo}</div>
        </div>
      ))}
    </div>
  )
}
