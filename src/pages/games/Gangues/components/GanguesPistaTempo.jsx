// Pista da linha do tempo (sistema do Pique, 26/09/2026 — estilo Medabots):
// cada lutador corre da borda até o centro; chegou no centro, é a vez dele.
// Jogador vem da esquerda, inimigo da direita. Quem agiu volta pra largada.
// Uma raia por lutador até 4 raias; passou disso, dividem as raias
// (pedido do Isaias, 26/09/2026). Lê o `tempo` do motor ativo (normal ou
// Briga em Multidão) — ver engine/ganguesLinhaDoTempo.js.
import { useEffect, useState } from 'react'
import { progressoNaPista } from '../engine/ganguesLinhaDoTempo.js'
import { fighterName } from '../engine/ganguesCombatPresentation.js'
import './GanguesPistaTempo.css'

const MAX_RAIAS = 4

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
  const raias = Math.min(MAX_RAIAS, vivos.length)
  return (
    <div className="gang-pista" aria-hidden="true">
      {Array.from({ length: raias }, (_, i) => <div key={i} className="gang-pista__raia" />)}
      <div className="gang-pista__centro" />
      {vivos.map((c, i) => {
        const nome = fighterName(t, c)
        return (
          <span
            key={c.key}
            className={`gang-pista__corredor gang-pista__corredor--${c.side} gang-pista__corredor--raia${i % raias}${c.key === vezKey ? ' is-vez' : ''}`}
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
