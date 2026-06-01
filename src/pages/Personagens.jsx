import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { usePersonagensAgrupados } from '../hooks/usePersonagens'
import CharacterCard from '../components/CharacterCard'
import './Personagens.css'

export default function Personagens() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const groups = usePersonagensAgrupados()

  return (
    <section className="personagens-page">
      <div className="container">
        <button className="personagens-page__back" onClick={() => navigate('/')}>
          ← {t('hero.cta.secondary')}
        </button>

        {groups.map(group => (
          <div key={group.label} className="personagens-page__group">
            <h2 className="personagens-page__group-title">{group.label}</h2>
            <div className="personagens-page__grid">
              {group.items.map(p => (
                <CharacterCard key={p.id} character={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
