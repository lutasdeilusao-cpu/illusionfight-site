import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useFichaGate } from '../../hooks/useFichaGate'
import ModalSemFichas from '../../components/ModalSemFichas/ModalSemFichas'
import './Games.css'

const JOGOS = [
  { id: 'ldi', nomeKey: 'site.games.nomes.ldi', tagKey: 'site.games.taglines.ldi', emoji: '⚔️', cor: '#00B4D8', rota: '/games/ldi', badgeKey: 'site.games.badges.free', badgeCor: '#00B4D8' },
  { id: 'jackcandy', nomeKey: 'site.games.nomes.jack', tagKey: 'site.games.taglines.jack', emoji: '🍺', cor: '#F5A623', rota: '/games/jackcandy', badgeKey: 'site.games.badges.lancado', badgeCor: '#22C55E' },
  { id: 'pesadelo', nomeKey: 'site.games.nomes.pesadelo', tagKey: 'site.games.taglines.pesadelo', emoji: '🕵️', cor: '#EC4899', rota: '/games/pesadelo', badgeKey: 'site.games.badges.lancado', badgeCor: '#22C55E' },
  { id: 'arena', nomeKey: 'site.games.nomes.arena', tagKey: 'site.games.taglines.arena', emoji: '🏟️', cor: '#8B0000', rota: '/games/ldi-arena', badgeKey: 'site.games.badges.lancado', badgeCor: '#22C55E' },
  { id: 'tamagoshi', nomeKey: 'site.games.nomes.tama', tagKey: 'site.games.taglines.tama', emoji: '🥚', cor: '#00B4D8', rota: '/games/tamagoshi', badgeKey: 'site.games.badges.lancado', badgeCor: '#22C55E' },
  { id: 'toptrumps', nomeKey: 'site.games.nomes.trumps', tagKey: 'site.games.taglines.trumps', emoji: '🃏', cor: '#A855F4', rota: '/games/toptrumps', badgeKey: 'site.games.badges.lancado', badgeCor: '#22C55E' },
  { id: 'tatics', nomeKey: 'site.games.nomes.tatics', tagKey: 'site.games.taglines.tatics', emoji: '♟️', cor: '#FF4500', rota: '/games/ldi-tatics', badgeKey: 'site.games.badges.novo', badgeCor: '#FF4500' },
  { id: 'minigames', nomeKey: 'site.games.nomes.minigames', tagKey: 'site.games.taglines.minigames', emoji: '🎮', cor: '#22C55E', rota: '/games/minigames', badgeKey: 'site.games.badges.free', badgeCor: '#22C55E' },
  { id: 'duelo', nomeKey: 'site.games.nomes.duelo', tagKey: 'site.games.taglines.duelo', emoji: '⚔️', cor: '#F5A623', rota: '/games/duelo', badgeKey: 'site.games.badges.beta', badgeCor: '#00B4D8' },
]

const CONTEUDO = [
  { id: 'quiz', nomeKey: 'site.games.nomes.quiz', tagKey: 'site.games.taglines.quiz', emoji: '🎯', cor: '#22C55E', rota: '/quiz', badgeKey: 'site.games.badges.free' },
  { id: 'leaderboard', nomeKey: 'site.games.nomes.leaderboard', tagKey: 'site.games.taglines.leaderboard', emoji: '🏆', cor: '#F5A623', rota: '/leaderboard', badgeKey: 'site.games.badges.free' },
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
    <>
      <Helmet>
        <title>Games — Illusion Fight</title>
        <meta name="description" content="Play Illusion Fight games online — LDI Tactics, Jack Dream Beer, Pesadelo Particular, Tamagoshi, Top Trumps, Arena Mode, Duelo, and MiniGames. Free and premium games." />
        <meta property="og:title" content="Games — Illusion Fight" />
        <meta property="og:description" content="Play Illusion Fight games online — tactical RPG, detective, card games and more." />
        <meta property="og:url" content="https://illusionfight.com/games" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hreflang="pt" href="https://illusionfight.com/games" />
        <link rel="alternate" hreflang="en" href="https://illusionfight.com/games" />
        <link rel="alternate" hreflang="es" href="https://illusionfight.com/games" />
      </Helmet>
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
                <div className="extras-jogo-badge" style={{ background: jogo.badgeCor + '22', border: `1px solid ${jogo.badgeCor}`, color: jogo.badgeCor }}>{t(jogo.badgeKey)}</div>
                <div className="extras-jogo-emoji">{jogo.emoji}</div>
                <h2 className="extras-jogo-nome">{t(jogo.nomeKey)}</h2>
                <p className="extras-jogo-tagline">{t(jogo.tagKey)}</p>
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
              <div><p className="extras-conteudo-nome">{t(item.nomeKey)}</p><p className="extras-conteudo-tagline">{t(item.tagKey)}</p></div>
              <span className="extras-conteudo-badge" style={{ color: item.cor, borderColor: item.cor + '44' }}>{t(item.badgeKey)}</span>
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
    </>
  )
}
