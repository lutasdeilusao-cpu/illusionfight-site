import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import jackImg from '../assets/images/characters/jack-balloon.png'
import notificacoes from '../data/notificacoes.json'
import { useNotificationStore } from '../store/notificationStore'
import './NotificationBalloon.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function NotificationBalloon() {
  const [visible, setVisible] = useState(false)
  const [notif, setNotif] = useState(null)
  const [queue, setQueue] = useState([])
  const [queueIndex, setQueueIndex] = useState(0)
  const autoCloseRef = useRef(null)
  const nextRef = useRef(null)
  const notifStore = useNotificationStore()

  useEffect(() => {
    const shuffled = shuffle(notificacoes)
    setQueue(shuffled)

    const first = setTimeout(() => {
      setNotif(shuffled[0])
      setVisible(true)
      setQueueIndex(1)
    }, 3 * 60 * 1000)

    const polling = setInterval(() => {
      const item = notifStore.pop()
      if (item) {
        clearTimeout(autoCloseRef.current)
        clearTimeout(nextRef.current)
        setNotif(item)
        setVisible(true)
      }
    }, 3000)

    return () => { clearTimeout(first); clearInterval(polling) }
  }, [])

  useEffect(() => {
    if (visible) {
      autoCloseRef.current = setTimeout(() => handleClose(), 8000)
    }
    return () => clearTimeout(autoCloseRef.current)
  }, [visible])

  const handleClose = () => {
    setVisible(false)
    clearTimeout(autoCloseRef.current)

    nextRef.current = setTimeout(() => {
      const nextIndex = queueIndex % queue.length
      setNotif(queue[nextIndex])
      setQueueIndex(nextIndex + 1)
      setVisible(true)
    }, 10 * 60 * 1000)
  }

  if (!visible || !notif) return null

  const isExternal = notif.url.startsWith('http')

  return (
    <div className="notif-balloon">
      <button className="notif-close" onClick={handleClose}>×</button>
      <div className="notif-header">
        <img src={jackImg} alt="Jack" className="notif-avatar" />
        <span className="notif-name">{notif.nome_personagem || 'Jack'}</span>
      </div>
      <p className="notif-message">{notif.mensagem}</p>
      {isExternal ? (
        <a href={notif.url} className="notif-cta" target="_blank" rel="noreferrer" onClick={handleClose}>
          {notif.cta} →
        </a>
      ) : (
        <Link to={notif.url} className="notif-cta" onClick={handleClose}>
          {notif.cta} →
        </Link>
      )}
    </div>
  )
}
