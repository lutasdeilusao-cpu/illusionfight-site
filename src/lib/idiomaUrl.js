/* Idioma no ENDEREÇO (SEO, 01/10/2026 — Isaias: "fazer a sugestão 1"): o
   site tem 3 versões pro Google — inglês na raiz (illusionfight.com/...),
   português em /pt/... e espanhol em /es/... — ligadas por hreflang no HTML
   estático (scripts/prerender-routes.js). Pro app é a MESMA rota: o prefixo
   vira o `basename` do roteador (main.jsx), então todo <Link> e navigate()
   continuam escrevendo caminho sem idioma e saem com o prefixo certo.

   O prefixo só decide o idioma INICIAL da visita (vale mais que o aparelho);
   trocar o idioma no menu leva pro endereço da outra versão. */
const PREFIXOS = ['pt', 'es']

const m = typeof window !== 'undefined' ? window.location.pathname.match(/^\/(pt|es)(?=\/|$)/) : null

/** 'pt' | 'es' | null (raiz = inglês ou o idioma do aparelho). */
export const IDIOMA_DA_URL = m ? m[1] : null

/** basename do BrowserRouter. */
export const BASE_ROTAS = IDIOMA_DA_URL ? `/${IDIOMA_DA_URL}` : '/'

/** Caminho da mesma página em outro idioma ('en' = sem prefixo). */
export function caminhoNoIdioma(idioma, caminhoSemPrefixo = '/') {
  const p = caminhoSemPrefixo.startsWith('/') ? caminhoSemPrefixo : `/${caminhoSemPrefixo}`
  return PREFIXOS.includes(idioma) ? `/${idioma}${p === '/' ? '/' : p}` : p
}

/** Troca de idioma pelo menu estando numa versão com prefixo: vai pro
 *  endereço da outra versão (recarrega — o basename é fixo por visita).
 *  Devolve true quando vai navegar. */
export function irParaIdioma(idioma) {
  if (!IDIOMA_DA_URL || idioma === IDIOMA_DA_URL) return false
  const resto = window.location.pathname.slice(BASE_ROTAS.length) || '/'
  window.location.assign(caminhoNoIdioma(idioma, resto) + window.location.search + window.location.hash)
  return true
}

/* Escolha manual vale pela visita (aba): sem isso, quem sai de /pt pro
   inglês cairia de novo no idioma do aparelho ao chegar na raiz. */
const CHAVE_SESSAO = 'ldi-locale-sessao'
export function idiomaDaSessao() {
  try { return sessionStorage.getItem(CHAVE_SESSAO) } catch { return null }
}
export function guardarIdiomaDaSessao(idioma) {
  try { sessionStorage.setItem(CHAVE_SESSAO, idioma) } catch { /* sem storage */ }
}
