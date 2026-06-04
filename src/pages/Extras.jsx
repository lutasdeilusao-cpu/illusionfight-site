import { useNavigate } from 'react-router-dom'
import './Extras.css'

const JOGOS = [
  { id: 'ldi', nome: 'Lendas do LDI', tagline: 'RPG narrativo. crie seu avatar. enfrente a arena.', emoji: '⚔️', cor: '#00B4D8', rota: '/extras/ldi', badge: 'FREE', badgeCor: '#00B4D8' },
  { id: 'jackcandy', nome: 'Jack Dream Beer', tagline: 'idle noir. sonhos não têm lógica. esse tem cervejas.', emoji: '🍺', cor: '#F5A623', rota: '/extras/jackcandy', badge: 'FREE', badgeCor: '#F5A623' },
  { id: 'toptrumps', nome: 'Top Trumps LDI', tagline: 'cartas colecionáveis. monte seu deck. vença a IA.', emoji: '🃏', cor: '#A855F4', rota: '/extras/toptrumps', badge: 'FREE', badgeCor: '#A855F4' },
  { id: 'minigames', nome: 'Mini Games', tagline: 'puzzles standalone. sem login. só habilidade.', emoji: '🎮', cor: '#22C55E', rota: '/extras/minigames', badge: 'FREE', badgeCor: '#22C55E' },
  { id: 'arena', nome: 'Arena LDI', tagline: 'combate em tempo real. em breve.', emoji: '🏟️', cor: '#8B0000', rota: null, badge: 'EM BREVE', badgeCor: '#8B0000', bloqueado: true },
]

const CONTEUDO = [
  { id: 'quiz', nome: 'Quiz SDR', tagline: 'teste seu conhecimento do universo LDI.', emoji: '🎯', cor: '#22C55E', rota: '/quiz', badge: 'FREE' },
  { id: 'leaderboard', nome: 'Leaderboard', tagline: 'ranking global de jogadores.', emoji: '🏆', cor: '#F5A623', rota: '/leaderboard', badge: 'FREE' },
  { id: 'curiosidades', nome: 'Curiosidades', tagline: 'bastidores e segredos do universo.', emoji: '📖', cor: '#00B4D8', rota: '/curiosidades', badge: 'FREE' },
]

export default function Extras() {
  const navigate = useNavigate()

  return (
    <div className="extras-page">
      <div className="extras-scanlines" />

      <div className="extras-header">
        <h1 className="extras-titulo">
          <span className="extras-titulo-glitch" data-text="EXTRAS">EXTRAS</span>
        </h1>
        <p className="extras-subtitulo">
          <span className="extras-cursor">█</span> explore além da história principal
        </p>
      </div>

      <section className="extras-secao">
        <div className="extras-secao-label">
          <span>▶ JOGOS</span>
          <div className="extras-secao-linha" />
        </div>
        <div className="extras-jogos-grid">
          {JOGOS.map(jogo => (
            <div key={jogo.id} className={`extras-jogo-card ${jogo.bloqueado ? 'extras-jogo-card--bloqueado' : ''}`}
              style={{ '--cor-neon': jogo.cor }}
              onClick={() => !jogo.bloqueado && jogo.rota && navigate(jogo.rota)}>
              <div className="extras-jogo-card-inner">
                <div className="extras-jogo-badge" style={{ background: jogo.badgeCor + '22', border: `1px solid ${jogo.badgeCor}`, color: jogo.badgeCor }}>
                  {jogo.badge}
                </div>
                <div className="extras-jogo-emoji">{jogo.emoji}</div>
                <h2 className="extras-jogo-nome">{jogo.nome}</h2>
                <p className="extras-jogo-tagline">{jogo.tagline}</p>
                {!jogo.bloqueado && <div className="extras-jogo-cta">INSERIR FICHA</div>}
                {jogo.bloqueado && <div className="extras-jogo-cta extras-jogo-cta--bloqueado">EM BREVE</div>}
              </div>
              <div className="extras-jogo-card-borda" />
            </div>
          ))}
        </div>
      </section>

      <section className="extras-secao">
        <div className="extras-secao-label">
          <span>▶ CONTEÚDO</span>
          <div className="extras-secao-linha" />
        </div>
        <div className="extras-conteudo-grid">
          {CONTEUDO.map(item => (
            <div key={item.id} className="extras-conteudo-card" style={{ '--cor-neon': item.cor }}
              onClick={() => item.rota && navigate(item.rota)}>
              <span className="extras-conteudo-emoji">{item.emoji}</span>
              <div>
                <p className="extras-conteudo-nome">{item.nome}</p>
                <p className="extras-conteudo-tagline">{item.tagline}</p>
              </div>
              <span className="extras-conteudo-badge" style={{ color: item.cor, borderColor: item.cor + '44' }}>{item.badge}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="extras-footer-arcade">
        <span className="extras-footer-credits">© {new Date().getFullYear()} LUTAS DE ILUSÃO — 1 PLAYER</span>
      </div>
    </div>
  )
}
