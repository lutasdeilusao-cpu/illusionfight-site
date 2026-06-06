import { motion } from 'framer-motion'

const COLUNAS = 8
const LINHAS = 16

/**
 * Grid vertical — mobile-first, portrait-optimized
 * Em desktop o jogo mantém formato vertical (max 480px)
 * Células se ajustam ao viewport width
 */
export default function Grid({ aliados = [], inimigos = [], obstrucoes = [], alcance = [], onCasaClick, turnoFase, alvoHighlight }) {
  // Responsivo: tamanho da célula baseado na largura disponível
  const TAM = 46 // fixed size works best with the 480px container

  const grid = Array.from({ length: LINHAS }, (_, y) =>
    Array.from({ length: COLUNAS }, (_, x) => {
      const al = aliados.find(a => a.x === x && a.y === y)
      const inig = inimigos.find(i => i.x === x && i.y === y)
      const obs = obstrucoes.find(o => o.x === x && o.y === y)
      const emAlcance = alcance.some(a => a.x === x && a.y === y)
      return { x, y, aliado: al, inimigo: inig, obstrucao: obs, emAlcance }
    })
  )

  const gridWidth = COLUNAS * TAM + (COLUNAS - 1) * 2 + 12

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: gridWidth,
      margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLUNAS}, ${TAM}px)`,
        gridTemplateRows: `repeat(${LINHAS}, ${TAM}px)`,
        gap: 2,
        padding: 6,
        background: '#111',
        borderRadius: 10,
        width: 'fit-content',
        border: '1px solid #222',
      }}>
        {grid.flat().map(cel => {
          const isMoveTarget = cel.emAlcance && turnoFase === 'mover'
          const isAttackTarget = cel.emAlcance && turnoFase === 'target' && cel.inimigo
          const isEnemyAlvo = alvoHighlight && cel.x === alvoHighlight.x && cel.y === alvoHighlight.y
          return (
            <div
              key={`${cel.x}-${cel.y}`}
              onClick={() => onCasaClick?.(cel.x, cel.y, cel)}
              style={{
                width: TAM,
                height: TAM,
                background: isEnemyAlvo
                  ? 'rgba(255,0,0,0.35)'
                  : isMoveTarget
                  ? 'rgba(255,215,0,0.3)'
                  : isAttackTarget
                  ? 'rgba(255,68,68,0.35)'
                  : cel.emAlcance
                  ? 'rgba(255,215,0,0.15)'
                  : cel.aliado
                  ? 'rgba(0,255,136,0.12)'
                  : cel.inimigo
                  ? 'rgba(255,68,68,0.12)'
                  : cel.obstrucao
                  ? '#333'
                  : '#1a1a1a',
                border: isEnemyAlvo
                  ? '2px solid #FF0000'
                  : isMoveTarget
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
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {cel.aliado && <Token token={cel.aliado} tipo="aliado" tamanho={Math.round(TAM * 0.65)} />}
              {cel.inimigo && <Token token={cel.inimigo} tipo="inimigo" tamanho={Math.round(TAM * 0.65)} />}
              {cel.obstrucao && <span style={{ fontSize: Math.round(TAM * 0.35), opacity: 0.5 }}>🪨</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Token({ token, tipo, tamanho }) {
  const cor = tipo === 'aliado' ? '#00ff88' : '#ff4444'
  const tamanhoNome = token.nome?.length > 6 ? Math.round(tamanho * 0.18) : Math.round(tamanho * 0.22)
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      style={{
        width: tamanho,
        height: tamanho,
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