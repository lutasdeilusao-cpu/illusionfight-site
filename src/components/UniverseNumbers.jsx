import { useAnimatedCounter } from '../hooks/useAnimatedCounter'
import { useLanguage } from '../context/LanguageContext'
import './UniverseNumbers.css'

const STATS_DATA = [
  { value: 3000000000, format: true, labelKey: 'stats.labels.0' },
  { value: 2030, format: false, labelKey: 'stats.labels.1' },
  { value: 100, suffix: '%', format: false, labelKey: 'stats.labels.2' },
]

function StatCard({ target, labelKey, format, suffix }) {
  const { t } = useLanguage()
  const { ref, display } = useAnimatedCounter(target, { format, suffix })

  return (
    <div className="stat__card">
      <span ref={ref} className="stat__number">
        {display}{suffix || ''}
      </span>
      <span className="stat__label">{t(labelKey)}</span>
    </div>
  )
}

export default function UniverseNumbers() {
  const { t } = useLanguage()

  return (
    <section className="stats">
      <div className="container">
        <h2 className="section-title">{t('stats.title')}</h2>
        <div className="stats__grid">
          {STATS_DATA.map((s, i) => (
            <StatCard key={i} target={s.value} labelKey={s.labelKey} format={s.format} suffix={s.suffix} />
          ))}
        </div>
      </div>
    </section>
  )
}
