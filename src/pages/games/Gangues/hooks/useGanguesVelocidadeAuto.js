// Velocidade do automático / Briga em Multidão: 1x → 2x → 3x → 1x (pedido do
// Isaias, 26/09/2026 — "pro cara poder ir upando"). A escolha fica guardada no
// navegador (conveniência por jogador, não progresso de save).
import { useCallback, useState } from 'react'

const CHAVE = 'ldi-gangues-velocidade-auto'
const OPCOES = [1, 2, 3]

function ler() {
  try { const v = Number(localStorage.getItem(CHAVE)); return OPCOES.includes(v) ? v : 1 } catch { return 1 }
}

export default function useGanguesVelocidadeAuto() {
  const [velocidade, setVelocidade] = useState(ler)
  const ciclarVelocidade = useCallback(() => {
    setVelocidade(v => {
      const prox = OPCOES[(OPCOES.indexOf(v) + 1) % OPCOES.length]
      try { localStorage.setItem(CHAVE, String(prox)) } catch { /* sem storage: vale só nesta luta */ }
      return prox
    })
  }, [])
  return { velocidade, ciclarVelocidade }
}
