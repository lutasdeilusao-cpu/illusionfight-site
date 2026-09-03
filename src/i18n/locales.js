import pt from './pt.json'
import es from './es.json'
import en from './en.json'
import home_pt from './home_pt.json'
import home_en from './home_en.json'
import home_es from './home_es.json'
import pp_pt from './pp_pt.json'
import pp_en from './pp_en.json'
import pp_es from './pp_es.json'
import tt_pt from './tt_pt.json'
import tt_en from './tt_en.json'
import tt_es from './tt_es.json'
// games.gangues.* não entra aqui — é carregado sob demanda por useGanguesI18n()
// só quando o jogador abre o LDI Gangues, pra não engordar o bundle geral.

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
  pt: deepMerge(pt, home_pt, pp_pt, tt_pt),
  es: deepMerge(es, home_es, pp_es, tt_es),
  en: deepMerge(en, home_en, pp_en, tt_en),
}

export const LOCALE_LABELS = {
  pt: 'PT',
  es: 'ES',
  en: 'EN',
}
