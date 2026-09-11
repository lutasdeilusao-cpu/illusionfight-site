import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { getGanguesEffectTheme } from '../data/ganguesEffectThemes.js'

// Lista de log do combate — mensagens de sistema, trash talk, ordem de
// iniciativa e o card de ataque (FA/FD/dado/crítico/bônus/dano).
// Extraído de GanguesCombat.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).
const GanguesCombatLogList = forwardRef(function GanguesCombatLogList({ log, t }, logEndRef) {
  return (
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
        const fxLog = getGanguesEffectTheme(entry.activeSpecialId)
        return (
          <motion.div key={entry.id} className={`gang-msg-wrap ${isPlayer ? 'gang-msg-wrap--player' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`gang-msg-avatar ${isPlayer ? 'gang-msg-avatar--player' : 'gang-msg-avatar--enemy'}`}>{entry.actorName[0]}</div>
            <div className="gang-attack-stack">
              <div className={`gang-attack-card gang-attack-card--${isPlayer ? 'player' : 'enemy'} ${fxLog ? 'gang-attack-card--fx' : ''}`} style={fxLog ? { '--fx-rgb': fxLog.rgb } : undefined}>
                <div className="gang-attack-card-header">{entry.actorName}{fxLog && <em className="gang-attack-card-power">{fxLog.glyphs[0]} {t(`games.gangues.progression.skills.${entry.activeSpecialId}`)}</em>}</div>
                <div className="gang-attack-card-body">
                  <div className="gang-attack-card-row"><span className="gang-attack-card-key">FA</span><span className="gang-attack-card-val">{entry.fa}</span></div>
                  <div className="gang-attack-card-row"><span className="gang-attack-card-key">FD</span><span className="gang-attack-card-val">{entry.fd}</span></div>
                  <div className="gang-attack-card-row"><span className="gang-attack-card-key">D3 ATQ</span><span className={`gang-attack-card-val ${entry.critical ? 'gang-attack-card-val--max' : ''}`}>{entry.dice}</span></div>
                  <div className="gang-attack-card-row"><span className="gang-attack-card-key">D3 DEF</span><span className={`gang-attack-card-val ${entry.defenseDice === 3 ? 'gang-attack-card-val--max' : ''}`}>{entry.defenseDice}</span></div>
                  {entry.critical && (
                    <div className="gang-attack-card-bonus gang-attack-card-bonus--critical">
                      💥 {t('games.gangues.critico')} +{entry.criticalBonus}
                    </div>
                  )}
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
                  {entry.shieldConsumed > 0 && (
                    <div className="gang-attack-card-bonus gang-attack-card-bonus--hit">
                      🛡️ {t('games.gangues.card_escudo')} −{entry.shieldConsumed}
                    </div>
                  )}
                  <div className="gang-attack-card-divider" />
                  <div className="gang-attack-card-damage">
                    <span className="gang-attack-card-damage-label">{t('games.gangues.card_dano')}</span>
                    <span className={`gang-attack-card-damage-val ${entry.dmg === 0 ? 'gang-attack-card-damage-val--zero' : ''}`}>{entry.dmg}</span>
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
  )
})

export default GanguesCombatLogList
