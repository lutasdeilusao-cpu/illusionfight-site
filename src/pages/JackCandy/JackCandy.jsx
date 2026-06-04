import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReader } from '../../context/ReaderContext'
import { useJackStore, AREAS } from './store/useJackStore'
import QuestScreen from './QuestScreen'
import jackImg from '../../assets/images/characters/jack-balloon.png'
import './JackCandy.css'

const RAIN_CHARS = ['|', '/', '\\', '░', '▒', '▓']
const RAIN_COLS = 40

function RainColumn({ index }) {
  const speed = 3 + Math.random() * 6
  const delay = Math.random() * 8
  const char = RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)]
  const left = (index / RAIN_COLS) * 100
  return (
    <div
      className="jack-rain-col"
      style={{
        left: `${left}%`,
        animationDuration: `${speed}s`,
        animationDelay: `${delay}s`,
      }}
    >
      {char}
    </div>
  )
}

function TypewriterText({ text, speed = 50, onDone }) {
  const [display, setDisplay] = useState('')
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplay(text.slice(0, idx + 1))
        setIdx(i => i + 1)
      }, speed)
      return () => clearTimeout(t)
    } else {
      onDone?.()
    }
  }, [idx, text, speed, onDone])

  return (
    <span>
      {display}
      {idx < text.length && <span className="jack-cursor">█</span>}
    </span>
  )
}

const NARRACOES = {
  inicio: "sonhos não têm lógica. esse tem balas.",
}

export default function JackCandy() {
  const { setReaderMode } = useReader()
  const store = useJackStore()
  const [tab, setTab] = useState('balas')
  const [titleText, setTitleText] = useState('')
  const [showTitle, setShowTitle] = useState(false)
  const [showPajeIntro, setShowPajeIntro] = useState(false)
  const [showPajeFala, setShowPajeFala] = useState(false)
  const [questScreen, setQuestScreen] = useState(null)
  const tickRef = useRef(null)

  // Immersive mode
  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  // Auto-tick balas a cada segundo
  useEffect(() => {
    tickRef.current = setInterval(() => store.tick(), 1000)
    return () => clearInterval(tickRef.current)
  }, [])

  // Title animation on first load
  useEffect(() => {
    const TITLE = 'jack dream candy.'
    let i = 0
    const t = setInterval(() => {
      if (i <= TITLE.length) {
        setTitleText(TITLE.slice(0, i))
        i++
      } else {
        clearInterval(t)
        setShowTitle(true)
        store.setTitleDone()
      }
    }, 80)
    return () => clearInterval(t)
  }, [])

  // Pajé aparece com 100 balas
  useEffect(() => {
    if (store.balas >= 100 && !store.pajéApareceu) {
      setShowPajeIntro(true)
      setTimeout(() => {
        setShowPajeFala(true)
        useJackStore.setState({ pajéApareceu: true })
      }, 2000)
    }
  }, [store.balas, store.pajéApareceu])

  const handleCloseMonologo = useCallback(() => {
    store.limparMonologo()
  }, [])

  const titleDone = store.titleDone

  return (
    <div className="jack-body">
      {/* ASCII Rain */}
      <div className="jack-rain">
        {Array.from({ length: RAIN_COLS }, (_, i) => (
          <RainColumn key={i} index={i} />
        ))}
      </div>

      <div className="jack-content">
        {/* Avatar */}
        <div className="jdc-avatar">
          <img src={jackImg} alt="Jack" />
        </div>

        {/* Title */}
        <div className="jack-title">
          {titleText}
          {!showTitle && <span className="jack-cursor">█</span>}
        </div>

        {/* Intro text */}
        {showTitle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="jack-text jack-text--dim">você está dormindo.</p>
            <p className="jack-text jack-text--dim jack-text--amber">{NARRACOES.inicio}</p>
          </motion.div>
        )}

        {/* Tabs (after bengala) */}
        {store.flags.TEM_BENGALA && (
          <div className="jack-tabs">
            <button className={`jack-tab ${tab === 'balas' ? 'jack-tab--active' : ''}`} onClick={() => setTab('balas')}>balas</button>
            <button className={`jack-tab ${tab === 'inventario' ? 'jack-tab--active' : ''}`} onClick={() => setTab('inventario')}>inventário</button>
          </div>
        )}

        {/* Bala counter */}
        {showTitle && (tab === 'balas' || !store.flags.TEM_BENGALA) && (
          <>
            <p className="jack-counter">balas: {store.balas}</p>

            {store.balas < 100 && (
              <div className="jack-buttons">
                <button className="jack-btn" onClick={store.guardar}>[ guardar ]</button>
                <button className="jack-btn jack-btn--crimson" onClick={store.rolarNoChao} disabled={store.balas <= 0}>[ rolar no chão ]</button>
              </div>
            )}
          </>
        )}

        {/* Pajé aparece */}
        {showPajeIntro && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <p className="jack-text">{'>'} alguém apareceu.</p>
            <p className="jack-text">{'>'} um velho de bombeta preta e berimbau está parado na calçada.</p>
            <p className="jack-text">{'>'} ele tem uma barraca de souvenirs. no meio da madrugada.</p>
          </motion.div>
        )}

        {showPajeFala && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="jack-text jack-text--amber">[PAJÉ] "cheguei pra divar. eita se você tá precisando de equipamento."</p>
            <div className="jack-buttons">
              <button className="jack-btn jack-btn--amber" onClick={store.abrirBarraca}>[ ver barraca ]</button>
            </div>
          </motion.div>
        )}

        {/* Barraca modal */}
        <AnimatePresence>
          {store.mostraBarraca && (
            <motion.div
              className="jack-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="jack-modal"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
              >
                <div className="jack-modal-title">⟐ barraca do pajé</div>
                <div className="jack-modal-text">
                  {store.flags.TEM_BENGALA ? (
                    'o pajé acena. "volta quando quiser, fio."'
                  ) : (
                    <>
                      <p><span className="jack-text--amber">Bengala Steampunk</span> — 100 balas</p>
                      <p>bengala de madeira com engrenagens douradas. parece pesada. parece certa.</p>
                    </>
                  )}
                </div>
                <div className="jack-buttons">
                  {!store.flags.TEM_BENGALA && (
                    <button
                      className="jack-btn jack-btn--amber"
                      onClick={store.comprarBengala}
                      disabled={store.balas < 100}
                    >
                      {store.balas >= 100 ? '[ comprar ]' : `[ precisa de ${100 - store.balas} balas ]`}
                    </button>
                  )}
                  <button className="jack-btn" onClick={store.fecharBarraca}>[ sair ]</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pós-bengala */}
        {store.flags.TEM_BENGALA && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="jack-text jack-text--amber">você tem uma arma agora. no sonho isso significa alguma coisa.</p>
            <p className="jack-text jack-text--dim">a rua estava lá. sempre estava.</p>
            <div className="jack-buttons">
              {!questScreen && Object.values(AREAS).map(area => {
                const completa = store.areasCompletas.includes(area.id)
                const locked = area.id === 'rua' && !store.areasCompletas.includes('onibus')
                const locked2 = area.id === 'boteco' && !store.areasCompletas.includes('rua')
                if (locked || locked2) return null
                return (
                  <button
                    key={area.id}
                    className="jack-btn"
                    onClick={() => {
                      setQuestScreen(area.id)
                      store.iniciarQuest(area.id)
                    }}
                  >
                    {completa ? '✅ ' : ''}[ {area.nome} ] {completa ? `(${Math.floor(area.recompensa / 2)} balas)` : ''}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Quest screen */}
        {questScreen && (
          <QuestScreen areaId={questScreen} onBack={() => setQuestScreen(null)} />
        )}

        {/* Kim shop */}
        {store.flags.KIM_LIBERADO && !questScreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="jack-text jack-text--amber">[KIM] — sem olhar pra você</p>
            <p className="jack-text">"você sobreviveu. parabéns."</p>
            <div className="jack-buttons">
              <button className="jack-btn jack-btn--amber" onClick={store.abrirKimShop}>[ ver o que ele tem ]</button>
            </div>
          </motion.div>
        )}

        {/* Inventário tab */}
        {store.flags.TEM_BENGALA && tab === 'inventario' && (
          <div className="jack-inventario">
            <div className="jack-inventario-title">inventário</div>
            {store.inventario.length === 0 && <p className="jack-text jack-text--dim">vazio.</p>}
            {store.inventario.map((item, i) => (
              <div key={i} className="jack-item">
                <span className="jack-item-icon">{item.icone}</span>
                <span className="jack-item-nome">{item.nome}</span>
                <span className="jack-item-equipada">equipada</span>
              </div>
            ))}
          </div>
        )}

        {/* Balas tab (pos-bengala) */}
        {store.flags.TEM_BENGALA && tab === 'balas' && (
          <div className="jack-buttons">
            <button className="jack-btn" onClick={store.guardar}>[ guardar ]</button>
            <button className="jack-btn jack-btn--crimson" onClick={store.rolarNoChao} disabled={store.balas <= 0}>[ rolar no chão ]</button>
          </div>
        )}
      </div>

      {/* Kim shop modal */}
      <AnimatePresence>
        {store.kimShopAberto && (
          <motion.div className="jack-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="jack-modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="jack-modal-title">⟐ kim — miudezas</div>
              <div className="jack-modal-text">
                <p>kim não olha pra você enquanto fala.</p>
                <p>"pega o que precisa e vai."</p>
              </div>
              <div className="jack-buttons">
                <button className="jack-btn" onClick={store.comprarUpgradeBengala} disabled={store.balas < ((store.danoBengala || 1) >= 3 ? 300 : 200)}>
                  [ upgrade bengala +1 — {(store.danoBengala || 1) >= 3 ? '300' : '200'} balas ] (atual: +{store.danoBengala || 1})
                </button>
                <button className="jack-btn" onClick={store.comprarPocao} disabled={store.balas < 50}>
                  [ poção energética — 50 balas ] (HP máx +1)
                </button>
                <button className="jack-btn" onClick={store.fecharKimShop}>[ sair ]</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monólogo flutuante */}
      <AnimatePresence>
        {store.monologoAtual && (
          <motion.div
            className="jack-monologo"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={handleCloseMonologo}
          >
            <p className="jack-monologo-text">"{store.monologoAtual}"</p>
            <p className="jack-text jack-text--dim" style={{ fontSize: '0.65rem', marginTop: '0.3rem' }}>[ clique para fechar ]</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
