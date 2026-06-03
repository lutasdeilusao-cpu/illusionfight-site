import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/useGameStore'
import { useAuth } from '../../context/AuthContext'
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

export default function Create() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { sheet, updateSheet, applySceneEffect, setFlag, saveToCloud } = useGameStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [showFinal, setShowFinal] = useState(false)
  const [freePoints, setFreePoints] = useState(3)
  const [tempAttr, setTempAttr] = useState({ F: 0, H: 0, R: 0, A: 0, PdF: 0 })
  const [flags, setFlags] = useState([])
  const [chosenWeapon, setChosenWeapon] = useState('')
  const [chosenElemental, setChosenElemental] = useState('')

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

  useEffect(() => {
    const state = useGameStore.getState()
    if (state.sheet?.sheet_name) {
      navigate('/extras/ldi/game', { replace: true })
    }
  }, [navigate])

  const handleFinish = () => {
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
    })
    flags.forEach(f => setFlag(f))

    const pvMax = Math.max(1, finalAttr.R * 5)
    const pmMax = Math.max(2, finalAttr.PdF * 4)
    useGameStore.getState().updateSave({
      pv_current: pvMax,
      pm_current: pmMax,
      current_scene_id: '1.2',
    })

    if (user) {
      saveToCloud(user.id)
    }

    navigate('/extras/ldi/game', { replace: true })
  }

  if (showFinal) {
    return (
      <div className="ldi-create">
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
                <span className="ldi-create-stat-label">{label}</span>
                <div className="ldi-create-stat-controls">
                  <button
                    className="ldi-stat-btn"
                    onClick={() => handleRemovePoint(key)}
                    disabled={(tempAttr[key] || 0) <= 0}
                  >−</button>
                  <span className="ldi-create-stat-value">{tempAttr[key] || 0}</span>
                  <button
                    className="ldi-stat-btn"
                    onClick={() => handleFreePoint(key)}
                    disabled={freePoints <= 0}
                  >+</button>
                </div>
              </div>
            ))}
          </div>

          <p className="ldi-create-points">Pontos restantes: {freePoints}</p>

          <button
            className="ldi-btn ldi-btn--primary"
            onClick={handleFinish}
          >
            ENTRAR NO LDI
          </button>
        </motion.div>
      </div>
    )
  }

  const currentStep = STEPS[step]

  return (
    <div className="ldi-create">
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
