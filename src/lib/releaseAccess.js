export const ACCESS_LEVELS = ['elite', 'conta', 'publico']

const ACTIVE_SUBSCRIPTIONS = new Set(['active', 'trialing'])

export function resolveAccessLevel(user, perfil) {
  if (!user) return 'publico'
  const rawStatus = typeof perfil?.subscription_status === 'string'
    ? perfil.subscription_status.toLowerCase()
    : ''
  if (!ACTIVE_SUBSCRIPTIONS.has(rawStatus)) return 'conta'
  return 'elite'
}

export function releaseDateFor(item, level) {
  return item?.liberacao?.[level] || item?.data_publicacao || null
}

export function validateRelease(item, label = item?.id || 'item') {
  if (!item?.liberacao) return true
  const dates = ACCESS_LEVELS.map(level => item.liberacao[level])
  if (dates.some(date => typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
    throw new Error(`[liberacao] Datas ausentes ou invalidas em ${label}`)
  }
  if (dates.some((date, index) => index && dates[index - 1] > date)) {
    throw new Error(`[liberacao] Cascata nao monotonica em ${label}: ${dates.join(' > ')}`)
  }
  return true
}

export function isReleased(item, level, today = new Date().toISOString().slice(0, 10)) {
  validateRelease(item)
  const date = releaseDateFor(item, level)
  return Boolean(date && date <= today)
}

export function nextBetterLevel(level) {
  if (level === 'publico') return 'conta'
  if (level === 'conta') return 'elite'
  return null
}


// Assinante = plano Ancestral (tier ELITE no perfil) com a assinatura ativa.
export function ehAssinante(perfil) {
  return resolveAccessLevel(Boolean(perfil), perfil) === 'elite'
}
