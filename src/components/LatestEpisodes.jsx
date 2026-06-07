import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import thumbEp00 from '../assets/images/episodes/thumb-ep00.png'
import episodios from '../data/episodios.json'
import './LatestEpisodes.css'

export default function LatestEpisodes() {
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  const ref = useScrollReveal()

  const placeholderEpisodes = [
    { id: 'placeholder-1', numero: '01', titulo: t('episodes.titles.1'), tier: 'PREMIUM' },
    { id: 'placeholder-2', numero: '02', titulo: t('episodes.titles.2'), tier: 'PREMIUM' },
  ]

  const fraseKey = locale === 'en' ? 'frase_en' : locale === 'es' ? 'frase_es' : 'frase_pt'

  return (
    <section ref={ref} className="episodes reveal" id="episodios">
      <div className="container">
        <h2 className="section-title">{t('episodes.title')}</h2>
        <div className="episodes__grid">
          {episodios.filter(ep => ep.publicado).map(ep => (
            <div key={ep.id} className="episode-card" onClick={() => navigate(`/webtoon/${ep.id}`)}>
              <div className="episode-card-image-wrapper">
                <img src={thumbEp00} alt={ep.titulo_pt} className="episode-card-image" />
                <div className="episode-card-overlay">
                  <p className="episode-card-quote">"{ep[fraseKey]}"</p>
                  <span className="episode-card-badge episode-card-badge--FREE">{t('episodes.badge.free')}</span>
                </div>
              </div>
              <div className="episode-card-footer">
                <span className="episode-card-number">EP. {String(ep.numero).padStart(2, '0')}</span>
                <h3 className="episode-card-title">{ep.titulo_pt}</h3>
              </div>
            </div>
          ))}
          {placeholderEpisodes.map(ep => (
            <div key={ep.id} className="episode-card">
              <div className="episode-card-image-wrapper">
                <div className="episode-card-thumb-placeholder">
                  <span>{t('episodes.thumbnail')}</span>
                </div>
              </div>
              <div className="episode-card-footer">
                <span className="episode-card-number">EP. {ep.numero}</span>
                <h3 className="episode-card-title">{ep.titulo}</h3>
                <span className="episode-card-badge episode-card-badge--PREMIUM">{ep.tier}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="episodes__footer">
          <button className="btn btn--outline">{t('episodes.cta')}</button>
        </div>
      </div>
    </section>
  )
}
