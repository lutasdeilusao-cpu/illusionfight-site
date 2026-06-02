import { Link } from 'react-router-dom'
import './Extras.css'

const extras = [
  {
    titulo: 'Quiz SDR',
    descricao: 'Teste seu conhecimento sobre o universo LDI e descubra sua posição no ranking entre 3 bilhões de jogadores.',
    badge: 'FREE',
    url: '/quiz',
    cor: 'teal'
  },
  {
    titulo: 'Curiosidades',
    descricao: 'Lore, easter eggs e bastidores do universo Lutas de Ilusão — o que está entre as linhas.',
    badge: 'PREMIUM',
    url: '/curiosidades',
    cor: 'amber'
  }
]

export default function Extras() {
  return (
    <section className="extras-page">
      <div className="extras-header">
        <span className="extras-tag">CONTEÚDO COMPLEMENTAR</span>
        <h1 className="extras-title">EXTRAS</h1>
        <p className="extras-sub">
          Explore além da história principal — quizzes, lore, bastidores e mais.
        </p>
      </div>
      <div className="extras-grid">
        {extras.map(item => (
          <Link key={item.url} to={item.url} className="extras-card">
            <div className={`extras-card__inner extras-card__inner--${item.cor}`}>
              <h2 className="extras-card__titulo">{item.titulo}</h2>
              <p className="extras-card__desc">{item.descricao}</p>
              <span className={`extras-card__badge extras-card__badge--${item.badge.toLowerCase()}`}>
                {item.badge}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
