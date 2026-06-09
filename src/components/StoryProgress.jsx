import { useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import './StoryProgress.css'

const DONE_MAP = [
  [true, false],
  [true, true, true, false],
  [true, true, false],
  [true, true, true, true, true, true, true, true, true],
  [true, true, true, true, true, false, false, false, false],
]

export default function StoryProgress() {
  const ref = useScrollReveal()
  const { t } = useLanguage()
  const containerRef = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const allItems = el.querySelectorAll('.progress-track__item')
          allItems.forEach((item, i) => {
            setTimeout(() => item.classList.add('is-visible'), i * 120)
          })
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const tracks = ['progress.tracks.0', 'progress.tracks.1', 'progress.tracks.2', 'progress.tracks.3', 'progress.tracks.4']

  return (
    <section ref={ref} className="progress reveal">
      <div className="container">
        <h2 className="section-title">{t('progress.title')}</h2>
        <div className="progress__tracks" ref={containerRef}>
          {tracks.map((trackKey, ti) => {
            const doneRow = DONE_MAP[ti]
            const itemsKey = `${trackKey}.items`
            const count = doneRow.length
            return (
              <div key={ti} className="progress-track">
                <span className="progress-track__format">{t(`${trackKey}.format`)}</span>
                <div className="progress-track__line">
                  {Array.from({ length: count }, (_, i) => {
                    const done = doneRow[i]
                    return (
                      <div key={i} className="progress-track__item">
                        <div className="progress-track__bullet-row">
                          <span className={`progress-track__bullet ${done ? 'progress-track__bullet--done' : 'progress-track__bullet--pending'}`} />
                          {i < count - 1 && (
                            <span className={`progress-track__connector ${done ? 'progress-track__connector--active' : ''}`} />
                          )}
                        </div>
                        <span className={`progress-track__label ${done ? 'progress-track__label--done' : 'progress-track__label--pending'}`}>
                          {t(`${itemsKey}.${i}.label`)}
                        </span>
                        <span className={`progress-track__status ${done ? 'progress-track__status--done' : 'progress-track__status--pending'}`}>
                          {t(`${itemsKey}.${i}.status`)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
