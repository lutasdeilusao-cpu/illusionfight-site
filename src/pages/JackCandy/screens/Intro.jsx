import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import jackImg from '../../../assets/images/characters/jack-balloon.png'

export default function Intro() {
  const store = useJackStore()
  const [titleText, setTitleText] = useState('')
  const [showPaje, setShowPaje] = useState(false)

  // Title typewriter
  useEffect(() => {
    const TITLE = 'jack dream candy.'
    let i = 0
    const t = setInterval(() => {
      if (i <= TITLE.length) {
        setTitleText(TITLE.slice(0, i))
        i++
      } else {
        clearInterval(t)
        store.setTitleDone()
      }
    }, 80)
    return () => clearInterval(t)
  }, [])

  // Pajé at 100 capangas
  useEffect(() => {
    console.log('[JACK] Intro checando Pajé: capangas=', store.capangas, 'TEM_BENGALA=', store.flags.TEM_BENGALA)
    if (store.capangas >= 100 && !store.flags.TEM_BENGALA) {
      const t = setTimeout(() => setShowPaje(true), 500)
      return () => clearTimeout(t)
    }
  }, [store.capangas, store.flags.TEM_BENGALA])

  const titleDone = store.titleDone

  return (
    <div className="jdc-intro">
      {/* Avatar */}
      <div className="jdc-avatar">
        <img src={jackImg} alt="Jack" />
      </div>

      {/* Title */}
      <div className="jdc-intro-title">
        {titleText}
        {!titleDone && <span className="jack-cursor">█</span>}
      </div>

      {/* Narration */}
      {titleDone && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <p className="jack-text jack-text--dim">você está dormindo.</p>
          <p className="jack-text jack-text--dim jack-text--amber">sonhos não têm lógica. esse tem capangas.</p>
        </motion.div>
      )}

      {/* Resource counter */}
      {titleDone && (
        <div className="jdc-intro-counter">
          capangas: <span className="jack-text--amber">{store.capangas}</span>
        </div>
      )}

      {/* Actions (before Pajé) */}
      {titleDone && store.capangas < 100 && (
        <div className="jack-buttons">
          <button className="jack-btn" onClick={store.guardar}>[ guardar ]</button>
          <button className="jack-btn jack-btn--crimson" onClick={store.jogarFora} disabled={store.capangas <= 0}>[ jogar fora ]</button>
        </div>
      )}

      {/* Pajé */}
      {showPaje && !store.flags.TEM_BENGALA && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <p className="jack-text">{'>'} um velho de bombeta preta parou na calçada.</p>
          <p className="jack-text">{'>'} berimbau na mão. barraca de souvenirs.</p>
          <p className="jack-text">{'>'} no meio da madrugada.</p>
          <p className="jack-text jack-text--amber">[PAJÉ] "cheguei pra divar. o que vai ser?"</p>
          <div className="jack-buttons">
            <button
              className="jack-btn jack-btn--amber"
              onClick={() => {
                console.log('[JACK] clique comprar bengala')
                store.comprarBengala()
              }}
            >
              [ bengala steampunk — 100 capangas ]
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
