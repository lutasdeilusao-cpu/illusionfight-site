import { useState, useEffect, useRef } from 'react'
import { usePPStore } from '../store/usePPStore'
import { useAuth } from '../../../../context/AuthContext'
import { useLanguage } from '../../../../context/LanguageContext'

export default function Dormindo() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = usePPStore()
  const [restante, setRestante] = useState(0)

  useEffect(() => {
    const tick = () => {
      const agora = Date.now()
      const fim = store.dormindoAte || 0
      const s = Math.max(0, Math.ceil((fim - agora) / 1000))
      setRestante(s)
      if (s <= 0) {
        store.acordar()
        if (user) store.saveToCloud(user.id)
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const min = Math.floor(restante / 60)
  const seg = restante % 60

  return (
    <div className="pp-container">
      <div className="pp-dormindo">
        <h1 className="pp-dormindo-title">{t('pp.dormindo.titulo')}</h1>
        <p className="pp-dormindo-text">
          {t('pp.dormindo.texto').split('\n').map((l, i, arr) => (
            <span key={i}>{l}{i < arr.length - 1 && <><br /><br /></>}</span>
          ))}
        </p>
        <div className="pp-dormindo-timer">
          {String(min).padStart(2, '0')}:{String(seg).padStart(2, '0')}
        </div>
        {restante <= 0 && (
          <button className="pp-btn pp-btn--primary" onClick={() => { store.acordar(); if (user) store.saveToCloud(user.id) }}>
            {t('pp.dormindo.acordar')}
          </button>
        )}
      </div>
    </div>
  )
}
