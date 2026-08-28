import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import ninaImg from '../../assets/images/characters/nina-balloon.png'
import CONFIG from './radio-nina.config.json'
import STRINGS from './radio-nina.i18n.json'
import './RadioNina.css'

const { base: BASE, cores: CORES, excluir: EXCLUIR, titulos: TITULOS } = CONFIG
const COR_STORAGE = 'ldi-radio-nina-cor'

/** Estado da sessão: null (nunca perguntou) | 'aceitou' | 'recusou'. Reseta em F5. */
let memoriaSessao = null

const tituloDe = (key) => TITULOS[key] || key.replace(/\.mp3$/i, '')

function embaralhar(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function buscarFaixas() {
  const res = await fetch(`${BASE}/?list`)
  if (!res.ok) throw new Error(`radio-nina: lista ${res.status}`)
  const { tracks } = await res.json()
  return embaralhar(
    tracks
      .filter((t) => !EXCLUIR.includes(t.key))
      .map((t) => ({ url: `${BASE}/${encodeURIComponent(t.key)}`, titulo: tituloDe(t.key) })),
  )
}

function conviteDe(pathname, S) {
  if (pathname.startsWith('/games/')) return S.convite.game
  if (pathname.startsWith('/livro/') || pathname.startsWith('/webtoon/')) return S.convite.reading
  return S.convite.default
}

export default function RadioNina() {
  const { locale } = useLanguage()
  const S = STRINGS[locale] || STRINGS.pt
  const location = useLocation()

  const [estado, setEstado] = useState('oculto') // oculto | barra | mini
  const [tocando, setTocando] = useState(false)
  const [faixa, setFaixa] = useState('')
  const [cor, setCor] = useState(() => localStorage.getItem(COR_STORAGE) || CORES[0])
  const [paletaAberta, setPaletaAberta] = useState(false)

  const audioRef = useRef(null)
  const faixasRef = useRef([])
  const idxRef = useRef(0)
  const carregandoRef = useRef(false)
  const respondidaRef = useRef(memoriaSessao !== null)
  const aceitouRef = useRef(memoriaSessao === 'aceitou')
  const tocandoRef = useRef(false)
  useEffect(() => { tocandoRef.current = tocando }, [tocando])

  // ── Motor de áudio ────────────────────────────────────────────
  const garantirFaixas = useCallback(async () => {
    if (faixasRef.current.length || carregandoRef.current) return
    carregandoRef.current = true
    try {
      faixasRef.current = await buscarFaixas()
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
        title: titulo,
        artist: 'Isaias Leal',
        album: S.nome,
        artwork: [{ src: ninaImg, sizes: '96x96', type: 'image/png' }],
      })
    } catch { /* noop */ }
  }, [S.nome])

  const tocarAtual = useCallback(async () => {
    await garantirFaixas()
    const track = faixasRef.current[idxRef.current]
    const audio = audioRef.current
    if (!track || !audio) return
    if (audio.src !== track.url) audio.src = track.url
    setFaixa(track.titulo)
    atualizarMediaSession(track.titulo)
    try { await audio.play() } catch { setTocando(false) }
  }, [garantirFaixas, atualizarMediaSession])

  const pular = useCallback((delta) => {
    const total = faixasRef.current.length
    if (!total) return
    idxRef.current = (idxRef.current + delta + total) % total
    tocarAtual()
  }, [tocarAtual])

  const alternar = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (tocandoRef.current) audio.pause()
    else if (audio.src) audio.play().catch(() => {})
    else tocarAtual()
  }, [tocarAtual])

  // <audio> + listeners
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audioRef.current = audio
    const onEnded = () => pular(1)
    const onPlay = () => setTocando(true)
    const onPause = () => setTocando(false)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.pause()
      audio.src = ''
    }
  }, [pular])

  // Controles de mídia do sistema (tela de bloqueio)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    const set = (a, h) => { try { ms.setActionHandler(a, h) } catch { /* noop */ } }
    set('play', () => tocarAtual())
    set('pause', () => audioRef.current?.pause())
    set('nexttrack', () => pular(1))
    set('previoustrack', () => pular(-1))
    return () => ['play', 'pause', 'nexttrack', 'previoustrack'].forEach((a) => set(a, null))
  }, [tocarAtual, pular])

  // Pré-carrega a lista assim que monta
  useEffect(() => { garantirFaixas() }, [garantirFaixas])

  // Já aceitou nesta sessão → retoma a barra
  useEffect(() => {
    if (!aceitouRef.current) return
    setEstado('barra')
    tocarAtual()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Convite da Nina após 30s (uma vez por sessão)
  useEffect(() => {
    if (respondidaRef.current) return
    const timer = setTimeout(() => {
      if (respondidaRef.current) return
      garantirFaixas()
      window.__ninaPendingNotification = {
        mensagem: conviteDe(location.pathname, S),
        sim: S.sim,
        nao: S.nao,
      }
      window.__ninaNotificationCb?.((sim) => {
        window.__ninaPendingNotification = null
        respondidaRef.current = true
        aceitouRef.current = sim
        memoriaSessao = sim ? 'aceitou' : 'recusou'
        if (sim) {
          setEstado('barra')
          tocarAtual()
        }
      })
    }, 30000)
    return () => clearTimeout(timer)
  }, [location.pathname, S, garantirFaixas, tocarAtual])

  // Retoma quando a aba volta ao foco
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && tocandoRef.current && audioRef.current?.paused) {
        audioRef.current.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Persiste a cor escolhida
  useEffect(() => { localStorage.setItem(COR_STORAGE, cor) }, [cor])

  // Avisa antes de recarregar com música tocando
  useEffect(() => {
    if (!tocando) return
    const bloquear = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', bloquear)
    return () => window.removeEventListener('beforeunload', bloquear)
  }, [tocando])

  if (estado === 'oculto') return null

  if (estado === 'mini') {
    return (
      <button
        className={`radio-nina-mini ${tocando ? 'radio-nina-mini--tocando' : ''}`}
        style={{ '--radio-cor': cor }}
        onClick={() => setEstado('barra')}
        aria-label={S.abrir}
      >
        <img src={ninaImg} alt="" className="radio-nina-mini__face" />
      </button>
    )
  }

  return (
    <aside className={`radio-nina ${tocando ? '' : 'radio-nina--pausado'}`} style={{ '--radio-cor': cor }}>
      <img src={ninaImg} alt="Nina" className="radio-nina__face" />

      <div className="radio-nina__now">
        <span className="radio-nina__label">{S.nome}</span>
        <div className="radio-nina__marquee">
          <span className="radio-nina__track">{faixa || '…'}</span>
        </div>
      </div>

      <div className="radio-nina__controls">
        <button className="radio-nina__btn" onClick={() => pular(-1)} aria-label={S.anterior}>⏮</button>
        <button className="radio-nina__btn radio-nina__btn--play" onClick={alternar} aria-label={tocando ? S.pause : S.play}>
          {tocando ? '⏸' : '▶'}
        </button>
        <button className="radio-nina__btn" onClick={() => pular(1)} aria-label={S.proxima}>⏭</button>
      </div>

      <div className="radio-nina__palette-wrap">
        <button
          className="radio-nina__btn radio-nina__swatch"
          onClick={() => setPaletaAberta((v) => !v)}
          aria-label={S.cor}
        />
        {paletaAberta && (
          <div className="radio-nina__palette">
            {CORES.map((c) => (
              <button
                key={c}
                className={`radio-nina__cor ${c === cor ? 'radio-nina__cor--ativa' : ''}`}
                style={{ background: c }}
                onClick={() => { setCor(c); setPaletaAberta(false) }}
                aria-label={c}
              />
            ))}
          </div>
        )}
      </div>

      <button className="radio-nina__btn radio-nina__close" onClick={() => setEstado('mini')} aria-label={S.minimizar}>▾</button>
    </aside>
  )
}
