import pt from './pt.json'
import es from './es.json'
import en from './en.json'
import pp_pt from './pp_pt.json'
import pp_en from './pp_en.json'
import pp_es from './pp_es.json'
import trash_en from './arena-trash-en.json'
import trash_es from './arena-trash-es.json'

function deepMerge(target, ...sources) {
  const result = { ...target }
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
  }
  return result
}

export const locales = {
  pt: { ...pt, ...pp_pt },
  es: deepMerge({ ...es, ...pp_es }, trash_es),
  en: deepMerge({ ...en, ...pp_en }, trash_en),
}

export const LOCALE_LABELS = {
  pt: 'PT',
  es: 'ES',
  en: 'EN',
}
