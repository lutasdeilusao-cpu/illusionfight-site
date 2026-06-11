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
  console.log('[NINA] YouTube IFrame API ready!')
  youtubeApiReady = true
  readyListeners.forEach(fn => fn())
  readyListeners.length = 0
}

function onYoutubeApi(cb) {
  if (youtubeApiReady) {
    console.log('[NINA] YouTube API already ready, executing callback immediately')
    cb()
  } else {
    console.log('[NINA] YouTube API not ready yet, queueing callback. readyListeners.length=', readyListeners.length)
    readyListeners.push(cb)
  }
}

function loadYoutubeApi() {
  if (document.querySelector('#youtube-api-script')) {
    console.log('[NINA] YouTube API script already loaded, skipping')
    return
  }
  console.log('[NINA] Loading YouTube IFrame API script...')
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

  console.log('[NINA] Componente montado. greetingKey:', greetingKey, '| step:', step, '| sessionRef:', sessionRef.current)

  // Load YouTube API on mount
  useEffect(() => {
    console.log('[NINA] useEffect: loadYoutubeApi()')
    loadYoutubeApi()
  }, [])

  // Push nina balloon to notification queue after 3s (debug) — antes era 30s
  useEffect(() => {
    if (sessionRef.current) {
      console.log('[NINA] useEffect timer: sessionRef já true, pulando')
      return
    }
    console.log('[NINA] useEffect timer: iniciando timer de 3s...')
    const timer = setTimeout(() => {
      if (sessionRef.current) {
        console.log('[NINA] setTimeout: sessionRef já true, abortando')
        return
      }
      const mensagem = t(greetingKey)
      console.log('[NINA] setTimeout: push notificação nina_music | greetingKey:', greetingKey, '| mensagem:', mensagem)
      console.log('[NINA] setTimeout: window.__ninaNotificationCb type:', typeof window.__ninaNotificationCb)
      notificationManager.push('nina_music', { mensagem, greetingKey })
      // Registra callback para quando o usuário responder na UnifiedNotification.
      // Chama a função de registro exposta pelo UnifiedNotification (se existir)
      // em vez de sobrescrevê-la, garantindo que ninaCbRef.current seja definido.
      if (typeof window.__ninaNotificationCb === 'function') {
        console.log('[NINA] setTimeout: Registrando callback via window.__ninaNotificationCb')
        window.__ninaNotificationCb((resposta) => {
          console.log('[NINA] ✅ Callback disparado! resposta:', resposta)
          if (resposta) {
            console.log('[NINA] Usuário respondeu SIM → chamando handleSim()')
            handleSim()
          } else {
            console.log('[NINA] Usuário respondeu NÃO → chamando handleNao()')
            handleNao()
          }
        })
      } else {
        console.warn('[NINA] ⚠️ window.__ninaNotificationCb NÃO é função! type:', typeof window.__ninaNotificationCb)
      }
    }, 3000) // 3s para debug (antes era 30000)
    return () => {
      console.log('[NINA] cleanup do timer')
      clearTimeout(timer)
    }
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
    console.log('[NINA] useEffect: criando container YouTube #nina-youtube-player')
    const div = document.createElement('div')
    div.id = 'nina-youtube-player'
    div.className = 'nina-youtube-iframe'
    document.body.appendChild(div)
    iframeRef.current = div
    console.log('[NINA] Container criado:', div.outerHTML)
    return () => {
      console.log('[NINA] cleanup: destruindo container YouTube')
      const player = playerRef.current
      if (player && player.destroy) {
        try {
          console.log('[NINA] destruindo player YouTube...')
          player.destroy()
        } catch (_) { /* ignore */ }
      }
      if (document.body.contains(div)) document.body.removeChild(div)
    }
  }, [])

  const handlePlayerError = useCallback((e) => {
    console.warn('[NINA] ⚠️ YouTube player error:', e)
  }, [])

  const initPlayer = useCallback(() => {
    console.log('[NINA] initPlayer() chamado | playerReadyRef:', playerReadyRef.current)
    if (playerReadyRef.current) {
      console.log('[NINA] initPlayer: player já está pronto, ignorando')
      return
    }
    onYoutubeApi(() => {
      console.log('[NINA] onYoutubeApi callback executado | playerReadyRef:', playerReadyRef.current)
      if (playerReadyRef.current) {
        console.log('[NINA] onYoutubeApi: player já pronto (double check), ignorando')
        return
      }
      console.log('[NINA] Criando new YT.Player...')
      console.log('[NINA] window.YT disponível:', typeof window.YT !== 'undefined')
      console.log('[NINA] window.YT.Player disponível:', typeof window.YT?.Player !== 'undefined')
      console.log('[NINA] Container #nina-youtube-player existe:', !!document.getElementById('nina-youtube-player'))
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
              console.log('[NINA] 🎯 YT.Player onReady!')
              playerReadyRef.current = true
              console.log('[NINA] Chamando setShuffle(true)...')
              player.setShuffle(true)
              playerRef.current = player
              console.log('[NINA] Chamando playVideo()...')
              player.playVideo()
              console.log('[NINA] setPlaying(true)')
              setPlaying(true)
            },
            onStateChange: (e) => {
              const stateNames = {
                [-1]: 'UNSTARTED', 0: 'ENDED', 1: 'PLAYING',
                2: 'PAUSED', 3: 'BUFFERING', 5: 'CUED'
              }
              console.log('[NINA] YT.Player onStateChange:', stateNames[e.data] || e.data, '| initialShuffleRef:', initialShuffleRef.current)
              // Skip the first (unshuffled) video once, then never again
              if (e.data === window.YT.PlayerState.PLAYING && !initialShuffleRef.current) {
                console.log('[NINA] Primeiro PLAYING detectado → pulando para próximo vídeo (shuffle)')
                initialShuffleRef.current = true
                const p = playerRef.current
                setTimeout(() => {
                  try {
                    console.log('[NINA] nextVideo()...')
                    p.nextVideo()
                  } catch (_) { /* ignore */ }
                }, 500)
              }
            },
            onError: (e) => {
              console.warn('[NINA] ⚠️ YT.Player onError:', e)
              handlePlayerError(e)
            },
          },
        })
        console.log('[NINA] YT.Player criado com sucesso!')
        playerRef.current = player
      } catch (err) {
        console.warn('[NINA] ❌ erro ao criar YT.Player:', err)
        console.warn('[NINA] Detalhes do erro:', err.message, err.stack)
      }
    })
  }, [handlePlayerError])

  const handleSim = () => {
    console.log('[NINA] handleSim() chamado!')
    setStep('hint')
    setShowHint(true)
    sessionRef.current = true
    console.log('[NINA] handleSim: chamando initPlayer()...')
    initPlayer()
    console.log('[NINA] handleSim: setTimeout para setStep player em 100ms')
    setTimeout(() => {
      console.log('[NINA] setTimeout: setStep("player")')
      setStep('player')
    }, 100)
  }

  const handleNao = () => {
    console.log('[NINA] handleNao() chamado')
    setStep('idle')
    sessionRef.current = true
  }

  const togglePlay = () => {
    const player = playerRef.current
    if (!player || !playerReadyRef.current) {
      console.log('[NINA] togglePlay: player não pronto', { player: !!player, ready: playerReadyRef.current })
      return
    }
    console.log('[NINA] togglePlay:', playing ? 'pauseVideo' : 'playVideo')
    if (playing) { player.pauseVideo() } else { player.playVideo() }
    setPlaying(!playing)
  }

  const handleClose = () => {
    console.log('[NINA] handleClose() chamado')
    const player = playerRef.current
    if (player && playerReadyRef.current) {
      console.log('[NINA] handleClose: pausando vídeo')
      player.pauseVideo()
    }
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
