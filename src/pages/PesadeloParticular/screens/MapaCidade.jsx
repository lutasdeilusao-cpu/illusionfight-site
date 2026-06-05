import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePPStore } from '../store/usePPStore'
import { CASOS } from '../data/casos'
import { casosDisponiveis } from '../data/resolver'
import { t } from '../data/pp-i18n'

const NODES = {
  caso_01: { x: 390, y: 30 },
  caso_02: { x: 200, y: 100 }, caso_03: { x: 580, y: 100 },
  caso_04: { x: 120, y: 170 }, caso_05: { x: 660, y: 170 },
  caso_06: { x: 390, y: 240 },
  caso_07: { x: 160, y: 320 }, caso_08: { x: 390, y: 330 }, caso_09: { x: 620, y: 320 },
  caso_10: { x: 390, y: 410 },
  caso_11: { x: 200, y: 480 }, caso_12: { x: 580, y: 480 },
  caso_13: { x: 390, y: 550 },
  caso_14: { x: 130, y: 620 }, caso_15: { x: 390, y: 630 }, caso_16: { x: 650, y: 620 },
  caso_17: { x: 390, y: 700 },
  caso_18: { x: 200, y: 760 }, caso_19: { x: 580, y: 760 },
  caso_20: { x: 390, y: 810 },
}

const EDGES = [
  ['caso_01','caso_02'], ['caso_01','caso_03'],
  ['caso_02','caso_04'], ['caso_03','caso_05'],
  ['caso_04','caso_06'], ['caso_05','caso_06'],
  ['caso_06','caso_07'], ['caso_06','caso_08'], ['caso_06','caso_09'],
  ['caso_07','caso_10'], ['caso_08','caso_10'], ['caso_09','caso_10'],
  ['caso_10','caso_11'], ['caso_10','caso_12'],
  ['caso_11','caso_13'], ['caso_12','caso_13'],
  ['caso_13','caso_14'], ['caso_13','caso_15'], ['caso_13','caso_16'],
  ['caso_14','caso_17'], ['caso_15','caso_17'], ['caso_16','caso_17'],
  ['caso_17','caso_18'], ['caso_17','caso_19'],
  ['caso_18','caso_20'], ['caso_19','caso_20'],
]

export default function MapaCidade() {
  const store = usePPStore()
  const { casosResolvidos, reputacao } = store
  const [tooltip, setTooltip] = useState(null)

  const disponiveis = casosDisponiveis(casosResolvidos, reputacao)
  const dispIds = disponiveis.map(d => d.id)

  const handleEntrar = (caso) => {
    if (casosResolvidos.includes(caso.id)) return
    if (!dispIds.includes(caso.id)) return
    store.iniciarCaso(caso)
  }

  const getNodeClass = (cid) => {
    if (casosResolvidos.includes(cid)) return 'pp-mapa-node--resolvido'
    if (dispIds.includes(cid)) return 'pp-mapa-node--disponivel'
    return 'pp-mapa-node--bloqueado'
  }

  const isEdgeActive = (from, to) => {
    const fromDisp = casosResolvidos.includes(from) || dispIds.includes(from)
    const toDisp = casosResolvidos.includes(to) || dispIds.includes(to)
    return fromDisp && toDisp
  }

  return (
    <div className="pp-container" style={{ paddingTop: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h1 className="pp-title">
          <span className="pp-title-glitch" data-text={t('pt', 'intro.titulo')}>{t('pt', 'intro.titulo')}</span>
        </h1>
        <p className="pp-subtitle"><span className="pp-cursor">█</span> {t('pt', 'mapa.subtitulo')}</p>
      </div>

      <div className="pp-rep-display">{t('pt', 'geral.reputacao', { valor: reputacao })}</div>

      <div className="pp-mapa-wrap">
        <svg className="pp-mapa-svg" viewBox="0 0 780 860" preserveAspectRatio="xMidYMin meet">
          {EDGES.map(([f, t], i) => (
            <line key={i} x1={NODES[f]?.x} y1={NODES[f]?.y} x2={NODES[t]?.x} y2={NODES[t]?.y}
              className={`pp-mapa-line ${isEdgeActive(f, t) ? 'pp-mapa-line--active' : ''}`} />
          ))}
          {CASOS.map(c => {
            const n = NODES[c.id]
            if (!n) return null
            const cls = getNodeClass(c.id)
            return (
              <g key={c.id} className={`pp-mapa-node ${cls}`}
                onClick={() => handleEntrar(c)}
                onMouseEnter={() => setTooltip({ ...c, x: n.x, y: n.y })}
                onMouseLeave={() => setTooltip(null)}>
                <circle cx={n.x} cy={n.y} r="16" />
                <text x={n.x} y={n.y + 5} textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
                  {c.id.split('_')[1]}
                </text>
                {casosResolvidos.includes(c.id) && (
                  <text x={n.x} y={n.y + 5} textAnchor="middle" fill="#fff" fontSize="11">✓</text>
                )}
              </g>
            )
          })}
        </svg>

        {tooltip && (
          <div className="pp-mapa-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <div className="pp-mapa-tooltip-name">{tooltip.nome}</div>
            <div className="pp-mapa-tooltip-diff">
              {'◆'.repeat(tooltip.dificuldade)} · {tooltip.reputacao_minima > 0 ? `${tooltip.reputacao_minima} rep` : t('pt', 'mapa.sem_requisito')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
