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
    titulo: 'Quiz SDR',
    descricao: 'Teste seu conhecimento sobre o universo LDI e descubra sua posição no ranking entre 3 bilhões de jogadores.',
    badge: 'FREE',
    url: '/quiz',
    cor: 'teal'
  },
  {
    titulo: 'Top Trumps LDI',
    descricao: 'Jogo de cartas colecionáveis com os personagens do universo LDI. Monte seu deck, vença a IA e ganhe cartas novas todo dia.',
    badge: 'FREE',
    url: '/extras/toptrumps',
    cor: 'teal'
  },
  {
    titulo: 'Leaderboard',
    descricao: 'Ranking de jogadores do LDI. Veja sua posição, compare decks e acompanhe os melhores do Top Trumps.',
    badge: 'FREE',
    url: '/leaderboard',
    cor: 'teal'
  },
  {
    titulo: 'Curiosidades',
    descricao: 'Bastidores, conceitos e histórias do universo LDI. Tudo que você sempre quis saber mas não tinha onde ler.',
    badge: 'FREE',
    url: '/curiosidades',
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
