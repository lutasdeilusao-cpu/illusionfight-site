import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import './Assinar.css'

const plans = ['apoiador', 'guerreiro']

export default function Assinar() {
  const { t } = useLanguage()

  return (
    <>
      <Helmet>
        <title>Assinar — Lutas de Ilusão</title>
      </Helmet>
      <section className="assinar-hero">
        <div className="assinar-hero__scanlines" />
        <div className="container">
          <h1 className="assinar-hero__title">{t('assinar.hero.title')}</h1>
          <p className="assinar-hero__subtitle">{t('assinar.hero.subtitle')}</p>
        </div>
      </section>

      <section className="assinar-plans">
        <div className="container">
          <div className="assinar-plans__grid">
            {plans.map(plan => {
              const isGuerreiro = plan === 'guerreiro'
              return (
                <div
                  key={plan}
                  className={`assinar-card${isGuerreiro ? ' assinar-card--destaque' : ''}`}
                >
                  {isGuerreiro && (
                    <span className="assinar-card__badge">{t('assinar.plans.guerreiro.badge')}</span>
                  )}
                  <h2 className="assinar-card__name">{t(`assinar.plans.${plan}.name`)}</h2>
                  <div className="assinar-card__price">
                    <span className="assinar-card__price-value">{t(`assinar.plans.${plan}.price`)}</span>
                    <span className="assinar-card__price-period">{t('assinar.plans.period')}</span>
                  </div>
                  <ul className="assinar-card__benefits">
                    {[0, 1, 2].map(i => (
                      <li key={i} className="assinar-card__benefit">
                        <span className="assinar-card__check">✓</span>
                        {t(`assinar.plans.${plan}.benefits.${i}`)}
                      </li>
                    ))}
                  </ul>
                  <a href="#" className="assinar-card__cta">{t('assinar.plans.cta')}</a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="assinar-pix">
        <div className="container">
          <h2 className="assinar-pix__title">{t('assinar.pix.title')}</h2>
          <p className="assinar-pix__text">{t('assinar.pix.text')}</p>
          <div className="assinar-pix__key">{t('assinar.pix.key')}</div>
        </div>
      </section>
    </>
  )
}
