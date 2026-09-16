import { useEffect, useState } from 'react'

/* Máquina de animação de combate — toca UMA VEZ uma spritesheet em grade
   (linhas×colunas, quadros em ordem esquerda→direita, cima→baixo) e para
   no último quadro. Genérico: qualquer personagem/golpe registrado em
   ganguesCombatAnimations.js usa este MESMO componente, nada hardcoded
   aqui — o Trinca e o Muro (e quem vier depois) só diferem nos DADOS
   (folha, grade, timing), não no código de animação.

   Por que estado/JS em vez de CSS @keyframes (como era no protótipo do
   Trinca): CSS keyframes precisava de um bloco escrito à mão por
   personagem (posições % calculadas manualmente pra cada quadro) — não dá
   pra generalizar pra 30 personagens sem gerar CSS dinamicamente, o que é
   mais estranho que só avançar um índice de quadro em JS. */
export default function GanguesCombatSpriteAnim({ sheet, cols, rows, frames, frameMs = 80, frameW, frameH, className }) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    setFrame(0)
    let i = 0
    const id = setInterval(() => {
      i += 1
      if (i >= frames) { clearInterval(id); return }
      setFrame(i)
    }, frameMs)
    return () => clearInterval(id)
  }, [sheet, frames, frameMs])

  const col = frame % cols
  const row = Math.floor(frame / cols)
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        backgroundImage: `url(${sheet})`,
        backgroundSize: `${cols * 100}% ${rows * 100}%`,
        backgroundPosition: `${cols > 1 ? (col / (cols - 1)) * 100 : 0}% ${rows > 1 ? (row / (rows - 1)) * 100 : 0}%`,
        aspectRatio: frameW && frameH ? `${frameW} / ${frameH}` : undefined,
      }}
    />
  )
}
