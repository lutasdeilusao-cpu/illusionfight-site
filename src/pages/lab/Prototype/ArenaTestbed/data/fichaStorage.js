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

// O jogo usa nomes genéricos; ficha salva com nome de personagem do universo é trocada na leitura.
const NOMES_OFICIAIS = { Kim: 'Jogador 1', Jack: 'Jogador 2', Nina: 'Jogador 3' }

function nomeGenerico(nome) {
  if (NOMES_OFICIAIS[nome]) return NOMES_OFICIAIS[nome]
  const ia = /^IA (\d+)$/.exec(nome || '')
  return ia ? `Inimigo ${ia[1]}` : nome
}

function precisaNomeGenerico(ficha) {
  return (ficha.personagens || ficha.characters || []).some(c => nomeGenerico(c.nome) !== c.nome || nomeGenerico(c.aparencia?.nome) !== c.aparencia?.nome)
}

function nomesGenericos(ficha) {
  const chave = ficha.personagens ? 'personagens' : ficha.characters ? 'characters' : null
  if (!chave) return ficha
  return { ...ficha, [chave]: ficha[chave].map(c => ({
    ...c,
    nome: nomeGenerico(c.nome),
    ...(c.aparencia ? { aparencia: { ...c.aparencia, nome: nomeGenerico(c.aparencia.nome) } } : {}),
  })) }
}

function lerDoStorage() {
  try {
    const raw = localStorage.getItem(CHAVE)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    if (!parsed.some(f => !f.id || precisaNomeGenerico(f))) return parsed
    const comId = parsed.map(f => nomesGenericos(f.id ? f : { ...f, id: gerarId() }))
    localStorage.setItem(CHAVE, JSON.stringify(comId))
    return comId
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
  const nova = { ...ficha, id: ficha.id || gerarId() }
  const idx = fichas.findIndex(f => f.id === nova.id)
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
