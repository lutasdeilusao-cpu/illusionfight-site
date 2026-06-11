import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useArenaStore } from './store/useArenaStore'
import BackToGamesBtn from '../../components/BackToGamesBtn/BackToGamesBtn'
import ArenaXpBar from './components/ArenaXpBar'
import { sfx } from '../../lib/sfx'

const ENEMY_ORDER = ['treinamento', 'kaeda', 'thunderbolt', 'stormbyte', 'viran', 'campeao', 'kronos', 'primordial_jack']

export default function ArenaVictory({ onNavigate }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user } = useAuth()
  const store = useArenaStore()
  const { sheet, match } = store
  const [somAtivo, setSomAtivo] = useState(sfx.enabled)
  const enemy = match.enemy

  const isVitoria = match.status === 'victory'
  const xpGain = isVitoria ? 10 : 0

  const pv = (sheet.attributes?.R || 0) * 5
  const pm = (sheet.attributes?.PdF || 0) * 5
  const pvMax = enemy?.pv_max || 10

  const [fase, setFase] = useState('mensagem')
  const [hpAtual, setHpAtual] = useState(pvMax)
  const [nextUnlock, setNextUnlock] = useState(null)

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

  // Ganhar XP + desbloquear próximo inimigo na vitória
  useEffect(() => {
    if (!isVitoria || fase !== 'resultado') return
    // 1. Ganhar XP (síncrono — Zustand set é sync)
    store.gainXp(xpGain)
    // 2. Desbloquear próximo inimigo
    const defeatedIdx = ENEMY_ORDER.indexOf(match.enemy_id)
    const nextId = ENEMY_ORDER[defeatedIdx + 1]
    const before = sheet.enemies_unlocked || ['treinamento']
    store.unlockNextEnemy(match.enemy_id)
    if (nextId && !before.includes(nextId)) {
      setNextUnlock(t(`games.arena.enemy_names.${nextId}`) || nextId)
    }
    // 3. Persistir no Supabase (pega o state já atualizado)
    setTimeout(() => store.saveToCloud(user?.id), 400)
  }, [fase, isVitoria])

  if (!isVitoria) {
    return (
      <div className="arena-victory arena-container">
        <div className="arena-victory-header">
          <h1 className="arena-victory-title arena-victory-lose">{t('games.arena.derrota')}</h1>
          <p className="arena-victory-sub">{t('games.arena.derrota_sub')}</p>
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
          <button className="arena-btn-primary" onClick={() => onNavigate('lobby')}>{t('games.arena.lutar_novamente')}</button>
          <button className="arena-btn-sair" onClick={() => { store.updateSheet({}); onNavigate('lobby') }}>{t('games.arena.escolher_outra')}</button>
          <BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.arena.escolher_oponente')} />
          <button className="arena-sfx-toggle" onClick={() => { sfx.toggle(); setSomAtivo(sfx.enabled) }} title={t('games.arena.sfx_toggle')}>
            {sfx.enabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    )
  }

  // Fase 1 — mensagem do inimigo derrotado
  if (fase === 'mensagem') {
    const defeatPhrases = enemy?.trash_talk?.defeat || enemy?.trash_talk?.enemy_near_death
    const fallbacks = [0,1,2].map(i => t(`games.arena.defeat_fallbacks[${i}]`))
    const line = defeatPhrases?.length
      ? defeatPhrases[Math.floor(Math.random() * defeatPhrases.length)]
      : fallbacks[Math.floor(Math.random() * fallbacks.length)]

    return (
      <div className="arena-victory arena-container" style={{ background: '#0a0a0a' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'2rem' }}>
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
            <div className="arena-chat-msg">
              <div className="arena-chat-avatar arena-chat-avatar--trash">{(t('games.arena.enemy_names.' + (enemy?.id || '')) || enemy?.name || 'I')[0]}</div>
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
          <h3 style={{ fontFamily:"'Share Tech Mono',monospace", color:'#888', marginBottom:'1rem', fontSize:'0.85rem' }}>{t('games.arena.enemy_names.' + (enemy?.id || '')) || enemy?.name}</h3>
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
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
        <motion.div
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
          style={{ textAlign:'center', fontSize:'3.5rem', fontFamily:"'Impact','Arial Black',sans-serif",
            color:'#F5A623', textShadow:'3px 3px 0 #8B0000, 0 0 30px rgba(245,166,35,0.8)',
            marginBottom:'1rem', letterSpacing:'4px' }}
        >
          {t('games.arena.ko')}
        </motion.div>
        <div className="arena-victory-header">
          <h1 className="arena-victory-title arena-victory-win">{t('games.arena.vitoria')}</h1>
          <p className="arena-victory-sub" dangerouslySetInnerHTML={{ __html: t('games.arena.vitoria_sub', { name: t('games.arena.enemy_names.' + (enemy?.id || '')) || enemy?.name }) }} />
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
            <span>{t('games.arena.pv', { n: pv })}</span>
            <span>{t('games.arena.pm', { n: pm })}</span>
            <span>{t('games.arena.xp', { n: sheet.xp_total || 0 })}</span>
          </div>
          <motion.div className="arena-xp-gain" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}>
            {t('games.arena.xp_gain', { n: xpGain })}
          </motion.div>
          {/* XP Progress Bar */}
          <ArenaXpBar
            xpTotal={sheet.xp_total || 0}
            t={t}
            animated
          />
        </div>

        {nextUnlock && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              margin: '12px auto', padding: '10px 20px',
              border: '1px solid rgba(245,166,35,0.3)',
              background: 'rgba(245,166,35,0.05)',
              color: '#F5A623', fontFamily: "'Courier New', monospace",
              fontSize: '11px', letterSpacing: '2px', maxWidth: 360,
            }}
          >
            {t('games.arena.novo_oponente', { name: nextUnlock })}
          </motion.div>
        )}

        <div className="arena-victory-btns">
          <button className="arena-btn-primary" onClick={() => onNavigate('lobby')}>{t('games.arena.escolher_outra')}</button>
          <button className="arena-btn-sair" onClick={() => { store.updateSheet({}); onNavigate('lobby') }}>{t('games.arena.escolher_outra')}</button>
          <BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.arena.escolher_oponente')} />
          <button className="arena-sfx-toggle" onClick={() => { sfx.toggle(); setSomAtivo(sfx.enabled) }} title={t('games.arena.sfx_toggle')}>
            {sfx.enabled ? '🔊' : '🔇'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
