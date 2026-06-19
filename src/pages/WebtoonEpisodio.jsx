import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useReader } from '../context/ReaderContext'
import { useAuth } from '../context/AuthContext'
import { TRIAL_ACTIVE } from '../config/trial'
import { estaDisponivel } from '../config/site'
import { useAchievements } from '../context/AchievementsContext'
import { useEventos } from '../context/EventosContext'
import ModalLancamento from '../components/ModalLancamento/ModalLancamento'
import episodios from '../data/episodios.json'
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
  const { user, perfil } = useAuth()
  const { desbloquear } = useAchievements()
  const { registrarEvento } = useEventos()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const desbloquearRef = useRef(desbloquear)
  useEffect(() => { desbloquearRef.current = desbloquear }, [desbloquear])
  const ultimaPaginaRef = useRef(null)
  const [showModal, setShowModal] = useState(false)

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
      if (entry.isIntersecting) {
        if (id === '00') desbloquearRef.current('episodio_zero')
        if ((id === '00') && !sessionStorage.getItem('ldi-modal-lancamento-visto')) setShowModal(true)
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

      <ModalLancamento mostrar={showModal} onFechar={() => setShowModal(false)} />
    </>
  )
}
