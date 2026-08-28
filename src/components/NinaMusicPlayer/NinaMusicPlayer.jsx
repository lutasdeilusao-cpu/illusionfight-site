import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import ninaImg from '../../assets/images/characters/nina-balloon.png'
import playlistConfig from '../../data/nina-playlist.json'
import './NinaMusicPlayer.css'

const { base: SONGS_BASE, excluir: EXCLUIR = [], titulos: TITULOS = {} } = playlistConfig

function tituloDe(key) {
  return TITULOS[key] || key.replace(/\.mp3$/i, '')
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function carregarPlaylist() {
  const res = await fetch(`${SONGS_BASE}/?list`)
  if (!res.ok) throw new Error(`playlist ${res.status}`)
  const { tracks } = await res.json()
  const faixas = tracks
    .filter(t => !EXCLUIR.includes(t.key))
    .map(t => ({
      url: `${SONGS_BASE}/${encodeURIComponent(t.key)}`,
      titulo: tituloDe(t.key),
    }))
  return shuffle(faixas)
}

function getGreetingKey(pathname) {
  if (pathname.startsWith('/games/')) return 'nina.greeting.game'
  if (pathname.startsWith('/livro/') || pathname.startsWith('/webtoon/')) return 'nina.greeting.reading'
  return 'nina.greeting.default'
}

/** Estado em memória: null (nunca perguntou), 'aceitou' ou 'recusou'.
 *  Reseta em qualquer F5/reload, persiste durante navegação SPA. */
let ninaMemoryState = null
const getNinaSessionState = () => ninaMemoryState
const setNinaSessionState = (val) => { ninaMemoryState = val }

export default function NinaMusicPlayer() {
  const [step, setStep] = useState('idle') // idle | player | hint
  const [playing, setPlaying] = useState(false)
  const [attention, setAttention] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [typedHint, setTypedHint] = useState('')
  const [hintTypingDone, setHintTypingDone] = useState(false)
  const [faixaAtual, setFaixaAtual] = useState('')

  const audioRef = useRef(null)
  const tracksRef = useRef([])
  const idxRef = useRef(0)
  const loadingRef = useRef(false)
  const wantsPlayRef = useRef(false)

  const sessionState = getNinaSessionState()
  const sessionRef = useRef(sessionState !== null)
  const aceitouRef = useRef(sessionState === 'aceitou')

  const location = useLocation()
  const { t } = useLanguage()
  const greetingKey = getGreetingKey(location.pathname)
  const timerRef = useRef(null)
  const playingRef = useRef(false)
  useEffect(() => { playingRef.current = playing }, [playing])

  // ── Motor de áudio ──────────────────────────────────────────────
  const ensurePlaylist = useCallback(async () => {
    if (tracksRef.current.length || loadingRef.current) return
    loadingRef.current = true
    try {
      tracksRef.current = await carregarPlaylist()
      idxRef.current = 0
    } catch (err) {
      console.warn('[NINA] falha ao carregar playlist:', err)
    } finally {
      loadingRef.current = false
    }
  }, [])

  const updateMediaSession = useCallback((titulo) => {
    if (!('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: titulo,
        artist: 'Isaias Leal',
        album: 'Lutas de Ilusão',
        artwork: [{ src: ninaImg, sizes: '96x96', type: 'image/png' }],
      })
    } catch (_) { /* ignore */ }
  }, [])

  const tocarAtual = useCallback(async () => {
    await ensurePlaylist()
    const track = tracksRef.current[idxRef.current]
    const audio = audioRef.current
    if (!track || !audio) return
    if (audio.src !== track.url) audio.src = track.url
    setFaixaAtual(track.titulo)
    updateMediaSession(track.titulo)
    try {
      await audio.play()
      setPlaying(true)
    } catch (_) {
      setPlaying(false)
    }
  }, [ensurePlaylist, updateMediaSession])

  const pular = useCallback((delta) => {
    const total = tracksRef.current.length
    if (!total) return
    idxRef.current = (idxRef.current + delta + total) % total
    tocarAtual()
  }, [tocarAtual])

  // Cria o <audio> uma vez e conecta os eventos
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audioRef.current = audio

    const onEnded = () => pular(1)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [pular])

  // MediaSession action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    try {
      ms.setActionHandler('play', () => tocarAtual())
      ms.setActionHandler('pause', () => { audioRef.current?.pause() })
      ms.setActionHandler('nexttrack', () => pular(1))
      ms.setActionHandler('previoustrack', () => pular(-1))
    } catch (_) { /* ignore */ }
    return () => {
      try {
        ms.setActionHandler('play', null)
        ms.setActionHandler('pause', null)
        ms.setActionHandler('nexttrack', null)
        ms.setActionHandler('previoustrack', null)
      } catch (_) { /* ignore */ }
    }
  }, [tocarAtual, pular])

  // Pré-carrega a playlist assim que o componente monta
  useEffect(() => { ensurePlaylist() }, [ensurePlaylist])

  // Auto-restart se o usuário já aceitou numa navegação anterior desta sessão
  useEffect(() => {
    if (aceitouRef.current) {
      wantsPlayRef.current = true
      tocarAtual()
      setTimeout(() => setStep('player'), 200)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Mostrar prompt da Nina após 30s (uma vez por sessão)
  useEffect(() => {
    if (sessionRef.current || aceitouRef.current) return
    if (step === 'player') return

    const timer = setTimeout(() => {
      if (sessionRef.current || aceitouRef.current || step === 'player') return
      ensurePlaylist()

      const mensagem = t(greetingKey)
      window.__ninaPendingNotification = { mensagem, greetingKey }

      if (typeof window.__ninaNotificationCb === 'function') {
        window.__ninaNotificationCb((resposta) => {
          window.__ninaPendingNotification = null
          if (resposta) handleSim()
          else handleNao()
        })
      }
    }, 30000)
    timerRef.current = timer
    return () => clearTimeout(timer)
  }, [greetingKey, t, step]) // eslint-disable-line react-hooks/exhaustive-deps

  // Retoma quando a aba volta a ficar visível
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && playingRef.current) {
        const audio = audioRef.current
        if (audio && audio.paused) audio.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Typewriter da dica
  useEffect(() => {
    if (step !== 'hint' || !showHint) {
      setTypedHint('')
      setHintTypingDone(false)
      return
    }
    const fullText = t('nina.playerHint')
    let i = 0
    setTypedHint('')
    const interval = setInterval(() => {
      i++
      setTypedHint(fullText.slice(0, i))
      if (i >= fullText.length) {
        clearInterval(interval)
        setHintTypingDone(true)
      }
    }, 20)
    return () => clearInterval(interval)
  }, [step, showHint, t])

  useEffect(() => {
    if (step !== 'player') return
    const timer = setTimeout(() => setAttention(false), 3000)
    return () => clearTimeout(timer)
  }, [step])

  useEffect(() => {
    if (step !== 'hint') return
    const timer = setTimeout(() => setShowHint(false), 6000)
    return () => clearTimeout(timer)
  }, [step])

  const markSessionDone = useCallback((aceitou) => {
    sessionRef.current = true
    aceitouRef.current = aceitou
    setNinaSessionState(aceitou ? 'aceitou' : 'recusou')
  }, [])

  const handleSim = () => {
    setStep('hint')
    setShowHint(true)
    markSessionDone(true)
    wantsPlayRef.current = true
    tocarAtual() // dentro do gesto do clique — mobile exige isso
    setTimeout(() => setStep('player'), 100)
  }

  const handleNao = () => {
    setStep('idle')
    markSessionDone(false)
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) audio.pause()
    else if (audio.src) audio.play().catch(() => {})
    else tocarAtual()
  }

  const handleClose = () => {
    audioRef.current?.pause()
    setPlaying(false)
    setStep('idle')
  }

  // Aviso se algo tentar recarregar/navegar enquanto a música toca
  useEffect(() => {
    if (!playing) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [playing])

  return (
    <>
      {showHint && step === 'hint' && (
        <div className="nina-balloon nina-hint">
          <img src={ninaImg} alt="Nina" className="nina-balloon-avatar" />
          <div className="nina-balloon-content">
            <p className="nina-balloon-msg">{typedHint}</p>
            {hintTypingDone && <span className="nina-tail" />}
          </div>
        </div>
      )}

      {step === 'player' && (
        <div className={`nina-player ${attention ? 'nina-player-attention' : ''}`}>
          <button className="nina-player-close" onClick={handleClose}>×</button>
          <div className="nina-player-icon">
            <span className={`nina-player-note ${playing ? 'nina-pulse' : ''}`}>
              {playing ? '♫' : '♪'}
            </span>
          </div>
          <button className="nina-player-prev" onClick={() => pular(-1)} title="Música anterior">⏮</button>
          <button className="nina-player-play" onClick={togglePlay}>
            {playing ? '⏸' : '▶'}
          </button>
          <button className="nina-player-next" onClick={() => pular(1)} title="Próxima música">⏭</button>
          {faixaAtual && <span className="nina-player-title" title={faixaAtual}>{faixaAtual}</span>}
        </div>
      )}
    </>
  )
}
