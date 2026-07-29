export const TOP_TRUMPS_CARD_LIMITS = Object.freeze({
  guest: 15,
  free: 20,
  elite: 23,
  primordial: 26,
  evento: 30,
})

export function getTopTrumpsTierForCard(cardId) {
  const id = Number(cardId)
  if (!Number.isInteger(id) || id < 1 || id > 30) return null
  if (id >= 1 && id <= 20) return 'free'
  if (id <= 23) return 'elite'
  if (id <= 26) return 'primordial'
  if (id <= 30) return 'evento'
  return null
}

export function getTopTrumpsAccessTier(user, perfil) {
  if (!user) return 'guest'
  if (perfil?.tier === 'primordial') return 'primordial'
  if (perfil?.tier === 'elite') return 'elite'
  return 'free'
}

export function canAcquireTopTrumpsCard(cardId, user, perfil) {
  const id = Number(cardId)
  const accessTier = getTopTrumpsAccessTier(user, perfil)
  return Number.isInteger(id) && id >= 1 && id <= TOP_TRUMPS_CARD_LIMITS[accessTier]
}

export function filterTopTrumpsCardPool(cards, user, perfil) {
  return cards.filter(card => canAcquireTopTrumpsCard(card.id, user, perfil))
}

export function filterTopTrumpsInitialAccountPool(cards) {
  return cards.filter(card => {
    const id = Number(card.id)
    return Number.isInteger(id) && id >= 1 && id <= TOP_TRUMPS_CARD_LIMITS.free
  })
}
