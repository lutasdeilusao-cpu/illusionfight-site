import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useEventos } from '../../../context/EventosContext'
import { useGanguesStore } from './store/useGanguesStore'
import useGanguesTurnMachine from './hooks/useGanguesTurnMachine'
import DramaticDice from './components/DramaticDice'
import { sfx } from '../../../lib/sfx'

const ONOMATOPEIAS = ['POW!', 'WHAM!', 'CRACK!', 'SLASH!', 'BOOM!', 'THWACK!']
const randomOnoma = () => ONOMATOPEIAS[Math.floor(Math.random() * ONOMATOPEIAS.length)]
const pct = (value, max) => Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))

function fighterName(t, member) {
  if (!member) return '?'
  return member.side === 'enemy' ? (t(`games.gangues.enemy_names.${member.id}`) || member.name) : member.sheet_name
}

function pickTrash(t, enemy, category) {
  const translated = t(`games.gangues.trash_talk_npc.${enemy.id}.${category}`)
  const pool = Array.isArray(translated) ? translated : (enemy.trash_talk?.[category] || [])
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

function Roster({ title, members, side, selectable, selectedKey, onSelect, t }) {
  return (
    <section className="gang-team">
      <h3 className="gang-team-title">{title}</h3>
      <div className="gang-team-grid">
        {members.map(member => {
          const dead = member.pv <= 0
          const acted = side === 'player' && member.actedThisRound
          const disabled = dead || acted || !selectable
          return (
            <button
              key={member.key}
              type="button"
              disabled={disabled}
              className={`gang-fighter-card ${side === 'enemy' ? 'gang-fighter-card--enemy' : ''} ${selectedKey === member.key ? 'gang-fighter-card--selected' : ''} ${dead ? 'gang-fighter-card--dead' : ''}`}
              onClick={() => onSelect?.(member.key)}
            >
              <div className="gang-fighter-card-avatar">{fighterName(t, member)[0]}</div>
              <div className="gang-fighter-card-info">
                <strong>{fighterName(t, member)}</strong>
                <progress className="gang-fighter-card-bar" max="100" value={pct(member.pv, member.pvMax)} />
                <small>{member.pv}/{member.pvMax} PV</small>
              </div>
              {acted && <span className="gang-fighter-card-tag">✓</span>}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default function GanguesCombat({ onNavigate }) {
  const { t } = useLanguage()
  const { registrarEvento } = useEventos()
  const store = useGanguesStore()
  const [result, setResult] = useState(null)
  const [showResultBtn, setShowResultBtn] = useState(false)
  const [selectedActor, setSelectedActor] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [log, setLog] = useState([])
  const [trashOptions, setTrashOptions] = useState([])
  const processedEvents = useRef(0)
  const logEndRef = useRef(null)

  const finish = useCallback(outcome => {
    store.endMatch(outcome)
    setResult(outcome)
    if (outcome === 'victory') registrarEvento('arena_vitoria', 'Venceu uma batalha de gangue', 1)
    outcome === 'victory' ? sfx.win() : sfx.lose()
  }, [store, registrarEvento])

  const machine = useGanguesTurnMachine({ playerTeam: store.match.playerTeam, enemyTeam: store.match.enemyTeam, onFinish: finish })
  const players = machine.combatants.filter(item => item.side === 'player')
  const enemies = machine.combatants.filter(item => item.side === 'enemy')

  useEffect(() => { if (machine.phase === 'select') machine.enterCombat() }, [machine.phase, machine.enterCombat])

  useEffect(() => {
    if (!selectedActor || !machine.playerActors.some(item => item.key === selectedActor)) {
      setSelectedActor(machine.playerActors[0]?.key || null)
    }
  }, [machine.playerActors, selectedActor])

  useEffect(() => {
    if (!selectedTarget || enemies.find(item => item.key === selectedTarget)?.pv <= 0) {
      setSelectedTarget(enemies.find(item => item.pv > 0)?.key || null)
    }
  }, [enemies, selectedTarget])

  useEffect(() => {
    const pool = t('games.gangues.trash_talk_player')
    if (Array.isArray(pool) && pool.length >= 3) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5)
      setTrashOptions(shuffled.slice(0, 3))
    }
  }, [machine.round, t])

  useEffect(() => {
    if (machine.events.length <= processedEvents.current) return
    const newEvents = machine.events.slice(processedEvents.current)
    processedEvents.current = machine.events.length

    setLog(prev => {
      let next = prev
      for (const event of newEvents) {
        if (event.type === 'battle_start') {
          next = [...next, { id: event.id, kind: 'system', text: t('games.gangues.log_batalha_inicio') }]
          continue
        }
        if (event.type === 'initiative') {
          next = [...next, { id: event.id, kind: 'initiative', order: event.order.map(item => ({ ...item, name: fighterName(t, machine.combatants.find(member => member.key === item.key)) })) }]
          continue
        }
        if (event.type !== 'attack') continue
        const actor = machine.combatants.find(item => item.key === event.actorKey) || { side: event.side }
        const target = machine.combatants.find(item => item.key === event.targetKey)
        const isPlayer = event.side === 'player'
        next = [...next, {
          id: event.id, kind: 'attack_card', side: event.side,
          actorName: fighterName(t, actor), targetName: fighterName(t, target), round: event.round, fa: event.result.fa, fd: event.result.fd,
          dice: event.result.rolls.fa, defenseDice: event.result.rolls.fd, dmg: event.result.damage, onoma: randomOnoma(),
          attackerBonus: event.result.attackerBonus, defenderBonus: event.result.defenderBonus,
        }]

        const enemyCombatant = isPlayer ? target : actor
        if (enemyCombatant?.trash_talk) {
          const category = event.result.rolls.fa === 3 ? 'take_critical' : isPlayer ? 'take_damage' : 'attack_hit'
          if (Math.random() < 0.6) {
            const line = pickTrash(t, enemyCombatant, category)
            if (line) next = [...next, { id: `${event.id}-trash`, kind: 'trash', sender: fighterName(t, enemyCombatant), text: line }]
          }
        }
      }
      return next
    })
  }, [machine.events, machine.combatants, t])

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [log])

  const sendPlayerTrash = (phrase) => {
    sfx.click()
    setLog(prev => [...prev, { id: `player-trash-${Date.now()}`, kind: 'trash', side: 'player', sender: players[0]?.sheet_name, text: phrase }])
  }

  const handleAttack = () => {
    if (!selectedActor || !selectedTarget) return
    sfx.click()
    machine.playerAction(selectedActor, selectedTarget)
  }

  useEffect(() => {
    if (!result) { setShowResultBtn(false); return }
    const timer = setTimeout(() => setShowResultBtn(true), 1400)
    return () => clearTimeout(timer)
  }, [result])

  const openBattleReport = () => {
    store.setBattleReport({ outcome: result, entries: log, initiative: machine.initiative, combatants: machine.combatants, rounds: machine.round })
    onNavigate('victory')
  }

  if (!store.match.playerTeam?.length) return null

  return (
    <div className="gang-combat gang-container">
      <AnimatePresence>
        {machine.pending && (
          <DramaticDice
            key={`${machine.pending.actorKey}-${machine.round}`}
            finalValue={machine.pending.result.rolls.fa}
            sides={3}
            side={machine.pending.side}
            onComplete={machine.completePending}
          />
        )}
        {result && (
          <motion.div className="gang-match-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="gang-match-result-bg" />
            <div className="gang-match-result-content">
              <motion.div
                className={`gang-match-result-icon gang-match-result-icon--${result === 'victory' ? 'win' : 'lose'}`}
                initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
              >
                {result === 'victory' ? '🏆' : '💀'}
              </motion.div>
              <motion.h1
                className={`gang-match-result-title gang-match-result-title--${result === 'victory' ? 'win' : 'lose'}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }}
              >
                {t(`games.gangues.${result === 'victory' ? 'vitoria' : 'derrota'}`)}
              </motion.h1>
              {result === 'victory' ? (
                <motion.p className="gang-match-result-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                  dangerouslySetInnerHTML={{ __html: t('games.gangues.vitoria_sub', { name: fighterName(t, store.match.enemy && { ...store.match.enemy, side: 'enemy' }) }) }} />
              ) : (
                <motion.p className="gang-match-result-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                  {t('games.gangues.derrota_sub')}
                </motion.p>
              )}
              {showResultBtn && (
                <motion.button
                  className="gang-match-result-btn" onClick={openBattleReport}
                  initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 15 }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                  {t('games.gangues.btn_proximo')}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="gang-vs-bar">
        <button className="gang-vs-bar-back" onClick={() => onNavigate('lobby')}>{t('games.gangues.btn_sair')}</button>
        <div className="gang-vs-bar-line" />
        <span className="gang-vs-bar-label">{t('games.gangues.loadout.round', { n: machine.round })}</span>
        <div className="gang-vs-bar-line" />
      </div>

      <Roster
        title={t('games.gangues.party.your_team')}
        members={players} side="player"
        selectable={machine.phase === 'player'}
        selectedKey={selectedActor} onSelect={setSelectedActor} t={t}
      />

      <div className="gang-log-area">
        {log.map(entry => {
          if (entry.kind === 'system') {
            return (
              <motion.div key={entry.id} className="gang-msg-wrap gang-msg-wrap--system" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span className="gang-bubble gang-bubble--system">{entry.text}</span>
              </motion.div>
            )
          }
          if (entry.kind === 'trash') {
            const isPlayer = entry.side === 'player'
            return (
              <motion.div key={entry.id} className={`gang-msg-wrap ${isPlayer ? 'gang-msg-wrap--player' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="gang-msg-avatar gang-msg-avatar--trash">{(entry.sender || '?')[0]}</div>
                <div className="gang-bubble gang-bubble--trash">{entry.text}</div>
              </motion.div>
            )
          }
          if (entry.kind === 'initiative') {
            return (
              <motion.div key={entry.id} className="gang-initiative-log" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <strong>{t('games.gangues.report.initiative')}</strong>
                {entry.order.map((item, index) => <span key={item.key}><b>{index + 1}</b>{item.name}<small>H {item.ability} + d3 {item.die} = {item.total}</small></span>)}
              </motion.div>
            )
          }
          const isPlayer = entry.side === 'player'
          return (
            <motion.div key={entry.id} className={`gang-msg-wrap ${isPlayer ? 'gang-msg-wrap--player' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`gang-msg-avatar ${isPlayer ? 'gang-msg-avatar--player' : 'gang-msg-avatar--enemy'}`}>{entry.actorName[0]}</div>
              <div className="gang-attack-stack">
                <div className={`gang-attack-card gang-attack-card--${isPlayer ? 'player' : 'enemy'}`}>
                  <div className="gang-attack-card-header">{entry.actorName}</div>
                  <div className="gang-attack-card-body">
                    <div className="gang-attack-card-row"><span className="gang-attack-card-key">FA</span><span className="gang-attack-card-val">{entry.fa}</span></div>
                    <div className="gang-attack-card-row"><span className="gang-attack-card-key">FD</span><span className="gang-attack-card-val">{entry.fd}</span></div>
                    <div className="gang-attack-card-row"><span className="gang-attack-card-key">D3 ATQ</span><span className={`gang-attack-card-val ${entry.dice === 3 ? 'gang-attack-card-val--max' : ''}`}>{entry.dice}</span></div>
                    <div className="gang-attack-card-row"><span className="gang-attack-card-key">D3 DEF</span><span className={`gang-attack-card-val ${entry.defenseDice === 3 ? 'gang-attack-card-val--max' : ''}`}>{entry.defenseDice}</span></div>
                    {entry.attackerBonus?.path && (
                      <div className={`gang-attack-card-bonus ${entry.attackerBonus.applied ? 'gang-attack-card-bonus--hit' : 'gang-attack-card-bonus--miss'}`}>
                        {entry.attackerBonus.applied ? '⚡' : '✕'} {t(`games.gangues.loadout.paths.${entry.attackerBonus.path}.name`)} {t('games.gangues.bonus_ataque')} {entry.attackerBonus.applied ? `+${entry.attackerBonus.amount}` : t('games.gangues.bonus_falhou')}
                      </div>
                    )}
                    {entry.defenderBonus?.path && (
                      <div className={`gang-attack-card-bonus ${entry.defenderBonus.applied ? 'gang-attack-card-bonus--hit' : 'gang-attack-card-bonus--miss'}`}>
                        {entry.defenderBonus.applied ? '🛡️' : '✕'} {t(`games.gangues.loadout.paths.${entry.defenderBonus.path}.name`)} {t('games.gangues.bonus_defesa')} {entry.defenderBonus.applied ? `+${entry.defenderBonus.amount}` : t('games.gangues.bonus_falhou')}
                      </div>
                    )}
                    <div className="gang-attack-card-divider" />
                    <div className="gang-attack-card-damage">
                      <span className="gang-attack-card-damage-label">{t('games.gangues.card_dano')}</span>
                      <span className="gang-attack-card-damage-val">{entry.dmg}</span>
                    </div>
                  </div>
                </div>
                <motion.div className="gang-attack-onoma" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  {entry.onoma}
                </motion.div>
              </div>
            </motion.div>
          )
        })}
        <div ref={logEndRef} />
      </div>

      <Roster
        title={t('games.gangues.party.enemy_team')}
        members={enemies} side="enemy"
        selectable={machine.phase === 'player'}
        selectedKey={selectedTarget} onSelect={setSelectedTarget} t={t}
      />

      {machine.phase === 'player' && !result && trashOptions.length >= 3 && (
        <div className="gang-trash-player-row">
          {trashOptions.map((phrase, i) => (
            <motion.button key={phrase + i} className="gang-trash-player-btn" onClick={() => sendPlayerTrash(phrase)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              💬 {phrase}
            </motion.button>
          ))}
        </div>
      )}

      {machine.phase === 'player' && !result && (
        <div className="gang-actions-bar">
          <div className="gang-actions-row">
            <button className="gang-exit-btn" onClick={() => onNavigate('lobby')}>{t('games.gangues.btn_sair')}</button>
            <button className="gang-attack-btn" disabled={!selectedActor || !selectedTarget} onClick={handleAttack}>
              {t('games.gangues.btn_atacar')}
            </button>
          </div>
        </div>
      )}
      {machine.phase === 'enemy' && !machine.pending && <div className="gang2-enemy-thinking"><span className="gang-thinking-pulse" /><strong>{t('games.gangues.report.enemy_thinking')}</strong><small>{t('games.gangues.report.enemy_strategy')}</small></div>}
    </div>
  )
}
