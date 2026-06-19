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

const thumbMap = { 'thumb-ep00.png': thumbEp00, 'thumb-ep01.png': thumbEp01 }
import './LatestEpisodes.css'

function formatarData(dataStr) {
  if (!dataStr) return ''
  const [a, m, d] = dataStr.split('-')
  return `${d}/${m}/${a}`
}

export default function LatestEpisodes() {
  const { t, locale } = useLanguage()
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const ref = useScrollReveal()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  const fraseKey = locale === 'en' ? 'frase_en' : locale === 'es' ? 'frase_es' : 'frase_pt'

  return (
    <section ref={ref} className="episodes reveal" id="episodios">
      <div className="container">
        <h2 className="section-title">{t('episodes.title')}</h2>
        <div className="episodes__grid">
          {episodios.map(ep => {
            const liberado = ep.id === '00' || estaDisponivel(ep, isAdmin) || TRIAL_ACTIVE
            return (
              <div
                key={ep.id}
                className={`episode-card${liberado ? '' : ' episode-card--locked'}`}
                onClick={() => liberado && navigate(`/webtoon/${ep.id}`)}
              >
                <div className="episode-card-image-wrapper">
                  <img
                    src={liberado ? (thumbMap[ep.thumbnail] || thumbEp00) : comingSoonImg}
                    alt={ep.titulo_pt}
                    className="episode-card-image"
                  />
                  {liberado && (
                    <div className="episode-card-overlay">
                      <p className="episode-card-quote">"{ep[fraseKey]}"</p>
                      <span className="episode-card-badge episode-card-badge--FREE">{t('episodes.badge.free')}</span>
                    </div>
                  )}
                  {!liberado && ep.data_publicacao && (
                    <div className="episode-card-overlay episode-card-overlay--locked">
                      <span className="episode-card-badge episode-card-badge--coming">
                        {`${t('pages.webtoon.em_breve')} ${formatarData(ep.data_publicacao)}`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="episode-card-footer">
                  <span className="episode-card-number">EP. {String(ep.numero).padStart(2, '0')}</span>
                  <h3 className={`episode-card-title${liberado ? '' : ' episode-card-title--locked'}`}>{ep.titulo_pt}</h3>
                </div>
              </div>
            )
          })}
        </div>
        <div className="episodes__footer">
          <button className="btn btn--outline">{t('episodes.cta')}</button>
        </div>
      </div>
    </section>
  )
}
