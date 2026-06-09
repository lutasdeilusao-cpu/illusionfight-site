import { useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import './StoryProgress.css'

/**
 * 5 últimas atualizações do site (itens já lançados/disponíveis).
 * Ordem: do mais recente para o mais antigo.
 * { track, item } → aponta para progress.tracks[track].items[item]
 */
const RECENT_UPDATES = [
  { track: 3, item: 6 },  // GAMES → LDI Tatics — Novo
  { track: 3, item: 8 },  // GAMES → Duelo LDI — Beta
  { track: 3, item: 7 },  // GAMES → MiniGames — Free
  { track: 4, item: 4 },  // LOJA → Skin Karuak — Disponível
  { track: 4, item: 3 },  // LOJA → 1000 Fichas + Bônus — Disponível
]

const AREA_COLORS = ['#00B4D8', '#A855F4', '#F5A623', '#22C55E', '#FF4500']

export default function StoryProgress() {
  const ref = useScrollReveal()
  const { t } = useLanguage()
  const listRef = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const items = el.querySelectorAll('.update-item')
          items.forEach((item, i) => {
            setTimeout(() => item.classList.add('is-visible'), i * 150)
          })
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="progress reveal">
      <div className="container">
        <h2 className="section-title">{t('progress.title')}</h2>
        <div className="updates-list" ref={listRef}>
          {RECENT_UPDATES.map((u, i) => {
            const formatKey = `progress.tracks.${u.track}.format`
            const labelKey = `progress.tracks.${u.track}.items.${u.item}.label`
            const statusKey = `progress.tracks.${u.track}.items.${u.item}.status`
            const areaColor = AREA_COLORS[u.track] || '#888'

            return (
              <div key={i} className="update-item">
                <div className="update-item__badge" style={{ '--area-color': areaColor }}>
                  {t(formatKey)}
                </div>
                <div className="update-item__content">
                  <span className="update-item__label">{t(labelKey)}</span>
                  <span className="update-item__status">{t(statusKey)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
