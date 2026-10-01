/* AFINIDADE — o placar do que a pessoa usa no portal (Isaias, 01/10/2026:
   "sistema de recomendação baseado no que o usuário mais costuma acessar no
   produto... as primeiras são recomendações quase certas").

   Cada página visitada vira um ponto num ITEM (jogo, história, WEB SHARD,
   Rádio Nina), contando visitas e tempo de tela. O placar vale mais quanto
   mais recente (meia-vida de 14 dias): o que a pessoa largou há meses perde
   força sozinho. Com conta, o placar (e o histórico de leitura) vai pra
   nuvem (`perfil_afinidade`, migration 047) e segue a pessoa em qualquer
   aparelho; sem conta fica só neste navegador.

   Formato: { itens: { [chave]: { n, s, ts } } } — n visitas, s segundos, ts
   a última vez. Chaves: 'gangues', 'trunfo', 'webshard', 'radio' e
   'historia:<slug>'. */
import { supabase } from '../supabase'
import { lerHistorico, mesclarHistorico } from '../historias/historico'

const CHAVE = 'ldi-afinidade'
const EVENTO = 'ldi:afinidade'
const MEIA_VIDA = 14 * 864e5
const TETO_SEGUNDOS = 600 // uma visita conta no máximo 10 min de tela

/** Qual item a rota representa (null = página que não entra no placar). */
export function itemDaRota(path = '') {
  if (path.startsWith('/games/ldi-gangues')) return 'gangues'
  if (path.startsWith('/games/toptrumps')) return 'trunfo'
  if (path.startsWith('/webtoon')) return 'webshard'
  if (path.startsWith('/musicas')) return 'radio'
  const conto = path.match(/^\/historias\/contos\/([^/]+)/)
  if (conto) return `historia:${conto[1]}`
  const outra = path.match(/^\/historias\/([^/]+)/)
  if (outra && outra[1] !== 'contos') return `historia:${outra[1]}`
  return null
}

export const CATEGORIA = chave =>
  chave.startsWith('historia:') ? 'historias'
    : chave === 'webshard' ? 'webshard'
      : chave === 'radio' ? 'musica'
        : 'jogos'

export function lerAfinidade() {
  try {
    const a = JSON.parse(localStorage.getItem(CHAVE) || '{}')
    return a?.itens ? a : { itens: {} }
  } catch { return { itens: {} } }
}

function gravar(a) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(a))
    window.dispatchEvent(new Event(EVENTO))
  } catch { /* sem storage: segue sem placar */ }
  agendarSync()
}

/** Somou uma visita (`segundos` = tempo de tela dela). */
export function registrarUso(chave, segundos = 0) {
  if (!chave) return
  const a = lerAfinidade()
  const e = a.itens[chave] || { n: 0, s: 0, ts: 0 }
  a.itens[chave] = { n: e.n + (segundos ? 0 : 1), s: e.s + Math.min(TETO_SEGUNDOS, Math.round(segundos)), ts: Date.now() }
  gravar(a)
}

/** Força de um item agora: visitas e tempo, com o peso do tempo passado. */
export function forca(e, agora = Date.now()) {
  if (!e) return 0
  const base = Math.log2(1 + e.n) + 1.5 * Math.log2(1 + e.s / 60)
  return base * 0.5 ** ((agora - (e.ts || 0)) / MEIA_VIDA)
}

export function aoMudarAfinidade(fn) {
  const cb = () => fn(lerAfinidade())
  window.addEventListener(EVENTO, cb)
  window.addEventListener('storage', cb)
  return () => { window.removeEventListener(EVENTO, cb); window.removeEventListener('storage', cb) }
}

/* ── nuvem (só com conta) ── */
let usuario = null
let timer = null

function mesclarItens(a = {}, b = {}) {
  const r = { ...a }
  for (const [k, e] of Object.entries(b)) {
    const x = r[k]
    r[k] = x ? { n: Math.max(x.n, e.n), s: Math.max(x.s, e.s), ts: Math.max(x.ts, e.ts) } : e
  }
  return r
}

function agendarSync() {
  if (!usuario) return
  clearTimeout(timer)
  timer = setTimeout(enviar, 8000)
}

async function enviar() {
  if (!usuario) return
  const dados = { itens: lerAfinidade().itens, leitura: lerHistorico() }
  const { error } = await supabase.from('perfil_afinidade')
    .upsert({ user_id: usuario, dados, atualizado: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) console.warn('[afinidade] não sincronizou:', error.message)
}

/** Entrou/saiu da conta. Ao entrar, junta o placar da nuvem com o daqui. */
export async function ligarConta(userId) {
  usuario = userId || null
  if (!usuario) return
  const { data, error } = await supabase.from('perfil_afinidade').select('dados').eq('user_id', usuario).maybeSingle()
  if (error) { console.warn('[afinidade] não leu a conta:', error.message); return }
  const remoto = data?.dados || {}
  const local = lerAfinidade()
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ itens: mesclarItens(local.itens, remoto.itens) }))
    window.dispatchEvent(new Event(EVENTO))
  } catch { /* sem storage */ }
  if (remoto.leitura) mesclarHistorico(remoto.leitura)
  console.log('[afinidade] conta sincronizada:', Object.keys(lerAfinidade().itens).length, 'itens')
  enviar()
}

// leitura nova (historico.js avisa por evento) também sobe pra conta
if (typeof window !== 'undefined') window.addEventListener('ldi:historico-leitura', () => agendarSync())
