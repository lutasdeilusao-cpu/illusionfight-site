import { useState } from 'react'
import { motion } from 'framer-motion'
import { ROSTER } from '../data/roster'
import { TODAS_IAS, getDescricaoIA } from '../data/aiPersonalities'

const EMOJI = { karuak: '🛡️', moraki: '🌪️', tivara: '🏹' }

export default function SimulacaoAuto({ onIniciar }) {
  const [numChars, setNumChars] = useState(3)
  const [numIAs, setNumIAs] = useState(2)
  const [speed, setSpeed] = useState(600) // ms entre ações
  const [iasSorteadas, setIasSorteadas] = useState(() => {
    const shuffled = [...TODAS_IAS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 2)
  })

  const reshuffle = () => {
    const shuffled = [...TODAS_IAS].sort(() => Math.random() - 0.5)
    setIasSorteadas(shuffled.slice(0, numIAs))
  }

  const handleNumIAs = (n) => {
    const clamped = Math.max(1, Math.min(4, n))
    setNumIAs(clamped)
    if (clamped < iasSorteadas.length) {
      setIasSorteadas(iasSorteadas.slice(0, clamped))
    } else if (clamped > iasSorteadas.length) {
      const rest = TODAS_IAS.filter(ia => !iasSorteadas.includes(ia)).sort(() => Math.random() - 0.5)
      setIasSorteadas([...iasSorteadas, ...rest.slice(0, clamped - iasSorteadas.length)])
    }
  }

  return (
    <div className="tatics-select">
      <div className="tatics-intro-bg" />
      <div className="tatics-intro-scanlines" />
      <div className="tatics-intro-vignette" />

      <div className="tatics-sim-panel">
        <div className="tatics-select-glitch">SIMULAÇÃO AUTOMÁTICA</div>
        <div className="tatics-select-sub">IA vs IA — assista batalhas autônomas</div>

        {/* Config */}
        <div className="tatics-sim-config">
          <div className="tatics-sim-row">
            <span className="tatics-sim-label">Personagens por time</span>
            <div className="tatics-sim-controls">
              <button className="tatics-sim-btn" onClick={() => setNumChars(Math.max(1, numChars - 1))}>−</button>
              <span className="tatics-sim-value">{numChars}</span>
              <button className="tatics-sim-btn" onClick={() => setNumChars(Math.min(6, numChars + 1))}>+</button>
            </div>
          </div>

          <div className="tatics-sim-row">
            <span className="tatics-sim-label">Quantidade de IAs</span>
            <div className="tatics-sim-controls">
              <button className="tatics-sim-btn" onClick={() => handleNumIAs(numIAs - 1)}>−</button>
              <span className="tatics-sim-value">{numIAs}</span>
              <button className="tatics-sim-btn" onClick={() => handleNumIAs(numIAs + 1)}>+</button>
            </div>
          </div>

          <div className="tatics-sim-row">
            <span className="tatics-sim-label">Velocidade</span>
            <div className="tatics-sim-controls">
              <button className="tatics-sim-btn" onClick={() => setSpeed(Math.min(1500, speed + 200))}>⎯</button>
              <span className="tatics-sim-value">{speed}ms</span>
              <button className="tatics-sim-btn" onClick={() => setSpeed(Math.max(100, speed - 200))}>+</button>
            </div>
          </div>

          {/* Preview das IAs sorteadas */}
          <div className="tatics-sim-ias">
            <div className="tatics-sim-ias-header">
              <span style={{ color: '#4F5359', fontSize: '0.55rem', fontFamily: 'JetBrains Mono', letterSpacing: '0.15em' }}>
                IAs NA BATALHA
              </span>
              <button className="tatics-sim-reshuffle" onClick={reshuffle}>
                🔄 SORTEAR
              </button>
            </div>
            <div className="tatics-sim-ias-list">
              {iasSorteadas.map((ia, i) => (
                <div key={ia.id} className="tatics-sim-ia-card" style={{
                  '--ia-cor': i % 2 === 0 ? '#00B4D8' : '#E24B4A',
                }}>
                  <div className="tatics-sim-ia-time">{i % 2 === 0 ? 'TIME AZUL' : 'TIME VERMELHO'}</div>
                  <div className="tatics-sim-ia-nome">{ia.nome}</div>
                  <div className="tatics-sim-ia-desc">{ia.descricao}</div>
                </div>
              ))}
            </div>
            {iasSorteadas.length > 1 && (
              <div className="tatics-sim-matchup">
                <span className="tatics-sim-matchup-text">{getDescricaoIA(iasSorteadas[0], iasSorteadas[1])}</span>
              </div>
            )}
          </div>
        </div>

        {/* Roster preview */}
        <div className="tatics-sim-roster-preview">
          <span className="tatics-sim-roster-title">PERSONAGENS DISPONÍVEIS ({ROSTER.length})</span>
          <div className="tatics-sim-roster-list">
            {ROSTER.slice(0, 12).map(r => (
              <div key={r.id} className="tatics-sim-roster-chip">
                {EMOJI[r.classe] || '⚔️'} {r.nome}
              </div>
            ))}
            {ROSTER.length > 12 && (
              <div className="tatics-sim-roster-chip" style={{ color: '#4F5359' }}>
                +{ROSTER.length - 12}
              </div>
            )}
          </div>
        </div>

        <motion.button
          className="tatics-sim-start"
          whileTap={{ scale: 0.95 }}
          onClick={() => onIniciar({ numChars, numIAs, ias: iasSorteadas, speed })}
        >
          INICIAR SIMULAÇÃO
        </motion.button>
      </div>
    </div>
  )
}
