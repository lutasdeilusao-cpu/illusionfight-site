import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useSwipe } from '../hooks/useSwipe'
import banner01 from '../assets/images/banners/banner-01.png'
import banner02 from '../assets/images/banners/banner-02.png'
import banner03 from '../assets/images/banners/banner-03.png'
import banner04 from '../assets/images/banners/banner-04.png'
import banner05 from '../assets/images/banners/banner-05.png'
import './HeroSlideshow.css'

const AUTOPLAY_MS = 6000
const SLIDE_COUNT = 5

const BANNERS = [banner01, banner02, banner03, banner04, banner05]

const SLIDE_KEYS = [
  { key: 'slide1', link1: '/livro', link2: '/mundo' },
  { key: 'slide2', link1: '/webtoon', link2: null },
  { key: 'slide3', link1: '/games', link2: null },
  { key: 'slide4', link1: '/musicas', link2: null },
  { key: 'slide5', link1: '/loja', link2: '/assinar' },
]

export default function HeroSlideshow() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)
  const containerRef = useRef(null)

  const goTo = useCallback((index) => {
    setActiveIndex((index + SLIDE_COUNT) % SLIDE_COUNT)
  }, [])

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDE_COUNT)
  }, [])

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SLIDE_COUNT) % SLIDE_COUNT)
  }, [])

  // Auto-play
  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(goNext, AUTOPLAY_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [paused, goNext])

  // Swipe
  useSwipe(containerRef, (_, dx) => {
    if (dx > 0) goPrev()
    else if (dx < 0) goNext()
  })

  return (
    <section
      className="hero-slideshow"
      id="hero"
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-slideshow__track">
        {BANNERS.map((src, i) => (
          <div
            key={i}
            className={`hero-slideshow__slide${i === activeIndex ? ' hero-slideshow__slide--active' : ''}`}
          >
            <img src={src} alt="" />
          </div>
        ))}
      </div>

      <div className="hero-slideshow__overlay" />

      <div className="hero-slideshow__content">
        <span className="hero-slideshow__tag">{t(`hero.${SLIDE_KEYS[activeIndex].key}.tag`)}</span>
        <h1 className="hero-slideshow__title">{t(`hero.${SLIDE_KEYS[activeIndex].key}.titulo`)}</h1>
        <p className="hero-slideshow__subtitle">{t(`hero.${SLIDE_KEYS[activeIndex].key}.subtitulo`)}</p>
        <div className="hero-slideshow__actions">
          <button
            className="hero-slideshow__cta--primary"
            onClick={() => navigate(SLIDE_KEYS[activeIndex].link1)}
          >
            {t(`hero.${SLIDE_KEYS[activeIndex].key}.cta1`)}
          </button>
          {SLIDE_KEYS[activeIndex].link2 && (
            <button
              className="hero-slideshow__cta--secondary"
              onClick={() => navigate(SLIDE_KEYS[activeIndex].link2)}
            >
              {t(`hero.${SLIDE_KEYS[activeIndex].key}.cta2`)}
            </button>
          )}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="hero-slideshow__dots">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            className={`hero-slideshow__dot${i === activeIndex ? ' hero-slideshow__dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button className="hero-slideshow__arrow hero-slideshow__arrow--prev" onClick={goPrev} aria-label="Anterior">
        ‹
      </button>
      <button className="hero-slideshow__arrow hero-slideshow__arrow--next" onClick={goNext} aria-label="Próximo">
        ›
      </button>
    </section>
  )
}
