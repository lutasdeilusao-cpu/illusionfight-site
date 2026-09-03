import { Link } from 'react-router-dom'
import CharacterCard from '../../../../components/CharacterCard'
import { useLanguage } from '../../../../context/LanguageContext'
import { usePersonagens } from '../../../../hooks/usePersonagens'
import { useScrollReveal } from '../../../../hooks/useScrollReveal'
import './CharactersRow.css'

export default function CharactersRow() {
  const { t } = useLanguage()
  const personagens = usePersonagens().slice(0, 6)
  const ref = useScrollReveal()

  return (
    <section ref={ref} className="characters-row reveal">
      <div className="container">
        <h2 className="section-title">{t('home.section_characters')}</h2>
        <div className="characters-row__fade">
          <div className="characters-row__scroll">
            {personagens.map(personagem => (
              <CharacterCard key={personagem.id} character={personagem} />
            ))}
          </div>
        </div>
        <div className="characters-row__footer">
          <Link to="/mundo" className="btn btn--outline">{t('pages.mundo.ver_todos')}</Link>
        </div>
      </div>
    </section>
  )
}
