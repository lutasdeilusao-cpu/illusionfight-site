import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { locales } from '../i18n/locales'

const LanguageContext = createContext(null)

function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
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

  const changeLocale = useCallback((next) => {
    setLocale(next)
    try { localStorage.setItem('ldi-locale', next) } catch {}
  }, [])

  return (
    <LanguageContext.Provider value={{ locale, t, changeLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
