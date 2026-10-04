// O GitHub Pages manda o navegador guardar a página por 10 minutos
// (Cache-Control: max-age=600). Sem isto, quem abre logo depois de um deploy
// joga a versão antiga. Aqui o site pergunta ao servidor, sem cache, qual é o
// build no ar (<meta name="ldi-build">, gravado pelo prerender) e compara com o
// da página aberta.
//   • Ao abrir: build diferente → recarrega na hora (nada aconteceu ainda).
//   • Ao voltar pra aba: recarrega só fora dos jogos, pra nunca derrubar uma
//     partida no meio; dentro do jogo a versão nova entra na próxima abertura.
// Recarrega no máximo uma vez por build (se o servidor ainda devolver a página
// velha, não entra em laço).
const CHAVE = 'ldi-recarregou-build'

const buildDaPagina = () => document.querySelector('meta[name="ldi-build"]')?.content || null

async function buildNoAr() {
  try {
    const r = await fetch(`/?v=${Date.now()}`, { cache: 'no-store' })
    if (!r.ok) return null
    const html = await r.text()
    return html.match(/<meta name="ldi-build" content="([^"]+)"/)?.[1] || null
  } catch { return null }
}

async function conferir(podeRecarregar) {
  const atual = buildDaPagina()
  if (!atual) return
  const noAr = await buildNoAr()
  if (!noAr || noAr === atual || !podeRecarregar()) return
  try {
    if (sessionStorage.getItem(CHAVE) === noAr) return
    sessionStorage.setItem(CHAVE, noAr)
  } catch { /* sem storage: recarrega mesmo assim, uma vez nesta carga */ }
  console.log(`[SITE] versão nova no ar (${noAr}), recarregando`)
  window.location.reload()
}

export function iniciarConferenciaDeVersao() {
  if (typeof window === 'undefined') return
  conferir(() => true)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') conferir(() => !/\/games\//.test(window.location.pathname))
  })
}
