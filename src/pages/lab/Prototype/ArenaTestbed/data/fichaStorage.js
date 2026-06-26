/**
 * fichaStorage — Persistência de fichas salvas
 *
 * Implementação atual: localStorage do navegador.
 * Interface assíncrona já preparada para futura migração para Supabase:
 *   - salvarFicha(ficha)  → Promise<{ id, ...ficha }>
 *   - carregarFichas()     → Promise<Ficha[]>
 *   - deletarFicha(id)     → Promise<void>
 *
 * Quando migrar para Supabase, trocar só a implementação interna —
 * nenhum consumidor da API precisa ser alterado.
 */

const CHAVE = 'ldi_arenatestbed_fichas'

function gerarId() {
  return `ficha_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function lerDoStorage() {
  try {
    const raw = localStorage.getItem(CHAVE)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('[fichaStorage] Erro ao ler localStorage:', err)
    return []
  }
}

function escreverNoStorage(fichas) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(fichas))
  } catch (err) {
    console.error('[fichaStorage] Erro ao escrever localStorage:', err)
  }
}

export async function salvarFicha(ficha) {
  const fichas = lerDoStorage()
  const nova = { id: gerarId(), ...ficha }
  const idx = fichas.findIndex(f => f.id === ficha.id)
  if (idx !== -1) {
    fichas[idx] = nova
  } else {
    fichas.push(nova)
  }
  escreverNoStorage(fichas)
  return { ...nova }
}

export async function carregarFichas() {
  return lerDoStorage().map(f => ({ ...f }))
}

export async function deletarFicha(id) {
  const fichas = lerDoStorage()
  const idx = fichas.findIndex(f => f.id === id)
  if (idx !== -1) {
    fichas.splice(idx, 1)
    escreverNoStorage(fichas)
  }
}
