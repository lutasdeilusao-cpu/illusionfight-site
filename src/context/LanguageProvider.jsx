import { useState, useCallback, useMemo } from 'react'
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

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try { return localStorage.getItem('ldi-locale') || 'pt' } catch { return 'pt' }
  })
  // Traduções carregadas sob demanda por jogo (ex: Gangues), por idioma — não entram no bundle geral.
  const [lazyLocales, setLazyLocales] = useState({})

  const mergedLocale = useMemo(() => {
    const extra = lazyLocales[locale]
    return extra ? deepMerge(locales[locale], extra) : locales[locale]
  }, [locale, lazyLocales])

  const t = useCallback((path, vars) => {
    let result = getNested(mergedLocale, path)
    if (result == null) result = path
    if (vars && typeof result === 'string') {
      Object.entries(vars).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
      })
    }
    return result
  }, [mergedLocale])

  const tt = useCallback((path, vars) => {
    return t(`games.toptrumps.${path}`, vars)
  }, [t])

  const changeLocale = useCallback((next) => {
    setLocale(next)
    try { localStorage.setItem('ldi-locale', next) } catch {}
  }, [])

  const registerLocaleData = useCallback((localeKey, data) => {
    setLazyLocales(prev => ({ ...prev, [localeKey]: deepMerge(prev[localeKey] || {}, data) }))
  }, [])

  return (
    <LanguageContext.Provider value={{ locale, t, tt, changeLocale, registerLocaleData }}>
      {children}
    </LanguageContext.Provider>
  )
}
