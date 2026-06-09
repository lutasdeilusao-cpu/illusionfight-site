export default function LPDisplay({ lp, isPlayer }) {
  const maxLp = 1000
  const pct = Math.max(0, Math.min(100, (lp / maxLp) * 100))
  const isLow = lp < 300
  const isCrit = lp < 150

  let color = '#F5A623'
  if (isLow) color = '#EF4444'
  if (isCrit) color = '#DC143C'

  return (
    <div className={`duelo-lp ${isPlayer ? 'duelo-lp--player' : 'duelo-lp--ai'} ${isCrit ? 'duelo-lp--critical' : ''}`}>
      <span className="duelo-lp-label">{isPlayer ? 'LP' : 'IA'}</span>
      <div className="duelo-lp-bar-track">
        <div className="duelo-lp-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="duelo-lp-val" style={{ color }}>{lp}</span>
    </div>
  )
}
