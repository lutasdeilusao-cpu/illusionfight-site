import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Grid from '../components/Grid'
import StatusBar from '../components/StatusBar'
import TurnoIndicator from '../components/TurnoIndicator'
import SkillModal from '../components/SkillModal'
import DanoPopup from '../components/DanoPopup'
import EventoBanner from '../components/EventoBanner'
import { CLASSES } from '../data/classes'
import { getMultiplicadorElemental } from '../data/elementais'
import { getEventoAleatorio } from '../data/eventos'
import { getCorPorElemental } from '../data/cosmeticos'
import { useArenaTaticsStore } from '../store/useArenaTaticsStore'

// ── Helpers ──
function getSkills(p) { const c = CLASSES[p.classe]; return c?.skills_base || [] }

function getAlcanceMovimento(p, l = 16, c = 8) {
  const r = 3; const casas = []
  for (let dx = -r; dx <= r; dx++)
    for (let dy = -r; dy <= r; dy++)
      if (Math.abs(dx) + Math.abs(dy) <= r) { const nx = p.x + dx, ny = p.y + dy; if (nx >= 0 && nx < c && ny >= 0 && ny < l) casas.push({ x: nx, y: ny }) }
  return casas
}

function getAlcanceSkill(p, skill, l = 16, c = 8) {
  const casas = []
  for (let dx = -skill.alcance; dx <= skill.alcance; dx++)
    for (let dy = -skill.alcance; dy <= skill.alcance; dy++)
      if (Math.abs(dx) + Math.abs(dy) <= skill.alcance) { const nx = p.x + dx, ny = p.y + dy; if (nx >= 0 && nx < c && ny >= 0 && ny < l) casas.push({ x: nx, y: ny }) }
  return casas
}

export default function Batalha({ onVitoria, onDerrota }) {
  const store = useArenaTaticsStore()
  const batalha = store.batalha
  const [faseAcao, setFaseAcao] = useState('idle') // idle | mover | skill | target | inimigo
  const [selectedAlly, setSelectedAlly] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [alcance, setAlcance] = useState([])
  const [danos, setDanos] = useState([])
  const [eventoAtual, setEventoAtual] = useState(null)
  const eventosUsados = useRef([])
  const danoId = useRef(0)

  if (!batalha) return null
  const { aliados, inimigos, turno } = batalha

  const showDano = (v, x, y, crit = false) => {
    const id = danoId.current++; setDanos(d => [...d, { id, valor: v, x, y, critico: crit }])
    setTimeout(() => setDanos(d => d.filter(dd => dd.id !== id)), 900)
  }

  const handleAllyClick = (a) => {
    if (faseAcao !== 'idle') return
    setSelectedAlly(a); setAlcance(getAlcanceMovimento(a)); setFaseAcao('mover')
  }

  const handleMoveClick = (x, y, cel) => {
    if (!cel.emAlcance || !selectedAlly) return
    selectedAlly.x = x; selectedAlly.y = y
    setAlcance([]); setFaseAcao('skill')
  }

  const handleCancelMove = () => {
    setSelectedAlly(null); setAlcance([]); setFaseAcao('idle')
  }

  const handleBackToSkills = () => {
    setSelectedSkill(null); setAlcance([]); setFaseAcao('skill')
  }

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill); setAlcance(getAlcanceSkill(selectedAlly, skill)); setFaseAcao('target')
  }

  const handleTargetClick = (x, y, cel) => {
    if (!cel.emAlcance || !selectedSkill || !selectedAlly) return
    const alvo = inimigos.find(i => i.x === x && i.y === y)
    if (!alvo) return
    const mult = getMultiplicadorElemental(selectedAlly.elemental, alvo.elemental)
    const dano = Math.round(10 * mult); const crit = Math.random() < 0.2
    alvo.hp = Math.max(0, alvo.hp - dano)
    showDano(dano, x * 48 + 24, y * 48 + 24, crit)
    store.executarAcao({ tipo: 'ataque', de: selectedAlly.nome, alvo: alvo.nome, dano, critico: crit })
    setAlcance([]); setSelectedAlly(null); setSelectedSkill(null); setFaseAcao('idle')

    if (alvo.hp <= 0) {
      const rest = inimigos.filter(i => i.hp > 0)
      if (rest.length === 0) {
        const g = Math.round(inimigos.reduce((a, i) => a + (i.recompensa_sdr || 10), 0) * (1 + turno * 0.05))
        return setTimeout(() => onVitoria(g), 500)
      }
    }
    setTimeout(() => turnoInimigo(), 600)
  }

  const handleGridClick = (x, y, cel) => {
    if (faseAcao === 'mover') handleMoveClick(x, y, cel)
    else if (faseAcao === 'target') handleTargetClick(x, y, cel)
    else if (cel.aliado) handleAllyClick(cel.aliado)
  }

  const turnoInimigo = useCallback(() => {
    setFaseAcao('inimigo')
    const alvo = [...aliados].sort((a, b) => a.hp - b.hp)[0]
    const inimigo = inimigos.find(i => i.hp > 0)
    if (!alvo || !inimigo) return
    setTimeout(() => {
      const mult = getMultiplicadorElemental(inimigo.elemental, alvo.elemental)
      const dano = Math.round(8 * mult)
      alvo.hp = Math.max(0, alvo.hp - dano)
      showDano(dano, alvo.x * 48 + 24, alvo.y * 48 + 24)
      store.executarAcao({ tipo: 'ataque_inimigo', de: inimigo.nome, alvo: alvo.nome, dano })
      if (alvo.hp <= 0 && aliados.filter(a => a.hp > 0).length === 0) {
        setTimeout(() => onDerrota(), 800); return
      }
      if ((turno + 1) % 3 === 0) {
        const ev = getEventoAleatorio(eventosUsados.current)
        eventosUsados.current.push(ev.id); setEventoAtual(ev)
      }
      store.avancarTurno(); setFaseAcao('idle')
    }, 900)
  }, [aliados, inimigos, turno, store])

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', position: 'relative', maxWidth: 480, margin: '0 auto' }}>
      <AnimatePresence>{eventoAtual && <EventoBanner evento={eventoAtual} onClose={() => setEventoAtual(null)} />}</AnimatePresence>
      <TurnoIndicator turno={turno} fase={faseAcao === 'inimigo' ? 'inimigo' : 'player'} />

      {/* Grid vertical */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 0' }}>
        <DanoPopup danos={danos} />
        <Grid aliados={aliados} inimigos={inimigos} alcance={alcance} turnoFase={faseAcao} onCasaClick={handleGridClick} />
      </div>

      <StatusBar personagens={aliados.filter(a => a.hp > 0)} lado="aliado" />
      <StatusBar personagens={inimigos.filter(i => i.hp > 0)} lado="inimigo" />

      <AnimatePresence>
        {faseAcao === 'skill' && selectedAlly && (
          <SkillModal personagem={selectedAlly} skills={getSkills(selectedAlly)}
            onSelect={handleSkillSelect}
            onClose={() => { setFaseAcao('idle'); setSelectedAlly(null); setAlcance([]) }} />
        )}
      </AnimatePresence>

      {/* Botões de aliado */}
      {faseAcao === 'idle' && (
        <div style={{ display: 'flex', gap: 6, padding: '8px', background: 'linear-gradient(0deg, #0a0a0a, transparent)' }}>
          {aliados.filter(a => a.hp > 0).map(a => {
            const cor = getCorPorElemental(a.elemental || 'fogo')
            return (
              <motion.button key={a.id} whileTap={{ scale: 0.95 }} onClick={() => handleAllyClick(a)}
                style={{
                  flex: 1, padding: '0.6rem 0.4rem', borderRadius: 10,
                  background: `linear-gradient(135deg, ${cor}22, #0d0d0d)`,
                  border: `1px solid ${cor}44`, color: '#eee', fontFamily: 'Courier New',
                  fontSize: '0.65rem', cursor: 'pointer', textAlign: 'center',
                }}>
                <div style={{ fontSize: '1rem', marginBottom: 2 }}>
                  {a.classe === 'karuak' ? '🛡️' : a.classe === 'moraki' ? '🌪️' : a.classe === 'tivara' ? '🏹' : a.classe === 'zephyra' ? '🌊' : a.classe === 'ignis' ? '🔥' : '🗡️'}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.6rem' }}>{a.nome}</div>
                <div style={{ fontSize: '0.5rem', color: '#888' }}>{a.hp}/{a.hpMax}</div>
              </motion.button>
            )
          })}
        </div>
      )}

      {faseAcao === 'mover' && (
        <div style={{ textAlign: 'center', padding: 6, fontFamily: 'Courier New', fontSize: '0.65rem' }}>
          <span style={{ color: '#FFD700' }}>👣 Toque em uma casa amarela para mover {selectedAlly?.nome}</span>
          <button onClick={handleCancelMove}
            style={{ marginLeft: 8, background: 'none', border: '1px solid #555', color: '#888', borderRadius: 6, padding: '2px 10px', fontSize: '0.6rem', cursor: 'pointer', fontFamily: 'Courier New' }}>
            CANCELAR ✕
          </button>
        </div>
      )}
      {faseAcao === 'target' && (
        <div style={{ textAlign: 'center', padding: 6, fontFamily: 'Courier New', fontSize: '0.65rem' }}>
          <span style={{ color: '#FF4444' }}>⚔️ Toque em um inimigo para usar {selectedSkill?.nome}</span>
          <button onClick={handleBackToSkills}
            style={{ marginLeft: 8, background: 'none', border: '1px solid #FFD700', color: '#FFD700', borderRadius: 6, padding: '2px 10px', fontSize: '0.6rem', cursor: 'pointer', fontFamily: 'Courier New' }}>
            VOLTAR ◀
          </button>
        </div>
      )}
    </div>
  )
}
