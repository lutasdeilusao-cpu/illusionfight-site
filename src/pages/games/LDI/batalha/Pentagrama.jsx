import { useRef } from 'react'
import { PONTOS, CENTRO, ORBE, ESQUIVA, podeLigar, golpesDe } from './motorPentagrama'

// O tabuleiro: desenha o pentagrama e recebe o combo do jogador.
// Responsivo de propósito: TOCAR num ponto já liga ele (não precisa arrastar;
// arrastar também liga), e tirar o dedo não fecha nada — o combo continua até
// a batida acabar (`travado` = a troca já resolveu). Tocar de novo no ÚLTIMO
// ponto carrega o golpe (`onToque`; o anel mostra a carga). A bolinha em cima
// da cabeça (orbe) enche a barra de poder a cada toque (`onOrbeToque`) e enquanto
// o dedo segura (`onOrbe(true/false)`), a qualquer hora. `guia` é a sequência
// que o poder pede: número dentro do ponto, o próximo pulsando, os feitos
// apagados. `superPronto`: a bolinha vira o botão do SUPER. `mini` = só mostra
// (o replay), sem toque.
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

export default function Pentagrama({ combo, telegrafo = [], guia = [], superPronto = false, tempos = [], quarto = 0, fantasmas = [], perigo = false, onRecusado, centroAberto = false, travado = false, max = 4, carga = 0, progresso = 0, podeCarregar = false, segurandoOrbe = false, mini = false, onMudar, onToque, onOrbe, onOrbeToque }) {
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
    if (!p) return false
    if (!podeLigar(c, p, m, ab)) {
      // Tocou num ponto de verdade mas não cabe mais golpe (tonto ou máximo).
      if (p !== golpesDe(c).at(-1) && p !== ESQUIVA && golpesDe(c).length >= m) onRecusado?.()
      return false
    }
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
    // Bolinha de energia ou ponto: vale o que estiver mais perto do dedo (a
    // bolinha fica colada na cabeça).
    const pertoPonto = pontoPerto(x, y, centroAberto)
    const distPonto = pertoPonto ? Math.hypot(x - pos(pertoPonto).x, y - pos(pertoPonto).y) : Infinity
    const distOrbe = Math.hypot(x - ORBE.x, y - ORBE.y)
    if (onOrbe && distOrbe < RAIO_ORBE && distOrbe < distPonto) {
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
  // Quantos pontos da sequência do poder já saíram certos, na ordem.
  const feitos = guia.length ? golpesDe(combo).findIndex((p, i) => p !== guia[i]) : 0
  const feitosN = guia.length ? (feitos === -1 ? Math.min(golpesDe(combo).length, guia.length) : feitos) : 0

  return (
    <svg ref={svgRef} className={`pg-tabuleiro${travado ? ' is-travado' : ''}${mini ? ' is-mini' : ''}${perigo ? ' is-perigo' : ''}`} viewBox="0 -42 300 312"
      style={quarto ? { '--quarto': `${quarto}ms` } : undefined}
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
        const iIni = golpesDe(telegrafo).indexOf(id), iJog = golpesDe(combo).indexOf(id), iGuia = guia.indexOf(id)
        // Super dele (perigo): qualquer ordem — tocado apaga, o resto pulsa.
        const estadoGuia = iGuia < 0 ? '' : perigo ? (iJog >= 0 ? ' is-guia-feito' : ' is-guia-proximo')
          : iGuia < feitosN ? ' is-guia-feito' : iGuia === feitosN ? ' is-guia-proximo' : ' is-guia'
        return (
          <g key={id} className={`pg-ponto${p.grande ? '' : ' is-pequeno'}${iIni >= 0 ? ' is-ini' : ''}${iJog >= 0 ? ' is-jog' : ''}${iJog >= 0 && tempos[iJog] ? ' is-tempo' : ''}${podeCarregar && id === ultimo ? ' is-pisca' : ''}${estadoGuia}`}>
            {/* Anel do beat: fecha sobre o ponto a cada tempo — tocar quando fecha = no tempo. */}
            {quarto > 0 && !travado && <circle className="pg-anel" cx={p.x} cy={p.y} r={p.grande ? 17 : 10} />}
            <circle cx={p.x} cy={p.y} r={p.grande ? 17 : 10} />
            {iIni >= 0 && <text className="pg-num pg-num--ini" x={p.x + 15} y={p.y - 13}>{iIni + 1}</text>}
            {iJog >= 0 && <text className="pg-num pg-num--jog" x={p.x - 19} y={p.y - 13}>{iJog + 1}</text>}
          </g>
        )
      })}
      {/* Sequência do poder por cima de tudo: o próximo ponto ganha um anel que pulsa. */}
      {!perigo && guia.length > 0 && feitosN < guia.length && (
        <circle className="pg-guia-proximo" cx={PONTOS[guia[feitosN]].x} cy={PONTOS[guia[feitosN]].y} r={PONTOS[guia[feitosN]].grande ? 25 : 18} />
      )}
      {guia.map((id, i) => (
        <text key={`g-${id}`} className={`pg-num pg-num--guia${perigo ? (combo.includes(id) ? ' is-feito' : '') : i < feitosN ? ' is-feito' : i === feitosN ? ' is-proximo' : ''}`} x={PONTOS[id].x} y={PONTOS[id].y + 5}>
          {i + 1}
        </text>
      ))}
      {fantasmas.map(f => (
        <g key={f.id}>
          <circle className={`pg-fantasma is-${f.estado}`} cx={PONTOS[f.ponto].x} cy={PONTOS[f.ponto].y} r={PONTOS[f.ponto].grande ? 24 : 16} />
          {f.dano > 0 && <text className="pg-fantasma__dano" x={PONTOS[f.ponto].x} y={PONTOS[f.ponto].y - 26}>−{f.dano}</text>}
        </g>
      ))}
      {onOrbe && (
        <g className={`pg-orbe${segurandoOrbe ? ' is-segurando' : ''}${superPronto ? ' is-pronto' : ''}`}>
          {superPronto && <circle className="pg-orbe__onda" cx={ORBE.x} cy={ORBE.y} r={20} />}
          <circle cx={ORBE.x} cy={ORBE.y} r={superPronto ? 20 : 14} />
          <text x={ORBE.x} y={ORBE.y + (superPronto ? 6 : 4)}>⚡</text>
        </g>
      )}
      {(carga > 0 || progresso > 0) && ultimo && (
        <circle className={`pg-carga is-c${carga}`} cx={PONTOS[ultimo].x} cy={PONTOS[ultimo].y} r={PONTOS[ultimo].grande ? 26 : 18}
          pathLength="100" style={{ '--prog': carga >= 2 ? 100 : progresso }} />
      )}
    </svg>
  )
}
