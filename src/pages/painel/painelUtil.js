// Utilidades do painel: períodos, formatação e chamada dos RPCs.
import { supabase } from '../../lib/supabase'

const DIA = 86400000

/** Início do dia em Brasília, pra "hoje" bater com o relógio do Isaias. */
function inicioDoDiaBR(d = new Date()) {
  const s = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
  return new Date(`${s}T00:00:00-03:00`)
}

export const PERIODOS = ['hoje', 'ontem', '7d', '30d', '90d', 'tudo', 'custom']

export function intervalo(periodo, de, ate) {
  const hoje = inicioDoDiaBR()
  const amanha = new Date(hoje.getTime() + DIA)
  if (periodo === 'hoje') return [hoje, amanha]
  if (periodo === 'ontem') return [new Date(hoje.getTime() - DIA), hoje]
  if (periodo === '7d') return [new Date(hoje.getTime() - 6 * DIA), amanha]
  if (periodo === '30d') return [new Date(hoje.getTime() - 29 * DIA), amanha]
  if (periodo === '90d') return [new Date(hoje.getTime() - 89 * DIA), amanha]
  if (periodo === 'custom' && de && ate) return [new Date(`${de}T00:00:00-03:00`), new Date(new Date(`${ate}T00:00:00-03:00`).getTime() + DIA)]
  return [new Date('2026-01-01T00:00:00-03:00'), amanha]
}

export async function rpc(nome, params) {
  const { data, error } = await supabase.rpc(nome, params)
  if (error) {
    const faltaMigration = /could not find the function|does not exist|schema cache/i.test(error.message || '')
    throw Object.assign(new Error(error.message), { faltaMigration })
  }
  return data
}

export const num = (n, locale) => new Intl.NumberFormat(locale).format(Number(n) || 0)

export function dinheiro(centavos, moeda = 'BRL', locale = 'pt-BR') {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency: moeda || 'BRL' }).format((Number(centavos) || 0) / 100) }
  catch { return `${((Number(centavos) || 0) / 100).toFixed(2)} ${moeda}` }
}

export function duracao(seg) {
  const s = Math.max(0, Math.round(Number(seg) || 0))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, '0')}s`
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
}

export function hora(iso, locale) {
  return new Intl.DateTimeFormat(locale, { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export const localeDe = l => (l === 'en' ? 'en-US' : l === 'es' ? 'es-ES' : 'pt-BR')

export function horaCurta(iso, locale) {
  return new Intl.DateTimeFormat(locale, { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(iso))
}
