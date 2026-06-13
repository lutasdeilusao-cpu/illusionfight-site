import { useState, useCallback } from 'react'
import { useFichas } from '../context/FichasContext'
import { FICHAS_GATE_ATIVO } from '../config/fichas'

/**
 * useFichaGate — controle de acesso a jogos via fichas
 *
 * Regra: 1 ficha desbloqueia o jogo por 1 dia inteiro.
 * - Se o jogador já pagou hoje, entra de graça quantas vezes quiser
 * - Se não pagou, mostra confirmação → gasta 1 ficha e desbloqueia por 24h
 * - Admin sempre entra de graça
 *
 * O desbloqueio é salvo no localStorage com a data, pra persistir
 * mesmo com F5 mas resetar no dia seguinte.
 */
function getHoje() {
  return new Date().toISOString().split('T')[0]
}

function isDesbloqueadoHoje(nomeJogo) {
  try {
    const key = `ficha_gate_${nomeJogo}`
    const saved = localStorage.getItem(key)
    return saved === getHoje()
  } catch {
    return false
  }
}

function marcarDesbloqueado(nomeJogo) {
  try {
    const key = `ficha_gate_${nomeJogo}`
    localStorage.setItem(key, getHoje())
  } catch {
    // localStorage indisponível
  }
}

export function useFichaGate(nomeJogo) {
  const { saldo, gastarFicha, isAdmin, loading } = useFichas()
  const [modalVisivel, setModalVisivel] = useState(false)    // ModalSemFichas (saldo = 0)
  const [confirmacaoVisivel, setConfirmacaoVisivel] = useState(false) // ModalConfirmacaoFicha
  const [onSucessoPending, setOnSucessoPending] = useState(null)

  // Se o gate de fichas está desativado globalmente, retorna estado "sempre liberado"
  if (!FICHAS_GATE_ATIVO) {
    return {
      tentarEntrar: async (onSucesso) => { onSucesso() },
      confirmarGasto: async () => {},
      cancelarGasto: () => {},
      modalVisivel: false,
      confirmacaoVisivel: false,
      fecharModal: () => {},
      saldo: 0,
    }
  }

  const tentarEntrar = useCallback(async (onSucesso) => {
    if (loading) return
    // Admin entra de graça sempre
    if (isAdmin) { onSucesso(); return }
    // Se já desbloqueou hoje, entra de graça
    if (isDesbloqueadoHoje(nomeJogo)) { onSucesso(); return }
    // Se não tem saldo, mostra modal sem fichas
    if (saldo <= 0) { setModalVisivel(true); return }
    // Tem saldo → mostra confirmação antes de gastar
    setOnSucessoPending(() => onSucesso)
    setConfirmacaoVisivel(true)
  }, [loading, isAdmin, nomeJogo, saldo])

  const confirmarGasto = useCallback(async () => {
    const ok = await gastarFicha(nomeJogo)
    if (ok) {
      marcarDesbloqueado(nomeJogo)
      setConfirmacaoVisivel(false)
      if (onSucessoPending) {
        onSucessoPending()
        setOnSucessoPending(null)
      }
    } else {
      // Falhou ao gastar (ex: saldo concorrente)
      setConfirmacaoVisivel(false)
      setModalVisivel(true)
    }
    console.log('[FICHA_GATE] confirmado:', nomeJogo, '| ok:', ok)
  }, [gastarFicha, nomeJogo, onSucessoPending])

  const cancelarGasto = useCallback(() => {
    setConfirmacaoVisivel(false)
    setOnSucessoPending(null)
  }, [])

  return {
    tentarEntrar,
    confirmarGasto,
    cancelarGasto,
    modalVisivel,        // ModalSemFichas (saldo insuficiente)
    confirmacaoVisivel,  // ModalConfirmacaoFicha (confirmação antes de gastar)
    fecharModal: () => setModalVisivel(false),
    saldo,
  }
}
