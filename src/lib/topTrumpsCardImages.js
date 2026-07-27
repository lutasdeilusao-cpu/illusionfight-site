import cardFallback from '../assets/images/cards/characters/card-fallback.png'

const cardModules = import.meta.glob(
  '../assets/images/cards/characters/card-[0-9][0-9].png',
  { eager: true, import: 'default' },
)

export const TOP_TRUMPS_CARD_IMAGES = Object.fromEntries(
  Object.entries(cardModules).map(([path, image]) => {
    const id = Number(path.match(/card-(\d+)\.png$/)?.[1])
    return [id, image]
  }),
)

export function getTopTrumpsCardImage(cardOrId) {
  const id = typeof cardOrId === 'object' ? cardOrId?.id : cardOrId
  return TOP_TRUMPS_CARD_IMAGES[Number(id)] || cardFallback
}
