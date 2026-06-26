import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import './NotFound.css'

export default function NotFound() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/', { replace: true })
      return
    }
    const id = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown, navigate])

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex" />
        <title>{t('pages.notFound.titulo')}</title>
      </Helmet>

      <section className="not-found">
        <div className="container not-found__container">
          <h1 className="not-found__code">404</h1>
          <p className="not-found__message">{t('pages.notFound.mensagem')}</p>
          <p className="not-found__countdown">
            {t('pages.notFound.redirect')}{' '}
            <span className="not-found__counter">{countdown}</span>
          </p>
          <button
            className="not-found__cta"
            onClick={() => navigate('/', { replace: true })}
          >
            {t('pages.notFound.cta')}
          </button>
        </div>
      </section>
    </>
  )
}
