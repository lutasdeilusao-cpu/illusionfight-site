import { useKpI18n } from '../hooks/useKpI18n'

export default function KPTerrainBar({ terrain, roundsLeft, terrainInfo }) {
  const { t } = useKpI18n()
  if (!terrain) return null
  return (
    <div className="terrain-strip">
      <div className="terrain-icon">{terrain.icon}</div>
      <div className="terrain-info">
        <div className="terrain-name">{terrain.name}</div>
        <div className="terrain-desc">{terrain.desc}</div>
      </div>
      <div className="terrain-timer">
        <span>{roundsLeft}</span>
        {roundsLeft === 1 ? t('kp.terrain.ciclo') : t('kp.terrain.ciclos')}
      </div>
    </div>
  )
}
