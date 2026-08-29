/* ═══════════════════════════════════════════════════════════════
   Service Worker — Illusion Fight
   1. Push notifications (Tamagoshi & cia)
   2. Cache de áudio da Rádio Nina (músicas + propagandas do R2)
      • 1ª vez: baixa uma vez só — serve pro player E grava no disco ao
        mesmo tempo (tee), sem download duplicado
      • repetição: streama direto do Cache Storage (disco), sem rede e
        sem carregar o arquivo em RAM
   ═══════════════════════════════════════════════════════════════ */

const AUDIO_CACHE = 'nina-audio-v1'
const AUDIO_HOST = 'illusionfightsongs.lutasdeilusao.workers.dev'
const AUDIO_MAX_ENTRIES = 25             // faixas no cache de disco; acima disso poda as mais antigas
const AUDIO_MAX_BYTES = 15 * 1024 * 1024 // não cacheia arquivo acima de 15 MB
const gravando = new Set()              // chaves com cache.put em voo (evita gravação duplicada)

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const nomes = await caches.keys()
    await Promise.all(nomes.filter((n) => n.startsWith('nina-audio-') && n !== AUDIO_CACHE).map((n) => caches.delete(n)))
    await self.clients.claim()
  })())
})

// ── Push ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data.json()
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/favicon-ldi.png',
    badge: '/favicon-ldi.png',
    tag: 'tamagoshi',
    renotify: true,
    data: { url: data.url },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})

// ── Cache de áudio ──────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  let url
  try { url = new URL(request.url) } catch { return }
  if (url.hostname !== AUDIO_HOST) return
  if (!/\.mp3$/i.test(url.pathname)) return // listas JSON passam direto

  event.respondWith(servirAudio(event, request, url))
})

async function servirAudio(event, request, url) {
  const chave = url.origin + url.pathname // ignora querystring; a Range vai no header
  try {
    const cache = await caches.open(AUDIO_CACHE)
    const doDisco = await cache.match(chave)
    if (doDisco) return responderComRange(doDisco, request.headers.get('Range'))

    // Não cacheado: baixa UMA vez (cors, legível) e faz tee — uma via pro
    // player, outra pro disco.
    const net = await fetch(chave, { mode: 'cors' })
    if (net && net.ok && net.status === 200) {
      const tam = Number(net.headers.get('Content-Length') || 0)
      if (tam && tam <= AUDIO_MAX_BYTES && !gravando.has(chave)) {
        gravando.add(chave)
        event.waitUntil(
          cache.put(chave, net.clone())
            .then(() => podarCache(cache))
            .catch(() => {})
            .finally(() => gravando.delete(chave)),
        )
      }
      return responderComRange(net, request.headers.get('Range'))
    }
    return fetch(request)
  } catch {
    return fetch(request)
  }
}

async function podarCache(cache) {
  try {
    const chaves = await cache.keys()
    const excedente = chaves.length - AUDIO_MAX_ENTRIES
    for (let i = 0; i < excedente; i++) await cache.delete(chaves[i]) // ordem de inserção ~ mais antigas
  } catch { /* noop */ }
}

/**
 * Serve uma faixa (do cache ou do fetch cors).
 * Caminho comum (sem Range, ou "bytes=0-" cobrindo o arquivo todo): devolve o
 * corpo em STREAMING, sem alocar o arquivo em memória. Só um seek real (range
 * no meio) faz o slice — buffer temporário e único.
 */
function responderComRange(resp, rangeHeader) {
  const total = Number(resp.headers.get('Content-Length')) || 0

  if (!rangeHeader) return resp.clone()

  const m = /bytes=(\d*)-(\d*)/.exec(rangeHeader)
  if (!m) return resp.clone()

  const inicio = m[1] === '' ? 0 : parseInt(m[1], 10)
  const fim = m[2] === '' ? (total ? total - 1 : NaN) : parseInt(m[2], 10)

  const cobreTudo = inicio === 0 && (Number.isNaN(fim) || !total || fim >= total - 1)
  if (cobreTudo) {
    if (!total) return resp.clone()
    const h = new Headers(resp.headers)
    h.set('Content-Range', `bytes 0-${total - 1}/${total}`)
    h.set('Content-Length', String(total))
    h.set('Accept-Ranges', 'bytes')
    return new Response(resp.clone().body, { status: 206, statusText: 'Partial Content', headers: h })
  }

  // Seek real (raro): fatia.
  return resp.clone().arrayBuffer().then((buf) => {
    let ini = Number.isNaN(inicio) || inicio < 0 ? 0 : inicio
    let f = Number.isNaN(fim) || fim >= buf.byteLength ? buf.byteLength - 1 : fim
    if (ini > f) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${buf.byteLength}` } })
    const pedaco = buf.slice(ini, f + 1)
    return new Response(pedaco, {
      status: 206,
      statusText: 'Partial Content',
      headers: {
        'Content-Type': resp.headers.get('Content-Type') || 'audio/mpeg',
        'Content-Length': String(pedaco.byteLength),
        'Content-Range': `bytes ${ini}-${f}/${buf.byteLength}`,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
      },
    })
  })
}
