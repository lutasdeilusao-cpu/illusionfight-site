import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { TRIAL_ACTIVE } from '../../config/trial'
import { trackEvent } from '../../lib/analytics'
import { estaDisponivel } from '../../config/site'
import episodios from '../../data/episodios.json'
import thumbEp00 from '../../assets/images/episodes/thumb-ep00.webp'
import thumbEp01 from '../../assets/images/episodes/thumb-ep01.webp'
import comingSoonImg from '../../assets/images/ComingSoon.png'
import './Webtoon.css'

const thumbMap = { 'thumb-ep00.png': thumbEp00, 'thumb-ep01.png': thumbEp01 }

function formatarData(dataStr) {
  if (!dataStr) return ''
  const [a, m, d] = dataStr.split('-')
  return `${d}/${m}/${a}`
}

export default function Webtoon() {
  const [ultimo, setUltimo] = useState(null)
  const { t, locale } = useLanguage()
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  useEffect(() => {
    setUltimo(localStorage.getItem('ldi-webtoon-ultimo'))
  }, [])

  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo_pt'

  return (
    <>
      <Helmet>
        <title>{t('pages.webtoon.meta_title')}</title>
        <meta name="description" content={t('pages.webtoon.meta_desc')} />
        <meta property="og:title" content={t('pages.webtoon.meta_title')} />
        <meta property="og:description" content={t('pages.webtoon.meta_desc')} />
        <meta property="og:url" content="https://illusionfight.com/webtoon" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>
      <section className="webtoon-page">
        <div className="container">
          {ultimo && (
            <Link to={`/webtoon/${ultimo}`} className="livro-continuar">
              {t('pages.webtoon.continuar')}
            </Link>
          )}
          <h1 className="section-title">{t('pages.webtoon.titulo')}</h1>
          <p className="webtoon-seo-intro">{t('pages.webtoon.seo_intro')}</p>
          {/* Botão de descoberta do termo próprio (WEB SHARD) — pedido do
              Isaias, 21/09/2026: "a gente vai continuar usando webtoon no
              portal porque chama atenção, mas aqui dentro eu quero que
              esteja escrito nosso novo termo... um botãozinho que a
              pessoa clica e acessa uma página com a explicação". */}
          <Link to="/web-shard" className="webtoon-web-shard-link">
            {t('pages.webtoon.web_shard_cta')}
          </Link>
          <div className="webtoon-grid">
            {episodios.map(ep => {
              const liberado = ep.id === '00' || estaDisponivel(ep, isAdmin, { user, perfil }) || TRIAL_ACTIVE
              const thumb = thumbMap[ep.thumbnail]
              return (
                <div
                  key={ep.id}
                  className={`webtoon-card${liberado ? '' : ' webtoon-card--locked'}`}
                  onClick={() => {
                    if (!liberado) return
                    // O "de verdade abriu" (webtoon_open) agora dispara dentro
                    // do leitor (WebtoonEpisodio.jsx), com tempo de leitura —
                    // cobre deep link também. Aqui só o clique no card.
                    trackEvent('webtoon_card_click', { episode_id: ep.id })
                    navigate(`/webtoon/${ep.id}`)
                  }}
                >
                  <div className="webtoon-card__thumb">
                    {thumb ? (
                      <img src={thumb} alt={ep[tituloKey]} />
                    ) : (
                      <img src={comingSoonImg} alt={ep[tituloKey]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    {!liberado && ep.data_publicacao && (
                      <div className="webtoon-card__overlay">
                        <span className="webtoon-card__badge">
                          {`${t('pages.webtoon.em_breve')} ${formatarData(ep.data_publicacao)}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="webtoon-card__info">
                    <span className="webtoon-card__numero">EP. {String(ep.numero).padStart(2, '0')}</span>
                    <h3 className={`webtoon-card__titulo${liberado ? '' : ' webtoon-card__titulo--locked'}`}>{ep[tituloKey]}</h3>
                    <div className="webtoon-card__langs">
                      {ep.idiomas.map(lang => (
                        <span key={lang} className="webtoon-card__lang">{lang.toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
