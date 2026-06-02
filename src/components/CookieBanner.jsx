import { useState, useEffect } from 'react'
import './CookieBanner.css'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('ldi-cookies-accepted')
    if (!accepted) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem('ldi-cookies-accepted', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner">
      <p className="cookie-banner-text">
        Este site usa cookies técnicos e de terceiros (YouTube, TikTok, X) para funcionar corretamente. Ao continuar navegando, você concorda com isso.
      </p>
      <button className="cookie-banner-btn" onClick={handleAccept}>
        ENTENDIDO
      </button>
    </div>
  )
}
