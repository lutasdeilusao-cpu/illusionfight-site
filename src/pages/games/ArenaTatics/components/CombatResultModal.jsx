import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getElem } from '../data/elementals'

/**
 * CombatResultModal — Modal épico de resultado de ataque
 * Fases: entrada → impacto → efeitos → saída
 */
export default function CombatResultModal({ resultado, onFechar }) {
  const [fase, setFase] = useState('entrada')
  const elem = getElem(resultado?.atacante?.elemental)

  useEffect(() => {
    if (!resultado) return
    const t1 = setTimeout(() => setFase('impacto'), 300)
    const t2 = setTimeout(() => setFase('efeitos'), 800)
    const t3 = setTimeout(() => setFase('saida'), 2200)
    const t4 = setTimeout(() => { onFechar(); setFase('entrada') }, 2600)
    return () => { [t1, t2, t3, t4].forEach(clearTimeout) }
  }, [resultado])

  if (!resultado) return null

  const { atacante, alvo, skill, dano, critico, acertou, status, missTipo } = resultado
  const miss = !acertou
  const hpAntes = alvo?.hp + dano || 0
  const hpDepois = alvo?.hp || 0
  const hpMax = alvo?.hpMax || 1

  return (
    <AnimatePresence>
      {fase !== 'saida' && (
        <motion.div
          className={`combat-modal-overlay fase-${fase}`}
          style={{ '--elem-cor': elem.cor, '--elem-glow': elem.glow }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onFechar}
        >
          {/* Matchup */}
          <div className="combat-modal-matchup">
            <TokenMini nome={atacante?.nome} elemental={atacante?.elemental} />
            <div className="combat-modal-vs">
              <span style={{ color: elem.cor, fontSize: '1.2rem', fontFamily: 'Rajdhani', fontWeight: 700 }}>
                {skill?.nome?.toUpperCase() || 'ATAQUE'}
              </span>
              <span style={{ color: '#4F5359', fontSize: '0.55rem', fontFamily: 'JetBrains Mono' }}>
                ───────▶
              </span>
            </div>
            <TokenMini nome={alvo?.nome} elemental={alvo?.elemental} dimmed />
          </div>

          {/* Dano */}
          {!miss && (
            <div className={`combat-modal-dano ${critico ? 'critico' : ''}`}>
              {critico && (
                <span className="combat-modal-critico-label">CRÍTICO!</span>
              )}
              <span className="combat-modal-dano-numero">{dano}</span>
              <span className="combat-modal-dano-label">DMG</span>
            </div>
          )}

          {/* Miss */}
          {miss && (
            <div className="combat-modal-miss">
              {missTipo === 'perfeita' ? 'ESQUIVA PERFEITA' : 'MISS'}
            </div>
          )}

          {/* HP Bar delta */}
          {!miss && (
            <HpBarDelta antes={hpAntes} depois={hpDepois} max={hpMax} cor={elem.cor} fase={fase} />
          )}

          {/* Status aplicados */}
          {fase !== 'entrada' && status && (
            <div className="combat-modal-efeitos">
              <span className="combat-modal-efeito-badge" style={{
                '--status-cor': elem.popupCor || elem.cor,
              }}>
                {status.tipo?.toUpperCase()}
              </span>
            </div>
          )}

          {/* Elemental label */}
          <div className="combat-modal-elem-label" style={{ color: elem.cor }}>
            {elem.sfxLabel}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TokenMini({ nome, elemental, dimmed }) {
  const elem = getElem(elemental)
  return (
    <div className={`combat-modal-token-mini ${dimmed ? 'combat-modal-token-dimmed' : ''}`}
      style={{
        borderColor: elem.cor,
        boxShadow: `0 0 8px ${elem.glow}`,
      }}
    >
      <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#EAEAEA' }}>
        {nome?.slice(0, 3).toUpperCase() || '???'}
      </span>
    </div>
  )
}

function HpBarDelta({ antes, depois, max, cor, fase }) {
  const pctAntes = (antes / max) * 100
  const pctDepois = (depois / max) * 100
  const perdeu = antes - depois

  return (
    <div className="combat-modal-hp-container">
      <div className="combat-modal-hp-header">
        <span className="combat-modal-hp-label">HP</span>
        <span className="combat-modal-hp-perda">-{perdeu}</span>
      </div>
      <div className="combat-modal-hp-bar">
        <div className="combat-modal-hp-antes" style={{
          width: `${Math.min(100, pctAntes)}%`,
          background: `${cor}60`,
        }} />
        <div className="combat-modal-hp-depois" style={{
          width: fase === 'entrada' ? `${Math.min(100, pctAntes)}%` : `${Math.min(100, pctDepois)}%`,
          background: `linear-gradient(90deg, ${cor}, ${cor}90)`,
          boxShadow: `0 0 8px ${cor}60`,
        }} />
      </div>
      <div className="combat-modal-hp-valor">
        <span style={{
          color: depois / max < 0.25 ? '#E24B4A' : '#EAEAEA',
        }}>
          {depois}/{max}
        </span>
      </div>
    </div>
  )
}
