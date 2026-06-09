import pt from './pt.json'
import es from './es.json'
import en from './en.json'
import pp_pt from './pp_pt.json'
import pp_en from './pp_en.json'
import pp_es from './pp_es.json'

export const locales = {
  pt: { ...pt, ...pp_pt },
  es: { ...es, ...pp_es },
  en: { ...en, ...pp_en },
}

export const LOCALE_LABELS = {
  pt: 'PT',
  es: 'ES',
  en: 'EN',
}
