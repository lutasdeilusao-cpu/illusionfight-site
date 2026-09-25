/* Progresso de leitura WEB SHARD — por título, só no navegador (conveniência
   do leitor, não dado de negócio). Formato:
   { [slug]: { cap: '01', pagina: 12, total: 53, ts: 1727000000000 } }
   A chave antiga do leitor anterior (ldi-webtoon-ultimo, só o id do
   episódio de Lutas de Ilusão) ainda é lida como fallback. */

const CHAVE = 'ldi-webshard-progresso'
const CHAVE_LEGADA = 'ldi-webtoon-ultimo'

function ler() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}
  } catch {
    return {}
  }
}

export function lerProgresso(slug) {
  const tudo = ler()
  if (tudo[slug]) return tudo[slug]
  if (slug === 'lutas-de-ilusao') {
    try {
      const antigo = localStorage.getItem(CHAVE_LEGADA)
      if (antigo) return { cap: antigo, pagina: 1, total: 0, ts: 0 }
    } catch { /* storage bloqueado: sem progresso */ }
  }
  return null
}

export function salvarProgresso(slug, cap, pagina, total) {
  try {
    const tudo = ler()
    tudo[slug] = { cap, pagina, total, ts: Date.now() }
    localStorage.setItem(CHAVE, JSON.stringify(tudo))
  } catch { /* storage cheio/bloqueado: segue lendo sem salvar */ }
}

/** O progresso mais recente entre todos os títulos — alimenta o
 *  "Continuar lendo" do hub. */
export function ultimoProgresso() {
  const tudo = ler()
  const itens = Object.entries(tudo).map(([slug, p]) => ({ slug, ...p }))
  if (!itens.length) {
    const legado = lerProgresso('lutas-de-ilusao')
    return legado ? { slug: 'lutas-de-ilusao', ...legado } : null
  }
  return itens.sort((a, b) => b.ts - a.ts)[0]
}

export function capituloTerminado(p) {
  return Boolean(p && p.total && p.pagina >= p.total)
}
