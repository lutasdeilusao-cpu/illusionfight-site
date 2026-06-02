import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../context/LanguageContext'
import planos from '../data/planos.json'
import './Assinar.css'

export default function Assinar() {
  const { locale, t } = useLanguage()

  const nomeKey = locale === 'en' ? 'nome_en' : locale === 'es' ? 'nome_es' : 'nome'
  const precoKey = locale === 'en' ? 'preco_label_en' : locale === 'es' ? 'preco_label_es' : 'preco_label'
  const benefKey = locale === 'en' ? 'beneficios_en' : locale === 'es' ? 'beneficios_es' : 'beneficios_pt'
  const ctaTextKey = locale === 'en' ? 'cta_en' : locale === 'es' ? 'cta_es' : 'cta_pt'
  const badgeKey = locale === 'en' ? 'badge_en' : locale === 'es' ? 'badge_es' : 'badge_pt'

  return (
    <>
      <Helmet>
        <title>Assinar — Lutas de Ilusão</title>
      </Helmet>

      <section className="assinar-hero">
        <div className="assinar-hero__scanlines" />
        <div className="container">
          <h1 className="assinar-hero__title">{t('assinar.titulo')}</h1>
          <p className="assinar-hero__subtitle">{t('assinar.subtitulo')}</p>
        </div>
      </section>

      <section className="assinar-plans">
        <div className="container">
          <div className="assinar-plans__grid">
            {planos.map(p => {
              const isBase = p.id === 'ranqueado'
              const isDestaque = p.destaque
              return (
                <div
                  key={p.id}
                  className={`assinar-card${isDestaque ? ' assinar-card--destaque' : ''}${isBase ? ' assinar-card--base' : ''}`}
                  style={isDestaque ? { boxShadow: '0 0 24px rgba(244, 162, 39, 0.2)' } : {}}
                >
                  {isDestaque && (
                    <span className="assinar-card__badge">{p[badgeKey]}</span>
                  )}
                  <h2 className="assinar-card__name" style={{ color: p.cor }}>{p[nomeKey]}</h2>
                  <div className="assinar-card__price">
                    <span className="assinar-card__price-value" style={{ color: p.id === 'ranqueado' ? 'var(--text-muted)' : p.cor }}>
                      {p[precoKey]}
                    </span>
                  </div>
                  <ul className="assinar-card__benefits">
                    {p[benefKey].map((b, i) => (
                      <li key={i} className={`assinar-card__benefit${isBase ? ' assinar-card__benefit--muted' : ''}`}>
                        <span className="assinar-card__check" style={{ color: p.cor }}>✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  {p.cta_disabled ? (
                    <span className="assinar-card__cta assinar-card__cta--disabled">{p[ctaTextKey]}</span>
                  ) : (
                    <a
                      href={p.cta_url || '#'}
                      className={`assinar-card__cta${isDestaque ? ' assinar-card__cta--filled' : ' assinar-card__cta--outline'}`}
                      style={isDestaque ? { background: 'var(--accent-amber)', color: '#000', borderColor: 'var(--accent-amber)' } : { borderColor: p.cor, color: p.cor }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p[ctaTextKey]}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
          <p className="assinar-plans__nota">{t('assinar.nota')}</p>
        </div>
      </section>

      <section className="assinar-newsletter">
        <div className="container">
          <div className="assinar-newsletter__box">
            <div className="assinar-newsletter__header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polyline points="2,4 12,13 22,4" />
              </svg>
              <h2 className="assinar-newsletter__title">{t('newsletter.titulo')}</h2>
            </div>
            <p className="assinar-newsletter__desc">{t('newsletter.descricao')}</p>
            <a
              href="https://illusionfight.substack.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="assinar-newsletter__btn"
            >
              {t('newsletter.botao')}
            </a>
            <p className="assinar-newsletter__gratis">{t('newsletter.gratis')}</p>
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
