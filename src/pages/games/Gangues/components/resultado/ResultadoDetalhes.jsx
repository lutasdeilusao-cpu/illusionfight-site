import { combatantName } from '../../engine/ganguesVictoryResolver.js'
import { rostoDe } from '../golpe/golpeConta.js'
import GanguesRetratoImg from '../GanguesRetratoImg'

/* O detalhe da luta, fechado por padrão: como cada um terminou, a ordem do
   Pique e o registro de todos os golpes. */
export default function ResultadoDetalhes({ t, report }) {
  const golpes = report.entries.filter(e => e.kind === 'attack_card')
  return (
    <section className="resultado-bloco resultado-detalhes">
      <details>
        <summary>{t('games.gangues.report.final_state')}</summary>
        <ul className="resultado-estado">
          {report.combatants.map(m => (
            <li key={m.key} className={`is-${m.side}${m.pv <= 0 ? ' is-ko' : ''}`}>
              <span className="resultado-estado__rosto"><GanguesRetratoImg src={rostoDe(m)} fallback={combatantName(t, m)?.[0]} /></span>
              <b>{combatantName(t, m)}</b>
              <span className="resultado-barra"><i style={{ '--pct': `${Math.round((Math.max(0, m.pv) / Math.max(1, m.pvMax)) * 100)}%` }} /></span>
              <small>{Math.max(0, m.pv)}/{m.pvMax}</small>
            </li>
          ))}
        </ul>
      </details>
      <details>
        <summary>{t('games.gangues.report.initiative_order')}</summary>
        <ol className="resultado-pique">
          {report.initiative.map(item => {
            const m = report.combatants.find(c => c.key === item.key)
            return <li key={item.key}><span>{combatantName(t, m)}</span><small>{t('games.gangues.attr_labels.H')} {item.ability} + {item.base}</small><strong>{item.total}</strong></li>
          })}
        </ol>
      </details>
      <details>
        <summary>{t('games.gangues.report.complete_log')} ({golpes.length})</summary>
        <ol className="resultado-log">
          {golpes.map(e => (
            <li key={e.id} className={`is-${e.side}`}>
              <small>{t('games.gangues.report.round_number', { n: e.round })}</small>
              <span>{e.actorName} → {e.targetName}{e.critical ? ' 💥' : ''}</span>
              <em>{e.fa} vs {e.fd}</em>
              <b>−{e.dmg}</b>
            </li>
          ))}
          {!golpes.length && <li className="resultado-log__vazio">{t('games.gangues.report.no_log')}</li>}
        </ol>
      </details>
    </section>
  )
}
