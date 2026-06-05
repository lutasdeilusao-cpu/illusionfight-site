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
import { useArenaStore } from '../store/useArenaStore'

export default function Batalha({ onVitoria, onDerrota }) {
  const store = useArenaStore()
  const batalha = store.batalha
  const [selectedAlly, setSelectedAlly] = useState(null)
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [alcance, setAlcance] = useState([])
  const [danos, setDanos] = useState([])
  const [eventoAtual, setEventoAtual] = useState(null)
  const [turnoFase, setTurnoFase] = useState('player')
  const eventosUsados = useRef([])
  const danoId = useRef(0)

  if (!batalha) return null

  const { aliados, inimigos, turno } = batalha

  const getSkills = (personagem) => {
    const cls = CLASSES[personagem.classe]
    if (!cls) return []
    return cls.skills_base || []
  }

  const showDano = (valor, x, y, critico = false, curativo = false) => {
    const id = danoId.current++
    setDanos(d => [...d, { id, valor, x, y, critico, curativo }])
    setTimeout(() => setDanos(d => d.filter(dd => dd.id !== id)), 900)
  }

  const handleAllyClick = (ally) => {
    if (turnoFase !== 'player') return
    setSelectedAlly(ally)
    setShowSkillModal(true)
  }

  const handleSkillSelect = (skill) => {
    setShowSkillModal(false)
    // Calcular alcance
    const alc = []
    for (let dx = -skill.alcance; dx <= skill.alcance; dx++) {
      for (let dy = -skill.alcance; dy <= skill.alcance; dy++) {
        if (Math.abs(dx) + Math.abs(dy) <= skill.alcance) {
          alc.push({ x: selectedAlly.x + dx, y: selectedAlly.y + dy })
        }
      }
    }
    setAlcance(alc)
    setTurnoFase('target')
  }

  const handleGridClick = (x, y, cel) => {
    if (turnoFase === 'target' && cel.emAlcance) {
      // Executar ataque
      const alvo = inimigos.find(i => i.x === x && i.y === y)
      if (alvo) {
        const mult = getMultiplicadorElemental(selectedAlly.elemental, alvo.elemental)
        const dano = Math.round(10 * mult)
        const novoHp = Math.max(0, alvo.hp - dano)
        const critico = Math.random() < 0.2
        showDano(dano, x * 52, y * 52, critico)
        store.executarAcao({ tipo: 'ataque', de: selectedAlly.nome, alvo: alvo.nome, dano, critico })

        // Atualizar inimigo
        alvo.hp = novoHp
        setAlcance([])
        setTurnoFase('player')
        setSelectedAlly(null)

        if (novoHp <= 0) {
          // Inimigo morto
          const restantes = inimigos.filter(i => i.hp > 0)
          if (restantes.length === 0) {
            // Vitória!
            const sdrGanho = Math.round(inimigos.reduce((a, i) => a + (i.recompensa_sdr || 10), 0) * (1 + turno * 0.05))
            setTimeout(() => onVitoria(sdrGanho), 500)
            return
          }
          // Turno inimigo
          setTimeout(() => turnoInimigo(), 600)
        } else {
          setTimeout(() => turnoInimigo(), 600)
        }
      }
    }
  }

  const turnoInimigo = useCallback(() => {
    setTurnoFase('inimigo')
    // IA greedy: ataca aliado com menos HP
    const alvo = [...aliados].sort((a, b) => a.hp - b.hp)[0]
    if (!alvo) return
    const inimigo = inimigos.find(i => i.hp > 0)
    if (!inimigo) return

    setTimeout(() => {
      const mult = getMultiplicadorElemental(inimigo.elemental, alvo.elemental)
      const dano = Math.round(8 * mult)
      const novoHp = Math.max(0, alvo.hp - dano)
      alvo.hp = novoHp
      showDano(dano, alvo.x * 52, alvo.y * 52)
      store.executarAcao({ tipo: 'ataque_inimigo', de: inimigo.nome, alvo: alvo.nome, dano })

      if (novoHp <= 0) {
        // Aliado morreu
        const restantes = aliados.filter(a => a.hp > 0)
        if (restantes.length === 0) {
          store.executarAcao({ tipo: 'derrota', msg: 'Time eliminado!' })
          setTimeout(() => onDerrota(), 800)
          return
        }
      }

      // Verificar evento a cada 3 rodadas
      const proxTurno = turno + 1
      if (proxTurno % 3 === 0) {
        const evento = getEventoAleatorio(eventosUsados.current)
        eventosUsados.current.push(evento.id)
        setEventoAtual(evento)
        store.executarAcao({ tipo: 'evento', nome: evento.nome })
      }

      store.avancarTurno()
      setTurnoFase('player')
    }, 900)
  }, [aliados, inimigos, turno, store])

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Evento banner */}
      <AnimatePresence>
        {eventoAtual && <EventoBanner evento={eventoAtual} onClose={() => setEventoAtual(null)} />}
      </AnimatePresence>

      {/* Status aliados */}
      <StatusBar personagens={aliados} lado="aliado" />
      {/* Dano popups */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DanoPopup danos={danos} />
        <Grid
          aliados={aliados}
          inimigos={inimigos}
          alcance={alcance}
          turnoFase={turnoFase}
          onCasaClick={handleGridClick}
        />
      </div>

      {/* Status inimigos */}
      <StatusBar personagens={inimigos.filter(i => i.hp > 0)} lado="inimigo" />

      {/* Turno indicator */}
      <TurnoIndicator turno={turno} fase={turnoFase} />

      {/* Skill modal */}
      <AnimatePresence>
        {showSkillModal && selectedAlly && (
          <SkillModal
            personagem={selectedAlly}
            skills={getSkills(selectedAlly)}
            onSelect={handleSkillSelect}
            onClose={() => { setShowSkillModal(false); setSelectedAlly(null) }}
          />
        )}
      </AnimatePresence>

      {/* Botão para selecionar aliado */}
      {turnoFase === 'player' && !showSkillModal && (
        <div style={{ display: 'flex', gap: 6, padding: '0 8px 8px' }}>
          {aliados.filter(a => a.hp > 0).map(a => (
            <button key={a.id} onClick={() => handleAllyClick(a)}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: 8,
                background: selectedAlly?.id === a.id ? '#00ff8822' : '#0d0d0d',
                border: `1px solid ${selectedAlly?.id === a.id ? '#00ff88' : '#333'}`,
                color: '#eee', fontFamily: 'Courier New', fontSize: '0.65rem', cursor: 'pointer',
              }}>
              {a.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
