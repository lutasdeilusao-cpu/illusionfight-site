import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import { useNavigate } from 'react-router-dom'
import './Autor.css'

export default function Autor() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>About the Author — Illusion Fight</title>
        <meta name="description" content="Learn about Isaias Leal, the creator of Illusion Fight — the Brazilian webtoon, games, and transmedia universe set in the LDI arena." />
        <meta property="og:title" content="About the Author — Illusion Fight" />
        <meta property="og:description" content="Learn about Isaias Leal, the creator of the Illusion Fight universe." />
        <meta property="og:url" content="https://illusionfight.com/autor" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hrefLang="pt" href="https://illusionfight.com/autor" />
        <link rel="alternate" hrefLang="en" href="https://illusionfight.com/autor" />
        <link rel="alternate" hrefLang="es" href="https://illusionfight.com/autor" />
      </Helmet>
      <section className="autor">
        <div className="container">
          <h1 className="autor__byline">
            <span className="autor__byline-prefix">{t('pages.autor.by')}</span>
            <span className="autor__byline-name">{t('pages.autor.name')}</span>
          </h1>

          <div className="autor__blocks">
            {[0, 1, 2, 3].map(i => (
              <p key={i} className="autor__block">{t(`autor.blocks.${i}`)}</p>
            ))}
          </div>

          <button className="autor__cta" onClick={() => navigate('/assinar')}>
            {t('autor.cta')}
          </button>
        </div>
      </section>
    </>
  )
}
