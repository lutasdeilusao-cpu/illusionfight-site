import { Link } from 'react-router-dom'
import './CapCard.css'

/**
 * Mini-card vertical de capítulo — miniatura + rótulo + título + resumo curto + status.
 * Usado nas listas internas (linha principal, conto, obra). Espaço de imagem
 * reservado (`img`); enquanto não houver arte oficial, mostra um placeholder.
 */
export default function CapCard({ to, rotulo, titulo, resumo, img, liberado = true, badge, meta }) {
  const Wrapper = liberado && to ? Link : 'div'
  const wrapperProps = liberado && to ? { to } : {}

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
        {(meta || badge) && <span className="cap-card__meta">{liberado ? meta : badge}</span>}
      </div>
    </Wrapper>
  )
}
