import { useRef } from 'react'
import { PONTOS, CENTRO, podeLigar } from './motorPentagrama'

// O tabuleiro: desenha o pentagrama, recebe o traço do dedo e mostra o combo
// do jogador (linha na cor dele) e o do inimigo acendendo (anéis vermelhos).
const RAIO_TOQUE = 30
const ESTRELA = ['cab', 'peD', 'maoE', 'maoD', 'peE', 'cab']
const IDS = Object.keys(PONTOS)

function pontoPerto(x, y) {
  let melhor = null, dist = RAIO_TOQUE
  for (const id of IDS) {
    const d = Math.hypot(PONTOS[id].x - x, PONTOS[id].y - y)
    if (d < dist) { dist = d; melhor = id }
  }
  return melhor
}

export default function Pentagrama({ combo, telegrafo, centroAberto, travado, onMudar, onSoltar, onEsquiva }) {
  const svgRef = useRef(null)
  const desenhando = useRef(false)

  const coord = e => {
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX; pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse())
  }

  const down = e => {
    const { x, y } = coord(e)
    if (Math.hypot(x - CENTRO.x, y - CENTRO.y) < 22) { if (centroAberto && !travado) onEsquiva(); return }
    if (travado) return
    const p = pontoPerto(x, y)
    if (!p || !podeLigar([], p)) return
    desenhando.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    onMudar([p])
  }
  const move = e => {
    if (!desenhando.current) return
    const { x, y } = coord(e)
    const p = pontoPerto(x, y)
    if (p && podeLigar(combo, p)) onMudar([...combo, p])
  }
  const up = () => {
    if (!desenhando.current) return
    desenhando.current = false
    onSoltar(combo)
  }

  const linha = ids => ids.map(id => `${PONTOS[id].x},${PONTOS[id].y}`).join(' ')

  return (
    <svg ref={svgRef} className={`pg-tabuleiro${travado ? ' is-travado' : ''}`} viewBox="0 0 300 290"
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <polyline className="pg-estrela" points={linha(ESTRELA)} />
      {['maoD', 'maoE', 'peD', 'peE'].map(id => (
        <line key={id} className="pg-osso" x1={PONTOS[id].x} y1={PONTOS[id].y} x2={CENTRO.x} y2={CENTRO.y} />
      ))}
      {telegrafo.length > 1 && <polyline className="pg-linha pg-linha--ini" points={linha(telegrafo)} />}
      {combo.length > 1 && <polyline className="pg-linha pg-linha--jog" points={linha(combo)} />}
      <circle className={`pg-centro${centroAberto ? ' is-aberto' : ''}`} cx={CENTRO.x} cy={CENTRO.y} r={centroAberto ? 18 : 8} />
      {IDS.map(id => {
        const p = PONTOS[id]
        const iIni = telegrafo.indexOf(id), iJog = combo.indexOf(id)
        return (
          <g key={id} className={`pg-ponto${p.grande ? '' : ' is-pequeno'}${iIni >= 0 ? ' is-ini' : ''}${iJog >= 0 ? ' is-jog' : ''}`}>
            <circle cx={p.x} cy={p.y} r={p.grande ? 17 : 10} />
            {iIni >= 0 && <text className="pg-num pg-num--ini" x={p.x + 15} y={p.y - 13}>{iIni + 1}</text>}
            {iJog >= 0 && <text className="pg-num pg-num--jog" x={p.x - 19} y={p.y - 13}>{iJog + 1}</text>}
          </g>
        )
      })}
    </svg>
  )
}
