import { painelEvento, painelPagina } from './painelColeta'

const MAX_PARAM_LENGTH = 100

function cleanValue(value) {
  if (typeof value === 'string') return value.slice(0, MAX_PARAM_LENGTH)
  if (typeof value === 'number' || typeof value === 'boolean') return value
  return undefined
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [key, cleanValue(value)])
      .filter(([, value]) => value !== undefined)
  )
}

export function hasAnalyticsConsent() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem('ldi-cookies-accepted') === 'true'
}

export function updateAnalyticsConsent(granted) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
  })
}

const GA_ID = 'G-QVDGMZ1F58'
const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']
const CHAVE_SEM_ANALYTICS = 'ldi-analytics-off'

/* Admin/equipe não entra no Analytics: o relatório de set/2026 tinha o
   próprio Isaias inflando tudo (Gangues 8.371 eventos de 7 pessoas). A marca
   fica no navegador, então vale mesmo quando ele entra deslogado depois. */
function desligarAnalytics() {
  window[`ga-disable-${GA_ID}`] = true
  try { window.localStorage.setItem(CHAVE_SEM_ANALYTICS, '1') } catch { /* sem storage */ }
}

export function setAnalyticsUser(user, perfil) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  if (perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')) { desligarAnalytics(); return }
  window.gtag('set', 'user_properties', {
    account_type: user ? 'authenticated' : 'guest',
    subscription_tier: String(perfil?.tier || 'guest').toLowerCase(),
    locale: window.localStorage.getItem('ldi-locale') || 'pt',
  })
  window.gtag('config', 'G-QVDGMZ1F58', {
    send_page_view: false,
    user_id: user?.id || undefined,
  })
}

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return
  painelEvento(name, cleanParams(params)) // painel próprio (independe do GA carregar)
  if (typeof window.gtag !== 'function') return
  window.gtag('event', name, cleanParams(params))
}

// Chave de i18n que vazou pro título ("pages.helmet.mundo") nunca vai pro relatório.
function tituloLimpo() {
  const titulo = document.title || ''
  return /^[\w-]+(\.[\w-]+)+$/.test(titulo) ? 'Illusion Fight' : titulo
}

export function trackPageView(path) {
  if (typeof window === 'undefined') return
  painelPagina()
  if (typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_location: `${window.location.origin}${path}`,
    page_path: path,
    page_title: tituloLimpo(),
  })
}
