import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { usePersonagens } from '../hooks/usePersonagens'
import { useScrollReveal } from '../hooks/useScrollReveal'
import CharacterCard from './CharacterCard'
import './CharactersRow.css'

const PROTAGONIST_IDS = ['kim', 'jack', 'nina']

export default function CharactersRow() {
  const ref = useScrollReveal()
  const { t } = useLanguage()
  const all = usePersonagens()
  const protagonists = all.filter(p => PROTAGONIST_IDS.includes(p.id))

  return (
    <section ref={ref} className="characters-row reveal">
      <div className="container">
        <h2 className="section-title">MUNDO</h2>
        <div className="characters-row__fade">
          <div className="characters-row__scroll">
            {protagonists.map(p => (
              <CharacterCard key={p.id} character={p} />
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/mundo" className="btn btn--outline">EXPLORAR O UNIVERSO</Link>
        </div>
      </div>
    </section>
  )
}
