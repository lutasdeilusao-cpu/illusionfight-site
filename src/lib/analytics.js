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

export function setAnalyticsUser(user, perfil) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
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
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', name, cleanParams(params))
}

export function trackPageView(path) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_location: `${window.location.origin}${path}`,
    page_path: path,
    page_title: document.title,
  })
}
