import { useLanguage } from '../context/LanguageContext'
import './LatestEpisodes.css'

const EPISODE_DATA = [
  { id: 1, number: 1, titleKey: 'episodes.titles.0', premium: false },
  { id: 2, number: 2, titleKey: 'episodes.titles.1', premium: false },
  { id: 3, number: 3, titleKey: 'episodes.titles.2', premium: true },
]

export default function LatestEpisodes() {
  const { t } = useLanguage()

  return (
    <section className="episodes" id="episodios">
      <div className="container">
        <h2 className="section-title">{t('episodes.title')}</h2>
        <div className="episodes__grid">
          {EPISODE_DATA.map(ep => (
            <div key={ep.id} className="episode__card">
              <div className="episode__thumb">
                <span>{t('episodes.thumbnail')}</span>
              </div>
              <div className="episode__info">
                <span className="episode__number">EP. {String(ep.number).padStart(2, '0')}</span>
                <h3 className="episode__title">{t(ep.titleKey)}</h3>
                <span className={`episode__badge badge--${ep.premium ? 'premium' : 'free'}`}>
                  {ep.premium ? t('episodes.badge.premium') : t('episodes.badge.free')}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="episodes__footer">
          <button className="btn btn--outline">{t('episodes.cta')}</button>
        </div>

        <div className="episodes__webtoon">
          <p className="episodes__webtoon-text">{t('episodes.webtoon.text')}</p>
          <p className="episodes__webtoon-subs">— {t('episodes.webtoon.subscribers')}</p>
          <a href="#" className="btn btn--outline">{t('episodes.webtoon.cta')}</a>
        </div>
      </div>
    </section>
  )
}
