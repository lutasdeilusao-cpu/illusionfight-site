import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useAuth } from '../context/AuthContext'
import { estaDisponivel } from '../config/site'
import { TRIAL_ACTIVE } from '../config/trial'
import thumbEp00 from '../assets/images/episodes/thumb-ep00.png'
import thumbEp01 from '../assets/images/episodes/thumb-ep01.png'
import comingSoonImg from '../assets/images/ComingSoon.png'
import episodios from '../data/episodios.json'
import './LatestEpisodes.css'

const thumbMap = { 'thumb-ep00.png': thumbEp00, 'thumb-ep01.png': thumbEp01 }

export default function LatestEpisodes() {
  const { t, locale } = useLanguage()
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const ref = useScrollReveal()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo_pt'
  const descKey = locale === 'en' ? 'descricao_en' : locale === 'es' ? 'descricao_es' : 'descricao_pt'

  const featured = useMemo(() => {
    const disponiveis = episodios
      .filter(ep => thumbMap[ep.thumbnail])
      .filter(ep => ep.id === '00' || estaDisponivel(ep, isAdmin) || TRIAL_ACTIVE)
      .sort((a, b) => ((b.data_publicacao || '').localeCompare(a.data_publicacao || '')))
    return disponiveis[0]
  }, [isAdmin])

  const lista = episodios.filter(ep => ep.id !== featured?.id)
  const liberadoFeatured = !!featured

  return (
    <section ref={ref} className="episodes reveal" id="episodios">
      <div className="container">
        <h2 className="section-title">{t('episodes.title')}</h2>

        {featured && (
          <div className="episodes-featured">
            <div
              className={`episodes-featured-card${liberadoFeatured ? '' : ' episodes-featured-card--locked'}`}
              onClick={() => liberadoFeatured && navigate(`/webtoon/${featured.id}`)}
            >
              <img className="episodes-featured-img" src={thumbMap[featured.thumbnail]} alt={featured[tituloKey]} />
              <div className="episodes-featured-overlay">
                <span className={`episodes-featured-badge${liberadoFeatured ? ' episodes-featured-badge--live' : ' episodes-featured-badge--soon'}`}>
                  {liberadoFeatured ? t('episodes.badge.free') : t('pages.webtoon.em_breve')}
                </span>
                <span className="episodes-featured-numero">EP. {String(featured.numero).padStart(2, '0')}</span>
                <h3 className="episodes-featured-titulo">{featured[tituloKey]}</h3>
                <p className="episodes-featured-desc">{featured[descKey]}</p>
                {liberadoFeatured && (
                  <button className="episodes-featured-btn" onClick={(e) => { e.stopPropagation(); navigate(`/webtoon/${featured.id}`) }}>
                    {t('episodes.featured_ler')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="episodes-list">
          {lista.map(ep => {
            const liberado = ep.id === '00' || estaDisponivel(ep, isAdmin) || TRIAL_ACTIVE
            const temThumb = thumbMap[ep.thumbnail]
            return (
              <div
                key={ep.id}
                className={`episode-list-item${liberado ? '' : ' episode-list-item--locked'}`}
                onClick={() => liberado && navigate(`/webtoon/${ep.id}`)}
              >
                <div className="episode-list-thumb">
                  <img src={temThumb ? thumbMap[ep.thumbnail] : comingSoonImg} alt={ep[tituloKey]} />
                </div>
                <div className="episode-list-info">
                  <span className="episode-list-numero">EP. {String(ep.numero).padStart(2, '0')}</span>
                  <span className="episode-list-titulo">{ep[tituloKey]}</span>
                  <span className={`episode-list-status${liberado ? ' episode-list-status--live' : ' episode-list-status--soon'}`}>
                    {liberado ? t('episodes.badge.free') : t('pages.webtoon.em_breve')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="episodes__footer">
          <button className="btn btn--outline" onClick={() => navigate('/webtoon')}>{t('episodes.cta')}</button>
        </div>
      </div>
    </section>
  )
}