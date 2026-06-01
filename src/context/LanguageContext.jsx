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

  const t = useCallback((path) => {
    const result = getNested(locales[locale], path)
    return result ?? path
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
