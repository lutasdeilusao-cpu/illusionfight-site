// O efeito mais delicado da extração (ver §6 do plano): lê os eventos NOVOS
// do motor de turno normal (não roda no modo Multidão, que tem seu próprio
// avanço de rodada) e faz DUAS coisas ao mesmo tempo — monta o log de chat
// (texto/trash-talk) E dispara as filas de FX visual (crítico, dano
// flutuante, callout de dano, nudge de tela). `processedEvents` é a fonte
// única de verdade de "até onde já processei" — mantém aqui dentro pra não
// duplicar nem perder evento se o efeito rodar de novo.
// Extraído de GanguesCombat.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §6).
import { useEffect, useRef } from 'react'
import { sfx } from '../../../../lib/sfx'
import { fighterName, pickTrash, transformarEvento } from '../engine/ganguesCombatPresentation.js'

export default function useGanguesCombatLog({
  modoMultidaoAtivo, machine, t, eventosBrutosRef, setLog,
  dispararCriticoFx, soltarDmgPop, danoQueueRef, danoAtivoRef, dispararProximoDano, dispararNudge,
}) {
  const processedEvents = useRef(0)
  // Inimigos que já soltaram a fala de "tô caindo" (enemy_near_death) — uma
  // vez por corpo, quando cruza ~1/3 do PV.
  const nearDeathFalou = useRef(new Set())

  useEffect(() => {
    if (modoMultidaoAtivo) return
    if (machine.events.length <= processedEvents.current) return
    const newEvents = machine.events.slice(processedEvents.current)
    processedEvents.current = machine.events.length
    eventosBrutosRef.current = [...eventosBrutosRef.current, ...newEvents]

    if (newEvents.some(event => event.type === 'attack' && event.result?.critical)) dispararCriticoFx()

    // Destaque de dano: callout GRANDE no centro (fila) + número flutuante +
    // shake do alvo + nudge de tela quando quem apanha é do jogador.
    for (const event of newEvents) {
      const alvo = machine.combatants.find(c => c.key === event.targetKey)
      const atacante = machine.combatants.find(c => c.key === event.actorKey)
      if (event.type === 'attack') {
        const dano = event.result?.damage || 0
        const fatal = (alvo?.pv ?? 1) <= 0
        const escudo = event.result?.shieldConsumed || 0
        // Golpe que NÃO tirou nada (guarda segurou, sem escudo consumido) não
        // mostra nada — nem número flutuante, nem callout (pedido do Isaias:
        // "quando não tá dando dano não precisa mostrar nada").
        if (dano > 0 || escudo > 0) {
          soltarDmgPop({
            id: event.id, targetKey: event.targetKey,
            actorName: fighterName(t, atacante) || '?', amount: dano,
            critical: Boolean(event.result?.critical), shield: escudo, fatal,
          })
          if (!fatal) {
            danoQueueRef.current.push({
              id: event.id,
              alvoNome: fighterName(t, alvo) || '?',
              atacanteNome: fighterName(t, atacante) || '?',
              valor: dano, critico: Boolean(event.result?.critical), escudo,
              side: alvo?.side || (event.side === 'player' ? 'enemy' : 'player'),
              dur: event.side === 'enemy' ? 1500 : 1050,
            })
            if (!danoAtivoRef.current) dispararProximoDano()
          }
          if (dano > 0 && !event.result?.critical) {
            sfx.attackPunch?.()
            if (event.side === 'enemy') dispararNudge()
          }
        }
      } else if (event.type === 'item' && (event.curado || 0) > 0) {
        soltarDmgPop({
          id: event.id, targetKey: event.targetKey,
          actorName: fighterName(t, atacante) || '?', amount: 0, heal: event.curado,
          critical: false, shield: 0, fatal: false,
        })
        danoQueueRef.current.push({
          id: event.id, cura: true,
          alvoNome: fighterName(t, alvo) || '?',
          atacanteNome: fighterName(t, atacante) || '?',
          valor: event.curado, side: 'player', dur: 1150,
        })
        if (!danoAtivoRef.current) dispararProximoDano()
      }
    }

    setLog(prev => {
      let next = prev
      for (const event of newEvents) next = [...next, ...transformarEvento(t, event, machine.combatants)]
      // Fala de "tô caindo": inimigo abaixo de ~1/3 do PV, ainda vivo, que
      // ainda não falou. Segue o mesmo contexto do trash-talk do encontro.
      for (const c of machine.combatants) {
        if (c.side !== 'enemy' || c.pv <= 0 || nearDeathFalou.current.has(c.key)) continue
        if (c.pv / (c.pvMax || 1) > 0.34) continue
        nearDeathFalou.current.add(c.key)
        if (Math.random() > 0.8) continue
        const line = pickTrash(t, c, 'enemy_near_death')
        if (line) next = [...next, { id: `nd-${c.key}-${Date.now()}`, kind: 'trash', sender: fighterName(t, c), text: line }]
      }
      return next
    })
  }, [machine.events, machine.combatants, t, modoMultidaoAtivo])
}
