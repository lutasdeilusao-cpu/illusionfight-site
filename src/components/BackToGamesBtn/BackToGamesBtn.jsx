import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import './BackToGamesBtn.css'

/**
 * Botão padronizado "← VOLTAR AOS GAMES"
 * Usar em todas as telas de entrada/lobby/saves dos jogos.
 *
 * Props:
 * - onClick: função opcional (se não for Link)
 * - to: rota (default '/games')
 * - label: texto (default pega do i18n)
 * - style: estilo extra
 */
export default function BackToGamesBtn({ onClick, to = '/games', label, style }) {
  const { t } = useLanguage()
  const resolvedLabel = label ?? '← ' + t('games.backToGames')
  if (onClick) {
    return (
      <button className="back-to-games-btn" onClick={onClick} style={style}>
        <span className="back-to-games-btn__shine" />
        <span className="back-to-games-btn__label">{resolvedLabel}</span>
      </button>
    )
  }
  return (
    <Link to={to} className="back-to-games-btn" style={style}>
      <span className="back-to-games-btn__shine" />
      <span className="back-to-games-btn__label">{resolvedLabel}</span>
    </Link>
  )
}
