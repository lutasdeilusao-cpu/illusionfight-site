import { Fragment } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useFichaGate } from '../../hooks/useFichaGate'
import ModalSemFichas from '../../components/ModalSemFichas/ModalSemFichas'
import ModalConfirmacaoFicha from '../../components/ModalConfirmacaoFicha/ModalConfirmacaoFicha'
import './Games.css'

export const JOGOS = [
  { id: 'toptrumps', nomeKey: 'site.games.nomes.trumps', tagKey: 'site.games.taglines.trumps', emoji: '🃏', cor: '#A855F4', rota: '/games/toptrumps', badgeKey: 'site.games.badges.lancado' },
  { id: 'tamagoshi', nomeKey: 'site.games.nomes.tama', tagKey: 'site.games.taglines.tama', emoji: '🥚', cor: '#00B4D8', rota: '/games/tamagoshi', badgeKey: 'site.games.badges.lancado' },
  { id: 'minigames', nomeKey: 'site.games.nomes.minigames', tagKey: 'site.games.taglines.minigames', emoji: '🎮', cor: '#22C55E', rota: '/games/minigames', badgeKey: 'site.games.badges.lancado' },
  { id: 'arena', nomeKey: 'site.games.nomes.arena', tagKey: 'site.games.taglines.arena', emoji: '🏟️', cor: '#8B0000', rota: '/games/ldi-arena', badgeKey: 'site.games.badges.beta' },
  { id: 'ldi', nomeKey: 'site.games.nomes.ldi', tagKey: 'site.games.taglines.ldi', emoji: '⚔️', cor: '#00B4D8', rota: '/games/ldi', badgeKey: 'site.games.badges.beta' },
  { id: 'jackcandy', nomeKey: 'site.games.nomes.jack', tagKey: 'site.games.taglines.jack', emoji: '🍺', cor: '#F5A623', rota: '/games/jackcandy', badgeKey: 'site.games.badges.beta' },
  { id: 'pesadelo', nomeKey: 'site.games.nomes.pesadelo', tagKey: 'site.games.taglines.pesadelo', emoji: '🕵️', cor: '#EC4899', rota: '/games/pesadelo', badgeKey: 'site.games.badges.beta' },
  { id: 'tatics', nomeKey: 'site.games.nomes.tatics', tagKey: 'site.games.taglines.tatics', emoji: '♟️', cor: '#666', rota: '/games/ldi-tatics', badgeKey: 'site.games.badges.em_breve', emBreve: true },
  { id: 'duelo', nomeKey: 'site.games.nomes.duelo', tagKey: 'site.games.taglines.duelo', emoji: '⚔️', cor: '#666', rota: '/games/duelo', badgeKey: 'site.games.badges.em_breve', emBreve: true },
]

const BADGE_CORES = {
  lancado: '#22C55E',
  beta: '#F5A623',
  em_breve: '#666',
  free: '#22C55E',
}

const CONTEUDO = [
  { id: 'quiz', nomeKey: 'site.games.nomes.quiz', tagKey: 'site.games.taglines.quiz', emoji: '🎯', cor: '#22C55E', rota: '/quiz', badgeKey: 'site.games.badges.free' },
  { id: 'leaderboard', nomeKey: 'site.games.nomes.leaderboard', tagKey: 'site.games.taglines.leaderboard', emoji: '🏆', cor: '#F5A623', rota: '/leaderboard', badgeKey: 'site.games.badges.free' },
]

// Games that require ficha (not FREE badge)
const FICHA_GAMES = ['toptrumps', 'arena', 'ldi', 'tamagoshi', 'jackcandy', 'pesadelo', 'minigames', 'tatics', 'duelo']

const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']

export default function Games() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user, perfil } = useAuth()
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  // Create ficha gate for every gated game
  const gates = {}
  for (const id of FICHA_GAMES) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    gates[id] = useFichaGate(id)
  }

  const handleJogoClick = (jogo) => {
    const bloqueado = jogo.emBreve && !isAdmin
    if (bloqueado || !jogo.rota) return
    const gate = gates[jogo.id]
    if (gate) {
      gate.tentarEntrar(() => navigate(jogo.rota))
    } else {
      navigate(jogo.rota)
    }
  }

  return (
    <>
      <Helmet>
        <title>{t('site.games.meta_title')}</title>
        <meta name="description" content={t('site.games.meta_desc')} />
        <meta property="og:title" content={t('site.games.meta_title')} />
        <meta property="og:description" content={t('site.games.meta_desc')} />
        <meta property="og:url" content="https://illusionfight.com/games" />
        <meta property="og:image" content="https://illusionfight.com/og-image.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hrefLang="pt" href="https://illusionfight.com/games" />
        <link rel="alternate" hrefLang="en" href="https://illusionfight.com/games" />
        <link rel="alternate" hrefLang="es" href="https://illusionfight.com/games" />
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
          {JOGOS.map(jogo => {
            const bloqueado = jogo.emBreve && !isAdmin
            return (
            <div key={jogo.id} className={`extras-jogo-card ${bloqueado ? 'extras-jogo-card--bloqueado' : ''}`}
              style={{ '--cor-neon': jogo.cor, '--cor-badge': BADGE_CORES[jogo.badgeKey.split('.').pop()] || '#666' }}
              onClick={() => handleJogoClick(jogo)}>
              <div className="extras-jogo-card-inner">
                <div className={`extras-jogo-badge ${jogo.emBreve ? 'extras-jogo-badge--embreve' : ''}`}>{t(jogo.badgeKey)}</div>
                <div className="extras-jogo-emoji">{jogo.emoji}</div>
                <h2 className="extras-jogo-nome">{t(jogo.nomeKey)}</h2>
                <p className="extras-jogo-tagline">{t(jogo.tagKey)}</p>
                {!bloqueado && <div className="extras-jogo-cta">{t(user ? 'site.games.inserir_ficha' : 'site.games.jogar')}</div>}
                {jogo.emBreve && <div className="extras-jogo-cta extras-jogo-cta--bloqueado">{t('site.games.em_breve')}</div>}
              </div>
              <div className="extras-jogo-card-borda" />
            </div>
            )
          })}
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
              <span className="extras-conteudo-badge">{t(item.badgeKey)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="extras-footer-arcade">
        <span className="extras-footer-credits">© {new Date().getFullYear()} {t('site.games.credits')}</span>
      </div>

      {/* Modals for each gated game */}
      {FICHA_GAMES.map(id => {
        const gate = gates[id]
        if (!gate) return null
        const jogo = JOGOS.find(j => j.id === id)
        const nomeTraduzido = jogo ? t(jogo.nomeKey) : id
        return (
          <Fragment key={id}>
            <ModalConfirmacaoFicha
              visivel={gate.confirmacaoVisivel}
              onConfirmar={gate.confirmarGasto}
              onCancelar={gate.cancelarGasto}
              jogo={nomeTraduzido}
              saldo={gate.saldo}
            />
            <ModalSemFichas
              visivel={gate.modalVisivel}
              onFechar={gate.fecharModal}
              jogo={nomeTraduzido}
            />
          </Fragment>
        )
      })}
    </div>
    </>
  )
}
