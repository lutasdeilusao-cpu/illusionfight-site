import { useEffect, useRef } from 'react'
import { trackEvent } from './analytics'

/** Rastreamento de "sessão de conteúdo" com tempo de permanência de verdade —
 *  dispara `openEventName` quando a sessão fica ativa e `timeEventName` (com
 *  `duration_seconds`) quando ela termina (troca de capítulo/jogo, saiu da
 *  página, ou fechou a aba). Usado tanto pra jogos (game_open/game_time)
 *  quanto pra leitura (chapter_open/chapter_time, webtoon_open/webtoon_time).
 *
 *  O tempo só conta enquanto a ABA está visível (Page Visibility API) — sem
 *  isso, alguém que abre um capítulo e deixa a aba em segundo plano por horas
 *  inflaria a métrica de "tempo de leitura" de forma inútil pra decisão de
 *  campanha. `pagehide` cobre o caso de fechar/recarregar a aba de verdade
 *  (o cleanup do React não roda nesse caso, só em navegação client-side).
 *
 *  `params` deve identificar a sessão (ex: `{ game_id }` ou `{ chapter_id }`)
 *  — o efeito reinicia sempre que o CONTEÚDO de `params` muda (útil pra
 *  páginas de capítulo, que o React Router mantém montadas e só troca os
 *  params ao navegar pro próximo/anterior, sem desmontar o componente). */
export function useTrackedSession(openEventName, timeEventName, params, { active = true, minSeconds = 2 } = {}) {
  const accumulatedRef = useRef(0)
  const lastResumeRef = useRef(null)
  const sentRef = useRef(false)
  const paramsRef = useRef(params)
  paramsRef.current = params
  const paramsKey = JSON.stringify(params)

  useEffect(() => {
    if (!active) return
    sentRef.current = false
    accumulatedRef.current = 0
    lastResumeRef.current = typeof document !== 'undefined' && document.visibilityState === 'visible' ? Date.now() : null
    trackEvent(openEventName, paramsRef.current)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        lastResumeRef.current = Date.now()
      } else if (lastResumeRef.current) {
        accumulatedRef.current += Date.now() - lastResumeRef.current
        lastResumeRef.current = null
      }
    }
    const flush = () => {
      if (sentRef.current) return
      if (lastResumeRef.current) { accumulatedRef.current += Date.now() - lastResumeRef.current; lastResumeRef.current = null }
      const seconds = Math.round(accumulatedRef.current / 1000)
      if (seconds >= minSeconds) trackEvent(timeEventName, { ...paramsRef.current, duration_seconds: seconds })
      sentRef.current = true
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
      flush()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, openEventName, timeEventName, paramsKey])
}
