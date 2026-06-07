import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import HeroSlideshow from '../components/HeroSlideshow'
import LatestEpisodes from '../components/LatestEpisodes'
import CharactersRow from '../components/CharactersRow'
import BookChaptersRow from '../components/BookChaptersRow'
import MusicSection from '../components/MusicSection'
import NowLive from '../components/NowLive'
import StoryProgress from '../components/StoryProgress'
import ShopSection from '../components/ShopSection'

export default function Home() {
  const newsletterRef = useScrollReveal()
  const { t } = useLanguage()

  return (
    <>
      <Helmet>
        <title>{t('pages.helmet.home')}</title>
      </Helmet>
      <HeroSlideshow />
      <LatestEpisodes />
      <CharactersRow />
      <BookChaptersRow />
      <MusicSection />
      <section className="home-support">
        <div className="container">
          <div className="home-support__inner">
            <div className="home-support__content">
              <h2 className="home-support__title">{t('homeSupport.title')}</h2>
              <p className="home-support__text">{t('homeSupport.text')}</p>
            </div>
            <Link to="/assinar" className="home-support__cta">{t('homeSupport.cta')}</Link>
          </div>
        </div>
      </section>
      <NowLive />
      <StoryProgress />
      <section ref={newsletterRef} className="newsletter-cta reveal">
        <div className="container">
          <h3>{t('newsletter.ctaTitulo')}</h3>
          <p>{t('newsletter.ctaDescricao')}</p>
          <a
            href="https://illusionfight.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="newsletter-cta__btn"
          >
            {t('newsletter.ctaBotao')}
          </a>
        </div>
      </section>
      <ShopSection />
    </>
  )
}
