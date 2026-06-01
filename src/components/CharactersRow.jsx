import { useLanguage } from '../context/LanguageContext'
import { usePersonagens } from '../hooks/usePersonagens'
import CharacterCard from './CharacterCard'
import './CharactersRow.css'

const PROTAGONIST_IDS = ['kim', 'jack', 'nina']

export default function CharactersRow() {
  const { t } = useLanguage()
  const all = usePersonagens()
  const protagonists = all.filter(p => PROTAGONIST_IDS.includes(p.id))

  return (
    <section className="characters-row">
      <div className="container">
        <h2 className="section-title">PERSONAGENS</h2>
        <div className="characters-row__fade">
          <div className="characters-row__scroll">
            {protagonists.map(p => (
              <CharacterCard key={p.id} character={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
