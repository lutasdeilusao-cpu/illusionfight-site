import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'

const LOADERS = {
  pt: () => import('../../../../i18n/gangues-pt.json'),
  en: () => import('../../../../i18n/gangues-en.json'),
  es: () => import('../../../../i18n/gangues-es.json'),
}

/**
 * Carrega a tradução dedicada do LDI Gangues sob demanda — só baixa quando o
 * jogador entra neste jogo, em vez de engordar o bundle geral do site pra todo mundo.
 */
export default function useGanguesI18n() {
  const { locale, registerLocaleData } = useLanguage()
  const loaded = useRef(new Set())
  const [ready, setReady] = useState(() => loaded.current.has(locale))

  useEffect(() => {
    if (loaded.current.has(locale)) { setReady(true); return }
    setReady(false)
    let cancelled = false
    const loader = LOADERS[locale] || LOADERS.pt
    loader().then(mod => {
      if (cancelled) return
      loaded.current.add(locale)
      registerLocaleData(locale, mod.default)
      setReady(true)
    })
    return () => { cancelled = true }
  }, [locale, registerLocaleData])

  return ready
}
