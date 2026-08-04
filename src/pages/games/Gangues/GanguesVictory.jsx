import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { registrarPontuacaoArenaRanking } from '../../../hooks/useLeaderboardDB'
import { sfx } from '../../../lib/sfx'

function combatantName(t, member) {
  return member?.side === 'enemy' ? (t(`games.gangues.enemy_names.${member.id}`) || member.name) : member?.sheet_name
}

export default function GanguesVictory({ onNavigate }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const store = useGanguesStore()
  const { match } = store
  const report = match.battleReport || { outcome: match.status, entries: [], initiative: [], combatants: [], rounds: 0 }
  const victory = report.outcome === 'victory'
  const processed = useRef(false)
  const attacks = report.entries.filter(entry => entry.kind === 'attack_card')
  const playerDamage = attacks.filter(entry => entry.side === 'player').reduce((sum, entry) => sum + entry.dmg, 0)
  const enemyDamage = attacks.filter(entry => entry.side === 'enemy').reduce((sum, entry) => sum + entry.dmg, 0)

  useEffect(() => {
    if (processed.current) return
    processed.current = true
    const xp = victory ? 10 : 1
    store.gainXp(xp)
    if (victory) {
      store.unlockNextEnemy(match.enemy_id)
      if (user?.id) registrarPontuacaoArenaRanking(user.id)
      sfx.win()
    } else sfx.lose()
    const timer = setTimeout(() => store.saveToCloud(user?.id), 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className={`gang-report gang-report--${victory ? 'victory' : 'defeat'}`}>
      <motion.header className="gang-report-hero" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}>
        <span className="gang-report-code">{victory ? t('games.gangues.report.mission_complete') : t('games.gangues.report.mission_failed')}</span>
        <h1>{victory ? t('games.gangues.vitoria') : t('games.gangues.derrota')}</h1>
        <p>{victory ? t('games.gangues.report.victory_message') : t('games.gangues.report.defeat_message')}</p>
      </motion.header>

      <section className="gang-report-summary">
        <div><span>{t('games.gangues.report.rounds')}</span><strong>{report.rounds}</strong></div>
        <div><span>{t('games.gangues.report.attacks')}</span><strong>{attacks.length}</strong></div>
        <div><span>{t('games.gangues.report.damage_dealt')}</span><strong>{playerDamage}</strong></div>
        <div><span>{t('games.gangues.report.damage_taken')}</span><strong>{enemyDamage}</strong></div>
      </section>

      <section className="gang-report-section">
        <h2>{t('games.gangues.report.final_state')}</h2>
        <div className="gang-report-roster">
          {report.combatants.map(member => <div key={member.key} className={`gang-report-member gang-report-member--${member.side} ${member.pv <= 0 ? 'gang-report-member--ko' : ''}`}><span>{combatantName(t, member)?.[0] || '?'}</span><div><strong>{combatantName(t, member)}</strong><small>{member.side === 'player' ? t('games.gangues.report.your_gang') : t('games.gangues.report.enemy_gang')}</small></div><b>{member.pv}/{member.pvMax} PV</b></div>)}
        </div>
      </section>

      <section className="gang-report-section">
        <h2>{t('games.gangues.report.initiative_order')}</h2>
        <div className="gang-report-initiative">
          {report.initiative.map((item, index) => {
            const member = report.combatants.find(entry => entry.key === item.key)
            return <div key={item.key}><b>{index + 1}</b><span>{combatantName(t, member)}</span><small>H {item.ability} + d3 {item.die}</small><strong>{item.total}</strong></div>
          })}
        </div>
      </section>

      <section className="gang-report-section gang-report-section--log">
        <h2>{t('games.gangues.report.complete_log')}</h2>
        <div className="gang-report-log">
          {attacks.map((entry, index) => <article key={entry.id} className={`gang-report-attack gang-report-attack--${entry.side}`}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{t('games.gangues.report.round_number', { n: entry.round })}</small><strong>{entry.actorName} → {entry.targetName}</strong><p>FA {entry.fa} · FD {entry.fd} · D3 {entry.dice}/{entry.defenseDice}{entry.attackerBonus?.applied ? ` · +${entry.attackerBonus.amount} ${t(`games.gangues.loadout.paths.${entry.attackerBonus.path}.name`)}` : ''}{entry.defenderBonus?.applied ? ` · +${entry.defenderBonus.amount} ${t(`games.gangues.loadout.paths.${entry.defenderBonus.path}.name`)} (def)` : ''}</p></div><b>−{entry.dmg} PV</b></article>)}
          {!attacks.length && <p className="gang-report-empty">{t('games.gangues.report.no_log')}</p>}
        </div>
      </section>

      <footer className="gang-report-actions">
        <button className="gang-report-primary" onClick={() => onNavigate('lobby')}>{t('games.gangues.report.back_to_gang')}</button>
        <button className="gang-report-secondary" onClick={() => onNavigate('lobby')}>{t('games.gangues.report.new_battle')}</button>
      </footer>
    </main>
  )
}
