import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'

const loadedLocales = new Set()

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
  const requestId = useRef(0)
  const [ready, setReady] = useState(() => loadedLocales.has(locale))

  useEffect(() => {
    if (loadedLocales.has(locale)) { setReady(true); return }
    setReady(false)
    let cancelled = false
    const currentRequest = ++requestId.current
    const loader = LOADERS[locale] || LOADERS.pt
    const liberarTela = () => {
      if (!cancelled && currentRequest === requestId.current) setReady(true)
    }
    const timeout = setTimeout(() => {
      console.error(`[GANGUES] timeout ao carregar i18n (${locale}); liberando fallback visual`)
      liberarTela()
    }, 5000)
    loader()
      .catch(error => {
        console.error(`[GANGUES] falha ao carregar i18n (${locale}), tentando pt:`, error)
        return LOADERS.pt()
      })
      .then(mod => {
        if (cancelled || !mod) return
        loadedLocales.add(locale)
        registerLocaleData(locale, mod.default)
        liberarTela()
      })
      .catch(error => {
        console.error('[GANGUES] fallback i18n indisponível:', error)
        liberarTela()
      })
      .finally(() => clearTimeout(timeout))
    return () => { cancelled = true; clearTimeout(timeout) }
  }, [locale, registerLocaleData])

  return ready
}
