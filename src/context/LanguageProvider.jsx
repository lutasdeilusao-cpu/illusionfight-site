import { useState, useCallback, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { LanguageContext } from './LanguageContext'
import { carregarCore, carregarArea, areaDaRota } from '../i18n/locales'

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
  const { pathname } = useLocation()

  const [locale, setLocale] = useState(() => {
    try { return localStorage.getItem('ldi-locale') || 'pt' } catch { return 'pt' }
  })

  // Núcleo do idioma ativo. Enquanto não chega, o app não renderiza —
  // é o que evita a página piscar com as chaves cruas no lugar do texto.
  const [core, setCore] = useState(null)

  // Áreas pesadas e traduções de jogo (Gangues) carregadas sob demanda,
  // indexadas por idioma pra não vazar texto de um idioma no outro.
  const [extras, setExtras] = useState({})

  useEffect(() => {
    let ativo = true
    carregarCore(locale).then(dados => { if (ativo) setCore(dados) })
    return () => { ativo = false }
  }, [locale])

  // A rota diz qual área precisa existir. Carrega uma vez por idioma.
  useEffect(() => {
    const area = areaDaRota(pathname)
    if (!area) return
    const marca = `${area}:${locale}`
    if (extras[marca]) return
    let ativo = true
    carregarArea(area, locale).then(dados => {
      if (ativo && dados) setExtras(prev => ({ ...prev, [marca]: dados }))
    })
    return () => { ativo = false }
  }, [pathname, locale, extras])

  const dicionario = useMemo(() => {
    if (!core) return null
    const doIdioma = Object.entries(extras)
      .filter(([marca]) => marca.endsWith(`:${locale}`))
      .map(([, dados]) => dados)
    return doIdioma.length ? deepMerge(core, ...doIdioma) : core
  }, [core, extras, locale])

  const t = useCallback((path, vars) => {
    let result = dicionario ? getNested(dicionario, path) : undefined
    if (result == null) result = path
    if (vars && typeof result === 'string') {
      Object.entries(vars).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
      })
    }
    return result
  }, [dicionario])

  const tt = useCallback((path, vars) => {
    return t(`games.toptrumps.${path}`, vars)
  }, [t])

  const changeLocale = useCallback((next) => {
    setLocale(next)
    try { localStorage.setItem('ldi-locale', next) } catch {}
  }, [])

  // Usado por quem carrega tradução própria (ex.: useGanguesI18n).
  const registerLocaleData = useCallback((localeKey, data) => {
    setExtras(prev => {
      const marca = `registrado:${localeKey}`
      return { ...prev, [marca]: deepMerge(prev[marca] || {}, data) }
    })
  }, [])

  const valor = useMemo(
    () => ({ locale, t, tt, changeLocale, registerLocaleData }),
    [locale, t, tt, changeLocale, registerLocaleData]
  )

  // A vinheta de abertura (index.html) cobre esta espera; ela só encerra
  // quando o App monta, e o App só monta com o dicionário na mão.
  if (!dicionario) return null

  return (
    <LanguageContext.Provider value={valor}>
      {children}
    </LanguageContext.Provider>
  )
}
