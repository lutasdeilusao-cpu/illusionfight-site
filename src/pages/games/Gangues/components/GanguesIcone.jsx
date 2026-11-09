// Ícone do Gangues: arte oficial quando existe, emoji quando não.
export default function GanguesIcone({ arte, emoji, className = '' }) {
  if (arte) return <img className={`gang-icone ${className}`} src={arte} alt="" loading="lazy" draggable="false" />
  return <>{emoji}</>
}

// Carta: moldura do espaço + a cara do inimigo na janela.
export function GanguesCartaArte({ moldura, rosto, className = '' }) {
  if (!moldura) return <>🃏</>
  return (
    <span className={`gang-carta-arte ${className}`}>
      <img src={moldura} alt="" loading="lazy" draggable="false" />
      {rosto && <img className="gang-carta-arte__rosto" src={rosto} alt="" loading="lazy" draggable="false" />}
    </span>
  )
}
