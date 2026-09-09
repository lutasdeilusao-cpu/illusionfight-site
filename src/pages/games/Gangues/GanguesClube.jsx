import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { sfx } from '../../../lib/sfx'
import './GanguesCena.css'
import './GanguesClube.css'

/* CLUBE DA LUTA — a roda clandestina do Nato. O jogador aceitou o 3º fiado
   (15×), foi VENDADO e largado aqui. Fluxo: cutscene do sequestro → um saguão
   curtinho pra andar (a "jaula" de espera) → porta da roda → combate
   (storyTarget.clube). O desfecho (dívida quitada / cresce) e o "te vendaram
   de novo e te largaram na pista" ficam na tela de vitória (GanguesVictory,
   branch clube). Nunca é game over. */

const SALA = { w: 340, h: 470 }
const SPAWN = { x: 170, y: 420 }
const PORTA = { x: 130, y: 40, w: 80, h: 44 }   // zona da porta da roda (topo)
const STEP = 18, TICK = 110, R = 16

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export default function GanguesClube({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const alvo = store.storyTarget
  const [fase, setFase] = useState('venda')       // venda | saguao | indo
  const [player, setPlayer] = useState(SPAWN)
  const [facing, setFacing] = useState('up')
  const inputRef = useRef({ x: 0, y: 0 })
  const keysRef = useRef(new Set())

  // Sem alvo de clube → não deveria estar aqui.
  useEffect(() => { if (!alvo?.clube) onNavigate('territorio') }, [alvo, onNavigate])

  // Cutscene do sequestro: ~4s ou toque pra pular.
  useEffect(() => {
    if (fase !== 'venda') return
    sfx.select?.()
    const to = setTimeout(() => setFase('saguao'), 4200)
    return () => clearTimeout(to)
  }, [fase])

  // Teclado (desktop).
  useEffect(() => {
    const down = e => { const k = e.key.toLowerCase(); if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) { e.preventDefault(); keysRef.current.add(k) } }
    const up = e => keysRef.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // Loop de passo.
  useEffect(() => {
    if (fase !== 'saguao') return
    let vivo = true, timer
    const passo = () => {
      if (!vivo) return
      const k = keysRef.current
      const ix = inputRef.current.x + (k.has('arrowright') || k.has('d') ? 1 : 0) - (k.has('arrowleft') || k.has('a') ? 1 : 0)
      const iy = inputRef.current.y + (k.has('arrowdown') || k.has('s') ? 1 : 0) - (k.has('arrowup') || k.has('w') ? 1 : 0)
      if (Math.hypot(ix, iy) > 0.35) {
        const dx = Math.abs(ix) >= Math.abs(iy) ? (ix > 0 ? 1 : -1) : 0
        const dy = dx === 0 ? (iy > 0 ? 1 : -1) : 0
        setFacing(dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up')
        setPlayer(p => ({ x: clamp(p.x + dx * STEP, R + 8, SALA.w - R - 8), y: clamp(p.y + dy * STEP, R + 8, SALA.h - R - 8) }))
      }
      timer = setTimeout(passo, TICK)
    }
    timer = setTimeout(passo, 0)
    return () => { vivo = false; clearTimeout(timer) }
  }, [fase])

  const naPorta = player.x + R > PORTA.x && player.x - R < PORTA.x + PORTA.w && player.y - R < PORTA.y + PORTA.h

  const entrarNaRoda = () => {
    if (fase !== 'saguao') return
    setFase('indo'); sfx.vs?.()
    store.setStoryTarget({ ...alvo, clube: true })
    onNavigate('story-combat')
  }

  return (
    <main className="gang-clube">
      <AnimatePresence>
        {fase === 'venda' && (
          <motion.div className="gang-clube-venda" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFase('saguao')}>
            <p>{t('games.gangues.clube.sequestro_1')}</p>
            <p>{t('games.gangues.clube.sequestro_2')}</p>
            <p>{t('games.gangues.clube.sequestro_3')}</p>
            <span className="gang-clube-venda-skip">{t('games.gangues.clube.pular')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="gang-clube-hud">
        <strong>{t('games.gangues.clube.nome')}</strong>
        <span>{t('games.gangues.clube.saguao_tag')}</span>
      </header>

      <div className="gang-clube-viewport">
        <div className="gang-clube-sala" style={{ width: SALA.w, height: SALA.h }}>
          <div className="gang-clube-porta" style={{ left: PORTA.x, top: PORTA.y, width: PORTA.w, height: PORTA.h }}>
            <span>{t('games.gangues.clube.roda')}</span>
          </div>
          <div className="gang-clube-luz" />
          <motion.div className={`gang-world-player is-gang facing-${facing}`} animate={{ left: player.x, top: player.y }} transition={{ duration: TICK / 1000, ease: 'easeOut' }}>
            <span><i /><i /><i /></span>
          </motion.div>
        </div>
      </div>

      {fase === 'saguao' && <p className="gang-clube-dica">{t(naPorta ? 'games.gangues.clube.dica_porta' : 'games.gangues.clube.dica_anda')}</p>}

      <div className="gang-world-controls">
        <Stick onInput={v => { inputRef.current = v }} />
        <button disabled={!naPorta || fase !== 'saguao'} onClick={entrarNaRoda}>
          <b>{naPorta ? t('games.gangues.clube.entrar') : '...'}</b>
          <span>{t('games.gangues.clube.interagir')}</span>
        </button>
      </div>
    </main>
  )
}

function Stick({ onInput }) {
  const base = useRef(null), active = useRef(null)
  const update = useCallback((x, y) => {
    const r = base.current?.getBoundingClientRect(); if (!r) return
    let dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy), max = 42
    if (d > max) { dx = dx / d * max; dy = dy / d * max }
    base.current.style.setProperty('--jx', `${dx}px`); base.current.style.setProperty('--jy', `${dy}px`)
    onInput({ x: dx / max, y: dy / max })
  }, [onInput])
  const stop = useCallback(() => {
    active.current = null
    if (base.current) { base.current.style.setProperty('--jx', '0px'); base.current.style.setProperty('--jy', '0px') }
    onInput({ x: 0, y: 0 })
  }, [onInput])
  return (
    <div ref={base} className="gang-world-stick"
      onPointerDown={e => { active.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); update(e.clientX, e.clientY) }}
      onPointerMove={e => { if (active.current === e.pointerId) update(e.clientX, e.clientY) }}
      onPointerUp={stop} onPointerCancel={stop}><i /></div>
  )
}
