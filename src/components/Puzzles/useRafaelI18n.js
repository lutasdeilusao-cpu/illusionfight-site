import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'

const cache = {}

function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function useRafaelI18n() {
  const { locale } = useLanguage()
  const [data, setData] = useState(cache[locale] || null)

  useEffect(() => {
    if (cache[locale]) {
      setData(cache[locale])
      return
    }
    let cancelled = false
    import(`./i18n/rafael_${locale}.json`).then(mod => {
      if (!cancelled) {
        cache[locale] = mod.default
        setData(mod.default)
      }
    })
    return () => { cancelled = true }
  }, [locale])

  const t = useCallback((path, vars) => {
    if (!data) return path
    let result = getNested(data, path)
    if (result == null) return path
    if (vars && typeof result === 'string') {
      Object.entries(vars).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
      })
    }
    return result
  }, [data])

  return { t, loaded: !!data }
}
