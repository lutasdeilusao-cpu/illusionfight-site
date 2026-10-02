// Coleta do painel de administrador (analytics próprio, migration 043).
// Espelha o que vai pro GA (page_view + eventos) e soma um "ainda estou aqui"
// a cada 15s com a aba visível — é isso que dá tempo de sessão real e quem
// está online agora. Manda em lote pro RPC painel_registrar, que só escreve.
//
// Privacidade: nada de IP gravado. Com cookies aceitos, o visitante tem um id
// que dura (dá pra saber quem volta) e a região vem da ipwho.is; sem aceite,
// o id vale só pra sessão e não tem região.
import { supabase } from './supabase'

const PING_MS = 15000
const LOTE_MS = 5000
const SESSAO_OCIOSA_MS = 30 * 60 * 1000
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dvxfrzixtetdzmdrzkpx.supabase.co'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

let fila = []
let timerLote = null
let iniciado = false
let contexto = null

const ler = (st, k) => { try { return st.getItem(k) } catch { return null } }
const gravar = (st, k, v) => { try { st.setItem(k, v) } catch { /* sem storage */ } }
const aleatorio = () => (crypto.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)
const consentiu = () => ler(localStorage, 'ldi-cookies-accepted') === 'true'

// Admin marcado neste navegador (analytics.js) e o próprio painel não contam.
// Robô não é visita: o Googlebot (Android 6.0.1, "Nexus 5X", EUA) lendo
// capítulo por capítulo era 29 das 35 sessões do 1º dia e puxava a rejeição
// pra 97%. Crawler, ferramenta de teste e navegador automatizado ficam de fora.
const ROBO = /bot|crawl|spider|slurp|mediapartners|lighthouse|headless|pagespeed|prerender|facebookexternalhit|whatsapp|preview/i
// O renderizador do Google nem sempre se diz "bot" no navegador: ele finge ser
// um Nexus 5X com Android 6.0.1 (Build/MMB29P) — passou 6x pelo filtro entre
// 30/09 e 02/10/2026. Ninguém de verdade usa esse aparelho hoje.
const APARELHO_DE_ROBO = /Nexus 5X Build\/MMB29P/
const ehRobo = () => typeof navigator !== 'undefined' && (navigator.webdriver || ROBO.test(navigator.userAgent || '') || APARELHO_DE_ROBO.test(navigator.userAgent || ''))

function desligado() {
  if (ehRobo()) return true
  if (ler(localStorage, 'ldi-analytics-off') === '1') return true
  return typeof location !== 'undefined' && location.pathname.startsWith(ROTA_PAINEL)
}

export const ROTA_PAINEL = '/admin'

function visitante() {
  const chave = 'ldi-visitante'
  if (consentiu()) {
    let id = ler(localStorage, chave)
    const novo = !id
    if (!id) { id = aleatorio(); gravar(localStorage, chave, id) }
    return { id, novo }
  }
  let id = ler(sessionStorage, chave)
  if (!id) { id = aleatorio(); gravar(sessionStorage, chave, id) }
  return { id, novo: true }
}

function sessao() {
  const agora = Date.now()
  const ultima = Number(ler(sessionStorage, 'ldi-sessao-ult') || 0)
  let id = ler(sessionStorage, 'ldi-sessao')
  if (!id || agora - ultima > SESSAO_OCIOSA_MS) {
    id = aleatorio()
    gravar(sessionStorage, 'ldi-sessao', id)
    gravar(sessionStorage, 'ldi-sessao-origem', JSON.stringify(origemDaEntrada()))
  }
  gravar(sessionStorage, 'ldi-sessao-ult', String(agora))
  return id
}

// De onde a pessoa veio: gclid/utm primeiro, depois o referrer.
function origemDaEntrada() {
  const q = new URLSearchParams(location.search)
  if (q.get('gclid') || q.get('gbraid') || q.get('wbraid')) return { origem: 'google', midia: 'cpc', campanha: q.get('utm_campaign') }
  if (q.get('utm_source')) return { origem: q.get('utm_source'), midia: q.get('utm_medium') || 'utm', campanha: q.get('utm_campaign') }
  let host = ''
  try { host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '' } catch { host = '' }
  if (!host || host === location.hostname) return { origem: '(direto)', midia: '', referrer: '' }
  const busca = ['google', 'bing', 'yahoo', 'duckduckgo', 'yandex', 'ecosia'].find(b => host.includes(b))
  if (busca) return { origem: busca, midia: 'organico', referrer: host }
  const social = ['instagram', 'facebook', 'tiktok', 't.co', 'twitter', 'x.com', 'linkedin', 'lnkd', 'youtube', 'whatsapp', 'discord', 'reddit', 'steamcommunity']
    .find(s => host.includes(s))
  return { origem: host, midia: social ? 'social' : 'referencia', referrer: host }
}

// Aparelho o mais específico que o navegador deixa: Chrome/Android conta o
// modelo pela Client Hints; o resto sai do user agent.
async function aparelho() {
  const ua = navigator.userAgent
  const larg = screen.width, alt = screen.height, dpr = Math.round((devicePixelRatio || 1) * 10) / 10
  const tela = `${larg}x${alt}@${dpr}`
  let sistema = /Android ([\d.]+)/.exec(ua)?.[1] ? `Android ${/Android ([\d.]+)/.exec(ua)[1]}`
    : /(iPhone|iPad|iPod).*OS ([\d_]+)/.exec(ua) ? `iOS ${/OS ([\d_]+)/.exec(ua)[1].replace(/_/g, '.')}`
    : /Windows NT 10/.test(ua) ? 'Windows 10/11' : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X ([\d_]+)/.exec(ua) ? `macOS ${/Mac OS X ([\d_]+)/.exec(ua)[1].replace(/_/g, '.')}`
    : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : '?'
  const navegador = /Edg\/(\d+)/.exec(ua) ? `Edge ${/Edg\/(\d+)/.exec(ua)[1]}`
    : /OPR\/(\d+)/.exec(ua) ? `Opera ${/OPR\/(\d+)/.exec(ua)[1]}`
    : /SamsungBrowser\/(\d+)/.exec(ua) ? `Samsung Internet ${/SamsungBrowser\/(\d+)/.exec(ua)[1]}`
    : /Firefox\/(\d+)/.exec(ua) ? `Firefox ${/Firefox\/(\d+)/.exec(ua)[1]}`
    : /CriOS\/(\d+)/.exec(ua) ? `Chrome iOS ${/CriOS\/(\d+)/.exec(ua)[1]}`
    : /Chrome\/(\d+)/.exec(ua) ? `Chrome ${/Chrome\/(\d+)/.exec(ua)[1]}`
    : /Version\/([\d.]+).*Safari/.exec(ua) ? `Safari ${/Version\/([\d.]+)/.exec(ua)[1]}` : '?'
  let modelo = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : (/Android [\d.]+; ([^;)]+)/.exec(ua)?.[1] || null)
  if (modelo === 'K') modelo = null // Android novo esconde o modelo no UA
  try {
    const hints = await navigator.userAgentData?.getHighEntropyValues?.(['model', 'platformVersion'])
    if (hints?.model) modelo = hints.model
    if (hints?.platformVersion && navigator.userAgentData?.platform === 'Android') sistema = `Android ${hints.platformVersion.split('.')[0]}`
    if (hints?.platformVersion && navigator.userAgentData?.platform === 'Windows') sistema = Number(hints.platformVersion.split('.')[0]) >= 13 ? 'Windows 11' : 'Windows 10'
  } catch { /* navegador sem Client Hints */ }
  const toque = matchMedia('(pointer: coarse)').matches
  const dispositivo = /iPad|Tablet/.test(ua) || (toque && Math.min(larg, alt) >= 600) ? 'tablet' : toque || /Mobi/.test(ua) ? 'celular' : 'desktop'
  return { dispositivo, sistema, navegador, modelo, tela }
}

// País pelo fuso do aparelho: não sai nada do navegador (nem IP), então vale
// até pra quem não aceitou os cookies. Cidade/estado só com aceite (ipwho.is).
const FUSO_PAIS = {
  Sao_Paulo: 'Brazil', Bahia: 'Brazil', Fortaleza: 'Brazil', Recife: 'Brazil', Belem: 'Brazil', Manaus: 'Brazil', Cuiaba: 'Brazil',
  Campo_Grande: 'Brazil', Porto_Velho: 'Brazil', Boa_Vista: 'Brazil', Rio_Branco: 'Brazil', Maceio: 'Brazil', Araguaina: 'Brazil', Santarem: 'Brazil', Noronha: 'Brazil',
  Buenos_Aires: 'Argentina', Cordoba: 'Argentina', Mendoza: 'Argentina', Salta: 'Argentina', Montevideo: 'Uruguay', Asuncion: 'Paraguay', Santiago: 'Chile',
  Lima: 'Peru', Bogota: 'Colombia', Caracas: 'Venezuela', La_Paz: 'Bolivia', Guayaquil: 'Ecuador', Mexico_City: 'Mexico', Monterrey: 'Mexico', Havana: 'Cuba',
  New_York: 'United States', Chicago: 'United States', Denver: 'United States', Los_Angeles: 'United States', Phoenix: 'United States', Anchorage: 'United States', Detroit: 'United States',
  Toronto: 'Canada', Vancouver: 'Canada', Montreal: 'Canada', Edmonton: 'Canada', Winnipeg: 'Canada', Halifax: 'Canada',
  Lisbon: 'Portugal', Madrid: 'Spain', London: 'United Kingdom', Paris: 'France', Berlin: 'Germany', Rome: 'Italy', Amsterdam: 'Netherlands', Brussels: 'Belgium',
  Zurich: 'Switzerland', Vienna: 'Austria', Warsaw: 'Poland', Istanbul: 'Turkey', Moscow: 'Russia', Kiev: 'Ukraine', Kyiv: 'Ukraine', Athens: 'Greece', Dublin: 'Ireland',
  Luanda: 'Angola', Maputo: 'Mozambique', Johannesburg: 'South Africa', Lagos: 'Nigeria', Cairo: 'Egypt', Kampala: 'Uganda', Nairobi: 'Kenya', Casablanca: 'Morocco',
  Kolkata: 'India', Calcutta: 'India', Karachi: 'Pakistan', Dhaka: 'Bangladesh', Jakarta: 'Indonesia', Manila: 'Philippines', Bangkok: 'Thailand', Phnom_Penh: 'Cambodia',
  Tokyo: 'Japan', Seoul: 'South Korea', Shanghai: 'China', Hong_Kong: 'Hong Kong', Singapore: 'Singapore', Dubai: 'United Arab Emirates', Riyadh: 'Saudi Arabia',
  Muscat: 'Oman', Damascus: 'Syria', Tehran: 'Iran', Sydney: 'Australia', Melbourne: 'Australia', Auckland: 'New Zealand',
}
function paisDoFuso() {
  try {
    const fuso = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    return FUSO_PAIS[fuso.split('/').pop()] || (fuso ? `~${fuso}` : null)
  } catch { return null }
}

async function lugar() {
  if (!consentiu()) return { pais: paisDoFuso() }
  const salvo = ler(sessionStorage, 'ldi-lugar')
  if (salvo) { try { return JSON.parse(salvo) } catch { /* refaz */ } }
  try {
    const r = await fetch('https://ipwho.is/?fields=success,country,region,city', { cache: 'no-store' })
    const j = await r.json()
    const l = j?.success ? { pais: j.country, regiao: j.region, cidade: j.city } : { pais: paisDoFuso() }
    gravar(sessionStorage, 'ldi-lugar', JSON.stringify(l))
    return l
  } catch { return { pais: paisDoFuso() } }
}

async function montarContexto() {
  const [ap, lg] = await Promise.all([aparelho(), lugar()])
  const v = visitante()
  return { ...ap, ...lg, visitante: v.id, novo: v.novo, idioma: ler(localStorage, 'ldi-locale') || 'pt' }
}

function empurrar(evento) {
  if (desligado()) return
  const origem = (() => { try { return JSON.parse(ler(sessionStorage, 'ldi-sessao-origem') || '{}') } catch { return {} } })()
  // evento que fecha depois da troca de página (tempo de leitura) traz a
  // página dele em dados.page_path — senão caía na rota seguinte
  fila.push({ ...evento, sessao: sessao(), rota: evento.dados?.page_path || location.pathname, titulo: document.title?.slice(0, 200), ...origem, _t: Date.now() })
  if (!timerLote) timerLote = setTimeout(enviar, LOTE_MS)
}

async function enviar(saindo = false) {
  clearTimeout(timerLote); timerLote = null
  if (!fila.length) return
  if (!contexto) contexto = await montarContexto()
  const lote = fila.splice(0, 50).map(({ _t, ...e }) => ({ ...contexto, ...e }))
  if (saindo && SUPABASE_ANON) {
    // Fechando a aba: fetch keepalive sobrevive à página; o token do usuário
    // fica de fora (o supabase-js não roda síncrono), então sai como visitante.
    fetch(`${SUPABASE_URL}/rest/v1/rpc/painel_registrar`, {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
      body: JSON.stringify({ p_eventos: lote }),
    }).catch(() => {})
  } else {
    const { error } = await supabase.rpc('painel_registrar', { p_eventos: lote })
    if (error && !/painel_registrar/.test(error.message || '')) console.warn('[painel] coleta falhou:', error.message)
  }
  if (fila.length) timerLote = setTimeout(enviar, LOTE_MS)
}

export function painelPagina() { empurrar({ tipo: 'page' }) }

export function painelEvento(nome, dados) {
  if (nome === 'page_view') return
  empurrar({ tipo: 'evento', nome, dados })
}

export function iniciarPainelColeta() {
  if (iniciado || typeof window === 'undefined') return
  iniciado = true
  setInterval(() => { if (document.visibilityState === 'visible') empurrar({ tipo: 'ping' }) }, PING_MS)
  addEventListener('pagehide', () => enviar(true))
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') enviar(true) })
}
