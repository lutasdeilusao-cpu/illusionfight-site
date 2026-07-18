import { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useReader } from '../../context/ReaderContext'
import { useAuth } from '../../context/AuthContext'
import { TRIAL_ACTIVE } from '../../config/trial'
import { estaDisponivel } from '../../config/site'
import { useAchievements } from '../../context/AchievementsContext'
import { useEventos } from '../../context/EventosContext'
import episodios from '../../data/episodios.json'
import './WebtoonEpisodio.css'

function formatarData(dataStr) {
  if (!dataStr) return ''
  const [a, m, d] = dataStr.split('-')
  return `${d}/${m}/${a}`
}

export default function WebtoonEpisodio() {
  const { setReaderMode } = useReader()
  const { id } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { user, perfil, carregando } = useAuth()
  const { desbloquearOuConvidar } = useAchievements()
  const { registrarEvento } = useEventos()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
  useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
  const ultimaPaginaRef = useRef(null)

  useEffect(() => {
    const epAtual = episodios.find(e => e.id === id)
    console.log('[WEBTOON:INIT]', {
      timestamp: new Date().toISOString(), pathname: window.location.pathname,
      episodeId: id, totalPages: epAtual?.paginas ?? 0, origin: 'mount',
      scrollY: window.scrollY, innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight, completionGuard: 'none',
      mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
    })
  }, [id])

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [])

  useEffect(() => { localStorage.setItem('ldi-webtoon-ultimo', id) }, [id])

  useEffect(() => {
    if (id) registrarEvento('webtoon_lido', `Leu o episódio ${id}`, Number(id))
  }, [id])

  useEffect(() => {
    const saved = localStorage.getItem(`ldi-webtoon-scroll-${id}`)
    if (saved) window.scrollTo(0, parseInt(saved))
  }, [id])

  useEffect(() => {
    if (!ultimaPaginaRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      const scrollHeight = document.documentElement.scrollHeight
      console.log('[WEBTOON:COMPLETE_CHECK]', {
        timestamp: new Date().toISOString(), pathname: window.location.pathname,
        episodeId: id, totalPages: episodios.find(e => e.id === id)?.paginas ?? 0,
        origin: 'observer', scrollY: window.scrollY, innerHeight: window.innerHeight,
        scrollHeight, distanceToEnd: scrollHeight - (window.scrollY + window.innerHeight),
        isIntersecting: entry.isIntersecting, intersectionRatio: entry.intersectionRatio,
        completionResult: entry.isIntersecting, completionGuard: 'none',
        mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
      })
      if (entry.isIntersecting) {
        if (id === '00') {
          console.trace('[WEBTOON:COMPLETE_TRIGGER]', {
            timestamp: new Date().toISOString(), pathname: window.location.pathname,
            episodeId: id, achievementId: 'episodio_zero', origin: 'observer',
            mode: carregando ? 'auth-loading' : user ? 'authenticated' : 'guest',
          })
          desbloquearOuConvidarRef.current('episodio_zero')
        }
      }
    }, { threshold: 0.1 })
    observer.observe(ultimaPaginaRef.current)
    return () => observer.disconnect()
  }, [id])

  const ep = episodios.find(e => e.id === id)
  const idx = episodios.findIndex(e => e.id === id)
  const prev = idx > 0 ? episodios[idx - 1] : null
  const next = idx < episodios.length - 1 ? episodios[idx + 1] : null

  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo_pt'

  if (!ep || (id !== '00' && !estaDisponivel(ep, isAdmin) && !TRIAL_ACTIVE)) {
    return (
      <section className="webtoon-ep-page">
        <div className="container">
          <button className="webtoon-ep-header__back" onClick={() => navigate('/webtoon')}>
            {t('pages.webtoon.voltar')}
          </button>
          <p className="webtoon-ep-blocked">
            {ep?.data_publicacao
              ? `${t('pages.webtoon.em_breve')} ${formatarData(ep.data_publicacao)}`
              : t('pages.webtoon.nao_encontrado')}
          </p>
        </div>
      </section>
    )
  }

  const pages = Array.from({ length: ep.paginas }, (_, i) => i + 1)

  return (
    <>
      <Helmet><title>{`${ep[tituloKey]} — ${t('site.nome_curto')}`}</title></Helmet>

      <header className="webtoon-ep-header">
        <div className="container">
          <button className="webtoon-ep-header__back" onClick={() => navigate('/webtoon')}>
            {t('pages.webtoon.voltar')}
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
            src={`/webtoon/${ep.id}/pt/${String(num).padStart(2, '0')}.png`}
            width="100%"
            className="webtoon-ep-reader__img"
            loading="lazy"
            alt={`${t('pages.webtoon.pagina')} ${num}`}
          />
        ))}
      </section>

      <nav className="webtoon-ep-nav">
        <div className="container">
          {prev && prev.publicado ? (
            <button className="webtoon-ep-nav__btn" onClick={() => navigate(`/webtoon/${prev.id}`)}>
              {t('pages.webtoon.anterior')}
            </button>
          ) : (
            <span />
          )}
          {next && next.publicado ? (
            <button className="webtoon-ep-nav__btn" onClick={() => navigate(`/webtoon/${next.id}`)}>
              {t('pages.webtoon.proximo')}
            </button>
          ) : (
            <span />
          )}
        </div>
      </nav>

    </>
  )
}
