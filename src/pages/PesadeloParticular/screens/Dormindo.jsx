import { useState, useEffect, useRef } from 'react'
import { usePPStore } from '../store/usePPStore'
import { useAuth } from '../../../context/AuthContext'

export default function Dormindo() {
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
        <h1 className="pp-dormindo-title">INCONSCIENTE</h1>
        <p className="pp-dormindo-text">
          Você foi derrotado. O sonho escurece. Jack está caído no beco, a chuva lavando o sangue do asfalto.<br /><br />
          Em alguns minutos, alguém vai encontrá-lo. Ou talvez ninguém encontre. Isso é Marelia.
        </p>
        <div className="pp-dormindo-timer">
          {String(min).padStart(2, '0')}:{String(seg).padStart(2, '0')}
        </div>
        {restante <= 0 && (
          <button className="pp-btn pp-btn--primary" onClick={() => { store.acordar(); if (user) store.saveToCloud(user.id) }}>
            ACORDAR
          </button>
        )}
      </div>
    </div>
  )
}
