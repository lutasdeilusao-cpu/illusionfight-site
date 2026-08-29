/* ═══════════════════════════════════════════════════════════════
   Service Worker — Illusion Fight
   1. Push notifications (Tamagoshi & cia)
   2. Cache de áudio da Rádio Nina (músicas + propagandas do R2)
      → 1ª vez: streama da rede e copia pro cache em segundo plano
      → repetição: serve do cache, sem gastar dados do usuário
   ═══════════════════════════════════════════════════════════════ */

const AUDIO_CACHE = 'nina-audio-v1'
const AUDIO_HOST = 'illusionfightsongs.lutasdeilusao.workers.dev'
const AUDIO_MAX_ENTRIES = 40 // ~40 faixas cacheadas; acima disso, remove as mais antigas

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

  // Só arquivos de áudio (têm extensão .mp3); listas JSON (/, /list, /ads/*) passam direto.
  if (!/\.mp3$/i.test(url.pathname)) return

  event.respondWith(servirAudio(event, request, url))
})

async function servirAudio(event, request, url) {
  const chave = url.origin + url.pathname // ignora querystring; a Range vai no header
  try {
    const cache = await caches.open(AUDIO_CACHE)
    const cheio = await cache.match(chave)

    if (cheio) {
      return responderComRange(cheio, request.headers.get('Range'))
    }

    // 1ª vez: não bloqueia a reprodução — streama da rede já, e baixa o arquivo
    // completo (fetch cors próprio) em paralelo pra ter no cache nas próximas.
    event.waitUntil(popularCache(cache, chave))
    return fetch(request)
  } catch {
    return fetch(request)
  }
}

async function popularCache(cache, chave) {
  try {
    if (await cache.match(chave)) return
    const resp = await fetch(chave, { mode: 'cors' }) // sem Range → 200 com o arquivo inteiro
    if (!resp || !resp.ok || resp.status !== 200) return
    await cache.put(chave, resp.clone())
    await podarCache(cache)
  } catch { /* rede caiu / quota estourou — ignora */ }
}

async function podarCache(cache) {
  try {
    const chaves = await cache.keys()
    if (chaves.length <= AUDIO_MAX_ENTRIES) return
    // sem timestamp por entrada; remove as primeiras (ordem de inserção ~ mais antigas)
    const excedente = chaves.length - AUDIO_MAX_ENTRIES
    for (let i = 0; i < excedente; i++) await cache.delete(chaves[i])
  } catch { /* noop */ }
}

/** Reconstrói uma resposta 206 a partir do arquivo inteiro cacheado (200). */
async function responderComRange(respCheia, rangeHeader) {
  if (!rangeHeader) return respCheia.clone()

  const buf = await respCheia.clone().arrayBuffer()
  const total = buf.byteLength
  const m = /bytes=(\d*)-(\d*)/.exec(rangeHeader)
  if (!m) return respCheia.clone()

  let inicio = m[1] === '' ? 0 : parseInt(m[1], 10)
  let fim = m[2] === '' ? total - 1 : parseInt(m[2], 10)
  if (Number.isNaN(inicio) || inicio < 0) inicio = 0
  if (Number.isNaN(fim) || fim >= total) fim = total - 1
  if (inicio > fim) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } })
  }

  const pedaco = buf.slice(inicio, fim + 1)
  const ct = respCheia.headers.get('Content-Type') || 'audio/mpeg'
  return new Response(pedaco, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': ct,
      'Content-Length': String(pedaco.byteLength),
      'Content-Range': `bytes ${inicio}-${fim}/${total}`,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
