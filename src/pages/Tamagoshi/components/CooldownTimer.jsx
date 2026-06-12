import { useState, useEffect } from 'react'
import { useLanguage } from '../../../context/LanguageContext'

export default function CooldownTimer({ ate }) {
  const { t } = useLanguage()
  const [restante, setRestante] = useState('')

  useEffect(() => {
    if (!ate) return
    const fn = () => {
      const diff = ate - Date.now()
      if (diff <= 0) { setRestante(t('games.tamagoshi.cooldown_disponivel')); return }
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setRestante(`${h}h ${m}m`)
    }
    fn()
    const id = setInterval(fn, 10000)
    return () => clearInterval(id)
  }, [ate])

  return <span className="tama-cooldown">{restante}</span>
}
