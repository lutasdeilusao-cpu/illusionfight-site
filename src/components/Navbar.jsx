import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useScrollPosition } from '../hooks/useScrollPosition'
import { SITE_CONFIG } from '../config/site'
import { useLanguage } from '../context/LanguageContext'
import { LOCALE_LABELS } from '../i18n/locales'
import { TRIAL_ACTIVE } from '../config/trial'
import { useAuth } from '../context/AuthContext'
import SocialBar from './SocialBar'
import ShareButton from './ShareButton/ShareButton'
import { trackEvent } from '../lib/analytics'
import { supabase } from '../lib/supabase'
import { creatorAtivo } from '../lib/creator'
import { ADMIN_EMAILS } from '../config/launch'
import logoMarkEn from '../assets/images/logos/logo-mark-en.png'
import logoMarkPtEs from '../assets/images/logos/logo-mark-pt-es.png'
import { ehAssinante } from '../lib/releaseAccess'
import './Navbar.css'
import './NavbarPerfil.css'

const LOCALES = ['pt', 'es', 'en']
// Marca curta do navbar — "LF" em inglês (Illusion Fight), "LDI" em
// pt/es (Lutas de Ilusão/Luchas de Ilusión). Antes era o ícone genérico
// (icon-192.png) igual pros 3 idiomas.
const LOGO_MARK = { en: logoMarkEn, pt: logoMarkPtEs, es: logoMarkPtEs }

function planoDe(perfil) { return ehAssinante(perfil) ? 'elite' : 'free' }
function primeiroNome(perfil) { return perfil?.nome?.trim().split(/\s+/)[0] || '' }
function inicialDe(perfil) { return perfil?.nome?.trim()?.[0]?.toUpperCase() || '?' }

export default function Navbar({ hidden, onSearchOpen }) {
  const scrolled = useScrollPosition(20)
  const [menuOpen, setMenuOpen] = useState(false)
  const { t, locale, changeLocale } = useLanguage()
  const { user, perfil, logout } = useAuth()
  const { pathname } = useLocation()
  // Botão Creators: creator e admin veem sempre; o público só quando já há
  // conteúdo aprovado na vitrine.
  const [temDestaques, setTemDestaques] = useState(() => {
    try { return sessionStorage.getItem('ldi-tem-destaques') === '1' } catch { return false }
  })
  const veCreators = temDestaques || creatorAtivo(perfil) || perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  useEffect(() => {
    supabase.rpc('creator_destaques').then(({ data }) => {
      const tem = Array.isArray(data) && data.length > 0
      setTemDestaques(tem)
      try { sessionStorage.setItem('ldi-tem-destaques', tem ? '1' : '0') } catch { /* sem storage */ }
    })
  }, [])

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
    ['mundo', '/universos/'], ['autor', '/autor/'], ['agradecimentos', '/webtoon/agradecimentos/01'],
    ...(veCreators ? [['creators', '/creators/destaques/']] : []),
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
            <img src={LOGO_MARK[locale] || LOGO_MARK.pt} alt="Illusion Fight" className="navbar__logo-img" />
          </Link>

          <button
            className={`navbar__hamburger${menuOpen ? ' is-active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t('nav.aria.menu')}
          >
            <span /><span /><span />
          </button>

          <ShareButton />

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
            <Link to="/perfil" className={`navbar-perfil navbar-perfil--${planoDe(perfil)}`} aria-label={t('site.perfil.meu_perfil')}>
              <span className="navbar-perfil__avatar">{inicialDe(perfil)}</span>
              <span className="navbar-perfil__texto">
                <span className="navbar-perfil__nome">{primeiroNome(perfil)}</span>
                <span className="navbar-perfil__plano">{t(`nav.perfil.plano.${planoDe(perfil)}`)}</span>
              </span>
            </Link>
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
        {user && (
          <Link to="/perfil" className={`drawer-perfil navbar-perfil--${planoDe(perfil)}`} onClick={() => setMenuOpen(false)}>
            <span className="navbar-perfil__avatar drawer-perfil__avatar">{inicialDe(perfil)}</span>
            <span className="navbar-perfil__texto">
              <span className="navbar-perfil__nome drawer-perfil__nome">{perfil?.nome?.trim() || primeiroNome(perfil)}</span>
              <span className="navbar-perfil__plano">{t(`nav.perfil.plano.${planoDe(perfil)}`)}</span>
            </span>
            <span className="drawer-perfil__ir">{t('site.perfil.meu_perfil')} →</span>
          </Link>
        )}
        <ShareButton variante="item" onFeito={() => setMenuOpen(false)} />
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
