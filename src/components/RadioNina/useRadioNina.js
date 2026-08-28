import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { trackEvent } from '../../lib/analytics'
import CONFIG from './radio-nina.config.json'
import { carregarPlaylistSalva, salvarPlaylistSalva } from './radio-nina.playlist'

const { base: BASE, cores: CORES, aberturas: ABERTURAS, excluir: EXCLUIR, titulos: TITULOS } = CONFIG
const COR_STORAGE = 'ldi-radio-nina-cor'
const VOL_STORAGE = 'ldi-radio-nina-vol'
const OUVIU_STORAGE = 'ldi-radio-nina-ouviu'
const ABERTURA_KEYS = Object.values(ABERTURAS)

/** Sessão: null (nunca perguntou) | 'aceitou' | 'recusou'. Reseta em F5. */
let memoriaSessao = null
export const marcarSessao = (v) => { memoriaSessao = v }
export const sessaoRespondida = () => memoriaSessao !== null

export const tituloDe = (key) => TITULOS[key] || key.replace(/\.mp3$/i, '')
export const CORES_RADIO = CORES

function embaralhar(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function buscarPool() {
  const res = await fetch(`${BASE}/?list`)
  if (!res.ok) throw new Error(`radio-nina: lista ${res.status}`)
  const { tracks } = await res.json()
  return tracks
    .filter((t) => !EXCLUIR.includes(t.key))
    .map((t) => ({ key: t.key, url: `${BASE}/${encodeURIComponent(t.key)}`, titulo: tituloDe(t.key) }))
}

function filaComAbertura(pool, locale) {
  const aberturaKey = ABERTURAS[locale] || ABERTURAS.pt
  const abertura = pool.find((t) => t.key === aberturaKey)
  const resto = embaralhar(pool.filter((t) => !ABERTURA_KEYS.includes(t.key)))
  return abertura ? [abertura, ...resto] : embaralhar(pool)
}

export function useRadioNina() {
  const { user } = useAuth()

  const [estado, setEstado] = useState('oculto') // oculto | barra | mini
  const [tocando, setTocando] = useState(false)
  const [faixaAtual, setFaixaAtual] = useState(null) // { key, titulo }
  const [tempo, setTempo] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const [cor, setCor] = useState(() => localStorage.getItem(COR_STORAGE) || CORES[0])
  const [volume, setVolume] = useState(() => {
    const v = parseFloat(localStorage.getItem(VOL_STORAGE))
    return Number.isFinite(v) ? v : 0.8
  })
  const [pool, setPool] = useState([])
  const [playlistSalva, setPlaylistSalva] = useState([])

  const audioRef = useRef(null)
  const poolRef = useRef([])
  const filaRef = useRef([])
  const idxRef = useRef(0)
  const carregandoRef = useRef(false)
  const localeRef = useRef(localStorage.getItem('ldi-locale') || 'pt')
  const origemRef = useRef('auto')
  const anunciadaRef = useRef(null)
  const tocandoRef = useRef(false)
  useEffect(() => { tocandoRef.current = tocando }, [tocando])

  const garantirPool = useCallback(async () => {
    if (poolRef.current.length || carregandoRef.current) return
    carregandoRef.current = true
    try {
      const p = await buscarPool()
      poolRef.current = p
      setPool(p)
    } catch (err) {
      console.warn(err)
    } finally {
      carregandoRef.current = false
    }
  }, [])

  const atualizarMediaSession = useCallback((titulo) => {
    if (!('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: titulo, artist: 'Isaias Leal', album: 'Rádio Nina',
      })
    } catch { /* noop */ }
  }, [])

  const tocarIndice = useCallback(async (i, origem = 'auto') => {
    const track = filaRef.current[i]
    const audio = audioRef.current
    if (!track || !audio) return
    idxRef.current = i
    origemRef.current = origem
    if (audio.src !== track.url) audio.src = track.url
    setFaixaAtual({ key: track.key, titulo: track.titulo })
    setTempo(0)
    setDuracao(0)
    atualizarMediaSession(track.titulo)
    try { await audio.play() } catch { setTocando(false) }
  }, [atualizarMediaSession])

  const ligar = useCallback(async (origem = 'auto') => {
    await garantirPool()
    filaRef.current = filaComAbertura(poolRef.current, localeRef.current)
    setEstado('barra')
    trackEvent('radio_ligar', { origem })
    tocarIndice(0, origem === 'auto' ? 'abertura' : origem)
  }, [garantirPool, tocarIndice])

  const pular = useCallback((delta, origem = 'user') => {
    const total = filaRef.current.length
    if (!total) return
    if (origem === 'user') {
      const atual = filaRef.current[idxRef.current]
      if (atual) trackEvent('radio_pular', { musica: atual.titulo })
    }
    tocarIndice((idxRef.current + delta + total) % total, 'auto')
  }, [tocarIndice])

  const alternar = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (tocandoRef.current) audio.pause()
    else if (audio.src) audio.play().catch(() => {})
    else ligar('escolha')
  }, [ligar])

  const tocarKey = useCallback(async (key) => {
    await garantirPool()
    const track = poolRef.current.find((t) => t.key === key)
    if (!track) return
    filaRef.current = [track, ...embaralhar(poolRef.current.filter((t) => t.key !== key))]
    if (estado === 'oculto') setEstado('barra')
    tocarIndice(0, 'escolha')
  }, [garantirPool, tocarIndice, estado])

  const tocarMinhaPlaylist = useCallback(async () => {
    await garantirPool()
    const tracks = playlistSalva
      .map((k) => poolRef.current.find((t) => t.key === k))
      .filter(Boolean)
    if (!tracks.length) return
    filaRef.current = embaralhar(tracks)
    if (estado === 'oculto') setEstado('barra')
    tocarIndice(0, 'playlist')
  }, [garantirPool, tocarIndice, playlistSalva, estado])

  const seek = useCallback((segundos) => {
    const audio = audioRef.current
    if (audio && Number.isFinite(segundos)) audio.currentTime = segundos
  }, [])

  const salvar = useCallback(async (faixas) => {
    if (!user?.id) return false
    const ok = await salvarPlaylistSalva(user.id, faixas)
    if (ok) {
      setPlaylistSalva(faixas)
      trackEvent('radio_playlist_salva', { qtd: faixas.length })
    }
    return ok
  }, [user?.id])

  // <audio> + listeners
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    const volInicial = parseFloat(localStorage.getItem(VOL_STORAGE))
    audio.volume = Number.isFinite(volInicial) ? volInicial : 0.8
    audioRef.current = audio

    const onTime = () => setTempo(audio.currentTime || 0)
    const onMeta = () => setDuracao(audio.duration || 0)
    const onPlay = () => {
      setTocando(true)
      const atual = filaRef.current[idxRef.current]
      if (atual && anunciadaRef.current !== atual.key) {
        anunciadaRef.current = atual.key
        localStorage.setItem(OUVIU_STORAGE, '1')
        trackEvent('radio_play', { musica: atual.titulo, origem: origemRef.current })
      }
    }
    const onPause = () => setTocando(false)
    const onEnded = () => {
      const atual = filaRef.current[idxRef.current]
      if (atual) trackEvent('radio_completa', { musica: atual.titulo })
      pular(1, 'auto')
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.pause()
      audio.src = ''
    }
  }, [pular])

  // Controles de mídia do sistema
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    const set = (a, h) => { try { ms.setActionHandler(a, h) } catch { /* noop */ } }
    set('play', () => audioRef.current?.play().catch(() => {}))
    set('pause', () => audioRef.current?.pause())
    set('nexttrack', () => pular(1, 'user'))
    set('previoustrack', () => pular(-1, 'user'))
    return () => ['play', 'pause', 'nexttrack', 'previoustrack'].forEach((a) => set(a, null))
  }, [pular])

  useEffect(() => { garantirPool() }, [garantirPool])
  useEffect(() => { localStorage.setItem(COR_STORAGE, cor) }, [cor])
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
    localStorage.setItem(VOL_STORAGE, String(volume))
  }, [volume])

  // Playlist salva do usuário
  useEffect(() => {
    if (!user?.id) { setPlaylistSalva([]); return }
    carregarPlaylistSalva(user.id).then(setPlaylistSalva)
  }, [user?.id])

  // Logado + já ouviu antes → sobe a barra automaticamente (uma vez por sessão)
  useEffect(() => {
    if (memoriaSessao !== null) return
    if (user?.id && localStorage.getItem(OUVIU_STORAGE) === '1') {
      memoriaSessao = 'aceitou'
      ligar('auto')
    }
  }, [user?.id, ligar])

  // Retoma ao focar a aba
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && tocandoRef.current && audioRef.current?.paused) {
        audioRef.current.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Aviso antes de recarregar tocando
  useEffect(() => {
    if (!tocando) return
    const bloquear = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', bloquear)
    return () => window.removeEventListener('beforeunload', bloquear)
  }, [tocando])

  return {
    estado, setEstado, tocando, faixaAtual, tempo, duracao, cor, setCor, volume, setVolume,
    pool, playlistSalva, logado: Boolean(user?.id),
    ligar, alternar, pular, tocarKey, tocarMinhaPlaylist, seek, salvar,
  }
}
