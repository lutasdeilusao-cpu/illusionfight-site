import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useEventos } from '../../../context/EventosContext'
import { useArenaStore } from './store/useArenaStore'
import useArenaTurnMachine from './hooks/useArenaTurnMachine'
import DramaticDice from './components/DramaticDice'
import { sfx } from '../../../lib/sfx'

function pct(value, max) { return Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100)) }

function Team({ title, members, target, onTarget, enemy, t }) {
  return <section className="arena2-team"><h2>{title}</h2>{members.map(member => <button key={member.key} disabled={member.pv <= 0 || !enemy} className={`arena2-fighter ${enemy ? 'arena2-fighter--enemy' : ''} ${target === member.key ? 'arena2-fighter--target' : ''}`} onClick={() => onTarget?.(member.key)}><div className="arena2-fighter-avatar">{(member.sheet_name || member.name || '?')[0]}</div><div className="arena2-fighter-data"><strong>{enemy ? t(`games.arena.enemy_names.${member.id}`) : member.sheet_name}</strong><div className="arena2-meter"><span>PV</span><progress max="100" value={pct(member.pv, member.pvMax)} /><b>{member.pv}/{member.pvMax}</b></div><div className="arena2-meter arena2-meter--pm"><span>PM</span><progress max="100" value={pct(member.pm, member.pmMax)} /><b>{member.pm}/{member.pmMax}</b></div></div></button>)}</section>
}

export default function ArenaCombat({ onNavigate }) {
  const { t } = useLanguage()
  const { registrarEvento } = useEventos()
  const store = useArenaStore()
  const [result, setResult] = useState(null)
  const [target, setTarget] = useState(null)
  const finish = useCallback(outcome => { store.endMatch(outcome); setResult(outcome); if (outcome === 'victory') registrarEvento('arena_vitoria', 'Venceu uma batalha em equipe na Arena', 1); outcome === 'victory' ? sfx.win() : sfx.lose() }, [store, registrarEvento])
  const machine = useArenaTurnMachine({ playerTeam: store.match.playerTeam, enemyTeam: store.match.enemyTeam, onFinish: finish })
  const players = machine.combatants.filter(item => item.side === 'player')
  const enemies = machine.combatants.filter(item => item.side === 'enemy')

  useEffect(() => { if (machine.phase === 'select') machine.enterCombat() }, [machine.phase, machine.enterCombat])
  useEffect(() => { if (!target || enemies.find(item => item.key === target)?.pv <= 0) setTarget(enemies.find(item => item.pv > 0)?.key || null) }, [enemies, target])
  if (!store.match.playerTeam?.length) return null

  return <div className="arena-combat arena-container arena2-combat">
    <AnimatePresence>
      {machine.pending && <DramaticDice key={`${machine.pending.actorKey}-${machine.round}`} finalValue={machine.pending.result.rolls.fa} side={machine.pending.side} onComplete={machine.completePending} />}
      {result && <motion.div className="arena-match-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="arena-match-result-content"><h1>{t(`games.arena.${result === 'victory' ? 'vitoria' : 'derrota'}`)}</h1><button className="arena-match-result-btn" onClick={() => onNavigate(result === 'victory' ? 'victory' : 'lobby')}>{t('games.arena.btn_proximo')}</button></div></motion.div>}
    </AnimatePresence>
    <Team title={t('games.arena.party.your_team')} members={players} t={t} />
    <div className="arena2-turn"><span>{t('games.arena.loadout.round', { n: machine.round })}</span><strong>{machine.currentActor?.sheet_name || t(`games.arena.enemy_names.${machine.currentActor?.id}`)}</strong></div>
    <Team title={t('games.arena.party.enemy_team')} members={enemies} target={target} onTarget={setTarget} enemy t={t} />
    <div className="arena2-log">{machine.events.slice(-6).map(event => event.type === 'attack' && <p key={event.id}>FA {event.result.fa} × FD {event.result.fd} — {t('games.arena.card_dano')}: {event.result.damage}</p>)}</div>
    {machine.phase === 'player' && !result && <div className="arena-actions-row"><button className="arena-exit-btn" onClick={() => onNavigate('lobby')}>{t('games.arena.btn_sair')}</button><button className="arena-attack-btn" disabled={!target} onClick={() => machine.playerAction(target)}>{t('games.arena.btn_atacar')}</button></div>}
    {machine.phase === 'enemy' && <p className="arena2-enemy-thinking">{t('games.arena.combat_vez_inimigo')}</p>}
  </div>
}
