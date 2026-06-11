import { Helmet } from 'react-helmet-async'
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
      <Helmet>
        <title>Characters — Illusion Fight</title>
        <meta name="description" content="Meet the fighters of Illusion Fight: Kim, Jack, Nina, Helena, Shuntaro, and more. Every character has a story, a fighting style, and a place in the LDI arena." />
        <meta property="og:title" content="Characters — Illusion Fight" />
        <meta property="og:description" content="Meet the fighters of Illusion Fight. Every character has a story, a fighting style, and a place in the LDI arena." />
        <meta property="og:url" content="https://illusionfight.com/personagens" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hrefLang="pt" href="https://illusionfight.com/personagens" />
        <link rel="alternate" hrefLang="en" href="https://illusionfight.com/personagens" />
        <link rel="alternate" hrefLang="es" href="https://illusionfight.com/personagens" />
      </Helmet>
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
