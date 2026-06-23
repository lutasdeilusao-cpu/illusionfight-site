import { useState, useRef, useEffect } from 'react'

export default function useUIController() {
  const [turnAnnouncement, setTurnAnnouncement] = useState(null)
  const [announcementClass, setAnnouncementClass] = useState('')

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

  function getSubPhaseLabel(subPhase, t) {
    if (!subPhase) return ''
    if (subPhase === 'free') return t('prototype.arena_testbed.free_turn_hint')
    if (subPhase === 'movimento') return t('prototype.arena_testbed.subphase_move')
    return t('prototype.arena_testbed.subphase_action')
  }

  return {
    turnAnnouncement, announcementClass,
    anunciar, getSubPhaseLabel,
  }
}
