import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useGanguesStore } from '../store/useGanguesStore'
import { sfx } from '../../../../lib/sfx'
import './GanguesClube.css'

/* CLUBE DA LUTA — a SALA do Nato entre as rondas do gauntlet.
   Você aguentou a ronda; volta pro corredor de tela de arame e o Nato te
   encara. Ele oferece te ajeitar (cura tudo, mas engorda a caderneta) ou você
   encara a próxima do jeito que tá. Não dá pra sair — "esse foi só o começo". */

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

export default function GanguesClubeSala({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const alvo = store.storyTarget
  const ronda = Number(alvo?.clubeRonda) || 1        // a ronda que ACABOU de vencer
  const [fase, setFase] = useState('impacto')        // impacto → nato
  const [indo, setIndo] = useState(false)
  const reduced = useRef(prefersReduced())

  const feridos = useMemo(
    () => (store._deficitTropa?.() || []).filter(d => d.pv > 0 || d.pm > 0),
    [store],
  )
  const divida = Math.round(store.storyProgress?.__birosca?.divida || 0)

  useEffect(() => { if (!alvo?.clube) onNavigate('territorio') }, [alvo, onNavigate])

  useEffect(() => {
    sfx.explosion?.()
    const t1 = setTimeout(() => sfx.nextRound?.(), 220)
    const t2 = setTimeout(() => { setFase('nato'); sfx.heartbeat?.() }, reduced.current ? 300 : 1900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const proximaRonda = (comAjeite) => {
    if (indo) return
    setIndo(true)
    sfx.vs?.()
    let heals = Number(alvo?.clubeHeals) || 0
    if (comAjeite) { store.curarNoClubeSala(); heals += 1; sfx.cancel?.() }
    store.setStoryTarget({ ...alvo, clube: true, clubeRonda: ronda + 1, clubeHeals: heals })
    onNavigate('story-combat')
  }
  const vazar = () => {
    if (indo) return
    setIndo(true)
    sfx.cancel?.()
    store.desistirDoClube()
    onNavigate('clube-fuga')
  }

  return (
    <main className={`gang-clube-cena gang-clube-cena--sala${reduced.current ? ' is-reduced' : ''}`}>
      <div className="gang-clube-holofote" aria-hidden="true" />
      <Plateia />
      <div className="gang-clube-vinheta" aria-hidden="true" />
      <div className="gang-clube-grain" aria-hidden="true" />

      <AnimatePresence mode="wait">
        {fase === 'impacto' ? (
          <motion.div key="impacto" className="gang-clube-impacto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.span className="gang-clube-impacto-tag"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              {t('games.gangues.clube.sala_ronda', { n: ronda })}
            </motion.span>
            <motion.h1 className="gang-clube-impacto-titulo"
              initial={reduced.current ? { opacity: 0 } : { opacity: 0, scale: 1.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 11 }}>
              {t('games.gangues.clube.sala_titulo')}
            </motion.h1>
          </motion.div>
        ) : (
          <motion.div key="nato" className="gang-clube-sala-nato"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <div className="gang-clube-nato-vulto" aria-hidden="true"><i className="gang-clube-nato-brasa" /></div>

            <p className="gang-clube-nato-fala">
              {t(ronda >= 2 ? 'games.gangues.clube.sala_nato_2' : 'games.gangues.clube.sala_nato_1')}
            </p>

            <div className="gang-clube-sala-tropa">
              {feridos.length > 0
                ? t('games.gangues.clube.sala_tropa_ferida', { n: feridos.length })
                : t('games.gangues.clube.sala_tropa_ok')}
            </div>

            <div className="gang-clube-sala-caderneta">
              {t('games.gangues.clube.sala_caderneta', { divida })}
            </div>

            <div className="gang-clube-sala-acoes">
              <button className="gang-clube-cena-btn gang-clube-cena-btn--ghost" disabled={indo}
                onClick={() => proximaRonda(false)}>
                {t('games.gangues.clube.sala_entrar')}
              </button>
              <button className="gang-clube-cena-btn" disabled={indo || feridos.length === 0}
                onClick={() => proximaRonda(true)}>
                {t('games.gangues.clube.sala_ajeitar')}
                <small>{t('games.gangues.clube.sala_ajeitar_aviso', { antes: divida, depois: divida * 2 })}</small>
              </button>
              <button className="gang-clube-cena-btn gang-clube-cena-btn--sair" disabled={indo}
                onClick={vazar}>
                {t('games.gangues.clube.sala_vazar')}
                <small>{t('games.gangues.clube.sala_vazar_aviso', { divida })}</small>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
