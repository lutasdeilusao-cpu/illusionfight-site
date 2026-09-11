import { getGanguesProgression, ganguesXpMaxForSheet } from '../data/ganguesLoadout.js'
import { fighterName } from '../engine/ganguesCombatPresentation.js'

// Roster compacto: quadradinho (avatar + anel de PV) + nome curto e PM
// sempre visíveis embaixo — com 6 personagens em campo, "quem é quem" tem
// que dar pra ler sem precisar segurar o dedo pra ver o tooltip. Quem age
// agora pisca (gang-mini--acting) em vez de existir um banner "Vez de X".
// Tocar no quadrado abre a fichinha completa quando tocar não ia selecionar
// nada de novo (já tá selecionado, ou não dá pra selecionar agora — morto,
// já agiu, ou fora da sua vez) — sem precisar de botãozinho separado
// pequeno demais pra tocar no celular.
// Extraído de GanguesCombat.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).
export default function GanguesCombatRoster({ members, side, selectable, selectedKey, onSelect, actingKey, onAbrirFicha, dmgPops, t }) {
  return (
    <div className={`gang-roster gang-roster--${side}`}>
      {members.map(member => {
        const dead = member.pv <= 0
        const acted = side === 'player' && member.actedThisRound
        const acting = member.key === actingKey && !dead
        // ── Destaque de dano: barrinha "de sangue" drenando + número flutuante
        // + aviso quando a vida tá baixa (o Isaias reclamou que morria sem ver).
        const pvPct = Math.max(0, Math.min(100, (member.pv || 0) / (member.pvMax || 1) * 100))
        const pops = (dmgPops || []).filter(p => p.targetKey === member.key)
        const baixo = !dead && pvPct <= 20 ? (pvPct <= 10 ? 'gang-mini-wrap--critico' : 'gang-mini-wrap--baixo') : ''
        const wrapFx = `${pops.length ? ' gang-mini-wrap--hit' : ''}${baixo ? ` ${baixo}` : ''}`
        // No lado do jogador só quem tá agindo AGORA é selecionável de
        // verdade (a ordem de turno decide quem ataca, não o toque) — sem
        // isso o segundo personagem nunca teria "nada a selecionar" e o
        // toque tentava selecionar (não fazia nada) em vez de abrir a
        // fichinha, que era o bug: a ficha só abria em quem tava na vez.
        const podeSelecionar = selectable && !dead && !acted && (side === 'enemy' || acting)
        const jaSelecionado = selectedKey === member.key
        const pathClass = member.combat_path ? `gang-path--${member.combat_path}` : ''
        const progression = getGanguesProgression(member)
        const nome = fighterName(t, member)
        const tocar = () => {
          if (podeSelecionar && !jaSelecionado) onSelect?.(member.key)
          else onAbrirFicha?.(member)
        }
        return (
          <div key={member.key} className={`gang-mini-wrap${wrapFx}`}>
            {pops.map(p => (
              <span key={p.id} className={`gang-dmg-pop${p.heal ? ' gang-dmg-pop--heal' : p.amount > 0 ? '' : ' gang-dmg-pop--zero'}${p.critical ? ' gang-dmg-pop--crit' : ''}${p.fatal ? ' gang-dmg-pop--fatal' : ''}`}>
                <b>{p.heal ? `+${p.heal}` : p.amount > 0 ? `−${p.amount}` : p.shield > 0 ? '🛡' : '0'}{p.critical && p.amount > 0 ? '!' : ''}</b>
                <small>{p.actorName}</small>
              </span>
            ))}
            <button
              type="button"
              title={nome}
              className={`gang-mini ${pathClass} ${!podeSelecionar ? 'gang-mini--indisponivel' : ''} ${dead ? 'gang-mini--dead' : ''} ${jaSelecionado ? 'gang-mini--selected' : ''} ${acting ? 'gang-mini--acting' : ''}`}
              onClick={tocar}
            >
              <span className="gang-mini-avatar">{nome[0]}</span>
              <progress className="gang-mini-hp" max={member.pvMax || 1} value={Math.max(0, member.pv || 0)} />
              {acted && <span className="gang-mini-tag">✓</span>}
            </button>
            <span className="gang-mini-nome">{nome}</span>
            <span className="gang-mini-bars" aria-label={nome}>
              <span className="gang-hpbar" role="progressbar" aria-valuenow={Math.max(0, member.pv || 0)} aria-valuemax={member.pvMax || 1}>
                <i className="gang-hpbar-ghost" style={{ width: `${pvPct}%` }} />
                <i className="gang-hpbar-fill" style={{ width: `${pvPct}%` }} />
              </span>
              <progress className="gang-mini-resource gang-mini-resource--pm" max={member.pmMax || 1} value={Math.max(0, member.pm || 0)} />
              {side === 'player' && <progress className="gang-mini-resource gang-mini-resource--xp" max={ganguesXpMaxForSheet(member)} value={progression.ap} />}
            </span>
          </div>
        )
      })}
    </div>
  )
}
