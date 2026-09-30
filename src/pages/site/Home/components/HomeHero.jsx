import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { LAUNCH_DATE } from '../../../../config/launch'
import { trackEvent } from '../../../../lib/analytics'
import arteTrio from '../../../../assets/images/banners/banner-01.webp'
import logoPt from '../../../../assets/images/logos/logo-completa-pt.png'
import logoEn from '../../../../assets/images/logos/logo-completa-en.png'
import logoEs from '../../../../assets/images/logos/logo-completa-es.png'
import './HomeHero.css'

const LOGO = { pt: logoPt, en: logoEn, es: logoEs }
const DIA = 86400000

/** Abertura da Home: a arte do trio em tela quase cheia, a marca, a frase
 *  do universo, quanto falta pro lançamento e as duas portas principais
 *  (ler e jogar). Substitui o slideshow de 5 banners (v10.314.0). */
export default function HomeHero() {
  const { t, locale } = useLanguage()
  const faltam = Math.max(0, Math.ceil((new Date(`${LAUNCH_DATE}T00:00:00-03:00`) - Date.now()) / DIA))

  return (
    <section className="home-hero">
      <img className="home-hero__arte" src={arteTrio} alt="" width="960" height="1440" fetchpriority="high" decoding="async" />
      <div className="home-hero__veu" aria-hidden="true" />
      <div className="home-hero__conteudo">
        <img className="home-hero__logo" src={LOGO[locale] || LOGO.pt} alt={t('site.nome_curto')} width="600" height="200" />
        <p className="home-hero__frase">{t('home.nova.hero_frase')}</p>
        <p className="home-hero__sub">{t('home.nova.hero_sub')}</p>
        <div className="home-hero__acoes">
          <Link to="/webtoon" className="if-btn home-hero__btn is-primario" onClick={() => trackEvent('home_cta', { alvo: 'ler' })}>{t('home.nova.hero_ler')}</Link>
          <Link to="/games" className="if-btn home-hero__btn" onClick={() => trackEvent('home_cta', { alvo: 'jogar' })}>{t('home.nova.hero_jogar')}</Link>
        </div>
        {faltam > 0 && (
          <p className="home-hero__contagem">
            <b>{faltam}</b>
            <span>{t('home.nova.hero_faltam')}</span>
          </p>
        )}
      </div>
    </section>
  )
}
