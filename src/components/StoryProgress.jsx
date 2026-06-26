import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { JOGOS } from '../pages/games/Games'
import './StoryProgress.css'

export default function StoryProgress() {
  const ref = useScrollReveal()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const lancados = JOGOS.filter(j => j.badgeKey === 'site.games.badges.lancado')
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (lancados.length <= 1) return
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % lancados.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [lancados.length])

  if (lancados.length === 0) return null

  const jogo = lancados[current]

  return (
    <section ref={ref} className="progress reveal">
      <div className="container">
        <h2 className="section-title">{t('progress.title')}</h2>
        <div className="games-carousel">
          <div
            className="games-carousel-card"
            onClick={() => navigate(jogo.rota)}
            style={{ '--cor-neon': jogo.cor }}
          >
            <div className="games-carousel-emoji">{jogo.emoji}</div>
            <div className="games-carousel-info">
              <span className="games-carousel-nome">{t(jogo.nomeKey)}</span>
              <span className="games-carousel-tag">{t(jogo.tagKey)}</span>
            </div>
            <span className="games-carousel-badge">{t(jogo.badgeKey)}</span>
          </div>
          {lancados.length > 1 && (
            <div className="games-carousel-dots">
              {lancados.map((_, i) => (
                <span key={i} className={`games-carousel-dot${i === current ? ' games-carousel-dot--active' : ''}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}