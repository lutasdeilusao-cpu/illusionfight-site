import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { LAUNCH_DATE } from '../../../../config/launch'
import { trackEvent } from '../../../../lib/analytics'
import banner01 from '../../../../assets/images/banners/banner-01.webp'
import banner02 from '../../../../assets/images/banners/banner-02.webp'
import banner03 from '../../../../assets/images/banners/banner-03.webp'
import banner04 from '../../../../assets/images/banners/banner-04.webp'
import banner05 from '../../../../assets/images/banners/banner-05.webp'
import logoPt from '../../../../assets/images/logos/logo-completa-pt.png'
import logoEn from '../../../../assets/images/logos/logo-completa-en.png'
import logoEs from '../../../../assets/images/logos/logo-completa-es.png'
import './HeroSlideshow.css'

const LOGO = { pt: logoPt, en: logoEn, es: logoEs }
const DIA = 86400000
const ARRASTE_MIN = 45

/* Abertura da Home — banner rotativo (Isaias, 30/09/2026: "o slideshow tem
   que manter... faz ele novo, faz melhor"). Cada slide casa a arte com o
   texto pelo CONTEÚDO da imagem: Kim sozinho na calçada da loja de doces =
   livro ("vende bala"), trio em pose = WEB SHARD, fliperama = jogos, banda =
   músicas, trio no tablet = loja/apoio. O tempo de cada slide mora no CSS
   (animação da barrinha do topo, --hero-tempo): quando ela termina, o slide
   avança — segurar o dedo pausa a barrinha e, com ela, a troca. */
const SLIDES = [
  { key: 'slide1', arte: banner01, w: 960, h: 1440, foco: 'kim', link1: '/historias/lutas-de-ilusao', link2: '/universos/lutas-de-ilusao' },
  { key: 'slide2', arte: banner02, w: 941, h: 1672, foco: 'trio', link1: '/webtoon', link2: null },
  { key: 'slide3', arte: banner03, w: 941, h: 1672, foco: 'arcade', link1: '/games', link2: null },
  { key: 'slide4', arte: banner04, w: 940, h: 1672, foco: 'banda', link1: '/musicas', link2: null },
  { key: 'slide5', arte: banner05, w: 960, h: 1440, foco: 'tablet', link1: '/loja', link2: '/assinar' },
]
const TOTAL = SLIDES.length

export default function HeroSlideshow() {
  const { t, locale } = useLanguage()
  // `saindo` = o slide que acabou de sair: continua visível enquanto some,
  // congelado no zoom em que estava (sem pular de volta pro tamanho 1).
  const [{ ativo, saindo }, setEstado] = useState({ ativo: 0, saindo: -1 })
  const [segurando, setSegurando] = useState(false)
  const [foraDaTela, setForaDaTela] = useState(false)
  const palcoRef = useRef(null)
  const toqueRef = useRef(null)

  const mudar = useCallback((calc) => setEstado((e) => {
    const novo = ((calc(e.ativo) % TOTAL) + TOTAL) % TOTAL
    return novo === e.ativo ? e : { ativo: novo, saindo: e.ativo }
  }), [])
  const irPara = useCallback((i) => mudar(() => i), [mudar])
  const proximo = useCallback(() => mudar((a) => a + 1), [mudar])
  const anterior = useCallback(() => mudar((a) => a - 1), [mudar])

  // Fora da tela não gira: quem desceu pra ler a Home não perde o slide
  // em que parou, e não tem imagem trocando à toa lá em cima.
  useEffect(() => {
    const el = palcoRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const obs = new IntersectionObserver(([e]) => setForaDaTela(!e.isIntersecting), { threshold: 0.25 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Pré-carrega a próxima arte pra troca nunca mostrar buraco.
  useEffect(() => {
    const img = new Image()
    img.src = SLIDES[(ativo + 1) % TOTAL].arte
  }, [ativo])

  // Segurar pausa (estilo stories); soltar depois de arrastar pro lado troca.
  function aoTocar(e) {
    if (e.target.closest('a')) return
    toqueRef.current = { x: e.clientX, y: e.clientY }
    setSegurando(true)
  }
  function aoSoltar(e) {
    const ini = toqueRef.current
    toqueRef.current = null
    setSegurando(false)
    if (!ini) return
    const dx = e.clientX - ini.x
    const dy = e.clientY - ini.y
    if (Math.abs(dx) < ARRASTE_MIN || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) proximo()
    else anterior()
  }
  function aoCancelar() {
    toqueRef.current = null
    setSegurando(false)
  }

  const slide = SLIDES[ativo]
  const pausado = segurando || foraDaTela
  const faltam = Math.max(0, Math.ceil((new Date(`${LAUNCH_DATE}T00:00:00-03:00`) - Date.now()) / DIA))
  const clique = (posicao, destino) => () =>
    trackEvent('hero_cta_click', { slide_index: ativo, slide_key: slide.key, cta_position: posicao, destination: destino })

  return (
    <section className="hero-show" aria-roledescription={t('hero.aria.carrossel')} aria-label={t('hero.title')}>
      <div
        ref={palcoRef}
        className={`hero-show__palco${pausado ? ' is-pausado' : ''}`}
        onPointerDown={aoTocar}
        onPointerUp={aoSoltar}
        onPointerCancel={aoCancelar}
        onPointerLeave={aoCancelar}
      >
        {SLIDES.map((s, i) => (
          <img
            key={s.key}
            className={`hero-show__arte is-${s.foco}${i === ativo ? ' is-ativa' : ''}${i === saindo ? ' is-saindo' : ''}`}
            src={s.arte}
            alt=""
            width={s.w}
            height={s.h}
            draggable="false"
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'auto'}
            decoding="async"
          />
        ))}
        <div className="hero-show__veu" aria-hidden="true" />

        <div className="hero-show__topo">
          <div className="hero-show__barras">
            {SLIDES.map((s, i) => (
              <button
                key={s.key}
                type="button"
                className={`hero-show__barra${i < ativo ? ' is-vista' : ''}${i === ativo ? ' is-ativa' : ''}`}
                onClick={() => irPara(i)}
                aria-label={`${t('hero.aria.slide')} ${i + 1}`}
                aria-current={i === ativo ? 'true' : undefined}
              >
                {i === ativo
                  ? <span key={`fill-${ativo}`} className="hero-show__barra-fill" onAnimationEnd={proximo} />
                  : <span className="hero-show__barra-fill" />}
              </button>
            ))}
          </div>
          <div className="hero-show__marca">
            <img className="hero-show__logo" src={LOGO[locale] || LOGO.pt} alt="Illusion Fight" width="600" height="200" />
            {faltam > 0 && (
              <span className="hero-show__contagem">
                <b>{faltam}</b>
                {t('hero.faltam')}
              </span>
            )}
          </div>
        </div>

        <div key={slide.key} className="hero-show__conteudo">
          <span className="hero-show__tag">
            <i>{String(ativo + 1).padStart(2, '0')}</i>
            {t(`hero.${slide.key}.tag`)}
          </span>
          <h1 className="hero-show__titulo">{t(`hero.${slide.key}.titulo`)}</h1>
          <p className="hero-show__sub">{t(`hero.${slide.key}.subtitulo`)}</p>
          <div className="hero-show__acoes">
            <Link to={slide.link1} className="if-btn if-btn--primary hero-show__btn" onClick={clique('primary', slide.link1)}>
              {t(`hero.${slide.key}.cta1`)}
            </Link>
            {slide.link2 && (
              <Link to={slide.link2} className="if-btn if-btn--ghost hero-show__btn" onClick={clique('secondary', slide.link2)}>
                {t(`hero.${slide.key}.cta2`)}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
