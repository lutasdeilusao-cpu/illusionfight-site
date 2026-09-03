import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { JOGOS } from '../../../games/Games'
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

  return (
    <section className="progress">
      <div className="container">
        <h2 className="section-title">{t('home.section_games')}</h2>
        <div className="games-carousel">
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
                <span key={item.id} className={`games-carousel-dot${i === current ? ' games-carousel-dot--active' : ''}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
