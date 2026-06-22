import { useState, useRef, useEffect, useCallback } from 'react'

export default function useUIController() {
  const [turnAnnouncement, setTurnAnnouncement] = useState(null)
  const [announcementClass, setAnnouncementClass] = useState('')
  const [attackBanner, setAttackBanner] = useState(null)
  const [balloons, setBalloons] = useState([])
  const [damageFlash, setDamageFlash] = useState({})
  const [shaking, setShaking] = useState(false)
  const [flashDmg, setFlashDmg] = useState(false)
  const [danoPopup, setDanoPopup] = useState(null)

  const announceTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (announceTimerRef.current) clearTimeout(announceTimerRef.current)
    }
  }, [])

  function anunciar(texto, duracao = 2000, cls = '') {
    setTurnAnnouncement(texto)
    setAnnouncementClass(cls)
    if (announceTimerRef.current) clearTimeout(announceTimerRef.current)
    announceTimerRef.current = setTimeout(() => {
      setTurnAnnouncement(null)
      setAnnouncementClass('')
    }, duracao)
  }

  function mostrarBannerAtaque(nome) {
    setAttackBanner({ texto: `${nome} ataca!` })
    setTimeout(() => setAttackBanner(null), 1500)
  }

  function adicionarBalao({ x, y, texto, tipo }) {
    const key = Date.now() + Math.random()
    setBalloons(prev => [...prev, { id: key, x, y, texto, tipo, key }])
    setTimeout(() => setBalloons(prev => prev.filter(b => b.key !== key)), 1300)
  }

  function dispararFlash(alvoId) {
    const fazerFlash = (count) => {
      if (count >= 6) {
        setDamageFlash(prev => { const n = { ...prev }; delete n[alvoId]; return n })
        return
      }
      setDamageFlash(prev => ({ ...prev, [alvoId]: count }))
      setTimeout(() => fazerFlash(count + 1), 120)
    }
    fazerFlash(0)
  }

  function dispararImpacto() {
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
    setFlashDmg(true)
    setTimeout(() => setFlashDmg(false), 400)
  }

  function mostrarDanoPopup(alvoId, dano) {
    setDanoPopup({ dano, alvoId, key: Date.now() })
    setTimeout(() => setDanoPopup(null), 800)
  }

  return {
    turnAnnouncement, announcementClass,
    attackBanner, balloons, damageFlash, shaking, flashDmg, danoPopup,
    anunciar, mostrarBannerAtaque, adicionarBalao,
    dispararFlash, dispararImpacto, mostrarDanoPopup,
  }
}
