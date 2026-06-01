import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './CharacterCard.css'

export default function CharacterCard({ character }) {
  const [imgError, setImgError] = useState(false)
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="character-card" onClick={() => navigate(`/personagens/${character.id}`)}>
      <div className="character-card__image">
        {character.imagem && !imgError ? (
          <img
            src={character.imagem}
            alt={character.nome}
            className="character-card__img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="character-card__placeholder">
            <span className="character-card__placeholder-text">{character.nome}</span>
          </div>
        )}
      </div>

      <div className="character-card__footer">
        <div className="character-card__name">{character.nome}</div>
        {character.ranking && <div className="character-card__ranking">#{character.ranking}</div>}
      </div>

      <div className="character-card__overlay">
        <div className="character-card__overlay-name">{character.nome}</div>
        <div className="character-card__overlay-bio">{character.descricaoBreve}</div>
        <button className="character-card__overlay-btn">{t('hero.cta.secondary')}</button>
      </div>
    </div>
  )
}
