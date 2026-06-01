import { useLanguage } from '../context/LanguageContext'
import pt from '../data/personagens-pt.json'
import en from '../data/personagens-en.json'
import es from '../data/personagens-es.json'

const DATA = { pt, en, es }

export function usePersonagens() {
  const { locale } = useLanguage()
  const list = DATA[locale] || DATA.pt
  return list
}

export function usePersonagem(id) {
  const list = usePersonagens()
  return list.find(p => p.id === id) || null
}

export const GROUP_ORDER = ['protagonista', 'protagonist', 'rival', 'apoio', 'supporting', 'antagonista', 'antagonist']
export const GROUP_LABELS = {
  pt: { protagonista: 'PROTAGONISTAS', rival: 'RIVAIS', apoio: 'APOIO', antagonista: 'ANTAGONISTAS' },
  en: { protagonist: 'PROTAGONISTS', rival: 'RIVALS', supporting: 'SUPPORTING', antagonist: 'ANTAGONISTS' },
  es: { protagonista: 'PROTAGONISTAS', rival: 'RIVALES', apoyo: 'APOYO', antagonista: 'ANTAGONISTAS' },
}

export function usePersonagensAgrupados() {
  const { locale } = useLanguage()
  const list = DATA[locale] || DATA.pt
  const labels = GROUP_LABELS[locale] || GROUP_LABELS.pt

  const groups = {}
  for (const p of list) {
    const g = p.grupo
    if (!groups[g]) groups[g] = []
    groups[g].push(p)
  }

  const order = locale === 'en'
    ? ['protagonist', 'rival', 'supporting', 'antagonist']
    : ['protagonista', 'rival', 'apoio', 'antagonista']

  const result = []
  for (const key of order) {
    if (groups[key]) {
      result.push({ label: labels[key] || key, items: groups[key] })
    }
  }
  return result
}
