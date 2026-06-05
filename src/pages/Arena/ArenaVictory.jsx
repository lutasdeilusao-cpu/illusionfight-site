import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useArenaStore } from './store/useArenaStore'

const DEFEAT_FALLBACKS = ['isso não pode ser...', 'subestimei você. que droga.', 'impossível.']

export default function ArenaVictory({ onNavigate }) {
  const navigate = useNavigate()
  const store = useArenaStore()
  const { sheet, match } = store
  const enemy = match.enemy

  const isVitoria = match.status === 'victory'
  const xpGain = isVitoria ? 10 : 0

  const pv = (sheet.attributes?.R || 0) * 5
  const pm = (sheet.attributes?.PdF || 0) * 5
  const pvMax = enemy?.pv_max || 10

  const [fase, setFase] = useState('mensagem') // mensagem | hpzero | resultado
  const [hpAtual, setHpAtual] = useState(pvMax)

  // Fase 1 — mensagem final do inimigo
  useEffect(() => {
    if (fase !== 'mensagem') return
    const t = setTimeout(() => setFase('hpzero'), 2500)
    return () => clearTimeout(t)
  }, [fase])

  // Fase 2 — HP indo a zero
  useEffect(() => {
    if (fase !== 'hpzero') return
    const duracao = 1500
    const start = Date.now()
    const startHp = pvMax
    let frame
    function step() {
      const elapsed = Date.now() - start
      const pct = Math.min(1, elapsed / duracao)
      setHpAtual(Math.round(startHp * (1 - pct)))
      if (pct < 1) frame = requestAnimationFrame(step)
      else setTimeout(() => setFase('resultado'), 400)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [fase, pvMax])

  if (!isVitoria) {
    return (
      <div className="arena-victory arena-container">
        <div className="arena-victory-header">
          <h1 className="arena-victory-title arena-victory-lose">💀 DERROTA</h1>
          <p className="arena-victory-sub">A derrota só fortalece o guerreiro.</p>
        </div>
        <div className="arena-victory-card">
          <div className="arena-victory-sheet-name">{sheet.sheet_name}</div>
          <div className="arena-victory-attrs">
            <div className="arena-victory-attr"><span>F</span>{sheet.attributes.F}</div>
            <div className="arena-victory-attr"><span>H</span>{sheet.attributes.H}</div>
            <div className="arena-victory-attr"><span>R</span>{sheet.attributes.R}</div>
            <div className="arena-victory-attr"><span>A</span>{sheet.attributes.A}</div>
            <div className="arena-victory-attr"><span>PdF</span>{sheet.attributes.PdF}</div>
          </div>
        </div>
        <div className="arena-victory-btns">
          <button className="arena-btn-primary" onClick={() => onNavigate('lobby')}>LUTAR DE NOVO</button>
          <button className="arena-btn-sair" onClick={() => { store.updateSheet({}); onNavigate('lobby') }}>ESCOLHER OUTRA FICHA</button>
          <button className="arena-btn-sair" style={{ marginTop: '0.6rem' }} onClick={() => navigate('/extras/ldi-arena')}>← VOLTAR AO SITE</button>
        </div>
      </div>
    )
  }

  // Fase 1 — mensagem do inimigo derrotado
  if (fase === 'mensagem') {
    const defeatPhrases = enemy?.trash_talk?.defeat || enemy?.trash_talk?.enemy_near_death
    const line = defeatPhrases?.length
      ? defeatPhrases[Math.floor(Math.random() * defeatPhrases.length)]
      : DEFEAT_FALLBACKS[Math.floor(Math.random() * DEFEAT_FALLBACKS.length)]

    return (
      <div className="arena-victory arena-container" style={{ background: '#0a0a0a' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'2rem' }}>
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
            <div className="arena-chat-msg">
              <div className="arena-chat-avatar arena-chat-avatar--trash">{enemy?.name?.[0] || 'I'}</div>
              <div className="arena-chat-bubble arena-chat-bubble--trash" style={{ fontSize:'0.95rem', lineHeight:1.6 }}>
                {line}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Fase 2 — HP indo a zero + K.O.
  if (fase === 'hpzero') {
    const hpPct = Math.max(0, (hpAtual / pvMax) * 100)
    return (
      <div className="arena-victory arena-container" style={{ background: '#0a0a0a' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'2rem' }}>
          <h3 style={{ fontFamily:"'Share Tech Mono',monospace", color:'#888', marginBottom:'1rem', fontSize:'0.85rem' }}>{enemy?.name}</h3>
          <div className="arena-bar-wrap" style={{ width:'100%', maxWidth:300 }}>
            <div className="arena-bar" style={{ height:12 }}>
              <motion.div className="arena-bar-fill arena-bar-red"
                animate={{ width: `${hpPct}%` }}
                transition={{ duration: 0.05 }}
                style={{ height:'100%', boxShadow: '0 0 8px rgba(220,20,60,0.5)' }} />
            </div>
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:'0.7rem', color:'#DC143C', marginTop:4, display:'block', textAlign:'right' }}>
              {hpAtual} / {pvMax}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Fase 3 — vitória
  return (
    <div className="arena-victory arena-container">
      <AnimatePresence>
        <motion.div className="arena-onomatopeia"
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
          style={{ position:'absolute', top:'30%', left:0, right:0, fontSize:'3rem', pointerEvents:'none', zIndex:10 }}>
          K.O.!
        </motion.div>
      </AnimatePresence>

      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
        <div className="arena-victory-header">
          <h1 className="arena-victory-title arena-victory-win">⚔️ VITÓRIA!</h1>
          <p className="arena-victory-sub">Você derrotou <strong>{enemy?.name}</strong> e provou seu valor na arena.</p>
        </div>

        <div className="arena-victory-card">
          <div className="arena-victory-sheet-name">{sheet.sheet_name}</div>
          <div className="arena-victory-attrs">
            <div className="arena-victory-attr"><span>F</span>{sheet.attributes.F}</div>
            <div className="arena-victory-attr"><span>H</span>{sheet.attributes.H}</div>
            <div className="arena-victory-attr"><span>R</span>{sheet.attributes.R}</div>
            <div className="arena-victory-attr"><span>A</span>{sheet.attributes.A}</div>
            <div className="arena-victory-attr"><span>PdF</span>{sheet.attributes.PdF}</div>
          </div>
          <div className="arena-victory-stats">
            <span>PV: {pv}</span>
            <span>PM: {pm}</span>
            <span>XP: {sheet.xp_total || 0}</span>
          </div>
          <motion.div className="arena-xp-gain" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}>
            +{xpGain} XP
          </motion.div>
        </div>

        <div className="arena-victory-btns">
          <button className="arena-btn-primary" onClick={() => onNavigate('lobby')}>LUTAR DE NOVO</button>
          <button className="arena-btn-sair" onClick={() => { store.updateSheet({}); onNavigate('lobby') }}>ESCOLHER OUTRA FICHA</button>
          <button className="arena-btn-sair" style={{ marginTop: '0.6rem' }} onClick={() => navigate('/extras/ldi-arena')}>← VOLTAR AO SITE</button>
        </div>
      </motion.div>
    </div>
  )
}
