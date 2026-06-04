import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import jackImg from '../../../assets/images/characters/jack-balloon.png'

export default function Intro() {
  const store = useJackStore()
  const [titleText, setTitleText] = useState('')
  const [showPaje, setShowPaje] = useState(false)

  useEffect(() => {
    const TITLE = 'jack dream beer.'
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

  useEffect(() => {
    if (store.cervejas >= 100 && !store.flags.TEM_BENGALA) {
      const t = setTimeout(() => setShowPaje(true), 500)
      return () => clearTimeout(t)
    }
  }, [store.cervejas, store.flags.TEM_BENGALA])

  const titleDone = store.titleDone

  return (
    <div className="jdc-intro">
      <div className="jdc-avatar">
        <img src={jackImg} alt="Jack" />
      </div>

      <div className="jdc-intro-title">
        {titleText}
        {!titleDone && <span className="jack-cursor" />}
      </div>

      {titleDone && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <p className="jack-text jack-text--dim">você está dormindo.</p>
          <p className="jack-text jack-text--dim jack-text--amber">sonhos não têm lógica. esse tem cervejas.</p>
        </motion.div>
      )}

      {titleDone && (
        <div className="jdc-intro-counter">
          🍺 <span className="jack-text--amber">{store.cervejas}</span>
        </div>
      )}

      {titleDone && store.cervejas < 100 && (
        <div className="jack-buttons">
          <p className="jack-text jack-text--dim" style={{ fontSize: '0.7rem' }}>continue acumulando cervejas...</p>
        </div>
      )}

      {showPaje && !store.flags.TEM_BENGALA && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <p className="jack-text">{'>'} um velho de bombeta preta parou na calçada.</p>
          <p className="jack-text">{'>'} berimbau na mão. barraca de souvenirs.</p>
          <p className="jack-text">{'>'} no meio da madrugada.</p>
          <p className="jack-text jack-text--amber">[PAJÉ] "cheguei pra divar. o que vai ser?"</p>
          <div className="jack-buttons">
            <button
              className="jack-btn jack-btn--amber"
              onClick={() => store.comprarBengala()}
            >
              [ bengala steampunk — 100 🍺 ]
            </button>
          </div>
        </motion.div>
      )}

      {true && (
        <button className="jack-btn" onClick={() => {
          useJackStore.setState({
            cervejas: 500,
            cervejasTotais: 500,
            notas: 20,
            flags: { TEM_BENGALA: true, NINA_LIBERADO: true, NOTAS_LIBERADO: true, JA_VIU_VILA: true },
            fase: 'caso_select',
            equipado: { arma: { id: 'bengala_steampunk', nome: 'Bengala Steampunk', dano: 2 }, armadura: null, acessorio: null },
          })
          console.log('[DEBUG] save de desenvolvimento carregado')
        }} style={{ marginTop: '1rem', fontSize: '0.65rem', borderColor: '#333', color: '#555' }}>
          [debug: pular intro]
        </button>
      )}
    </div>
  )
}
