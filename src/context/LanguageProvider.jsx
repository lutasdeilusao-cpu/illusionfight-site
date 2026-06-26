import { useState, useCallback } from 'react'
import { LanguageContext } from './LanguageContext'
import { locales } from '../i18n/locales'

function getNested(obj, path) {
  // Converte "specializations[0]" → "specializations.0" para suportar arrays
  const normalized = path.replace(/\[(\d+)\]/g, '.$1')
  return normalized.split('.').reduce((acc, key) => {
    if (acc == null) return undefined
    // Tenta como índice numérico (para arrays)
    const idx = /^\d+$/.test(key) ? parseInt(key, 10) : key
    return acc[idx]
  }, obj)
}

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try { return localStorage.getItem('ldi-locale') || 'pt' } catch { return 'pt' }
  })

  const t = useCallback((path, vars) => {
    let result = getNested(locales[locale], path)
    if (result == null) result = path
    if (vars && typeof result === 'string') {
      Object.entries(vars).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
      })
    }
    return result
  }, [locale])

  const tt = useCallback((path, vars) => {
    return t(`games.toptrumps.${path}`, vars)
  }, [t])

  const changeLocale = useCallback((next) => {
    setLocale(next)
    try { localStorage.setItem('ldi-locale', next) } catch {}
  }, [])

  return (
    <LanguageContext.Provider value={{ locale, t, tt, changeLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}
