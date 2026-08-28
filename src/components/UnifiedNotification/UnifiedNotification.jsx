import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getNotificationAchievementId, notificationManager, NotificationType } from '../../lib/notificationManager'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import jackImg from '../../assets/images/characters/jack-balloon.png'
import ninaImg from '../../assets/images/characters/nina-balloon.png'
import tamaImg from '../../assets/images/tamagoshi/01/kroniki-presentation.png'
import thumbEp00 from '../../assets/images/episodes/thumb-ep00.webp'
import achievPt from '../../data/achievements-pt.json'
import achievEn from '../../data/achievements-en.json'
import achievEs from '../../data/achievements-es.json'
import stringsPt from '../../data/achievements-strings-pt.json'
import stringsEn from '../../data/achievements-strings-en.json'
import stringsEs from '../../data/achievements-strings-es.json'
// Reusa os CSS existentes — nenhum estilo novo
import '../LDINotification/LDINotification.css'
import '../AchievementToast/AchievementToast.css'
import '../RadioNina/RadioNina.css'

export default function UnifiedNotification() {
  const [current, setCurrent] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const { t, locale } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const autoTimerRef = useRef(null)
  const checkIntervalRef = useRef(null)
  const ninaCbRef = useRef(null)
  const currentRef = useRef(current)
  currentRef.current = current

  // Tenta puxar da fila — mas primeiro verifica notificação pendente da Nina
  const tryPull = useCallback(() => {
    if (current) return

    // Defesa: guest não pode ver achievement de jeito nenhum
    if (!user) {
      notificationManager.clearByType('achievement')
    }

    // PRIORIDADE MÁXIMA: Nina notification (não passa pelo notificationManager)
    const ninaPending = window.__ninaPendingNotification
    if (ninaPending && ninaPending.mensagem) {
      setCurrent({
        type: 'nina_music',
        data: { mensagem: ninaPending.mensagem, sim: ninaPending.sim, nao: ninaPending.nao },
        id: Date.now(),
      })
      setIsClosing(false)
      setTypedText('')
      setTypingDone(false)
      window.__ninaPendingNotification = null
      return
    }

    // Fallback: fila normal do notificationManager
    // Achievement (logado) ou CTA (guest) tem prioridade — busca na fila inteira com bypass de cooldown
    const item = user
      ? (notificationManager.findAndPull('achievement', true) || notificationManager.pull())
      : (notificationManager.findAndPull('cta_conta', true) || notificationManager.pull())
    if (item) {
      setCurrent(item)
      setIsClosing(false)
      setTypedText('')
      setTypingDone(false)
    }
  }, [current, user])

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

  useEffect(() => notificationManager.subscribe(event => {
    if (event?.type !== 'achievement-removed') return
    if (getNotificationAchievementId(currentRef.current) !== event.achievementId) return
    clearTimeout(autoTimerRef.current)
    setCurrent(null)
    setIsClosing(false)
  }), [])

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
      current.type === NotificationType.ACHIEVEMENT || current.type === NotificationType.CTA_CONTA ? 6000 :
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
    if (ninaCbRef.current) ninaCbRef.current(true)
    handleClose()
  }, [handleClose])

  const handleNinaNao = useCallback(() => {
    if (ninaCbRef.current) ninaCbRef.current(false)
    handleClose()
  }, [handleClose])

  // Expõe callback para a Rádio Nina se registrar
  useEffect(() => {
    window.__ninaNotificationCb = (fn) => { ninaCbRef.current = fn }
    return () => { window.__ninaNotificationCb = undefined }
  }, [])

  // ── Locale-aware data ──
  const achievList = locale === 'en' ? achievEn : locale === 'es' ? achievEs : achievPt
  const ctaStrings = locale === 'en' ? stringsEn : locale === 'es' ? stringsEs : stringsPt

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
  // CTA_CONTA — guest CTA, mesma UI do achievement
  // ═══════════════════════════════════════
  if (current.type === NotificationType.CTA_CONTA) {
    const ach = achievList.find(a => a.id === current.data.achievementId)
    return (
      <div className="achievement-overlay" onClick={handleClose}>
        <div className="achievement-card" onClick={e => e.stopPropagation()}>
          <div className="achievement-particles">
            {[...Array(12)].map((_, i) => (
              <span key={i} className={`particle p-${i}`} />
            ))}
          </div>
          <img src={thumbEp00} className="achievement-jack" alt="Jack" />
          <div className="achievement-label">{ctaStrings.cta_conta.titulo}</div>
          {ach && <div className="achievement-icone">{ach.icone}</div>}
          {ach && <div className="achievement-nome">{ach.nome}</div>}
          <div className="achievement-descricao">{ctaStrings.cta_conta.mensagem}</div>
          <button className="achievement-btn" onClick={() => { handleClose(); navigate('/cadastro') }}>
            {ctaStrings.cta_conta.botao}
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
  // NINA_MUSIC — convite da Rádio Nina (classes em RadioNina.css)
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
                  {d.sim}
                </button>
                <button className="nina-btn nina-btn-no" onClick={handleNinaNao}>
                  {d.nao}
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
