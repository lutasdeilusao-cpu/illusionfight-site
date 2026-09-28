// Grava o PV/PM do time do jogador DURANTE a luta, não só no fim.
// Antes o dano só era gravado quando o jogador abria a tela de resultado
// (useGanguesVictoryResolution). Quem saía por "Mete o pé", saía de outro
// jeito ou tinha a aba recarregada pelo celular no meio da luta voltava com
// a tropa cheia — dava pra ficar imortal (bug reportado pelo Isaias, 28/09/2026:
// Trinca morto voltou vivo depois de apagar a tela; na rinha os dois caíram e
// a próxima luta começou com todo mundo inteiro).
// Na memória: a cada mudança de PV/PM. Na nuvem: com debounce, e na hora em
// que a aba vai pro segundo plano (tela apagada), que é quando o celular
// costuma matar a página.
import { useEffect, useRef } from 'react'

const DEBOUNCE_NUVEM_MS = 1500

export default function useGanguesDanoAoVivo({ store, combatants }) {
  const idsRef = useRef([])
  const timerRef = useRef(null)
  const assinatura = combatants
    .filter(c => c.side === 'player')
    .map(c => `${c.id}:${c.pv}:${c.pm}`)
    .join('|')

  useEffect(() => {
    const jogadores = combatants.filter(c => c.side === 'player')
    if (!jogadores.length) return
    store.aplicarDanoPersistente(jogadores)
    idsRef.current = jogadores.map(c => c.id)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => store.saveParticipantProgress(idsRef.current), DEBOUNCE_NUVEM_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinatura])

  useEffect(() => {
    const gravarAgora = () => {
      if (document.visibilityState !== 'hidden' || !idsRef.current.length) return
      clearTimeout(timerRef.current)
      store.saveParticipantProgress(idsRef.current)
    }
    document.addEventListener('visibilitychange', gravarAgora)
    return () => {
      document.removeEventListener('visibilitychange', gravarAgora)
      clearTimeout(timerRef.current)
      if (idsRef.current.length) store.saveParticipantProgress(idsRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
