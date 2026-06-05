import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/useGameStore'
import { useAuth } from '../../context/AuthContext'
import { ATTR_TOOLTIPS, ADVANTAGES, DISADVANTAGES, PERKS, SPECIALIZATIONS } from './data/characterData'
import './LDI.css'

const STEPS = [
  {
    id: 'movimento',
    question: 'Como você prefere se mover no LDI?',
    options: [
      { label: 'Explosão e velocidade — entrar quebrando tudo', effect: { F: 2, H: 1 }, flag: 'ESTILO_VELOZ' },
      { label: 'Silêncio e precisão — passar despercebido', effect: { H: 2, A: 1 }, flag: 'ESTILO_SIGILO' },
      { label: 'Resistência e presença — ninguém te tira do lugar', effect: { R: 2, F: 1 }, flag: 'ESTILO_TANQUE' },
    ],
  },
  {
    id: 'elemento',
    question: 'Seu elemento foi detectado...',
    options: [
      { label: 'Aceitar o elemento que o sistema escolheu (Fogo)', effect: {}, flag: 'ELEMENTO_ACEITO', elemental: 'fogo' },
      { label: 'Recusar — o sistema errou (Água)', effect: {}, flag: 'ELEMENTO_RECUSADO', elemental: 'agua' },
    ],
  },
  {
    id: 'arma',
    question: 'Qual kit de combate você quer começar?',
    options: [
      { label: 'Katana de Dados — alcance e precisão', effect: { F: 1 }, flag: 'ARMA_KATANA', weapon: 'katana' },
      { label: 'Lâminas Gêmeas — velocidade e dupla investida', effect: { H: 1 }, flag: 'ARMA_LAMINAS', weapon: 'laminas' },
      { label: 'Lâmina de Corrente — versatilidade e defesa', effect: { A: 1 }, flag: 'ARMA_CORRENTE', weapon: 'corrente' },
    ],
  },
  {
    id: 'proposito',
    question: 'O que você quer alcançar no LDI?',
    options: [
      { label: 'Poder — chegar ao topo do ranking', effect: { F: 1, H: 1 }, flag: 'PROPOSITO_PODER' },
      { label: 'Conhecimento — desvendar os segredos do sistema', effect: { R: 1, PdF: 1 }, flag: 'PROPOSITO_CONHECIMENTO' },
      { label: 'Conexão — construir alianças e história', effect: { A: 1, H: 1 }, flag: 'PROPOSITO_CONEXAO' },
    ],
  },
]

const ATTR_NAMES = {
  F: 'Potência',
  H: 'Agilidade',
  R: 'Resistência',
  A: 'Proteção',
  PdF: 'Poder Elemental',
}

const ELEMENTAL_OPTIONS = [
  { value: 'fogo', label: 'Fogo', color: '#E02020' },
  { value: 'agua', label: 'Água', color: '#1E6FBF' },
  { value: 'terra', label: 'Terra', color: '#8B5E3C' },
  { value: 'ar', label: 'Ar', color: '#A0D2DB' },
  { value: 'trevas', label: 'Trevas', color: '#6B2FA0' },
  { value: 'luz', label: 'Luz', color: '#FFD700' },
  { value: 'neutro', label: 'Neutro', color: '#8B8F96' },
]

const WEAPON_OPTIONS = [
  { value: 'katana', label: 'Katana de Dados' },
  { value: 'laminas', label: 'Lâminas Gêmeas' },
  { value: 'corrente', label: 'Lâmina de Corrente' },
]

export default function Create() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { sheet, updateSheet, applySceneEffect, setFlag, saveToCloud } = useGameStore()
  const [tab, setTab] = useState(searchParams.get('mode') === 'full' ? 'full' : 'guided')
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [showFinal, setShowFinal] = useState(false)
  const [freePoints, setFreePoints] = useState(3)
  const [tempAttr, setTempAttr] = useState({ F: 0, H: 0, R: 0, A: 0, PdF: 0 })
  const [flags, setFlags] = useState([])
  const [chosenWeapon, setChosenWeapon] = useState('')
  const [chosenElemental, setChosenElemental] = useState('')
  const [tooltipAttr, setTooltipAttr] = useState(null)
  // Full form state
  const [selectedAdvantages, setSelectedAdvantages] = useState([])
  const [selectedDisadvantages, setSelectedDisadvantages] = useState([])
  const [selectedPerks, setSelectedPerks] = useState([])
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [fullFreePoints, setFullFreePoints] = useState(10)
  const [fullAttr, setFullAttr] = useState({ F: 0, H: 0, R: 0, A: 0, PdF: 0 })
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    const state = useGameStore.getState()
    if (state.sheet?.sheet_name) {
      navigate('/games/ldi/game', { replace: true })
    }
  }, [navigate])

  // === GUIDED FLOW ===

  const handleOption = (opt) => {
    const newAttr = { ...tempAttr }
    if (opt.effect) {
      for (const [k, v] of Object.entries(opt.effect)) {
        const val = (newAttr[k] || 0) + v
        newAttr[k] = Math.min(val, 4)
      }
    }
    setTempAttr(newAttr)
    if (opt.flag) setFlags(f => [...f, opt.flag])
    if (opt.weapon) setChosenWeapon(opt.weapon)
    if (opt.elemental) setChosenElemental(opt.elemental)
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      setShowFinal(true)
    }
  }

  const handleFreePoint = (attr) => {
    if (freePoints <= 0) return
    const current = tempAttr[attr] || 0
    if (current >= 4) return
    setTempAttr(p => ({ ...p, [attr]: current + 1 }))
    setFreePoints(p => p - 1)
  }

  const handleRemovePoint = (attr) => {
    if ((tempAttr[attr] || 0) <= 0 || freePoints >= 3) return
    setTempAttr(p => ({ ...p, [attr]: Math.max(0, (p[attr] || 0) - 1) }))
    setFreePoints(p => p + 1)
  }

  const handleFinishGuided = () => {
    let finalAttr = { ...tempAttr }
    if (!finalAttr.R || finalAttr.R < 1) {
      const shortage = 1 - (finalAttr.R || 0)
      if (finalAttr.F > 1) { finalAttr.F -= shortage; finalAttr.R = 1 }
      else if (finalAttr.H > 1) { finalAttr.H -= shortage; finalAttr.R = 1 }
      else { finalAttr.R = 1 }
    }
    for (const k of Object.keys(finalAttr)) {
      if (finalAttr[k] > 4) finalAttr[k] = 4
    }
    updateSheet({
      sheet_name: name || 'Aventureiro',
      attributes: finalAttr,
      weapon: chosenWeapon,
      elemental: chosenElemental,
      advantages: [],
      disadvantages: [],
      perks: [],
      specializations: [],
      special_skills: [],
    })
    flags.forEach(f => setFlag(f))
    const pvMax = Math.max(1, finalAttr.R * 5)
    const pmMax = Math.max(2, finalAttr.PdF * 4)
    useGameStore.getState().updateSave({
      pv_current: pvMax,
      pm_current: pmMax,
      current_scene_id: '1.2',
    })
    if (user) saveToCloud(user.id)
    navigate('/games/ldi/game', { replace: true })
  }

  // === FULL FORM ===

  const totalAdvantageCost = selectedAdvantages.reduce((sum, id) => {
    const a = ADVANTAGES.find(x => x.id === id)
    return sum + (a?.cost || 0)
  }, 0)
  const totalDisadvantageGain = selectedDisadvantages.reduce((sum, id) => {
    const d = DISADVANTAGES.find(x => x.id === id)
    return sum + (d?.gain || 0)
  }, 0)
  const totalPerkCost = selectedPerks.reduce((sum, id) => {
    const p = PERKS.find(x => x.id === id)
    return sum + (p?.cost || 0)
  }, 0)
  const spentOnAdvantagesAndPerks = totalAdvantageCost + totalPerkCost
  const availablePoints = fullFreePoints + totalDisadvantageGain - spentOnAdvantagesAndPerks

  const toggleAdvantage = (id) => {
    setSelectedAdvantages(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleDisadvantage = (id) => {
    setSelectedDisadvantages(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const togglePerk = (id) => {
    setSelectedPerks(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleFullAttrChange = (attr, delta) => {
    const current = fullAttr[attr] || 0
    const newVal = current + delta
    if (newVal < 0 || newVal > 4) return
    const pointCost = delta > 0 ? 1 : -1
    if (delta > 0 && availablePoints < 1) return
    setFullAttr(p => ({ ...p, [attr]: newVal }))
    setFullFreePoints(p => p - pointCost)
  }

  const handleFinishFull = () => {
    if (availablePoints !== 0) return
    let finalAttr = { ...fullAttr }
    if (!finalAttr.R || finalAttr.R < 1) finalAttr.R = 1
    for (const k of Object.keys(finalAttr)) {
      if (finalAttr[k] > 4) finalAttr[k] = 4
    }
    updateSheet({
      sheet_name: fullName || 'Aventureiro',
      attributes: finalAttr,
      weapon: chosenWeapon || 'katana',
      elemental: chosenElemental || 'neutro',
      advantages: selectedAdvantages,
      disadvantages: selectedDisadvantages,
      perks: selectedPerks,
      specializations: selectedSpecialization ? [selectedSpecialization] : [],
      special_skills: [],
    })
    const pvMax = Math.max(1, finalAttr.R * 5)
    const pmMax = Math.max(2, finalAttr.PdF * 4)
    useGameStore.getState().updateSave({
      pv_current: pvMax,
      pm_current: pmMax,
      current_scene_id: '1.2',
    })
    if (user) saveToCloud(user.id)
    navigate('/games/ldi/game', { replace: true })
  }

  // === RENDER ===

  if (tab === 'full') {
    return (
      <div className="ldi-create">
        <motion.div className="ldi-create-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="ldi-create-tabs">
            <button className="ldi-create-tab" onClick={() => setTab('guided')}>Guiado</button>
            <button className="ldi-create-tab ldi-create-tab--active">Ficha Completa</button>
          </div>
          <h2 className="ldi-create-title">Construir do Zero</h2>
          <p className="ldi-create-sub">Distribua seus pontos livremente.</p>

          <div className="ldi-full-name">
            <label>Nome do Avatar:</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Digite seu nome..." className="ldi-input" />
          </div>

          <div className="ldi-full-section-title">Atributos</div>
          <div className="ldi-full-budget">Pontos disponíveis: {availablePoints}</div>
          <div className="ldi-full-attrs">
            {Object.entries(ATTR_NAMES).map(([key, label]) => (
              <div key={key} className="ldi-full-attr-row">
                <div className="ldi-full-attr-info">
                  <span
                    className="ldi-full-attr-label"
                    onMouseEnter={() => setTooltipAttr(key)}
                    onMouseLeave={() => setTooltipAttr(null)}
                  >
                    {label}
                    <span className="ldi-tooltip-icon">ⓘ</span>
                  </span>
                  <AnimatePresence>
                    {tooltipAttr === key && (
                      <motion.div
                        className="ldi-tooltip"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        {ATTR_TOOLTIPS[key]}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="ldi-full-attr-controls">
                  <button className="ldi-stat-btn" onClick={() => handleFullAttrChange(key, -1)} disabled={(fullAttr[key] || 0) <= 0}>−</button>
                  <span className="ldi-create-stat-value">{fullAttr[key] || 0}</span>
                  <button className="ldi-stat-btn" onClick={() => handleFullAttrChange(key, 1)} disabled={(fullAttr[key] || 0) >= 4 || availablePoints < 1}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="ldi-full-section-title">Elemento</div>
          <div className="ldi-full-elemental-grid">
            {ELEMENTAL_OPTIONS.map(el => (
              <button
                key={el.value}
                className={`ldi-full-elemental-btn ${chosenElemental === el.value ? 'ldi-full-elemental-btn--active' : ''}`}
                onClick={() => setChosenElemental(el.value)}
                style={chosenElemental === el.value ? { borderColor: el.color, color: el.color } : {}}
              >
                <span style={{ color: el.color }}>●</span> {el.label}
              </button>
            ))}
          </div>

          <div className="ldi-full-section-title">Arma</div>
          <div className="ldi-full-weapon-grid">
            {WEAPON_OPTIONS.map(w => (
              <button
                key={w.value}
                className={`ldi-full-weapon-btn ${chosenWeapon === w.value ? 'ldi-full-weapon-btn--active' : ''}`}
                onClick={() => setChosenWeapon(w.value)}
              >
                {w.label}
              </button>
            ))}
          </div>

          <div className="ldi-full-section-title">Vantagens <span className="ldi-full-points-label">(custam pontos)</span></div>
          <div className="ldi-full-list">
            {ADVANTAGES.map(a => {
              const selected = selectedAdvantages.includes(a.id)
              return (
                <div key={a.id} className={`ldi-full-item ${selected ? 'ldi-full-item--selected' : ''}`} onClick={() => toggleAdvantage(a.id)}>
                  <div className="ldi-full-item-header">
                    <span className="ldi-full-item-name">{a.name}</span>
                    <span className="ldi-full-item-cost">Custo: {a.cost}</span>
                  </div>
                  <p className="ldi-full-item-desc">{a.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="ldi-full-section-title">Desvantagens <span className="ldi-full-points-label">(concedem pontos)</span></div>
          <div className="ldi-full-list">
            {DISADVANTAGES.map(d => {
              const selected = selectedDisadvantages.includes(d.id)
              return (
                <div key={d.id} className={`ldi-full-item ${selected ? 'ldi-full-item--selected' : ''}`} onClick={() => toggleDisadvantage(d.id)}>
                  <div className="ldi-full-item-header">
                    <span className="ldi-full-item-name">{d.name}</span>
                    <span className="ldi-full-item-gain">Ganho: +{d.gain}</span>
                  </div>
                  <p className="ldi-full-item-desc">{d.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="ldi-full-section-title">Perícias <span className="ldi-full-points-label">(custam pontos)</span></div>
          <div className="ldi-full-list">
            {PERKS.map(p => {
              const selected = selectedPerks.includes(p.id)
              return (
                <div key={p.id} className={`ldi-full-item ${selected ? 'ldi-full-item--selected' : ''}`} onClick={() => togglePerk(p.id)}>
                  <div className="ldi-full-item-header">
                    <span className="ldi-full-item-name">{p.name}</span>
                    <span className="ldi-full-item-cost">Custo: {p.cost}</span>
                  </div>
                  <p className="ldi-full-item-desc">{p.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="ldi-full-section-title">Especialização</div>
          <div className="ldi-full-list">
            {SPECIALIZATIONS.map(sp => (
              <div
                key={sp.id}
                className={`ldi-full-item ${selectedSpecialization === sp.id ? 'ldi-full-item--selected' : ''}`}
                onClick={() => setSelectedSpecialization(prev => prev === sp.id ? '' : sp.id)}
              >
                <div className="ldi-full-item-header">
                  <span className="ldi-full-item-name">{sp.name}</span>
                </div>
                <p className="ldi-full-item-desc">{sp.desc}</p>
              </div>
            ))}
          </div>

          <div className="ldi-full-summary">
            <span>Vantagens: -{totalAdvantageCost}</span>
            <span>Desvantagens: +{totalDisadvantageGain}</span>
            <span>Perícias: -{totalPerkCost}</span>
            <span>Atributos gastos: {10 - fullFreePoints}</span>
            <span className="ldi-full-total">Disponível: {availablePoints}</span>
          </div>

          <button
            className="ldi-btn ldi-btn--primary"
            onClick={handleFinishFull}
            disabled={availablePoints !== 0}
            style={{
              marginTop: '1rem',
              opacity: availablePoints !== 0 ? 0.5 : 1,
              cursor: availablePoints !== 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {availablePoints > 0 ? 'Distribua todos os pontos antes de continuar' : availablePoints < 0 ? 'Você ultrapassou o limite de pontos' : 'ENTRAR NO LDI'}
          </button>
        </motion.div>
      </div>
    )
  }

  if (showFinal) {
    return (
      <div className="ldi-create">
        <div className="ldi-create-tabs">
          <button className="ldi-create-tab ldi-create-tab--active" onClick={() => setTab('guided')}>Guiado</button>
          <button className="ldi-create-tab" onClick={() => setTab('full')}>Ficha Completa</button>
        </div>
        <motion.div className="ldi-create-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="ldi-create-title">Ajuste Final do Avatar</h2>
          <p className="ldi-create-sub">Distribua seus pontos restantes como preferir.</p>

          <div className="ldi-create-name">
            <label>Nome do seu avatar:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome..."
              className="ldi-input"
            />
          </div>

          <div className="ldi-create-stats">
            {Object.entries(ATTR_NAMES).map(([key, label]) => (
              <div key={key} className="ldi-create-stat">
                <span className="ldi-create-stat-label">
                  {label}
                  <span className="ldi-tooltip-icon" onMouseEnter={() => setTooltipAttr(key)} onMouseLeave={() => setTooltipAttr(null)}>ⓘ</span>
                </span>
                <AnimatePresence>
                  {tooltipAttr === key && (
                    <motion.div
                      className="ldi-tooltip"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      {ATTR_TOOLTIPS[key]}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="ldi-create-stat-controls">
                  <button className="ldi-stat-btn" onClick={() => handleRemovePoint(key)} disabled={(tempAttr[key] || 0) <= 0}>−</button>
                  <span className="ldi-create-stat-value">{tempAttr[key] || 0}</span>
                  <button className="ldi-stat-btn" onClick={() => handleFreePoint(key)} disabled={freePoints <= 0}>+</button>
                </div>
              </div>
            ))}
          </div>

          <p className="ldi-create-points">Pontos restantes: {freePoints}</p>

          <button
            className="ldi-btn ldi-btn--primary"
            onClick={handleFinishGuided}
            disabled={freePoints !== 0}
            style={freePoints !== 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {freePoints > 0 ? 'Distribua todos os pontos antes de continuar' : freePoints < 0 ? 'Você ultrapassou o limite de pontos' : 'ENTRAR NO LDI'}
          </button>
        </motion.div>
      </div>
    )
  }

  const currentStep = STEPS[step]

  return (
    <div className="ldi-create">
      <div className="ldi-create-tabs">
        <button className="ldi-create-tab ldi-create-tab--active" onClick={() => setTab('guided')}>Guiado</button>
        <button className="ldi-create-tab" onClick={() => setTab('full')}>Ficha Completa</button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="ldi-create-content"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="ldi-create-progress">
            {STEPS.map((s, i) => (
              <div key={s.id} className={`ldi-create-dot ${i <= step ? 'ldi-create-dot--active' : ''}`} />
            ))}
          </div>

          <h2 className="ldi-create-question">{currentStep.question}</h2>

          <div className="ldi-create-options">
            {currentStep.options.map((opt, i) => (
              <motion.button
                key={i}
                className="ldi-create-option"
                onClick={() => handleOption(opt)}
                whileHover={{ scale: 1.02, borderColor: 'var(--ldi-accent-blue)' }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
