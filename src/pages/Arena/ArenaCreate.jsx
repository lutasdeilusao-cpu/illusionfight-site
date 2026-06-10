import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { useArenaStore } from './store/useArenaStore'

const ATTRS = ['F', 'H', 'R', 'A', 'PdF']
const ATTR_EMOJI = { F: '💪', H: '🎯', R: '🛡️', A: '🦾', PdF: '✨' }

const ELEM_CORES = {
  fogo:   { cor: '#FF4500', glow: 'rgba(255,69,0,0.2)' },
  agua:   { cor: '#00B4D8', glow: 'rgba(0,180,216,0.2)' },
  terra:  { cor: '#8B6914', glow: 'rgba(139,105,20,0.2)' },
  ar:     { cor: '#A8DADC', glow: 'rgba(168,218,220,0.2)' },
  trevas: { cor: '#9B59B6', glow: 'rgba(155,89,182,0.2)' },
  luz:    { cor: '#F5A623', glow: 'rgba(245,166,35,0.2)' },
  neutro: { cor: '#00B4D8', glow: 'rgba(0,180,216,0.15)' },
}

const ADV_COSTS = [1,1,2,1,2,2,1,1,1,1,1,2,1,2,1,2,2,4,1,2,1,2,1,1,3,1,1,2,1,2,1]
const DIS_GAINS = [1,1,1,2,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1]
const PERK_COSTS = [1,1,1,1,1,1]

const MANUAL_KEYS = ['fundamentos', 'atributos', 'combate', 'elementais', 'vantagens', 'xp']

function ManualBatalha() {
  const { t } = useLanguage()
  const [aberta, setAberta] = useState(null)
  return (
    <div className="arena-manual-sections">
      {MANUAL_KEYS.map(id => {
        const sec = t(`games.arena.manual.${id}`, { returnObjects: true })
        if (!sec) return null
        return (
          <div key={id} className="arena-manual-section">
            <button className={`arena-manual-section-btn ${aberta === id ? 'arena-manual-section-btn--open' : ''}`}
              onClick={() => setAberta(aberta === id ? null : id)}>
              {sec.titulo}
              <span className="arena-manual-section-arrow">{aberta === id ? '▲' : '▼'}</span>
            </button>
            {aberta === id && (
              <div className="arena-manual-section-body">
                {sec.conteudo && <pre className="arena-manual-pre">{sec.conteudo}</pre>}
                {sec.tabela && (
                  <table className="arena-manual-table"><tbody>
                    {sec.tabela.map((row, i) => (
                      <tr key={i}>
                        <td className="arena-manual-td-key">{row[0]}</td>
                        <td className="arena-manual-td-val">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody></table>
                )}
                {sec.extra && <pre className="arena-manual-pre arena-manual-pre--extra">{sec.extra}</pre>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function AdvTooltip({ label, desc, x, y }) {
  const style = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 260),
    top: y - 8,
    transform: 'translateY(-100%)',
    zIndex: 600,
    background: '#0d0d0d',
    border: '1px solid rgba(245,166,35,0.3)',
    padding: '10px 14px',
    maxWidth: 240,
    pointerEvents: 'none',
  }
  return (
    <div className="arena-adv-tooltip" style={style}>
      <div className="arena-adv-tooltip-label">{label}</div>
      <div className="arena-adv-tooltip-desc">{desc}</div>
    </div>
  )
}

export default function ArenaCreate({ onNavigate, skipIntro = false, onFirstVisit }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user } = useAuth()
  const store = useArenaStore()
  const [step, setStep] = useState(skipIntro ? 'attrs' : 'intro')
  const [errors, setErrors] = useState({})
  const [manualOpen, setManualOpen] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const longPressRef = useRef(null)

  useEffect(() => {
    if (!skipIntro && onFirstVisit) onFirstVisit()
  }, [])

  const s = store.sheet
  const attrs = s.attributes
  const points = store.points_available

  const ec = ELEM_CORES[s.elemental] || ELEM_CORES.neutro

  const validateStep = () => {
    const e = {}
    if (step === 'attrs' && points > 0) e.points = t('games.arena.erro_pontos')
    if (step === 'sheet_name' && !s.sheet_name?.trim()) e.name = t('games.arena.erro_nome')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAttrChange = (attr, delta) => {
    if (delta > 0 && points <= 0) return
    if (delta < 0 && attrs[attr] <= 0) return
    const newVal = attrs[attr] + delta
    if (newVal > 5) return
    store.updateSheet({ attributes: { ...attrs, [attr]: newVal } })
    if (delta > 0) store.spendPoints(1)
    else store.gainPoints(1)
  }

  const toggleFromList = (key, item) => {
    const list = s[key] || []
    const exists = list.find(x => x.label === item.label)
    store.updateSheet({ [key]: exists ? list.filter(x => x.label !== item.label) : [...list, item] })
  }

  const costMap = (list) => list.reduce((sum, x) => sum + (x.cost || x.gain || 0), 0)
  const advantageCost = costMap(s.advantages || [])
  const disadvantageGain = costMap(s.disadvantages || [])
  const perkCost = costMap(s.perks || [])
  const totalPoints = advantageCost + perkCost - disadvantageGain

  const handleAdvEnter = (e, item) => {
    const r = e.currentTarget.getBoundingClientRect()
    setTooltip({ label: item.label, desc: item.desc, x: r.left, y: r.top })
  }
  const handleAdvLeave = () => setTooltip(null)
  const handleAdvPointerDown = (e, item) => {
    longPressRef.current = setTimeout(() => {
      const r = e.currentTarget.getBoundingClientRect()
      setTooltip({ label: item.label, desc: item.desc, x: r.left, y: r.top })
    }, 400)
  }
  const handleAdvPointerUp = () => clearTimeout(longPressRef.current)

  const handleSalvar = async () => {
    if (!s.sheet_name?.trim()) { setErrors({ name: 'Dê um nome para sua ficha.' }); setStep('sheet_name'); return }
    if (totalPoints > 0) { setErrors({ cost: t('games.arena.erro_custo_pos') }); return }
    if (totalPoints < 0) { setErrors({ cost: t('games.arena.erro_custo_neg') }); return }
    await store.saveToCloud(user?.id)
    onNavigate('lobby')
  }

  const stepIndex = ['attrs', 'sheet_name', 'specs'].indexOf(step)

  return (
    <div className="arena-create">

      {/* INTRO */}
      {step === 'intro' && (
        <div className="arena-lobby" style={{ paddingTop: 60 }}>
          <div className="arena-lobby-hero">
            <p className="arena-lobby-titulo">{t('games.arena.modo_standalone')}</p>
            <h1 className="arena-lobby-nome" style={{ fontSize: 36 }}>{t('games.arena.nova_ficha')}</h1>
            <p className="arena-lobby-sub">{t('games.arena.intro_sabe_sistema')}</p>
          </div>
          <div className="arena-lobby-divider" />
          <div className="arc-intro-grid">
            <div className="arc-intro-card" onClick={() => setManualOpen(true)}>
              <div className="arc-intro-card-icon">📖</div>
              <div className="arc-intro-card-titulo">{t('games.arena.intro_ler_manual')}</div>
              <div className="arc-intro-card-sub">{t('games.arena.intro_ler_manual_sub')}</div>
            </div>
            <div className="arc-intro-card arc-intro-card--primary" onClick={() => setStep('attrs')}>
              <div className="arc-intro-card-icon">⚔️</div>
              <div className="arc-intro-card-titulo">{t('games.arena.intro_criar_direto')}</div>
              <div className="arc-intro-card-sub">{t('games.arena.intro_criar_direto_sub')}</div>
            </div>
          </div>
          <p className="arc-intro-hint" dangerouslySetInnerHTML={{ __html: t('games.arena.intro_dica_manual') }} />
        </div>
      )}

      {/* HEADER steps */}
      {step !== 'intro' && (
        <div className="arc-header">
          <BackToGamesBtn onClick={() => navigate('/games')} label="← EXTRAS" />
          <div className="arc-header-center">
            <p className="arena-lobby-titulo" style={{ margin: 0, fontSize: 10 }}>{t('games.arena.nova_ficha')}</p>
            {s.sheet_name && <p className="arc-header-name">{s.sheet_name}</p>}
          </div>
          <div className="arena-create-steps">
            {['attrs','sheet_name','specs'].map((st, i) => (
              <div key={st} className={`arena-create-step-dot ${step === st ? 'arena-create-step-dot--active' : i < stepIndex ? 'arena-create-step-dot--done' : ''}`} />
            ))}
          </div>
        </div>
      )}

      {/* STEP ATTRS */}
      {step === 'attrs' && (
        <div className="arc-step">
          <div className="arc-section-label">{t('games.arena.pag_atributos')} <span className="arc-pontos">{t('games.arena.attrs_pontos_restantes', { n: points })}</span></div>
          <div className="arc-attr-list">
            {ATTRS.map(attr => (
              <div key={attr} className="arc-attr-card">
                <div className="arc-attr-avatar">{ATTR_EMOJI[attr]}</div>
                <div className="arc-attr-info">
                  <div className="arc-attr-name">{t(`games.arena.attr_labels.${attr}`)}</div>
                  <div className="arc-attr-desc">{t(`games.arena.attr_desc.${attr}`)}</div>
                </div>
                <div className="arc-attr-controls">
                  <button className="arc-attr-btn" onClick={() => handleAttrChange(attr, -1)} disabled={attrs[attr] <= 0}>−</button>
                  <span className="arc-attr-val">{attrs[attr]}</span>
                  <button className="arc-attr-btn" onClick={() => handleAttrChange(attr, 1)} disabled={attrs[attr] >= 5 || points <= 0}>+</button>
                </div>
              </div>
            ))}
          </div>
          {errors.points && <p className="arena-err">{errors.points}</p>}
          <div className="arc-nav">
            <button className="arc-btn-ghost" onClick={() => onNavigate('lobby')}>{t('games.arena.btn_lobby')}</button>
            <button className="arc-btn-primary" onClick={() => { if (validateStep()) setStep('sheet_name') }}>{t('games.arena.btn_proximo')}</button>
          </div>
        </div>
      )}

      {/* STEP SHEET NAME */}
      {step === 'sheet_name' && (
        <div className="arc-step">
          <div className="arc-section-label">{t('games.arena.pag_identidade')}</div>

          <div className="arc-name-hero">
            <div className="arc-name-avatar" style={{ '--elem-cor': ec.cor, '--elem-glow': ec.glow, background: `radial-gradient(circle at 35% 35%, ${ec.cor}, #0a0a0a)`, boxShadow: `0 0 32px ${ec.glow}` }}>
              {s.sheet_name ? s.sheet_name[0].toUpperCase() : '?'}
            </div>
            <input
              className="arc-name-input"
              value={s.sheet_name || ''}
              onChange={e => { store.updateSheet({ sheet_name: e.target.value }); setErrors({}) }}
              placeholder={t('games.arena.placeholder_nome')}
              autoFocus
            />
            {errors.name && <p className="arena-err">{errors.name}</p>}
          </div>

          <div className="arc-section-label" style={{ marginTop: 24 }}>{t('games.arena.elemental')}</div>
          <div className="arc-elem-list">
            {(['fogo','agua','terra','ar','trevas','luz','neutro']).map(elemId => {
              const el = {
                id: elemId,
                emoji: { fogo:'🔥', agua:'💧', terra:'🪨', ar:'💨', trevas:'🌑', luz:'✨', neutro:'⚪' }[elemId],
                label: t(`games.arena.elements.${elemId}.label`),
                desc: t(`games.arena.elements.${elemId}.desc`),
              }
              const ecc = ELEM_CORES[el.id] || ELEM_CORES.neutro
              const active = s.elemental === el.id
              return (
                <div key={el.id}
                  className={`arc-elem-card ${active ? 'arc-elem-card--active' : ''}`}
                  style={{ '--elem-cor': ecc.cor, '--elem-glow': ecc.glow }}
                  onClick={() => store.updateSheet({ elemental: el.id })}>
                  <div className="arc-elem-avatar" style={{ background: active ? `radial-gradient(circle at 35% 35%, ${ecc.cor}, #0a0a0a)` : undefined, boxShadow: active ? `0 0 20px ${ecc.glow}` : undefined }}>
                    {el.emoji}
                  </div>
                  <div className="arc-elem-info">
                    <div className="arc-elem-name">{el.label}</div>
                    <div className="arc-elem-desc">{el.desc}</div>
                  </div>
                  {active && <span className="arc-elem-check">✓</span>}
                </div>
              )
            })}
          </div>

          <div className="arc-section-label" style={{ marginTop: 24 }}>{t('games.arena.arma')}</div>
          <input className="arc-text-input" value={s.weapon || ''} onChange={e => store.updateSheet({ weapon: e.target.value })} placeholder={t('games.arena.ex_arma')} />

          <div className="arc-nav">
            <button className="arc-btn-ghost" onClick={() => setStep('attrs')}>{t('games.arena.btn_voltar')}</button>
            <button className="arc-btn-primary" onClick={() => { if (validateStep()) setStep('specs') }}>{t('games.arena.btn_proximo')}</button>
          </div>
        </div>
      )}

      {/* STEP SPECS */}
      {step === 'specs' && (
        <div className="arc-step">
          <div className="arc-section-label">{t('games.arena.pag_pericias')}</div>
          <div className="arc-chip-grid">
            {[0,1,2,3,4,5,6,7,8,9].map(i => {
              const spec = t(`games.arena.specializations[${i}]`)
              const active = (s.specializations || []).includes(spec)
              return (
                <div key={spec} className={`arc-chip ${active ? 'arc-chip--active' : ''}`}
                  onClick={() => {
                    const list = s.specializations || []
                    store.updateSheet({ specializations: active ? list.filter(x => x !== spec) : [...list, spec] })
                  }}>
                  {spec}
                </div>
              )
            })}
          </div>

          <div className="arc-section-label" style={{ marginTop: 24 }}>{t('games.arena.vantagens')} <span className="arc-pontos">{advantageCost} pts</span></div>
          <div className="arc-chip-grid">
            {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map(i => {
              const advData = t(`games.arena.advantages[${i}]`, { returnObjects: true })
              if (!advData) return null
              const adv = { label: advData.label, desc: advData.desc, cost: ADV_COSTS[i] || 1 }
              const has = (s.advantages || []).find(x => x.label === adv.label)
              return (
                <div key={adv.label}
                  className={`arc-chip arc-chip--adv ${has ? 'arc-chip--adv-active' : ''}`}
                  onClick={() => toggleFromList('advantages', adv)}
                  onMouseEnter={e => handleAdvEnter(e, adv)}
                  onMouseLeave={handleAdvLeave}
                  onPointerDown={e => handleAdvPointerDown(e, adv)}
                  onPointerUp={handleAdvPointerUp}>
                  <span className="arc-chip-cost">{adv.cost}</span> {adv.label}
                </div>
              )
            })}
          </div>

          <div className="arc-section-label" style={{ marginTop: 24 }}>{t('games.arena.desvantagens')} <span className="arc-pontos arc-pontos--gain">+{disadvantageGain} pts</span></div>
          <div className="arc-chip-grid">
            {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(i => {
              const disData = t(`games.arena.disadvantages[${i}]`, { returnObjects: true })
              if (!disData) return null
              const dis = { label: disData.label, desc: disData.desc, gain: DIS_GAINS[i] || 1 }
              const has = (s.disadvantages || []).find(x => x.label === dis.label)
              return (
                <div key={dis.label}
                  className={`arc-chip arc-chip--dis ${has ? 'arc-chip--dis-active' : ''}`}
                  onClick={() => toggleFromList('disadvantages', dis)}
                  onMouseEnter={e => handleAdvEnter(e, dis)}
                  onMouseLeave={handleAdvLeave}
                  onPointerDown={e => handleAdvPointerDown(e, dis)}
                  onPointerUp={handleAdvPointerUp}>
                  <span className="arc-chip-cost">+{dis.gain}</span> {dis.label}
                </div>
              )
            })}
          </div>

          <div className="arc-section-label" style={{ marginTop: 24 }}>{t('games.arena.unicas')} <span className="arc-pontos">{perkCost} pts</span></div>
          <div className="arc-chip-grid">
            {[0,1,2,3,4,5].map(i => {
              const pData = t(`games.arena.perks[${i}]`, { returnObjects: true })
              if (!pData) return null
              const p = { label: pData.label, desc: pData.desc, cost: PERK_COSTS[i] || 1 }
              const has = (s.perks || []).find(x => x.label === p.label)
              return (
                <div key={p.label}
                  className={`arc-chip arc-chip--adv ${has ? 'arc-chip--adv-active' : ''}`}
                  onClick={() => toggleFromList('perks', p)}
                  onMouseEnter={e => handleAdvEnter(e, p)}
                  onMouseLeave={handleAdvLeave}
                  onPointerDown={e => handleAdvPointerDown(e, p)}
                  onPointerUp={handleAdvPointerUp}>
                  <span className="arc-chip-cost">{p.cost}</span> {p.label}
                </div>
              )
            })}
          </div>

          {errors.cost && <p className="arena-err">{errors.cost}</p>}
          <div className="arc-balance">
            {t('games.arena.balanco', { v: advantageCost, p: perkCost, d: disadvantageGain, total: totalPoints })}
          </div>

          <div className="arc-nav">
            <button className="arc-btn-ghost" onClick={() => setStep('sheet_name')}>{t('games.arena.btn_voltar')}</button>
            <button className="arc-btn-salvar" onClick={handleSalvar}>{t('games.arena.btn_salvar_lutar')}</button>
          </div>
        </div>
      )}

      {/* botão ? */}
      {step !== 'intro' && (
        <button className="arena-manual-btn" onClick={() => setManualOpen(true)} title={t('games.arena.manual_titulo')}>?</button>
      )}

      {/* drawer */}
      <div className={`arena-manual-drawer ${manualOpen ? 'arena-manual-drawer--open' : ''}`}>
        <div className="arena-manual-drawer-header">
          <span className="arena-manual-drawer-titulo">{t('games.arena.manual_titulo')}</span>
          <button className="arena-manual-drawer-close" onClick={() => setManualOpen(false)}>✕</button>
        </div>
        <div className="arena-manual-drawer-body"><ManualBatalha /></div>
      </div>
      {manualOpen && <div className="arena-manual-overlay" onClick={() => setManualOpen(false)} />}

      {tooltip && <AdvTooltip {...tooltip} />}
    </div>
  )
}