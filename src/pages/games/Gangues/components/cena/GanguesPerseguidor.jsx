import { useRef } from 'react'
import { ALEATORIO_TIPOS } from '../../engine/ganguesEncontroAleatorio.js'

// Tipos com veículo desenhado (assets/veiculos/<tipo>.png, 2 quadros lado a
// lado, apontando pra cima). Os outros continuam com a bolinha colorida.
const VEICULOS = new Set(['moto', 'policia'])

// Lado pra onde o perseguidor andou no último passo; parado, mantém o anterior.
function direcao(prev, atual, antiga) {
  if (!prev) return antiga
  const dx = atual.x - prev.x, dy = atual.y - prev.y
  if (!dx && !dy) return antiga
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'l' : 'o'
  return dy > 0 ? 's' : 'n'
}

export default function GanguesPerseguidor({ perseguidor, t }) {
  const prevRef = useRef(null)
  const dirRef = useRef('n')
  dirRef.current = direcao(prevRef.current, perseguidor, dirRef.current)
  prevRef.current = { x: perseguidor.x, y: perseguidor.y }
  const { tipo } = perseguidor
  const veiculo = VEICULOS.has(tipo)
  return (
    <div className={`gang-world-perseguidor is-${ALEATORIO_TIPOS[tipo]?.cor}${veiculo ? ` is-veiculo veiculo-${tipo} dir-${dirRef.current}` : ''}`} style={{ left: perseguidor.x, top: perseguidor.y }}>
      {veiculo ? <i aria-hidden="true" /> : <span />}
      <small>{t(`games.gangues.cena.aleatorio.${tipo}.nome`)}</small>
    </div>
  )
}
