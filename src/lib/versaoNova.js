// Atualização forçada (tipo loja de app). O GitHub Pages manda o navegador
// guardar a página por 10 minutos, e o CDN dele às vezes segura mais. Aqui o
// site pergunta ao servidor, sem cache, qual é o build no ar
// (<meta name="ldi-build">, gravado pelo prerender) e compara com o da página
// aberta. A 1ª checagem roda ainda na vinheta (index.html), antes do bundle.
//   • Confere ao abrir, ao voltar pra aba e a cada 5 minutos.
//   • Achou build novo: na navegação comum recarrega na hora. Dentro de um
//     jogo, no painel admin ou com a pessoa digitando num campo, espera o
//     próximo ponto seguro (troca de tela fora dessas situações, `pontoSeguro`)
//     pra nunca derrubar uma partida nem apagar um texto sendo escrito.
// A recarga vai pra um endereço com `?v=<build>`, que fura o cache do CDN do
// GitHub Pages. Se mesmo assim a página voltar velha, tenta de novo até
// TENTATIVAS vezes por build, com intervalo, sem entrar em laço.
const CHAVE = 'ldi-recarregou-build'
const TENTATIVAS = 4
const A_CADA_MS = 5 * 60 * 1000
const RETENTAR_MS = 20 * 1000
let pendente = null

const buildDaPagina = () => document.querySelector('meta[name="ldi-build"]')?.content || null
const emJogo = () => /\/games\//.test(window.location.pathname)
const noPainel = () => /\/admin(\/|$)/.test(window.location.pathname)
const digitando = () => {
  const el = document.activeElement
  return Boolean(el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)))
}
const protegido = () => emJogo() || noPainel() || digitando()

async function buildNoAr() {
  try {
    const r = await fetch(`/?v=${Date.now()}`, { cache: 'no-store' })
    if (!r.ok) return null
    const html = await r.text()
    return html.match(/<meta name="ldi-build" content="([^"]+)"/)?.[1] || null
  } catch { return null }
}

function recarregar(build) {
  let tentativa = 1
  try {
    const salvo = JSON.parse(sessionStorage.getItem(CHAVE) || 'null')
    if (salvo?.build === build) tentativa = salvo.tentativa + 1
    if (tentativa > TENTATIVAS) return
    sessionStorage.setItem(CHAVE, JSON.stringify({ build, tentativa }))
  } catch { /* sem storage: recarrega mesmo assim */ }
  console.log(`[SITE] versão nova no ar (${build}), recarregando (tentativa ${tentativa})`)
  const url = new URL(window.location.href)
  url.searchParams.set('v', build.replace(/\W/g, '').slice(-12))
  window.location.replace(url.toString())
}

async function conferir() {
  const atual = buildDaPagina()
  if (!atual) return
  const noAr = await buildNoAr()
  if (!noAr || noAr === atual) return
  if (protegido()) pendente = noAr
  else recarregar(noAr)
}

// Voltou de uma recarga e a página ainda é a velha (CDN atrasado): tenta de novo.
function retentarSeVoltouVelha() {
  try {
    const salvo = JSON.parse(sessionStorage.getItem(CHAVE) || 'null')
    if (salvo && salvo.build !== buildDaPagina()) setTimeout(conferir, RETENTAR_MS)
  } catch { /* nada */ }
}

// Chamado a cada troca de tela: se tinha versão nova esperando, é a hora.
export function pontoSeguro() {
  if (pendente && !protegido()) recarregar(pendente)
}

export function iniciarConferenciaDeVersao() {
  if (typeof window === 'undefined') return
  retentarSeVoltouVelha()
  conferir()
  setInterval(conferir, A_CADA_MS)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') conferir() })
}
