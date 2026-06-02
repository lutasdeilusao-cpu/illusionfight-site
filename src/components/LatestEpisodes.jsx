import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import thumbEp00 from '../assets/images/episodes/thumb-ep00.png'
import './LatestEpisodes.css'

export default function LatestEpisodes() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  return (
    <section className="episodes" id="episodios">
      <div className="container">
        <h2 className="section-title">{t('episodes.title')}</h2>
        <div className="episodes__grid">
          <div className="episode__card" onClick={() => navigate('/webtoon/00')}>
            <div className="episode__thumb">
              <img src={thumbEp00} alt="Episódio 00" />
            </div>
            <div className="episode__info">
              <span className="episode__number">EP. 00</span>
              <h3 className="episode__title">{t('episodes.titles.0')}</h3>
              <span className="episode__badge badge--free">
                {t('episodes.badge.free')}
              </span>
            </div>
          </div>
          <div className="episode__card">
            <div className="episode__thumb">
              <span>{t('episodes.thumbnail')}</span>
            </div>
            <div className="episode__info">
              <span className="episode__number">EP. 01</span>
              <h3 className="episode__title">{t('episodes.titles.1')}</h3>
              <span className="episode__badge badge--premium">
                {t('episodes.badge.premium')}
              </span>
            </div>
          </div>
          <div className="episode__card">
            <div className="episode__thumb">
              <span>{t('episodes.thumbnail')}</span>
            </div>
            <div className="episode__info">
              <span className="episode__number">EP. 02</span>
              <h3 className="episode__title">{t('episodes.titles.2')}</h3>
              <span className="episode__badge badge--premium">
                {t('episodes.badge.premium')}
              </span>
            </div>
          </div>
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
