import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useScrollPosition } from '../hooks/useScrollPosition'
import { SITE_CONFIG } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import { LOCALE_LABELS } from '../i18n/locales'
import { TRIAL_ACTIVE } from '../config/trial'
import { useAuth } from '../context/AuthContext'
import SocialBar from './SocialBar'
import { trackEvent } from '../lib/analytics'
import './Navbar.css'

const LOCALES = ['pt', 'es', 'en']

export default function Navbar({ hidden, onSearchOpen }) {
  const scrolled = useScrollPosition(20)
  const [menuOpen, setMenuOpen] = useState(false)
  const { t, locale, changeLocale } = useLanguage()
  const { user, perfil, logout } = useAuth()
  const { pathname } = useLocation()

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); onSearchOpen?.() } }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onSearchOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = [
    ['assinar', '/assinar/'], ['calendario', '/calendario/'], ['webtoon', '/webtoon/'],
    ['historias', '/historias/'], ['games', '/games/'], ['musicas', '/musicas/'],
    ['mundo', '/universos/'], ['autor', '/autor/'],
  ]
  const isActive = path => path !== '/' && pathname.startsWith(path.slice(0, -1))

  if (hidden) return null

  const classList = [
    'navbar',
    scrolled ? 'navbar--scrolled' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <nav className={classList}>
        <div className="navbar__inner container">
          <Link to="/" className="navbar__logo">
            <img src="/icon-192.png" alt="Illusion Fight" className="navbar__logo-img" width="36" height="36" />
          </Link>

          <button
            className={`navbar__hamburger${menuOpen ? ' is-active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t('nav.aria.menu')}
          >
            <span /><span /><span />
          </button>

          <ul className="navbar__links">
            {navLinks.map(([key, path]) => (
              <li key={key}>
                <Link
                  to={path}
                  aria-current={isActive(path) ? 'page' : undefined}
                  className={`navbar__link navbar__link--${key}${key === 'assinar' ? ' navbar__link--highlight' : ''}${isActive(path) ? ' is-active' : ''}`}
                >
                  {key === 'calendario' && <span className="navbar__calendar-icon" aria-hidden="true" />}
                  {t(`nav.links.${key}`)}
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
                <div className="navbar-avatar">{perfil?.nome?.trim()?.[0]?.toUpperCase()}</div>
                {/* Só o primeiro nome na barra — o nome completo fica no perfil. */}
                <span className="navbar-nome">{perfil?.nome?.trim().split(/\s+/)[0]}</span>
              </Link>
              <button className="navbar-sair" onClick={logout} aria-label={t('site.perfil.sair')}>
                {t('site.perfil.sair')}
              </button>
            </div>
          ) : (
            <div className="navbar__auth-actions">
              <Link to="/login" className="navbar__login">{t('site.cadastro.entrar_link')}</Link>
              <Link to="/cadastro" className="navbar__cta" onClick={() => trackEvent('signup_cta_click', { placement: 'navbar' })}>{t('nav.cta')}</Link>
            </div>
          )}
        </div>
      </nav>
      <div className="navbar__mobile-spacer" aria-hidden="true" />

      <div className={`drawer-overlay${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`drawer${menuOpen ? ' is-open' : ''}`}>
        <button className="drawer__close" onClick={() => setMenuOpen(false)}>&times;</button>
        <button className="drawer__search" onClick={() => { setMenuOpen(false); onSearchOpen?.() }}>
          🔍 {t('nav.aria.search')}
        </button>
        <div className="drawer__lang" aria-label={t('nav.aria.language')}>
          {LOCALES.map(code => (
            <button
              key={code}
              className={`drawer__lang-card${locale === code ? ' is-active' : ''}`}
              onClick={() => { changeLocale(code); setMenuOpen(false) }}
              aria-pressed={locale === code}
            >
              <span>{code.toUpperCase()}</span>
              <strong>{t(`nav.languages.${code}`)}</strong>
            </button>
          ))}
        </div>
        <ul className="drawer__links">
          {navLinks.map(([key, path], index) => (
            <li key={key}>
              <Link
                to={path}
                aria-current={isActive(path) ? 'page' : undefined}
                className={`drawer__link drawer__link--${key}${key === 'assinar' ? ' drawer__link--highlight' : ''}${isActive(path) ? ' is-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="drawer__link-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                {key === 'calendario' && <span className="navbar__calendar-icon" aria-hidden="true" />}
                {t(`nav.links.${key}`)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="drawer__social">
          <SocialBar size="medium" />
        </div>
        {user ? (
          <>
            <Link to="/perfil" className="drawer__link" onClick={() => setMenuOpen(false)}>{t('site.perfil.meu_perfil')}</Link>
            <button className="drawer__cta" onClick={() => { logout(); setMenuOpen(false) }}>{t('site.perfil.sair')}</button>
          </>
        ) : (
          <div className="drawer__auth-actions">
            <Link to="/cadastro" className="drawer__cta" onClick={() => { trackEvent('signup_cta_click', { placement: 'drawer' }); setMenuOpen(false) }}>{t('nav.cta')}</Link>
            <Link to="/login" className="drawer__login" onClick={() => setMenuOpen(false)}>{t('site.cadastro.entrar_link')}</Link>
          </div>
        )}
      </aside>
    </>
  )
}
