import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { trackEvent } from '../../lib/analytics'
import CONFIG from './radio-nina.config.json'
import { carregarPlaylistSalva, salvarPlaylistSalva } from './radio-nina.playlist'
import ninaArt from '../../assets/images/characters/nina-balloon.png'

// Capa pra tela de bloqueio / notificação de mídia (MediaSession).
const MS_ARTWORK = ['96x96', '128x128', '192x192', '256x256', '384x384', '512x512']
  .map((sizes) => ({ src: ninaArt, sizes, type: 'image/png' }))

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
  const avancouRef = useRef(false) // já disparou a virada desta faixa? (dedup ended vs watchdog)
  const querTocarRef = useRef(false) // intenção: usuário quer a rádio tocando (mesmo que agora esteja parada)
  const trocandoRef = useRef(false) // troca de faixa em curso — ignora o 'pause' transitório do swap de src
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

  // Monta o shuffle-bag de propaganda com antecedência (chamado já no ligar()).
  const prepararAdBag = useCallback(() => {
    const todos = adsRef.current
    if (!todos.length || adBagRef.current.length) return
    const bag = embaralhar(todos)
    if (bag.length > 1 && bag[0].key === ultimoAdRef.current) [bag[0], bag[1]] = [bag[1], bag[0]]
    adBagRef.current = bag
  }, [])

  const proximoAd = useCallback(() => {
    if (!adsRef.current.length) return null
    prepararAdBag()
    const ad = adBagRef.current.shift()
    if (!ad) return null
    ultimoAdRef.current = ad.key
    return ad
  }, [prepararAdBag])

  // Aquece a próxima URL: baixa e joga no ralo (memória mínima — 1 chunk por vez
  // via WritableStream), o que faz o Service Worker terminar de gravar o arquivo
  // no cache de disco. É 1 faixa de lookahead; tudo fica cacheado pra sempre.
  // Respeita "economia de dados" do sistema.
  const prefetchRef = useRef(new Set())
  const prefetch = useCallback((url) => {
    if (!url || prefetchRef.current.has(url)) return
    if (navigator.connection?.saveData) return
    prefetchRef.current.add(url)
    fetch(url)
      .then((r) => (r.body?.pipeTo ? r.body.pipeTo(new WritableStream()) : null))
      .catch(() => {})
  }, [])

  const atualizarMediaSession = useCallback((titulo, ad = false) => {
    if (!('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: titulo,
        artist: ad ? 'Publicidade' : 'Isaias Leal',
        album: 'Rádio Nina · Illusion Fight',
        artwork: MS_ARTWORK,
      })
    } catch { /* noop */ }
  }, [])

  // play() com 1 retry curto — em segundo plano / tela bloqueada o 1º play
  // pode falhar de forma transitória logo após trocar o src.
  const tentarPlay = useCallback(async (audio) => {
    try { await audio.play(); return true } catch { /* retry abaixo */ }
    await new Promise((r) => setTimeout(r, 300))
    // Se falhar de novo NÃO derruba o estado: querTocarRef segue true e a
    // recuperação (canplay / voltar pro foreground) toca quando der.
    try { await audio.play(); return true } catch { return false }
  }, [])

  const tocarIndice = useCallback(async (i, origem = 'auto') => {
    const track = filaRef.current[i]
    const audio = audioRef.current
    if (!track || !audio) return
    desligadoRef.current = false
    avancouRef.current = false
    querTocarRef.current = true
    trocandoRef.current = true
    idxRef.current = i
    origemRef.current = origem
    if (audio.src !== track.url) audio.src = track.url
    setFaixaAtual({ key: track.key, titulo: track.titulo })
    setTempo(0)
    setDuracao(0)
    atualizarMediaSession(track.titulo)
    tentarPlay(audio)
    setTimeout(() => { trocandoRef.current = false }, 1500)
    // Mantém o pool de propaganda quente e no idioma certo, pra que o próximo
    // anúncio possa ser disparado de forma síncrona (ver avancar()).
    if (!semAdsRef.current) garantirAds()
    // Aquece o cache da próxima faixa e, se for a vez do anúncio, do anúncio.
    const total = filaRef.current.length
    if (total > 1) prefetch(filaRef.current[(i + 1) % total]?.url)
    if (!semAdsRef.current && contadorRef.current + 1 >= MUSICAS_POR_AD) {
      prepararAdBag()
      prefetch(adBagRef.current[0]?.url)
    }
  }, [atualizarMediaSession, garantirAds, prefetch, prepararAdBag, tentarPlay])

  const tocarAd = useCallback(() => {
    const ad = proximoAd()
    const audio = audioRef.current
    if (!ad || !audio) return false
    desligadoRef.current = false
    avancouRef.current = false
    querTocarRef.current = true
    trocandoRef.current = true
    setTimeout(() => { trocandoRef.current = false }, 1500)
    emAdRef.current = true
    origemRef.current = 'ad'
    audio.src = ad.url
    setFaixaAtual({ key: 'ad', ad: true })
    setTempo(0)
    setDuracao(0)
    atualizarMediaSession('Publicidade', true)
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
    prepararAdBag() // shuffle da propaganda já na largada
    setEstado('barra')
    trackEvent('radio_ligar', { origem })
    tocarIndice(0, origem === 'auto' ? 'abertura' : origem)
  }, [garantirPool, garantirAds, tocarIndice, prepararAdBag])

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
    if (tocandoRef.current) { querTocarRef.current = false; audio.pause() }
    else if (audio.src) { querTocarRef.current = true; audio.play().catch(() => {}) }
    else ligar('escolha')
  }, [ligar])

  // Fechar de vez: para o áudio, some com a rádio e não pergunta de novo nesta sessão.
  const fechar = useCallback(() => {
    desligadoRef.current = true
    querTocarRef.current = false
    trocandoRef.current = false
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
    if (audio && Number.isFinite(segundos)) {
      audio.currentTime = segundos
      setTempo(segundos) // resposta imediata do slider (o timeupdate é throttled)
    }
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

    let ultimoSeg = -1
    const onTime = () => {
      const t = audio.currentTime || 0
      const dur = audio.duration || 0
      // Watchdog de virada (todo tick): em segundo plano o 'ended' às vezes não
      // dispara. Quando faltam ~0.4s, viramos a faixa na mão.
      if (!avancouRef.current && !desligadoRef.current && dur > 0 && t >= dur - 0.4) {
        avancouRef.current = true
        if (!emAdRef.current) {
          const atual = filaRef.current[idxRef.current]
          if (atual) trackEvent('radio_completa', { musica: atual.titulo })
        }
        avancar()
        return
      }
      // React/mediaSession só ~1x por segundo (timeupdate dispara ~4x/s).
      const seg = Math.floor(t)
      if (seg === ultimoSeg) return
      ultimoSeg = seg
      setTempo(t)
      if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && dur > 0) {
        try { navigator.mediaSession.setPositionState({ duration: dur, position: Math.min(t, dur) }) } catch { /* noop */ }
      }
    }
    const onMeta = () => setDuracao(audio.duration || 0)
    // Carregou (talvez após um stall em segundo plano): se o usuário quer ouvir
    // e está parado, dá play. É o que reata a rádio depois da propaganda quando
    // o 1º play() da faixa seguinte não pegou.
    const onCanPlay = () => {
      if (querTocarRef.current && !desligadoRef.current && audio.paused) {
        audio.play().catch(() => {})
      }
    }
    const onPlay = () => {
      trocandoRef.current = false
      setTocando(true)
      errosRef.current = 0
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
      if (emAdRef.current) return
      const atual = filaRef.current[idxRef.current]
      if (atual && anunciadaRef.current !== atual.key) {
        anunciadaRef.current = atual.key
        localStorage.setItem(OUVIU_STORAGE, '1')
        trackEvent('radio_play', { musica: atual.titulo, origem: origemRef.current })
      }
    }
    const onPause = () => {
      if (trocandoRef.current) return // 'pause' transitório do swap de src — não é o usuário pausando
      setTocando(false)
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
    }
    const onEnded = () => {
      if (desligadoRef.current || avancouRef.current) return
      avancouRef.current = true
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
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('loadeddata', onCanPlay)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('loadeddata', onCanPlay)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.removeAttribute('src')
      try { audio.load() } catch { /* noop */ }
    }
  }, [avancar, tocarIndice])

  // Controles de mídia do sistema
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    const set = (a, h) => { try { ms.setActionHandler(a, h) } catch { /* noop */ } }
    set('play', () => { querTocarRef.current = true; audioRef.current?.play().catch(() => {}) })
    set('pause', () => { querTocarRef.current = false; audioRef.current?.pause() })
    set('nexttrack', () => pular(1, 'user'))
    set('previoustrack', () => pular(-1, 'user'))
    set('stop', () => fechar())
    set('seekto', (d) => {
      const audio = audioRef.current
      if (audio && Number.isFinite(d?.seekTime)) audio.currentTime = d.seekTime
    })
    return () => ['play', 'pause', 'nexttrack', 'previoustrack', 'stop', 'seekto'].forEach((a) => set(a, null))
  }, [pular, fechar])

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

  // Retoma quando volta pro foreground (ou o áudio fica pronto após um stall):
  // baseia-se na INTENÇÃO (querTocarRef), não no estado atual — o play() da faixa
  // seguinte pode não ter pego em segundo plano.
  useEffect(() => {
    const retomar = () => {
      const audio = audioRef.current
      if (querTocarRef.current && !desligadoRef.current && audio && audio.paused && audio.src) {
        audio.play().catch(() => {})
      }
    }
    const onVis = () => { if (document.visibilityState === 'visible') retomar() }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', retomar)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('focus', retomar)
    }
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
