import { lazy, Suspense } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useScrollReveal } from '../../../hooks/useScrollReveal'
import HeroSlideshow from './components/HeroSlideshow'
import LatestEpisodes from './components/LatestEpisodes'
import CharactersRow from './components/CharactersRow'
import DeferredSection from '../../../components/DeferredSection'
import './Home.css'

const BookChaptersRow = lazy(() => import('./components/BookChaptersRow'))
const MusicSection = lazy(() => import('./components/MusicSection'))
const NowLive = lazy(() => import('./components/NowLive'))
const StoryProgress = lazy(() => import('./components/StoryProgress'))

export default function Home() {
  const newsletterRef = useScrollReveal()
  const { t, locale } = useLanguage()
  const ogLocale = locale === 'en' ? 'en_US' : locale === 'es' ? 'es_ES' : 'pt_BR'

  return (
    <div className="home-page">
      <Helmet>
        <title>{t('home.meta_title')}</title>
        <meta name="description" content={t('home.meta_description')} />
        <meta property="og:title" content={t('home.meta_title')} />
        <meta property="og:description" content={t('home.og_description')} />
        <meta property="og:url" content="https://illusionfight.com/" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={ogLocale} />
      </Helmet>
      <HeroSlideshow />
      <LatestEpisodes />
      <CharactersRow />
      <DeferredSection size="large"><Suspense fallback={null}><BookChaptersRow /></Suspense></DeferredSection>
      <DeferredSection><Suspense fallback={null}><MusicSection /></Suspense></DeferredSection>
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
      <DeferredSection size="small"><Suspense fallback={null}><NowLive /></Suspense></DeferredSection>
      <DeferredSection><Suspense fallback={null}><StoryProgress /></Suspense></DeferredSection>
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
    </div>
  )
}
