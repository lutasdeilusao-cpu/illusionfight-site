import { lazy, Suspense, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useScrollReveal } from '../../../hooks/useScrollReveal'
import HeroSlideshow from './components/HeroSlideshow'
import { PraVoce } from '../../../components/Recomendacoes/Recomendacoes'
import LatestEpisodes from './components/LatestEpisodes'
import EscolhaCaminho from './components/EscolhaCaminho'
import DeferredSection from '../../../components/DeferredSection'
import './Home.css'

const HomeGames = lazy(() => import('./components/HomeGames'))
const HomeHistorias = lazy(() => import('./components/HomeHistorias'))
const MusicSection = lazy(() => import('./components/MusicSection'))
const NowLive = lazy(() => import('./components/NowLive'))

const DESKTOP = '(min-width: 900px)'

function useDesktop() {
  const [desktop, setDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia(DESKTOP).matches)
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP)
    const mudou = () => setDesktop(mq.matches)
    mq.addEventListener('change', mudou)
    return () => mq.removeEventListener('change', mudou)
  }, [])
  return desktop
}

export default function Home() {
  const newsletterRef = useScrollReveal()
  const { t, locale } = useLanguage()
  const ogLocale = locale === 'en' ? 'en_US' : locale === 'es' ? 'es_ES' : 'pt_BR'
  const desktop = useDesktop()

  const meta = (
    <Helmet>
      <title>{t('home.meta_title')}</title>
      <meta name="description" content={t('home.meta_description')} />
      <meta property="og:title" content={t('home.meta_title')} />
      <meta property="og:description" content={t('home.og_description')} />
      <meta property="og:url" content="https://illusionfight.com/" />
      <meta property="og:image" content="https://illusionfight.com/og/home.jpg" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={ogLocale} />
    </Helmet>
  )

  // Celular: a inicial é só a escolha de caminho (4 cards).
  if (!desktop) {
    return (
      <div className="home-page home-page--caminho">
        {meta}
        <EscolhaCaminho />
      </div>
    )
  }

  return (
    <div className="home-page">
      {meta}
      <HeroSlideshow />
      {/* Quem volta: continuar de onde parou, porque você leu X, novidades. */}
      <PraVoce />
      <DeferredSection size="large"><Suspense fallback={null}><HomeGames /></Suspense></DeferredSection>
      <DeferredSection size="large"><Suspense fallback={null}><HomeHistorias /></Suspense></DeferredSection>
      <LatestEpisodes />
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
