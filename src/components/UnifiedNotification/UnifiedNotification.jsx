import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { notificationManager, NotificationType } from '../../lib/notificationManager'
import { useLanguage } from '../../context/LanguageContext'
import jackImg from '../../assets/images/characters/jack-balloon.png'
import ninaImg from '../../assets/images/characters/nina-balloon.png'
import tamaImg from '../../assets/images/tamagoshi/01/kroniki-presentation.png'
import thumbEp00 from '../../assets/images/episodes/thumb-ep00.png'
// Reusa os CSS existentes — nenhum estilo novo
import '../LDINotification/LDINotification.css'
import '../AchievementToast/AchievementToast.css'
import '../NinaMusicPlayer/NinaMusicPlayer.css'

export default function UnifiedNotification() {
  const [current, setCurrent] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const { t } = useLanguage()
  const autoTimerRef = useRef(null)
  const checkIntervalRef = useRef(null)
  const ninaCbRef = useRef(null)

  // Tenta puxar da fila — mas primeiro verifica notificação pendente da Nina
  const tryPull = useCallback(() => {
    if (current) return

    // ═══════════════════════════════════════════════════
    // PRIORIDADE MÁXIMA: Nina notification (não passa pelo notificationManager)
    // ═══════════════════════════════════════════════════
    const ninaPending = window.__ninaPendingNotification
    if (ninaPending && ninaPending.mensagem) {
      // Verifica se já foi mostrada nesta sessão
      if (sessionStorage.getItem('ldi-notif-nina-shown')) {
        console.log('[UNIFIED] ninaPending já mostrada nesta sessão, limpando')
        window.__ninaPendingNotification = null
      } else {
        console.log('[UNIFIED] ninaPending encontrada! Exibindo balão da Nina.')
        sessionStorage.setItem('ldi-notif-nina-shown', '1')
        setCurrent({
          type: 'nina_music',
          data: { mensagem: ninaPending.mensagem, greetingKey: ninaPending.greetingKey },
          id: Date.now(),
        })
        setIsClosing(false)
        setTypedText('')
        setTypingDone(false)
        // Limpa o pendente (só exibe uma vez)
        window.__ninaPendingNotification = null
        return
      }
    }

    // Fallback: fila normal do notificationManager
    const item = notificationManager.pull()
    if (item) {
      setCurrent(item)
      setIsClosing(false)
      setTypedText('')
      setTypingDone(false)
    }
  }, [current])

  // Polling + subscribe
  useEffect(() => {
    tryPull()
    checkIntervalRef.current = setInterval(tryPull, 15000)
    const unsub = notificationManager.subscribe(tryPull)
    return () => {
      clearInterval(checkIntervalRef.current)
      unsub()
    }
  }, [tryPull])

  // Typewriter para nina_music
  useEffect(() => {
    if (!current || current.type !== NotificationType.NINA_MUSIC) return
    const fullText = current.data.mensagem || ''
    if (!fullText) { setTypingDone(true); return }
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
  }, [current])

  // Auto-fechar
  useEffect(() => {
    if (!current) return
    const duration =
      current.type === NotificationType.ACHIEVEMENT ? 6000 :
      current.type === NotificationType.NINA_MUSIC ? 0 : // nina fecha manualmente
      10000
    if (duration === 0) return
    autoTimerRef.current = setTimeout(handleClose, duration)
    return () => clearTimeout(autoTimerRef.current)
  }, [current])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setCurrent(null)
      setIsClosing(false)
    }, 300)
  }, [])

  // Callback do Sim/Não da Nina
  const handleNinaSim = useCallback(() => {
    console.log('[UNIFIED] handleNinaSim chamado! ninaCbRef.current existe:', !!ninaCbRef.current)
    if (ninaCbRef.current) {
      console.log('[UNIFIED] Chamando ninaCbRef.current(true)')
      ninaCbRef.current(true)
    } else {
      console.warn('[UNIFIED] ⚠️ ninaCbRef.current é NULL! Callback não registrado pelo NinaMusicPlayer!')
    }
    handleClose()
  }, [handleClose])

  const handleNinaNao = useCallback(() => {
    console.log('[UNIFIED] handleNinaNao chamado! ninaCbRef.current existe:', !!ninaCbRef.current)
    if (ninaCbRef.current) {
      console.log('[UNIFIED] Chamando ninaCbRef.current(false)')
      ninaCbRef.current(false)
    } else {
      console.warn('[UNIFIED] ⚠️ ninaCbRef.current é NULL! Callback não registrado pelo NinaMusicPlayer!')
    }
    handleClose()
  }, [handleClose])

  // Expõe callback para NinaMusicPlayer se registrar
  useEffect(() => {
    console.log('[UNIFIED] Registrando window.__ninaNotificationCb como função de registro')
    window.__ninaNotificationCb = (fn) => {
      console.log('[UNIFIED] window.__ninaNotificationCb recebeu callback! Registrando em ninaCbRef.current')
      ninaCbRef.current = fn
    }
    return () => {
      console.log('[UNIFIED] Cleanup: removendo window.__ninaNotificationCb')
      window.__ninaNotificationCb = undefined
    }
  }, [])

  if (!current) return null

  // ═══════════════════════════════════════
  // ACHIEVEMENT — reusa classes de AchievementToast.css
  // ═══════════════════════════════════════
  if (current.type === NotificationType.ACHIEVEMENT) {
    const ach = current.data
    return (
      <div className="achievement-overlay" onClick={handleClose}>
        <div className="achievement-card" onClick={e => e.stopPropagation()}>
          <div className="achievement-particles">
            {[...Array(12)].map((_, i) => (
              <span key={i} className={`particle p-${i}`} />
            ))}
          </div>
          <img src={thumbEp00} className="achievement-jack" alt="Jack" />
          <div className="achievement-label">{t('achievement.titulo')}</div>
          <div className="achievement-icone">{ach.icone}</div>
          <div className="achievement-nome">{ach.nome}</div>
          <div className="achievement-descricao">{ach.descricao}</div>
          <button className="achievement-btn" onClick={handleClose}>
            {t('achievement.continuar')}
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════
  // LDI_TIP — reusa classes de LDINotification.css
  // ═══════════════════════════════════════
  if (current.type === NotificationType.LDI_TIP) {
    const d = current.data
    const isNina = d.personagem === 'nina'
    const isTama = d.personagem === 'tama'
    const avatar = isTama ? tamaImg : isNina ? ninaImg : jackImg
    const nomePersonagem = d.nome_personagem || (isTama ? 'Kroniki' : isNina ? 'Nina' : 'Jack')
    const isExternal = d.url && d.url.startsWith('http')

    return (
      <div className={`notif-balloon ${isNina ? 'notif-nina' : ''} ${isTama ? 'notif-tama' : ''}`}>
        <button className="notif-close" onClick={handleClose}>×</button>
        <div className="notif-header">
          <img src={avatar} alt={nomePersonagem} className="notif-avatar" />
          <span className="notif-name">{nomePersonagem}</span>
        </div>
        <p className="notif-message">{d.mensagem}</p>
        {d.cta && d.url && (
          isExternal ? (
            <a href={d.url} className="notif-cta" target="_blank" rel="noreferrer" onClick={handleClose}>
              {d.cta} →
            </a>
          ) : (
            <Link to={d.url} className="notif-cta" onClick={handleClose}>
              {d.cta} →
            </Link>
          )
        )}
      </div>
    )
  }

  // ═══════════════════════════════════════
  // NINA_MUSIC — reusa classes de NinaMusicPlayer.css
  // ═══════════════════════════════════════
  if (current.type === NotificationType.NINA_MUSIC) {
    const d = current.data
    return (
      <div className="nina-balloon">
        <img src={ninaImg} alt="Nina" className="nina-balloon-avatar" />
        <div className="nina-balloon-content">
          <p className="nina-balloon-msg">
            {typedText}<span className="nina-cursor">|</span>
          </p>
          {typingDone && (
            <>
              <span className="nina-tail" />
              <div className="nina-balloon-actions">
                <button className="nina-btn nina-btn-yes" onClick={handleNinaSim}>
                  {t('nina.yes')}
                </button>
                <button className="nina-btn nina-btn-no" onClick={handleNinaNao}>
                  {t('nina.no')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return null
}
