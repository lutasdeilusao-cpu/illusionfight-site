import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useArenaStore } from './store/useArenaStore'
import useArenaTurnMachine from './hooks/useArenaTurnMachine'
import DramaticDice from './components/DramaticDice'
import { useEventos } from '../../../context/EventosContext'
import { sfx } from '../../../lib/sfx'
import './Arena.css'

function pct(value, max) {
  return Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))
}

function CombatantPanel({ name, pv, pvMax, pm, pmMax, enemy = false }) {
  return (
    <section className={`arena2-fighter ${enemy ? 'arena2-fighter--enemy' : ''}`}>
      <div className="arena2-fighter-avatar">{(name || '?')[0].toUpperCase()}</div>
      <div className="arena2-fighter-data">
        <strong>{name}</strong>
        <div className="arena2-meter"><span>PV</span><progress max="100" value={pct(pv, pvMax)} /><b>{pv}/{pvMax}</b></div>
        {pm != null && <div className="arena2-meter arena2-meter--pm"><span>PM</span><progress max="100" value={pct(pm, pmMax)} /><b>{pm}/{pmMax}</b></div>}
      </div>
    </section>
  )
}

function ResultOverlay({ result, t, onNext }) {
  return (
    <motion.div className="arena-match-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="arena-match-result-bg" />
      <div className="arena-match-result-content">
        <div className={`arena-match-result-icon ${result === 'victory' ? 'arena-match-result-icon--win' : 'arena-match-result-icon--lose'}`}>{result === 'victory' ? '🏆' : '💀'}</div>
        <h1 className={`arena-match-result-title ${result === 'victory' ? 'arena-match-result-title--win' : 'arena-match-result-title--lose'}`}>{t(`games.arena.${result === 'victory' ? 'vitoria' : 'derrota'}`)}</h1>
        <button className="arena-match-result-btn" onClick={onNext}>{t('games.arena.btn_proximo')}</button>
      </div>
    </motion.div>
  )
}

export default function ArenaCombat({ onNavigate }) {
  const { t } = useLanguage()
  const { registrarEvento } = useEventos()
  const store = useArenaStore()
  const { sheet, match } = store
  const enemy = match.enemy
  const [result, setResult] = useState(null)
  const [playerTalk, setPlayerTalk] = useState([])
  const spokenPendingRef = useRef(null)

  const finish = useCallback((outcome) => {
    store.endMatch(outcome)
    setResult(outcome)
    if (outcome === 'victory') {
      registrarEvento('arena_vitoria', 'Venceu uma batalha na Arena', 1)
      sfx.win()
    } else sfx.lose()
  }, [store, registrarEvento])

  const machine = useArenaTurnMachine({ sheet, enemy, onFinish: finish })
  const enemyName = t(`games.arena.enemy_names.${enemy?.id}`) || enemy?.name
  const talkOptions = t('games.arena.trash_talk_player', { returnObjects: true })

  useEffect(() => {
    if (machine.phase === 'select') machine.enterCombat()
  }, [machine.phase, machine.enterCombat])

  useEffect(() => {
    if (!Array.isArray(talkOptions)) return
    setPlayerTalk([...talkOptions].sort(() => Math.random() - 0.5).slice(0, 3))
  }, [])

  useEffect(() => {
    if (!machine.pending || spokenPendingRef.current === machine.pending) return
    spokenPendingRef.current = machine.pending
    if (machine.pending.side === 'enemy') sfx.attackHeavy()
    else sfx.attackPunch()
  }, [machine.pending])

  if (!enemy) return null

  const act = () => {
    sfx.click()
    machine.playerAction({ type: 'attack', mode: 'attack' })
  }

  return (
    <div className="arena-combat arena-container arena2-combat">
      <AnimatePresence>
        {machine.pending && <DramaticDice key={`${machine.pending.side}-${machine.round}-${machine.pending.result.rolls.fa}`} finalValue={machine.pending.result.rolls.fa} side={machine.pending.side} onComplete={machine.completePending} />}
        {result && <ResultOverlay result={result} t={t} onNext={() => onNavigate('victory')} />}
      </AnimatePresence>

      <CombatantPanel name={sheet.sheet_name} pv={machine.playerPv} pvMax={machine.playerMaxPv} pm={machine.playerPm} pmMax={machine.playerMaxPm} />
      <div className="arena2-turn"><span>{t('games.arena.loadout.round', { n: machine.round })}</span><strong>{machine.phase === 'player' ? t('games.arena.card_ataque') : t('games.arena.combat_vez_inimigo')}</strong></div>
      <CombatantPanel name={enemyName} pv={machine.enemyPv} pvMax={machine.enemyMaxPv} enemy />

      <div className="arena2-log" aria-live="polite">
        {machine.events.slice(-8).map(event => {
          if (event.type === 'initiative') return <p key={event.id} className="arena2-log-system">{t('games.arena.log_iniciativa', { pInit: event.initiative.player.value, enemyName, eInit: event.initiative.enemy.value })}</p>
          if (event.type === 'round_close') return null
          const attack = event.result
          return <div key={event.id} className={`arena2-log-card arena2-log-card--${event.side}`}><strong>{event.side === 'player' ? sheet.sheet_name : enemyName}</strong><span>FA {attack.fa} × FD {attack.fd}</span><b>{t('games.arena.card_dano')}: {attack.damage}</b></div>
        })}
      </div>

      {machine.phase === 'player' && !machine.pending && !result && (
        <div className="arena2-actions">
          <div className="arena-actions-row"><button className="arena-exit-btn" onClick={() => { store.endMatch('defeat'); onNavigate('lobby') }}>✕ {t('games.arena.btn_sair')}</button><button className="arena-attack-btn" onClick={act}>{t('games.arena.btn_atacar')}</button></div>
        </div>
      )}

      {machine.phase === 'enemy' && !machine.pending && <div className="arena2-enemy-thinking">{t('games.arena.combat_vez_inimigo')}</div>}
      <div className="arena-trash-player-row">{playerTalk.map((phrase, index) => <button key={`${phrase}-${index}`} className="arena-trash-player-btn" onClick={() => setPlayerTalk(current => [...current.slice(1), current[0]])}>💬 {phrase}</button>)}</div>
    </div>
  )
}
