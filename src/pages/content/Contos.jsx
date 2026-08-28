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

function formatarData(dataStr) {
  if (!dataStr) return ''
  const [a, m, d] = dataStr.split('-')
  return `${d}/${m}/${a}`
}

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
          <img className="contos-hero__img" src={comingSoonImg} alt="" loading="lazy" decoding="async" />
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

        <div className="livro-page__list">
          {index.map(ch => {
            const liberado = estaDisponivel(ch, isAdmin) || TRIAL_ACTIVE
            return (
              <div key={ch.id} className="livro-page__item">
                <span className="livro-page__numero">{t('pages.contos.conto')} {String(ch.numero).padStart(2, '0')}</span>
                <div className="livro-page__info">
                  <span
                    className={`livro-page__titulo${liberado ? '' : ' livro-page__titulo--locked'}`}
                    onClick={() => liberado && navigate(`/livro/contos/${ch.id}`)}
                  >
                    {ch[tituloKey]}
                  </span>
                  <div className="livro-page__meta">
                    {liberado && ch.data_publicacao && (
                      <span className="livro-page__data">{formatarData(ch.data_publicacao)}</span>
                    )}
                    {!liberado && (
                      <span className="livro-page__badge">{t('pages.livro.em_breve')}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
