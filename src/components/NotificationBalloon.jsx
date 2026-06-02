import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import jackImg from '../assets/images/characters/jack-balloon.png'
import notificacoes from '../data/notificacoes.json'
import './NotificationBalloon.css'

const TEST_MODE = import.meta.env.DEV
const FIRST_DELAY = TEST_MODE ? 5 * 1000 : 3 * 60 * 1000
const NEXT_DELAY  = TEST_MODE ? 10 * 1000 : 10 * 60 * 1000
const AUTO_CLOSE  = TEST_MODE ? 6 * 1000 : 8 * 1000

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

  useEffect(() => {
    const shuffled = shuffle(notificacoes)
    setQueue(shuffled)

    const first = setTimeout(() => {
      setNotif(shuffled[0])
      setVisible(true)
      setQueueIndex(1)
    }, FIRST_DELAY)

    return () => clearTimeout(first)
  }, [])

  useEffect(() => {
    if (visible) {
      autoCloseRef.current = setTimeout(() => handleClose(), AUTO_CLOSE)
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
    }, NEXT_DELAY)
  }

  if (!visible || !notif) return null

  const isExternal = notif.url.startsWith('http')

  return (
    <div className="notif-balloon">
      <button className="notif-close" onClick={handleClose}>×</button>
      <div className="notif-header">
        <img src={jackImg} alt="Jack" className="notif-avatar" />
        <span className="notif-name">Jack</span>
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
