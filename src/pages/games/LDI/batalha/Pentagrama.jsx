import { useRef } from 'react'
import { PONTOS, CENTRO, ORBE, ESQUIVA, podeLigar, golpesDe } from './motorPentagrama'

// O tabuleiro: desenha o pentagrama e recebe o combo do jogador.
// Responsivo de propósito: TOCAR num ponto já liga ele (não precisa arrastar;
// arrastar também liga), e tirar o dedo não fecha nada — o combo continua até
// a batida acabar (`travado` = a troca já resolveu). Tocar de novo no ÚLTIMO
// ponto carrega o golpe (`onToque`; o anel mostra a carga). A bolinha entre as
// pernas (orbe) enche a barra de poder a cada toque (`onOrbeToque`) e enquanto
// o dedo segura (`onOrbe(true/false)`), a qualquer hora. `guia` é a sequência
// que o poder pede. `mini` = só mostra (o replay), sem toque.
const RAIO_TOQUE = 34
const RAIO_ARRASTO = { grande: 30, pequeno: 22 }
const RAIO_ORBE = 30
const ESTRELA = ['cab', 'peD', 'maoE', 'maoD', 'peE', 'cab']
const IDS = Object.keys(PONTOS)
const pos = id => (id === ESQUIVA ? CENTRO : PONTOS[id])

function pontoPerto(x, y, centroAberto, arrastando = false) {
  if (centroAberto && Math.hypot(x - CENTRO.x, y - CENTRO.y) < (arrastando ? 22 : 30)) return ESQUIVA
  let melhor = null, dist = Infinity
  for (const id of IDS) {
    const raio = arrastando ? RAIO_ARRASTO[PONTOS[id].grande ? 'grande' : 'pequeno'] : RAIO_TOQUE
    const d = Math.hypot(PONTOS[id].x - x, PONTOS[id].y - y)
    if (d < raio && d < dist) { dist = d; melhor = id }
  }
  return melhor
}

export default function Pentagrama({ combo, telegrafo = [], guia = [], centroAberto = false, travado = false, max = 4, carga = 0, progresso = 0, podeCarregar = false, segurandoOrbe = false, mini = false, onMudar, onToque, onOrbe, onOrbeToque }) {
  const svgRef = useRef(null)
  const desenhando = useRef(false)
  const ligouNesteToque = useRef(false)
  const comecouNoUltimo = useRef(false)
  const noOrbe = useRef(false)
  const ref = useRef({})
  ref.current = { combo, max, centroAberto }

  const coord = e => {
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX; pt.y = e.clientY
    return pt.matrixTransform(svg.getScreenCTM().inverse())
  }

  const ligar = p => {
    const { combo: c, max: m, centroAberto: ab } = ref.current
    if (!p || !podeLigar(c, p, m, ab)) return false
    const novo = [...c, p]
    ref.current.combo = novo
    onMudar(novo)
    ligouNesteToque.current = true
    return true
  }

  const down = e => {
    if (mini || travado) return
    const { x, y } = coord(e)
    e.currentTarget.setPointerCapture(e.pointerId)
    if (onOrbe && Math.hypot(x - ORBE.x, y - ORBE.y) < RAIO_ORBE) {
      noOrbe.current = true
      onOrbeToque?.()
      onOrbe(true)
      return
    }
    const p = pontoPerto(x, y, centroAberto)
    ligouNesteToque.current = false
    comecouNoUltimo.current = Boolean(p) && p === golpesDe(ref.current.combo).at(-1)
    desenhando.current = true
    if (!comecouNoUltimo.current) ligar(p)
  }
  const move = e => {
    if (!desenhando.current) return
    const { x, y } = coord(e)
    ligar(pontoPerto(x, y, ref.current.centroAberto, true))
  }
  const up = () => {
    if (noOrbe.current) { noOrbe.current = false; onOrbe?.(false); return }
    if (!desenhando.current) return
    desenhando.current = false
    // Tocou no último ponto e não puxou pra outro = toque de carga.
    if (comecouNoUltimo.current && !ligouNesteToque.current && podeCarregar) onToque?.()
  }

  const linha = ids => ids.map(id => `${pos(id).x},${pos(id).y}`).join(' ')
  const ultimo = golpesDe(combo).at(-1)

  return (
    <svg ref={svgRef} className={`pg-tabuleiro${travado ? ' is-travado' : ''}${mini ? ' is-mini' : ''}`} viewBox="0 0 300 312"
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <polyline className="pg-estrela" points={linha(ESTRELA)} />
      {['maoD', 'maoE', 'peD', 'peE'].map(id => (
        <line key={id} className="pg-osso" x1={PONTOS[id].x} y1={PONTOS[id].y} x2={CENTRO.x} y2={CENTRO.y} />
      ))}
      {guia.length > 1 && <polyline className="pg-linha pg-linha--guia" points={linha(guia)} />}
      {telegrafo.length > 1 && <polyline className="pg-linha pg-linha--ini" points={linha(telegrafo)} />}
      {combo.length > 1 && <polyline className="pg-linha pg-linha--jog" points={linha(combo)} />}
      <circle className={`pg-centro${centroAberto ? ' is-aberto' : ''}${combo.includes(ESQUIVA) ? ' is-ligado' : ''}`} cx={CENTRO.x} cy={CENTRO.y}
        r={centroAberto || combo.includes(ESQUIVA) ? 20 : 8} />
      {IDS.map(id => {
        const p = PONTOS[id]
        const iIni = golpesDe(telegrafo).indexOf(id), iJog = golpesDe(combo).indexOf(id)
        return (
          <g key={id} className={`pg-ponto${p.grande ? '' : ' is-pequeno'}${iIni >= 0 ? ' is-ini' : ''}${iJog >= 0 ? ' is-jog' : ''}${podeCarregar && id === ultimo ? ' is-pisca' : ''}`}>
            <circle cx={p.x} cy={p.y} r={p.grande ? 17 : 10} />
            {iIni >= 0 && <text className="pg-num pg-num--ini" x={p.x + 15} y={p.y - 13}>{iIni + 1}</text>}
            {iJog >= 0 && <text className="pg-num pg-num--jog" x={p.x - 19} y={p.y - 13}>{iJog + 1}</text>}
            {guia.includes(id) && <text className="pg-num pg-num--guia" x={p.x - 4} y={p.y + 30}>{guia.indexOf(id) + 1}</text>}
          </g>
        )
      })}
      {onOrbe && (
        <g className={`pg-orbe${segurandoOrbe ? ' is-segurando' : ''}`}>
          <circle cx={ORBE.x} cy={ORBE.y} r={14} />
          <text x={ORBE.x} y={ORBE.y + 4}>⚡</text>
        </g>
      )}
      {(carga > 0 || progresso > 0) && ultimo && (
        <circle className={`pg-carga is-c${carga}`} cx={PONTOS[ultimo].x} cy={PONTOS[ultimo].y} r={PONTOS[ultimo].grande ? 26 : 18}
          pathLength="100" style={{ '--prog': carga >= 2 ? 100 : progresso }} />
      )}
    </svg>
  )
}
