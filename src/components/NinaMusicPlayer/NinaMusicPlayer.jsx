import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
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
  const [typedText, setTypedText] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const [typedHint, setTypedHint] = useState('')
  const [hintTypingDone, setHintTypingDone] = useState(false)
  const playerRef = useRef(null)
  const iframeRef = useRef(null)
  const playerReadyRef = useRef(false)
  const sessionRef = useRef(false)
  const location = useLocation()
  const { t } = useLanguage()
  const greetingKey = getGreetingKey(location.pathname)
  const fullMsgRef = useRef('')
  const fullHintRef = useRef('')

  // Load YouTube API on mount
  useEffect(() => { loadYoutubeApi() }, [])

  // Show balloon after 30s
  useEffect(() => {
    if (sessionRef.current) return
    const timer = setTimeout(() => {
      if (!sessionRef.current) setStep('balloon')
    }, 30000)
    return () => clearTimeout(timer)
  }, [])

  // Typewriter effect for balloon
  useEffect(() => {
    if (step !== 'balloon') {
      setTypedText('')
      setTypingDone(false)
      return
    }
    const fullText = t(greetingKey)
    fullMsgRef.current = fullText
    let i = 0
    setTypedText('')

    const interval = setInterval(() => {
      i++
      setTypedText(fullText.slice(0, i))
      if (i >= fullText.length) {
        clearInterval(interval)
        setTypingDone(true)
      }
    }, 25)

    return () => clearInterval(interval)
  }, [step, greetingKey, t])

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

  // Auto-close balloon after 10s total
  useEffect(() => {
    if (step !== 'balloon') return
    const timer = setTimeout(() => { setStep('idle') }, 10000)
    return () => clearTimeout(timer)
  }, [step])

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

  const initPlayer = useCallback(() => {
    if (playerReadyRef.current) return
    onYoutubeApi(() => {
      if (playerReadyRef.current) return
      const player = new window.YT.Player('nina-youtube-player', {
        height: '0', width: '0',
        playerVars: {
          listType: 'playlist', list: PLAYLIST_ID,
          autoplay: 0, controls: 0, disablekb: 1,
          fs: 0, modestbranding: 1, rel: 0, loop: 1,
        },
        events: {
          onReady: () => {
            playerReadyRef.current = true
            player.setShuffle(true)
            playerRef.current = player
          },
        },
      })
    })
  }, [])

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
    const timer = setTimeout(() => {
      const handler = (e) => {
        if (!e.target.closest('.nina-balloon') && !e.target.closest('.nina-player')) {
          setStep('idle')
        }
      }
      document.addEventListener('click', handler)
      return () => document.removeEventListener('click', handler)
    }, 2500)
    return () => clearTimeout(timer)
  }, [step])

  console.log('[NINA] music player carregado')

  return (
    <>
      <div id="nina-youtube-player" ref={iframeRef} className="nina-youtube-iframe" />

      {/* WhatsApp-style balloon */}
      {step === 'balloon' && (
        <div className="nina-balloon">
          <img src={ninaImg} alt="Nina" className="nina-balloon-avatar" />
          <div className="nina-balloon-content">
            <p className="nina-balloon-msg">{typedText}<span className="nina-cursor">|</span></p>
            {typingDone && (
              <>
                <span className="nina-tail" />
                <div className="nina-balloon-actions">
                  <button className="nina-btn nina-btn-yes" onClick={handleSim}>{t('nina.yes')}</button>
                  <button className="nina-btn nina-btn-no" onClick={handleNao}>{t('nina.no')}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hint after "sim" */}
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
