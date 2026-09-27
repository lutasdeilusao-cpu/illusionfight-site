// Pista da linha do tempo (sistema do Pique, 26/09/2026 — estilo Medabots):
// cada lutador corre da borda até o centro; chegou no centro, é a vez dele.
// Jogador vem da esquerda, inimigo da direita. Quem agiu volta pra largada.
// Lê o `tempo` do motor ativo (normal ou Briga em Multidão) — ver
// engine/ganguesLinhaDoTempo.js.
import { progressoNaPista } from '../engine/ganguesLinhaDoTempo.js'
import { fighterName } from '../engine/ganguesCombatPresentation.js'
import './GanguesPistaTempo.css'

export default function GanguesPistaTempo({ t, tempo, combatants, vezKey }) {
  if (!tempo || !combatants?.length) return null
  const prog = progressoNaPista(tempo)
  return (
    <div className="gang-pista" aria-hidden="true">
      <div className="gang-pista__centro" />
      {combatants.filter(c => c.pv > 0).map(c => {
        const nome = fighterName(t, c)
        return (
          <span
            key={c.key}
            className={`gang-pista__corredor gang-pista__corredor--${c.side}${c.key === vezKey ? ' is-vez' : ''}`}
            style={{ '--p': prog[c.key] || 0 }}
            title={nome}
          >
            {(nome || '?')[0]}
          </span>
        )
      })}
    </div>
  )
}
