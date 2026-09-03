import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { JOGOS } from '../../../games/Games'
import HomeSectionHeading from './HomeSectionHeading'
import './StoryProgress.css'

export default function StoryProgress() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const disponiveis = JOGOS.filter(jogo => !jogo.emBreve && jogo.rota)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (disponiveis.length <= 1) return
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % disponiveis.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [disponiveis.length])

  if (disponiveis.length === 0) return null

  const jogo = disponiveis[current]
  const selectGame = index => setCurrent((index + disponiveis.length) % disponiveis.length)

  return (
    <section className="progress">
      <div className="container">
        <HomeSectionHeading eyebrow={t('home.section_games_category')} title={t('home.section_games')} />
        <div className="games-carousel">
          <div className="games-carousel-controls">
            <button type="button" onClick={() => selectGame(current - 1)} aria-label={t('home.game_previous')}>‹</button>
            <span>{String(current + 1).padStart(2, '0')} / {String(disponiveis.length).padStart(2, '0')}</span>
            <button type="button" onClick={() => selectGame(current + 1)} aria-label={t('home.game_next')}>›</button>
          </div>
          <button
            type="button"
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
          </button>
          {disponiveis.length > 1 && (
            <div className="games-carousel-dots">
              {disponiveis.map((item, i) => (
                <button
                  type="button"
                  key={item.id}
                  className={`games-carousel-dot${i === current ? ' games-carousel-dot--active' : ''}`}
                  onClick={() => selectGame(i)}
                  aria-label={`${t('home.game_select')}: ${t(item.nomeKey)}`}
                  aria-current={i === current ? 'true' : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
