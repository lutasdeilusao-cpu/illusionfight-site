import { useState } from 'react'
import { useFichas } from '../context/FichasContext'

export function useFichaGate(nomeJogo) {
  const { saldo, gastarFicha, isAdmin, loading } = useFichas()
  const [modalVisivel, setModalVisivel] = useState(false)

  const tentarEntrar = async (onSucesso) => {
    if (loading) return
    if (isAdmin) { onSucesso(); return }
    if (saldo <= 0) { setModalVisivel(true); return }
    const ok = await gastarFicha(nomeJogo)
    if (ok) onSucesso()
    else setModalVisivel(true)
    console.log('[FICHA_GATE] tentativa:', nomeJogo, '| saldo:', saldo, '| ok:', ok)
  }

  return { tentarEntrar, modalVisivel, fecharModal: () => setModalVisivel(false) }
}
