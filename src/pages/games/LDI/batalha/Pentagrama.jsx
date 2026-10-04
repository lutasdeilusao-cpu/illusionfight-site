import { useEffect, useRef } from 'react'
import { PONTOS, CENTRO, ESQUIVA, podeLigar, golpesDe } from './motorPentagrama'

// O tabuleiro: desenha o pentagrama, recebe o traço do dedo e mostra o traço
// do jogador (linha na cor dele) e o do inimigo acendendo (anéis vermelhos).
// Segurar o dedo parado no último ponto carrega o golpe (anel que enche).
// `mini` = só mostra (o replay da troca), sem toque.
const RAIO_TOQUE = 30
const CARGA_MS = 480
const ESTRELA = ['cab', 'peD', 'maoE', 'maoD', 'peE', 'cab']
const IDS = Object.keys(PONTOS)
const pos = id => (id === ESQUIVA ? CENTRO : PONTOS[id])

function pontoPerto(x, y, centroAberto) {
  if (centroAberto && Math.hypot(x - CENTRO.x, y - CENTRO.y) < 26) return ESQUIVA
  let melhor = null, dist = RAIO_TOQUE
  for (const id of IDS) {
    const d = Math.hypot(PONTOS[id].x - x, PONTOS[id].y - y)
    if (d < dist) { dist = d; melhor = id }
  }
  return melhor
}

export default function Pentagrama({ combo, telegrafo = [], centroAberto = false, travado = false, max = 4, carga = 0, cargaMax = 0, mini = false, onMudar, onSoltar, onCarga }) {
  const svgRef = useRef(null)
  const desenhando = useRef(false)
  const timerCarga = useRef(null)
  const ref = useRef({})
  ref.current = { combo, max, carga, cargaMax, centroAberto }

  useEffect(() => () => clearTimeout(timerCarga.current), [])

  // Cada vez que o dedo para num ponto, conta o tempo pra carregar.
  const armarCarga = () => {
    clearTimeout(timerCarga.current)
    const tick = () => {
      const { carga: c, cargaMax: cm } = ref.current
      if (!desenhando.current || c >= cm) return
      onCarga?.(c + 1)
      timerCarga.current = setTimeout(tick, CARGA_MS)
    }
    timerCarga.current = setTimeout(tick, CARGA_MS)
  }

  const coord = e => {
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX; pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse())
  }

  const down = e => {
    if (mini || travado) return
    const { x, y } = coord(e)
    const p = pontoPerto(x, y, centroAberto)
    if (!p || !podeLigar([], p, max, centroAberto)) return
    desenhando.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    onMudar([p])
    armarCarga()
  }
  const move = e => {
    if (!desenhando.current) return
    const { x, y } = coord(e)
    const { combo: c, max: m, centroAberto: ab } = ref.current
    const p = pontoPerto(x, y, ab)
    if (p && podeLigar(c, p, m, ab)) { onMudar([...c, p]); armarCarga() }
  }
  const up = () => {
    if (!desenhando.current) return
    desenhando.current = false
    clearTimeout(timerCarga.current)
    onSoltar?.()
  }

  const linha = ids => ids.map(id => `${pos(id).x},${pos(id).y}`).join(' ')
  const ultimo = combo[combo.length - 1]

  return (
    <svg ref={svgRef} className={`pg-tabuleiro${travado ? ' is-travado' : ''}${mini ? ' is-mini' : ''}`} viewBox="0 0 300 290"
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <polyline className="pg-estrela" points={linha(ESTRELA)} />
      {['maoD', 'maoE', 'peD', 'peE'].map(id => (
        <line key={id} className="pg-osso" x1={PONTOS[id].x} y1={PONTOS[id].y} x2={CENTRO.x} y2={CENTRO.y} />
      ))}
      {telegrafo.length > 1 && <polyline className="pg-linha pg-linha--ini" points={linha(telegrafo)} />}
      {combo.length > 1 && <polyline className="pg-linha pg-linha--jog" points={linha(combo)} />}
      <circle className={`pg-centro${centroAberto ? ' is-aberto' : ''}${combo.includes(ESQUIVA) ? ' is-ligado' : ''}`} cx={CENTRO.x} cy={CENTRO.y}
        r={centroAberto || combo.includes(ESQUIVA) ? 20 : 8} />
      {IDS.map(id => {
        const p = PONTOS[id]
        const iIni = golpesDe(telegrafo).indexOf(id), iJog = golpesDe(combo).indexOf(id)
        return (
          <g key={id} className={`pg-ponto${p.grande ? '' : ' is-pequeno'}${iIni >= 0 ? ' is-ini' : ''}${iJog >= 0 ? ' is-jog' : ''}`}>
            <circle cx={p.x} cy={p.y} r={p.grande ? 17 : 10} />
            {iIni >= 0 && <text className="pg-num pg-num--ini" x={p.x + 15} y={p.y - 13}>{iIni + 1}</text>}
            {iJog >= 0 && <text className="pg-num pg-num--jog" x={p.x - 19} y={p.y - 13}>{iJog + 1}</text>}
          </g>
        )
      })}
      {carga > 0 && ultimo && ultimo !== ESQUIVA && (
        <circle className={`pg-carga is-c${carga}`} cx={PONTOS[ultimo].x} cy={PONTOS[ultimo].y} r={PONTOS[ultimo].grande ? 26 : 18} />
      )}
    </svg>
  )
}
