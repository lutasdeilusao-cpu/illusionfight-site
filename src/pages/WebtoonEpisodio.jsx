import { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useReader } from '../context/ReaderContext'
import { useAchievements } from '../context/AchievementsContext'
import episodios from '../data/episodios.json'
import './WebtoonEpisodio.css'

export default function WebtoonEpisodio() {
  const { setReaderMode } = useReader()
  const { id } = useParams()
  const navigate = useNavigate()
  const { locale } = useLanguage()
  const { desbloquear } = useAchievements()
  const ultimaPaginaRef = useRef(null)

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [])

  useEffect(() => { localStorage.setItem('ldi-webtoon-ultimo', id) }, [id])

  useEffect(() => {
    const saved = localStorage.getItem(`ldi-webtoon-scroll-${id}`)
    if (saved) window.scrollTo(0, parseInt(saved))
  }, [id])

  useEffect(() => {
    if (!ultimaPaginaRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && id === 'episodio-00') desbloquear('episodio_zero')
    }, { threshold: 0.5 })
    observer.observe(ultimaPaginaRef.current)
    return () => observer.disconnect()
  }, [id])

  const ep = episodios.find(e => e.id === id)
  const idx = episodios.findIndex(e => e.id === id)
  const prev = idx > 0 ? episodios[idx - 1] : null
  const next = idx < episodios.length - 1 ? episodios[idx + 1] : null

  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo_pt'

  if (!ep || !ep.publicado) {
    return (
      <section className="webtoon-ep-page">
        <div className="container"><p>Episódio não encontrado.</p></div>
      </section>
    )
  }

  const pages = Array.from({ length: ep.paginas }, (_, i) => i + 1)

  return (
    <>
      <Helmet><title>{ep[tituloKey]} — Lutas de Ilusão</title></Helmet>

      <header className="webtoon-ep-header">
        <div className="container">
          <button className="webtoon-ep-header__back" onClick={() => navigate('/webtoon')}>
            ← VOLTAR
          </button>
          <h1 className="webtoon-ep-header__title">
            EP. {String(ep.numero).padStart(2, '0')} — {ep[tituloKey]}
          </h1>
        </div>
      </header>

      <section className="webtoon-ep-reader">
        {pages.map(num => (
          <img
            key={num}
            ref={num === ep.paginas ? ultimaPaginaRef : null}
            src={`/illusionfight-site/webtoon/${ep.id}/pt/${String(num).padStart(2, '0')}.png`}
            width="100%"
            style={{ display: 'block' }}
            loading="lazy"
            alt={`Página ${num}`}
          />
        ))}
      </section>

      <nav className="webtoon-ep-nav">
        <div className="container">
          {prev && prev.publicado ? (
            <button className="webtoon-ep-nav__btn" onClick={() => navigate(`/webtoon/${prev.id}`)}>
              ← Episódio Anterior
            </button>
          ) : (
            <span />
          )}
          {next && next.publicado ? (
            <button className="webtoon-ep-nav__btn" onClick={() => navigate(`/webtoon/${next.id}`)}>
              Próximo Episódio →
            </button>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </>
  )
}
