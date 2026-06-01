import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useScrollPosition } from '../hooks/useScrollPosition'
import { SITE_CONFIG } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import { LOCALE_LABELS } from '../i18n/locales'
import SocialBar from './SocialBar'
import './Navbar.css'

const LOCALES = ['pt', 'es', 'en']

export default function Navbar() {
  const scrolled = useScrollPosition(20)
  const [menuOpen, setMenuOpen] = useState(false)
  const { t, locale, changeLocale } = useLanguage()

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = ['webtoon', 'livro', 'musicas', 'mundo', 'curiosidades', 'personagens', 'assinar']

  const classList = [
    'navbar',
    scrolled ? 'navbar--scrolled' : '',
    SITE_CONFIG.TRIAL_MODE ? 'navbar--has-trial' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <nav className={classList}>
        <div className="navbar__inner container">
          <Link to="/" className="navbar__logo">LDI</Link>

          <button
            className={`navbar__hamburger${menuOpen ? ' is-active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t('nav.aria.menu')}
          >
            <span /><span /><span />
          </button>

          <ul className="navbar__links">
            {navLinks.map((key, i) => (
              <li key={key}>
                <Link
                  to={`/${key}`}
                  className={`navbar__link${key === 'assinar' ? ' navbar__link--highlight' : ''}`}
                >
                  {t(`nav.links.${i}`)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar__lang">
            {LOCALES.map(code => (
              <button
                key={code}
                className={`navbar__lang-btn${locale === code ? ' is-active' : ''}`}
                onClick={() => changeLocale(code)}
              >
                {LOCALE_LABELS[code]}
              </button>
            ))}
          </div>

          <div className="navbar__social">
            <SocialBar size="small" />
          </div>

          <button className="navbar__cta">{t('nav.cta')}</button>
        </div>
      </nav>

      <div className={`drawer-overlay${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`drawer${menuOpen ? ' is-open' : ''}`}>
        <button className="drawer__close" onClick={() => setMenuOpen(false)}>&times;</button>
        <ul className="drawer__links">
          {navLinks.map((key, i) => (
            <li key={key}>
              <Link
                to={`/${key}`}
                className={`drawer__link${key === 'assinar' ? ' drawer__link--highlight' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {t(`nav.links.${i}`)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="drawer__lang">
          {LOCALES.map(code => (
            <button
              key={code}
              className={`navbar__lang-btn${locale === code ? ' is-active' : ''}`}
              onClick={() => { changeLocale(code); setMenuOpen(false) }}
            >
              {LOCALE_LABELS[code]}
            </button>
          ))}
        </div>
        <div className="drawer__social">
          <SocialBar size="medium" />
        </div>
        <button className="drawer__cta" onClick={() => setMenuOpen(false)}>{t('nav.cta')}</button>
      </aside>
    </>
  )
}
