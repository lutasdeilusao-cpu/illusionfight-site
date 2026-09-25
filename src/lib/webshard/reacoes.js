import { supabase } from '../supabase'

/* Reações WEB SHARD — feedback anônimo no fim do capítulo (pedido do Isaias,
   24/09/2026: "coletar feedback de uma maneira menos intrusiva"). Vale pra
   visitante sem conta: o navegador ganha um id aleatório, que vira um hash
   SHA-256 — é só isso que vai pro banco (migration 042).

   A escolha fica gravada no localStorage ANTES de ir pro Supabase: se a
   rede falhar (ou a migration ainda não tiver rodado), a reação fica
   marcada como pendente e é reenviada na próxima vez que o bloco montar. */

export const REACOES = [
  { id: 'lixo', icone: '🗑️' },
  { id: 'aceitavel', icone: '😐' },
  { id: 'gostei', icone: '🔥' },
  { id: 'parabens', icone: '👏' },
]

const CHAVE_VISITANTE = 'ldi-visitante-id'
const CHAVE_REACOES = 'ldi-webshard-reacoes'

let hashCache = null

function hexAleatorio(bytes) {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return Array.from(buf, b => b.toString(16).padStart(2, '0')).join('')
}

function idBruto() {
  try {
    let id = localStorage.getItem(CHAVE_VISITANTE)
    if (!id) {
      id = hexAleatorio(16)
      localStorage.setItem(CHAVE_VISITANTE, id)
    }
    return id
  } catch {
    return hexAleatorio(16)
  }
}

export async function visitanteHash() {
  if (hashCache) return hashCache
  const bruto = idBruto()
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`webshard:${bruto}`))
    hashCache = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    // crypto.subtle só existe em contexto seguro; fora dele, um id aleatório
    // de 64 hex é igualmente anônimo.
    hashCache = hexAleatorio(32)
  }
  return hashCache
}

function lerLocal() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_REACOES) || '{}') || {}
  } catch {
    return {}
  }
}

function gravarLocal(chave, valor) {
  try {
    const tudo = lerLocal()
    tudo[chave] = valor
    localStorage.setItem(CHAVE_REACOES, JSON.stringify(tudo))
  } catch { /* storage bloqueado: a reação ainda vai pro servidor */ }
}

const chaveDe = (titulo, capitulo) => `${titulo}/${capitulo}`

export function reacaoLocal(titulo, capitulo) {
  return lerLocal()[chaveDe(titulo, capitulo)] || null
}

async function enviar(titulo, capitulo, reacao, idioma) {
  const visitante = await visitanteHash()
  const { error } = await supabase.rpc('webshard_reagir', {
    p_titulo: titulo,
    p_capitulo: capitulo,
    p_visitante: visitante,
    p_reacao: reacao,
    p_idioma: idioma,
  })
  if (error) throw error
}

export async function reagir({ titulo, capitulo, reacao, idioma }) {
  const chave = chaveDe(titulo, capitulo)
  gravarLocal(chave, { reacao, idioma, pendente: true })
  try {
    await enviar(titulo, capitulo, reacao, idioma)
    gravarLocal(chave, { reacao, idioma, pendente: false })
    return true
  } catch (err) {
    console.warn('[WEBSHARD] reação ficou pendente, reenvia depois:', err?.message || err)
    return false
  }
}

/** Reenvia a reação deste capítulo se ela ficou pendente. */
export async function sincronizarPendente(titulo, capitulo) {
  const local = reacaoLocal(titulo, capitulo)
  if (!local?.pendente) return
  await reagir({ titulo, capitulo, reacao: local.reacao, idioma: local.idioma })
}

/** Totais por reação — só a visão de admin usa. */
export async function contarReacoes(titulo, capitulo) {
  const { data, error } = await supabase.rpc('webshard_contagem', { p_titulo: titulo, p_capitulo: capitulo })
  if (error) {
    console.warn('[WEBSHARD] contagem indisponível:', error.message)
    return null
  }
  return Object.fromEntries((data || []).map(linha => [linha.reacao, Number(linha.total)]))
}
