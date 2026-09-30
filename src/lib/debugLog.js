// Log de depuração SÓ das contas admin (migration 046). Conta comum nunca
// liga isto — nem fila, nem request. Ligado pelo <DebugLogTracker> (App.jsx)
// quando perfil.is_admin === true; desligado no logout.
// Fila em memória → lote pro RPC debug_log_registrar a cada 5s e ao esconder a aba.
import { supabase } from './supabase'
import { SITE_VERSION, GANGUES_VERSION } from '../config/version'

const LOTE_MS = 5000
const MAX_FILA = 1000
const VERSAO = `${SITE_VERSION}/g${GANGUES_VERSION}`
const SESSAO = (crypto.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)

let ativo = false
let fila = []
let timer = null
let enviando = false
let dentroDoLog = false // trava contra loop (console.error dentro do próprio envio)
const originais = {}
const ouvintes = new Set()

export const debugLogAtivo = () => ativo
export const debugLogSessao = () => SESSAO

/** Resume qualquer valor pra caber no log (corta string, array e profundidade). */
export function resumir(v, prof = 0) {
  if (v == null || typeof v === 'number' || typeof v === 'boolean') return v
  if (typeof v === 'string') return v.length > 300 ? `${v.slice(0, 300)}…` : v
  if (typeof v === 'function') return '[fn]'
  if (v instanceof Error) return { erro: v.message, stack: String(v.stack || '').slice(0, 1500) }
  if (prof > 4) return '[…]'
  if (Array.isArray(v)) {
    const r = v.slice(0, 30).map(x => resumir(x, prof + 1))
    if (v.length > 30) r.push(`+${v.length - 30}`)
    return r
  }
  if (typeof v === 'object') {
    if (typeof Event !== 'undefined' && v instanceof Event) return `[${v.type}]`
    const r = {}
    const ks = Object.keys(v)
    for (const k of ks.slice(0, 40)) r[k] = resumir(v[k], prof + 1)
    if (ks.length > 40) r['…'] = `+${ks.length - 40}`
    return r
  }
  return String(v)
}

export function logDebug(tipo, dados) {
  if (!ativo || dentroDoLog) return
  dentroDoLog = true
  try {
    fila.push({ sessao: SESSAO, tipo, rota: location.pathname + location.search, dados: resumir(dados), versao: VERSAO, em: new Date().toISOString() })
    if (fila.length > MAX_FILA) fila.splice(0, fila.length - MAX_FILA)
  } finally { dentroDoLog = false }
}

/** Avisa quem precisa saber que o log ligou/desligou (ex. o Gangues). */
export function aoMudarDebugLog(fn) { ouvintes.add(fn); return () => ouvintes.delete(fn) }

async function enviar() {
  if (enviando || !fila.length) return
  enviando = true
  const lote = fila.splice(0, 200)
  dentroDoLog = true
  try {
    const { error } = await supabase.rpc('debug_log_registrar', { lote })
    if (error) fila.unshift(...lote.slice(0, MAX_FILA - fila.length))
  } catch {
    fila.unshift(...lote.slice(0, MAX_FILA - fila.length))
  } finally { dentroDoLog = false; enviando = false }
}

function aoEsconder() { if (document.visibilityState === 'hidden') enviar() }
function aoErro(e) { logDebug('erro.window', { msg: e.message, arquivo: e.filename, linha: e.lineno, col: e.colno, stack: e.error?.stack }) }
function aoRejeicao(e) { logDebug('erro.promise', { motivo: resumir(e.reason) }) }

export function ativarDebugLog(perfil) {
  if (perfil?.is_admin !== true || ativo || typeof window === 'undefined') return
  ativo = true
  for (const nivel of ['error', 'warn']) {
    originais[nivel] = console[nivel]
    console[nivel] = (...args) => {
      logDebug(`console.${nivel}`, { args })
      return originais[nivel].apply(console, args)
    }
  }
  window.addEventListener('error', aoErro)
  window.addEventListener('unhandledrejection', aoRejeicao)
  document.addEventListener('visibilitychange', aoEsconder)
  window.addEventListener('pagehide', enviar)
  timer = setInterval(enviar, LOTE_MS)
  logDebug('sessao.inicio', { ua: navigator.userAgent, tela: `${screen.width}x${screen.height}`, idioma: navigator.language })
  ouvintes.forEach(fn => { try { fn(true) } catch { /* nada */ } })
}

export function desativarDebugLog() {
  if (!ativo) return
  logDebug('sessao.fim', {})
  enviar()
  ativo = false
  for (const nivel of Object.keys(originais)) { console[nivel] = originais[nivel]; delete originais[nivel] }
  window.removeEventListener('error', aoErro)
  window.removeEventListener('unhandledrejection', aoRejeicao)
  document.removeEventListener('visibilitychange', aoEsconder)
  window.removeEventListener('pagehide', enviar)
  clearInterval(timer); timer = null
  ouvintes.forEach(fn => { try { fn(false) } catch { /* nada */ } })
}
