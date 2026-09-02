import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import universos from '../../data/universo-index.json'
import './Livro.css'
import './Contos.css'
import './Historias.css'
import './MundoHub.css'

const assets = import.meta.glob('../../assets/obras/*/*.{webp,jpg,png}', { eager: true, import: 'default' })
const asset = (slug, file) => (file ? assets[`../../assets/obras/${slug}/${file}`] || null : null)

export default function MundoHub() {
  const { locale, t } = useLanguage()
  const sufT = locale === 'en' ? '_en' : locale === 'es' ? '_es' : ''
  const suf = locale === 'en' ? '_en' : locale === 'es' ? '_es' : '_pt'

  return (
    <section className="livro-page historias-page mundo-hub-page">
      <Helmet>
        <title>{t('pages.mundoHub.og_title')}</title>
        <meta name="description" content={t('pages.mundoHub.og_desc')} />
        <meta property="og:title" content={t('pages.mundoHub.og_title')} />
        <meta property="og:description" content={t('pages.mundoHub.og_desc')} />
        <meta property="og:url" content="https://illusionfight.com/mundo" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container">
        <h2 className="section-title">{t('pages.mundoHub.titulo')}</h2>
        <p className="historias-intro">{t('pages.mundoHub.intro')}</p>

        <div className="hub-row hub-row--wrap">
          {universos.map(u => (
            <Link
              key={u.id}
              to={u.rota || `/mundo/${u.id}`}
              className="hub-card"
              data-uni={u.id}
            >
              <div className="hub-card__media">
                {asset(u.id, u.capa)
                  ? <img className="hub-card__img" src={asset(u.id, u.capa)} alt="" loading="lazy" decoding="async" />
                  : <div className={`hub-card__img hub-card__img--texto hub-card__img--${u.selo || 'ldi'}`}><span>{u[`titulo${sufT}`] || u.titulo}</span></div>}
              </div>
              <div className="hub-card__body">
                <span className="hub-card__titulo">{u[`titulo${sufT}`] || u.titulo}</span>
                <p className="hub-card__tag">{u[`subtitulo${suf}`] || u.subtitulo_pt}</p>
                <span className="hub-card__meta">
                  {u.selo === 'canon' ? t('pages.contos.canon_sim') : t('pages.obra.selo_dark_fantasy')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
