import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { nextBetterLevel, releaseDateFor, resolveAccessLevel } from '../../lib/releaseAccess'
import './CapCard.css'

/**
 * Mini-card vertical de capítulo — miniatura + rótulo + título + resumo curto + status.
 * Usado nas listas internas (linha principal, conto, obra). Espaço de imagem
 * reservado (`img`); enquanto não houver arte oficial, mostra um placeholder.
 */
export default function CapCard({ to, rotulo, titulo, resumo, img, liberado = true, badge, meta, releaseItem }) {
  const { user, perfil } = useAuth()
  const { t, locale } = useLanguage()
  const Wrapper = liberado && to ? Link : 'div'
  const wrapperProps = liberado && to ? { to } : {}
  const level = resolveAccessLevel(user, perfil)
  const betterLevel = nextBetterLevel(level)
  const unlockDate = releaseDateFor(releaseItem, level)
  const earlierDate = betterLevel ? releaseDateFor(releaseItem, betterLevel) : null
  const formatDate = date => date && new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
  const releaseBadge = unlockDate
    ? `${t('calendar.unlocks_on')} ${formatDate(unlockDate)}${earlierDate && earlierDate < unlockDate ? ` · ${t(`calendar.earlier_${betterLevel}`)} ${formatDate(earlierDate)}` : ''}`
    : badge

  return (
    <Wrapper className={`cap-card${liberado ? '' : ' cap-card--locked'}`} {...wrapperProps}>
      <div className="cap-card__thumb">
        {img
          ? <img className="cap-card__thumb-img" src={img} alt="" loading="lazy" decoding="async" />
          : <span className="cap-card__thumb-ph" aria-hidden="true">{rotulo}</span>}
      </div>
      <div className="cap-card__body">
        {rotulo && <span className="cap-card__rotulo">{rotulo}</span>}
        <span className="cap-card__titulo">{titulo}</span>
        {resumo && <p className="cap-card__resumo">{resumo}</p>}
        {(meta || releaseBadge) && <span className="cap-card__meta">{liberado ? meta : releaseBadge}</span>}
      </div>
    </Wrapper>
  )
}
