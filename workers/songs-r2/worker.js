/**
 * songs-r2 — serve os MP3 do bucket R2 `songsillusionfight` (prefixo Songs/)
 * para o player de música do site (Nina).
 *
 * Rotas:
 *   GET /            → JSON { tracks: [{ key, size, uploaded }] }  (só .mp3)
 *   GET /list        → idem
 *   GET /<arquivo>.mp3        → stream do MP3 (aceita "Songs/" no caminho ou não)
 *   HEAD /<arquivo>.mp3       → metadados
 *   OPTIONS *        → preflight CORS
 *
 * Binding necessário no Worker: R2 bucket  →  variável `BUCKET`  →  bucket `songsillusionfight`
 */

const PREFIX = 'Songs/'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, Content-Type',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, ETag',
  'Access-Control-Max-Age': '86400',
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: CORS })
    }

    const url = new URL(request.url)
    const path = decodeURIComponent(url.pathname.slice(1))

    // ── Playlist JSON ──────────────────────────────────────────────
    if (path === '' || path === 'list' || url.searchParams.has('list')) {
      const listed = await env.BUCKET.list({ prefix: PREFIX })
      const tracks = listed.objects
        .filter(o => o.key.toLowerCase().endsWith('.mp3'))
        .map(o => ({ key: o.key.slice(PREFIX.length), size: o.size, uploaded: o.uploaded }))
        .sort((a, b) => a.key.localeCompare(b.key, 'pt'))
      return new Response(JSON.stringify({ tracks }, null, 2), {
        headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
      })
    }

    // ── Stream de um arquivo ───────────────────────────────────────
    const key = path.startsWith(PREFIX) ? path : PREFIX + path

    const rangeHeader = request.headers.get('Range')
    let range
    if (rangeHeader) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim())
      if (m) {
        const start = m[1] === '' ? undefined : Number(m[1])
        const end = m[2] === '' ? undefined : Number(m[2])
        if (start !== undefined && end !== undefined) range = { offset: start, length: end - start + 1 }
        else if (start !== undefined) range = { offset: start }
        else if (end !== undefined) range = { suffix: end }
      }
    }

    const object = await env.BUCKET.get(key, range ? { range } : undefined)
    if (object === null || object.body === undefined) {
      return new Response('Not Found', { status: 404, headers: CORS })
    }

    const headers = new Headers(CORS)
    object.writeHttpMetadata(headers)
    headers.set('ETag', object.httpEtag)
    headers.set('Accept-Ranges', 'bytes')
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'audio/mpeg')
    if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'public, max-age=86400')

    let status = 200
    if (object.range) {
      const total = object.size
      const offset = object.range.offset ?? 0
      const length = object.range.length ?? total - offset
      headers.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${total}`)
      headers.set('Content-Length', String(length))
      status = 206
    } else {
      headers.set('Content-Length', String(object.size))
    }

    if (request.method === 'HEAD') return new Response(null, { status, headers })
    return new Response(object.body, { status, headers })
  },
}
