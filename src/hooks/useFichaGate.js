import { useState } from 'react'
import { useFichas } from '../context/FichasContext'

/**
 * useFichaGate — controle de acesso a jogos via fichas
 *
 * Regra: 1 ficha desbloqueia o jogo por 1 dia inteiro.
 * - Se o jogador já pagou hoje, entra de graça quantas vezes quiser
 * - Se não pagou, gasta 1 ficha e desbloqueia por 24h
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
  const [modalVisivel, setModalVisivel] = useState(false)

  const tentarEntrar = async (onSucesso) => {
    if (loading) return
    // Admin entra de graça sempre
    if (isAdmin) { onSucesso(); return }
    // Se já desbloqueou hoje, entra de graça
    if (isDesbloqueadoHoje(nomeJogo)) { onSucesso(); return }
    // Se não tem saldo, mostra modal
    if (saldo <= 0) { setModalVisivel(true); return }
    // Gasta 1 ficha e desbloqueia por 24h
    const ok = await gastarFicha(nomeJogo)
    if (ok) {
      marcarDesbloqueado(nomeJogo)
      onSucesso()
    } else {
      setModalVisivel(true)
    }
    console.log('[FICHA_GATE] tentativa:', nomeJogo, '| saldo:', saldo, '| ok:', ok)
  }

  return { tentarEntrar, modalVisivel, fecharModal: () => setModalVisivel(false) }
}
