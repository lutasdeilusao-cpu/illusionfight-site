import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './GanguesActionOrb.css'

const POS_KEY = 'ldi-gangues-orb-pos'
const ANCHORS = ['right-top', 'right-mid', 'right-bottom', 'left-top', 'left-mid', 'left-bottom']
function posSalva() { try { const v = localStorage.getItem(POS_KEY); return ANCHORS.includes(v) ? v : 'right-bottom' } catch { return 'right-bottom' } }
function salvarPos(pos) { try { localStorage.setItem(POS_KEY, pos) } catch {} }

/** Botão flutuante único (a "bolinha") que substitui a barra de ação fixa —
 *  sem isso, a lista de golpes só cresce (mais poderes desbloqueados, agora
 *  também item) e a tela de combate ia ficando cada vez mais espremida.
 *  Arrasta pra qualquer um dos 6 cantos (topo/meio/base × direita/esquerda),
 *  posição salva por dispositivo. Toque abre um menu compacto: ATACAR (na
 *  hora), PODER (lista) ou ITEM (lista, hoje vazia — sem sistema de
 *  inventário ainda). */
export default function GanguesActionOrb({ t, disabled, equippedSpecials, canAffordSpecial, onAtacar, onUsarPoder }) {
  const [pos, setPos] = useState(posSalva)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('menu') // 'menu' | 'poder' | 'item'
  const [drag, setDrag] = useState(null) // {dx,dy} enquanto arrasta, ou null
  const dragRef = useRef({ dragging: false, moved: false, x: 0, y: 0 })

  const [side, vpos] = pos.split('-')

  const fechar = () => { setOpen(false); setTab('menu') }

  const onPointerDown = e => {
    dragRef.current = { dragging: true, moved: false, x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = e => {
    if (!dragRef.current.dragging) return
    const dx = e.clientX - dragRef.current.x, dy = e.clientY - dragRef.current.y
    if (Math.hypot(dx, dy) > 14) dragRef.current.moved = true
    if (dragRef.current.moved) setDrag({ dx, dy })
  }
  const onPointerUp = e => {
    if (!dragRef.current.dragging) return
    dragRef.current.dragging = false
    if (dragRef.current.moved) {
      const vw = window.innerWidth, vh = window.innerHeight
      const novoSide = e.clientX > vw / 2 ? 'right' : 'left'
      const novoVpos = e.clientY < vh * 0.34 ? 'top' : e.clientY > vh * 0.66 ? 'bottom' : 'mid'
      const novaPos = `${novoSide}-${novoVpos}`
      setPos(novaPos)
      salvarPos(novaPos)
    } else {
      setOpen(o => !o)
    }
    setDrag(null)
  }

  return (
    <div className={`gang-orb-wrap gang-orb-wrap--${pos}`}>
      <div className={`gang-orb-menu gang-orb-menu--${vpos === 'top' ? 'baixo' : 'cima'}`}>
        <AnimatePresence>
          {open && tab === 'menu' && (
            <motion.div key="menu" className="gang-orb-panel gang-orb-panel--menu" initial={{ opacity: 0, scale: 0.8, y: vpos === 'top' ? -8 : 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}>
              <button type="button" className="gang-orb-opt gang-orb-opt--atacar" disabled={disabled} onClick={() => { onAtacar(); fechar() }}>
                <b>⚔️</b>{t('games.gangues.orb.atacar')}
              </button>
              <button type="button" className="gang-orb-opt gang-orb-opt--poder" disabled={disabled} onClick={() => setTab('poder')}>
                <b>✨</b>{t('games.gangues.orb.poder')}
              </button>
              <button type="button" className="gang-orb-opt gang-orb-opt--item" onClick={() => setTab('item')}>
                <b>🎒</b>{t('games.gangues.orb.item')}
              </button>
            </motion.div>
          )}
          {open && tab === 'poder' && (
            <motion.div key="poder" className="gang-orb-panel gang-orb-panel--lista" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="gang-orb-panel-head">
                <button type="button" className="gang-orb-voltar" onClick={() => setTab('menu')}>←</button>
                <span>{t('games.gangues.orb.poder')}</span>
              </div>
              {equippedSpecials.map(special => {
                const affordable = canAffordSpecial(special)
                const cost = special.effect.cost
                const custoTxt = cost ? cost.values[special.level - 1] : null
                return (
                  <button
                    key={special.id} type="button" disabled={disabled || !affordable}
                    className={`gang-orb-item-btn ${!affordable ? 'gang-orb-item-btn--sem-recurso' : ''}`}
                    onClick={() => { onUsarPoder(special.id); fechar() }}
                  >
                    {t(`games.gangues.progression.skills.${special.id}`)}
                    {cost && <small>{t(`games.gangues.combat_specials.cost_${cost.kind}`, { n: custoTxt })}{!affordable && ` · ${t('games.gangues.combat_specials.sem_' + cost.kind)}`}</small>}
                  </button>
                )
              })}
              {equippedSpecials.length === 0 && <p className="gang-orb-vazio">{t('games.gangues.combat_specials.sem_poderes')}</p>}
            </motion.div>
          )}
          {open && tab === 'item' && (
            <motion.div key="item" className="gang-orb-panel gang-orb-panel--lista" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="gang-orb-panel-head">
                <button type="button" className="gang-orb-voltar" onClick={() => setTab('menu')}>←</button>
                <span>{t('games.gangues.orb.item')}</span>
              </div>
              <p className="gang-orb-vazio">{t('games.gangues.orb.item_vazio')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.button
        type="button"
        className={`gang-orb ${open ? 'gang-orb--aberto' : ''}`}
        style={drag ? { transform: `translate(${drag.dx}px, ${drag.dy}px)` } : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {open ? '✕' : '👊'}
      </motion.button>
    </div>
  )
}
