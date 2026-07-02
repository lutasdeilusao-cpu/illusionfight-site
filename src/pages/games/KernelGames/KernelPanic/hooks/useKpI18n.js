import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'

function getNested(obj, path) {
  const normalized = path.replace(/\[(\d+)\]/g, '.$1')
  return normalized.split('.').reduce((acc, key) => {
    if (acc == null) return undefined
    const idx = /^\d+$/.test(key) ? parseInt(key, 10) : key
    return acc[idx]
  }, obj)
}

const cache = {}

export function useKpI18n() {
  const { locale } = useLanguage()
  const [data, setData] = useState(cache[locale] || null)

  useEffect(() => {
    if (cache[locale]) {
      setData(cache[locale])
      return
    }
    let cancelled = false
    import(`../i18n/${locale}.json`).then(mod => {
      if (!cancelled) {
        cache[locale] = mod.default
        setData(mod.default)
      }
    })
    return () => { cancelled = true }
  }, [locale])

  const t = useCallback((path, vars) => {
    if (!data) return path
    const cleanPath = path.replace(/^kp\./, '')
    let result = getNested(data, cleanPath)
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
