// Filas de feedback visual de golpe: KO grande no centro, callout de dano
// grande no centro, números flutuantes sobre quem apanhou, nudge de tela e
// shake de crítico. Extraído de GanguesCombat.jsx
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).
import { useCallback, useEffect, useRef, useState } from 'react'
import { sfx } from '../../../../lib/sfx'

export default function useGanguesCombatFx() {
  // Momento de KO — quando alguém (aliado OU inimigo) cai, para a leitura
  // com um overlay grande no centro em vez de um aviso discreto no topo que
  // passava batido. Fila: se cair mais de um no mesmo golpe (multidão),
  // mostra um de cada vez.
  const koQueueRef = useRef([])
  const koAtivoRef = useRef(false)
  const koTimerRef = useRef(null)
  const [koCena, setKoCena] = useState(null)
  const dispararProximoKo = useCallback(() => {
    clearTimeout(koTimerRef.current)
    const next = koQueueRef.current.shift()
    if (!next) { koAtivoRef.current = false; setKoCena(null); return }
    koAtivoRef.current = true
    setKoCena(next)
    sfx.explosion?.()
    // Aliado caindo fica MAIS tempo na tela (pedido do Isaias — precisa ser
    // bem sinalizado); inimigo pode ser rapidinho.
    koTimerRef.current = setTimeout(() => dispararProximoKo(), next.side === 'enemy' ? 1500 : 3000)
  }, [])
  useEffect(() => () => clearTimeout(koTimerRef.current), [])

  // Callout GRANDE de dano no centro — fila própria (respeita o KO). O Isaias
  // reclamou 3× que o dano passava batido: agora é "FULANO LEVOU −7" no meio
  // da tela, um de cada vez.
  const [danoCena, setDanoCena] = useState(null)
  const danoQueueRef = useRef([])
  const danoAtivoRef = useRef(false)
  const danoTimerRef = useRef(null)
  const dispararProximoDano = useCallback(() => {
    clearTimeout(danoTimerRef.current)
    const next = danoQueueRef.current.shift()
    if (!next) { danoAtivoRef.current = false; setDanoCena(null); return }
    danoAtivoRef.current = true
    setDanoCena(next)
    danoTimerRef.current = setTimeout(() => dispararProximoDano(), next.dur || 820)
  }, [])
  useEffect(() => () => clearTimeout(danoTimerRef.current), [])

  // Números de dano flutuantes sobre quem apanhou (some sozinho ~1,4s depois).
  const [dmgPops, setDmgPops] = useState([])
  const dmgTimersRef = useRef([])
  useEffect(() => () => dmgTimersRef.current.forEach(clearTimeout), [])
  const soltarDmgPop = useCallback((pop) => {
    setDmgPops(prev => [...prev, pop])
    const to = setTimeout(() => setDmgPops(prev => prev.filter(x => x.id !== pop.id)), 1400)
    dmgTimersRef.current.push(to)
  }, [])

  // Nudge de tela quando um PERSONAGEM DO JOGADOR leva pancada (mais fraco que
  // o shake de crítico) — pra o dano não passar batido.
  const [hitNudge, setHitNudge] = useState(false)
  const hitNudgeTimerRef = useRef(null)
  const dispararNudge = useCallback(() => {
    setHitNudge(false)
    requestAnimationFrame(() => setHitNudge(true))
    clearTimeout(hitNudgeTimerRef.current)
    hitNudgeTimerRef.current = setTimeout(() => setHitNudge(false), 320)
  }, [])
  useEffect(() => () => clearTimeout(hitNudgeTimerRef.current), [])

  // Shake + som de crítico — dispara toda vez que um golpe crítico resolve
  // (qualquer lado). Ver .gang-combat-fx--shake e sfx.attackCritical.
  const [critShake, setCritShake] = useState(false)
  const critShakeTimerRef = useRef(null)
  const dispararCriticoFx = useCallback(() => {
    sfx.attackCritical?.()
    setCritShake(false)
    requestAnimationFrame(() => setCritShake(true))
    clearTimeout(critShakeTimerRef.current)
    critShakeTimerRef.current = setTimeout(() => setCritShake(false), 450)
  }, [])
  useEffect(() => () => clearTimeout(critShakeTimerRef.current), [])

  return {
    koCena, koQueueRef, koAtivoRef, dispararProximoKo,
    danoCena, danoQueueRef, danoAtivoRef, dispararProximoDano,
    dmgPops, soltarDmgPop,
    hitNudge, dispararNudge,
    critShake, dispararCriticoFx,
  }
}
