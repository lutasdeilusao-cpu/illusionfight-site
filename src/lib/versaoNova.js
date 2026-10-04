// Atualização forçada (tipo loja de app). O GitHub Pages manda o navegador
// guardar a página por 10 minutos, e o CDN dele às vezes segura mais. Aqui o
// site pergunta ao servidor, sem cache, qual é o build no ar
// (<meta name="ldi-build">, gravado pelo prerender) e compara com o da página
// aberta. A 1ª checagem roda ainda na vinheta (index.html), antes do bundle.
//   • Confere ao abrir, ao voltar pra aba e a cada 5 minutos.
//   • Achou build novo: fora dos jogos recarrega na hora; dentro de um jogo
//     espera o próximo ponto seguro (troca de tela, `pontoSeguro`) pra nunca
//     derrubar uma partida no meio.
// Recarrega no máximo uma vez por build (se o servidor ainda devolver a página
// velha, não entra em laço).
const CHAVE = 'ldi-recarregou-build'
const A_CADA_MS = 5 * 60 * 1000
let pendente = null

const buildDaPagina = () => document.querySelector('meta[name="ldi-build"]')?.content || null
const emJogo = () => /\/games\//.test(window.location.pathname)

async function buildNoAr() {
  try {
    const r = await fetch(`/?v=${Date.now()}`, { cache: 'no-store' })
    if (!r.ok) return null
    const html = await r.text()
    return html.match(/<meta name="ldi-build" content="([^"]+)"/)?.[1] || null
  } catch { return null }
}

function recarregar(build) {
  try {
    if (sessionStorage.getItem(CHAVE) === build) return
    sessionStorage.setItem(CHAVE, build)
  } catch { /* sem storage: recarrega mesmo assim */ }
  console.log(`[SITE] versão nova no ar (${build}), recarregando`)
  window.location.reload()
}

async function conferir() {
  const atual = buildDaPagina()
  if (!atual) return
  const noAr = await buildNoAr()
  if (!noAr || noAr === atual) return
  if (emJogo()) pendente = noAr
  else recarregar(noAr)
}

// Chamado a cada troca de tela: se tinha versão nova esperando, é a hora.
export function pontoSeguro() {
  if (pendente) recarregar(pendente)
}

export function iniciarConferenciaDeVersao() {
  if (typeof window === 'undefined') return
  conferir()
  setInterval(conferir, A_CADA_MS)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') conferir() })
}
