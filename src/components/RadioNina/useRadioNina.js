import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { trackEvent } from '../../lib/analytics'
import CONFIG from './radio-nina.config.json'
import { carregarPlaylistSalva, salvarPlaylistSalva } from './radio-nina.playlist'

const {
  base: BASE, cores: CORES, aberturas: ABERTURAS, excluir: EXCLUIR, titulos: TITULOS,
  musicas_por_ad: MUSICAS_POR_AD = 2, ads_pastas: ADS_PASTAS = {},
} = CONFIG
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

const TIERS_SEM_AD = ['elite', 'primordial', 'moderator', 'admin']

export function useRadioNina() {
  const { user, perfil } = useAuth()
  const semAds = perfil?.is_admin === true || TIERS_SEM_AD.includes(perfil?.tier)

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
  // Propagandas: pool do idioma + shuffle-bag sem repetir a última, 1 a cada N músicas
  const adsRef = useRef([])
  const adsLangRef = useRef(null)
  const adBagRef = useRef([])
  const ultimoAdRef = useRef(null)
  const contadorRef = useRef(0)
  const emAdRef = useRef(false)
  const errosRef = useRef(0)
  const desligadoRef = useRef(false) // true entre fechar() e a próxima ligação: silencia error/ended
  const semAdsRef = useRef(semAds)
  useEffect(() => { semAdsRef.current = semAds }, [semAds])
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

  // Recarrega o pool de propaganda sempre que o idioma do site mudou.
  const garantirAds = useCallback(async () => {
    if (semAdsRef.current) return
    const lang = localStorage.getItem('ldi-locale') || 'pt'
    if (adsRef.current.length && adsLangRef.current === lang) return
    try {
      const res = await fetch(`${BASE}/ads/${lang}`)
      if (!res.ok) return
      const { ads } = await res.json()
      adsLangRef.current = lang
      adBagRef.current = []
      if (!Array.isArray(ads) || !ads.length) { adsRef.current = []; return }
      const folder = ADS_PASTAS[lang] || ADS_PASTAS.pt || 'MaketingBR'
      adsRef.current = ads.map((a) => ({ key: a.key, url: `${BASE}/${folder}/${encodeURIComponent(a.key)}` }))
    } catch (err) {
      console.warn(err)
    }
  }, [])

  const proximoAd = useCallback(() => {
    const todos = adsRef.current
    if (!todos.length) return null
    if (!adBagRef.current.length) {
      const bag = embaralhar(todos)
      if (bag.length > 1 && bag[0].key === ultimoAdRef.current) [bag[0], bag[1]] = [bag[1], bag[0]]
      adBagRef.current = bag
    }
    const ad = adBagRef.current.shift()
    ultimoAdRef.current = ad.key
    return ad
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
    desligadoRef.current = false
    idxRef.current = i
    origemRef.current = origem
    if (audio.src !== track.url) audio.src = track.url
    setFaixaAtual({ key: track.key, titulo: track.titulo })
    setTempo(0)
    setDuracao(0)
    atualizarMediaSession(track.titulo)
    try { await audio.play() } catch { setTocando(false) }
    // Mantém o pool de propaganda quente e no idioma certo, pra que o próximo
    // anúncio possa ser disparado de forma síncrona (ver avancar()).
    if (!semAdsRef.current) garantirAds()
  }, [atualizarMediaSession, garantirAds])

  const tocarAd = useCallback(() => {
    const ad = proximoAd()
    const audio = audioRef.current
    if (!ad || !audio) return false
    desligadoRef.current = false
    emAdRef.current = true
    origemRef.current = 'ad'
    audio.src = ad.url
    setFaixaAtual({ key: 'ad', ad: true })
    setTempo(0)
    setDuracao(0)
    atualizarMediaSession('Publicidade')
    trackEvent('radio_ad', { ad: ad.key, lang: localStorage.getItem('ldi-locale') || 'pt' })
    // Corrida src/play do Chrome dispara AbortError inofensivo (o áudio toca ao
    // carregar). Só ignoramos: NUNCA pulamos o anúncio — o usuário tem que ouvir.
    // Erro real de autoplay deixa a barra pausada com ▶ pra ele dar play.
    const p = audio.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
    return true
  }, [proximoAd, atualizarMediaSession])

  const ligar = useCallback(async (origem = 'auto') => {
    await Promise.all([garantirPool(), garantirAds()])
    filaRef.current = filaComAbertura(poolRef.current, localeRef.current)
    contadorRef.current = 0
    emAdRef.current = false
    setEstado('barra')
    trackEvent('radio_ligar', { origem })
    tocarIndice(0, origem === 'auto' ? 'abertura' : origem)
  }, [garantirPool, garantirAds, tocarIndice])

  // Progressão natural (fim da faixa): decide entre próxima música ou propaganda
  const avancar = useCallback(() => {
    const total = filaRef.current.length
    const proximaMusica = () => { if (total) tocarIndice((idxRef.current + 1) % total, 'auto') }
    if (emAdRef.current) { emAdRef.current = false; proximaMusica(); return }
    if (semAdsRef.current) { proximaMusica(); return }

    contadorRef.current += 1
    if (contadorRef.current < MUSICAS_POR_AD) { proximaMusica(); return }
    contadorRef.current = 0
    // Chrome Android só deixa o áudio tocar sozinho se o play() sair SÍNCRONO de
    // dentro do handler de 'ended'. O pool de ads já vem sendo mantido quente por
    // garantirAds() a cada música — então tocamos direto aqui. Só caímos no fetch
    // assíncrono (que pode travar o autoplay) se o pool ainda não estiver em memória.
    if (adsRef.current.length) {
      if (!tocarAd()) proximaMusica()
    } else {
      garantirAds().then(() => { if (!tocarAd()) proximaMusica() })
    }
  }, [tocarIndice, tocarAd, garantirAds])

  const pular = useCallback((delta, origem = 'user') => {
    const total = filaRef.current.length
    if (!total) return
    if (origem === 'user' && !emAdRef.current) {
      const atual = filaRef.current[idxRef.current]
      if (atual) trackEvent('radio_pular', { musica: atual.titulo })
    }
    emAdRef.current = false
    tocarIndice((idxRef.current + delta + total) % total, 'auto')
  }, [tocarIndice])

  const alternar = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (tocandoRef.current) audio.pause()
    else if (audio.src) audio.play().catch(() => {})
    else ligar('escolha')
  }, [ligar])

  // Fechar de vez: para o áudio, some com a rádio e não pergunta de novo nesta sessão.
  const fechar = useCallback(() => {
    desligadoRef.current = true
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src') // '' dispara evento 'error' em alguns browsers; remover não
      try { audio.load() } catch { /* noop */ }
    }
    emAdRef.current = false
    contadorRef.current = 0
    setTocando(false)
    setFaixaAtual(null)
    setEstado('oculto')
    memoriaSessao = 'recusou'
    trackEvent('radio_fechar', {})
  }, [])

  const tocarKey = useCallback(async (key) => {
    await garantirPool()
    const track = poolRef.current.find((t) => t.key === key)
    if (!track) return
    filaRef.current = [track, ...embaralhar(poolRef.current.filter((t) => t.key !== key))]
    contadorRef.current = 0
    emAdRef.current = false
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
    contadorRef.current = 0
    emAdRef.current = false
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
      errosRef.current = 0
      if (emAdRef.current) return
      const atual = filaRef.current[idxRef.current]
      if (atual && anunciadaRef.current !== atual.key) {
        anunciadaRef.current = atual.key
        localStorage.setItem(OUVIU_STORAGE, '1')
        trackEvent('radio_play', { musica: atual.titulo, origem: origemRef.current })
      }
    }
    const onPause = () => setTocando(false)
    const onEnded = () => {
      if (desligadoRef.current) return
      if (!emAdRef.current) {
        const atual = filaRef.current[idxRef.current]
        if (atual) trackEvent('radio_completa', { musica: atual.titulo })
      }
      avancar()
    }
    // Faixa (ou propaganda) não carregou → nunca travar a rádio: segue pra próxima música.
    const onError = () => {
      if (desligadoRef.current) return
      const total = filaRef.current.length
      if (!total) return
      errosRef.current += 1
      if (errosRef.current > 4) { emAdRef.current = false; setTocando(false); return }
      emAdRef.current = false
      tocarIndice((idxRef.current + 1) % total, 'auto')
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.src = ''
    }
  }, [avancar, tocarIndice])

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

  useEffect(() => { garantirPool(); garantirAds() }, [garantirPool, garantirAds])
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
    ligar, alternar, pular, fechar, tocarKey, tocarMinhaPlaylist, seek, salvar,
  }
}
