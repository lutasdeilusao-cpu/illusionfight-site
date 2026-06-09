import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import { useNavigate } from 'react-router-dom'
import './Custos.css'

export default function Custos() {
  const { t, locale } = useLanguage()
  const navigate = useNavigate()

  const title = {
    pt: 'Como esse projeto existe | Illusion Fight',
    en: 'How this project exists | Illusion Fight',
    es: 'Cómo existe este proyecto | Illusion Fight',
  }

  const description = {
    pt: 'Illusion Fight é um projeto independente. Uma pessoa, 23 anos de desenvolvimento, lançando em 2026.',
    en: 'Illusion Fight is an independent project. One person, 23 years of development, launching in 2026.',
    es: 'Illusion Fight es un proyecto independiente. Una persona, 23 años de desarrollo, lanzando en 2026.',
  }

  return (
    <>
      <Helmet>
        <title>{title[locale] || title.pt}</title>
        <meta name="description" content={description[locale] || description.pt} />
        <meta property="og:title" content={title[locale] || title.pt} />
        <meta property="og:description" content={description[locale] || description.pt} />
        <meta property="og:url" content="https://illusionfight.com/custos" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hreflang="pt" href="https://illusionfight.com/custos" />
        <link rel="alternate" hreflang="en" href="https://illusionfight.com/custos" />
        <link rel="alternate" hreflang="es" href="https://illusionfight.com/custos" />
      </Helmet>

      <section className="custos">
        <div className="container custos__container">
          <h1 className="custos__title">{t('custos.title')}</h1>

          <p className="custos__intro">{t('custos.intro')}</p>

          <hr className="custos__divider" />

          <section className="custos__section">
            <h2 className="custos__section-title">{t('custos.s1.title')}</h2>
            <h3 className="custos__subtitle">{t('custos.s1.sub')}</h3>
            <ul className="custos__list">
              <li>{t('custos.s1.item1')}</li>
              <li>{t('custos.s1.item2')}</li>
              <li>{t('custos.s1.item3')}</li>
            </ul>
            <h3 className="custos__subtitle">{t('custos.s1.sub2')}</h3>
            <p className="custos__body">{t('custos.s1.body')}</p>
          </section>

          <hr className="custos__divider" />

          <section className="custos__section">
            <h2 className="custos__section-title">{t('custos.s2.title')}</h2>
            <p className="custos__body">{t('custos.s2.body')}</p>
          </section>

          <hr className="custos__divider" />

          <section className="custos__section">
            <h2 className="custos__section-title">{t('custos.s3.title')}</h2>
            <ul className="custos__list">
              <li>{t('custos.s3.item1')}</li>
              <li>{t('custos.s3.item2')}</li>
              <li>{t('custos.s3.item3')}</li>
              <li>{t('custos.s3.item4')}</li>
            </ul>
          </section>

          <hr className="custos__divider" />

          <section className="custos__section">
            <h2 className="custos__section-title">{t('custos.s4.title')}</h2>
            <p className="custos__body">{t('custos.s4.body')}</p>
            <p className="custos__body custos__thanks">{t('custos.s4.thanks')}</p>
            <p className="custos__body custos__free">{t('custos.s4.free')}</p>
          </section>

          <hr className="custos__divider" />

          <div className="custos__cta-wrap">
            <button className="custos__cta" onClick={() => navigate('/assinar')}>
              {t('custos.cta')}
            </button>
          </div>

          <p className="custos__footer">{t('custos.footer')}</p>
        </div>
      </section>
    </>
  )
}
