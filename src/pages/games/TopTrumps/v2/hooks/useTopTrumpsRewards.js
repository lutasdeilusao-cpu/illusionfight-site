import { useState, useEffect } from 'react'
import {
  carregarTentativas, consumirTentativa,
  salvarCartasDeck, marcarCartaGanha,
  verificarCartaGanhaHoje, registrarPartida
} from '../../../../../hooks/useLeaderboardDB'

function getTierInicial(user, perfil) {
  if (!user) return 'free'
  return perfil?.role || 'free'
}

function getDeckKey(user) {
  const uid = user?.id || 'anon'
  return `ldi-toptrumps-deck-${uid}`
}

export function useTopTrumpsRewards({
  user, perfil, deckUsuario, setDeckUsuario, todasCartas,
  historicoRodadas, desbloquear, onRecompensaConfirmada
}) {
  const [jaGanhouHoje, setJaGanhouHoje] = useState(false)
  const [tentativasMax, setTentativasMax] = useState(3)
  const [tentativasRestantes, setTentativasRestantes] = useState(3)

  useEffect(() => {
    if (!user) return
    carregarTentativas(user.id, getTierInicial(user, perfil)).then(({ usadas, jaGanhouHoje: jaGanhou, limite }) => {
      setTentativasMax(limite)
      setTentativasRestantes(Math.max(0, limite - usadas))
      setJaGanhouHoje(jaGanhou || false)
    })
  }, [user])

  async function consumir() {
    if (!user) return
    const usadas = await consumirTentativa(user.id)
    setTentativasRestantes(Math.max(0, tentativasMax - usadas))
  }

  async function escolherRecompensa(carta) {
    if (user) {
      const jaGanhou = await verificarCartaGanhaHoje(user.id)
      if (jaGanhou) {
        console.warn('[TT] Tentativa de ganhar carta novamente no mesmo dia — bloqueado pelo servidor')
        onRecompensaConfirmada()
        return
      }
    }
    const chave = getDeckKey(user)
    const ids = JSON.parse(localStorage.getItem(chave) || '[]')
    ids.push(carta.id)
    localStorage.setItem(chave, JSON.stringify(ids))
    setDeckUsuario([...deckUsuario, carta])
    salvarCartasDeck(user.id, [carta.id])
    setJaGanhouHoje(true)
    await marcarCartaGanha(user.id)
    const pendente = window.__partidaPendente || { jogadas: historicoRodadas.length, vitorias: 0, derrotas: 0, empates: 0, resultado: 'vitoria' }
    registrarPartida(user.id, { ...pendente, carta_recompensa: carta.id }).then(stats => {
      if (stats.total_vitorias === 1) desbloquear('primeira_vitoria_trumps')
      if (stats.total_partidas === 10) desbloquear('veterano_trumps_10')
      if (stats.total_partidas === 100) desbloquear('centuriao_trumps')
      if (stats.total_partidas === 1000) desbloquear('lenda_trumps')
    })
    window.__partidaPendente = null
    onRecompensaConfirmada()
  }

  return { jaGanhouHoje, tentativasMax, tentativasRestantes, escolherRecompensa, consumir }
}
