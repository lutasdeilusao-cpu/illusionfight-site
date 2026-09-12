import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'
import './GanguesClube.css'

/* CLUBE DA LUTA — tela de desfecho: fim do gauntlet (vitória), derrota em
   qualquer ronda, ou fuga no meio. Holofote, plateia em silhueta, grão de
   filme, faíscas / caco de caderneta na vitória, vinheta pulsando e
   dessaturação na derrota/fuga. O texto vem em BLOCOS que entram um a um
   (i18n array). Tudo CSS/framer + sfx sintetizado. */

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function Plateia() {
  return (
    <div className="gang-clube-plateia" aria-hidden="true">
      {Array.from({ length: 11 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
    </div>
  )
}

const ehFala = (s) => /^[«»"“”].+/.test(String(s).trim())
const limpaAspas = (s) => String(s).replace(/[«»]/g, '').trim()

// modo: 'vitoria' | 'derrota' | 'fuga'
export default function GanguesClubeResultado({ modo = 'derrota', entrouLimpo = false, divida = 0, onVoltar }) {
  const { t } = useLanguage()
  const R = useRef(prefersReduced()).current
  const venceu = modo === 'vitoria'
  const chave = venceu ? 'venceu' : modo === 'fuga' ? 'fuga' : 'perdeu'

  const titulo = t(`games.gangues.clube.${chave}_titulo`)
  const blocosKey = venceu
    ? (entrouLimpo ? 'games.gangues.clube.venceu_blocos_grana' : 'games.gangues.clube.venceu_blocos')
    : `games.gangues.clube.${chave}_blocos`
  const raw = t(blocosKey)
  const blocos = Array.isArray(raw) ? raw : String(raw).split('\n').filter(Boolean)

  const D0 = R ? 0.1 : 0.7          // atraso do 1º bloco (depois do título)
  const STEP = R ? 0.06 : 0.62      // entre blocos
  const [mostraBtn, setMostraBtn] = useState(false)

  useEffect(() => {
    let vivo = true
    const T = []
    if (venceu) {
      sfx.explosion?.()
      T.push(setTimeout(() => vivo && sfx.attackCritical?.(), 120))
      T.push(setTimeout(() => vivo && sfx.attackHeavy?.(), 320))
      T.push(setTimeout(() => vivo && sfx.vs?.(), 640))
      T.push(setTimeout(() => vivo && sfx.win?.(), 1500))
    } else {
      sfx.lose?.()
      T.push(setTimeout(() => vivo && sfx.heartbeat?.(), 500))
      T.push(setTimeout(() => vivo && sfx.heartbeat?.(), 1500))
      T.push(setTimeout(() => vivo && sfx.heartbeat?.(), 2600))
    }
    const btnMs = (R ? 400 : 900) + (D0 + blocos.length * STEP) * 1000 + 300
    T.push(setTimeout(() => vivo && setMostraBtn(true), btnMs))
    return () => { vivo = false; T.forEach(clearTimeout) }
  }, [venceu, R, blocos.length, D0, STEP])

  return (
    <main className={`gang-clube-cena gang-clube-cena--${venceu ? 'vitoria' : 'derrota'}${R ? ' is-reduced' : ''}`}>
      <div className="gang-clube-holofote" aria-hidden="true" />
      <Plateia />
      <div className="gang-clube-vinheta" aria-hidden="true" />
      <div className="gang-clube-grain" aria-hidden="true" />

      {venceu && !R && (
        <>
          <div className="gang-clube-flash" aria-hidden="true" />
          <div className="gang-clube-faiscas" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
          </div>
          <div className="gang-clube-papel" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, i) => <i key={i} style={{ '--i': i }} />)}
          </div>
        </>
      )}

      <div className="gang-clube-cena-conteudo">
        <motion.span className="gang-clube-cena-code"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          {t('games.gangues.clube.result_code')}
        </motion.span>

        <motion.h1 className="gang-clube-cena-titulo"
          initial={R ? { opacity: 0 } : { opacity: 0, scale: 1.35, filter: 'blur(6px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ delay: R ? 0.1 : 0.5, type: 'spring', stiffness: 220, damping: 12 }}>
          {titulo}
        </motion.h1>

        <div className="gang-clube-cena-regua" aria-hidden="true" />

        <div className="gang-clube-cena-blocos">
          {blocos.map((b, i) => (
            <motion.p key={i}
              className={`gang-clube-cena-bloco${ehFala(b) ? ' is-fala' : ''}${i === blocos.length - 1 ? ' is-fecho' : ''}`}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: D0 + i * STEP, duration: R ? 0.15 : 0.5 }}>
              {limpaAspas(b)}
            </motion.p>
          ))}
        </div>

        {!venceu && divida > 0 && (
          <motion.div className="gang-clube-cena-caderneta"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: D0 + blocos.length * STEP }}>
            {t('games.gangues.clube.sala_caderneta', { divida })}
          </motion.div>
        )}

        <AnimatePresence>
          {mostraBtn && (
            <motion.button className="gang-clube-cena-btn"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              onClick={onVoltar}>
              {t('games.gangues.clube.voltar')}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
