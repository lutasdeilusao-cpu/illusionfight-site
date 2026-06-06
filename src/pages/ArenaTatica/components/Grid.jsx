import { motion } from 'framer-motion'

const COLUNAS = 6
const LINHAS = 10

export default function Grid({ aliados = [], inimigos = [], obstrucoes = [], alcance = [], onCasaClick, turnoFase, mobile }) {
  const TAM = mobile ? 44 : 52

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
      display: 'grid',
      gridTemplateColumns: `repeat(${COLUNAS}, ${TAM}px)`,
      gridTemplateRows: `repeat(${LINHAS}, ${TAM}px)`,
      gap: 2,
      padding: 6,
      background: '#111',
      borderRadius: 10,
      margin: '0 auto',
      width: 'fit-content',
    }}>
      {grid.flat().map(cel => {
        const isMoveTarget = cel.emAlcance && turnoFase === 'mover'
        const isAttackTarget = cel.emAlcance && turnoFase === 'target' && cel.inimigo
        return (
          <div
            key={`${cel.x}-${cel.y}`}
            onClick={() => onCasaClick?.(cel.x, cel.y, cel)}
            style={{
              width: TAM,
              height: TAM,
              background: isMoveTarget
                ? 'rgba(255,215,0,0.3)'
                : isAttackTarget
                ? 'rgba(255,68,68,0.3)'
                : cel.emAlcance
                ? 'rgba(255,215,0,0.15)'
                : cel.aliado
                ? 'rgba(0,255,136,0.12)'
                : cel.inimigo
                ? 'rgba(255,68,68,0.12)'
                : cel.obstrucao
                ? '#333'
                : '#1a1a1a',
              border: isMoveTarget
                ? '2px solid #FFD700'
                : isAttackTarget
                ? '2px solid #FF4444'
                : cel.emAlcance
                ? '1px solid rgba(255,215,0,0.4)'
                : '1px solid #2a2a2a',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: cel.emAlcance ? 'pointer' : 'default',
              position: 'relative',
              transition: 'all 0.15s',
            }}
          >
            {cel.aliado && <Token token={cel.aliado} tipo="aliado" />}
            {cel.inimigo && <Token token={cel.inimigo} tipo="inimigo" />}
            {cel.obstrucao && <span style={{ fontSize: 16, opacity: 0.5 }}>🪨</span>}
          </div>
        )
      })}
    </div>
  )
}

function Token({ token, tipo }) {
  const cor = tipo === 'aliado' ? '#00ff88' : '#ff4444'
  const tamanhoNome = token.nome?.length > 6 ? 7 : 9
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: token.elemental ? `radial-gradient(circle, ${cor}, #111)` : cor,
        border: `2px solid ${cor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: tamanhoNome,
        fontWeight: 700,
        color: '#fff',
        cursor: tipo === 'aliado' ? 'pointer' : 'default',
        boxShadow: `0 0 6px ${cor}44`,
        textAlign: 'center',
        lineHeight: 1.1,
        padding: 2,
      }}
    >
      {token.nome?.[0] || '?'}
    </motion.div>
  )
}