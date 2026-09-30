import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { useScrollReveal } from '../../../../hooks/useScrollReveal'
import { trackEvent } from '../../../../lib/analytics'
import { getTopTrumpsCardImage } from '../../../../lib/topTrumpsCardImages'
import HomeSectionHeading from './HomeSectionHeading'
import parede from '../../../games/Gangues/assets/backgrounds/parede-oficial.jpg'
import logoGanguesPt from '../../../games/Gangues/assets/logos/logo-pt.png'
import logoGanguesEn from '../../../games/Gangues/assets/logos/logo-en.png'
import logoGanguesEs from '../../../games/Gangues/assets/logos/logo-es.png'
import trinca from '../../../games/Gangues/assets/personagens/trinca/corpo-frente.webp'
import navalha from '../../../games/Gangues/assets/personagens/navalha/corpo-frente.webp'
import marreta from '../../../games/Gangues/assets/personagens/marreta/corpo-frente.webp'
import './HomeGames.css'

const LOGO_GANGUES = { pt: logoGanguesPt, en: logoGanguesEn, es: logoGanguesEs }
const LUTADORES = [navalha, trinca, marreta]
// Cartas de palco (o "Show" de Kim, Jack e Nina no catálogo do Super Trunfo).
const CARTAS = [4, 9, 14]

/** Os dois jogos-vitrine com arte própria: LDI Gangues (os lutadores de
 *  corpo inteiro na parede oficial) e LDI Super Trunfo (as cartas em leque). */
export default function HomeGames() {
  const { t, locale } = useLanguage()
  const ref = useScrollReveal()

  return (
    <section ref={ref} className="home-games reveal">
      <div className="container">
        <HomeSectionHeading eyebrow={t('home.nova.games_eyebrow')} title={t('home.nova.games_titulo')} />

        <Link to="/games/ldi-gangues" className="home-games__gangues" onClick={() => trackEvent('home_game', { game_id: 'gangues' })}>
          <img className="home-games__parede" src={parede} alt="" loading="lazy" decoding="async" />
          <div className="home-games__lutadores" aria-hidden="true">
            {LUTADORES.map((src, i) => <img key={i} src={src} alt="" loading="lazy" decoding="async" />)}
          </div>
          <div className="home-games__gangues-info">
            <img className="home-games__logo" src={LOGO_GANGUES[locale] || LOGO_GANGUES.pt} alt="LDI Gangues" loading="lazy" width="1100" height="367" />
            <p>{t('home.nova.gangues_texto')}</p>
            <ul className="home-games__tags">
              <li>{t('home.nova.gangues_tag1')}</li>
              <li>{t('home.nova.gangues_tag2')}</li>
              <li>{t('home.nova.gangues_tag3')}</li>
            </ul>
            <span className="if-btn home-games__cta">{t('home.nova.jogar_agora')}</span>
          </div>
        </Link>

        <Link to="/games/toptrumps" className="home-games__trunfo" onClick={() => trackEvent('home_game', { game_id: 'toptrumps' })}>
          <div className="home-games__leque" aria-hidden="true">
            {CARTAS.map(id => <img key={id} src={getTopTrumpsCardImage(id)} alt="" loading="lazy" decoding="async" />)}
          </div>
          <div className="home-games__trunfo-info">
            <span className="home-games__nome">{t('site.games.nomes.trumps')}</span>
            <p>{t('home.nova.trunfo_texto')}</p>
            <span className="if-btn home-games__cta">{t('home.nova.jogar_agora')}</span>
          </div>
        </Link>

        <Link to="/games" className="home-games__todos">{t('home.nova.games_todos')} →</Link>
      </div>
    </section>
  )
}
