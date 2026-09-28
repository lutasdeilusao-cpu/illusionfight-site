import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTutorialProgress } from '../../../../context/TutorialProgressContext'
import { textoEfeitoItem } from '../data/ganguesItens.js'
import { describeGanguesSpecialEffect } from '../engine/ganguesSpecialEffects.js'
import GangTip from './GangTip'
import './GanguesActionOrb.css'

const POS_KEY = 'ldi-gangues-orb-pos'
const ANCHORS = ['right-top', 'right-mid', 'right-bottom', 'left-top', 'left-mid', 'left-bottom']
function posSalva() { try { const v = localStorage.getItem(POS_KEY); return ANCHORS.includes(v) ? v : 'right-bottom' } catch { return 'right-bottom' } }
function salvarPos(pos) { try { localStorage.setItem(POS_KEY, pos) } catch {} }

// Tutorial do automático configurável (por CONTA — TutorialProgressContext),
// na 1ª vez que o painel AUTOMÁTICO abre.
const AUTO_TUTORIAL_ID = 'auto_config'
const AUTO_TUTORIAL_PASSOS = ['talento', 'pocao', 'derrota']

const pct = (v, max) => `${Math.max(0, Math.min(100, max > 0 ? (v / max) * 100 : 0))}%`

/** Menu de ação da luta (a "bolinha"), redesenhado na v3.73.0 (pedido do
 *  Isaias, 28/09/2026 — "precisa ser mais atual, mais direcionado pro que a
 *  gente está fazendo"). Arrasta pra qualquer um dos 6 cantos (posição salva
 *  por dispositivo); toque abre o painel:
 *   • cabeçalho de quem está na vez, com PV/PM;
 *   • ATACAR em destaque; TALENTO (cada um com custo e O QUE FAZ — pro
 *     jogador montar estratégia na luta difícil) e ITEM lado a lado;
 *   • AUTOMÁTICO: liga/desliga + ajuste (o que cada um usa e poção
 *     automática — ver escolherAcaoAuto em hooks/useGanguesModoAuto.js).
 *  Fechar SEMPRE volta pro começo (antes reabria na última aba). */
export default function GanguesActionOrb({
  t, atorNome, atorKey, disabled, equippedSpecials, canAffordSpecial, itens = [], aliados = [],
  onAtacar, onUsarPoder, onUsarItem, autoOn = false, autoBloqueado = false, onToggleAuto,
  autoConfig, onEscolherTalentoAuto, onAlternarPocaoAuto,
}) {
  const [pos, setPos] = useState(posSalva)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('menu') // 'menu' | 'poder' | 'item' | 'item-alvo' | 'auto'
  const [itemEscolhido, setItemEscolhido] = useState(null)
  const [drag, setDrag] = useState(null) // {dx,dy} enquanto arrasta, ou null
  const [tutorialPasso, setTutorialPasso] = useState(null)
  const dragRef = useRef({ dragging: false, moved: false, x: 0, y: 0 })
  const { jaViu, marcarVisto, carregado } = useTutorialProgress()

  const vpos = pos.split('-')[1]
  const ator = aliados.find(a => a.key === atorKey) || null
  const totalItens = itens.reduce((s, i) => s + i.quantidade, 0)

  const fechar = () => { setOpen(false); setTab('menu'); setItemEscolhido(null) }
  const abrirAuto = () => {
    setTab('auto')
    if (carregado && !jaViu(AUTO_TUTORIAL_ID)) setTutorialPasso(0)
  }
  const fecharTutorial = () => { setTutorialPasso(null); marcarVisto(AUTO_TUTORIAL_ID) }

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
    } else if (open) fechar()
    else setOpen(true)
    setDrag(null)
  }

  const animPainel = { initial: { opacity: 0, scale: 0.92, y: vpos === 'top' ? -8 : 8 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.92 } }
  const cabecalho = (titulo, voltarPara = 'menu') => (
    <div className="gang-orb-head">
      <button type="button" className="gang-orb-voltar" aria-label={t('games.gangues.orb.voltar')} onClick={() => { setTab(voltarPara); setItemEscolhido(null) }}>←</button>
      <span>{titulo}</span>
    </div>
  )
  const switchAuto = onToggleAuto && (
    <button
      type="button" role="switch" aria-checked={autoOn}
      className={`gang-orb-auto${autoOn ? ' gang-orb-auto--on' : ''}${autoBloqueado ? ' gang-orb-auto--lock' : ''}`}
      title={t(autoBloqueado ? 'games.gangues.auto.premium_titulo' : 'games.gangues.auto.switch_titulo')}
      onClick={() => onToggleAuto()}
    >
      <span className="gang-orb-auto__track"><span className="gang-orb-auto__dot" /></span>
      <span>{t('games.gangues.auto.switch_label')}{autoBloqueado && <b className="gang-orb-auto__crown"> 👑</b>}</span>
    </button>
  )

  return (
    <div className={`gang-orb-wrap gang-orb-wrap--${pos}`}>
      <div className={`gang-orb-menu gang-orb-menu--${vpos === 'top' ? 'baixo' : 'cima'}`}>
        <AnimatePresence mode="wait">
          {open && tab === 'menu' && (
            <motion.div key="menu" className="gang-orb-panel" {...animPainel}>
              {ator && (
                <div className="gang-orb-ator">
                  <span className="gang-orb-ator__eyebrow">{t('games.gangues.orb.na_vez')}</span>
                  <strong>{atorNome}</strong>
                  <div className="gang-orb-barra gang-orb-barra--pv" style={{ '--v': pct(ator.pv, ator.pvMax) }}><i /><small>PV {ator.pv}/{ator.pvMax}</small></div>
                  {ator.pmMax > 0 && <div className="gang-orb-barra gang-orb-barra--pm" style={{ '--v': pct(ator.pm, ator.pmMax) }}><i /><small>PM {ator.pm}/{ator.pmMax}</small></div>}
                </div>
              )}
              <button type="button" className="gang-orb-atacar" disabled={disabled || autoOn} onClick={() => { onAtacar(); fechar() }}>
                <b aria-hidden="true">⚔️</b>{t('games.gangues.orb.atacar')}
              </button>
              <div className="gang-orb-duas">
                <button type="button" className="gang-orb-opt gang-orb-opt--poder" disabled={disabled || autoOn} onClick={() => setTab('poder')}>
                  <b aria-hidden="true">✨</b>{t('games.gangues.orb.poder')}<em>{equippedSpecials.length}</em>
                </button>
                <button type="button" className="gang-orb-opt gang-orb-opt--item" disabled={autoOn} onClick={() => setTab('item')}>
                  <b aria-hidden="true">🎒</b>{t('games.gangues.orb.item')}<em>{totalItens}</em>
                </button>
              </div>
              {onToggleAuto && (
                <div className="gang-orb-auto-linha">
                  {switchAuto}
                  <button type="button" className="gang-orb-ajustar" onClick={abrirAuto}>{t('games.gangues.orb.auto_ajustar')}</button>
                </div>
              )}
            </motion.div>
          )}
          {open && tab === 'poder' && (
            <motion.div key="poder" className="gang-orb-panel" {...animPainel}>
              {cabecalho(t('games.gangues.orb.poder'))}
              {equippedSpecials.map(special => {
                const affordable = canAffordSpecial(special)
                const cost = special.effect.cost
                const desc = describeGanguesSpecialEffect(t, special.id, special.level)
                return (
                  <button
                    key={special.id} type="button" disabled={disabled || !affordable}
                    className="gang-orb-talento"
                    onClick={() => { onUsarPoder(special.id); fechar() }}
                  >
                    <span className="gang-orb-talento__topo">
                      <strong>{t(`games.gangues.progression.skills.${special.id}`)}</strong>
                      {cost && <em className={`gang-orb-custo gang-orb-custo--${cost.kind}`}>{t(`games.gangues.combat_specials.cost_${cost.kind}`, { n: cost.values[special.level - 1] })}</em>}
                    </span>
                    {desc && <small>{desc}</small>}
                    {!affordable && cost && <small className="gang-orb-talento__falta">{t('games.gangues.combat_specials.sem_' + cost.kind)}</small>}
                  </button>
                )
              })}
              {equippedSpecials.length === 0 && <p className="gang-orb-vazio">{t('games.gangues.combat_specials.sem_poderes')}</p>}
            </motion.div>
          )}
          {open && tab === 'item' && (
            <motion.div key="item" className="gang-orb-panel" {...animPainel}>
              {cabecalho(t('games.gangues.orb.item'))}
              {itens.map(item => (
                <button
                  key={item.id} type="button" disabled={disabled}
                  className="gang-orb-talento gang-orb-talento--item"
                  // Bombinha (debuff em TODOS os inimigos) não escolhe alvo —
                  // usa direto. Cura/buff escolhem o aliado na próxima tela.
                  onClick={() => {
                    if (item.tipo === 'debuff_inimigos') { onUsarItem(item.id, null); fechar(); return }
                    setItemEscolhido(item); setTab('item-alvo')
                  }}
                >
                  <span className="gang-orb-talento__topo">
                    <strong>{item.icone} {t(item.nome)}</strong>
                    <em className="gang-orb-custo">{t('games.gangues.orb.item_qtd', { n: item.quantidade })}</em>
                  </span>
                  <small>{textoEfeitoItem(t, item)}</small>
                </button>
              ))}
              {itens.length === 0 && <p className="gang-orb-vazio">{t('games.gangues.orb.item_vazio')}</p>}
            </motion.div>
          )}
          {open && tab === 'item-alvo' && itemEscolhido && (
            <motion.div key="item-alvo" className="gang-orb-panel" {...animPainel}>
              {cabecalho(`${itemEscolhido.icone} ${t(itemEscolhido.nome)} · ${t('games.gangues.orb.item_em_quem')}`, 'item')}
              {aliados.map(a => {
                // `poder_unico` não cura ninguém (é um golpe emprestado que
                // acerta o INIMIGO já selecionado fora do orb — ver
                // handleUsarItem em GanguesCombat.jsx) — nunca trava por
                // "já tá cheio". Buff (Pinga, Vela Benta) também nunca trava.
                const cheio = itemEscolhido.tipo === 'poder_unico' || itemEscolhido.tipo === 'buff' ? false : itemEscolhido.tipo === 'cura_pm' ? a.pm >= a.pmMax : a.pv >= a.pvMax
                return (
                  <button
                    key={a.key} type="button" disabled={disabled || a.dead || cheio}
                    className="gang-orb-talento"
                    onClick={() => { onUsarItem(itemEscolhido.id, a.key); fechar() }}
                  >
                    <span className="gang-orb-talento__topo"><strong>{a.nome}</strong></span>
                    <small>{a.dead ? t('games.gangues.orb.alvo_caido') : `PV ${a.pv}/${a.pvMax}${a.pmMax > 0 ? ` · PM ${a.pm}/${a.pmMax}` : ''}${cheio ? ` · ${t('games.gangues.orb.alvo_cheio')}` : ''}`}</small>
                  </button>
                )
              })}
            </motion.div>
          )}
          {open && tab === 'auto' && autoConfig && (
            <motion.div key="auto" className="gang-orb-panel" {...animPainel}>
              {cabecalho(t('games.gangues.auto.switch_label'))}
              {switchAuto}
              <span className="gang-orb-secao">{t('games.gangues.orb.auto_cada_um')}</span>
              {aliados.map(a => {
                const escolhido = autoConfig.talentos?.[a.id] || null
                return (
                  <div key={a.key} className="gang-orb-auto-membro">
                    <strong>{a.nome}</strong>
                    <div className="gang-orb-chips" role="radiogroup" aria-label={a.nome}>
                      <button type="button" role="radio" aria-checked={!escolhido} className={`gang-orb-chip${!escolhido ? ' is-on' : ''}`} onClick={() => onEscolherTalentoAuto(a.id, null)}>
                        {t('games.gangues.orb.auto_normal')}
                      </button>
                      {(a.especiais || []).map(s => (
                        <button key={s.id} type="button" role="radio" aria-checked={escolhido === s.id} className={`gang-orb-chip gang-orb-chip--talento${escolhido === s.id ? ' is-on' : ''}`} onClick={() => onEscolherTalentoAuto(a.id, s.id)}>
                          {t(`games.gangues.progression.skills.${s.id}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
              <button type="button" role="switch" aria-checked={autoConfig.pocao} className={`gang-orb-pocao${autoConfig.pocao ? ' is-on' : ''}`} onClick={onAlternarPocaoAuto}>
                <span className="gang-orb-auto__track"><span className="gang-orb-auto__dot" /></span>
                <span><strong>{t('games.gangues.orb.auto_pocao')}</strong><small>{t('games.gangues.orb.auto_pocao_desc')}</small></span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.button
        type="button"
        className={`gang-orb ${open ? 'gang-orb--aberto' : ''} ${autoOn && !open ? 'gang-orb--auto' : ''}`}
        style={drag ? { transform: `translate(${drag.dx}px, ${drag.dy}px)` } : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* O anel/glow de .gang-orb--auto já avisa que o automático tá ligado. */}
        {open ? '✕' : '👊'}
      </motion.button>
      <AnimatePresence>
        {tutorialPasso !== null && (
          <GangTip
            key={tutorialPasso}
            text={t(`games.gangues.orb.auto_tutorial.${AUTO_TUTORIAL_PASSOS[tutorialPasso]}`)}
            isLast={tutorialPasso === AUTO_TUTORIAL_PASSOS.length - 1}
            onNext={() => tutorialPasso === AUTO_TUTORIAL_PASSOS.length - 1 ? fecharTutorial() : setTutorialPasso(tutorialPasso + 1)}
            onSkip={fecharTutorial}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
