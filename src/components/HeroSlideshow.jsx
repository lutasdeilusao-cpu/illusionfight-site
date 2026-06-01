import { useState, useEffect } from 'react'
import { useSlideshow } from '../hooks/useSlideshow'
import { useLanguage } from '../context/LanguageContext'
import TypewriterPhrase from './TypewriterPhrase'
import HeroEffect from './HeroEffect'
import banner01 from '../assets/images/banners/banner-01.png'
import banner02 from '../assets/images/banners/banner-02.png'
import banner03 from '../assets/images/banners/banner-03.png'
import banner04 from '../assets/images/banners/banner-04.png'
import logopt from '../assets/images/logos/logo-pt.png'
import logoen from '../assets/images/logos/logo-en.png'
import './HeroSlideshow.css'

const BANNERS = [banner01, banner02, banner03, banner04]

const LOGO_MAP = {
  pt: logopt,
  en: logoen,
}

export default function HeroSlideshow() {
  const { t, locale } = useLanguage()
  const { currentImage, nextImage, activeIndex, enteringIndex, isTransitioning } = useSlideshow(BANNERS)
  const [showEntering, setShowEntering] = useState(false)
  const logoPath = LOGO_MAP[locale]

  useEffect(() => {
    if (isTransitioning) {
      requestAnimationFrame(() => setShowEntering(true))
    } else {
      setShowEntering(false)
    }
  }, [isTransitioning])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const title = t('hero.title')

  const slideClass = (index, type) => {
    if (type === 'active' && index === activeIndex && !isTransitioning) return 'hero-slideshow__slide--active'
    if (type === 'exiting' && index === activeIndex && isTransitioning) return 'hero-slideshow__slide--exiting'
    return ''
  }

  return (
    <section className="hero-slideshow" id="hero">
      <div className="hero-slideshow__layers">
        <div className={`hero-slideshow__slide ${slideClass(activeIndex, isTransitioning ? 'exiting' : 'active')}${isTransitioning ? '' : ''}`}>
          <img
            src={currentImage}
            alt=""
            className={`ken-burns-${activeIndex}`}
          />
        </div>

        {isTransitioning && enteringIndex !== null && (
          <div className={`hero-slideshow__slide hero-slideshow__slide--entering${showEntering ? ' is-visible' : ''}`}>
            <img
              src={nextImage}
              alt=""
              className={`ken-burns-${enteringIndex}`}
            />
          </div>
        )}
      </div>

      <div className="hero-slideshow__overlay-bottom" />
      <div className="hero-slideshow__overlay-left" />
      <HeroEffect />
      <div className="hero-slideshow__scanlines" />

      <div className="hero-slideshow__content">
        {logoPath ? (
          <div className="hero-slideshow__logo-wrapper glitch-image">
            <img src={logoPath} alt={title} className="hero-slideshow__logo" />
          </div>
        ) : (
          <h1 className="hero-slideshow__title glitch" data-text={title}>
            <span aria-hidden="true">{title}</span>
            {title}
            <span aria-hidden="true">{title}</span>
          </h1>
        )}
        <TypewriterPhrase />
        <div className="hero-slideshow__actions">
          <button className="btn btn--primary" onClick={() => scrollTo('episodios')}>{t('hero.cta.primary')}</button>
          <button className="btn btn--outline" onClick={() => scrollTo('sobre')}>{t('hero.cta.secondary')}</button>
        </div>
      </div>

      <div className="hero-slideshow__scroll">
        <span className="hero-slideshow__scroll-line" />
      </div>
    </section>
  )
}
