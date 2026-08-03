export const TOP_TRUMPS_CARD_LIMITS = Object.freeze({
  guest: 15,
  free: 15,
  elite: 20,
  primordial: 25,
  evento: 30,
})

const CARD_IDS_BY_TIER = Object.freeze({
  elite: new Set([3, 8, 13, 15, 21]),
  primordial: new Set([4, 5, 9, 10, 14]),
  evento: new Set([18, 20, 22, 29, 30]),
})

const ACCESS_RANK = Object.freeze({ guest: 0, free: 0, elite: 1, primordial: 2, evento: 3 })
const CARD_RANK = Object.freeze({ free: 0, elite: 1, primordial: 2, evento: 3 })

export function getTopTrumpsTierForCard(cardId) {
  const id = Number(cardId)
  if (!Number.isInteger(id) || id < 1 || id > 30) return null
  if (CARD_IDS_BY_TIER.elite.has(id)) return 'elite'
  if (CARD_IDS_BY_TIER.primordial.has(id)) return 'primordial'
  if (CARD_IDS_BY_TIER.evento.has(id)) return 'evento'
  return 'free'
}

export function getTopTrumpsAccessTier(user, perfil) {
  if (!user) return 'guest'
  if (perfil?.tier === 'evento') return 'evento'
  if (perfil?.tier === 'primordial') return 'primordial'
  if (perfil?.tier === 'elite') return 'elite'
  return 'free'
}

export function canAcquireTopTrumpsCard(cardId, user, perfil) {
  const cardTier = getTopTrumpsTierForCard(cardId)
  const accessTier = getTopTrumpsAccessTier(user, perfil)
  return cardTier != null && CARD_RANK[cardTier] <= ACCESS_RANK[accessTier]
}

export function filterTopTrumpsCardPool(cards, user, perfil) {
  return cards.filter(card => canAcquireTopTrumpsCard(card.id, user, perfil))
}

export function filterTopTrumpsInitialAccountPool(cards) {
  return cards.filter(card => getTopTrumpsTierForCard(card.id) === 'free')
}
