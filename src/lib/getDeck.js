import deckPT from '../data/supertrunfo-pt.json'
import deckEN from '../data/supertrunfo-en.json'
import deckES from '../data/supertrunfo-es.json'

const DECKS = { pt: deckPT, en: deckEN, es: deckES }

export function getDeck(locale) {
  return DECKS[locale] || deckPT
}
