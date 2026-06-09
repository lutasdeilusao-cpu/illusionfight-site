import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import episodios from '../data/episodios.json'
import thumbEp00 from '../assets/images/episodes/thumb-ep00.png'
import thumbEp01 from '../assets/images/episodes/thumb-ep01.png'
import './Webtoon.css'

const thumbMap = { 'thumb-ep00.png': thumbEp00, 'thumb-ep01.png': thumbEp01 }

export default function Webtoon() {
  const [ultimo, setUltimo] = useState(null)
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  const published = episodios.filter(ep => ep.publicado)

  useEffect(() => {
    setUltimo(localStorage.getItem('ldi-webtoon-ultimo'))
  }, [])

  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo_pt'

  return (
    <>
      <Helmet>
        <title>Webtoon — Illusion Fight</title>
        <meta name="description" content="Watch the Illusion Fight webtoon — a Brazilian action webcomic set in the LDI arena. Episodes, art, and the story of Kim and the fighters of Bravara." />
        <meta property="og:title" content="Webtoon — Illusion Fight" />
        <meta property="og:description" content="Watch the Illusion Fight webtoon — a Brazilian action webcomic set in the LDI arena." />
        <meta property="og:url" content="https://illusionfight.com/webtoon" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hreflang="pt" href="https://illusionfight.com/webtoon" />
        <link rel="alternate" hreflang="en" href="https://illusionfight.com/webtoon" />
        <link rel="alternate" hreflang="es" href="https://illusionfight.com/webtoon" />
      </Helmet>
      <section className="webtoon-page">
        <div className="container">
          {ultimo && (
            <Link to={`/webtoon/${ultimo}`} className="livro-continuar">
              {t('pages.webtoon.continuar')}
            </Link>
          )}
          <h1 className="section-title">{t('pages.webtoon.titulo')}</h1>
          <div className="webtoon-grid">
            {published.map(ep => {
              const thumb = thumbMap[ep.thumbnail]
              return (
                <div
                  key={ep.id}
                  className="webtoon-card"
                  onClick={() => navigate(`/webtoon/${ep.id}`)}
                >
                  <div className="webtoon-card__thumb">
                    {thumb ? (
                      <img src={thumb} alt={ep[tituloKey]} />
                    ) : (
                      <span className="webtoon-card__num">EP. {String(ep.numero).padStart(2, '0')}</span>
                    )}
                  </div>
                  <div className="webtoon-card__info">
                    <span className="webtoon-card__numero">EP. {String(ep.numero).padStart(2, '0')}</span>
                    <h3 className="webtoon-card__titulo">{ep[tituloKey]}</h3>
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
