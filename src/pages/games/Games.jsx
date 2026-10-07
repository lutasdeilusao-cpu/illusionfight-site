import { Fragment } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useFichaGate } from '../../hooks/useFichaGate'
import { trackEvent } from '../../lib/analytics'
import { getTopTrumpsCardImage } from '../../lib/topTrumpsCardImages'
import { ADMIN_EMAILS } from '../../config/launch'
import ModalSemFichas from '../../components/ModalSemFichas/ModalSemFichas'
import ModalConfirmacaoFicha from '../../components/ModalConfirmacaoFicha/ModalConfirmacaoFicha'
import { VEIAS } from './LDI/data/veias'
import { PONTOS, CENTRO } from './LDI/batalha/motorPentagrama'
import parede from './Gangues/assets/backgrounds/parede-oficial.jpg'
import logoGanguesPt from './Gangues/assets/logos/logo-pt.png'
import logoGanguesEn from './Gangues/assets/logos/logo-en.png'
import logoGanguesEs from './Gangues/assets/logos/logo-es.png'
import trinca from './Gangues/assets/personagens/trinca/corpo-frente.webp'
import navalha from './Gangues/assets/personagens/navalha/corpo-frente.webp'
import marreta from './Gangues/assets/personagens/marreta/corpo-frente.webp'
import './Games.css'

// Área de jogos da Temporada 1: os três jogos do lançamento em destaque, com
// arte própria. Os outros jogos ficam fora do catálogo até a vez deles (ver o
// calendário) e só aparecem aqui pra admin, numa lista à parte.
const LOGO_GANGUES = { pt: logoGanguesPt, en: logoGanguesEn, es: logoGanguesEs }
const LUTADORES = [navalha, trinca, marreta]
const CARTAS = [4, 9, 14]
const ESTRELA = ['cab', 'peD', 'maoE', 'maoD', 'peE', 'cab']
const linhaEstrela = ESTRELA.map(id => `${PONTOS[id].x},${PONTOS[id].y}`).join(' ')

// Os três da T1 pedem ficha (useFichaGate) antes de abrir.
const VITRINE = ['gangues', 'ldi', 'toptrumps']
const ROTA = { gangues: '/games/ldi-gangues', ldi: '/games/ldi', toptrumps: '/games/toptrumps' }
const NOME = { gangues: 'site.games.nomes.gangues', ldi: 'site.games.nomes.ldi', toptrumps: 'site.games.nomes.trumps' }

// Fora do catálogo: só admin vê e abre (as rotas também barram quem não é).
const FORA = [
  { id: 'jackcandy', nomeKey: 'site.games.nomes.jack', rota: '/games/jackcandy' },
  { id: 'tatics', nomeKey: 'site.games.nomes.tatics', rota: '/games/ldi-tatics' },
  { id: 'tamagoshi', nomeKey: 'site.games.nomes.tama', rota: '/games/tamagoshi' },
  { id: 'duelo', nomeKey: 'site.games.nomes.duelo', rota: '/games/duelo' },
  { id: 'pesadelo', nomeKey: 'site.games.nomes.pesadelo', rota: '/games/pesadelo' },
  { id: 'minigames', nomeKey: 'site.games.nomes.minigames', rota: '/games/minigames' },
  { id: 'kernelpanic', nomeKey: 'site.games.nomes.kernel_panic', rota: '/games/kernel-panic' },
  { id: 'sliding_rafael', nomeKey: 'site.games.nomes.sliding_rafael', rota: '/games/sliding-rafael' },
  { id: 'codigo_perdido', nomeKey: 'site.games.nomes.codigo_perdido', rota: '/games/codigo-perdido' },
  { id: 'maze_rafael', nomeKey: 'site.games.nomes.maze_rafael', rota: '/games/maze-rafael' },
  { id: 'glitch_rafael', nomeKey: 'site.games.nomes.glitch_rafael', rota: '/games/glitch-rafael' },
  { id: 'bullet_hell_rafael', nomeKey: 'site.games.nomes.bullet_hell_rafael', rota: '/games/bullet-hell-rafael' },
  { id: 'stabilizer_rafael', nomeKey: 'site.games.nomes.stabilizer_rafael', rota: '/games/stabilizer-rafael' },
]

const PROXIMOS = ['tama', 'jack', 'tatics']

export default function Games() {
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  const { user, perfil } = useAuth()
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  const gates = {}
  for (const id of VITRINE) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    gates[id] = useFichaGate(id)
  }

  const jogar = (id) => (e) => {
    e.preventDefault()
    trackEvent('game_card_click', { game_id: id, game_name: t(NOME[id]), category: 'ldi' })
    gates[id].tentarEntrar(() => navigate(ROTA[id]))
  }

  return (
    <>
      <Helmet>
        <title>{t('site.games.meta_title')}</title>
        <meta name="description" content={t('site.games.meta_desc')} />
        <meta property="og:title" content={t('site.games.meta_title')} />
        <meta property="og:description" content={t('site.games.meta_desc')} />
        <meta property="og:url" content="https://illusionfight.com/games" />
        <meta property="og:image" content="https://illusionfight.com/og-image-webshard.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="extras-page games-vitrine">
        <header className="games-hero">
          <p className="if-eyebrow">{t('site.games.vitrine_eyebrow')}</p>
          <h1 className="games-hero__titulo">{t('site.games.titulo')}</h1>
          <p className="games-hero__sub">{t('site.games.subtitulo')}</p>
          <p className="extras-seo-intro">{t('site.games.seo_intro')}</p>
        </header>

        <a href={ROTA.gangues} className="games-card games-card--gangues" onClick={jogar('gangues')}>
          <img className="games-card__fundo" src={parede} alt="" loading="lazy" decoding="async" />
          <div className="games-card__lutadores" aria-hidden="true">
            {LUTADORES.map((src, i) => <img key={i} src={src} alt="" loading="lazy" decoding="async" />)}
          </div>
          <div className="games-card__info">
            <img className="games-card__logo" src={LOGO_GANGUES[locale] || LOGO_GANGUES.pt} alt={t(NOME.gangues)} loading="lazy" width="1100" height="367" />
            <p>{t('site.games.vitrine.gangues')}</p>
            <ul className="games-card__tags">{['tag1', 'tag2', 'tag3'].map(k => <li key={k}>{t(`site.games.vitrine.gangues_${k}`)}</li>)}</ul>
            <span className="if-btn if-btn--primary games-card__cta">{t('site.games.jogar')}</span>
          </div>
        </a>

        <a href={ROTA.ldi} className="games-card games-card--lendas" onClick={jogar('ldi')}>
          <svg className="games-card__pentagrama" viewBox="0 -10 300 290" aria-hidden="true">
            <polyline points={linhaEstrela} />
            {Object.values(PONTOS).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.grande ? 13 : 8} style={{ '--i': i }} />)}
            <circle className="games-card__centro" cx={CENTRO.x} cy={CENTRO.y} r={10} />
          </svg>
          <div className="games-card__info">
            <span className="games-card__nome">{t(NOME.ldi)}</span>
            <p>{t('site.games.vitrine.lendas')}</p>
            <ul className="games-card__veias">
              {VEIAS.map(v => <li key={v.id} style={{ '--veia-cor': v.cor }}><b aria-hidden="true">{v.icone}</b>{t(`site.games.vitrine.veias.${v.id}`)}</li>)}
            </ul>
            <span className="if-btn if-btn--primary games-card__cta">{t('site.games.jogar')}</span>
          </div>
        </a>

        <a href={ROTA.toptrumps} className="games-card games-card--trunfo" onClick={jogar('toptrumps')}>
          <div className="games-card__leque" aria-hidden="true">
            {CARTAS.map(id => <img key={id} src={getTopTrumpsCardImage(id)} alt="" loading="lazy" decoding="async" />)}
          </div>
          <div className="games-card__info">
            <span className="games-card__nome">{t(NOME.toptrumps)}</span>
            <p>{t('site.games.vitrine.trunfo')}</p>
            <ul className="games-card__tags">{['tag1', 'tag2'].map(k => <li key={k}>{t(`site.games.vitrine.trunfo_${k}`)}</li>)}</ul>
            <span className="if-btn if-btn--primary games-card__cta">{t('site.games.jogar')}</span>
          </div>
        </a>

        <section className="games-proximos">
          <p className="if-eyebrow">{t('site.games.vitrine.proximos_eyebrow')}</p>
          <h2>{t('site.games.vitrine.proximos_titulo')}</h2>
          <ul>{PROXIMOS.map(id => <li key={id}>{t(`calendar.game_${id}`)}</li>)}</ul>
          <Link to="/calendario" className="games-proximos__link">{t('site.games.vitrine.ver_calendario')} →</Link>
        </section>
        {isAdmin && (
          <section className="games-admin">
            <p className="if-eyebrow">{t('site.games.vitrine.admin_eyebrow')}</p>
            <p className="games-admin__texto">{t('site.games.vitrine.admin_texto')}</p>
            <div className="games-admin__lista">
              {FORA.map(j => <Link key={j.id} to={j.rota}>{t(j.nomeKey)}</Link>)}
            </div>
          </section>
        )}

        {VITRINE.map(id => {
          const gate = gates[id]
          return (
            <Fragment key={id}>
              <ModalConfirmacaoFicha visivel={gate.confirmacaoVisivel} onConfirmar={gate.confirmarGasto} onCancelar={gate.cancelarGasto} jogo={t(NOME[id])} saldo={gate.saldo} />
              <ModalSemFichas visivel={gate.modalVisivel} onFechar={gate.fecharModal} jogo={t(NOME[id])} />
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
