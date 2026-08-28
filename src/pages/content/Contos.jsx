import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { TRIAL_ACTIVE } from '../../config/trial'
import { estaDisponivel } from '../../config/site'
import index from '../../data/contos-index.json'
import comingSoonImg from '../../assets/images/ComingSoon.png'
import './Livro.css'
import './Contos.css'

export default function Contos() {
  const [ultimo, setUltimo] = useState(null)
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { user, perfil } = useAuth()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  useEffect(() => {
    setUltimo(localStorage.getItem('ldi-conto-ultimo'))
  }, [])

  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'
  const taglineKey = locale === 'en' ? 'tagline_en' : locale === 'es' ? 'tagline_es' : 'tagline_pt'

  const capsLiberados = (h) => h.capitulos.filter(c => estaDisponivel(c, isAdmin) || TRIAL_ACTIVE).length

  return (
    <section className="livro-page">
      <Helmet>
        <title>{t('pages.contos.og_title')}</title>
        <meta name="description" content={t('pages.contos.og_desc')} />
        <meta property="og:title" content={t('pages.contos.og_title')} />
        <meta property="og:description" content={t('pages.contos.og_desc')} />
        <meta property="og:url" content="https://illusionfight.com/livro/contos" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="container">
        <nav className="livro-linhas">
          <Link to="/livro" className="livro-linha">{t('pages.contos.linha_principal')}</Link>
          <span className="livro-linha livro-linha--ativa">{t('pages.contos.linha_contos')}</span>
        </nav>

        <div className="contos-hero">
          <div className="contos-hero__text">
            <span className="contos-selo">{t('pages.contos.selo')}</span>
            <h2 className="section-title">{t('pages.contos.titulo')}</h2>
            <p className="contos-hero__desc">{t('pages.contos.descricao')}</p>
          </div>
        </div>

        {ultimo && (
          <Link to={`/livro/contos/${ultimo}`} className="livro-continuar">
            {t('pages.livro.continuar_lendo')}
          </Link>
        )}

        <div className="contos-historias">
          {index.map(h => {
            const n = capsLiberados(h)
            const liberado = n > 0
            return (
              <div
                key={h.id}
                className={`contos-card${liberado ? '' : ' contos-card--locked'}`}
                onClick={() => liberado && navigate(`/livro/contos/${h.id}`)}
              >
                <img className="contos-card__img" src={comingSoonImg} alt="" loading="lazy" decoding="async" />
                <div className="contos-card__info">
                  <span className="contos-card__selo">{h.selo}</span>
                  <span className="contos-card__titulo">{h[tituloKey]}</span>
                  <p className="contos-card__tag">{h[taglineKey]}</p>
                  <span className="contos-card__meta">
                    {liberado
                      ? `${n} ${n === 1 ? t('pages.contos.capitulo').toLowerCase() : t('pages.contos.capitulos')}`
                      : t('pages.livro.em_breve')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
