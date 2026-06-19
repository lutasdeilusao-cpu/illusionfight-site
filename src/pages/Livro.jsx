import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { TRIAL_ACTIVE } from '../config/trial'
import { estaDisponivel } from '../config/site'
import index from '../data/livro-index.json'
import './Livro.css'

function formatarData(dataStr) {
  if (!dataStr) return ''
  const [a, m, d] = dataStr.split('-')
  return `${d}/${m}/${a}`
}

export default function Livro() {
  const [ultimo, setUltimo] = useState(null)
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { user, perfil } = useAuth()
  const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  useEffect(() => {
    setUltimo(localStorage.getItem('ldi-livro-ultimo'))
  }, [])

  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'

  return (
    <section className="livro-page">
      <Helmet>
        <title>Book — Illusion Fight</title>
        <meta name="description" content="Read the Illusion Fight book chapters online. The complete novel of the LDI universe — follow Kim, Jack, and the fighters of Bravara." />
        <meta property="og:title" content="Book — Illusion Fight" />
        <meta property="og:description" content="Read the Illusion Fight book online. The complete novel of the LDI universe." />
        <meta property="og:url" content="https://illusionfight.com/livro" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hrefLang="pt" href="https://illusionfight.com/livro" />
        <link rel="alternate" hrefLang="en" href="https://illusionfight.com/livro" />
        <link rel="alternate" hrefLang="es" href="https://illusionfight.com/livro" />
      </Helmet>
      <div className="container">
        {ultimo && (
          <Link to={`/livro/${ultimo}`} className="livro-continuar">
            {t('pages.livro.continuar_lendo')}
          </Link>
        )}
        <h2 className="section-title">{t('pages.livro.titulo')}</h2>
        <div className="livro-page__list">
          {index.map(ch => {
            const liberado = ch.id === 'capitulo-01' || estaDisponivel(ch, isAdmin) || TRIAL_ACTIVE
            return (
              <div key={ch.id} className="livro-page__item">
                <span className="livro-page__numero">{t('pages.livro.cap')} {String(ch.numero).padStart(2, '0')}</span>
                <div className="livro-page__info">
                  <span
                    className={`livro-page__titulo${liberado ? '' : ' livro-page__titulo--locked'}`}
                    onClick={() => liberado && navigate(`/livro/${ch.id}`)}
                  >
                    {ch[tituloKey]}
                  </span>
                  <div className="livro-page__meta">
                    {liberado && ch.data_publicacao && (
                      <span className="livro-page__data">{ch.data_publicacao}</span>
                    )}
                    {!liberado && (
                      <span className="livro-page__badge">
                        {ch.data_publicacao ? `${t('pages.livro.em_breve')} — ${formatarData(ch.data_publicacao)}` : t('pages.livro.em_breve')}
                      </span>
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
