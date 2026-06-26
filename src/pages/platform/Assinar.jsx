import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { iniciarCheckout, getPriceDisplay } from '../../lib/stripe'
import { LAUNCH_DATE, ADMIN_EMAILS } from '../../config/launch'
import planos from '../../data/planos.json'
import './Assinar.css'

export default function Assinar() {
  const { locale, t } = useLanguage()
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const priceDisplay = getPriceDisplay(locale)
  const [loadingTier, setLoadingTier] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const hoje = new Date().toISOString().split('T')[0]
  const isPreLaunch = !isAdmin && hoje < LAUNCH_DATE

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('sucesso')) setFeedback({ tipo: 'sucesso', tier: params.get('tier') })
    if (params.get('cancelado')) setFeedback({ tipo: 'cancelado' })
  }, [])

  async function handleAssinar(tier) {
    if (!user) {
      navigate('/login?redirect=/assinar')
      return
    }
    if (perfil?.tier === tier) return
    setLoadingTier(tier)
    try {
      await iniciarCheckout(tier)
    } catch (err) {
      console.error('[ASSINAR] erro checkout:', err)
      setFeedback({ tipo: 'erro', mensagem: err.message })
    } finally {
      setLoadingTier(null)
    }
  }

  function getLabelBotao(tier) {
    if (!user) return t('assinar.cta')
    if (perfil?.tier === tier) return t('assinar.plano_atual')
    if (perfil?.subscription_status === 'past_due') return t('assinar.pagamento_pendente')
    if (perfil?.subscription_status === 'canceling' && perfil?.tier === tier) {
      const data = perfil?.current_period_end
        ? new Date(perfil.current_period_end).toLocaleDateString(locale)
        : ''
      return t('assinar.cancela_em', { data })
    }
    if (perfil?.tier === 'PRIMORDIAL' && tier === 'ELITE') return t('assinar.fazer_downgrade')
    if (perfil?.tier === 'ELITE' && tier === 'PRIMORDIAL') return t('assinar.fazer_upgrade')
    return t('assinar.cta')
  }

  const nomeKey = locale === 'en' ? 'nome_en' : locale === 'es' ? 'nome_es' : 'nome'
  const precoKey = locale === 'en' ? 'preco_label_en' : locale === 'es' ? 'preco_label_es' : 'preco_label'
  const benefKey = locale === 'en' ? 'beneficios_en' : locale === 'es' ? 'beneficios_es' : 'beneficios_pt'
  const ctaTextKey = locale === 'en' ? 'cta_en' : locale === 'es' ? 'cta_es' : 'cta_pt'
  const badgeKey = locale === 'en' ? 'badge_en' : locale === 'es' ? 'badge_es' : 'badge_pt'

  return (
    <>
      <Helmet>
        <title>{t('pages.helmet.assinar')}</title>
        <meta name="description" content={t('pages.assinar.og_desc')} />
        <meta property="og:title" content={t('pages.assinar.og_title')} />
        <meta property="og:description" content={t('pages.assinar.og_desc')} />
        <meta property="og:url" content="https://illusionfight.com/assinar" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      <section className="assinar-hero">
        <div className="assinar-hero__scanlines" />
        <div className="container">
          <h1 className="assinar-hero__title">{t('assinar.titulo')}</h1>
          <p className="assinar-hero__subtitle">{t('assinar.subtitulo')}</p>
          <Link to="/custos" className="assinar-hero__custos-btn">
            {t('assinar.custosBtn')}
          </Link>
        </div>
      </section>

      {feedback && (
        <section className="assinar-feedback">
          <div className="container">
            {feedback.tipo === 'sucesso' && (
              <div className="assinar-feedback__sucesso">
                {t('assinar.feedback.sucesso', { tier: feedback.tier })}
              </div>
            )}
            {feedback.tipo === 'cancelado' && (
              <div className="assinar-feedback__info">
                {t('assinar.feedback.cancelado')}
              </div>
            )}
            {feedback.tipo === 'erro' && (
              <div className="assinar-feedback__erro">
                {t('assinar.feedback.erro', { mensagem: feedback.mensagem })}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="assinar-plans">
        <div className="container">
          <div className="assinar-plans__grid">
            {planos.map(p => {
              const isBase = p.id === 'ranqueado'
              const isDestaque = p.destaque
              return (
                <div
                  key={p.id}
                  data-plan={p.id}
                  className={`assinar-card${isDestaque ? ' assinar-card--destaque' : ''}${isBase ? ' assinar-card--base' : ''}`}
                >
                  {isDestaque && (
                    <span className="assinar-card__badge">{p[badgeKey]}</span>
                  )}
                  <h2 className="assinar-card__name">{p[nomeKey]}</h2>
                  <div className="assinar-card__price">
                    <span className="assinar-card__price-value">
                      {p.id === 'ranqueado'
                        ? p[precoKey]
                        : `${priceDisplay.symbol}${priceDisplay[p.id]}/${priceDisplay.per}`
                      }
                    </span>
                  </div>
                  <ul className="assinar-card__benefits">
                    {p[benefKey].map((b, i) => (
                      <li key={i} className={`assinar-card__benefit${isBase ? ' assinar-card__benefit--muted' : ''}`}>
                        <span className="assinar-card__check">âœ“</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  {p.cta_disabled ? (
                    <span className="assinar-card__cta assinar-card__cta--disabled">{p[ctaTextKey]}</span>
                  ) : isPreLaunch && p.id !== 'ranqueado' ? (
                    <span className="assinar-card__cta assinar-card__cta--disabled assinar-card__cta--gate">
                      {t('assinar.gate.pre_lancamento', { date: LAUNCH_DATE })}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAssinar(p.id.toUpperCase())}
                      disabled={loadingTier === p.id.toUpperCase() || perfil?.tier === p.id.toUpperCase()}
                      className={`assinar-card__cta${isDestaque ? ' assinar-card__cta--filled' : ' assinar-card__cta--outline'}`}
                    >
                      {loadingTier === p.id.toUpperCase() ? t('assinar.aguarde') : getLabelBotao(p.id.toUpperCase())}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <p className="assinar-plans__nota">{t('assinar.nota')}</p>
          <p className="assinar-plans__anchor">{t('assinar.fichaAnchor')}</p>
        </div>
      </section>

      <section className="assinar-doacao">
        <div className="container">
          <div className="assinar-doacao__box">
            <h2 className="assinar-doacao__title">{t('assinar.doacao.title')}</h2>
            <p className="assinar-doacao__text">{t('assinar.doacao.text')}</p>
            <ul className="assinar-doacao__benefits">
              <li>{t('assinar.doacao.benefit1')}</li>
              <li>{t('assinar.doacao.benefit2')}</li>
            </ul>
            <a href="#" className="assinar-doacao__btn">{t('assinar.doacao.cta')}</a>
          </div>
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
