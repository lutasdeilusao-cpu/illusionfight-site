import { useEffect, useLayoutEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useReader } from '../../context/ReaderContext'
import { useAuth } from '../../context/AuthContext'
import { TRIAL_ACTIVE } from '../../config/trial'
import { estaDisponivel } from '../../config/site'
import { useAchievements } from '../../context/AchievementsContext'
import { useEventos } from '../../context/EventosContext'
import { useReadingCompletionGate } from '../../hooks/useReadingCompletionGate'
import { notificationManager } from '../../lib/notificationManager'
import { useTrackedSession } from '../../lib/sessionAnalytics'
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
  const { user, perfil } = useAuth()
  const { desbloquearOuConvidar } = useAchievements()
  const { registrarEvento } = useEventos()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
  useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
  const ultimaPaginaRef = useRef(null)

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

  useLayoutEffect(() => {
    if (id === '00') notificationManager.removeByAchievementId('episodio_zero')
  }, [id])

  useReadingCompletionGate({
    sentinelRef: ultimaPaginaRef,
    contentKey: `webtoon:${id}`,
    enabled: id === '00',
    onComplete: () => desbloquearOuConvidarRef.current('episodio_zero'),
  })

  const ep = episodios.find(e => e.id === id)
  const idx = episodios.findIndex(e => e.id === id)
  const prev = idx > 0 ? episodios[idx - 1] : null
  const next = idx < episodios.length - 1 ? episodios[idx + 1] : null

  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo_pt'

  // webtoon_open/webtoon_time: cobre quem chega direto pela URL (não só quem
  // clica na grade em Webtoon.jsx) e mede tempo de leitura de verdade —
  // pedido do Isaias (2026-09-14): "eu vejo que leem webtoon, mas não sei
  // qual capítulo, até quando as pessoas ficam lendo".
  useTrackedSession('webtoon_open', 'webtoon_time', {
    episode_id: id, episode_numero: ep?.numero, episode_titulo: ep?.[tituloKey],
  }, { active: Boolean(ep) })

  if (!ep || (id !== '00' && !estaDisponivel(ep, isAdmin, { user, perfil }) && !TRIAL_ACTIVE)) {
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
