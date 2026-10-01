/* Histórico de leitura do visitante — base das recomendações (Isaias,
   30/09/2026: "recomendação é importante pra manter o cara engajado").
   Mora no localStorage DESTE navegador: é conveniência de leitura (igual o
   "continuar lendo" que já existia), não progresso de jogo. Sem storage
   (aba anônima, bloqueado) tudo continua funcionando, só sem histórico.

   Formato: { [slug]: { tipo, lidos: [capId…], ultimo: capId, terminou, ts } } */
const CHAVE = 'ldi-historico-leitura'
const EVENTO = 'ldi:historico-leitura'

export function lerHistorico() {
  try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') || {} } catch { return {} }
}

function gravar(h) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(h))
    window.dispatchEvent(new Event(EVENTO))
  } catch { /* sem storage: segue sem histórico */ }
}

/** Abriu um capítulo: vira o "último" da história (continuar lendo). */
export function registrarAbertura(historia, capId) {
  if (!historia?.slug || !capId) return
  const h = lerHistorico()
  const e = h[historia.slug] || { tipo: historia.tipo, lidos: [], terminou: false }
  h[historia.slug] = { ...e, tipo: historia.tipo, ultimo: capId, ts: Date.now() }
  gravar(h)
}

/** Leu o capítulo até o fim. `ultimoDaHistoria` = era o último capítulo que
 *  a história TEM (não só o último liberado) — aí a história está terminada. */
export function registrarLeitura(historia, capId, ultimoDaHistoria) {
  if (!historia?.slug || !capId) return
  const h = lerHistorico()
  const e = h[historia.slug] || { tipo: historia.tipo, lidos: [], terminou: false }
  const lidos = e.lidos.includes(capId) ? e.lidos : [...e.lidos, capId]
  h[historia.slug] = { ...e, tipo: historia.tipo, lidos, ultimo: capId, terminou: e.terminou || Boolean(ultimoDaHistoria), ts: Date.now() }
  gravar(h)
}

/** Avisa quando o histórico muda (outra aba, outra tela). */
export function aoMudarHistorico(fn) {
  const cb = () => fn(lerHistorico())
  window.addEventListener(EVENTO, cb)
  window.addEventListener('storage', cb)
  return () => { window.removeEventListener(EVENTO, cb); window.removeEventListener('storage', cb) }
}
