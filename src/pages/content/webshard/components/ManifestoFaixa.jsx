import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import './ManifestoFaixa.css'

/** O manifesto WEB SHARD em quatro batidas, no pé do hub. Os textos são os
 *  mesmos da página /web-shard (webShard.s2.*) — uma fonte só. */
export default function ManifestoFaixa() {
  const { t } = useLanguage()
  return (
    <section className="ws-manifesto">
      <span className="if-eyebrow">{t('webShard.hub.manifesto_eyebrow')}</span>
      <h2 className="ws-manifesto__titulo">{t('webShard.hub.manifesto_titulo')}</h2>
      <ol className="ws-manifesto__lista">
        {[1, 2, 3, 4].map(n => (
          <li key={n} className="ws-manifesto__item">
            <span className="ws-manifesto__n">{String(n).padStart(2, '0')}</span>
            <span className="ws-manifesto__texto">
              <strong>{t(`webShard.s2.step${n}_title`)}</strong> {t(`webShard.s2.step${n}_body`)}
            </span>
          </li>
        ))}
      </ol>
      <Link to="/web-shard" className="if-btn if-btn--ghost ws-manifesto__cta">
        {t('webShard.hub.manifesto_cta')}
      </Link>
    </section>
  )
}
