// Pista da linha do tempo (sistema do Pique, 26/09/2026 — estilo Medabots):
// cada lutador corre da borda até o centro; chegou no centro, é a vez dele.
// Jogador vem da esquerda, inimigo da direita. Quem agiu volta pra largada.
// Cada raia leva um aliado (vem da esquerda) e um inimigo (vem da direita);
// só aparecem as raias necessárias, até 6 — passou disso, dividem
// (pedido do Isaias, 27/09/2026). Lê o `tempo` do motor ativo (normal ou
// Briga em Multidão) — ver engine/ganguesLinhaDoTempo.js.
import { useEffect, useState } from 'react'
import { progressoNaPista } from '../engine/ganguesLinhaDoTempo.js'
import { fighterName } from '../engine/ganguesCombatPresentation.js'
import './GanguesPistaTempo.css'

const MAX_RAIAS = 6

export default function GanguesPistaTempo({ t, tempo, combatants, vezKey }) {
  // Na montagem todo mundo nasce na largada e só depois corre pra posição
  // real — senão o primeiro a agir já aparecia no centro, sem ver a corrida.
  const [largou, setLargou] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setLargou(true)))
    return () => cancelAnimationFrame(id)
  }, [])
  if (!tempo || !combatants?.length) return null
  const prog = progressoNaPista(tempo)
  const vivos = combatants.filter(c => c.pv > 0)
  const lado = side => vivos.filter(c => c.side === side)
  const raiaDe = new Map([...lado('player').map((c, i) => [c.key, i]), ...lado('enemy').map((c, i) => [c.key, i])])
  const raias = Math.min(MAX_RAIAS, Math.max(lado('player').length, lado('enemy').length))
  return (
    <div className="gang-pista" aria-hidden="true">
      {Array.from({ length: raias }, (_, i) => <div key={i} className="gang-pista__raia" />)}
      <div className="gang-pista__centro" />
      {vivos.map(c => {
        const nome = fighterName(t, c)
        return (
          <span
            key={c.key}
            className={`gang-pista__corredor gang-pista__corredor--${c.side} gang-pista__corredor--raia${raiaDe.get(c.key) % raias}${c.key === vezKey ? ' is-vez' : ''}`}
            style={{ '--p': largou ? (prog[c.key] || 0) : 0 }}
            title={nome}
          >
            {(nome || '?')[0]}
          </span>
        )
      })}
    </div>
  )
}
