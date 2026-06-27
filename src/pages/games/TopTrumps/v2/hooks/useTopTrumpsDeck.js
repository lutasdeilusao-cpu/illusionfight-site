import { useState, useEffect } from 'react'
import { carregarDeck as carregarDeckDB, substituirDeck, salvarCartasDeck } from '../../../../../hooks/useLeaderboardDB'

function embaralhar(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function useTopTrumpsDeck({ user, perfil, todasCartas }) {
  const [deckUsuario, setDeckUsuario] = useState([])

  useEffect(() => {
    if (!user) return
    carregarDeckDB(user.id).then(ids => {
      const idsUnicos = [...new Set(ids || [])]
      let cartas = idsUnicos.map(id => todasCartas.find(c => c.id === id)).filter(Boolean)

      if (idsUnicos.length > 0 && cartas.length < 5) {
        console.log('[TT] deck corrompido — apenas', cartas.length, 'cartas válidas de', idsUnicos.length, '. Gerando novo deck...')
        const novas = embaralhar([...todasCartas]).slice(0, 5)
        substituirDeck(user.id, novas.map(c => c.id)).then(() => {
          setDeckUsuario(novas)
        })
        return
      }

      setDeckUsuario(cartas)

      if (perfil?.role === 'admin' || perfil?.is_admin) {
        const idsTem = new Set(idsUnicos.map(id => Number(id)))
        const todosIds = todasCartas.map(c => c.id)
        const faltando = todosIds.filter(n => !idsTem.has(n))
        if (faltando.length > 0) {
          console.log('[TT] Admin auto-fill — adicionando cartas faltantes:', faltando)
          salvarCartasDeck(user.id, faltando)
        }
      }
    })
  }, [user])

  useEffect(() => {
    if (user) return
    if (deckUsuario.length === 0) {
      setDeckUsuario(embaralhar([...todasCartas]).slice(0, 5))
    }
  }, [user])

  return { deckUsuario, setDeckUsuario }
}
