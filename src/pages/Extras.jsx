import { Link } from 'react-router-dom'
import './Extras.css'

const extras = [
  {
    titulo: 'Lendas do LDI',
    descricao: 'RPG narrativo de livro-jogo digital. Crie seu avatar, explore a arena, enfrente inimigos e descubra os segredos do LDI.',
    badge: 'FREE',
    url: '/extras/ldi',
    cor: 'teal'
  },
  {
    titulo: 'Jack Dream Candy',
    descricao: 'Um sonho preto e branco com balas, um pajé e uma bengala steampunk. Idle game noir.',
    badge: 'FREE',
    url: '/extras/jackcandy',
    cor: 'crimson'
  },
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
