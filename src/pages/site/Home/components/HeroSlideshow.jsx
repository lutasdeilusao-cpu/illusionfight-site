import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { useSwipe } from '../../../../hooks/useSwipe'
import { trackEvent } from '../../../../lib/analytics'
import banner01 from '../../../../assets/images/banners/banner-01.webp'
import banner02 from '../../../../assets/images/banners/banner-02.webp'
import banner03 from '../../../../assets/images/banners/banner-03.webp'
import banner04 from '../../../../assets/images/banners/banner-04.webp'
import banner05 from '../../../../assets/images/banners/banner-05.webp'
import logoCompletaPt from '../../../../assets/images/logos/logo-completa-pt.png'
import logoCompletaEn from '../../../../assets/images/logos/logo-completa-en.png'
import logoCompletaEs from '../../../../assets/images/logos/logo-completa-es.png'
import './HeroSlideshow.css'

// Marca completa por idioma — só a marca curta ("LF"/"LDI") aparecia no
// site até agora (navbar); o hero é o primeiro lugar que usa a versão por
// extenso, igual ela apareceu no navbar/rodapé.
const LOGO_COMPLETA = { pt: logoCompletaPt, en: logoCompletaEn, es: logoCompletaEs }

const AUTOPLAY_MS = 6000

// Artes novas (set/2026, já pensadas pro portal mobile-only — vertical,
// perto do formato real de tela). Cada uma vem com a proporção NATIVA
// dela (width/height reais do arquivo): o palco (.hero-slideshow__stage)
// usa isso como aspect-ratio, então a imagem inteira cabe sem cortar nada
// — nunca mais object-fit:cover mascarando uma foto que não foi pensada
// pra aquele corte. As 5 fotos vieram numa ordem de composição (grupo,
// dupla, banda...) que não bate 1:1 com o tema fixo de cada slide (webtoon/
// games/música/loja) — mapeada aqui pelo CONTEÚDO de cada uma, não pela
// ordem em que foram entregues.
const BANNERS = [
  { src: banner05, w: 960, h: 1440 }, // protagonista sozinho na rua — abertura/universo
  { src: banner01, w: 960, h: 1440 }, // trio em pose de capa — webtoon
  { src: banner03, w: 941, h: 1672 }, // fliperama — games
  { src: banner04, w: 940, h: 1672 }, // banda ensaiando — músicas
  { src: banner02, w: 941, h: 1672 }, // trio no tablet — loja/assinar
]
const SLIDE_COUNT = BANNERS.length
const SLIDE_KEYS = [
  { key: 'slide1', link1: '/historias/lutas-de-ilusao', link2: '/universos/lutas-de-ilusao' },
  { key: 'slide2', link1: '/webtoon', link2: null },
  { key: 'slide3', link1: '/games', link2: null },
  { key: 'slide4', link1: '/musicas', link2: null },
  { key: 'slide5', link1: '/loja', link2: '/assinar' },
]

export default function HeroSlideshow() {
  const { t, locale } = useLanguage()
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

  // Swipe — única forma de navegar manualmente além dos pontos de
  // progresso (não existe visão desktop com mouse/setas neste site).
  useSwipe(containerRef, (_, dx) => {
    if (dx > 0) goPrev()
    else if (dx < 0) goNext()
  })

  const slide = SLIDE_KEYS[activeIndex]
  const active = BANNERS[activeIndex]
  const isExiting = prevIndex >= 0
  const exitDir = direction

  return (
    <section
      className="hero-slideshow"
      id="hero"
      ref={containerRef}
    >
      {/* Palco com a proporção REAL da arte ativa — a imagem inteira cabe,
          sem cortar ninguém de fora do quadro (pedido do Isaias: as artes
          novas já foram desenhadas pensando no formato vertical mobile). */}
      <div className="hero-slideshow__stage" style={{ aspectRatio: `${active.w} / ${active.h}` }}>
        <div className="hero-slideshow__track">
          {BANNERS.map((banner, i) => {
            const isActive = i === activeIndex
            const isPrev = i === prevIndex
            if (!isActive && !isPrev) return null
            let className = 'hero-slideshow__slide'
            if (isPrev && isExiting) className += ' hero-slideshow__slide--exit'
            if (isPrev && isExiting) className += exitDir > 0 ? ' hero-slideshow__slide--exit-left' : ' hero-slideshow__slide--exit-right'
            if (isActive) className += ' hero-slideshow__slide--active'
            return (
              <div key={i} className={className}>
                <img
                  className="hero-slideshow__bg"
                  src={banner.src}
                  alt=""
                  width={banner.w}
                  height={banner.h}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding={i === 0 ? 'sync' : 'async'}
                />
              </div>
            )
          })}
        </div>

        <div className="hero-slideshow__overlay" />

        <img className="hero-slideshow__logo" src={LOGO_COMPLETA[locale] || LOGO_COMPLETA.pt} alt="Illusion Fight" />

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
              onClick={() => {
                trackEvent('hero_cta_click', { slide_index: activeIndex, slide_key: slide.key, cta_position: 'primary', destination: slide.link1 })
                navigate(slide.link1)
              }}
            >
              {t(`hero.${slide.key}.cta1`)}
            </button>
            {slide.link2 && (
              <button
                className="hero-slideshow__cta--secondary"
                onClick={() => {
                  trackEvent('hero_cta_click', { slide_index: activeIndex, slide_key: slide.key, cta_position: 'secondary', destination: slide.link2 })
                  navigate(slide.link2)
                }}
              >
                {t(`hero.${slide.key}.cta2`)}
              </button>
            )}
          </div>
        </div>

        <div className="hero-slideshow__edge" aria-hidden="true">
          <span>{String(activeIndex + 1).padStart(2, '0')}</span>
          <i />
          <span>{String(SLIDE_COUNT).padStart(2, '0')}</span>
        </div>

        {/* Progress bars */}
        <div className="hero-slideshow__nav" onTouchStart={() => setPaused(true)}>
          {BANNERS.map((_, i) => (
            <button
              key={i}
              className={`hero-slideshow__progress${i === activeIndex ? ' hero-slideshow__progress--active' : ''}${paused && i === activeIndex ? ' hero-slideshow__progress--paused' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`${t('hero.aria.slide')} ${i + 1}`}
            >
              <span className="hero-slideshow__progress-fill" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
