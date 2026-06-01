import { useParticles } from '../hooks/useParticles'
import { useLanguage } from '../context/LanguageContext'
import logopt from '../assets/images/logos/logo-pt.png'
import logoen from '../assets/images/logos/logo-en.png'
import './Hero.css'

const LOGO_MAP = {
  pt: logopt,
  en: logoen,
}

export default function Hero() {
  const canvasRef = useParticles(60)
  const { t, locale } = useLanguage()
  const logoPath = LOGO_MAP[locale]

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const title = t('hero.title')

  return (
    <section className="hero" id="hero">
      <canvas ref={canvasRef} className="hero__particles" />

      <div className="hero__content">
        {logoPath ? (
          <div className="hero__logo-wrapper glitch-image">
            <img src={logoPath} alt={title} className="hero__logo" />
          </div>
        ) : (
          <h1 className="hero__title glitch" data-text={title}>
            <span aria-hidden="true">{title}</span>
            {title}
            <span aria-hidden="true">{title}</span>
          </h1>
        )}
        <p className="hero__subtitle">{t('hero.subtitle')}</p>
        <div className="hero__actions">
          <button className="btn btn--primary" onClick={() => scrollTo('episodios')}>{t('hero.cta.primary')}</button>
          <button className="btn btn--outline" onClick={() => scrollTo('sobre')}>{t('hero.cta.secondary')}</button>
        </div>
      </div>

      <div className="hero__scroll">
        <span className="hero__scroll-line" />
      </div>
    </section>
  )
}
