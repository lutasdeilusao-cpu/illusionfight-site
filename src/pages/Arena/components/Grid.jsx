import { motion } from 'framer-motion'

const TAMANHO_CASA = 52
const LINHAS = 6
const COLUNAS = 10

export default function Grid({ aliados = [], inimigos = [], obstrucoes = [], alcance = [], onCasaClick, turnoFase }) {
  const grid = Array.from({ length: LINHAS }, (_, y) =>
    Array.from({ length: COLUNAS }, (_, x) => {
      const al = aliados.find(a => a.x === x && a.y === y)
      const inig = inimigos.find(i => i.x === x && i.y === y)
      const obs = obstrucoes.find(o => o.x === x && o.y === y)
      const emAlcance = alcance.some(a => a.x === x && a.y === y)
      return { x, y, aliado: al, inimigo: inig, obstrucao: obs, emAlcance }
    })
  )

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${COLUNAS}, ${TAMANHO_CASA}px)`,
      gridTemplateRows: `repeat(${LINHAS}, ${TAMANHO_CASA}px)`,
      gap: 2, padding: 8, background: '#111', borderRadius: 12,
      justifyContent: 'center', margin: '0 auto',
    }}>
      {grid.flat().map(cel => (
        <div key={`${cel.x}-${cel.y}`}
          onClick={() => onCasaClick?.(cel.x, cel.y, cel)}
          style={{
            width: TAMANHO_CASA, height: TAMANHO_CASA,
            background: cel.emAlcance ? 'rgba(255,215,0,0.25)' : cel.aliado ? 'rgba(0,255,136,0.1)' : cel.inimigo ? 'rgba(255,68,68,0.1)' : cel.obstrucao ? '#333' : '#1a1a1a',
            border: cel.emAlcance ? '1px solid #FFD700' : '1px solid #2a2a2a',
            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: cel.emAlcance && turnoFase === 'player' ? 'pointer' : 'default',
            position: 'relative', transition: 'all 0.15s',
          }}>
          {cel.aliado && <Token token={cel.aliado} tipo="aliado" />}
          {cel.inimigo && <Token token={cel.inimigo} tipo="inimigo" />}
          {cel.obstrucao && <span style={{ fontSize: 20, opacity: 0.5 }}>🪨</span>}
        </div>
      ))}
    </div>
  )
}

function Token({ token, tipo }) {
  const cor = tipo === 'aliado' ? '#00ff88' : '#ff4444'
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      style={{
        width: 40, height: 40, borderRadius: '50%',
        background: token.elemental ? `radial-gradient(circle, ${cor}, #111)` : cor,
        border: `2px solid ${cor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, color: '#fff',
        cursor: tipo === 'aliado' ? 'pointer' : 'default',
        boxShadow: `0 0 8px ${cor}44`,
      }}>
      {token.nome?.[0] || '?'}
    </motion.div>
  )
}
