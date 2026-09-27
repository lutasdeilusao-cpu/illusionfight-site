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

// Automático LEMBRADO entre lutas (pedido do Isaias, 27/09/2026): terminou
// uma luta no automático → a próxima já começa com ele ligado, porradaria
// direto. Só uma ação do PRÓPRIO jogador (ligar/desligar o switch, ou o
// "sair do automático") muda o que fica gravado. Mesma lógica de
// conveniência da velocidade acima: por navegador, não progresso de save.
// `chave` separa o automático da luta normal do da Briga em Multidão.
export function useGanguesAutoLembrado(chave) {
  const [ligado, setLigadoState] = useState(() => {
    try { return localStorage.getItem(chave) === '1' } catch { return false }
  })
  const setLigado = useCallback((valor) => {
    setLigadoState(atual => {
      const prox = typeof valor === 'function' ? valor(atual) : Boolean(valor)
      try { localStorage.setItem(chave, prox ? '1' : '0') } catch { /* sem storage: vale só nesta luta */ }
      return prox
    })
  }, [chave])
  return [ligado, setLigado]
}
