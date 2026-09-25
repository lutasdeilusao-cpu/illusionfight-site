import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { imagemWebshard, localizado, rotaTitulo } from '../../../../lib/webshard/catalogo'
import './TituloCard.css'

/** Capa vertical de um título na estante do hub. A cor do título entra só
 *  como fio/selo (--ws-cor), a moldura é a do portal. */
export default function TituloCard({ titulo, indice, oculto = false }) {
  const { t, locale } = useLanguage()
  const capa = imagemWebshard(titulo.capa)
  const nome = localizado(titulo, 'nome', locale)

  return (
    <Link
      to={rotaTitulo(titulo)}
      className={`ws-titulo-card${titulo.status === 'em_breve' ? ' ws-titulo-card--breve' : ''}`}
      style={{ '--ws-cor': titulo.cor }}
    >
      <div className="ws-titulo-card__capa">
        {capa && <img src={capa} alt={nome} loading="lazy" decoding="async" />}
        <span className="ws-titulo-card__indice">{String(indice).padStart(2, '0')}</span>
        <span className="ws-titulo-card__status">{t(`webShard.status.${titulo.status}`)}</span>
        {oculto && <span className="ws-titulo-card__admin">{t('webShard.hub.admin_oculto')}</span>}
      </div>
      <div className="ws-titulo-card__info">
        <h3 className="ws-titulo-card__nome">{nome}</h3>
        <p className="ws-titulo-card__tagline">{localizado(titulo, 'tagline', locale)}</p>
      </div>
    </Link>
  )
}
