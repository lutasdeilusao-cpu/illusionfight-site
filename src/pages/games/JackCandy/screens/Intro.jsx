import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useJackStore } from '../store/useJackStore'
import { CASOS } from '../data/casos'
import jackImg from '../../../../assets/images/characters/jack-balloon.png'

export default function Intro() {
  const { t } = useLanguage()
  const store = useJackStore()
  const [titleText, setTitleText] = useState('')
  const [showPaje, setShowPaje] = useState(false)

  useEffect(() => {
    const TITLE = t('games.jackcandy.intro_title')
    let i = 0
    const timer = setInterval(() => {
      if (i <= TITLE.length) {
        setTitleText(TITLE.slice(0, i))
        i++
      } else {
        clearInterval(timer)
        store.setTitleDone()
      }
    }, 80)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (store.cervejas >= 100 && !store.flags.TEM_BENGALA) {
      const pajeTimer = setTimeout(() => setShowPaje(true), 500)
      return () => clearTimeout(pajeTimer)
    }
  }, [store.cervejas, store.flags.TEM_BENGALA])

  const titleDone = store.titleDone

  useEffect(() => {
    console.log('[DEBUG] listener Shift+D registrado na Intro')
    const handler = (e) => {
      console.log('[DEBUG] tecla pressionada:', e.key, 'shift:', e.shiftKey)
      if (e.key === 'D' && e.shiftKey) {
        console.log('[DEBUG] Shift+D detectado — carregando save de dev')
        useJackStore.setState({
          cervejas: 500,
          cervejasTotais: 500,
          notas: 20,
          flags: { TEM_BENGALA: true, NINA_LIBERADO: true, NOTAS_LIBERADO: true, JA_VIU_VILA: true },
          fase: 'caso_select',
          equipado: { arma: { id: 'bengala_steampunk', nome: 'Bengala Steampunk', dano: 2 }, armadura: null, acessorio: null },
        })
        const caso = CASOS['caso1']
        useJackStore.setState({
          casoAtivo: 'caso1',
          suspeitos: caso.suspeitos.map(s => ({ ...s, status: 'ativo' })),
          pistasColetadas: ['p1_1', 'p1_2', 'p1_3', 'p1_4'],
          locaisVisitados: ['loc1_1', 'loc1_2', 'loc1_3', 'loc1_4'],
          acusacoesErradas: 0,
          fase: 'dossier',
        })
        console.log('[DEBUG] save dev com caso1 pronto para acusar')
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      console.log('[DEBUG] listener Shift+D removido')
      window.removeEventListener('keydown', handler)
    }
  }, [])

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
          <p className="jack-text jack-text--dim">{t('games.jackcandy.intro_dormindo')}</p>
          <p className="jack-text jack-text--dim jack-text--amber">{t('games.jackcandy.intro_sonhos')}</p>
        </motion.div>
      )}

      {titleDone && (
        <div className="jdc-intro-counter">
          🍺 <span className="jack-text--amber">{store.cervejas}</span>
        </div>
      )}

      {titleDone && store.cervejas < 100 && (
        <div className="jack-buttons">
          <p className="jack-text jack-text--dim jdc-text-xs">{t('games.jackcandy.intro_acumulando')}</p>
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
    </div>
  )
}
