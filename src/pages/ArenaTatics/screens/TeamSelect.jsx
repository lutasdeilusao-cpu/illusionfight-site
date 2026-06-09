import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ROSTER } from '../data/roster'
import { getAllEquipamentos, ARMES, ARMADURAS, ACESSORIOS, calcularBonus } from '../data/equipment'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'

const EMOJI = { karuak: '🛡️', moraki: '🌪️', tivara: '🏹' }
const ELEM_COR = {
  fogo: '#FF4500', agua: '#1E90FF', terra: '#8B4513', vento: '#87CEEB',
  eletrico: '#FFD700', trevas: '#9932CC',
}

export default function TeamSelect({ isAdmin, onConfirm, maxSlots = 3 }) {
  const navigate = useNavigate()
  const [cards, setCards] = useState(() => ROSTER.map(r => ({ ...r, sel: false })))
  const [scrollX, setScrollX] = useState(0)
  const [detail, setDetail] = useState(null)
  const [equipando, setEquipando] = useState(null) // qual slot está selecionando: 'arma'|'armadura'|'acessorio'|null
  const [equipMap, setEquipMap] = useState({}) // { [rosterId]: { arma: {...}, armadura: {...}, acessorio: {...} } }
  const drag = useRef({ start: 0, offset: 0, down: false, moved: false })
  const ref = useRef(null)

  const sel = cards.filter(c => c.sel)
  const ok = sel.length >= 2 && sel.length <= maxSlots

  const CARD_W = 184 // 170px card + 14px gap
  const TOTAL_W = cards.length * CARD_W
  const MAX_SCROLL = 0
  const MIN_SCROLL = -(TOTAL_W - 280) // wraps when last card passes center

  const onDown = (x) => { drag.current = { start: x, offset: 0, down: true, moved: false } }
  const onMove = (x) => {
    if (!drag.current.down) return
    const dx = x - drag.current.start
    if (Math.abs(dx) > 4) drag.current.moved = true
    drag.current.offset = dx
    if (ref.current) { ref.current.style.transform = `translateX(${scrollX + dx}px)`; ref.current.style.transition = 'none' }
  }
  const onUp = () => {
    if (!drag.current.down) return
    drag.current.down = false
    if (!ref.current) return
    ref.current.style.transition = 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)'
    const d = drag.current.offset
    setScrollX(s => {
      let n = Math.abs(d) > 50 ? s + Math.sign(d) * CARD_W : s
      // Infinite wrap
      if (n < MIN_SCROLL) n = MAX_SCROLL
      else if (n > MAX_SCROLL) n = MIN_SCROLL
      ref.current.style.transform = `translateX(${n}px)`
      return n
    })
  }

  return (
    <div className="tatics-select">
      <div className="tatics-intro-bg" />
      <div className="tatics-intro-scanlines" />
      <div className="tatics-intro-vignette" />

      <div className="tatics-select-header">
        <div className="tatics-select-glitch">SELECIONAR ESQUADRÃO</div>
        <div className="tatics-select-sub">{isAdmin ? `Toque para ver · ${sel.length}/${maxSlots}` : 'SEUS PERSONAGENS'}</div>
      </div>

      <div className="tatics-select-car"
        onMouseDown={e => onDown(e.clientX)}
        onMouseMove={e => onMove(e.clientX)}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={e => onDown(e.touches[0].clientX)}
        onTouchMove={e => onMove(e.touches[0].clientX)}
        onTouchEnd={onUp}
      >
        <div className="tatics-select-cw">
          <div className="tatics-select-c" ref={ref} style={{ transform: `translateX(${scrollX}px)` }}>
            {cards.map(c => {
              const co = ELEM_COR[c.elemental] || '#00B4D8'
              return (
                <div key={c.id} className={`tatics-select-cd ${c.sel ? 'cd-sel' : ''}`}
                  style={{ '--cor-elem': co, borderColor: c.sel ? co : 'rgba(255,255,255,0.06)' }}
                  onClick={() => { if (!drag.current.moved) setDetail(c) }}
                >
                  <div className="tatics-select-ce">{EMOJI[c.classe] || '⚔️'}</div>
                  <div className="tatics-select-cn">{c.nome}</div>
                  <div className="tatics-select-cc">{c.classe.toUpperCase()}</div>
                  <div className="tatics-select-celem" style={{ color: co }}>{c.elemental.toUpperCase()}</div>
                  {isAdmin && (
                    <div className={`tatics-select-ck ${c.sel ? 'ck-on' : ''}`}
                      onClick={e => { e.stopPropagation(); setCards(p => { const s = p.find(x => x.id === c.id); if (s && !s.sel && p.filter(x => x.sel).length >= maxSlots) return p; return p.map(x => x.id === c.id ? { ...x, sel: !x.sel } : x) }) }}
                    >{c.sel ? '✓' : '+'}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {isAdmin && sel.length > 0 && (
        <div className="tatics-select-chips">
          {sel.map(c => (
            <div key={c.id} className="tatics-select-chip" style={{ '--cor-elem': ELEM_COR[c.elemental] || '#00B4D8' }}>
              {EMOJI[c.classe] || '⚔️'} {c.nome}
            </div>
          ))}
        </div>
      )}

      <motion.button className="tatics-select-go" whileTap={{ scale: 0.95 }}
        onClick={() => onConfirm(isAdmin ? sel.map(c => c.id) : [], equipMap)}
        disabled={!ok && isAdmin}
        style={{ opacity: ok || !isAdmin ? 1 : 0.35 }}
      >{isAdmin ? `BATALHAR (${sel.length})` : 'IR PARA BATALHA'}</motion.button>

      {/* FULL DETAIL */}
      <AnimatePresence>
        {detail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="tatics-detail-overlay-full" onClick={() => setDetail(null)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="tatics-detail-full" onClick={e => e.stopPropagation()}>
              <button className="tatics-detail-close" onClick={() => setDetail(null)}>✕</button>

              <div className="tatics-detail-top">
                <div className="tatics-detail-token-lg" style={{
                  background: `radial-gradient(circle at 35% 35%, ${ELEM_COR[detail.elemental]}44, #0a0a0a)`,
                  borderColor: ELEM_COR[detail.elemental] || '#00B4D8',
                }}>{EMOJI[detail.classe] || '⚔️'}</div>
                <div className="tatics-detail-nome-lg">{detail.nome}</div>
                <div className="tatics-detail-tipo" style={{ color: ELEM_COR[detail.elemental] || '#00B4D8' }}>
                  {detail.classe.toUpperCase()} · {detail.elemental.toUpperCase()}
                </div>
              </div>

              <div className="tatics-detail-stats-grid">
                {Object.entries(detail.atributos).map(([k, v]) => (
                  <div key={k} className="tatics-detail-stat-item">
                    <div className="tatics-detail-stat-label">{
                      k === 'forca' ? 'FOR' : k === 'velocidade' ? 'VEL' : k === 'resistencia' ? 'RES' :
                      k === 'energia' ? 'ENE' : k === 'precisao' ? 'PRE' : k === 'tenacidade' ? 'TEN' : k.toUpperCase()
                    }</div>
                    <div className="tatics-detail-stat-bar-bg">
                      <div className="tatics-detail-stat-bar-fill" style={{
                        width: `${(v / 20) * 100}%`,
                        background: `linear-gradient(90deg, ${ELEM_COR[detail.elemental] || '#00B4D8'}, ${ELEM_COR[detail.elemental] || '#00B4D8'}55)`,
                      }} />
                    </div>
                    <div className="tatics-detail-stat-val">{v}</div>
                  </div>
                ))}
              </div>

              <div className="tatics-detail-derived-bar">
                <div className="tatics-detail-derived-item">
                  <span>❤️</span>
                  <span className="tatics-detail-derived-num">{40 + detail.atributos.resistencia * 10}</span>
                  <span className="tatics-detail-derived-label">HP</span>
                </div>
                <div className="tatics-detail-derived-item">
                  <span>⚡</span>
                  <span className="tatics-detail-derived-num">{20 + detail.atributos.energia * 5}</span>
                  <span className="tatics-detail-derived-label">MP</span>
                </div>
                <div className="tatics-detail-derived-item">
                  <span>👣</span>
                  <span className="tatics-detail-derived-num">3</span>
                  <span className="tatics-detail-derived-label">ALC</span>
                </div>
              </div>

              <div className="tatics-detail-section">
                <div className="tatics-detail-section-title">EQUIPAMENTOS</div>
                <div className="tatics-detail-slots">
                  {[
                    { key: 'arma', label: 'Arma', lista: ARMES, icon: '⚔️' },
                    { key: 'armadura', label: 'Armadura', lista: ARMADURAS, icon: '🛡️' },
                    { key: 'acessorio', label: 'Acessório', lista: ACESSORIOS, icon: '💍' },
                  ].map(({ key, label, lista, icon }) => {
                    const eq = equipMap[detail.id]?.[key]
                    const bonus = calcularBonus(equipMap[detail.id] || {})
                    const eqBonus = eq ? `${eq.atq ? `+${eq.atq}ATQ` : ''}${eq.def ? ` +${eq.def}DEF` : ''}${eq.crit ? ` +${eq.crit}%CRIT` : ''}${eq.hp ? ` +${eq.hp}HP` : ''}`.trim() : null
                    return (
                      <div key={key} className={`tatics-detail-slot ${eq ? '' : 'vazio'}`}
                        onClick={isAdmin ? () => setEquipando(equipando === key ? null : key) : undefined}
                        style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                      >
                        <span className="tatics-detail-slot-icon">{eq ? icon : '○'}</span>
                        <span className="tatics-detail-slot-label">{eq ? eq.nome : label}</span>
                        {eq && <span className="tatics-detail-slot-bonus">{eqBonus || ''}</span>}
                      </div>
                    )
                  })}
                </div>
                {/* Painel de seleção de equipamento */}
                {equipando && isAdmin && (
                  <div className="tatics-equip-panel">
                    <div className="tatics-equip-panel-title">
                      SELECIONAR {equipando.toUpperCase()}
                      <button className="tatics-equip-close" onClick={() => setEquipando(null)}>✕</button>
                    </div>
                    <div className="tatics-equip-lista">
                      {(() => {
                        const lista = equipando === 'arma' ? ARMES : equipando === 'armadura' ? ARMADURAS : ACESSORIOS
                        return [
                          <div key="none" className={`tatics-equip-item ${!equipMap[detail.id]?.[equipando] ? 'eq-ativo' : ''}`}
                            onClick={() => { setEquipMap(p => ({ ...p, [detail.id]: { ...(p[detail.id] || {}), [equipando]: null } })); setEquipando(null) }}
                          >
                            <span className="tatics-equip-item-icon">✕</span>
                            <span className="tatics-equip-item-nome">Nenhum</span>
                          </div>,
                          ...lista.map(eq => {
                            const ativo = equipMap[detail.id]?.[equipando]?.id === eq.id
                            const eqBonus = `${eq.atq ? `+${eq.atq} ATQ ` : ''}${eq.def ? `+${eq.def} DEF ` : ''}${eq.crit ? `+${eq.crit}% CRIT ` : ''}${eq.hp ? `+${eq.hp} HP` : ''}`.trim()
                            return (
                              <div key={eq.id} className={`tatics-equip-item ${ativo ? 'eq-ativo' : ''}`}
                                onClick={() => { setEquipMap(p => ({ ...p, [detail.id]: { ...(p[detail.id] || {}), [equipando]: eq } })); setEquipando(null) }}
                              >
                                <span className="tatics-equip-item-icon">{ativo ? '✓' : '+'}</span>
                                <span className="tatics-equip-item-nome">{eq.nome}</span>
                                <span className="tatics-equip-item-bonus">{eqBonus}</span>
                                <span className="tatics-equip-item-desc">{eq.desc}</span>
                              </div>
                            )
                          })
                        ]
                      })()}
                    </div>
                  </div>
                )}
              </div>

              <div className="tatics-detail-section">
                <div className="tatics-detail-section-title">ITENS</div>
                <div className="tatics-detail-slots">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="tatics-detail-slot vazio">
                      <span className="tatics-detail-slot-icon">◇</span>
                      <span className="tatics-detail-slot-label">Vazio</span>
                    </div>
                  ))}
                </div>
              </div>

              {isAdmin && (
                <div className="tatics-detail-actions">
                  <motion.button whileTap={{ scale: 0.95 }} className="tatics-detail-action-btn"
                    style={{ '--cor-elem': ELEM_COR[detail.elemental] || '#00B4D8' }}
                    onClick={() => { setCards(p => { const s = p.find(x => x.id === detail.id); if (s && !s.sel && p.filter(x => x.sel).length >= maxSlots) return p; return p.map(x => x.id === detail.id ? { ...x, sel: !x.sel } : x) }); setDetail(null) }}
                  >{cards.find(c => c.id === detail.id)?.sel ? '− REMOVER' : '+ ADICIONAR'}</motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BackToGamesBtn onClick={() => navigate('/games')} style={{ marginTop: '1.5rem' }} />
    </div>
  )
}
