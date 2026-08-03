import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { registrarPontuacaoArenaRanking } from '../../../hooks/useLeaderboardDB'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import GanguesXpBar from './components/GanguesXpBar'
import { sfx } from '../../../lib/sfx'
import { getGanguesResources } from './data/ganguesLoadout.js'

const ENEMY_ORDER = ['treinamento', 'kaeda', 'thunderbolt', 'stormbyte', 'viran', 'campeao', 'kronos', 'primordial_jack']

export default function GanguesVictory({ onNavigate }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { user } = useAuth()
  const store = useGanguesStore()
  const { sheet, match } = store
  const [somAtivo, setSomAtivo] = useState(sfx.enabled)
  const enemy = match.enemy

  const isVitoria = match.status === 'victory'
  const xpGain = isVitoria ? 10 : 1

  const { pvMax: pv, pmMax: pm } = getGanguesResources(sheet.combat_path, sheet.attributes?.R)
  const pvMax = enemy?.pv_max || 10

  const [fase, setFase] = useState('mensagem')
  const [hpAtual, setHpAtual] = useState(pvMax)
  const [nextUnlock, setNextUnlock] = useState(null)
  const processedResultRef = useRef(false)

  // Tocar som de vitória ou derrota na montagem
  useEffect(() => {
    if (isVitoria) {
      sfx.win()
      sfx.explosion()
    } else {
      sfx.lose()
      sfx.explosion()
    }
  }, [isVitoria])

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
      else {
        // Ao chegar em 0 HP, toca explosão final
        sfx.explosion()
        setTimeout(() => setFase('resultado'), 400)
      }
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [fase, pvMax])

  // Processar recompensa uma única vez; derrota justa também concede 1 XP.
  useEffect(() => {
    if (processedResultRef.current) return
    processedResultRef.current = true
    store.gainXp(xpGain)

    if (isVitoria) {
      const defeatedIdx = ENEMY_ORDER.indexOf(match.enemy_id)
      const nextId = ENEMY_ORDER[defeatedIdx + 1]
      const before = sheet.enemies_unlocked || ['treinamento']
      store.unlockNextEnemy(match.enemy_id)
      if (nextId && !before.includes(nextId)) {
        setNextUnlock(t(`games.gangues.enemy_names.${nextId}`) || nextId)
      }
      if (user?.id) registrarPontuacaoArenaRanking(user.id)
    }

    setTimeout(() => store.saveToCloud(user?.id), 400)
  }, [])

  if (!isVitoria) {
    return (
      <div className="gang-victory gang-container">
        {/* Partículas de explosão — derrota */}
        <div className="gang-victory-particles gang-victory-particles--defeat">
          {[...Array(20)].map((_, i) => (
            <motion.span
              key={i}
              className="gang-particle"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 1.2 + Math.random() * 0.8, ease: 'easeOut' }}
              style={{
                background: ['#DC143C', '#8B0000', '#FF4500', '#FF6347'][i % 4],
                width: 6 + Math.random() * 8,
                height: 6 + Math.random() * 8,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                position: 'fixed',
                top: '50%',
                left: '50%',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
          ))}
        </div>
        <div className="gang-victory-header">
          <h1 className="gang-victory-title gang-victory-lose">{t('games.gangues.derrota')}</h1>
          <p className="gang-victory-sub">{t('games.gangues.derrota_sub')}</p>
        </div>
        <div className="gang-victory-card">
          <div className="gang-victory-sheet-name">{sheet.sheet_name}</div>
          <div className="gang-victory-attrs">
            <div className="gang-victory-attr"><span>A</span>{sheet.attributes.A}</div>
            <div className="gang-victory-attr"><span>H</span>{sheet.attributes.H}</div>
            <div className="gang-victory-attr"><span>R</span>{sheet.attributes.R}</div>
            <div className="gang-victory-attr"><span>D</span>{sheet.attributes.D}</div>
          </div>
          <motion.div className="gang-xp-gain" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            {t('games.gangues.xp_gain', { n: xpGain })}
          </motion.div>
          <GanguesXpBar xpTotal={sheet.xp_total || 0} t={t} compact />
        </div>
        <div className="gang-victory-btns">
          <button className="gang-btn-primary" onClick={() => onNavigate('lobby')}>{t('games.gangues.lutar_novamente')}</button>
          <button className="gang-btn-sair" onClick={() => { store.updateSheet({}); onNavigate('lobby') }}>{t('games.gangues.escolher_outra')}</button>
          <BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.gangues.escolher_oponente')} />
          <button className="gang-sfx-toggle" onClick={() => { sfx.toggle(); setSomAtivo(sfx.enabled) }} title={t('games.gangues.sfx_toggle')}>
            {sfx.enabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    )
  }

  // Fase 1 — mensagem do inimigo derrotado
  if (fase === 'mensagem') {
    const defeatPhrases = enemy?.trash_talk?.defeat || enemy?.trash_talk?.enemy_near_death
    const fallbacks = [0,1,2].map(i => t(`games.gangues.defeat_fallbacks[${i}]`))
    const line = defeatPhrases?.length
      ? defeatPhrases[Math.floor(Math.random() * defeatPhrases.length)]
      : fallbacks[Math.floor(Math.random() * fallbacks.length)]

    return (
      <div className="gang-victory gang-container gang-victory-screen">
        <div className="gang-victory-body">
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
            <div className="gang-chat-msg">
              <div className="gang-chat-avatar gang-chat-avatar--trash">{(t('games.gangues.enemy_names.' + (enemy?.id || '')) || enemy?.name || 'I')[0]}</div>
              <div className="gang-chat-bubble gang-chat-bubble--trash gang-chat-bubble--trash-victory">
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
      <div className="gang-victory gang-container gang-victory-screen">
        <div className="gang-victory-body gang-victory-body--center">
          <h3 className="gang-hp-enemy-name">{t('games.gangues.enemy_names.' + (enemy?.id || '')) || enemy?.name}</h3>
          <div className="gang-bar-wrap gang-hp-bar-wrap">
            <div className="gang-bar gang-hp-bar">
              <motion.div className="gang-bar-fill gang-bar-red gang-hp-bar-fill"
                animate={{ width: `${hpPct}%` }}
                transition={{ duration: 0.05 }} />
            </div>
            <span className="gang-hp-label">
              {hpAtual} / {pvMax}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Fase 3 — vitória
  return (
    <div className="gang-victory gang-container">
      {/* Partículas de comemoração — vitória */}
      <div className="gang-victory-particles gang-victory-particles--victory">
        {[...Array(30)].map((_, i) => (
          <motion.span
            key={i}
            className="gang-particle"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: (Math.random() - 0.5) * 500,
              y: (Math.random() - 0.5) * 500,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 1.5 + Math.random() * 1, ease: 'easeOut', delay: Math.random() * 0.3 }}
            style={{
              background: ['#F5A623', '#FFD700', '#FF6B9D', '#00B4D8', '#FF4500', '#ADFF2F'][i % 6],
              width: 5 + Math.random() * 10,
              height: 5 + Math.random() * 10,
              borderRadius: ['50%', '2px', '50%', '1px'][i % 4],
              position: 'fixed',
              top: '50%',
              left: '50%',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: '0 0 6px currentColor',
              color: ['#F5A623', '#FFD700', '#FF6B9D', '#00B4D8'][i % 4],
            }}
          />
        ))}
      </div>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
          <motion.div
            className="gang-ko-text"
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
          >
          {t('games.gangues.ko')}
        </motion.div>
        <div className="gang-victory-header">
          <h1 className="gang-victory-title gang-victory-win">{t('games.gangues.vitoria')}</h1>
          <p className="gang-victory-sub" dangerouslySetInnerHTML={{ __html: t('games.gangues.vitoria_sub', { name: t('games.gangues.enemy_names.' + (enemy?.id || '')) || enemy?.name }) }} />
        </div>

        <div className="gang-victory-card">
          <div className="gang-victory-sheet-name">{sheet.sheet_name}</div>
          <div className="gang-victory-attrs">
            <div className="gang-victory-attr"><span>A</span>{sheet.attributes.A}</div>
            <div className="gang-victory-attr"><span>H</span>{sheet.attributes.H}</div>
            <div className="gang-victory-attr"><span>R</span>{sheet.attributes.R}</div>
            <div className="gang-victory-attr"><span>D</span>{sheet.attributes.D}</div>
          </div>
          <div className="gang-victory-stats">
            <span>{t('games.gangues.pv', { n: pv })}</span>
            <span>{t('games.gangues.pm', { n: pm })}</span>
            <span>{t('games.gangues.xp', { n: sheet.xp_total || 0 })}</span>
          </div>
          <motion.div className="gang-xp-gain" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}>
            {t('games.gangues.xp_gain', { n: xpGain })}
          </motion.div>
          {/* XP Progress Bar */}
          <GanguesXpBar
            xpTotal={sheet.xp_total || 0}
            t={t}
            animated
          />
        </div>

        {nextUnlock && (
          <motion.div
            className="gang-unlock-badge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {t('games.gangues.novo_oponente', { name: nextUnlock })}
          </motion.div>
        )}

        <div className="gang-victory-btns">
          <button className="gang-btn-primary" onClick={() => onNavigate('lobby')}>{t('games.gangues.escolher_outra')}</button>
          <button className="gang-btn-sair" onClick={() => { store.updateSheet({}); onNavigate('lobby') }}>{t('games.gangues.escolher_outra')}</button>
          <BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.gangues.escolher_oponente')} />
          <button className="gang-sfx-toggle" onClick={() => { sfx.toggle(); setSomAtivo(sfx.enabled) }} title={t('games.gangues.sfx_toggle')}>
            {sfx.enabled ? '🔊' : '🔇'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
