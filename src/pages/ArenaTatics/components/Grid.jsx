import { motion } from 'framer-motion'

const COLUNAS = 8
const LINHAS = 16

const getCorElemento = (elem) => {
  const map = { fogo: '#FF4500', agua: '#1E90FF', terra: '#8B4513', vento: '#87CEEB', eletrico: '#FFD700', trevas: '#9932CC' }
  return map[elem] || '#00B4D8'
}

export default function Grid({ aliados = [], inimigos = [], obstrucoes = [], alcance = [], onCasaClick, turnoFase, alvoHighlight }) {
  const TAM = 46

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
    <div className="tatics-grid-wrapper">
      <div className="tatics-grid" style={{
        gridTemplateColumns: `repeat(${COLUNAS}, ${TAM}px)`,
        gridTemplateRows: `repeat(${LINHAS}, ${TAM}px)`,
      }}>
        {grid.flat().map(cel => {
          const isMoveTarget = cel.emAlcance && turnoFase === 'mover'
          const isAttackTarget = cel.emAlcance && turnoFase === 'target' && cel.inimigo
          const isEnemyAlvo = alvoHighlight && cel.x === alvoHighlight.x && cel.y === alvoHighlight.y
          return (
            <div
              key={`${cel.x}-${cel.y}`}
              onClick={() => onCasaClick?.(cel.x, cel.y, cel)}
              className={[
                'tatics-cell',
                isEnemyAlvo ? 'cell-alvo' : '',
                isMoveTarget ? 'cell-move' : '',
                isAttackTarget ? 'cell-attack' : '',
                cel.emAlcance && !isMoveTarget && !isAttackTarget ? 'cell-alcance' : '',
                cel.aliado ? 'cell-aliado' : '',
                cel.inimigo ? 'cell-inimigo' : '',
                cel.obstrucao ? 'cell-obstrucao' : '',
                !cel.aliado && !cel.inimigo && !cel.obstrucao && !cel.emAlcance ? 'cell-vazia' : '',
              ].filter(Boolean).join(' ')}
            >
              {cel.aliado && <Token token={cel.aliado} tipo="aliado" tamanho={Math.round(TAM * 0.65)} elemental={cel.aliado.elemental} />}
              {cel.inimigo && <Token token={cel.inimigo} tipo="inimigo" tamanho={Math.round(TAM * 0.65)} elemental={cel.inimigo.elemental} />}
              {cel.obstrucao && <span className="tatics-obstaculo">🪨</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Token({ token, tipo, tamanho, elemental }) {
  const corElemento = elemental ? getCorElemento(elemental) : (tipo === 'aliado' ? '#00B4D8' : '#E24B4A')
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`tatics-token ${tipo === 'aliado' ? 'token-aliado' : 'token-inimigo'}`}
      style={{
        width: tamanho,
        height: tamanho,
        background: `radial-gradient(circle at 35% 35%, ${corElemento}88, ${tipo === 'aliado' ? '#003344' : '#331111'})`,
        borderColor: corElemento,
        boxShadow: `0 0 12px ${corElemento}44, inset 0 0 8px ${corElemento}22`,
        fontSize: Math.round(tamanho * 0.22),
      }}
    >
      {token.nome?.[0] || '?'}
    </motion.div>
  )
}