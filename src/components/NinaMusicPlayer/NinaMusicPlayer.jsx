import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { notificationManager } from '../../lib/notificationManager'
import ninaImg from '../../assets/images/characters/nina-balloon.png'
import './NinaMusicPlayer.css'

const PLAYLIST_ID = 'PLVAkPvJrHsPZHSvAvGxpiT-yWgyx_qRfK'

let youtubeApiReady = false
const readyListeners = []
window.onYouTubeIframeAPIReady = () => {
  youtubeApiReady = true
  readyListeners.forEach(fn => fn())
  readyListeners.length = 0
}

function onYoutubeApi(cb) {
  if (youtubeApiReady) { cb() }
  else { readyListeners.push(cb) }
}

function loadYoutubeApi() {
  if (document.querySelector('#youtube-api-script')) return
  const tag = document.createElement('script')
  tag.id = 'youtube-api-script'
  tag.src = 'https://www.youtube.com/iframe_api'
  const first = document.getElementsByTagName('script')[0]
  first.parentNode.insertBefore(tag, first)
}

function getGreetingKey(pathname) {
  if (pathname.startsWith('/games/')) return 'nina.greeting.game'
  if (pathname.startsWith('/livro/') || pathname.startsWith('/webtoon/')) return 'nina.greeting.reading'
  return 'nina.greeting.default'
}

export default function NinaMusicPlayer() {
  const [step, setStep] = useState('idle') // idle | balloon | player | hint
  const [playing, setPlaying] = useState(false)
  const [attention, setAttention] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [typedHint, setTypedHint] = useState('')
  const [hintTypingDone, setHintTypingDone] = useState(false)
  const playerRef = useRef(null)
  const iframeRef = useRef(null)
  const playerReadyRef = useRef(false)
  const sessionRef = useRef(false)
  const initialShuffleRef = useRef(false)
  const location = useLocation()
  const { t } = useLanguage()
  const greetingKey = getGreetingKey(location.pathname)
  const fullHintRef = useRef('')

  // Load YouTube API on mount
  useEffect(() => { loadYoutubeApi() }, [])

  // Push nina balloon to notification queue after 30s (instead of self-showing)
  useEffect(() => {
    if (sessionRef.current) return
    const timer = setTimeout(() => {
      if (sessionRef.current) return
      const mensagem = t(greetingKey)
      notificationManager.push('nina_music', { mensagem, greetingKey })
      // Registra callback para quando o usuário responder na UnifiedNotification
      window.__ninaNotificationCb = (resposta) => {
        if (resposta) {
          // Sim
          handleSim()
        } else {
          // Não
          handleNao()
        }
      }
    }, 30000)
    return () => clearTimeout(timer)
  }, [greetingKey, t])

  // Typewriter effect for hint
  useEffect(() => {
    if (step !== 'hint' || !showHint) {
      setTypedHint('')
      setHintTypingDone(false)
      return
    }
    const fullText = t('nina.playerHint')
    fullHintRef.current = fullText
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

  // Attention pulse
  useEffect(() => {
    if (step !== 'player') return
    const timer = setTimeout(() => setAttention(false), 3000)
    return () => clearTimeout(timer)
  }, [step])

  // Show hint for 6s
  useEffect(() => {
    if (step !== 'hint') return
    const timer = setTimeout(() => setShowHint(false), 6000)
    return () => clearTimeout(timer)
  }, [step])

  // Create YouTube container outside React's tree so React never reconciles it
  useEffect(() => {
    const div = document.createElement('div')
    div.id = 'nina-youtube-player'
    div.className = 'nina-youtube-iframe'
    document.body.appendChild(div)
    iframeRef.current = div
    return () => {
      // Destroy YouTube player on unmount
      const player = playerRef.current
      if (player && player.destroy) {
        try { player.destroy() } catch (_) { /* ignore */ }
      }
      if (document.body.contains(div)) document.body.removeChild(div)
    }
  }, [])

  const handlePlayerError = useCallback((e) => {
    console.warn('[NINA] YouTube player error:', e)
  }, [])

  const initPlayer = useCallback(() => {
    if (playerReadyRef.current) return
    onYoutubeApi(() => {
      if (playerReadyRef.current) return
      try {
        const player = new window.YT.Player('nina-youtube-player', {
          height: '1', width: '1',
          playerVars: {
            listType: 'playlist', list: PLAYLIST_ID,
            autoplay: 0, controls: 0, disablekb: 1,
            fs: 0, modestbranding: 1, rel: 0, loop: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              playerReadyRef.current = true
              player.setShuffle(true)
              playerRef.current = player
              // Auto-play when user clicked "Sim"
              player.playVideo()
              setPlaying(true)
            },
            onStateChange: (e) => {
              // Skip the first (unshuffled) video once, then never again
              if (e.data === window.YT.PlayerState.PLAYING && !initialShuffleRef.current) {
                initialShuffleRef.current = true
                const p = playerRef.current
                setTimeout(() => {
                  try { p.nextVideo() } catch (_) { /* ignore */ }
                }, 500)
              }
            },
            onError: handlePlayerError,
          },
        })
      } catch (err) {
        console.warn('[NINA] erro ao criar player:', err)
      }
    })
  }, [handlePlayerError])

  const handleSim = () => {
    setStep('hint')
    setShowHint(true)
    sessionRef.current = true
    initPlayer()
    setTimeout(() => setStep('player'), 100)
  }

  const handleNao = () => {
    setStep('idle')
    sessionRef.current = true
  }

  const togglePlay = () => {
    const player = playerRef.current
    if (!player || !playerReadyRef.current) return
    if (playing) { player.pauseVideo() } else { player.playVideo() }
    setPlaying(!playing)
  }

  const handleClose = () => {
    const player = playerRef.current
    if (player && playerReadyRef.current) player.pauseVideo()
    setPlaying(false)
    setStep('idle')
    sessionRef.current = true
  }

  // Click outside balloon to close (after 2.5s)
  useEffect(() => {
    if (step !== 'balloon') return
    let timer, handler
    timer = setTimeout(() => {
      handler = (e) => {
        if (!e.target.closest('.nina-balloon') && !e.target.closest('.nina-player')) {
          setStep('idle')
        }
      }
      document.addEventListener('click', handler)
    }, 2500)
    return () => {
      clearTimeout(timer)
      if (handler) document.removeEventListener('click', handler)
    }
  }, [step])

  // Proteção: avisar se algo tentar recarregar/navegar enquanto música toca
  useEffect(() => {
    if (!playing) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [playing])

  return (
    <>
      {/* Hint after "sim" — renderizado pelo UnifiedNotification */}
      {showHint && step === 'hint' && (
        <div className="nina-balloon nina-hint">
          <img src={ninaImg} alt="Nina" className="nina-balloon-avatar" />
          <div className="nina-balloon-content">
            <p className="nina-balloon-msg">{typedHint}</p>
            {hintTypingDone && <span className="nina-tail" />}
          </div>
        </div>
      )}

      {/* Music player */}
      {step === 'player' && (
        <div className={`nina-player ${attention ? 'nina-player-attention' : ''}`}>
          <button className="nina-player-close" onClick={handleClose}>×</button>
          <div className="nina-player-icon">
            <span className={`nina-player-note ${playing ? 'nina-pulse' : ''}`}>
              {playing ? '♫' : '♪'}
            </span>
          </div>
          <button className="nina-player-play" onClick={togglePlay}>
            {playing ? '⏸' : '▶'}
          </button>
        </div>
      )}
    </>
  )
}
