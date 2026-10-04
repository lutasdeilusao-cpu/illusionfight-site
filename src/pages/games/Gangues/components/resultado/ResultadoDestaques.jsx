import { combatantName } from '../../engine/ganguesVictoryResolver.js'
import { getGanguesPortraitByTemplateId } from '../../data/ganguesPortraits.js'
import GanguesRetratoImg from '../GanguesRetratoImg'

/* Os números da luta que ajudam a decidir a próxima: quem mais bateu, quem
   derrubou mais, o maior golpe, os críticos e o dano dos dois lados. */
export default function ResultadoDestaques({ t, report }) {
  const golpes = report.entries.filter(e => e.kind === 'attack_card')
  const nossos = golpes.filter(e => e.side === 'player')
  const contrib = report.contribuicoes || {}
  const lutadores = report.combatants.filter(c => c.side === 'player')
  const melhor = campo => lutadores.reduce((a, c) => ((contrib[c.id]?.[campo] || 0) > (contrib[a?.id]?.[campo] || 0) ? c : a), null)
  const maisDano = melhor('dano'), maisAbates = melhor('abates')
  const maiorGolpe = nossos.reduce((a, e) => (e.dmg > (a?.dmg || 0) ? e : a), null)

  const cartoes = [
    maisDano && contrib[maisDano.id]?.dano > 0 && { rosto: maisDano, rotulo: t('games.gangues.resultado.mais_dano'), valor: contrib[maisDano.id].dano },
    maisAbates && contrib[maisAbates.id]?.abates > 0 && { rosto: maisAbates, rotulo: t('games.gangues.resultado.mais_abates'), valor: contrib[maisAbates.id].abates },
    maiorGolpe && { icone: '💥', rotulo: t('games.gangues.resultado.maior_golpe', { nome: maiorGolpe.actorName }), valor: maiorGolpe.dmg },
  ].filter(Boolean)
  const numeros = [
    [t('games.gangues.report.rounds'), report.rounds],
    [t('games.gangues.report.damage_dealt'), nossos.reduce((s, e) => s + e.dmg, 0)],
    [t('games.gangues.report.damage_taken'), golpes.filter(e => e.side === 'enemy').reduce((s, e) => s + e.dmg, 0)],
    [t('games.gangues.resultado.criticos'), nossos.filter(e => e.critical).length],
  ]

  return (
    <section className="resultado-bloco">
      <h2 className="resultado-titulo">{t('games.gangues.resultado.destaques')}</h2>
      {cartoes.length > 0 && (
        <ul className="resultado-destaques">
          {cartoes.map(c => (
            <li key={c.rotulo}>
              <span className="resultado-destaques__rosto">{c.rosto ? <GanguesRetratoImg src={getGanguesPortraitByTemplateId(c.rosto.character_template_id)} fallback={combatantName(t, c.rosto)?.[0]} /> : c.icone}</span>
              <small>{c.rosto ? `${combatantName(t, c.rosto)} · ${c.rotulo}` : c.rotulo}</small>
              <strong>{c.valor}</strong>
            </li>
          ))}
        </ul>
      )}
      <div className="resultado-numeros">
        {numeros.map(([rotulo, v]) => <div key={rotulo}><strong>{v}</strong><small>{rotulo}</small></div>)}
      </div>
    </section>
  )
}
