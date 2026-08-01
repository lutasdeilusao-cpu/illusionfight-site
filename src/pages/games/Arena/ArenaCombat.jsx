import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useArenaStore } from './store/useArenaStore'
import { POWERS_BY_ELEMENTAL } from '../LDI/data/powersData'
import useArenaTurnMachine from './hooks/useArenaTurnMachine'
import DramaticDice from './components/DramaticDice'
import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
import { useEventos } from '../../../context/EventosContext'
import { sfx } from '../../../lib/sfx'
import './Arena.css'

const MODE_ICONS = { fists: '✊', armed: '⚔️', power: '⚡' }
const ACTIVE_TECHNIQUES = ['bloqueio', 'furia', 'mira_letal']
const EFFECT_PATHS = {
  bloqueio: 'techniques.bloqueio.name', bloqueio_reduce: 'techniques.bloqueio.name', esquiva: 'techniques.esquiva.name', furia: 'techniques.furia.name',
  regeneracao: 'techniques.regeneracao.name', mira_letal: 'techniques.mira_letal.name', mira_letal_hit: 'techniques.mira_letal.name',
  contra_ataque: 'techniques.contra_ataque.name', franzino: 'weaknesses.franzino.name', sedento: 'weaknesses.sedento.name', sensivel: 'weaknesses.sensivel.name',
  thunder_charge: 'effect_labels.thunder_charge', thunder_discharge: 'effect_labels.thunder_discharge', kaeda_momentum: 'effect_labels.kaeda_momentum', elemental: 'effect_labels.elemental',
}

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
  const [mode, setMode] = useState(sheet.combat_style === 'duelista' ? 'armed' : sheet.combat_style === 'canalizador' ? 'power' : 'fists')
  const [selectedPowers, setSelectedPowers] = useState([])
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
  const elemental = sheet.elemental || 'neutro'
  const availablePowers = POWERS_BY_ELEMENTAL[elemental] || POWERS_BY_ELEMENTAL.neutro
  const enemyName = t(`games.arena.enemy_names.${enemy?.id}`) || enemy?.name
  const modeLabels = useMemo(() => ({ fists: t('games.arena.modo_fists'), armed: t('games.arena.modo_armed'), power: t('games.arena.modo_power') }), [t])
  const talkOptions = t('games.arena.trash_talk_player', { returnObjects: true })
  const effectLabel = (id) => t(`games.arena.loadout.${EFFECT_PATHS[id] || `effect_labels.${id}`}`)

  useEffect(() => {
    if (!Array.isArray(talkOptions)) return
    setPlayerTalk([...talkOptions].sort(() => Math.random() - 0.5).slice(0, 3))
  }, [])

  useEffect(() => {
    if (!machine.pending || spokenPendingRef.current === machine.pending) return
    spokenPendingRef.current = machine.pending
    const action = machine.pending.result.action
    if (action.powerId) {
      const power = availablePowers.find(item => item.id === action.powerId)
      const name = t(`games.arena.powers.${elemental}.${action.powerId}.name`) || power?.name || action.powerId
      sfx.powerUsage(); sfx.speakPowerName(name)
    } else if (machine.pending.side === 'enemy') sfx.attackHeavy()
    else sfx.attackPunch()
  }, [machine.pending, availablePowers, elemental, t])

  if (!enemy) return null

  if (machine.phase === 'select') {
    return (
      <div className="arena-combat arena-container arena-combat--power-select">
        <div className="arena-power-select">
          <h2 className="arena-power-title">{t('games.arena.combat_power_titulo')}</h2>
          <p className="arena-power-sub">{t('games.arena.combat_power_sub', { elemental })}</p>
          <div className="arena-power-grid">
            {availablePowers.map(power => {
              const selected = selectedPowers.includes(power.id)
              return <button key={power.id} className={`arena-power-card ${selected ? 'arena-power-card--selected' : ''}`} onClick={() => setSelectedPowers(current => selected ? current.filter(id => id !== power.id) : current.length < 2 ? [...current, power.id] : current)}><div className="arena-power-card-icon">⚡</div><div className="arena-power-card-body"><div className="arena-power-header"><span className="arena-power-header-name">{t(`games.arena.powers.${elemental}.${power.id}.name`) || power.name}</span><span className="arena-power-header-cost">⚡ {power.cost} PM</span></div><p>{t(`games.arena.powers.${elemental}.${power.id}.desc`) || power.desc}</p></div></button>
            })}
          </div>
          <div className="arena2-initiative-preview">{t('games.arena.log_iniciativa', { pInit: machine.initiative.player.value, enemyName, eInit: machine.initiative.enemy.value })}</div>
          <div className="arena-power-footer"><BackToGamesBtn onClick={() => onNavigate('lobby')} label={t('games.arena.btn_voltar')} /><button className="arena-btn-primary" onClick={machine.enterCombat}>{selectedPowers.length ? t('games.arena.combat_entrar_com', { n: selectedPowers.length }) : t('games.arena.combat_entrar_sem')}</button></div>
        </div>
      </div>
    )
  }

  const act = (action) => { sfx.click(); machine.playerAction(action) }
  const selectedTechniques = sheet.technique_ids || []

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
          if (event.type === 'round_close') return <p key={event.id} className="arena2-log-system">{event.playerHeal ? t('games.arena.loadout.round_heal_player', { n: event.playerHeal }) : ''} {event.enemyHeal ? t('games.arena.loadout.round_heal_enemy', { enemyName, n: event.enemyHeal }) : ''}</p>
          const r = event.result
          if (r.skipped) return <p key={event.id} className={`arena2-log-line arena2-log-line--${event.side}`}>{event.side === 'player' ? sheet.sheet_name : enemyName}: {r.effects.map(effectLabel).join(', ')}</p>
          return <div key={event.id} className={`arena2-log-card arena2-log-card--${event.side}`}><strong>{event.side === 'player' ? sheet.sheet_name : enemyName}</strong><span>FA {r.fa} × FD {r.fd}</span><b>{t('games.arena.card_dano')}: {r.damage}</b>{r.counterDamage > 0 && <span>{t('games.arena.loadout.techniques.contra_ataque.name')}: {r.counterDamage}</span>}{r.effects.length > 0 && <small>{r.effects.map(effectLabel).join(' · ')}</small>}</div>
        })}
      </div>

      {machine.phase === 'player' && !machine.pending && !result && (
        <div className="arena2-actions">
          <div className="arena-mode-btns">{Object.entries(MODE_ICONS).map(([id, icon]) => <button key={id} className={`arena-mode-btn ${mode === id ? 'arena-mode-btn--active' : ''}`} onClick={() => setMode(id)}>{icon} {modeLabels[id]}</button>)}</div>
          {mode === 'power' && selectedPowers.map(id => { const power = availablePowers.find(item => item.id === id); return <button key={id} className="arena-power-btn" disabled={machine.playerPm < (power?.cost || 1)} onClick={() => act({ type: 'attack', mode: 'power', powerId: id, powerCost: power?.cost || 1, damageBonus: (power?.cost || 1) * 2 })}>{t(`games.arena.powers.${elemental}.${id}.name`) || power?.name} ⚡{power?.cost}</button> })}
          <div className="arena2-techniques">{selectedTechniques.map(id => ACTIVE_TECHNIQUES.includes(id) ? <button key={id} className="arena2-technique-btn" disabled={id === 'furia' && machine.playerPm < 2} onClick={() => act({ type: 'technique', techniqueId: id, mode: id === 'furia' ? 'fists' : mode })}>{t('games.arena.loadout.technique_action', { name: t(`games.arena.loadout.techniques.${id}.name`) })}</button> : <span key={id} className="arena2-passive">{t(`games.arena.loadout.techniques.${id}.name`)} · {t('games.arena.loadout.passive')}</span>)}</div>
          <div className="arena-actions-row"><button className="arena-exit-btn" onClick={() => { store.endMatch('defeat'); onNavigate('lobby') }}>✕ {t('games.arena.btn_sair')}</button><button className="arena-attack-btn" onClick={() => act({ type: 'attack', mode })}>{t('games.arena.btn_atacar')}</button></div>
        </div>
      )}

      {machine.phase === 'enemy' && !machine.pending && <div className="arena2-enemy-thinking">{t('games.arena.combat_vez_inimigo')}</div>}
      <div className="arena-trash-player-row">{playerTalk.map((phrase, index) => <button key={`${phrase}-${index}`} className="arena-trash-player-btn" onClick={() => setPlayerTalk(current => [...current.slice(1), current[0]])}>💬 {phrase}</button>)}</div>
    </div>
  )
}
