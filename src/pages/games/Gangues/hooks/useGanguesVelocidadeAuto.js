// Velocidade do automático / Briga em Multidão: 1x → 2x → 3x → 1x (pedido do
// Isaias, 26/09/2026 — "pro cara poder ir upando"). A escolha fica guardada no
// navegador (conveniência por jogador, não progresso de save).
import { useCallback, useEffect, useState } from 'react'
import { useGanguesStore } from '../store/useGanguesStore'

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

// Chave de navegador ESCOPADA pelo save: cada gangue guarda os automáticos
// dela, e uma gangue nova começa com tudo desligado (Isaias, 28/09/2026: "o
// save novo tá começando com as coisas ligadas do save anterior... reseta
// tudo, começa do zero"). Mesmo padrão das flags de tutorial por save.
export function chaveDoSave(base, saveId = useGanguesStore.getState()._saveId) {
  return `${base}:${saveId || 'guest'}`
}

// Automático LEMBRADO entre lutas (pedido do Isaias, 27/09/2026): terminou
// uma luta no automático → a próxima já começa com ele ligado, porradaria
// direto. Só uma ação do PRÓPRIO jogador (ligar/desligar o switch, ou o
// "sair do automático") muda o que fica gravado. Por navegador E por save
// (chaveDoSave) — não vai pro save na nuvem.
// `chave` separa o automático da luta normal do da Briga em Multidão.
export function useGanguesAutoLembrado(chave) {
  const saveId = useGanguesStore(s => s._saveId)
  const ler = () => { try { return localStorage.getItem(chaveDoSave(chave, saveId)) === '1' } catch { return false } }
  const [ligado, setLigadoState] = useState(ler)
  // Reavalia se o save chegar/trocar depois de montar (flag por save nunca
  // confia só no inicializador do useState).
  useEffect(() => { setLigadoState(ler()) }, [chave, saveId]) // eslint-disable-line react-hooks/exhaustive-deps
  const setLigado = useCallback((valor) => {
    setLigadoState(atual => {
      const prox = typeof valor === 'function' ? valor(atual) : Boolean(valor)
      try { localStorage.setItem(chaveDoSave(chave, saveId), prox ? '1' : '0') } catch { /* sem storage: vale só nesta luta */ }
      return prox
    })
  }, [chave, saveId])
  return [ligado, setLigado]
}
