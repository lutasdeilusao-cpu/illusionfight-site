import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import './WebShard.css'

/* Página de SEO/explicação do WEB SHARD — o formato de web comic/mangá
   vertical em páginas compostas que o Isaias cunhou (21/09/2026: "não tá
   fazendo nenhum mangá, nenhum comic e nenhum webtoon, tá fazendo uma
   coisa nova... esse é o nome que melhor define o que a gente entrega").
   O portal CONTINUA usando "Webtoon" como termo de navegação/rota (puxa
   busca — ver Webtoon.jsx), mas esta página é onde o termo PRÓPRIO é
   explicado de verdade, com link a partir de um botãozinho na página
   /webtoon. Segue os tokens do design system (if-*, design-system.css) —
   nenhuma cor nova, nenhum CSS-in-JS. */
export default function WebShard() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const url = 'https://illusionfight.com/web-shard'

  return (
    <>
      <Helmet>
        <title>{t('webShard.meta_title')}</title>
        <meta name="description" content={t('webShard.meta_desc')} />
        <meta property="og:title" content={t('webShard.meta_title')} />
        <meta property="og:description" content={t('webShard.meta_desc')} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content="https://illusionfight.com/og-image-webshard.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hrefLang="pt" href={url} />
        <link rel="alternate" hrefLang="en" href={url} />
        <link rel="alternate" hrefLang="es" href={url} />
      </Helmet>

      <section className="web-shard">
        <div className="container web-shard__container">
          <header className="web-shard__hero">
            <span className="if-eyebrow">{t('webShard.hero.kicker')}</span>
            <h1 className="if-title web-shard__h1">{t('webShard.hero.title')}</h1>
            <p className="web-shard__subtitle">{t('webShard.hero.subtitle')}</p>
            <div className="web-shard__cta-row">
              <button type="button" className="if-btn if-btn--primary" onClick={() => navigate('/webtoon')}>
                {t('webShard.hero.cta1')}
              </button>
              <a className="if-btn if-btn--ghost" href="#como-funciona">{t('webShard.hero.cta2')}</a>
            </div>
          </header>

          <hr className="if-divider web-shard__divider" />

          <section className="web-shard__section">
            <h2 className="if-title">{t('webShard.s1.title')}</h2>
            <p className="web-shard__body">{t('webShard.s1.body1')}</p>
            <p className="web-shard__body">{t('webShard.s1.body2')}</p>
          </section>

          <hr className="if-divider web-shard__divider" />

          <section className="web-shard__section" id="como-funciona">
            <h2 className="if-title">{t('webShard.s2.title')}</h2>
            <ol className="web-shard__steps">
              {[1, 2, 3, 4].map(n => (
                <li key={n} className="web-shard__step">
                  <span className="web-shard__step-n">{n}</span>
                  <p><strong>{t(`webShard.s2.step${n}_title`)}</strong> {t(`webShard.s2.step${n}_body`)}</p>
                </li>
              ))}
            </ol>
            <div className="web-shard__cta-row">
              <button type="button" className="if-btn if-btn--amber" onClick={() => navigate('/webtoon')}>
                {t('webShard.s2.cta')}
              </button>
            </div>
          </section>

          <hr className="if-divider web-shard__divider" />

          <section className="web-shard__section">
            <h2 className="if-title">{t('webShard.s3.title')}</h2>
            <ul className="web-shard__list">
              {[1, 2, 3, 4].map(n => (
                <li key={n}><strong>{t(`webShard.s3.item${n}_title`)}</strong> {t(`webShard.s3.item${n}_body`)}</li>
              ))}
            </ul>
          </section>

          <hr className="if-divider web-shard__divider" />

          <section className="web-shard__section">
            <h2 className="if-title">{t('webShard.s4.title')}</h2>
            <p className="web-shard__body">{t('webShard.s4.body')}</p>
          </section>

          <hr className="if-divider web-shard__divider" />

          <section className="web-shard__section web-shard__obra if-panel">
            <h2 className="if-title">{t('webShard.s5.title')}</h2>
            <p className="web-shard__body">{t('webShard.s5.body1')}</p>
            <p className="web-shard__body web-shard__body--emph">{t('webShard.s5.body2')}</p>
            <button type="button" className="if-btn if-btn--primary" onClick={() => navigate('/webtoon/01')}>
              {t('webShard.s5.cta')}
            </button>
          </section>

          <hr className="if-divider web-shard__divider" />

          <section className="web-shard__section">
            <h2 className="if-title">{t('webShard.faq.title')}</h2>
            {[1, 2, 3, 4, 5].map(n => (
              <details key={n} className="web-shard__faq-item">
                <summary>{t(`webShard.faq.q${n}`)}</summary>
                <p>{t(`webShard.faq.a${n}`)}</p>
              </details>
            ))}
          </section>

          <div className="web-shard__final">
            <p className="web-shard__final-text">{t('webShard.final.text')}</p>
            <button type="button" className="if-btn if-btn--primary" onClick={() => navigate('/webtoon')}>
              {t('webShard.final.cta')}
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
