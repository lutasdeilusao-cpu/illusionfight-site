import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useFichaGate } from '../../hooks/useFichaGate'
import ModalSemFichas from '../../components/ModalSemFichas/ModalSemFichas'
import './Games.css'

const JOGOS = [
  { id: 'ldi', nome: 'LDI LENDAS', tagline: 'RPG narrativo. crie seu avatar. enfrente a arena.', emoji: '⚔️', cor: '#00B4D8', rota: '/games/ldi', badge: 'FREE', badgeCor: '#00B4D8' },
  { id: 'jackcandy', nome: 'Jack Dream Beer', tagline: 'idle noir. sonhos não têm lógica. esse tem cervejas.', emoji: '🍺', cor: '#F5A623', rota: '/games/jackcandy', badge: 'LANÇADO', badgeCor: '#22C55E' },
  { id: 'pesadelo', nome: 'PRESADELO PARTICULAR', tagline: '20 casos. uma conspiração. um amigo em perigo.', emoji: '🕵️', cor: '#EC4899', rota: '/games/pesadelo', badge: 'LANÇADO', badgeCor: '#22C55E' },
  { id: 'arena', nome: 'LDI ARENA', tagline: 'combate em tempo real contra a CPU.', emoji: '🏟️', cor: '#8B0000', rota: '/games/ldi-arena', badge: 'LANÇADO', badgeCor: '#22C55E' },
  { id: 'tamagoshi', nome: 'TAMA LDI', tagline: 'seu bicho te espera. alimente, cuide, não deixe morrer.', emoji: '🥚', cor: '#00B4D8', rota: '/games/tamagoshi', badge: 'LANÇADO', badgeCor: '#22C55E' },
  { id: 'toptrumps', nome: 'LDI TRUMPS', tagline: 'cartas colecionáveis. monte seu deck. vença a IA.', emoji: '🃏', cor: '#A855F4', rota: '/games/toptrumps', badge: 'LANÇADO', badgeCor: '#22C55E' },
  { id: 'tatics', nome: 'LDI TATICS', tagline: '6 classes. grid tático. 3v3. batalha por turnos.', emoji: '♟️', cor: '#FF4500', rota: '/games/ldi-tatics', badge: 'NOVO', badgeCor: '#FF4500' },
  { id: 'minigames', nome: 'MINI GAMES', tagline: 'puzzles standalone. sem login. só habilidade.', emoji: '🎮', cor: '#22C55E', rota: '/games/minigames', badge: 'FREE', badgeCor: '#22C55E' },
  { id: 'duelo', nome: 'DUELO LDI', tagline: 'card game 1v1. invocar, atacar, vencer.', emoji: '⚔️', cor: '#F5A623', rota: '/games/duelo', badge: 'BETA', badgeCor: '#00B4D8' },
]

const CONTEUDO = [
  { id: 'quiz', nome: 'Quiz SDR', tagline: 'teste seu conhecimento do universo LDI.', emoji: '🎯', cor: '#22C55E', rota: '/quiz', badge: 'FREE' },
  { id: 'leaderboard', nome: 'Leaderboard', tagline: 'ranking global de jogadores.', emoji: '🏆', cor: '#F5A623', rota: '/leaderboard', badge: 'FREE' },
]

export default function Games() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { tentarEntrar: entrarLdi, modalVisivel: modalLdi, fecharModal: fecharLdi } = useFichaGate('lendas_ldi')
  const { tentarEntrar: entrarJack, modalVisivel: modalJack, fecharModal: fecharJack } = useFichaGate('jack_dream_beer')
  const { tentarEntrar: entrarTrumps, modalVisivel: modalTrumps, fecharModal: fecharTrumps } = useFichaGate('top_trumps')

  const handleJogoClick = (jogo) => {
    if (jogo.bloqueado || !jogo.rota) return
    if (jogo.id === 'jackcandy') entrarJack(() => navigate(jogo.rota))
    else if (jogo.id === 'ldi') entrarLdi(() => navigate(jogo.rota))
    else if (jogo.id === 'toptrumps') entrarTrumps(() => navigate(jogo.rota))
    else navigate(jogo.rota)
  }

  return (
    <div className="extras-page">
      <div className="extras-scanlines" />

      <div className="extras-header">
        <h1 className="extras-titulo">
          <span className="extras-titulo-glitch" data-text={t('site.games.titulo')}>{t('site.games.titulo')}</span>
        </h1>
        <p className="extras-subtitulo">
          <span className="extras-cursor">█</span> {t('site.games.subtitulo')}
        </p>
      </div>

      <section className="extras-secao">
        <div className="extras-secao-label">
          <span>▶ {t('site.games.secao_jogos')}</span>
          <div className="extras-secao-linha" />
        </div>
        <div className="extras-jogos-grid">
          {JOGOS.map(jogo => (
            <div key={jogo.id} className={`extras-jogo-card ${jogo.bloqueado ? 'extras-jogo-card--bloqueado' : ''}`}
              style={{ '--cor-neon': jogo.cor }}
              onClick={() => handleJogoClick(jogo)}>
              <div className="extras-jogo-card-inner">
                <div className="extras-jogo-badge" style={{ background: jogo.badgeCor + '22', border: `1px solid ${jogo.badgeCor}`, color: jogo.badgeCor }}>{jogo.badge}</div>
                <div className="extras-jogo-emoji">{jogo.emoji}</div>
                <h2 className="extras-jogo-nome">{jogo.nome}</h2>
                <p className="extras-jogo-tagline">{jogo.tagline}</p>
                {!jogo.bloqueado && <div className="extras-jogo-cta">{t('site.games.inserir_ficha')}</div>}
                {jogo.bloqueado && <div className="extras-jogo-cta extras-jogo-cta--bloqueado">{t('site.games.em_breve')}</div>}
              </div>
              <div className="extras-jogo-card-borda" />
            </div>
          ))}
        </div>
      </section>

      <section className="extras-secao">
        <div className="extras-secao-label">
          <span>▶ {t('site.games.secao_conteudo')}</span>
          <div className="extras-secao-linha" />
        </div>
        <div className="extras-conteudo-grid">
          {CONTEUDO.map(item => (
            <div key={item.id} className="extras-conteudo-card" style={{ '--cor-neon': item.cor }}
              onClick={() => item.rota && navigate(item.rota)}>
              <span className="extras-conteudo-emoji">{item.emoji}</span>
              <div><p className="extras-conteudo-nome">{item.nome}</p><p className="extras-conteudo-tagline">{item.tagline}</p></div>
              <span className="extras-conteudo-badge" style={{ color: item.cor, borderColor: item.cor + '44' }}>{item.badge}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="extras-footer-arcade">
        <span className="extras-footer-credits">© {new Date().getFullYear()} {t('site.games.credits')}</span>
      </div>

      <ModalSemFichas visivel={modalJack} onFechar={fecharJack} jogo="Jack Dream Beer" />
      <ModalSemFichas visivel={modalLdi} onFechar={fecharLdi} jogo="Lendas do LDI" />
      <ModalSemFichas visivel={modalTrumps} onFechar={fecharTrumps} jogo="Top Trumps LDI" />
    </div>
  )
}
