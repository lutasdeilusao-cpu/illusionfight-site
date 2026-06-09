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
const BANNER_URLS = BANNERS.map((src) => {
  if (typeof src === 'string') return src
  return src
})

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
  const [prevIndex, setPrevIndex] = useState(-1)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const [staggerKey, setStaggerKey] = useState(0)
  const timerRef = useRef(null)
  const containerRef = useRef(null)

  const goTo = useCallback((index) => {
    setPrevIndex(activeIndex)
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex((index + SLIDE_COUNT) % SLIDE_COUNT)
    setStaggerKey((k) => k + 1)
  }, [activeIndex])

  const goNext = useCallback(() => {
    setPrevIndex(activeIndex)
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % SLIDE_COUNT)
    setStaggerKey((k) => k + 1)
  }, [activeIndex])

  const goPrev = useCallback(() => {
    setPrevIndex(activeIndex)
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + SLIDE_COUNT) % SLIDE_COUNT)
    setStaggerKey((k) => k + 1)
  }, [activeIndex])

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

  const slide = SLIDE_KEYS[activeIndex]
  const isExiting = prevIndex >= 0
  const exitDir = direction

  return (
    <section
      className="hero-slideshow"
      id="hero"
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-slideshow__track">
        {BANNERS.map((src, i) => {
          const isActive = i === activeIndex
          const isPrev = i === prevIndex
          let className = 'hero-slideshow__slide'
          if (isPrev && isExiting) className += ' hero-slideshow__slide--exit'
          if (isPrev && isExiting) className += exitDir > 0 ? ' hero-slideshow__slide--exit-left' : ' hero-slideshow__slide--exit-right'
          if (isActive) className += ' hero-slideshow__slide--active'
          return (
            <div key={i} className={className}>
              <div
                className="hero-slideshow__bg"
                style={{ backgroundImage: `url(${src})` }}
              />
            </div>
          )
        })}
      </div>

      <div className="hero-slideshow__overlay" />

      <div className="hero-slideshow__content">
        <span
          key={`tag-${staggerKey}`}
          className="hero-slideshow__tag hero-stagger"
        >
          {t(`hero.${slide.key}.tag`)}
        </span>
        <h1
          key={`title-${staggerKey}`}
          className="hero-slideshow__title hero-stagger"
          data-text={t(`hero.${slide.key}.titulo`)}
        >
          {t(`hero.${slide.key}.titulo`)}
        </h1>
        <p
          key={`sub-${staggerKey}`}
          className="hero-slideshow__subtitle hero-stagger"
        >
          {t(`hero.${slide.key}.subtitulo`)}
        </p>
        <div
          key={`actions-${staggerKey}`}
          className="hero-slideshow__actions hero-stagger"
        >
          <button
            className="hero-slideshow__cta--primary"
            onClick={() => navigate(slide.link1)}
          >
            {t(`hero.${slide.key}.cta1`)}
          </button>
          {slide.link2 && (
            <button
              className="hero-slideshow__cta--secondary"
              onClick={() => navigate(slide.link2)}
            >
              {t(`hero.${slide.key}.cta2`)}
            </button>
          )}
        </div>
      </div>

      {/* Progress bars */}
      <div
        className="hero-slideshow__nav"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {BANNERS.map((_, i) => (
          <button
            key={i}
            className={`hero-slideshow__progress${i === activeIndex ? ' hero-slideshow__progress--active' : ''}${paused && i === activeIndex ? ' hero-slideshow__progress--paused' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          >
            <span
              className="hero-slideshow__progress-fill"
              style={{ '--slide-duration': `${AUTOPLAY_MS}ms` }}
            />
          </button>
        ))}
      </div>

      {/* Arrows */}
      <div className="hero-slideshow__setas">
        <button className="hero-slideshow__seta hero-slideshow__seta--prev" onClick={goPrev} aria-label="Anterior">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className="hero-slideshow__seta hero-slideshow__seta--next" onClick={goNext} aria-label="Próximo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  )
}
