import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useScrollPosition } from '../hooks/useScrollPosition'
import { SITE_CONFIG } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import { LOCALE_LABELS } from '../i18n/locales'
import { TRIAL_ACTIVE } from '../config/trial'
import { useAuth } from '../context/AuthContext'
import SocialBar from './SocialBar'
import './Navbar.css'

const LOCALES = ['pt', 'es', 'en']

export default function Navbar({ hidden, onSearchOpen }) {
  const scrolled = useScrollPosition(20)
  const [menuOpen, setMenuOpen] = useState(false)
  const { t, locale, changeLocale } = useLanguage()
  const { user, perfil, logout } = useAuth()

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); onSearchOpen?.() } }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onSearchOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = ['webtoon', 'livro', 'musicas', 'games', 'mundo', 'autor', 'assinar']

  if (hidden) return null

  const classList = [
    'navbar',
    scrolled ? 'navbar--scrolled' : '',
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

          <button className="navbar__search-btn" onClick={() => onSearchOpen?.()} aria-label={t('nav.aria.search') || 'Buscar (Ctrl+K)'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

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

          {user ? (
            <div className="navbar-usuario">
              <Link to="/perfil" className="navbar-usuario-link">
                <div className="navbar-avatar">{perfil?.nome?.[0]?.toUpperCase()}</div>
                <span className="navbar-nome">{perfil?.nome}</span>
              </Link>
              <button className="navbar-sair" onClick={logout}>{t('site.perfil.sair')}</button>
            </div>
          ) : (
            <Link to="/login" className="navbar__cta">{t('nav.cta')}</Link>
          )}
        </div>
      </nav>

      <div className={`drawer-overlay${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`drawer${menuOpen ? ' is-open' : ''}`}>
        <button className="drawer__close" onClick={() => setMenuOpen(false)}>&times;</button>
        <button className="drawer__search" onClick={() => { setMenuOpen(false); onSearchOpen?.() }}>
          🔍 {t('nav.aria.search')}
        </button>
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
        {user ? (
          <>
            <Link to="/perfil" className="drawer__link" onClick={() => setMenuOpen(false)}>{t('site.perfil.meu_perfil')}</Link>
            <button className="drawer__cta" onClick={() => { logout(); setMenuOpen(false) }}>{t('site.perfil.sair')}</button>
          </>
        ) : (
          <Link to="/login" className="drawer__cta" onClick={() => setMenuOpen(false)}>{t('nav.cta')}</Link>
        )}
      </aside>
    </>
  )
}
